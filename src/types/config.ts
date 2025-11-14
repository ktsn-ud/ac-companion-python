export type Interpreter = "cpython" | "pypy";
export type RunCwdMode = "workspace" | "task";

export interface CompareSettings {
  mode: "exact";
  caseSensitive: boolean;
}

export interface AcCompanionPythonSettings {
  port: number;
  testCaseSaveDirName: string;
  templateFilePath: string;
  interpreter: Interpreter;
  pythonCommand: string;
  pypyCommand: string;
  runCwdMode: RunCwdMode;
  timeoutMs: number | null;
  compare: CompareSettings;
}
