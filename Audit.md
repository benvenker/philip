# Audit Engine

Philip audits documentation by treating every doc claim as a testable assertion
about the current project. No assertion survives without evidence.

## Evidence Standard

Every reported issue must include at least one of:

- A source reference proving the doc is stale, incomplete, or wrong.
- A search showing a documented symbol, command, route, or config key no longer exists.
- Git history showing code changed after the doc section was last touched.
- Orbit graph evidence: ownership gaps, churn without doc updates, unresolved vulnerabilities.

If evidence is weak, label the item "needs confirmation" instead of stating it as fact.

## What to Check

### Correctness

- Install commands reference the right package manager, binary names, scripts, and env vars.
- Code examples compile, run, or at minimum reference APIs that exist in the current codebase.
- Documented function/class/route/CLI signatures match their actual definitions.
- Screenshots, diagrams, and architecture descriptions reflect current components.
- Security, auth, permissions, and data retention claims match code and config.

### Completeness

- New users can install, configure, run, test, and troubleshoot the project from docs alone.
- Operators can deploy, monitor, roll back, and recover using documented procedures.
- Contributors can understand architecture, dev workflow, test strategy, and release process.
- API consumers can find inputs, outputs, errors, auth, rate limits, pagination, and examples.
- Maintainers can map major modules to owners, invariants, and risky dependencies.

### Staleness

- Docs reference deleted files, renamed packages, old commands, dead links, or obsolete diagrams.
- High-churn source files have no corresponding doc updates.
- Docs predate major migrations, framework upgrades, or API redesigns without revision.
- "TODO", "coming soon", and "temporary" notes that have survived long enough to be archaeology.

### Usability

- The first successful path through the docs is obvious within 60 seconds.
- Prerequisites are explicit (language version, OS, required services).
- Sections ordered by user task, not internal org chart.
- Error recovery documented where failure is common.
- Example count is useful, not a museum of stale snippets.

## Severity Model

| Severity | Definition | Examples |
|---|---|---|
| **Critical** | Causes data loss, security mistakes, broken installs, invalid API usage | Wrong auth example, install command pulls deleted package |
| **High** | Blocks common user or contributor workflows | Missing setup guide, wrong build command |
| **Medium** | Causes confusion, slows setup, partially wrong behavior docs | Outdated config options, renamed parameters |
| **Low** | Polish, structure, broken non-essential links, wording | Typos, formatting, dead internal links |

Within each severity, rank by blast radius: README/quickstart first, then public API docs,
then deploy/operator docs, then contributor docs, then internal notes.

## Gap Categories

When docs are missing entirely, classify the gap:

- Missing quickstart or getting-started guide
- Missing configuration reference
- Missing API or CLI reference
- Missing architecture overview
- Missing deployment or operations guide
- Missing troubleshooting guide
- Missing security model or threat documentation
- Missing contribution workflow
- Missing changelog or migration guide
- Missing ownership or support contact

## Report Structure

Every audit report must include these sections:

1. **Executive summary**: Total docs inspected, major risks, highest-impact fix.
2. **Inventory**: Doc files grouped by purpose with last-modified dates.
3. **Findings**: Each with severity, evidence, affected users, recommended fix, likely owner.
4. **Gaps**: Undocumented surfaces with the search evidence used to confirm absence.
5. **Fix order**: Smallest sequence of changes that improves user success rate fastest.
6. **Unknowns**: Claims that could not be verified and what evidence would settle them.
