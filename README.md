# Philip

The documentation writer who actually shows up.

Philip is an AI skill that audits, writes, rewrites, and maintains software
documentation. He reads the code, cross-references every claim, strips out AI
writing artifacts, and optionally queries GitLab Orbit for graph-aware codebase
understanding.

## Why Philip Exists

The GitLab Knowledge Graph team needed documentation. They hired a human to write
it. The human didn't finish. Philip does.

## Install

Copy this directory to your AI agent's skills folder:

```bash
# Claude Code
cp -r philip/ ~/.claude/skills/philip/

# Cursor
cp -r philip/ ~/.cursor/skills/philip/

# Codex
cp -r philip/ ~/.codex/skills/philip/
```

Philip is a composite skill. The agent loads `SKILL.md` first, which routes to
the appropriate context files and workflow based on your request.

## Usage

### Audit: "What's wrong with our docs?"

```
Audit the documentation in this repo. Give me a health report.
```

Philip explores the codebase, inventories all existing docs, cross-references doc
claims against current code, and produces a severity-ranked report with a
recommended fix order. For large repos, he splits exploration across sub-agents.

### Write: "Write docs for X"

```
Write API documentation for the auth module.
```

Philip deep-reads the source code, selects the appropriate doc template, writes
the content, runs a de-slopify pass to remove AI writing artifacts, and verifies
every code example against the codebase.

### Rewrite: "Fix these existing docs"

```
The README is out of date. Rewrite it to match the current codebase.
```

Philip uses git history to find what changed since the docs were last touched,
builds a change list, rewrites stale sections while preserving good structure,
and verifies the result.

### Maintain: "Update docs for this diff"

```
Update the docs for PR #142.
```

Lightweight mode for CI or post-merge workflows. Philip parses the diff, finds
which docs reference the changed code, patches only the affected sections, and
confirms no stale references remain.

## GitLab Orbit Integration

When Philip detects a GitLab token, he queries the Orbit Knowledge Graph API for
file ownership, dependency traversal, MR history, undocumented hotspots, and
security context. This produces smarter audits and more accurate documentation.

To enable:

```bash
export GITLAB_TOKEN="glpat-xxxxxxxxxxxxxxxxxxxx"
# Optional: set the GitLab instance URL (defaults to https://gitlab.com)
export GITLAB_URL="https://gitlab.example.com"
```

Philip checks Orbit availability at the start of each workflow by hitting
`GET /api/v4/orbit/status`. If Orbit is unavailable, he falls back to rg, glob,
and git log without interrupting the workflow.

See [OrbitIntegration.md](OrbitIntegration.md) for query examples and schema details.

## File Structure

```
SKILL.md                # Entry point: mode routing and personality (~50 lines)
Audit.md                # Audit engine: what to check, severity model, report format
Writing.md              # Writing standards, de-slopify rules, quality gates
DocTypes.md             # Supported document types and templates
OrbitIntegration.md     # GitLab Orbit API integration details
Workflows/
  Audit.md              # Full audit workflow (explore -> inventory -> cross-ref -> report)
  Write.md              # Write new documentation workflow
  Rewrite.md            # Fix/update existing documentation workflow
  Maintain.md           # Diff-driven documentation maintenance workflow
README.md               # This file
```

## What Philip Bans

Philip's writing standards explicitly reject common AI tells:

- Emdash overuse (use semicolons, commas, or rewrite)
- "Here's why" / "Here's why it matters"
- "Let's dive in" / forced enthusiasm
- "At its core..." / pseudo-profound openers
- "It's worth noting..." / unnecessary hedges
- "Robust" / "seamless" / "powerful" (empty marketing)
- "It's not X, it's Y" (formulaic contrast)

See [Writing.md](Writing.md) for the full banned-patterns table and de-slopify procedure.

## How It Works

1. **SKILL.md** receives the request and routes to the correct mode.
2. The agent loads only the context files that mode needs (writing standards,
   doc types, audit criteria, Orbit integration).
3. The workflow file provides step-by-step instructions the agent follows.
4. Every workflow ends with verification against the actual codebase.
5. Every writing workflow includes a de-slopify pass.

Philip does not guess. He reads the code, checks the claims, and writes what he
finds. If he cannot verify something, he says so instead of making it up.
