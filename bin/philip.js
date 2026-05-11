#!/usr/bin/env node

"use strict";

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const skillName = "philip";
const packageRoot = path.resolve(__dirname, "..");
const skillFiles = [
  "SKILL.md",
  "Audit.md",
  "Writing.md",
  "DocTypes.md",
  "Exploration.md",
  "OrbitIntegration.md",
  "Validation.md",
  "Workflows",
  "fixtures",
  "scripts",
  "README.md",
];
const commandNames = ["install", "lint-audit", "diff", "capabilities", "robot-docs", "help"];

class UserInputError extends Error {
  constructor(message) {
    super(message);
    this.name = "UserInputError";
  }
}

function printHelp(topic = "main") {
  if (topic === "install") {
    console.log(`Usage:
  philip install [--user|--project|--target <dir>] [--force] [--dry-run]

Install the portable Philip skill directory.

Targets:
  --user             Install to ~/.agents/skills/philip (default)
  --project          Install to ./.agents/skills/philip
  --target <dir>     Install to a custom skill directory

Options:
  --force            Replace an existing Philip install
  --dry-run          Print the target without copying files
  -h, --help         Show this help

Examples:
  philip install
  philip install --project
  philip install --target ~/.claude/skills
`);
    return;
  }

  if (topic === "lint-audit") {
    console.log(`Usage:
  philip lint-audit <file|-> [--json] [--format audit|plan|auto]

Check a Philip documentation audit report for required structure.

Options:
  --json             Print lint results as JSON
  --format <format>  Lint as audit, plan, or auto-detect (default: auto)
  -h, --help         Show this help

Exit codes:
  0                  No structural issues found
  1                  Structural issues found
  2                  User input error

Examples:
  philip lint-audit docs/audit.md
  philip lint-audit - --json --format plan
`);
    return;
  }

  if (topic === "diff") {
    console.log(`Usage:
  philip diff [--json]

Write an Actionable diff JSON evidence packet to .philip/artifacts/{workstream}/philip-diff.json.

Options:
  --json             Print a machine-readable result envelope to stdout
  -h, --help         Show this help without writing artifacts

Exit codes:
  0                  Actionable diff written
  1                  Environment or Git collection failure
  2                  User input error

Examples:
  philip diff
  philip diff --json
`);
    return;
  }

  if (topic === "capabilities") {
    console.log(`Usage:
  philip capabilities --json

Print Philip's machine-readable CLI contract.
`);
    return;
  }

  if (topic === "robot-docs") {
    console.log(`Usage:
  philip robot-docs guide

Print a concise agent-facing guide for Philip's CLI surfaces.
`);
    return;
  }

  console.log(`Philip Agent Skill installer

Usage:
  philip install [--user|--project|--target <dir>] [--force] [--dry-run]
  philip lint-audit <file|-> [--json] [--format audit|plan|auto]
  philip diff [--json]
  philip capabilities --json
  philip robot-docs guide
  philip help [command]

Commands:
  install           Install the portable Philip skill directory
  lint-audit        Check audit report structure
  diff              Write an Actionable diff JSON evidence packet to .philip/artifacts/{workstream}/philip-diff.json
  capabilities      Print the machine-readable CLI contract
  robot-docs        Print the agent quick guide

Examples:
  philip install
  philip install --help
  philip lint-audit docs/audit.md
  philip lint-audit - --json --format plan
  philip diff --json
  philip capabilities --json
  philip robot-docs guide
`);
}

function parseArgs(argv) {
  if (argv.length === 0) {
    return { command: "help", topic: "main" };
  }

  const options = {
    command: argv[0],
    targetBase: path.join(os.homedir(), ".agents", "skills"),
    force: false,
    dryRun: false,
  };

  if (options.command === "--help" || options.command === "-h") {
    return { command: "help", topic: "main" };
  }

  if (options.command === "help") {
    return parseHelpArgs(argv.slice(1));
  }

  if (options.command === "lint-audit") {
    return parseLintAuditArgs(argv.slice(1));
  }

  if (options.command === "diff") {
    return parseDiffArgs(argv.slice(1));
  }

  if (options.command === "capabilities") {
    return parseCapabilitiesArgs(argv.slice(1));
  }

  if (options.command === "robot-docs") {
    return parseRobotDocsArgs(argv.slice(1));
  }

  if (options.command !== "install") {
    throw userInputErrorForCommand(options.command);
  }

  for (let index = 1; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--user") {
      options.targetBase = path.join(os.homedir(), ".agents", "skills");
    } else if (arg === "--project") {
      options.targetBase = path.join(process.cwd(), ".agents", "skills");
    } else if (arg === "--target") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error("--target requires a directory");
      }
      options.targetBase = expandHome(value);
      index += 1;
    } else if (arg === "--force") {
      options.force = true;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--help" || arg === "-h") {
      return { command: "help", topic: "install" };
    } else {
      throw userInputErrorForOption(arg, {
        command: "install",
        knownFlags: ["--user", "--project", "--target", "--force", "--dry-run", "--help"],
      });
    }
  }

  return options;
}

