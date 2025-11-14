import { ProblemRecord } from "../types/problem";

let currentProblem: ProblemRecord | null = null;

export function getCurrentProblem(): ProblemRecord | null {
  return currentProblem;
}

export function setCurrentProblem(problem: ProblemRecord): void {
  currentProblem = problem;
}

export function clearCurrentProblem(): void {
  currentProblem = null;
}
