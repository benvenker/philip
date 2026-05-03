# Audit Workflow

Use this workflow for "audit docs", "what is wrong with our docs?", and docs health checks.

## Phase 0: Scope And Setup

1. Identify the repository root and default branch.
2. Ask for scope only if the user did not provide enough context and the repo is too large to audit in one pass.
3. Detect Orbit using [OrbitIntegration](../OrbitIntegration.md). If available, use it for ownership, churn, and graph traversal.
4. Track these phases: explore codebase, inventory docs, cross-reference, identify gaps, write report.

## Phase 1: Explore Codebase

Map the project before judging the docs.

Run targeted discovery:

```bash
rg --files -g 'package.json' -g 'pnpm-lock.yaml' -g 'yarn.lock' -g 'package-lock.json' -g 'bun.lockb' -g 'Cargo.toml' -g 'pyproject.toml' -g 'go.mod' -g 'Gemfile' -g 'composer.json'
rg --files -g 'Makefile' -g 'justfile' -g 'Taskfile.yml' -g 'docker-compose*.yml' -g 'Dockerfile*' -g '.github/workflows/**' -g '.gitlab-ci.yml'
rg --files -g 'src/**' -g 'app/**' -g 'lib/**' -g 'packages/**' -g 'cmd/**' -g 'internal/**' -g 'crates/**'
```

Find public surfaces:

```bash
rg -n "export (class|function|const|interface|type)|export default|module\\.exports|public (class|interface|enum)|func [A-Z][A-Za-z0-9_]*|pub (fn|struct|enum|trait|mod)|@app\\.(get|post|put|patch|delete)|router\\.(get|post|put|patch|delete)|commander\\.command|program\\.command|cobra\\.Command"
```

Find configuration and environment:

```bash
rg -n "process\\.env|import\\.meta\\.env|Deno\\.env|os\\.getenv|std::env|env::var|config\\(|dotenv|DATABASE_URL|API_KEY|TOKEN|SECRET"
```

Find persistence and external systems:

```bash
rg -n "CREATE TABLE|ALTER TABLE|schema\\.|drizzle|prisma|sequelize|typeorm|mongoose|redis|s3|stripe|github|gitlab|openai|anthropic|kafka|rabbitmq|queue|webhook"
```

For large repositories, split exploration by package, service, or bounded context. If sub-agents are available and the user permits them, assign one subsystem per agent and require evidence-backed summaries.

## Phase 2: Inventory Existing Docs

Collect markdown, MDX, generated API docs, inline docs, examples, and diagrams.

Use:

```bash
rg --files -g 'README*' -g 'CHANGELOG*' -g 'CONTRIBUTING*' -g 'SECURITY*' -g 'LICENSE*' -g 'CODE_OF_CONDUCT*'
rg --files -g 'docs/**' -g 'doc/**' -g 'adr/**' -g 'adrs/**' -g 'architecture/**' -g 'runbooks/**' -g 'examples/**'
rg --files -g '*.md' -g '*.mdx' -g '*.rst' -g '*.adoc'
rg --files -g '*.drawio' -g '*.mermaid' -g '*.mmd' -g '*.puml' -g '*.svg' -g '*.png'
```

Find inline documentation:

```bash
rg -n "///|/\\*\\*|'''|\"\"\"|@param|@returns|@example|#\\[doc|godoc|JSDoc|Typedoc|Swagger|OpenAPI"
```

Create an inventory table with path, doc type, audience, last modified date, owner if known, and suspected risk.

## Phase 3: Cross-Reference Claims

For each important doc section:

1. Extract claims about commands, files, symbols, routes, env vars, package names, services, and workflows.
2. Search the codebase for each claim.
3. Verify examples and snippets against current source.
4. Check links and referenced files.
5. Use git history to compare doc age to code age.

Useful commands:

