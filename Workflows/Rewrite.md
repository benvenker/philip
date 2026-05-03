# Rewrite Workflow

**Trigger**: "Fix these existing docs"

This workflow updates stale or incorrect documentation to match the current codebase.

## Step 1: Analyze Stale Docs
1. Read the existing documentation.
2. Identify the code components it references.

## Step 2: Find the Truth
1. Search the codebase for the referenced components (`rg`).
2. Use `git log -p <file>` on the source code to see what changed since the documentation was last updated.
3. If Orbit is available, query for MR history: `curl -H "PRIVATE-TOKEN: $GITLAB_TOKEN" "https://gitlab.example.com/api/v4/orbit/query" -d '{"query": "Find MergeRequests that modified X since Y date."}'`

## Step 3: Rewrite
1. Update the documentation to reflect the current state.
2. Preserve good structure from the original doc, but ruthlessly cut outdated information.

## Step 4: De-slopify Pass
1. Review the rewritten text against `Writing.md`.
2. Remove any AI writing artifacts or filler.

## Step 5: Final Verification
1. Verify all code examples and signatures against the current codebase.
2. Save the file.
