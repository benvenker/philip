# Audit Engine

Philip's audit engine answers one question: where do the docs diverge from the product a developer actually has to use?

An audit is not a grammar pass. It is a code-evidence review of the documentation system: what exists, what is missing, what lies by being stale, and what blocks users from completing real tasks.

## Evidence Model

Every finding needs at least one evidence source:

- Source code: symbols, imports, routes, CLI commands, public APIs, config defaults.
- Tests: behavior contracts, fixtures, golden outputs, regression names.
- Project metadata: package manifests, lockfiles, build config, Dockerfiles, CI workflows.
- Git history: commits, deleted files, renamed commands, recent feature work.
- Runtime help: `--help`, generated API docs, schema output, OpenAPI specs.
- Orbit: file ownership, dependencies, merge request history, graph neighborhoods.

If a claim cannot be tied to evidence, classify it as "unverified" instead of "wrong."

## What To Check

### Coverage

- Is there a clear entry point: `README.md`, `docs/index.md`, or equivalent?
- Are install, setup, configuration, development, testing, deployment, and troubleshooting covered where relevant?
- Do public APIs, CLIs, services, config files, and extension points have matching docs?
- Are generated or canonical docs identified so humans do not edit the wrong file?
- Are security, auth, data retention, permissions, and destructive operations documented?

Useful inventory patterns:

```bash
rg --files -g '*.md' -g '*.mdx' -g 'README*' -g 'docs/**'
rg --files -g 'package.json' -g 'pyproject.toml' -g 'Cargo.toml' -g 'go.mod' -g 'Dockerfile*' -g '.github/workflows/**' -g '.gitlab-ci.yml'
rg --files -g '*openapi*' -g '*swagger*' -g 'proto/**' -g 'graphql/**'
```

### Accuracy

- Commands in docs match package scripts, CLI parser definitions, Make targets, task runners, or CI steps.
- Environment variables match code reads and config schemas.
- File paths still exist.
- API examples match current request and response types.
- Screenshots and UI descriptions match current routes or component names.
- Version numbers and feature flags match project metadata.

Useful cross-check patterns:

```bash
rg -n "process\.env|import\.meta\.env|os\.getenv|std::env|ENV\[|config\." .
rg -n "program\.command|Command::new|argparse|click\.|cobra\.Command|commander" .
rg -n "npm run|pnpm|yarn|cargo|go test|pytest|docker compose|make " README.md docs
git log --name-status --oneline -- docs README.md
```

### Usability

- A new contributor can get from clone to first successful test without guessing.
- Task docs are ordered by what users need to do, not by internal architecture trivia.
- Error recovery is documented for known failure points.
- Examples include expected output when it helps detect failure.
- Cross-links point to the next useful action, not a documentation maze.

### Freshness

- Docs changed alongside code in recent feature commits.
- Recently renamed files, commands, flags, routes, and config keys are reflected.
- Deprecated behavior is marked with replacement guidance.
- Changelog, README, and API references agree.

Useful freshness patterns:

```bash
git log --since='90 days ago' --name-status --oneline
git diff --name-only origin/main...HEAD
git log --follow --oneline -- path/to/doc.md
```

If the repo has no `origin/main`, detect the base with `git merge-base --fork-point` or ask the user.

## Severity Rubric

Use severity based on user harm, not how annoyed Philip feels.

| Severity | Meaning | Examples |
| --- | --- | --- |
| Critical | Blocks install, build, deploy, auth, data safety, or security-sensitive work. | Setup command no longer exists; docs tell users to disable auth; migration instructions lose data. |
| High | Misleads users on common workflows or public contracts. | API docs show removed fields; CLI flags are stale; required env vars are missing. |
| Medium | Causes avoidable confusion or incomplete work. | Architecture overview omits a major service; troubleshooting lacks known error recovery. |
| Low | Polish, wording, organization, or minor discoverability issue. | Repeated content, weak link text, dated screenshots with no behavioral mismatch. |

## Audit Output

Use this structure unless the user asks for another format:

```markdown
# Documentation Audit

## Executive Summary
[One direct paragraph: health, top risks, likely effort.]

## Findings
### Critical
- [Finding title]
  - Evidence: `path`, symbol, command, commit, or Orbit node.
  - Impact: [Who gets hurt and how.]
  - Fix: [Specific change.]

### High
...

## Coverage Map
| Area | Existing Docs | Code Evidence | Status |

## Recommended Plan
1. [Smallest high-value fix.]
2. [Next fix.]

## Unknowns
- [Claims not verified and why.]
```

No finding without evidence. No vague "improve docs" recommendations. The fix should name the doc section or new doc type needed.
