# Rewrite Workflow

**Trigger**: "Fix these docs", "rewrite stale docs", "update this README",
"these docs are out of date"

This workflow takes existing documentation that is stale, incorrect, or poorly
written, and updates it to match the current codebase while preserving whatever
structure still works.

---

## Step 1: Read the Existing Doc

Read the target document completely. While reading, extract:

1. **Testable claims**: function names, config keys, commands, file paths, version numbers, URLs.
2. **Structural decisions**: heading hierarchy, section ordering, audience assumptions.
3. **Good parts**: sections that are well-written and likely still accurate.
4. **Obvious problems**: stale references, placeholder text, wrong commands.

---

## Step 2: Find What Changed

### 2.1: When was the doc last modified?

```bash
git log -1 --format='%ai %H %s' -- <doc_path>
```

### 2.2: What changed in the source since then?

```bash
# Get the doc's last commit hash
DOC_COMMIT=$(git log -1 --format='%H' -- <doc_path>)

# Find source changes since that commit
git log --oneline ${DOC_COMMIT}..HEAD -- <source_paths>

# See the actual diff
git diff ${DOC_COMMIT}..HEAD -- <source_paths>
```

### 2.3: Which specific symbols changed?

For each function, class, or config key referenced in the doc:

```bash
# Check if it still exists
rg "^(export\s+)?(function|class|const|def|fn|pub fn)\s+<NAME>" --type-add 'src:*.{ts,js,py,go,rs,rb,java}' -t src

# If it exists, check its current signature
rg "(function|class|const|def|fn|pub fn)\s+<NAME>" -A5 --type-add 'src:*.{ts,js,py,go,rs,rb,java}' -t src
```

### 2.4 (Orbit): Graph-enhanced change analysis

```bash
# Find MRs that changed the documented module since the doc was last updated
curl -s -H "PRIVATE-TOKEN: $TOKEN" "${GITLAB_URL}/api/v4/orbit/query" \
  -H "Content-Type: application/json" \
  -d '{"query_type": "search", "query": "Find MergeRequests merged after <doc_last_modified_date> that modified files in <source_path>/. Include title, author, and merged_at.", "response_format": "llm"}'

# Were there any breaking changes?
curl -s -H "PRIVATE-TOKEN: $TOKEN" "${GITLAB_URL}/api/v4/orbit/query" \
  -H "Content-Type: application/json" \
  -d '{"query_type": "search", "query": "Find MergeRequests merged after <doc_last_modified_date> that modified <source_path>/ and contain the word breaking, deprecat, remov, or renam in the title or description.", "response_format": "llm"}'
```

---

## Step 3: Build a Change List

From the analysis in Step 2, build a list of changes:

| Doc claim | Current code state | Action |
|---|---|---|
| `createUser(name, email)` | Renamed to `createAccount(name, email, role)` | Update signature, add `role` param docs |
| Runs on port 3000 | Default changed to 8080 in config | Update port reference |
| Uses `lodash` for utilities | `lodash` removed, replaced with native methods | Remove dependency mention |
| Auth section | Auth module rewritten with OAuth2 | Full section rewrite |

Classify each change:
- **Update**: Small factual correction (renamed symbol, changed default).
- **Rewrite**: Section needs substantial revision (module was redesigned).
- **Delete**: Section documents something that no longer exists.
- **Add**: A new feature was added that the doc should cover.

---

## Step 4: Rewrite

### Preservation rules:

1. **Keep good structure.** If the existing heading hierarchy makes sense, keep it.
2. **Keep good prose.** If a paragraph is accurate and well-written, do not rewrite it for the sake of rewriting.
3. **Cut stale content ruthlessly.** Do not comment it out or add "deprecated" warnings for things that were removed. Delete them.
4. **Add new sections at the appropriate hierarchy level.** Do not append everything at the bottom.

### For each item in the change list:

- **Update**: Find the specific sentence or code block and fix it in place.
- **Rewrite**: Read the current source code for that section's scope, then rewrite the section following the same approach as [Write Workflow Step 3](Write.md).
- **Delete**: Remove the section. If it leaves a gap in the heading hierarchy, restructure.
- **Add**: Write the new section following the Write Workflow. Place it where a reader would expect it.

---

## Step 5: De-slopify Pass

Run the full de-slopify procedure from [Writing.md](../Writing.md).

Pay extra attention to:
- New sections you wrote vs. preserved sections. Make sure the voice is consistent.
- Transition sentences between preserved and rewritten sections.
- The existing doc may already contain AI artifacts from previous rewrites. Clean those too.

---

## Step 6: Verify

### 6.1: Verify every claim from the change list

Confirm each correction is accurate:

```bash
rg "<corrected_symbol>" --type-add 'src:*.{ts,js,py,go,rs,rb,java}' -t src
```

### 6.2: Re-verify preserved sections

Sections you kept from the original doc may have additional staleness you missed.
Spot-check at least the function names and commands in preserved sections.

### 6.3: Run quality gates

Apply all four gates from [Writing.md](../Writing.md): Accuracy, Completeness,
Structure, De-slopify.

---

## Step 7: Deliver

Present the rewritten documentation with:

1. The updated doc content.
2. A summary of changes made (what was updated, rewritten, deleted, added).
3. Any claims that could not be verified.
4. The git diff of the doc change, if writing to file.
