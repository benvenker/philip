# Audit Workflow

**Trigger**: "What's wrong with our docs?"

This workflow systematically explores the codebase, inventories existing documentation, cross-references them, and produces a health report.

## Phase 1: Explore Codebase
1. Identify entry points and core modules.
   - Use `ls -la` and `rg "export " src/` or similar to find public APIs.
   - If Orbit is available, query for high-churn files: `curl -H "PRIVATE-TOKEN: $GITLAB_TOKEN" "https://gitlab.example.com/api/v4/orbit/query" -d '{"query": "Find Files with the most MergeRequests in the last 90 days."}'`
2. Map the data flow and configuration files.

## Phase 2: Inventory Docs
1. Find all Markdown files: `rg --files -g "*.md"`
2. Find inline docstrings (language dependent, e.g., `rg "^\s*/\*\*" src/` for JSDoc).
3. Read the contents of `README.md`, `ARCHITECTURE.md`, and everything in `docs/`.

## Phase 3: Cross-Reference
For each documented component:
1. Search the codebase to verify it still exists: `rg "function documentedName"`
2. Verify signatures match.
3. Verify code examples in docs are runnable and reference existing APIs.

## Phase 4: Identify Gaps
1. Compare the list of public APIs (from Phase 1) against the documented APIs (from Phase 2).
2. Note undocumented hotspots.

## Output
Generate a "Docs Health Report".
- Rank issues by severity (e.g., "Documents deleted feature" > "Missing setup guide" > "Typo").
- Provide a recommended fix order.
- Tone: Direct, slightly sardonic if the state is poor.
