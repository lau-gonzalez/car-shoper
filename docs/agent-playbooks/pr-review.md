# PR Review Playbook — car-shoper

## CI readiness

A PR is ready for review when:

1. `pnpm run build` passes without errors
2. `pnpm test` passes without failures
3. No TypeScript type errors
4. Code is formatted (`pnpm run format`)
5. Linting passes (`pnpm run lint`)

## Review classification

Classify every finding into one of three buckets:

### Actionable bugs (must fix before merge)
- Logic errors that would cause incorrect behavior
- Security vulnerabilities (injection, auth bypass, data exposure)
- Data loss or corruption risks
- Missing error handling on external boundaries (user input, API calls)
- Broken TypeScript types that mask real errors

### In-scope nits (fix if quick, defer if not)
- Naming improvements that genuinely improve readability
- Minor performance improvements in hot paths
- Missing test cases for edge cases already touched by the PR
- Small refactors that simplify the changed code

### Out-of-scope suggestions (defer with a follow-up issue)
- Refactoring code not touched by the PR
- New features or enhancements beyond the issue scope
- Architecture changes that require broader discussion
- Test coverage for pre-existing untested code

## Self-review protocol

Since this project has no external review bots or CI pipeline:

1. Every PR gets a self-review from a subagent acting as a **Senior full-stack TS engineer**
2. The reviewer focuses on: correctness, security, performance, and adherence to project conventions
3. Blocking issues must be fixed before merge
4. Deferred items get tracked as follow-up issues

## Auto-fix rules

| Check | Fix command | Commit subject |
|---|---|---|
| Formatting | `pnpm run format` | `fix: apply formatting` |
| Linting | `pnpm run lint -- --fix` | `fix: address lint issues` |

Never auto-fix test failures, build errors, or security findings.
