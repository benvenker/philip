# Maintain Workflow

**Trigger**: "Update docs for this diff", "update docs for this PR",
"which docs need to change for this MR"

This is a lightweight, scoped workflow designed for CI integration or post-merge
doc maintenance. It takes a code diff as input and patches only the docs that
reference the changed code. It does not rewrite entire documents or perform a
full audit.

---

## Step 1: Parse the Diff

### 1.1: Get the changed files and symbols

```bash
# From a PR/MR number (GitHub)
gh pr diff <number> --name-only

# From a local branch
git diff main...HEAD --name-only

# From a specific commit range
git diff <base>..<head> --name-only
```

### 1.2: Extract changed symbols

For each changed source file, identify what was modified:

```bash
# Show function-level changes
git diff main...HEAD -U0 -- <file> | rg "^[+-]\s*(export\s+)?(function|class|const|def|fn|pub fn|type|interface)"
```

Build a list of:
- Renamed symbols (old name -> new name)
- Deleted symbols
- Changed signatures (new/removed parameters, changed return types)
- New symbols (added functions, classes, types)
- Changed config keys or defaults

### 1.3: Classify the change

| Change scope | Doc impact | Action |
|---|---|---|
| Internal refactor (no public API change) | None | No doc update needed; stop here |
| Renamed public symbol | Targeted find-and-replace | Update references |
| Changed signature | Update parameter docs | Patch affected sections |
| New public symbol | May need new doc section | Add if the symbol is user-facing |
| Deleted public symbol | Remove doc references | Delete affected sections |
| Changed config default | Update config docs | Patch affected values |
| New feature / major change | May need new doc page | Escalate to Write or Rewrite workflow |

If the change scope requires a full rewrite, escalate to the
[Rewrite Workflow](Rewrite.md) instead of patching.

---

## Step 2: Find Affected Documentation

### 2.1: Search docs for references to changed symbols

```bash
# For each changed symbol
rg "<symbol_name>" --type md
rg "<symbol_name>" docs/ README.md ARCHITECTURE.md 2>/dev/null

# For config keys
rg "<config_key>" --type md

# For file paths that were renamed or moved
rg "<old_file_path>" --type md
```

### 2.2: Check inline docstrings

```bash
# If the diff modified a function, check if its docstring needs updating
git diff main...HEAD -- <file> | rg -B2 "^[+-]\s*(///|/\*\*|\"\"\"|''')"
```

### 2.3 (Orbit): Find doc connections via graph

```bash
# Find docs that reference the changed files
curl -s -H "PRIVATE-TOKEN: $TOKEN" "${GITLAB_URL}/api/v4/orbit/query" \
  -H "Content-Type: application/json" \
  -d '{"query_type": "search", "query": "Find File nodes with extension .md that contain references to <changed_file_path>.", "response_format": "structured"}'
```

If no docs reference the changed symbols, the diff has no doc impact. Report
"No documentation updates needed" and stop.

---

## Step 3: Patch Affected Sections

For each affected doc section:

### 3.1: Targeted updates only

- **Renamed symbol**: Find-and-replace the old name with the new name throughout the doc.
- **Changed signature**: Update the documented signature, parameter list, and any examples.
- **Changed default**: Update the documented default value.
- **Deleted symbol**: Remove the section or reference. If removing a section, check that the remaining headings still flow logically.
- **New symbol**: Add a brief entry in the appropriate location (e.g., a new function in an API reference, a new config key in the config reference). Follow the template for that doc type in [DocTypes.md](../DocTypes.md).

### 3.2: Update code examples

If the diff changes an API that appears in a doc example:

1. Read the new signature from the source.
2. Update the example to use the new API.
3. Verify the updated example is consistent with the codebase.

### 3.3: Do NOT touch unrelated sections

The maintain workflow patches only what the diff requires. Do not:
- Rewrite unrelated paragraphs.
- Reorganize the document.
- Fix pre-existing staleness unrelated to this diff.

If you spot unrelated doc problems while patching, note them in the output
as "also noticed" items, but do not fix them in this pass.

---

## Step 4: De-slopify Pass (Scoped)

Run the de-slopify check from [Writing.md](../Writing.md) only on the
sections you modified. Do not rewrite preserved text.

---

## Step 5: Verify Patches

### 5.1: Verify updated references

```bash
# For each symbol you updated in docs, confirm it matches the new code
rg "(function|class|const|def|fn|pub fn)\s+<new_symbol_name>" --type-add 'src:*.{ts,js,py,go,rs,rb,java}' -t src
```

### 5.2: Verify no stale references remain

```bash
# Make sure old names were fully replaced
rg "<old_symbol_name>" --type md
```

If old references remain in docs you did not patch, note them in the output.

---

## Step 6: Deliver

Present the doc patches with:

1. **Affected files**: List of doc files that were modified.
2. **Changes**: For each file, a brief description of what was patched and why.
3. **No-impact assessment**: If no docs were affected, state that explicitly.
4. **Also noticed**: Pre-existing doc issues spotted during the patch, for a future audit or rewrite.
5. **Diff**: The actual doc changes, suitable for inclusion in a commit or PR.

### CI Integration Notes

This workflow is designed to run as a post-merge or PR check:

- **Input**: A diff (from `git diff`, `gh pr diff`, or CI environment variable).
- **Output**: Updated doc files committed to the branch, or a report of needed changes.
- **Exit criteria**: All doc references to changed symbols are updated, or "no doc impact" is confirmed.
- **Escalation**: If the change is too large for patching, output a recommendation to run the Rewrite workflow instead of attempting a partial fix.
