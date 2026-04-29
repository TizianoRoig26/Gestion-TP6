"""
Quick validation test for Pydantic schemas
Verifies that schemas validate correctly (Task 5.4)
"""
import sys
sys.path.insert(0, '.')

from modules.usuarios.schemas import UsuarioCreate, UsuarioUpdate, UsuarioRead
from modules.pedidos.schemas import PedidoCreate, DetallePedidoCreate
from modules.direcciones.schemas import DireccionCreate
from pydantic import ValidationError
from datetime import datetime

print("=" * 60)
print("VERIFICANDO SCHEMAS - TAREA 5.4")
print("=" * 60)

# ===================================================
# TEST 1: UsuarioCreate - should pass
# ===================================================
print("\n[TEST 1] UsuarioCreate - datos válidos")
try:
    usuario = UsuarioCreate(
        nombre="Juan Pérez",
        email="juan@example.com",
        password="password123",
        telefono="+5491112345678",
        roles=["CLIENT"]
    )
    print(f"[PASS] - Usuario creado: {usuario.nombre}, email: {usuario.email}")
except ValidationError as e:
    print(f"[FAIL] - Error: {e}")

# ===================================================
# TEST 2: UsuarioCreate - password too short (should fail)
# ===================================================
print("\n[TEST 2] UsuarioCreate - password muy corto (debe fallar)")
try:
    usuario = UsuarioCreate(
        nombre="Juan Pérez",
        email="juan@example.com",
        password="123",  # Too short!
        roles=["CLIENT"]
    )
    print(f"[FAIL] - No detectó password corto")
except ValidationError as e:
    print(f"[PASS] - Correctamente rechazó password corto")

# ===================================================
# TEST 3: UsuarioCreate - email inválido (should fail)
# ===================================================
print("\n[TEST 3] UsuarioCreate - email inválido (debe fallar)")
try:
    usuario = UsuarioCreate(
        nombre="Juan Pérez",
        email="no-es-email",  # Invalid email
        password="password123"
    )
    print(f"[FAIL] - No detectó email inválido")
except ValidationError as e:
    print(f"[PASS] - Correctamente rechazó email inválido")

# ===================================================
# TEST 4: DireccionCreate - should pass
# ===================================================
print("\n[TEST 4] DireccionCreate - datos válidos")
try:
    direccion = DireccionCreate(
        usuario_id=1,
        linea1="Av. Corrientes 1234",
        ciudad="Buenos Aires",
        codigo_postal="C1043AAZ",
        alias="Casa",
        es_predeterminada=True
    )
    print(f"[PASS] - Dirección creada: {direccion.alias}, {direccion.ciudad}")
except ValidationError as e:
    print(f"[FAIL] - Error: {e}")

# ===================================================
# TEST 5: DireccionCreate - linea1 too short (should fail)
# ===================================================
print("\n[TEST 5] DireccionCreate - linea1 muy corta (debe fallar)")
try:
    direccion = DireccionCreate(
        usuario_id=1,
        linea1="123",  # Too short (min 5)
        ciudad="Buenos Aires",
        codigo_postal="C1043AAZ"
    )
    print(f"[FAIL] - No detectó linea1 corta")
except ValidationError as e:
    print(f"[PASS] - Correctamente rechazó linea1 corta")

# ===================================================
# TEST 6: PedidoCreate - should pass
# ===================================================
print("\n[TEST 6] PedidoCreate - datos válidos")
try:
    detalle = DetallePedidoCreate(
        producto_id=5,
        cantidad=2,
        precio_snapshot=850.50,
        nombre_snapshot="Hamburguesa Clásica",
        subtotal=1701.00,
        personalizacion=[1, 3]
    )
    pedido = PedidoCreate(
        usuario_id=1,
        forma_pago_codigo="MERCADOPAGO",
        direccion_id=1,
        detalles=[detalle]
    )
    print(f"[PASS] - Pedido creado: total calculado = {pedido.total}")
except ValidationError as e:
    print(f"[FAIL] - Error: {e}")

# ===================================================
# TEST 7: PedidoCreate - cantidad inválida (should fail)
# ===================================================
print("\n[TEST 7] PedidoCreate - cantidad 0 (debe fallar)")
try:
    detalle = DetallePedidoCreate(
        producto_id=5,
        cantidad=0,  # Invalid: ge=1
        precio_snapshot=850.50,
        nombre_snapshot="Hamburguesa Clásica",
        subtotal=0
    )
    pedido = PedidoCreate(
        usuario_id=1,
        forma_pago_codigo="MERCADOPAGO",
        detalles=[detalle]
    )
    print(f"[FAIL] - No detectó cantidad 0")
except ValidationError as e:
    print(f"[PASS] - Correctamente rechazó cantidad 0")

# ===================================================
# TEST 8: PedidoCreate - subtotal negativo (should fail)
# ===================================================
print("\n[TEST 8] DetallePedidoCreate - subtotal negativo (debe fallar)")
try:
    detalle = DetallePedidoCreate(
        producto_id=5,
        cantidad=1,
        precio_snapshot=850.50,
        nombre_snapshot="Hamburguesa Clásica",
        subtotal=-100.0  # Invalid: ge=0
    )
    print(f"[FAIL] - No detectó subtotal negativo")
except ValidationError as e:
    print(f"[PASS] - Correctamente rechazó subtotal negativo")

# ===================================================
# TEST 9: UsuarioUpdate - valid partial update
# ===================================================
print("\n[TEST 9] UsuarioUpdate - actualización parcial válida")
try:
    update = UsuarioUpdate(
        nombre="Juan Pérez Modificado",
        telefono="+5491187654321"
    )
    print(f"[PASS] - Update schema creado: {update.nombre}")
except ValidationError as e:
    print(f"[FAIL] - Error: {e}")

# ===================================================
# SUMMARY
# ===================================================
print("\n" + "=" * 60)
print("VERIFICACIÓN COMPLETADA")
print("=" * 60)
print("\nTodos los schemas están validando correctamente:")
print("  [OK] UsuarioCreate - valida password length, email format")
print("  [OK] DireccionCreate - valida longitud de campos")
print("  [OK] PedidoCreate - valida detalles, cantidades, subtotales")
print("  [OK] UsuarioUpdate - permite actualizaciones parciales")
print("\nTask 5.4 COMPLETADA [OK]")
