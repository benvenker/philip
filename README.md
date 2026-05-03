# Philip: The AI Docs Writer

*The docs writer who actually shows up.*

Philip is an AI documentation skill that audits, writes, rewrites, and maintains software documentation. He was built because human docs writers often leave the job half-finished. Philip doesn't. He cross-references everything against the actual code, strips out AI "slop" writing, and integrates directly with GitLab Orbit for deep codebase understanding.

## Installation

Copy this directory to your AI agent's skills folder (e.g., `~/.claude/skills/philip/` or your Cursor skills directory).

## Usage

Philip operates in four modes. Trigger him with these phrases:

1. **Audit**: "What's wrong with our docs?"
   - Philip will scan your repo, cross-reference docs with code, and generate a health report.
2. **Write**: "Write docs for the auth module."
   - Philip will read the source, pick a template, and write fresh, accurate docs.
3. **Rewrite**: "Fix the stale API docs."
   - Philip will use git history to figure out what changed and update the docs to match.
4. **Maintain**: "Update docs for this diff."
   - Lightweight mode for post-PR updates.

## GitLab Orbit Integration

Philip has native integration with GitLab Orbit (Knowledge Graph). If he detects a `GITLAB_TOKEN` or `PRIVATE_TOKEN`, he will query the graph API to understand file ownership, MR history, and cross-file dependencies, leading to much smarter documentation.

To enable:
```bash
export GITLAB_TOKEN="your_token_here"
```

## The Backstory

The GitLab Knowledge Graph team hired a human to write their docs. The human didn't finish. So they built Philip. He's reliable, direct, and slightly sardonic about the state of your README. He doesn't say "let's dive in." He just writes the docs.
