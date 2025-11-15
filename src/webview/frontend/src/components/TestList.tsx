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
      return "bg-green-800";
    case "WA":
      return "bg-red-800";
    case "TLE":
      return "bg-yellow-800";
    case "RE":
      return "bg-purple-800";
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

  return (
    <section>
      <div className="my-3 space-y-1">
        <div className="font-bold text-lg">{problem.name}</div>
        <div className="text-muted-foreground">{problem.group}</div>
      </div>
      <div className="rounded bg-card">
        {/* TODO: ここにテスト結果（幾つ中幾つがACなのか、全体としてACなのかWAなのか）を表示 */}
      </div>
      <div className="mb-3">
        <ul className="list-none p-0">
          {problem.cases.map((testCase) => {
            const result = results[testCase.index];
            const badgeColor = result
              ? statusBadgeColor(result.status)
              : "bg-gray-800";
            return (
              <li
                key={testCase.index}
                className="border border-border rounded p-2 mb-2"
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
