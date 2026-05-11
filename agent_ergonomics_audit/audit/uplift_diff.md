# Uplift Diff

Measured improvements:
- Help behavior: command-specific help added; `diff --help` side effect removed.
- Output parseability: `diff --json` and `capabilities --json` added.
- Error pedagogy: unknown commands and flags now include exact corrective commands or flags.
- Intent inference: `dif` suggests `philip diff`; `--jsno` suggests `--json`.
- Regression resistance: focused CLI tests and invalid-confidence fixtures added.

No focused surface regressed by more than 50 points.
