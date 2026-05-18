## ADDED Requirements

### Requirement: Obtener perfil actual con roles
El sistema SHALL devolver los roles del usuario autenticado al consultar su perfil.

#### Scenario: Perfil con roles después de login
- **WHEN** un usuario autenticado envía `GET /api/v1/auth/me`
- **THEN** el sistema retorna sus datos incluyendo `roles: ["ADMIN"]` (o el rol que tenga asignado)
- **THEN** el array `roles` refleja los roles actuales en base de datos

#### Scenario: Rol actualizado después de cambio
- **WHEN** un ADMIN cambia el rol de un usuario
- **AND** ese usuario hace `GET /api/v1/auth/me`
- **THEN** el sistema retorna el nuevo rol (no el del JWT anterior)
