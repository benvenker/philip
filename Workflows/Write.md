# Write Workflow

**Trigger**: "Write docs for X"

This workflow handles creating new documentation from scratch.

## Step 1: Deep Read
1. Locate the source code for "X" using `rg "X"`.
2. Read the implementation details. Understand the inputs, outputs, and side effects.
3. If Orbit is available, query for dependencies to understand context: `curl -H "PRIVATE-TOKEN: $GITLAB_TOKEN" "https://gitlab.example.com/api/v4/orbit/query" -d '{"query": "Find all ImportedSymbols used by X."}'`

## Step 2: Select Template
1. Consult `DocTypes.md`.
2. Choose the appropriate structure (e.g., API Reference, Architecture Document).

## Step 3: Draft Content
1. Write the documentation following the selected structure.
2. Include verified code examples.

## Step 4: De-slopify Pass
1. Review the draft against `Writing.md`.
2. Remove all emdashes, "let's dive in", "here's why", etc.
3. Ensure the tone is direct and authoritative.

## Step 5: Final Verification
1. Double-check that all function names and parameters in the draft exactly match the codebase.
2. Save the file.