function parseHelpArgs(argv) {
  if (argv.length === 0) {
    return { command: "help", topic: "main" };
  }

  if (argv.length === 1 && commandNames.includes(argv[0])) {
    return { command: "help", topic: argv[0] };
  }

  throw userInputErrorForCommand(argv[0], {
    prefix: "Unknown help topic",
    suffix: "Run `philip help` for the command list.",
  });
}

function parseLintAuditArgs(argv) {
  const options = {
    command: "lint-audit",
    file: null,
    json: false,
    format: "auto",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--json") {
      options.json = true;
    } else if (arg === "--format") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error("--format requires audit, plan, or auto");
      }
      options.format = value;
      index += 1;
    } else if (arg.startsWith("--format=")) {
      options.format = arg.slice("--format=".length);
    } else if (arg === "--help" || arg === "-h") {
      return { command: "help", topic: "lint-audit" };
    } else if (arg.startsWith("-") && arg !== "-") {
      throw userInputErrorForOption(arg, {
        command: "lint-audit",
        knownFlags: ["--json", "--format", "--help"],
      });
    } else if (!options.file) {
      options.file = arg;
    } else {
      throw new UserInputError(
        `Unexpected argument: ${arg}\nRun \`philip lint-audit --help\` for usage.`
      );
    }
  }

  if (!["audit", "plan", "auto"].includes(options.format)) {
    throw new UserInputError(
      "--format must be audit, plan, or auto\nRun `philip lint-audit --help` for usage."
    );
  }

  if (!options.file) {
    throw new UserInputError(
      "lint-audit requires a report file or '-' for stdin\nRun `philip lint-audit --help` for usage."
    );
  }

  return options;
}

function parseDiffArgs(argv) {
  const options = {
    command: "diff",
    args: [],
  };

  for (const arg of argv) {
    if (arg === "--help" || arg === "-h") {
      return { command: "help", topic: "diff" };
    }
    if (arg === "--json") {
      options.args.push(arg);
      continue;
    }
    if (arg.startsWith("-")) {
      throw userInputErrorForOption(arg, {
        command: "diff",
        knownFlags: ["--json", "--help"],
      });
    }
    throw new UserInputError(
      `Unexpected argument: ${arg}\nRun \`philip diff --help\` for usage.`
    );
  }

  return options;
}

function parseCapabilitiesArgs(argv) {
  if (argv.includes("--help") || argv.includes("-h")) {
    return { command: "help", topic: "capabilities" };
  }

  if (argv.length !== 1 || argv[0] !== "--json") {
    throw new UserInputError(
      "capabilities requires --json\nRun `philip capabilities --json`."
    );
  }

  return { command: "capabilities" };
}

function parseRobotDocsArgs(argv) {
  if (argv.includes("--help") || argv.includes("-h")) {
    return { command: "help", topic: "robot-docs" };
  }

  if (argv.length !== 1 || argv[0] !== "guide") {
    throw new UserInputError(
      "robot-docs requires the guide topic\nRun `philip robot-docs guide`."
    );
  }

  return { command: "robot-docs" };
}

function expandHome(value) {
  if (value === "~") {
    return os.homedir();
  }

  if (value.startsWith(`~${path.sep}`)) {
    return path.join(os.homedir(), value.slice(2));
  }

  return path.resolve(value);
}

function install(options) {
  const targetBase = path.resolve(options.targetBase);
  const targetDir = path.join(targetBase, skillName);

  if (options.dryRun) {
    console.log(`Would install Philip to ${targetDir}`);
    return;
  }

  if (fs.existsSync(targetDir) && !options.force) {
    throw new Error(
      `${targetDir} already exists. Re-run with --force to replace it.`
    );
  }

  const tempDir = path.join(
    targetBase,
    `.${skillName}.tmp-${process.pid}-${Date.now()}`
  );

  fs.rmSync(tempDir, { recursive: true, force: true });
  fs.mkdirSync(tempDir, { recursive: true });

  for (const relativePath of skillFiles) {
    const source = path.join(packageRoot, relativePath);
    const destination = path.join(tempDir, relativePath);

    if (!fs.existsSync(source)) {
      throw new Error(`Package is missing required skill file: ${relativePath}`);
    }

    fs.cpSync(source, destination, {
      recursive: true,
      errorOnExist: false,
      force: true,
    });
  }

  fs.mkdirSync(targetBase, { recursive: true });
  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: options.force });
  }
  fs.renameSync(tempDir, targetDir);

  console.log(`Installed Philip to ${targetDir}`);
}

