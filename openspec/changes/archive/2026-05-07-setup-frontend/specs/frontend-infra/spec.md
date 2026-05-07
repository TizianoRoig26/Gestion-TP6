## ADDED Requirements

### Requirement: Project initialization
The project SHALL be initialized with Vite + React + TypeScript using `@vitejs/plugin-react-swc` for fast refresh.

#### Scenario: Dev server starts
- **WHEN** the user runs `npm run dev`
- **THEN** the Vite dev server SHALL start on port 5173 without errors

#### Scenario: Production build
- **WHEN** the user runs `npm run build`
- **THEN** a production bundle SHALL be generated in a `dist/` directory

### Requirement: TypeScript strict mode
TypeScript SHALL be configured in strict mode (`strict: true` in `tsconfig.json`).

#### Scenario: TypeScript compilation
- **WHEN** TypeScript compiles the project
- **THEN** all type checks SHALL pass with strict mode enabled

### Requirement: Tailwind CSS v4 configuration
Tailwind CSS v4 SHALL be configured with PostCSS and the `@tailwindcss/vite` plugin.

#### Scenario: Tailwind styles applied
- **WHEN** a component uses a Tailwind utility class
- **THEN** the class SHALL be compiled and applied correctly in the browser

### Requirement: FSD directory structure
The project SHALL follow Feature-Sliced Design (FSD) with the following directory structure:

```
src/
├── app/
├── pages/
├── widgets/
├── features/
├── entities/
└── shared/
```

#### Scenario: FSD structure exists
- **WHEN** the project is initialized
- **THEN** all 6 FSD layer directories SHALL exist under `src/`

### Requirement: Environment variables
The project SHALL read configuration from environment variables prefixed with `VITE_`.

#### Scenario: Environment file exists
- **WHEN** the project is initialized
- **THEN** a `.env.example` file SHALL exist with `VITE_API_URL` and `VITE_MP_PUBLIC_KEY`

### Requirement: TanStack Query configuration
TanStack Query SHALL be configured with a `QueryClientProvider` wrapping the entire app.

#### Scenario: QueryClientProvider wraps app
- **WHEN** the app renders
- **THEN** the root component SHALL be wrapped with `QueryClientProvider`

#### Scenario: Query defaults
- **WHEN** a query is executed
- **THEN** default values SHALL apply: `staleTime: 5 * 60 * 1000` (5 min), `retry: 1`, `refetchOnWindowFocus: false`
