import * as fs from "fs";

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
