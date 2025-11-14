import * as fs from "fs";
import * as path from "path";

import { TestCaseFile } from "../types/problem";

/**
 * 保存先ディレクトリ内の既存テストケース番号を確認し、
 * 末尾のインデックス（＋1）を返します。
 * @param dir テストケースディレクトリ
 */
export function getNextTestIndex(dir: string): number {
  let maxIndex = 0;
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const matches = file.match(/^(\d+)\.(?:in|out)$/);
      if (!matches) {
        continue;
      }
      const value = Number(matches[1]);
      if (Number.isFinite(value)) {
        maxIndex = Math.max(maxIndex, value);
      }
    }
  } catch {
    // ディレクトリが存在しないなら 0 のままでよい
  }
  return maxIndex + 1;
}

/**
 * CRLF を含む任意の改行コードを LF に正規化します。
 * @param value 元の文字列
 */
export function normalizeLineEndings(value: string): string {
  return value.replace(/\r\n?/g, "\n");
}

/**
 * 指定したディレクトリ内の `.in`/`.out` ペアをスキャンし、
 * 全てのテストケースを番号昇順で返します。
 * @param dir テストケース用ディレクトリ
 */
export function collectTestCases(dir: string): TestCaseFile[] {
  if (!fs.existsSync(dir)) {
    return [];
  }
  const indexes = new Set<number>();
  for (const entry of fs.readdirSync(dir)) {
    const matches = entry.match(/^(\d+)\.in$/);
    if (!matches) {
      continue;
    }
    const value = Number(matches[1]);
    if (Number.isFinite(value)) {
      indexes.add(value);
    }
  }

  return Array.from(indexes)
    .sort((a, b) => a - b)
    .map((index) => ({
      index,
      inputPath: path.join(dir, `${index}.in`),
      outputPath: path.join(dir, `${index}.out`),
    }));
}
