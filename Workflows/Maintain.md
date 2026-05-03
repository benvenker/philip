# Maintain Workflow

**Trigger**: "Update docs for this diff/PR"

This is a lightweight workflow designed for CI integration or post-PR updates.

## Step 1: Analyze Diff
1. Read the provided diff or PR changes.
2. Identify the modified functions, classes, or architectural components.

## Step 2: Find Affected Docs
1. Search the documentation files (`*.md`) for references to the modified components using `rg`.
2. Identify inline docstrings attached to the modified code.

## Step 3: Targeted Updates
1. Update *only* the affected sections in the documentation.
2. Do not rewrite the entire document unless the diff fundamentally changes the architecture.

## Step 4: De-slopify Pass
1. Review the modified sections against `Writing.md`.
2. Ensure no slop was introduced.

## Step 5: Save
1. Save the modified documentation files.
