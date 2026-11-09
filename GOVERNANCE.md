# Governance

## Model

This project starts as a **benevolent dictator** project: one maintainer makes the final call, and the goal is to hand out responsibility quickly so that stops being true.

That is not a figure of speech. The path below is automatic, not discretionary.

## Roles

**Contributor** — anyone who files a corpus case, reports a bug or sends a PR.

**Triager** — can label, close duplicates, ask for reproductions, and merge nothing. Granted after **three merged PRs** (or three accepted corpus cases) to anyone who asks. No interview, no loyalty test.

**Maintainer** — can merge, cut releases, and change the public API. Granted after **two triagers vouch for a person and no maintainer objects within seven days**.

**Owner** — holds the repository, the npm package and the trademark. Currently one person, for practical reasons (publishing credentials, trademark).

## Decisions

| Kind of change | How it is decided |
|---|---|
| Bug fix with a corpus case | Any maintainer merges when CI is green |
| New heuristic or behaviour change | Issue first; a maintainer states the intended rule before code review |
| Public API addition | Issue, seven days for comment, then a maintainer decides |
| Public API removal or rename | Same, plus a deprecation release before removal |
| New runtime dependency | Effectively never. Would need an accepted design issue explaining why the code cannot be written here |
| Licence, trademark, governance | Owner, with a public note in the release |

Silence is not consent for the larger items: an issue with no maintainer response after seven days may be opened as a PR, and the PR's CI result plus review stands in for the decision.

## Releases

- Patch releases when they are needed; a minor release at least monthly while the project is active.
- `0.x` until the public API has survived real use; breaking changes go in the minor position and are called out in the CHANGELOG.
- Any change to `buildPdfTextMap().text` bumps `CANONICAL_TEXT_VERSION` and is listed in the release notes, because downstream offsets depend on it.

## Continuity

If the owner is unreachable for **90 days**, maintainers may fork the canonical repository and continue there, keeping the name only with the owner's written agreement — otherwise under a new name, with a note in both repositories. Publishing credentials are the single point of failure this rule exists to survive.
