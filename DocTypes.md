# Document Types

Philip selects a document type based on the audience and purpose. Each type has a
defined structure. Use the closest match; combine types when a single doc serves
multiple purposes.

## 1. README / Quickstart

**Audience**: New users, evaluators, drive-by GitHub visitors.
**Purpose**: Answer "what is this and how do I run it" in under 2 minutes.

**Structure**:
1. One-line description (no buzzwords).
2. Prerequisites (language runtime, OS, required services).
3. Install command (copy-pasteable, verified against current package manifest).
4. First run / basic usage example (verified against codebase).
5. Where to go next (links to deeper docs).

**Rules**: No architecture theory. No history. Get to the install command fast.

## 2. Architecture Document

**Audience**: Contributors, new team members, future maintainers.
**Purpose**: Explain how the system is organized and why.

**Structure**:
1. System overview (one paragraph, what it does at a high level).
2. Component map (major modules, their responsibilities, how they connect).
3. Data flow (request lifecycle, event flow, or pipeline stages).
4. Key design decisions with trade-off rationale.
5. Known limitations and technical debt.

**Rules**: Diagrams must match current code. Reference actual directory names and modules.
If a component was deleted, it does not belong in the architecture doc.

## 3. API Reference

**Audience**: API consumers, integration developers.
**Purpose**: Precise contract documentation for every public endpoint or function.

**Structure per entry**:
1. Signature (endpoint path + method, or function signature).
2. Description (one sentence: what it does).
3. Parameters (name, type, required/optional, default, constraints).
4. Response / return value (shape, status codes, content type).
5. Errors (codes, conditions, messages).
6. Example request and response (verified, minimal).

**Rules**: Generated from code when possible. Every entry must be verified against the
current source. Group by resource or module, not alphabetically.

## 4. Configuration Reference

**Audience**: Operators, self-hosters, DevOps.
**Purpose**: Document every config option with its type, default, and effect.

**Structure**:
1. Config file location and format.
2. Environment variables (name, type, default, description).
3. Config file options (key path, type, default, description).
4. Precedence rules (env var vs. file vs. CLI flag).
5. Example minimal config and example full config.

**Rules**: Verify every key against the actual config schema or parsing code.
Mark deprecated options explicitly.

## 5. Operations / Deployment Guide

**Audience**: Operators, SREs, DevOps.
**Purpose**: Get the system running in production and keep it running.

**Structure**:
1. Infrastructure requirements (compute, storage, network, dependencies).
2. Deployment steps (verified, copy-pasteable commands).
3. Health checks and monitoring endpoints.
4. Scaling guidance.
5. Backup and restore procedures.
6. Rollback procedures.
7. Common failure modes and recovery steps.

**Rules**: Every command must work against the current deployment tooling. Include
expected output so operators can verify success.

## 6. Troubleshooting Guide

**Audience**: Users and operators hitting problems.
**Purpose**: Map symptoms to fixes.

**Structure per entry**:
1. Symptom (what the user sees: error message, behavior).
2. Cause (why it happens).
3. Fix (specific steps, not "check your configuration").
4. Prevention (how to avoid it next time, if applicable).

**Rules**: Organize by symptom, not by internal component. Users search for what they
see, not what broke internally.

## 7. Inline Docstrings

**Audience**: Developers reading the code.
**Purpose**: Explain intent, edge cases, and constraints at the call site.

**Format**: Follow the language convention (JSDoc, Python docstrings, rustdoc, GoDoc).

**Rules**:
- Do not restate the signature. `/** Gets a user */` on `getUser()` is noise.
- Document the "why" and edge cases: thread safety, nullable returns, side effects.
- Keep docstrings under 5 lines unless the function genuinely requires more context.

## 8. Changelog / Migration Guide

**Audience**: Existing users upgrading.
**Purpose**: Tell users what changed and what they need to do about it.

**Structure**:
1. Version and date.
2. Breaking changes with migration steps.
3. New features with usage examples.
4. Bug fixes with references to issues.
5. Deprecations with sunset timeline and replacement.

**Rules**: Breaking changes go first and must include concrete migration instructions,
not just "X was removed."

## Choosing a Type

When the request is ambiguous, ask: "Who reads this and what decision does it help
them make?" Match to the closest type above. If the doc serves two audiences, consider
splitting into two documents rather than producing a hybrid that serves neither well.
