# Testing Playbook — car-shoper

## Run tests

```sh
pnpm test
```

## Test strategy

- **Unit tests**: Cover business logic, data transformations, and utility functions. Keep them fast and isolated.
- **Integration tests**: Cover API endpoints, database queries, and service interactions. Use a real test database where possible.
- **E2E tests**: Cover critical user flows (seller login, car CRUD, customer search/contact). Add these as the UI stabilizes.

## Test file conventions

- Co-locate test files next to the source: `foo.ts` -> `foo.test.ts`
- Use descriptive test names that explain the expected behavior
- Group related tests with `describe` blocks

## What to test for new features

Every PR should include tests for:

1. The happy path of the new functionality
2. Edge cases (empty inputs, boundary values, invalid data)
3. Error handling (what happens when things go wrong)

## CI

No CI pipeline is configured yet. Tests run locally via `pnpm test`. The self-review step in the SDLC compensates for the lack of automated CI checks.
