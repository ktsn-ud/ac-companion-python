import * as assert from "assert";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

import { getNextTestIndex, normalizeLineEndings } from "../core/testCaseUtils";

suite("TestCase Utils", () => {
  test("normalizeLineEndings replaces CRLF with LF", () => {
    const original = "line1\r\nline2\rline3\n";
    const normalized = normalizeLineEndings(original);
    assert.strictEqual(normalized, "line1\nline2\nline3\n");
  });

  test("getNextTestIndex returns 1 when directory is empty", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "accp-utils-"));
    try {
      assert.strictEqual(getNextTestIndex(tempDir), 1);
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test("getNextTestIndex ignores non-index files and returns max+1", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "accp-utils-"));
    try {
      fs.writeFileSync(path.join(tempDir, "1.in"), "in");
      fs.writeFileSync(path.join(tempDir, "1.out"), "out");
      fs.writeFileSync(path.join(tempDir, "3.in"), "in");
      fs.writeFileSync(path.join(tempDir, "3.out"), "out");
      fs.writeFileSync(path.join(tempDir, "notes.md"), "meta");

      assert.strictEqual(getNextTestIndex(tempDir), 4);
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
