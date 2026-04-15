# SDLC Playbook — car-shoper

## Branch naming

- Issue-tracked work: `m<issue-number>-<slug>` (e.g. `m12-add-car-listing-api`)
- Untracked changes: `<verb>-<noun>` (e.g. `fix-login-timeout`, `add-seller-dashboard`)
- Always branch from an up-to-date `main`

## Commit conventions

- Imperative mood subject line: `Add`, `Fix`, `Remove` (not past tense)
- Group related changes into coherent commits — not one mega-commit, not micro-commits
- Every commit includes: `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>`
- Never commit directly to `main`

## PR process

1. Push the feature branch to origin
2. Open a PR with the Summary + Test plan body structure
3. Include `Closes #<N>` on its own line to auto-close the issue on merge
4. Wait for CI checks and self-review to complete
5. Address any blocking findings before merge
6. Squash-merge when all checks pass

## PR body template

```
## Summary
- <what changed and why>

## Test plan
- [ ] <concrete test step>
- [ ] <edge case to verify>

Closes #<N>
```

## Merge policy

- Prefer squash merge to keep `main` history clean
- Never merge with failing CI checks
- Self-review is required before every merge (no external review bots configured)
