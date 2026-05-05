# Spec: auth

## Descripción
Sistema de autenticación JWT con doble token y RBAC.

## Historias de Usuario

- US-001: Registro de cliente (nombre, email, password)
- US-002: Login (email, password) → JWT access + refresh
- US-003: Refresh token con rotación
- US-004: Logout (invalida refresh)
- US-005: Gestión de roles (Admin asigna)
- US-006: Protección de rutas por rol

## Flujo de Autenticación

```
┌─────────────────────────────────────────────────────────────┐
│              FLUJO DE AUTENTICACIÓN                         │
└─────────────────────────────────────────────────────────────┘

  Registro:
  └─→ POST /auth/register
      └─→ bcrypt(password) → hash
      └─→ crear usuario + rol CLIENT
      └─→ retornar tokens

  Login:
  └─→ POST /auth/login
      └─→ validar credenciales
      └─→ generar JWT (30 min)
      └─→ generar refresh UUID (7 días)
      └─→ guardar refresh en BD
      └─→ retornar tokens

  Refresh:
  └─→ POST /auth/refresh
      └─→ validar refresh token
      └─→ INVALIDAR refresh anterior (rotación)
      └─→ generar nuevo par
      └─→ retornar tokens

  Logout:
  └─→ POST /auth/logout
      └─→ marcar refresh como revocado
```

## Roles

| Rol | Descripción |
|-----|-------------|
| ADMIN | Acceso total |
| STOCK | Gestión catálogo y stock |
| PEDIDOS | Gestión pedidos |
| CLIENT | Usuario final |

## Reglas de Negocio

- RN-AU01: Password hasheado con bcrypt (cost >= 10)
- RN-AU02: Access token 30 min, contenido: userId, email, roles
- RN-AU03: Refresh token 7 días, UUID v4 en BD
- RN-AU04: Rotación de refresh (invalida anterior)
- RN-AU06: Rate limit 5 intentos/15min por IP

## Endpoints

| Método | Endpoint | Descripción | Auth |
|--------|----------|------------|------|
| POST | /auth/register | Registrar cliente | No |
| POST | /auth/login | Iniciar sesión | No |
| POST | /auth/refresh | Renovar tokens | No |
| POST | /auth/logout | Cerrar sesión | Sí |

## Definición de Listo

- [ ] Registro crea usuario con rol CLIENT automático
- [ ] Login retorna access + refresh tokens
- [ ] Refresh renueva con rotación
- [ ] Logout invalida refresh
- [ ] Rate limiting funciona
- [ ] require_role verifica roles correctamente