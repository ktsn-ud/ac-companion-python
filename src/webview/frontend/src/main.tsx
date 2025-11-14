import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";

declare const acquireVsCodeApi: () => {
  postMessage: (message: unknown) => void;
  getState: () => unknown;
};

type RunStatus = "pass" | "fail" | "timeout" | "re";

interface ProblemCase {
  index: number;
  inputPath: string;
  outputPath: string;
  inputContent: string;
  expectedContent: string;
}

interface Problem {
  name: string;
  group: string;
  url: string;
  interactive: boolean;
  timeLimit: number;
  contestId: string;
  taskId: string;
  testsDir: string;
  cases: ProblemCase[];
}

interface RunSettings {
  interpreter: "cpython" | "pypy";
  pythonCommand: string;
  pypyCommand: string;
  runCwdMode: "workspace" | "task";
  timeoutMs: number | null;
  compare: {
    mode: "exact";
    caseSensitive: boolean;
  };
}

interface RunResult {
  index: number;
  status: RunStatus;
  durationMs: number;
  actual: string;
  console: string;
  diffSummary?: string;
}

type Message =
  | {
      type: "state/init" | "state/update";
      problem?: Problem;
      settings: RunSettings;
    }
  | {
      type: "run/progress";
      scope: "one" | "all";
      running: boolean;
      currentIndex?: number;
    }
  | {
      type: "run/result";
      scope: "one" | "all";
      result: RunResult;
    }
  | {
      type: "run/complete";
      scope: "one" | "all";
      summary: {
        total: number;
        passed: number;
        failed: number;
        timeouts: number;
        res: number;
        durationMs: number;
      };
    }
  | {
      type: "notice";
      level: "info" | "warn" | "error";
      message: string;
    };

const vscode = acquireVsCodeApi();

function statusLabel(status: RunStatus) {
  switch (status) {
    case "pass":
      return "Pass";
    case "fail":
      return "Fail";
    case "timeout":
      return "Timeout";
    case "re":
      return "Runtime Error";
  }
}

const App = () => {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [settings, setSettings] = useState<RunSettings | null>(null);
  const [results, setResults] = useState<Record<number, RunResult>>({});
  const [running, setRunning] = useState(false);
  const [statusText, setStatusText] = useState("No problem loaded.");
  const [notice, setNotice] = useState<string | null>(null);

  const computedTimeoutMs = useMemo(() => {
    if (settings?.timeoutMs != null) {
      return Math.max(1, settings.timeoutMs);
    }
    if (problem) {
      return Math.max(1, Math.ceil(problem.timeLimit * 1.2));
    }
    return null;
  }, [problem, settings]);

  const timeoutLabel =
    computedTimeoutMs != null ? `${computedTimeoutMs}ms` : "auto";

  const toggleInterpreter = () => {
    if (!settings) {
      return;
    }
    const next =
      settings.interpreter === "cpython" ? "pypy" : "cpython";
    vscode.postMessage({
      type: "ui/switchInterpreter",
      interpreter: next,
    });
  };

  const renderTextBlock = (
    label: string,
    content: string,
    background = "#f5f5f7"
  ) => (
    <div style={{ marginTop: "6px" }}>
      <div style={{ fontSize: "0.85rem", color: "#6c707b" }}>{label}</div>
      <pre
        style={{
          background,
          padding: "8px",
          borderRadius: "4px",
          margin: "4px 0 0",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {content || "(empty)"}
      </pre>
    </div>
  );

  useEffect(() => {
    const handler = (event: MessageEvent<Message>) => {
      const message = event.data;
      switch (message.type) {
        case "state/init":
        case "state/update": {
          setProblem(message.problem ?? null);
          setSettings(message.settings);
          setResults({});
          setStatusText(
            message.problem
              ? `Ready: ${message.problem.cases.length} test(s)`
              : "No problem loaded."
          );
          setRunning(false);
          setNotice(null);
          break;
        }
        case "run/progress": {
          setRunning(message.running);
          setStatusText(
            message.running
              ? message.currentIndex
                ? `Running #${message.currentIndex}`
                : "Running tests..."
              : "Idle"
          );
          break;
        }
        case "run/result": {
          setResults((prev) => ({
            ...prev,
            [message.result.index]: message.result,
          }));
          break;
        }
        case "run/complete": {
          setRunning(false);
          setStatusText(
            `${message.summary.passed}/${message.summary.total} passed (${message.summary.durationMs}ms)`
          );
          break;
        }
        case "notice": {
          setNotice(message.message);
          break;
        }
      }
    };

    window.addEventListener("message", handler);
    vscode.postMessage({ type: "ui/requestInit" });
    return () => window.removeEventListener("message", handler);
  }, []);

  const runAll = () => {
    vscode.postMessage({ type: "ui/runAll" });
  };

  const runOne = (index: number) => {
    vscode.postMessage({ type: "ui/runOne", index });
  };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "12px" }}>
      <header>
        <h1>AC Companion Python</h1>
        <div style={{ marginBottom: "8px", color: "#6c707b" }}>
          {settings
            ? `Interpreter: ${settings.interpreter} | Timeout: ${timeoutLabel}`
            : "Nothing loaded yet."}
        </div>
        <div style={{ marginBottom: "8px" }}>
          <button
            disabled={!settings || running}
            onClick={toggleInterpreter}
            style={{
              marginRight: "8px",
              background: running ? "#d4d7dd" : "#eff0f3",
            }}
          >
            Switch to{" "}
            {settings?.interpreter === "cpython" ? "PyPy" : "CPython"}
          </button>
          <button
            disabled={!problem || running}
            style={{ marginRight: "8px" }}
            onClick={runAll}
          >
            Run All Tests
          </button>
          <span style={{ color: running ? "#1e90ff" : "#6c707b" }}>
            {statusText}
          </span>
        </div>
      </header>

      {notice && (
        <div
          style={{
            padding: "8px",
            border: "1px solid #f8bbd0",
            background: "#ffeef5",
            color: "#6f1c2e",
            marginBottom: "12px",
          }}
        >
          {notice}
        </div>
      )}

      {problem ? (
        <section>
          <div style={{ marginBottom: "12px" }}>
            <strong>{problem.name}</strong>
            <div style={{ color: "#6c707b" }}>{problem.group}</div>
          </div>
          <div style={{ marginBottom: "12px" }}>
            {problem.cases.length === 0 ? (
              <div>No test cases available.</div>
            ) : (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {problem.cases.map((testCase) => {
                  const result = results[testCase.index];
                  const status = result ? statusLabel(result.status) : "Pending";
                  const badgeColor = result
                    ? result.status === "pass"
                      ? "#2ea043"
                      : result.status === "fail"
                      ? "#d1242f"
                      : result.status === "timeout"
                      ? "#daaa3f"
                      : "#8957e5"
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
                            {status}
                          </span>
                        </div>
                        <button
                          disabled={running}
                          onClick={() => runOne(testCase.index)}
                        >
                          Run
                        </button>
                      </div>
                      <div>
                        {renderTextBlock("Input", testCase.inputContent)}
                        {renderTextBlock(
                          "Expected",
                          testCase.expectedContent,
                          "#e9f0ff"
                        )}
                        {result &&
                          renderTextBlock(
                            "Actual",
                            result.actual,
                            "#e8f5ef"
                          )}
                        {result?.console &&
                          renderTextBlock(
                            "Console",
                            result.console,
                            "#efeef1"
                          )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      ) : (
        <div>No tests yet. Send from Competitive Companion.</div>
      )}
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
