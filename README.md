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

### From npm

After the package is published, install the helper CLI and copy Philip into a
skill location:

```bash
npm install -g @benvenker/philip
philip install
```

For a project-local install:

```bash
npx @benvenker/philip install --project
```

The installer writes the portable skill directory to `~/.agents/skills/philip`
by default. It also supports `--target ~/.claude/skills`, `--target ~/.cursor/skills`,
`--force`, and `--dry-run`.

### Manual install

Recommended shared locations:

```bash
# User-level, shared by Agent Skills clients that support the common path
mkdir -p ~/.agents/skills
cp -R philip ~/.agents/skills/philip

# Project-level, shared with a repository
mkdir -p .agents/skills
cp -R philip .agents/skills/philip
```

Agent-specific fallbacks:

```bash
# Claude Code fallback
mkdir -p ~/.claude/skills
cp -R philip ~/.claude/skills/philip

# Cursor fallback
mkdir -p ~/.cursor/skills
cp -R philip ~/.cursor/skills/philip

# GitHub Copilot project fallback
mkdir -p .github/skills
cp -R philip .github/skills/philip
```

For broader reuse beyond one machine or one repo, package Philip as a plugin
for the target agent ecosystem. Keep the portable skill directory usable on its
own; plugin metadata should not become required for normal use.

## Publishing

This repo can publish the portable skill as `@benvenker/philip` on npm. The
package includes the skill files and the explicit `philip` installer CLI; it
does not run a `postinstall` hook or write into user skill folders without a
command.

Publishing is tag-driven through GitHub Actions and npm trusted publishing.
There is no npm token in this repo.

One-time npm setup: on npmjs.com, add a trusted publisher for
`@benvenker/philip` using GitHub Actions, repository `benvenker/philip`, and
workflow `.github/workflows/publish.yml`.

Before cutting a release:

```bash
npm run check
npm pack --dry-run
```

To publish a release:

```bash
npm version patch   # or minor / major
git push origin main --follow-tags
```

The pushed `vX.Y.Z` tag checks that the tag matches `package.json`, publishes
that version to npm, and creates the GitHub Release marked as latest.

After publishing, smoke-test the public package from a temporary directory:

```bash
npx @benvenker/philip install --dry-run
```

Expected structure:

```text
philip/
  SKILL.md
  Audit.md
  Writing.md
  DocTypes.md
  Exploration.md
  OrbitIntegration.md
  Validation.md
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

## Validation

Use `Validation.md` before publishing changes to Philip itself. It covers skill
structure, portability, forward-test prompts, and output checks.

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

Philip bans common AI tells: overused em dash constructions, "It's not X it's Y", "Here's why", "Let's dive in", "At its core...", "It's worth noting...", marketing adjectives, copula padding like "serves as", vague attribution, forced triples, and generic chatbot conclusions.

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
