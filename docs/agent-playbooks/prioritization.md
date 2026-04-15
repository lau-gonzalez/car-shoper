# Prioritization Playbook — car-shoper

## Label taxonomy

### Priority labels (exactly one per issue)

| Label | Color | Meaning | Examples |
|---|---|---|---|
| `priority:P0` | #B60205 (red) | Critical — blocks core functionality | Auth broken, data loss, site down |
| `priority:P1` | #D93F0B (orange) | High — required for next milestone | Core CRUD operations, essential UI flows |
| `priority:P2` | #E4E669 (yellow) | Medium — polish and hardening | UX improvements, error messages, validation |
| `priority:P3` | #0E8A16 (green) | Low — nice-to-have or future work | Minor cosmetic fixes, optimization, stretch goals |

### Classification labels

| Label | Meaning |
|---|---|
| `bug` | Something isn't working as expected |
| `enhancement` | New feature or improvement to existing functionality |

## Triage rules

1. Every issue must have exactly one `priority:*` label before work begins
2. Un-triaged issues (no priority label) rank below `priority:P3` — they should be triaged before being worked
3. Issues labeled `blocked`, `needs-discussion`, `question`, or `wontfix` are excluded from the auto-engineer candidate set

## Picking order

1. `priority:P0` before `priority:P1` before `priority:P2` before `priority:P3`
2. Within a priority bucket: `bug` before `enhancement`
3. Within the same type: lowest issue number first (oldest first)

## When to escalate

- P0 issues with unclear root cause: stop and report rather than guessing
- Issues that require external API keys or credentials not yet configured
- Issues that depend on architecture decisions not yet made
- Anything touching payment processing or PII handling