```bash
git log --follow --format='%h %ad %an %s' --date=short -- path/to/doc.md
git log --since='12 months ago' --name-only --pretty=format: -- src/path
rg -n "npm install|pnpm add|yarn add|bun add|cargo install|pip install|go install"
rg -n "localhost:[0-9]+|127\\.0\\.0\\.1|http://|https://"
rg -n "[A-Z][A-Z0-9_]{2,}=|DATABASE_URL|REDIS_URL|GITLAB_TOKEN|PRIVATE_TOKEN"
rg -n "`[^`]+`" README* docs/**/*.md
```

When Orbit is available:

- Use traversal to follow documented entry points to dependencies.
- Use neighbors to identify reviewers and owners for stale modules.
- Use aggregation to find high-churn files with no docs.
- Use security search before validating security claims.

## Phase 4: Identify Gaps

Compare the codebase map to the doc inventory.

Look for:

- Public APIs without examples or reference docs.
- CLIs without command docs.
- Config keys without a configuration reference.
- Services without deployment or operations docs.
- Complex data flows without architecture docs.
- High-churn modules with no doc touch in the same period.
- Tests or examples that teach behavior better than official docs.

Gap search helpers:

```bash
rg -n "TODO|FIXME|HACK|XXX|deprecated|breaking|migration|rename|removed"
rg -n "throw new|raise |panic!|bail!|anyhow!|return fmt\\.Errorf|errors\\.New|HttpError|StatusCode"
rg -n "describe\\(|it\\(|test\\(|pytest|unittest|RSpec|go test|#[cfg\\(test\\)]"
```

## Phase 5: Write The Report

Use this structure:

```markdown
# Docs Health Report

## Executive Summary

[Counts, biggest risks, fastest fix.]

## Inventory

[Docs grouped by type and audience.]

## Findings

### Critical

- [Title]
  - Evidence: [doc claim] vs [code reality]
  - Impact: [who is affected]
  - Fix: [specific edit]
  - Owner: [person/team if known]

## Missing Docs

## Recommended Fix Order

## Unknowns
```

Keep the tone factual. If the docs are rough, say so clearly: "The setup guide is currently a trapdoor: three commands, two are stale."

**Trigger**: "What's wrong with our docs?", "audit docs", "docs health check"

This workflow explores the codebase, inventories all documentation, cross-references
doc claims against code, identifies gaps, and produces a severity-ranked health report.

For large repos (50+ source files or 10+ doc files), consider splitting phases 1-3
across sub-agents by subsystem, then merging findings in phase 4.

---

## Phase 1: Explore Codebase

**Goal**: Build a map of what the project does, its public surface, and its structure.

### Step 1.1: Identify project type and structure

```bash
# Package manifests and entry points
ls -la
ls package.json Cargo.toml pyproject.toml go.mod Gemfile Makefile Dockerfile 2>/dev/null

# Top-level directory layout
find . -maxdepth 2 -type d -not -path './.git/*' -not -path './node_modules/*' | head -40
```

### Step 1.2: Find public API surface

```bash
# JavaScript/TypeScript exports
rg "^export\s+(default\s+)?(function|class|const|interface|type|enum)" --type ts --type js -l
rg "module\.exports" --type js -l

# Python public functions and classes
rg "^(def |class )" --type py -l
rg "^__all__\s*=" --type py

# Go exported symbols
rg "^func [A-Z]" --type go -l
rg "^type [A-Z]" --type go -l

# Rust public items
rg "^pub (fn|struct|enum|trait|type|mod)" --type rust -l

# Generic: look for router/handler/endpoint definitions
rg "(router\.(get|post|put|delete|patch)|@(Get|Post|Put|Delete|Patch)|@app\.(route|get|post))" -l
```

### Step 1.3: Map configuration surface

```bash
# Config files
ls .env.example .env.sample config/ src/config* settings* 2>/dev/null
rg "process\.env\." --type ts --type js -l
rg "os\.environ|os\.getenv" --type py -l
rg "env::var|std::env" --type rust -l
```

### Step 1.4: Identify test structure

```bash
# Test directories and files
find . -type f \( -name "*test*" -o -name "*spec*" \) -not -path './node_modules/*' -not -path './.git/*' | head -20
```

### Step 1.5 (Orbit): Enhanced exploration

If Orbit is available, run these queries to supplement local exploration:

```bash
# High-churn files (likely important, possibly underdocumented)
curl -s -H "PRIVATE-TOKEN: $TOKEN" "${GITLAB_URL}/api/v4/orbit/query" \
  -H "Content-Type: application/json" \
  -d '{"query_type": "aggregation", "query": "Find the 20 Files with the most MergeRequestDiffs in the last 90 days, return path and diff count.", "response_format": "structured"}'

# Module ownership map
curl -s -H "PRIVATE-TOKEN: $TOKEN" "${GITLAB_URL}/api/v4/orbit/query" \
  -H "Content-Type: application/json" \
  -d '{"query_type": "aggregation", "query": "For each top-level directory under src/, find the most frequent MergeRequest author in the last 6 months.", "response_format": "structured"}'
```

---

## Phase 2: Inventory All Documentation

**Goal**: Find every piece of documentation in the project.

### Step 2.1: Find all markdown files

```bash
rg --files -g "*.md" -g "*.mdx" | sort
```

### Step 2.2: Find doc directories and generated docs

```bash
# Common doc locations
ls -la docs/ doc/ documentation/ wiki/ guides/ 2>/dev/null
ls -la api-docs/ swagger/ openapi* 2>/dev/null

# Generated doc artifacts
ls -la **/typedoc.json **/jsdoc.json .storybook/ 2>/dev/null
```

### Step 2.3: Find inline documentation

```bash
# JSDoc/TSDoc comments
rg "^\s*/\*\*" --type ts --type js -c | sort -t: -k2 -rn | head -20

# Python docstrings (triple-quote after def/class)
rg '^\s*(def|class)\s+\w+.*:\s*$' --type py -A1 | rg '"""' | head -20

# Rust doc comments
rg "^\s*///" --type rust -c | sort -t: -k2 -rn | head -20

# Go doc comments
rg "^// [A-Z]" --type go -c | sort -t: -k2 -rn | head -20
```

### Step 2.4: Catalog what exists

For each doc file found, record:
- File path
- Last modified date: `git log -1 --format='%ai' -- <filepath>`
- Purpose (README, API ref, architecture, config, guide, changelog)
- Approximate scope (which modules/features it covers)

---

## Phase 3: Cross-Reference

**Goal**: For each doc claim, verify it against current code.

### Step 3.1: Extract testable claims

Read each doc file and extract:
- Function/class/type names mentioned
- CLI commands and flags
- Config keys and environment variables
- File paths referenced
- Package names and versions
- URLs and links

### Step 3.2: Verify symbols exist

For each function, class, or type name found in docs:

```bash
rg "^(export\s+)?(function|class|const|def|fn|pub fn|type|interface)\s+<NAME>" --type-add 'src:*.{ts,js,py,go,rs,rb,java}'  -t src
```

If the symbol is not found, it is a staleness finding.

### Step 3.3: Verify CLI commands

For each documented command:

```bash
# Check package.json scripts
rg "\"<command>\"" package.json

# Check Makefile targets
rg "^<target>:" Makefile

# Check CLI entry point
rg "<command>" src/cli* bin/* 2>/dev/null
```

### Step 3.4: Verify config keys

For each documented config key or env var:

```bash
rg "<CONFIG_KEY>" --type-add 'src:*.{ts,js,py,go,rs,rb,java}' -t src
rg "<CONFIG_KEY>" .env.example docker-compose* 2>/dev/null
```

### Step 3.5: Check links

For each internal link in docs:

```bash
# Extract markdown links
rg "\[.*?\]\(((?!http)[^)]+)\)" --only-matching <docfile>

# Verify each path resolves
ls <linked_path>  # for each extracted path
```

### Step 3.6 (Orbit): Enhanced cross-reference

```bash
# Find if documented definitions still exist in the graph
curl -s -H "PRIVATE-TOKEN: $TOKEN" "${GITLAB_URL}/api/v4/orbit/query" \
  -H "Content-Type: application/json" \
  -d '{"query_type": "search", "query": "Find Definition nodes named <NAME>.", "response_format": "structured"}'

# Check if the file a doc references has been deleted or moved
curl -s -H "PRIVATE-TOKEN: $TOKEN" "${GITLAB_URL}/api/v4/orbit/query" \
  -H "Content-Type: application/json" \
  -d '{"query_type": "search", "query": "Find File nodes with path matching <documented_path>.", "response_format": "structured"}'
```

---

## Phase 4: Identify Gaps and Generate Report

**Goal**: Produce the Docs Health Report.

### Step 4.1: Compare public surface vs. documented surface

Take the public API surface from Phase 1 and the documented symbols from Phase 3.
For each public symbol with no matching documentation, record a gap.

### Step 4.2: Check for missing doc types

Against the checklist in [DocTypes.md](../DocTypes.md), verify the project has:
- [ ] README with working install and run instructions
- [ ] Architecture overview (if more than one service or 20+ source files)
- [ ] API reference (if the project exposes an API)
- [ ] Configuration reference (if the project has config files or env vars)
- [ ] Deployment guide (if the project is deployed as a service)
- [ ] Troubleshooting guide (if the project has known failure modes)
- [ ] Contribution guide (if the project accepts contributions)
- [ ] Changelog (if the project has releases)

### Step 4.3: Score staleness

For each doc file, compare its last-modified date against the last-modified date of
the source files it references:

```bash
# Doc last touched
git log -1 --format='%ai' -- docs/api.md

# Source last touched
git log -1 --format='%ai' -- src/api/
```

If source changed more recently than docs, flag for review. If source changed more
than 90 days after docs, flag as likely stale.

### Step 4.4 (Orbit): Undocumented hotspot detection

```bash
curl -s -H "PRIVATE-TOKEN: $TOKEN" "${GITLAB_URL}/api/v4/orbit/query" \
  -H "Content-Type: application/json" \
  -d '{"query_type": "aggregation", "query": "Find Files under src/ with more than 10 MergeRequestDiffs in the last 90 days that have no corresponding .md file in docs/. Return file path and diff count.", "response_format": "structured"}'
```

### Step 4.5: Compile the report

Follow the report structure defined in [Audit.md](../Audit.md):

1. Executive summary
2. Inventory table
3. Findings (sorted by severity, then blast radius)
4. Gaps
5. Recommended fix order
6. Unknowns

Present the fix order as a numbered list, starting with the change that unblocks the
most users. Group related fixes (e.g., "update all references to the renamed package")
into single items.
