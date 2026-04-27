## 1. Configuración Inicial del Proyecto

- [x] 1.1 Crear requirements.txt con todas las dependencias
- [x] 1.2 Crear .env.example con variables documentadas
- [x] 1.3 Crear main.py como entry point con FastAPI básico
- [x] 1.4 Crear app.py con configuración de CORS y routers

## 2. Módulo Core

- [x] 2.1 Crear core/config.py con Settings (Pydantic)
- [x] 2.2 Crear core/database.py (SQLModel engine + session)
- [x] 2.3 Crear core/security.py (JWT, bcrypt hash)
- [x] 2.4 Crear core/exceptions.py (HTTP exceptions custom)
- [x] 2.5 Probar que FastAPI inicia correctamente

## 3. Unit of Work y Repository Base

- [x] 3.1 Crear core/base_repository.py (BaseRepository[T] genérico)
- [x] 3.2 Crear core/uow.py (Unit of Work como context manager)
- [x] 3.3 Probar commit/rollback automático
- [x] 3.4 Testear get_by_id, create, update, soft_delete

## 4. Modelos SQLModel (ERD v5)

- [x] 4.1 Crear db/models.py con todas las entidades:
- [x] 4.2 Definir soft delete fields (eliminado_en)
- [x] 4.3 Definir timestamps (creado_en, actualizado_en)
- [x] 4.4 Definir FK y constraints

## 5. Schemas Pydantic

- [x] 5.1 Crear schemas de autenticación:
- [ ] 5.2 Crear schemas de usuarios
- [ ] 5.3 Crear schemas de pedidos
- [ ] 5.4 Verificar que validan correctamente

## 6. Alembic y Migraciones

- [ ] 6.1 Inicializar Alembic (alembic init)
- [ ] 6.2 Configurar env.py con DATABASE_URL
- [ ] 6.3 Generar migraciones desde modelos
- [ ] 6.4 Correr migration: alembic upgrade head
- [ ] 6.5 Verificar tablas creadas en PostgreSQL

## 7. Seed Data

- [x] 7.1 Crear db/seed.py
- [ ] 7.2 Insertar 4 Roles (ADMIN, STOCK, PEDIDOS, CLIENT)
- [ ] 7.3 Insertar 6 EstadosPedido
- [ ] 7.4 Insertar FormasPago
- [ ] 7.5 Crear usuario admin por defecto
- [ ] 7.6 Ejecutar seed y verificar datos

## 8. Módulo Auth - Registro y Login

- [x] 8.1 Crear auth/model.py (_extend modelos existentes si es necesario)
- [x] 8.2 Crear auth/schemas.py ( registrar schemas )
- [ ] 8.3 Crear auth/repository.py ( repository )
- [x] 8.4 Crear auth/service.py ( lógica: bcrypt, JWT )
- [x] 8.5 Crear auth/router.py ( endpoints: /register, /login )
- [ ] 8.6 Probar registro de usuario
- [ ] 8.7 Probar login y obtener tokens

## 9. Auth - Refresh y Logout

- [ ] 9.1 Crear endpoint /auth/refresh con rotación
- [ ] 9.2 Crear endpoint /auth/logout
- [ ] 9.3 Probar refresh token
- [ ] 9.4 Probar logout (refresh invalidado)

## 10. Protección de Rutas (get_current_user, require_role)

- [ ] 10.1 Implementar get_current_user dependency
- [ ] 10.2 Implementar require_role dependency factory
- [ ] 10.3 Proteger rutas existentes
- [ ] 10.4 Verificar 401 sin token
- [ ] 10.5 Verificar 403 con rol insuficiente

## 11. Rate Limiting

- [ ] 11.1 Configurar slowapi en main.py
- [ ] 11.2 Agregar rate limit en /auth/login (5/15min)
- [ ] 11.3 Probar que rechaza después de 5 intentos

## 12. Swagger y Documentación

- [ ] 12.1 Verificar /docs accessible
- [ ] 12.2 Verificar /redoc accessible
- [ ] 12.3 Verificar que todos los endpoints aparecen

## 13. Verificación Final

- [ ] 13.1 uvicorn main:app --reload funciona
- [ ] 13.2 POST /auth/register retorna tokens
- [ ] 13.3 POST /auth/login retorna tokens
- [ ] 13.4 GET /auth/me protegido requiere token
- [ ] 13.5 Rate limiting funciona en login
- [ ] 13.6 Todas las tablas existen en PostgreSQL
- [ ] 13.7 Seed data cargada correctamente