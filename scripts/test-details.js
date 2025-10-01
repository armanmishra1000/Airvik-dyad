#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const [, , fileArgument] = process.argv;

if (!fileArgument) {
  console.error("Usage: pnpm test:details <relative-file-path>");
  process.exit(1);
}

const coveragePath = path.resolve(
  __dirname,
  "../coverage/unit/lcov.info"
);

if (!fs.existsSync(coveragePath)) {
  console.error(
    "Coverage data not found. Run `pnpm test:backlog` first to generate coverage."
  );
  process.exit(1);
}

const absoluteTarget = path
  .resolve(__dirname, "..", fileArgument)
  .replace(/\\/g, "/");

const projectRoot = path.resolve(__dirname, "..");
const relativeTarget = path
  .relative(projectRoot, absoluteTarget)
  .replace(/\\/g, "/");

const lcovContent = fs.readFileSync(coveragePath, "utf-8");
const fileSections = lcovContent.split("end_of_record");

const section = fileSections.find(
  (block) =>
    block.includes(`SF:${absoluteTarget}`) ||
    block.includes(`SF:${relativeTarget}`)
);

if (!section) {
  console.error(
    `No coverage data found for ${fileArgument}. Run ` +
      "`pnpm test:backlog` first and double-check the relative path."
  );
  process.exit(1);
}

const lines = section.split("\n");
const functions = [];
const uncoveredLines = [];

for (const line of lines) {
  if (line.startsWith("FN:")) {
    const [, location, name] = line.match(/FN:(\d+),(.*)/) || [];
    if (location && name) {
      functions.push({ name, line: Number(location), covered: 0 });
    }
  }
  if (line.startsWith("FNDA:")) {
    const [, hits, name] = line.match(/FNDA:(\d+),(.*)/) || [];
    if (name) {
      const fn = functions.find((f) => f.name === name);
      if (fn) fn.covered = Number(hits);
    }
  }
  if (line.startsWith("DA:")) {
    const [, location, hits] = line.match(/DA:(\d+),(\d+)/) || [];
    if (location && hits === "0") {
      uncoveredLines.push(Number(location));
    }
  }
}

const uncoveredFunctions = functions.filter((fn) => fn.covered === 0);

console.log(`\nCoverage gaps for ${fileArgument}:`);

if (uncoveredFunctions.length) {
  console.log("\nFunctions missing coverage:");
  for (const fn of uncoveredFunctions) {
    console.log(`  - ${fn.name} (starts at line ${fn.line})`);
  }
} else {
  console.log(
    "\nAll functions reported coverage (check uncovered lines below for finer detail).\n"
  );
}

if (uncoveredLines.length) {
  console.log("Uncovered lines:");
  console.log(
    "  " +
      uncoveredLines
        .sort((a, b) => a - b)
        .map((lineNumber) => `line ${lineNumber}`)
        .join(", ")
  );
} else {
  console.log("No uncovered lines reported.");
}

console.log(
  "\nTip: copy this summary into the Claude prompt under the 'Function Details' section.\n"
);
