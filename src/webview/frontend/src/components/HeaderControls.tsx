import React from "react";
import { RunSettings } from "../webviewTypes";

export interface HeaderControlsProps {
  settings: RunSettings | null;
  running: boolean;
  statusText: string;
  timeoutLabel: string;
  onRunAll: () => void;
  onToggleInterpreter: () => void;
}

export const HeaderControls: React.FC<HeaderControlsProps> = ({
  settings,
  running,
  statusText,
  timeoutLabel,
  onRunAll,
  onToggleInterpreter,
}) => {
  return (
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
          onClick={onToggleInterpreter}
          style={{
            marginRight: "8px",
            background: running ? "#d4d7dd" : "#eff0f3",
          }}
        >
          Switch to {settings?.interpreter === "cpython" ? "PyPy" : "CPython"}
        </button>
        <button
          disabled={!running && !settings ? true : !settings || running}
          style={{ marginRight: "8px" }}
          onClick={onRunAll}
        >
          Run All Tests
        </button>
        <span style={{ color: running ? "#1e90ff" : "#6c707b" }}>
          {statusText}
        </span>
      </div>
    </header>
  );
};
