import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";

import { AcCompanionPythonSettings } from "../types/config";
import { ProblemRecord, TestCaseFile } from "../types/problem";
import { RunResult, RunStatus } from "../types/runner";
import { normalizeLineEndings } from "./testCaseUtils";

const PYPY_CACHE_WARNING = "Warning: cannot find your CPU L2 & L3 cache size";

function filterConsoleOutput(value: string): string {
  return value
    .split("\n")
    .filter((line) => !line.includes(PYPY_CACHE_WARNING))
    .join("\n")
    .trim();
}

function compareOutputs(
  expected: string,
  actual: string,
  caseSensitive: boolean
): boolean {
  if (caseSensitive) {
    return actual === expected;
  }
  return actual.toLowerCase() === expected.toLowerCase();
}

function computeTimeout(problem: ProblemRecord, settings: AcCompanionPythonSettings) {
  if (typeof settings.timeoutMs === "number") {
    return Math.max(1, settings.timeoutMs);
  }
  return Math.max(1, Math.ceil(problem.timeLimit * 1.2));
}

function resolveCwd(
  settings: AcCompanionPythonSettings,
  workspaceRoot: string,
  problem: ProblemRecord
): string {
  if (settings.runCwdMode === "task") {
    return path.join(workspaceRoot, problem.contestId, problem.taskId);
  }
  return workspaceRoot;
}

export async function runTestCase(
  problem: ProblemRecord,
  settings: AcCompanionPythonSettings,
  workspaceRoot: string,
  testCase: TestCaseFile
): Promise<RunResult> {
  const solutionPath = path.join(
    workspaceRoot,
    problem.contestId,
    problem.taskId,
    "main.py"
  );
  if (!fs.existsSync(solutionPath)) {
    throw new Error(`Solution file not found at ${solutionPath}`);
  }

  const input = fs.readFileSync(testCase.inputPath, "utf-8");
  const expected =
    fs.existsSync(testCase.outputPath) && fs.statSync(testCase.outputPath).isFile()
      ? fs.readFileSync(testCase.outputPath, "utf-8")
      : "";

  const command =
    settings.interpreter === "pypy"
      ? settings.pypyCommand
      : settings.pythonCommand;
  const cwd = resolveCwd(settings, workspaceRoot, problem);
  const timeoutMs = computeTimeout(problem, settings);

  const startAt = Date.now();
  return new Promise<RunResult>((resolve, reject) => {
    const child = spawn(command, [solutionPath], {
      cwd,
      env: process.env,
    });

    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, timeoutMs);

    child.stdout?.on("data", (chunk) => stdoutChunks.push(Buffer.from(chunk)));
    child.stderr?.on("data", (chunk) => stderrChunks.push(Buffer.from(chunk)));

    child.stdin.end(input);

    child.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      const durationMs = Date.now() - startAt;
      const actual = normalizeLineEndings(
        Buffer.concat(stdoutChunks).toString("utf-8")
      );
      const consoleOutput = filterConsoleOutput(
        normalizeLineEndings(
          Buffer.concat(stderrChunks).toString("utf-8")
        )
      );
      let status: RunStatus;

      if (timedOut) {
        status = "timeout";
      } else if (code !== 0) {
        status = "re";
      } else {
        const normalizedExpected = normalizeLineEndings(expected);
        const passed = compareOutputs(
          normalizedExpected,
          actual,
          settings.compare.caseSensitive
        );
        status = passed ? "pass" : "fail";
      }

      resolve({
        index: testCase.index,
        status,
        durationMs,
        actual,
        console: consoleOutput,
      });
    });
  });
}

export async function runAllTests(
  problem: ProblemRecord,
  settings: AcCompanionPythonSettings,
  workspaceRoot: string
): Promise<RunResult[]> {
  const results: RunResult[] = [];
  for (const testCase of problem.cases) {
    const result = await runTestCase(problem, settings, workspaceRoot, testCase);
    results.push(result);
  }
  return results;
}
