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
