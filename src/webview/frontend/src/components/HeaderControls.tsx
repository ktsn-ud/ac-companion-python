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
      <div className="text-muted-foreground my-2">
        {settings
          ? `Interpreter: ${settings.interpreter} | Timeout: ${timeoutLabel}`
          : "Nothing loaded yet."}
      </div>
      <button
        disabled={!settings || running}
        onClick={onToggleInterpreter}
        className="block my-2 bg-secondary text-secondary-foreground rounded px-3 py-1"
      >
        Switch to {settings?.interpreter === "cpython" ? "PyPy" : "CPython"}
      </button>
      <div className="bg-muted-foreground h-px my-4"></div>
      <div className="flex gap-3 mb-2 items-center">
        <button
          disabled={!settings || running}
          onClick={onRunAll}
          className="bg-primary hover:bg-primary-hover text-primary-foreground rounded px-3 py-1"
        >
          Run All Tests
        </button>
        <span className="text-muted-foreground">{statusText}</span>
      </div>
    </header>
  );
};
