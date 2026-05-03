# Supported Document Types

Philip recognizes and writes specific types of documentation. Select the appropriate template based on the task.

## 1. README / Quickstart
**Purpose**: Get a new user or developer up and running immediately.
**Structure**:
- One-liner pitch.
- Prerequisites.
- Installation instructions (verified).
- Basic usage example (verified).

## 2. Architecture Document (ARCHITECTURE.md)
**Purpose**: Explain how the system works at a high level.
**Structure**:
- System overview.
- Core components and their responsibilities.
- Data flow.
- Key design decisions / trade-offs.

## 3. API Reference
**Purpose**: Detailed documentation for public interfaces.
**Structure**:
- Endpoint / Function signature.
- Parameters (types, required/optional, descriptions).
- Return values.
- Errors / Exceptions.
- Minimal usage example.

## 4. Inline Docstrings
**Purpose**: Contextual help within the code itself.
**Structure**:
- Follow the language-specific standard (e.g., JSDoc, Python docstrings, Rust rustdoc).
- Keep it brief. Focus on *why* and *edge cases*, not just restating the signature.
