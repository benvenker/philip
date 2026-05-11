# Ambition Bar Check

Substantive changes shipped: 5.

Dimensions touched:
- agent_intuitiveness
- agent_ergonomics
- output_parseability
- error_pedagogy
- intent_inference
- self_documentation
- composability
- regression_resistance

Required surface types:
- Mega-command: deferred. A broader `--robot-triage` would be useful, but this pass stayed focused on the user-requested surfaces.
- Capabilities or robot-docs: yes, both added.
- `--json` or robot output on read-side: yes, `philip diff --json` and `philip capabilities --json`.
- Error rewrite: yes, unknown command/flag diagnostics now include corrective commands.
- Intent-inference handler: yes, near-miss command and `--json` typo suggestions.

Self-prompt round:

> That's it?? I was hoping you would get a lot more practical value out of this skill.
> Where are the dramatic improvements? Re-read the playbook, look at the surfaces still
> scoring below 500 on output_parseability / error_pedagogy / intent_inference /
> self_documentation, and ship a substantially larger batch of high-leverage changes.
> You're allowed to be ambitious. Default to acting, not deliberating.

Result of self-prompt:
- Added capability and robot-doc surfaces rather than stopping at the two prior review fixes.
- Added JSON output for `philip diff`.
- Added typo/intent hints and exit-code discipline for user-input errors.
