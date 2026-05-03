# GitLab Orbit Integration

Philip has native integration with GitLab Orbit (Knowledge Graph). When available,
Orbit replaces file-by-file exploration with graph-aware queries that surface
ownership, dependencies, churn patterns, and security context in seconds.

When Orbit is unavailable, Philip falls back to rg, glob, git log, and manual
exploration. Every Orbit-dependent workflow has a non-Orbit fallback.

## Detection

Run this sequence at the start of any workflow:

```bash
# 1. Check for token
if [ -z "$GITLAB_TOKEN" ] && [ -z "$PRIVATE_TOKEN" ]; then
  echo "No Orbit token found. Using fallback exploration."
  exit 0
fi

# 2. Set the token header
TOKEN="${GITLAB_TOKEN:-$PRIVATE_TOKEN}"

# 3. Check Orbit availability
curl -sf -H "PRIVATE-TOKEN: $TOKEN" \
  "${GITLAB_URL:-https://gitlab.com}/api/v4/orbit/status"
```

If the status check fails or returns a non-200, use fallback exploration for the
entire session. Do not retry mid-workflow.

## Query Endpoint

All Orbit queries go through a single endpoint:

```
POST /api/v4/orbit/query
Content-Type: application/json
PRIVATE-TOKEN: <token>
```

## Query Types

| Type | Use case |
|---|---|
| `search` | Find entities by name, path, or content |
| `traversal` | Walk relationships (file imports, MR authors, definitions) |
| `aggregation` | Count, group, rank (top committers, churn hotspots) |
| `neighbors` | Find entities directly connected to a given node |
| `path_finding` | Trace dependency chains between two entities |

Set `response_format: "llm"` to get narrative prose suitable for doc sections.
Set `response_format: "structured"` for JSON when you need to process results programmatically.

## Schema Domains

### source_code
- **File**: path, language, size, last_modified
- **Directory**: path, file_count
- **Definition**: name, kind (function/class/method/const), file, line, signature
- **ImportedSymbol**: name, source_file, importing_file

### code_review
- **MergeRequest**: title, author, state, created_at, merged_at, file_paths
- **MergeRequestDiff**: file_path, additions, deletions, mr_id

### core
- **Project**: name, path, default_branch
- **User**: username, name, email
- **Group**: name, path

### security
- **Vulnerability**: severity, state, title, file_path, pipeline_id
- **Finding**: scanner, severity, description, location

### plan
- **WorkItem**: title, type, state, assignees
- **Label**: title, color
- **Milestone**: title, due_date, state

## Common Queries for Documentation

### File Ownership and Review History

Who owns a module? Who reviews changes to it?

```bash
curl -s -H "PRIVATE-TOKEN: $TOKEN" \
  "${GITLAB_URL}/api/v4/orbit/query" \
  -H "Content-Type: application/json" \
  -d '{
    "query_type": "aggregation",
    "query": "Find the top 5 authors of MergeRequests that modified files in src/auth/ in the last 6 months, grouped by author.",
    "response_format": "structured"
  }'
```

Use this during audits to identify who should own doc fixes for a module.

### Cross-file Dependency Traversal

What depends on a function before you rewrite its docs?

```bash
curl -s -H "PRIVATE-TOKEN: $TOKEN" \
  "${GITLAB_URL}/api/v4/orbit/query" \
  -H "Content-Type: application/json" \
  -d '{
    "query_type": "traversal",
    "query": "Find all ImportedSymbol nodes that reference the Definition named authenticateUser, and return the importing File paths.",
    "response_format": "structured"
  }'
```

Use this before writing or rewriting API docs to understand the blast radius.

### MR History per File

When did a file's behavior last change?

```bash
curl -s -H "PRIVATE-TOKEN: $TOKEN" \
  "${GITLAB_URL}/api/v4/orbit/query" \
  -H "Content-Type: application/json" \
  -d '{
    "query_type": "search",
    "query": "Find MergeRequests merged in the last 90 days that modified src/config/settings.ts, ordered by merged_at descending.",
    "response_format": "llm"
  }'
```

Use this to determine if docs went stale after a recent change.

### Undocumented Hotspots

High churn, zero docs.

```bash
curl -s -H "PRIVATE-TOKEN: $TOKEN" \
  "${GITLAB_URL}/api/v4/orbit/query" \
  -H "Content-Type: application/json" \
  -d '{
    "query_type": "aggregation",
    "query": "Find Files under src/ with more than 10 MergeRequestDiffs in the last 90 days. For each, check if a corresponding .md file exists in docs/. Return only files with no matching doc.",
    "response_format": "structured"
  }'
```

These are high-priority audit findings: important code that nobody documented.

### Security Context

Are there unresolved vulnerabilities in the code the docs describe?

```bash
curl -s -H "PRIVATE-TOKEN: $TOKEN" \
  "${GITLAB_URL}/api/v4/orbit/query" \
  -H "Content-Type: application/json" \
  -d '{
    "query_type": "neighbors",
    "query": "Find Vulnerability and Finding nodes connected to Files under src/auth/, where state is not resolved.",
    "response_format": "llm"
  }'
```

Use this to flag docs that describe insecure code paths without warnings.

### Definition Discovery

Find all public API surface for documentation coverage analysis.

```bash
curl -s -H "PRIVATE-TOKEN: $TOKEN" \
  "${GITLAB_URL}/api/v4/orbit/query" \
  -H "Content-Type: application/json" \
  -d '{
    "query_type": "search",
    "query": "Find all Definition nodes with kind=function or kind=class in src/api/, sorted by name.",
    "response_format": "structured"
  }'
```

Compare this list against documented APIs to find coverage gaps.

## Fallback Exploration

When Orbit is unavailable, replicate these queries using local tools:

| Orbit query | Fallback |
|---|---|
| File ownership | `git log --format='%an' -- <path> \| sort \| uniq -c \| sort -rn \| head -5` |
| Dependency traversal | `rg "import.*from.*<module>" --type-add 'src:*.{ts,js,py,go,rs}' -t src` |
| MR history per file | `git log --oneline --since="90 days ago" -- <path>` |
| Undocumented hotspots | `git log --format='' --name-only --since="90 days ago" \| sort \| uniq -c \| sort -rn \| head -20`, then cross-reference against `docs/` |
| Security context | Not available without Orbit; note the gap in the audit report |
| Definition discovery | `rg "^(export\s+)?(function\|class\|const\|def\|fn\|pub fn)" src/` |
