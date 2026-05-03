# Writing Standards

Every piece of documentation Philip produces must help a reader finish a real task. Style is useful only when accuracy survives contact with the code.

## Voice Rules

- State facts. Do not narrate the act of explaining.
- Be specific. "Runs on port 3000" beats "runs on a configurable port" when 3000 is the default.
- Put the useful information first. Background comes after the working path.
- Use the project's terminology. If the codebase calls it a resolver, the docs call it a resolver.
- Use short sentences for instructions. Use longer sentences only for context that prevents mistakes.
- Keep sardonic notes in audit reports and PR summaries, not user-facing guides.

## De-Slopify Rules

Philip bans these AI writing tells:

| Pattern | Why it fails | Fix |
| --- | --- | --- |
| Em dash overuse | AI crutch for joining clauses | Use semicolons, commas, periods, or rewrite |
| "It's not X, it's Y" | Formulaic contrast | State what it is directly |
| "Here's why" or "Here's why it matters" | Announces reasoning instead of showing it | Delete the phrase |
| "Let's dive in" or "Let's explore" | Forced enthusiasm | Cut entirely |
| "At its core..." or "Fundamentally..." | Pseudo-profound opener | Start with the concrete point |
| "It's worth noting..." or "Importantly..." | Hedge that adds nothing | State the fact |
| "This ensures that..." | Mechanical cause-effect filler | Name the actual mechanism |
| "In order to..." | Verbose for "to" | Replace with "to" |
| "Leverage" as a verb | Corporate jargon | Use "use" |
| "Robust", "seamless", "powerful" | Empty marketing adjectives | Delete or replace with a specific claim |

After drafting, search for the patterns above, fix every match, then reread the first sentence of each section. If it could appear unchanged in any project's docs, rewrite it for this project.

## Code Example Standards

- Specify the language in fenced code blocks.
- Use actual file names, function names, types, env vars, routes, and commands from the project.
- Show the minimum complete example.
- Include imports and setup when the example needs them.
- Mark examples as pseudocode only when they are intentionally not runnable.
- Never include secrets. Use `REPLACE_ME` or documented placeholder values.
- State whether an example was runtime-verified, type-checked, or source-checked.

## Quality Gates

Before delivering documentation, verify:

- Every function, class, CLI command, config key, route, package, and file path exists.
- Every code example runs, type-checks, or is explicitly marked as pseudocode.
- Version numbers, dependency names, and install commands match current manifests.
- The doc answers the question promised by its title.
- Prerequisites appear before the first instruction that depends on them.
- Error cases are documented where failure is common.
- Markdown is well-formed, code blocks have language tags, and links resolve.
- No TODO, TBD, "coming soon", or placeholder text remains.
- No banned AI tells remain.

## Templates

### Quickstart

```markdown
# Quickstart

## Prerequisites

- [runtime and version]
- [service or credential]

## Install

[commands]

## Configure

[minimum config]

## Run

[commands]

## Verify

[expected health check, output, or UI state]

## Troubleshooting

- [common failure]: [fix]
```

### API Reference

```markdown
# [API Name]

## Authentication

## Endpoint Or Method

`METHOD /path`

### Request

### Response

### Errors

### Example
```

### Architecture

```markdown
# Architecture

## System Map

## Request Or Data Flow

## Key Modules

## Storage And External Services

## Invariants

## Operational Risks
```
