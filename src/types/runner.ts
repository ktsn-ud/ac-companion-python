export type RunStatus = "AC" | "WA" | "TLE" | "RE";
export type RunScope = "one" | "all";

export interface RunResult {
  index: number;
  status: RunStatus;
  durationMs: number;
  actual: string;
  console: string;
  diffSummary?: string;
}

export interface RunSummary {
  total: number;
  passed: number;
  failed: number;
  timeouts: number;
  res: number;
  durationMs: number;
}

export interface RunProgressMessage {
  scope: RunScope;
  running: boolean;
  currentIndex?: number;
}

export interface RunResultMessage {
  scope: RunScope;
  result: RunResult;
}

export interface RunCompleteMessage {
  scope: RunScope;
  summary: RunSummary;
}
