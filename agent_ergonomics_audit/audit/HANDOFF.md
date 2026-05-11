# Agent-Ergonomics Pass 1 Handoff

Target: `/Users/ben/code/philip` on `main`.
Workspace: `/Users/ben/code/philip/agent_ergonomics_audit/`.

Implemented:
- Command-specific help for `install`, `lint-audit`, `diff`, `capabilities`, and `robot-docs`.
- `philip diff --help` is side-effect free.
- `philip diff --json` emits a parseable result envelope.
- Unknown commands and options exit 2 with corrective diagnostics on stderr.
- `lint-audit` rejects invalid `Confidence` labels.
- `philip capabilities --json` exposes the CLI contract.
- `philip robot-docs guide` exposes an agent quick guide.
- Regression coverage added in `scripts/test-philip-cli.mjs` and `scripts/test-audit-report-lint.mjs`.

Explicit revalidation:
- `philip diff --help`: fixed. It prints help and does not write an artifact.
- Invalid `Confidence`: fixed. It produces `INVALID_CONFIDENCE_LABEL`.

Deferred:
- Add a broader `philip --robot-triage` or `philip diagnose --json` mega-command that combines capabilities, artifact-store health, verification commands, and recommended next actions.
- Consider schema docs for the `philip diff --json` result envelope if external consumers grow.

Validation to rerun:
- `npm run check`
- `npm run test:cli`
- `npm run test:lint-audit`
- `npm run test:diff`
