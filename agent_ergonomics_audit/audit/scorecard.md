# Agent-Ergonomics Scorecard

Scope: `philip help`, `philip install`, `philip lint-audit`, `philip diff`, plus the newly added discovery surfaces needed to make those commands self-documenting.

| Surface | Before median | After median | Delta |
| --- | ---: | ---: | ---: |
| `philip help` | 520 | 760 | +240 |
| `philip install` | 620 | 700 | +80 |
| `philip lint-audit` | 650 | 760 | +110 |
| `philip diff` | 520 | 800 | +280 |
| `philip capabilities --json` | 0 | 820 | +820 |
| `philip robot-docs guide` | 0 | 760 | +760 |

Highest-impact fixes:
- `philip diff --help` no longer writes `.philip/artifacts/main/philip-diff.json`.
- `philip diff --bad` exits 2 and writes diagnostics to stderr instead of producing an artifact.
- `lint-audit` rejects invalid `Confidence` values.
- `philip diff --json` and `philip capabilities --json` are parseable stdout-only surfaces.
