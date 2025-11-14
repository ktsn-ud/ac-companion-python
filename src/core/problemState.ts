import { ProblemRecord } from "../types/problem";

let currentProblem: ProblemRecord | null = null;

export function getCurrentProblem(): ProblemRecord | null {
  /**
   * 現在保持している問題情報を返します。存在しない場合は null。
   */
  return currentProblem;
}

export function setCurrentProblem(problem: ProblemRecord): void {
  /**
   * 新しい問題情報をセットし、次の実行時に参照できるようにします。
   */
  currentProblem = problem;
}

export function clearCurrentProblem(): void {
  /**
   * 問題情報をクリアして、Sidebar やコマンドが空状態になるようにします。
   */
  currentProblem = null;
}
