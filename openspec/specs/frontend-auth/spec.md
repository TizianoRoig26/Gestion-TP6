## ADDED Requirements

### Requirement: Axios HTTP client
The project SHALL have a centralized Axios instance with interceptors for authentication.

#### Scenario: Request interceptor attaches token
- **WHEN** a request is sent to the API
- **THEN** the `Authorization: Bearer <token>` header SHALL be attached if the user is authenticated

#### Scenario: Response interceptor handles 401
- **WHEN** a response returns status 401
- **THEN** the interceptor SHALL attempt to refresh the token via `POST /api/v1/auth/refresh`

#### Scenario: Successful refresh retries original request
- **WHEN** the refresh token request succeeds
- **THEN** the original failed request SHALL be retried with the new access token

#### Scenario: Failed refresh logs out user
- **WHEN** the refresh token request fails (e.g., expired)
- **THEN** the user SHALL be logged out and redirected to the login page

#### Scenario: Concurrent requests queue
- **WHEN** multiple requests fail with 401 simultaneously
- **THEN** only ONE refresh request SHALL be made, and all pending requests SHALL be queued and retried after refresh

### Requirement: Login page
The project SHALL have a Login page with email and password form connected to `POST /api/v1/auth/login`.

#### Scenario: Successful login
- **WHEN** the user submits valid credentials
- **THEN** the authStore SHALL be updated with access token, refresh token, and user data
- **THEN** the user SHALL be redirected to the home page

#### Scenario: Failed login
- **WHEN** the user submits invalid credentials
- **THEN** an error message SHALL be displayed: "Credenciales inválidas"
- **THEN** the form SHALL NOT clear the inputs

#### Scenario: Rate limiting
- **WHEN** the API returns 429 (rate limited)
- **THEN** the user SHALL see "Demasiados intentos, esperá antes de reintentar"

### Requirement: Register page
The project SHALL have a Register page with name, email, password, and password confirmation form connected to `POST /api/v1/auth/register`.

#### Scenario: Successful registration
- **WHEN** the user submits valid registration data
- **THEN** the account SHALL be created with role CLIENT
- **THEN** the authStore SHALL be updated and the user redirected to the home page

#### Scenario: Duplicate email
- **WHEN** the user submits an already registered email
- **THEN** an error message SHALL be displayed: "El email ya está registrado"

#### Scenario: Password validation
- **WHEN** the password is less than 8 characters
- **THEN** the form SHALL show a validation error before submitting

### Requirement: Route guards
The project SHALL have route guards that protect routes based on authentication status and user roles.

#### Scenario: Unauthenticated user redirected
- **WHEN** an unauthenticated user tries to access a protected route
- **THEN** they SHALL be redirected to the login page

#### Scenario: Insufficient role
- **WHEN** an authenticated user without the required role tries to access a restricted route
- **THEN** they SHALL see a "403 — No tenés permisos" page or be redirected

#### Scenario: Public routes accessible
- **WHEN** an unauthenticated user tries to access login or register
- **THEN** they SHALL be able to access those routes freely

### Requirement: Navigation by role
The project SHALL display navigation options based on the user's role.

#### Scenario: Client menu
- **WHEN** a user with role CLIENT is authenticated
- **THEN** the navigation SHALL show: Catálogo, Mi Carrito, Mis Pedidos, Mi Perfil, Mis Direcciones

#### Scenario: Unauthenticated menu
- **WHEN** no user is authenticated
- **THEN** the navigation SHALL show: Catálogo, Iniciar Sesión, Registrarse
