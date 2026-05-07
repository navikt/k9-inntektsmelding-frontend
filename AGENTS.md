# AGENTS.md — navikt/ft-inntektsmelding-frontend

## Repository Overview

Frontend for inntektsmelding (income reporting) for Team Sykdom i Familien at NAV. Handles:

1. **Inntektsmelding** – Standard income reporting
2. **Arbeidsgiverinitiert (AGI)** – Employer-initiated income reporting
3. **Refusjon for omsorgspenger** – Refund claims for care days

Split into `app/` (React frontend) and `server/` (Express server).

## Tech Stack

- **React 19**, TypeScript, Vite
- **Tanstack Query** (data fetching) + **Tanstack Router** (file-based routing)
- **React Hook Form** + **Zod** (forms and validation)
- **NAV Aksel** (`@navikt/ds-react`) – design system
- **Tailwind CSS** – utility styling
- **Playwright** (E2E tests) + **Vitest** (unit tests)

## Build & Test Commands

```bash
# From app/
yarn dev              # Local development
yarn check:types      # Type checking
yarn lint             # Lint
yarn lint:fix         # Auto-fix lint
yarn test:e2e         # Playwright E2E tests
yarn test:e2e:ui      # Playwright with UI
yarn test:unit        # Vitest unit tests
```

## Project Structure

```
app/src/
├── api/              # Tanstack Query queries and mutations
├── components/       # Shared components
├── features/
│   ├── arbeidsgiverinitiert/   # AGI feature
│   ├── inntektsmelding/        # Standard income reporting
│   ├── refusjon-omsorgspenger/ # Care days refund
│   └── shared/                 # Shared feature code
├── routes/           # File-based routes (Tanstack Router)
├── types/            # TypeScript types (api-models.ts)
└── utils/            # Utility functions
```

Each feature has:
- `SkjemaStateContext.tsx` – form state context
- `zodSchemas.tsx` – Zod validation schemas
- `steg/` – step-by-step form components
- `visningskomponenter/` – display/read-only components

## Code Standards

- **Language**: Write all user-facing text and variable/function names in Norwegian (bokmål)
- Use functional components with TypeScript and hooks
- Use `const` over `function` declarations (e.g., `const toggle = () => {}`)
- Name event handlers with `handle` prefix (`handleClick`, `handleKeyDown`)
- Use early returns for readability
- Use Aksel components (`@navikt/ds-react`) over custom implementations
- Use Tailwind for custom styling — no `<style>` tags or plain CSS
- Define Zod schemas in `zodSchemas.tsx` per feature
- Use React Hook Form with `@hookform/resolvers/zod`
- Queries/mutations in `queries.ts` / `mutations.ts` per feature

## Boundaries

### ✅ Always

- Follow existing patterns in the codebase
- Use Norwegian for user-facing text and domain names
- Run `yarn check:types` and `yarn lint` before committing
- Validate all user input with Zod schemas
- Use Aksel components for accessibility compliance (WCAG 2.1 AA)
- Use `@navikt/fnrvalidator` for national identity number validation

### ⚠️ Ask First

- Adding new dependencies
- Changing routing structure or route names
- Modifying shared components used across features
- Changing authentication or token handling in `server/`

### 🚫 Never

- Commit secrets or credentials
- Use `<style>` tags or inline styles instead of Tailwind
- Add `TODO` comments without confirmation
- Skip input validation
- Handle personal data (fødselsnummer) carelessly
