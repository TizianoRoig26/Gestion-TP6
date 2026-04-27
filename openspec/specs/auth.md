# Capability: Autenticación y Autorización

## Descripción
Sistema de autenticación JWT con doble token (access + refresh) y RBAC con 4 roles.

## Historias de Usuario
- US-001: Registro de cliente
- US-002: Login de usuario
- US-003: Refresh de token
- US-004: Logout
- US-005: Gestión de roles (RBAC)
- US-006: Protección de rutas por rol
- US-073: Rate limiting en login

## Stack Tecnológico
- Passlib (bcrypt) para hashing
- python-jose para JWT
- slowapi para rate limiting
- SQLModel para tokens en BD

## Reglas de Negocio
- RN-AU01: Contraseña hasheada con bcrypt (cost >= 10)
- RN-AU02: Access token 30 min, contenido: userId, email, roles
- RN-AU03: Refresh token 7 días, UUID v4 en BD
- RN-AU04: Rotación de refresh tokens
- RN-AU05: Revocar todos si detect replay attack
- RN-AU06: Rate limit 5 intentos/15min por IP

## Dependencias
- Ninguna (capacidad base)

## Definition of Done
- [ ] Registro crea usuario con rol CLIENT automático
- [ ] Login retorna access + refresh tokens
- [ ] Refresh renueva tokens con rotación
- [ ] Logout invalida refresh token
- [ ] Roles verificables en cada request
- [ ] Rate limiting funciona en login

## Recursos
- docs/Descripcion.md (sección 6)
- docs/Historias_de_usuario.md (EPIC 01)