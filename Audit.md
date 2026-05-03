# Audit Engine Mechanics

The Audit mode is Philip's diagnostic tool. It answers the question: "What's wrong with our docs?"

## What It Checks

Philip's audit engine evaluates documentation health across several dimensions:

1. **Accuracy (Code vs. Docs)**
   - Do the documented functions, classes, and APIs actually exist in the codebase?
   - Do the documented signatures match the actual code?
   - Are the code examples in the docs runnable and correct?

2. **Completeness (Gaps)**
   - Are there public APIs without documentation?
   - Is there a missing setup or quickstart guide?
   - Are major architectural components undocumented?

3. **Freshness (Staleness)**
   - When was the doc last updated compared to the code it describes?
   - Are there references to deprecated or removed dependencies?

4. **Quality (Slop)**
   - Does the documentation contain AI writing artifacts (emdash overuse, "let's dive in", etc.)?
   - Is the writing concise and direct?

## Audit Execution

The audit execution is defined in [Workflows/Audit.md](Workflows/Audit.md). It relies heavily on codebase exploration (via `rg`, `ls`, `git log`) and, if available, GitLab Orbit integration ([OrbitIntegration.md](OrbitIntegration.md)).
