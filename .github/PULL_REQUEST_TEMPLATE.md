## What and why

<!-- What changes, and what problem it solves. Link the issue if there is one. -->

## How you verified it

<!-- New tests? A corpus case? Which document did you check the output against? -->

## Checklist

- [ ] `pnpm test` and `pnpm typecheck` pass locally
- [ ] New behaviour has a test, or an existing one explains why not
- [ ] If output changed: I read the `pnpm eval` diff, and every change is intended
- [ ] If `buildPdfTextMap().text` changed: `CANONICAL_TEXT_VERSION` is bumped and the CHANGELOG says so
- [ ] No new runtime dependency (this package ships with none, and that is a feature)
- [ ] Public API unchanged, or the change is called out above
- [ ] Commits are signed off (`git commit -s`) — see CONTRIBUTING.md

## Licence

- [ ] I agree to license this contribution under the Apache License 2.0, and I have the right to do so.
