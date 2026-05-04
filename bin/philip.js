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

function printHelp() {
  console.log(`Philip Agent Skill installer

Usage:
  philip install [--user|--project|--target <dir>] [--force] [--dry-run]
  philip lint-audit <file|-> [--json] [--format audit|plan|auto]
  philip help

Targets:
  --user             Install to ~/.agents/skills/philip (default)
  --project          Install to ./.agents/skills/philip
  --target <dir>     Install to a custom skill directory

Options:
  --force            Replace an existing Philip install
  --dry-run          Print the target without copying files
  --json             Print lint results as JSON
  --format <format>  Lint as audit, plan, or auto-detect (default: auto)

Examples:
  philip install
  philip install --project
  philip install --target ~/.claude/skills
  philip lint-audit docs/audit.md
  philip lint-audit - --json --format plan
`);
}

function parseArgs(argv) {
  const options = {
    command: argv[0] || "help",
    targetBase: path.join(os.homedir(), ".agents", "skills"),
    force: false,
    dryRun: false,
  };

  if (options.command === "--help" || options.command === "-h") {
    options.command = "help";
  }

  if (options.command === "lint-audit") {
    return parseLintAuditArgs(argv.slice(1));
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
      options.command = "help";
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  return options;
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
      options.command = "help";
    } else if (!options.file) {
      options.file = arg;
    } else {
      throw new Error(`Unexpected argument: ${arg}`);
    }
  }

  if (options.command === "help") {
    return options;
  }

  if (!["audit", "plan", "auto"].includes(options.format)) {
    throw new Error("--format must be audit, plan, or auto");
  }

  if (!options.file) {
    throw new Error("lint-audit requires a report file or '-' for stdin");
  }

  return options;
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

function main() {
  try {
    const options = parseArgs(process.argv.slice(2));

    if (options.command === "help") {
      printHelp();
      return;
    }

    if (options.command === "lint-audit") {
      lintAudit(options);
      return;
    }

    if (options.command !== "install") {
      throw new Error(`Unknown command: ${options.command}`);
    }

    install(options);
  } catch (error) {
    console.error(`philip: ${error.message}`);
    process.exitCode = 1;
  }
}

main();
