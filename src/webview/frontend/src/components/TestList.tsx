import React from "react";
import { Problem, RunResult } from "../webviewTypes";
import { JSX } from "react";

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
    case "pass":
      return "#2ea043";
    case "fail":
      return "#d1242f";
    case "timeout":
      return "#daaa3f";
    case "re":
      return "#8957e5";
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
      <div style={{ marginBottom: "12px" }}>
        <strong>{problem.name}</strong>
        <div style={{ color: "#6c707b" }}>{problem.group}</div>
      </div>
      <div style={{ marginBottom: "12px" }}>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {problem.cases.map((testCase) => {
            const result = results[testCase.index];
            const badgeColor = result
              ? statusBadgeColor(result.status)
              : "#6c707b";
            return (
              <li
                key={testCase.index}
                style={{
                  border: "1px solid #e4e7ec",
                  borderRadius: "4px",
                  padding: "8px",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "4px",
                  }}
                >
                  <div>
                    #{testCase.index}{" "}
                    <span
                      style={{
                        color: "#fff",
                        background: badgeColor,
                        borderRadius: "999px",
                        padding: "2px 8px",
                        fontSize: "0.75rem",
                      }}
                    >
                      {result ? result.status.toUpperCase() : "PENDING"}
                    </span>
                  </div>
                  <button
                    disabled={running}
                    onClick={() => onRunOne(testCase.index)}
                  >
                    Run
                  </button>
                </div>
                {renderTextBlock("Input", testCase.inputContent)}
                {renderTextBlock(
                  "Expected",
                  testCase.expectedContent,
                  "#e9f0ff"
                )}
                {result && renderTextBlock("Actual", result.actual, "#e8f5ef")}
                {result?.console &&
                  renderTextBlock("Console", result.console, "#efeef1")}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};