function lintAudit(options) {
  const validator = path.join(packageRoot, "scripts", "audit-report-lint.mjs");
  const args = [validator, "--format", options.format];

  if (options.json) {
    args.push("--json");
  }

  args.push(options.file);

  const result = spawnSync(process.execPath, args, {
    stdio: "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  if (typeof result.status === "number") {
    process.exitCode = result.status;
    return;
  }

  process.exitCode = 1;
}

function runDiff(options) {
  const collector = path.join(packageRoot, "scripts", "collect-philip-diff.mjs");
  const result = spawnSync(process.execPath, [collector, ...options.args], {
    cwd: process.cwd(),
    stdio: "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  if (typeof result.status === "number") {
    process.exitCode = result.status;
    return;
  }

  process.exitCode = 1;
}

function printCapabilities() {
  const capabilities = {
    tool: "philip",
    version: readPackageVersion(),
    contractVersion: 1,
    commands: [
      {
        name: "install",
        usage: "philip install [--user|--project|--target <dir>] [--force] [--dry-run]",
        kind: "mutating",
        structuredOutput: false,
      },
      {
        name: "lint-audit",
        usage: "philip lint-audit <file|-> [--json] [--format audit|plan|auto]",
        kind: "read",
        structuredOutput: true,
        schema: "AuditLintResult",
      },
      {
        name: "diff",
        usage: "philip diff [--json]",
        kind: "artifact_writer",
        structuredOutput: true,
        schema: "PhilipDiffResultEnvelope",
      },
      {
        name: "capabilities",
        usage: "philip capabilities --json",
        kind: "read",
        structuredOutput: true,
      },
      {
        name: "robot-docs",
        usage: "philip robot-docs guide",
        kind: "read",
        structuredOutput: false,
      },
    ],
    exitCodes: {
      0: "success",
      1: "runtime-or-validation-failure",
      2: "user-input-error",
    },
    env: [
      {
        name: "PHILIP_AUTO_INSTALL",
        meaning: "When set to 1 during npm install, run philip install automatically.",
      },
    ],
    artifacts: [
      {
        kind: "actionable_diff",
        defaultPath: ".philip/artifacts/{workstream}/philip-diff.json",
        schemaVersion: 1,
      },
    ],
  };

  process.stdout.write(`${JSON.stringify(capabilities, null, 2)}\n`);
}

function printRobotGuide() {
  process.stdout.write(`# Philip Agent Quick Guide

Use Philip for evidence-backed documentation and review artifacts.

Canonical commands:
- \`philip help [command]\` for in-tool usage.
- \`philip lint-audit <file|-> --json\` for parseable audit structure checks.
- \`philip diff --json\` for a parseable result envelope and an Actionable diff artifact at \`.philip/artifacts/{workstream}/philip-diff.json\`.
- \`philip capabilities --json\` for the machine-readable CLI contract.

Stdout/stderr contract:
- Help and requested JSON go to stdout.
- User-input errors go to stderr and exit 2.
- Validation failures from \`lint-audit\` exit 1 and keep JSON on stdout when \`--json\` is requested.

Do not treat generated HTML artifacts as canonical documentation unless the user explicitly asks.
`);
}

function readPackageVersion() {
  try {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(packageRoot, "package.json"), "utf8")
    );
    return packageJson.version || null;
  } catch {
    return null;
  }
}

function userInputErrorForCommand(command, options = {}) {
  const prefix = options.prefix || "Unknown command";
  const nearest = nearestToken(command, commandNames);
  const didYouMean = nearest ? `\nDid you mean \`philip ${nearest}\`?` : "";
  const suffix = options.suffix ? `\n${options.suffix}` : "\nRun `philip help` for usage.";
  return new UserInputError(`${prefix}: ${command}${didYouMean}${suffix}`);
}

function userInputErrorForOption(option, { command, knownFlags }) {
  const nearest = nearestToken(option, knownFlags);
  const didYouMean = nearest ? `\nDid you mean \`${nearest}\`?` : "";
  return new UserInputError(
    `Unknown option: ${option}${didYouMean}\nRun \`philip ${command} --help\` for usage.`
  );
}

function nearestToken(value, candidates) {
  let best = null;
  let bestDistance = Infinity;

  for (const candidate of candidates) {
    const distance = levenshtein(value, candidate);
    if (distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }

  return bestDistance <= 2 ? best : null;
}

function levenshtein(left, right) {
  const rows = Array.from({ length: left.length + 1 }, () =>
    Array(right.length + 1).fill(0)
  );

  for (let index = 0; index <= left.length; index += 1) {
    rows[index][0] = index;
  }
  for (let index = 0; index <= right.length; index += 1) {
    rows[0][index] = index;
  }

  for (let row = 1; row <= left.length; row += 1) {
    for (let column = 1; column <= right.length; column += 1) {
      const cost = left[row - 1] === right[column - 1] ? 0 : 1;
      rows[row][column] = Math.min(
        rows[row - 1][column] + 1,
        rows[row][column - 1] + 1,
        rows[row - 1][column - 1] + cost
      );
    }
  }

  return rows[left.length][right.length];
}

function main() {
  try {
    const options = parseArgs(process.argv.slice(2));

    if (options.command === "help") {
      printHelp(options.topic);
      return;
    }

    if (options.command === "lint-audit") {
      lintAudit(options);
      return;
    }

    if (options.command === "diff") {
      runDiff(options);
      return;
    }

    if (options.command === "capabilities") {
      printCapabilities();
      return;
    }

    if (options.command === "robot-docs") {
      printRobotGuide();
      return;
    }

    install(options);
  } catch (error) {
    console.error(`philip: ${error.message}`);
    process.exitCode = error instanceof UserInputError ? 2 : 1;
  }
}

main();
