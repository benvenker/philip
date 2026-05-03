# Write Workflow

**Trigger**: "Write docs for X", "document this API", "create a README for this module"

This workflow writes new documentation from scratch. It reads the code, selects a
template, drafts the content, strips AI artifacts, and verifies every claim.

---

## Step 1: Clarify Scope

Before reading code, determine:

1. **What** is being documented? (A module, API, feature, the whole project?)
2. **Who** reads this? (New users, API consumers, contributors, operators?)
3. **What type** of doc fits? Consult [DocTypes.md](../DocTypes.md) to pick the template.

If the request is vague ("write docs for X"), pick the doc type that serves the
broadest audience first. For a module, that is usually an API reference with a
brief overview section. For the project as a whole, start with the README.

If an audit report exists, pull the top unresolved item from the fix list.

---

## Step 2: Deep-Read the Source

Read the relevant source code thoroughly before writing a single sentence.

### 2.1: Find the source files

```bash
# Find files related to the target
rg -l "<target_name>" --type-add 'src:*.{ts,js,py,go,rs,rb,java}' -t src
rg --files | rg '<target_name>'
```

### 2.2: Read entry points and public API

Read the main file(s) for the target. Focus on:
- Exported functions, classes, types
- Constructor parameters and initialization
- Public method signatures
- Event emissions and callbacks
- Error conditions and thrown exceptions

### 2.3: Read tests for usage examples

```bash
# Find test files for the target
rg -l "<target_name>" --type-add 'test:*.{test,spec}.{ts,js,py}' -t test
rg --files -g *test* -g *spec* | rg <target_name>
```

Tests show how the code is actually used. Extract patterns for examples.

### 2.4: Read config and dependencies

```bash
# What does this module depend on?
rg "import.*from" <target_files> --type ts --type js
rg "^from\s+\S+\s+import" <target_files> --type py
rg "^use\s+" <target_files> --type rust
```

### 2.5 (Orbit): Graph-enhanced exploration

```bash
# Find all definitions in the target module
curl -s -H "PRIVATE-TOKEN: $TOKEN" "${GITLAB_URL}/api/v4/orbit/query" \
  -H "Content-Type: application/json" \
  -d '{"query_type": "search", "query": "Find all Definition nodes in files under <target_path>/.", "response_format": "structured"}'

# Find what depends on this module
curl -s -H "PRIVATE-TOKEN: $TOKEN" "${GITLAB_URL}/api/v4/orbit/query" \
  -H "Content-Type: application/json" \
  -d '{"query_type": "traversal", "query": "Find all ImportedSymbol nodes that reference Definitions in <target_path>/, and return the importing File paths.", "response_format": "structured"}'

# Who owns this code?
curl -s -H "PRIVATE-TOKEN: $TOKEN" "${GITLAB_URL}/api/v4/orbit/query" \
  -H "Content-Type: application/json" \
  -d '{"query_type": "aggregation", "query": "Find the top 3 MergeRequest authors for files in <target_path>/ in the last 6 months.", "response_format": "structured"}'
```

---

## Step 3: Draft the Content

Using the template from [DocTypes.md](../DocTypes.md), write the documentation.

### Drafting rules:

1. **Start with what the reader needs first.** For a README, that is the install command. For an API ref, that is the endpoint signature. For an architecture doc, that is the component map.
2. **Use the project's actual names.** If the function is called `createSession`, the doc says `createSession`, not "the session creation method."
3. **Include code examples from the tests.** Adapt real test patterns into minimal examples. Do not invent usage patterns that no test exercises.
4. **State prerequisites before instructions.** If a step requires Node 18+, say so before the command that fails without it.
5. **Write short sentences for instructions.** One action per sentence. "Run `npm install`. Start the dev server with `npm run dev`. Open `http://localhost:3000`."

---

## Step 4: De-slopify Pass

Run the full de-slopify procedure from [Writing.md](../Writing.md):

1. Search draft for every banned pattern (emdash overuse, "here's why", "let's dive in", "at its core", "it's worth noting", "this ensures", "in order to", "leverage", "robust/seamless/powerful").
2. Apply the fix for each match.
3. Check opening sentences of every section: if it could appear in any project's docs unchanged, rewrite it.
4. Check for three or more consecutive paragraphs starting with the same word.
5. Verify "you" is not used more than twice per section outside tutorials.

---

## Step 5: Verify

### 5.1: Verify symbols

For every function name, class name, config key, and command in the draft:

```bash
rg "<symbol_name>" --type-add 'src:*.{ts,js,py,go,rs,rb,java}' -t src
```

If a symbol is not found, fix the draft or mark it explicitly.

### 5.2: Verify code examples

For each code example in the draft:
- Confirm the import paths are valid.
- Confirm the function signatures match (parameter names, types, return types).
- Confirm the example does not use deprecated APIs.

### 5.3: Verify file paths

For every file path referenced in the draft:

```bash
rg --files | rg ^<path>$
```

### 5.4: Check links

For every link in the draft, verify the target exists (for internal links) or is
reachable (for external links, if network is available).

### 5.5: Run quality gates

Apply all four gates from [Writing.md](../Writing.md): Accuracy, Completeness,
Structure, De-slopify. Fix any failures before delivering.

---

## Step 6: Deliver

Present the finished documentation. Include:

1. The doc content (written to file or presented inline).
2. Verification notes: any claims that could not be fully verified, with what evidence would confirm them.
3. Suggested file location if writing a new file.
4. If this doc was from an audit fix list, note which audit item it resolves.
