import React from "react";
import { Problem, RunResult } from "../webviewTypes";
import { JSX } from "react";
import { clsx } from "clsx";

export interface TestListProps {
  problem: Problem;
  results: Record<number, RunResult>;
  running: boolean;
  onRunOne: (index: number) => void;
  renderTextBlock: (
    label: string,
    content: string,
    background?: string
  ) => JSX.Element;
}

const statusBadgeColor = (status: RunResult["status"]) => {
  switch (status) {
    case "AC":
      return "bg-green-900";
    case "WA":
      return "bg-red-900";
    case "TLE":
      return "bg-yellow-900";
    case "RE":
      return "bg-purple-900";
  }
};

export const TestList: React.FC<TestListProps> = ({
  problem,
  results,
  running,
  onRunOne,
  renderTextBlock,
}) => {
  if (problem.cases.length === 0) {
    return <div>No test cases available.</div>;
  }

  const totalCases = problem.cases.length;
  let acCount = 0;
  let runCount = 0;
  let hasNonAc = false;

  for (const testCase of problem.cases) {
    const result = results[testCase.index];
    if (!result) continue;
    runCount += 1;
    if (result.status === "AC") {
      acCount += 1;
    } else {
      hasNonAc = true;
    }
  }

  let overallStatus: "AC" | "WA" | "PENDING" = "PENDING";
  if (runCount === totalCases && acCount === totalCases && totalCases > 0) {
    overallStatus = "AC";
  } else if (hasNonAc) {
    overallStatus = "WA";
  }

  const overallResultColor =
    overallStatus === "AC"
      ? "bg-green-900"
      : overallStatus === "WA"
      ? "bg-red-900"
      : "bg-gray-900";

  return (
    <section>
      <div className="my-3 space-y-1">
        <div className="font-bold text-lg">{problem.name}</div>
        <div className="text-muted-foreground">{problem.group}</div>
      </div>
      <div className="space-y-6">
        {/* 全体の結果 */}
        <div
          className={clsx(
            "rounded bg-card flex items-center justify-between px-3 py-2",
            overallResultColor,
            overallStatus === "PENDING" ? "border border-border" : ""
          )}
        >
          <span className="text-white text-sm">
            {acCount}/{totalCases} AC
          </span>
          <span className="text-white text-sm rounded-full border border-white px-2 py-0.5">
            {overallStatus}
          </span>
        </div>
        {/* 各テストケースの結果 */}
        <ul className="list-none p-0 space-y-4">
          {problem.cases.map((testCase) => {
            const result = results[testCase.index];
            const badgeColor = result
              ? statusBadgeColor(result.status)
              : "bg-gray-800";
            return (
              <li
                key={testCase.index}
                className="border border-border rounded p-2"
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="flex gap-2 items-center">
                    <span className="font-bold text-lg">
                      Testcase #{testCase.index}
                    </span>
                    <span
                      className={clsx(
                        "text-white rounded-full py-0.5 px-2 text-xs",
                        badgeColor
                      )}
                    >
                      {result ? result.status.toUpperCase() : "PENDING"}
                    </span>
                  </div>
                  <button
                    disabled={running}
                    onClick={() => onRunOne(testCase.index)}
                    className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-sm px-2 py-1"
                  >
                    Run
                  </button>
                </div>
                {renderTextBlock("Input", testCase.inputContent)}
                {renderTextBlock(
                  "Expected Output",
                  testCase.expectedContent,
                  "bg-emerald-900"
                )}
                {result &&
                  result.status !== "AC" &&
                  renderTextBlock("Actual Output", result.actual, "bg-red-900")}
                {result?.console &&
                  renderTextBlock("Console", result.console, "bg-gray-800")}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};
