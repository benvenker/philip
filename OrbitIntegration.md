# GitLab Orbit Integration

Philip has native integration with GitLab Orbit (GitLab Knowledge Graph) for enhanced codebase understanding. When Orbit is available, Philip uses it to deeply understand ownership, history, and dependencies.

## Detection

Check for Orbit availability:
1. Look for `GITLAB_TOKEN` or `PRIVATE_TOKEN` environment variables.
2. Hit `GET /api/v4/orbit/status`.
3. If unavailable, fall back to standard tools (`rg`, `ls`, `git log`).

## Querying Orbit

When Orbit is available, query `/api/v4/orbit/query`. Use `response_format: "llm"` for narrative sections.

### Schema Domains
- `source_code`: `File`, `Directory`, `Definition`, `ImportedSymbol`
- `code_review`: `MergeRequest`, `MergeRequestDiff`
- `core`: `Project`, `User`, `Group`
- `security`: `Vulnerability`, `Finding`
- `plan`: `WorkItem`, `Label`, `Milestone`

### Common Queries

**1. File Ownership & Review History**
Find who owns a module and when it was last changed.
```bash
curl -H "PRIVATE-TOKEN: $GITLAB_TOKEN" \
  "https://gitlab.example.com/api/v4/orbit/query" \
  -d '{"query": "Find the last 5 MergeRequests that modified files in src/auth, and aggregate the authors.", "response_format": "llm"}'
```

**2. Cross-file Dependency Traversal**
Understand what a function affects before rewriting its docs.
```bash
curl -H "PRIVATE-TOKEN: $GITLAB_TOKEN" \
  "https://gitlab.example.com/api/v4/orbit/query" \
  -d '{"query": "Find all ImportedSymbols that reference the Definition `authenticateUser`.", "response_format": "llm"}'
```

**3. Undocumented Hotspots**
Find files with high churn but no docs.
```bash
curl -H "PRIVATE-TOKEN: $GITLAB_TOKEN" \
  "https://gitlab.example.com/api/v4/orbit/query" \
  -d '{"query": "Find Files in src/ with more than 10 MergeRequests in the last month, but no corresponding Markdown files in docs/.", "response_format": "llm"}'
```
