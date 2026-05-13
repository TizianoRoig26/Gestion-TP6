"""
Admin Service - Business logic for admin panel
"""
from datetime import datetime, date
from typing import Optional, Any

from fastapi import HTTPException, status
from sqlmodel import Session, select, func, text
from sqlalchemy import TextClause

from db.models import Usuario, UsuarioRol, Rol, Pedido, DetallePedido, Producto, HistorialEstadoPedido
from modules.auth.repository import UsuarioRepository


class AdminService:
    """Service for admin operations."""

    def __init__(self, session: Session):
        self.session = session
        self.user_repo = UsuarioRepository(session)

    # =========================================================================
    # USER MANAGEMENT
    # =========================================================================

    def listar_usuarios(
        self,
        page: int = 1,
        page_size: int = 20,
        busqueda: Optional[str] = None,
        rol: Optional[str] = None,
    ) -> dict[str, Any]:
        """List all users with search and filters."""
        query = select(Usuario).where(Usuario.eliminado_en.is_(None))

        if busqueda:
            pattern = f"%{busqueda}%"
            query = query.where(
                (Usuario.nombre.ilike(pattern)) |
                (Usuario.email.ilike(pattern))
            )

        # Count total before pagination
        count_query = select(func.count()).select_from(query.subquery())
        total = self.session.exec(count_query).one()

        # Paginate
        query = query.order_by(Usuario.creado_en.desc()).offset((page - 1) * page_size).limit(page_size)
        users = self.session.exec(query).all()

        items = []
        for user in users:
            roles = self.user_repo.get_roles(user.id)
            items.append({
                "id": user.id,
                "nombre": user.nombre,
                "email": user.email,
                "roles": roles,
                "activo": getattr(user, 'credo_activo', True),
                "creado_en": user.creado_en.isoformat() if user.creado_en else None,
            })

        # Filter by role if specified (post-query since roles are in pivot table)
        if rol:
            items = [u for u in items if rol in u["roles"]]
            total = len(items)

        pages = max(1, (total + page_size - 1) // page_size)

        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "pages": pages,
        }

    def editar_usuario(self, user_id: int, data: dict) -> dict:
        """Edit user data."""
        user = self.session.get(Usuario, user_id)
        if not user or user.eliminado_en:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado",
            )

        if data.get("nombre") is not None:
            user.nombre = data["nombre"]
        if data.get("email") is not None:
            user.email = data["email"]

        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)

        roles = self.user_repo.get_roles(user.id)
        return {
            "id": user.id,
            "nombre": user.nombre,
            "email": user.email,
            "roles": roles,
            "activo": getattr(user, 'credo_activo', True),
        }

    def cambiar_rol(self, user_id: int, rol_codigo: str, admin_user_id: int) -> dict:
        """Change user role."""
        user = self.session.get(Usuario, user_id)
        if not user or user.eliminado_en:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado",
            )

        # Verify role exists
        rol = self.session.get(Rol, rol_codigo)
        if not rol:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Rol '{rol_codigo}' no encontrado",
            )

        # Check if removing ADMIN from last admin
        if rol_codigo != "ADMIN":
            # Check if this user is the last ADMIN
            admin_roles = self.session.exec(
                select(UsuarioRol).where(UsuarioRol.rol_codigo == "ADMIN")
            ).all()
            is_last_admin = (
                len(admin_roles) == 1
                and admin_roles[0].usuario_id == user_id
            )
            if is_last_admin:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No se puede eliminar el último administrador del sistema",
                )

        # Remove existing roles and add new one
        existing_roles = self.session.exec(
            select(UsuarioRol).where(UsuarioRol.usuario_id == user_id)
        ).all()
        for ur in existing_roles:
            self.session.delete(ur)

        new_rol = UsuarioRol(
            usuario_id=user_id,
            rol_codigo=rol_codigo,
            asignado_por_id=admin_user_id,
        )
        self.session.add(new_rol)
        self.session.commit()

        roles = self.user_repo.get_roles(user_id)
        return {"id": user_id, "roles": roles}

    def toggle_estado(self, user_id: int, activo: bool, admin_user_id: int) -> dict:
        """Activate or deactivate user."""
        if user_id == admin_user_id and not activo:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No puedes desactivar tu propia cuenta",
            )

        user = self.session.get(Usuario, user_id)
        if not user or user.eliminado_en:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado",
            )

        user.credo_activo = activo
        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)

        return {
            "id": user.id,
            "activo": user.credo_activo,
        }

    # =========================================================================
    # METRICS / DASHBOARD
    # =========================================================================

    def obtener_metricas_resumen(self, desde: Optional[str] = None, hasta: Optional[str] = None) -> dict:
        """Get dashboard summary metrics."""
        # Default to current month
        if not desde:
            desde = date.today().replace(day=1).isoformat()
        if not hasta:
            hasta = date.today().isoformat()

        # Total sales (from confirmed/delivered orders)
        sales_query = text("""
            SELECT COALESCE(SUM(p.total), 0) as total_ventas,
                   COUNT(DISTINCT p.id) as cantidad_pedidos
            FROM pedidos p
            WHERE p.estado_codigo IN ('CONFIRMADO', 'EN_PREPARACION', 'EN_CAMINO', 'ENTREGADO')
              AND p.eliminado_en IS NULL
              AND p.creado_en >= :desde
              AND p.creado_en <= :hasta
        """)
        sales_result = self.session.exec(sales_query, params={"desde": desde, "hasta": hasta + " 23:59:59"}).one()

        # User count
        user_count = self.session.exec(
            select(func.count()).select_from(Usuario).where(Usuario.eliminado_en.is_(None))
        ).one()

        total_ventas = float(sales_result[0] or 0)
        cantidad_pedidos = int(sales_result[1] or 0)
        ticket_promedio = round(total_ventas / cantidad_pedidos, 2) if cantidad_pedidos > 0 else 0

        return {
            "total_ventas": total_ventas,
            "cantidad_pedidos": cantidad_pedidos,
            "cantidad_usuarios": user_count,
            "ticket_promedio": ticket_promedio,
        }

    def obtener_ventas(self, desde: str, hasta: str, granularidad: str = "dia") -> list[dict]:
        """Get sales data aggregated by period (day/week/month)."""
        if granularidad == "mes":
            trunc = "DATE_TRUNC('month', p.creado_en)"
            fmt = "to_char(p.creado_en, 'YYYY-MM')"
        elif granularidad == "semana":
            trunc = "DATE_TRUNC('week', p.creado_en)"
            fmt = "to_char(p.creado_en, 'YYYY-MM-DD')"
        else:  # dia
            trunc = "DATE_TRUNC('day', p.creado_en)"
            fmt = "to_char(p.creado_en, 'YYYY-MM-DD')"

        query = text(f"""
            SELECT {fmt} as fecha,
                   COALESCE(SUM(p.total), 0) as monto_total,
                   COUNT(DISTINCT p.id) as cantidad_pedidos
            FROM pedidos p
            WHERE p.estado_codigo IN ('CONFIRMADO', 'EN_PREPARACION', 'EN_CAMINO', 'ENTREGADO')
              AND p.eliminado_en IS NULL
              AND p.creado_en >= :desde
              AND p.creado_en <= :hasta
            GROUP BY {trunc}
            ORDER BY fecha ASC
        """)

        results = self.session.exec(query, params={"desde": desde, "hasta": hasta + " 23:59:59"}).all()

        return [
            {"fecha": str(r[0]), "monto_total": float(r[1] or 0), "cantidad_pedidos": int(r[2] or 0)}
            for r in results
        ]

    def obtener_top_productos(self, top: int = 10, desde: Optional[str] = None, hasta: Optional[str] = None) -> list[dict]:
        """Get top N best-selling products."""
        if not desde:
            desde = date.today().replace(day=1).isoformat()
        if not hasta:
            hasta = date.today().isoformat()

        query = text("""
            SELECT pr.id as producto_id,
                   pr.nombre,
                   COALESCE(SUM(dp.cantidad), 0) as cantidad_total,
                   COALESCE(SUM(dp.subtotal), 0) as ingreso_total
            FROM detalles_pedido dp
            JOIN pedidos p ON p.id = dp.pedido_id
            JOIN productos pr ON pr.id = dp.producto_id
            WHERE p.estado_codigo IN ('CONFIRMADO', 'EN_PREPARACION', 'EN_CAMINO', 'ENTREGADO')
              AND p.eliminado_en IS NULL
              AND p.creado_en >= :desde
              AND p.creado_en <= :hasta
            GROUP BY pr.id, pr.nombre
            ORDER BY cantidad_total DESC
            LIMIT :top
        """)

        results = self.session.exec(query, params={
            "desde": desde, "hasta": hasta + " 23:59:59", "top": top
        }).all()

        return [
            {
                "producto_id": int(r[0]),
                "nombre": str(r[1]),
                "cantidad_total": int(r[2] or 0),
                "ingreso_total": float(r[3] or 0),
            }
            for r in results
        ]

    def obtener_pedidos_por_estado(self, desde: Optional[str] = None, hasta: Optional[str] = None) -> list[dict]:
        """Get order distribution by state."""
        if not desde:
            desde = date.today().replace(day=1).isoformat()
        if not hasta:
            hasta = date.today().isoformat()

        query = text("""
            SELECT pe.estado_codigo,
                   COALESCE(e.nombre, pe.estado_codigo) as estado_nombre,
                   COUNT(DISTINCT pe.id) as cantidad
            FROM pedidos pe
            LEFT JOIN estados_pedido e ON e.codigo = pe.estado_codigo
            WHERE pe.eliminado_en IS NULL
              AND pe.creado_en >= :desde
              AND pe.creado_en <= :hasta
            GROUP BY pe.estado_codigo, e.nombre
            ORDER BY cantidad DESC
        """)

        results = self.session.exec(query, params={"desde": desde, "hasta": hasta + " 23:59:59"}).all()

        return [
            {
                "estado_codigo": str(r[0]),
                "estado_nombre": str(r[1]),
                "cantidad": int(r[2] or 0),
            }
            for r in results
        ]
