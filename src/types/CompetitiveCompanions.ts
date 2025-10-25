export interface TestCase {
  input: string;
  output: string;
}

export interface CompetitiveCompanionsResponse {
  name: string;
  group: string;
  url: string;
  interactive: boolean;
  memoryLimit: number;
  timeLimit: number;
  tests: TestCase[];
  testType: string;
  input: any;
  output: any;
  languages: any;
  batch: any;
}
