#!/usr/bin/env node

const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const vitestExecutable = path.resolve(
  __dirname,
  process.platform === "win32"
    ? "../node_modules/.bin/vitest.cmd"
    : "../node_modules/.bin/vitest"
);

const vitestResult = spawnSync(
  vitestExecutable,
  ["run", "--coverage"],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      COVERAGE_ENFORCE: "false",
    },
  }
);

if (vitestResult.status !== 0) {
  process.exit(vitestResult.status ?? 1);
}

const summaryPath = path.resolve(
  __dirname,
  "../coverage/unit/coverage-summary.json"
);

if (!fs.existsSync(summaryPath)) {
  console.error(
    "\nCoverage summary not found. Ensure the coverage directory exists and try again."
  );
  process.exit(1);
}

const summary = JSON.parse(fs.readFileSync(summaryPath, "utf-8"));

const metricKeys = ["lines", "functions", "branches", "statements"];

const backlog = Object.entries(summary)
  .filter(([file]) => file !== "total")
  .map(([file, metrics]) => {
    const uncovered = {};

    for (const key of metricKeys) {
      const metric = metrics[key];
      if (!metric) continue;

      const uncoveredCount = Math.max(metric.total - metric.covered, 0);
      if (metric.pct < 100 || uncoveredCount > 0) {
        uncovered[key] = {
          pct: Number(metric.pct.toFixed(2)),
          uncovered: uncoveredCount,
        };
      }
    }

    return {
      file,
      uncovered,
    };
  })
  .filter((entry) => Object.keys(entry.uncovered).length > 0)
  .sort((a, b) => a.file.localeCompare(b.file));

if (backlog.length === 0) {
  console.log("\n✅ All tracked files are fully covered by unit tests. Great job!\n");
  process.exit(0);
}

console.log("\n❗️ Untested code detected. Prioritise the following files:\n");

for (const entry of backlog) {
  const details = Object.entries(entry.uncovered)
    .map(([key, info]) => `${key}: ${info.pct}% (missing ${info.uncovered})`)
    .join(" | ");
  console.log(`- ${entry.file}\n    ${details}`);
}

console.log(
  "\nTip: tackle files with the largest uncovered counts first to maximise coverage gains.\n"
);
