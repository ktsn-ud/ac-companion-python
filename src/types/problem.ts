export interface TestCaseFile {
  index: number;
  inputPath: string;
  outputPath: string;
}

export interface ProblemRecord {
  name: string;
  group: string;
  url: string;
  interactive: boolean;
  timeLimit: number;
  contestId: string;
  taskId: string;
  testsDir: string;
  cases: TestCaseFile[];
}
