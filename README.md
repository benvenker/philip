# Philip

Philip is an AI documentation-writing skill for software projects. It audits, writes, rewrites, and maintains docs by checking claims against code evidence instead of polishing folklore.

## What Philip Does

Philip supports four modes:

| Mode | Use When | Output |
| --- | --- | --- |
| `audit` | "What's wrong with our docs?" | Severity-ranked documentation health report. |
| `write` | "Write docs for X." | New README, guide, API doc, runbook, or reference material. |
| `rewrite` | "Fix these stale docs." | Updated existing docs that match current code. |
| `maintain` | "Update docs for this PR." | Surgical doc patches for the current diff. |

Core rule: every claim in generated docs must trace to local evidence: source code, tests, config, git history, or command output. If GitLab Orbit is available, Philip can use it as additional evidence, but Orbit is never required.

## Install

Install Philip by placing the full directory in a skill location. Do not copy
only `SKILL.md`; Philip uses the root reference files and `Workflows/`.

```bash
# Preferred global agent skills directory
mkdir -p ~/.agents/skills
cp -R philip ~/.agents/skills/philip

# Claude Code
mkdir -p ~/.claude/skills
cp -R philip ~/.claude/skills/philip

# Cursor
mkdir -p ~/.cursor/skills
cp -R philip ~/.cursor/skills/philip

# Codex
mkdir -p ~/.codex/skills
cp -R philip ~/.codex/skills/philip
```

For a project-shared skill, commit it under:

```bash
.cursor/skills/philip/
```

Expected structure:

```text
philip/
  SKILL.md
  Audit.md
  Writing.md
  DocTypes.md
  OrbitIntegration.md
  Workflows/
    Audit.md
    Write.md
    Rewrite.md
    Maintain.md
  README.md
```

## Usage

Ask for the mode naturally:

```text
Use Philip to audit the docs for this repo.
```

```text
Use Philip to write a setup guide for the local development workflow.
```

```text
Use Philip to rewrite docs/api.md so it matches the current route handlers.
```

```text
Use Philip to update docs for the current PR diff.
```

Philip starts by routing through `SKILL.md`, then loads only the needed workflow and reference files. That keeps the active context small while preserving detailed procedures for heavy work.

## Modes

### Audit

Philip inventories documentation, explores the codebase, cross-references claims, and produces a severity-ranked report.

Audit checks include:

- Missing setup, API, architecture, operations, security, and troubleshooting docs.
- Commands that no longer exist.
- Environment variables not documented.
- API examples that diverge from handlers, schemas, or tests.
- Recent code changes that did not update docs.
- Undocumented public symbols and high-churn areas.

### Write

Philip deep-reads the source, chooses the right doc type, drafts from evidence, removes AI filler, and verifies examples where safe.

Supported doc types include README, setup guide, how-to guide, API reference, architecture guide, runbook, troubleshooting guide, changelog, contributor guide, security guide, migration guide, and glossary.

### Rewrite

Philip updates existing docs without flattening useful structure. It uses git history to identify renamed commands, deleted paths, changed config, and stale examples.

Default behavior: keep the good parts, remove the trapdoors.

### Maintain

Philip reads the current diff, classifies user-visible changes, finds affected docs, and patches only the sections that need to change.

This is the mode for PRs and merge requests.

## Optional GitLab Orbit Context

Philip does not set up, configure, or require GitLab Orbit. If the user's
project already has Orbit available in their agent environment, Philip can use
it as an additional read-only context source. Otherwise, Philip uses local
filesystem search, `rg`, and git history.

When already available, Orbit can help with:

- File ownership.
- Cross-file dependencies through `File`, `Definition`, and `ImportedSymbol` nodes.
- Merge request history.
- Undocumented hotspots.
- Security context.
- Graph paths between docs and code.

Do not ask users to create GitLab tokens or enable Orbit as part of using this skill.

## Writing Standards

Philip bans common AI tells: overused em dash constructions, "It's not X it's Y", "Here's why", "Let's dive in", "At its core...", "It's worth noting...", and generic praise words like "robust", "seamless", and "powerful".

The writing style is practical:

- Start with the task.
- Put prerequisites before commands.
- Include verification steps.
- Mark unverified examples.
- Cite code evidence.
- Delete stale claims instead of burying them.

## Quality Bar

Philip is done only when:

- Requested docs are written or the audit report is complete.
- Commands, env vars, paths, APIs, and examples trace to evidence.
- Unsupported claims are removed or marked unknown.
- The final answer states what changed, what was checked, and what remains risky.

If a setup guide has three commands and two are stale, Philip says so. Then he fixes it.
