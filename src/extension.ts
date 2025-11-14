import * as vscode from "vscode";
import * as http from "http";
import * as fs from "fs";
import * as path from "path";

import {
  TestCase,
  CompetitiveCompanionsResponse,
} from "./types/CompetitiveCompanions";
import { AcCompanionPythonSettings, Interpreter, RunCwdMode } from "./types/config";

import { WebviewProvider } from "./webview/webviewProvider";

const TEMPLATE_FILE_DEFAULT = ".config/templates/main.py";
const PLACEHOLDER = "pass";

let server: http.Server | null = null;
let webviewProvider: WebviewProvider | null = null;

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("ac-companion-python.start", startServer),
    vscode.commands.registerCommand("ac-companion-python.stop", stopServer),
    vscode.window.registerWebviewViewProvider(
      "ac-companion-python.view",
      new WebviewProvider(context.extensionUri)
    )
  );

  startServer();
}

export function deactivate() {}

async function startServer() {
  if (server) {
    vscode.window.showInformationMessage(
      "AC Companion Python server is already running."
    );
    return;
  }

  const initialSettings = loadSettings();
  const port = initialSettings.port;

  server = http.createServer(async (req, res) => {
    try {
      if (req.method === "POST" && req.url === "/") {
        const body = await readBody(req);
        const data: CompetitiveCompanionsResponse = JSON.parse(
          body.toString("utf-8")
        );
        const tests: TestCase[] = Array.isArray(data?.tests) ? data.tests : [];
        const url = URL.canParse(data?.url) ? new URL(data.url) : null;
        if (!url) {
          res.writeHead(400);
          res.end("Invalid or missing URL.");
          return;
        }

        const workspaceFolders = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolders) {
          res.writeHead(500);
          res.end("No workspace folder found.");
          return;
        }

        const settings = loadSettings();

        const contestId = getContestIdFromUrl(url);
        const taskId = getTaskIdFromUrl(url);
        if (!contestId || !taskId) {
          res.writeHead(400);
          res.end("Could not extract contest or task ID from URL.");
          return;
        }

        // 保存ディレクトリの作成
        const dirRelative = settings.testCaseSaveDirName;
        const saveDir = path.join(
          workspaceFolders.uri.fsPath,
          contestId,
          taskId,
          dirRelative
        );
        fs.mkdirSync(saveDir, { recursive: true });

        const nextIndex = getNextTestIndex(saveDir);

        // テストケースの保存
        tests.forEach((test, index) => {
          const idx = nextIndex + index;
          fs.writeFileSync(
            path.join(saveDir, `${idx}.in`),
            normalizeLineEndings(test?.input ?? ""),
            "utf-8"
          );
          fs.writeFileSync(
            path.join(saveDir, `${idx}.out`),
            normalizeLineEndings(test?.output ?? ""),
            "utf-8"
          );
        });

        vscode.window.showInformationMessage(
          `Saved ${tests.length} test case(s) to ${saveDir}.`
        );

        // テンプレートファイルのコピー
        const templateRelativePath =
          settings.templateFilePath || TEMPLATE_FILE_DEFAULT;
        const templatePath = path.join(
          workspaceFolders.uri.fsPath,
          templateRelativePath
        );

        const solutionDir = path.join(
          workspaceFolders.uri.fsPath,
          contestId,
          taskId
        );
        fs.mkdirSync(solutionDir, { recursive: true });
        const solutionPath = path.join(solutionDir, "main.py");
        if (!fs.existsSync(solutionPath)) {
          if (fs.existsSync(templatePath)) {
            fs.copyFileSync(templatePath, solutionPath);
          } else {
            vscode.window.showWarningMessage(
              `Template file not found at ${templatePath}. Skipping template copy.`
            );
          }
        }

        // ソリューションファイルをエディタで開く
        if (fs.existsSync(solutionPath)) {
          const codeUri = vscode.Uri.file(solutionPath);
          openCodeFileAndSetCursor(codeUri);
        }

        res.writeHead(200);
        res.end("ok");
        return;
      }
      res.writeHead(404);
      res.end("Not Found");
    } catch (e: any) {
      res.writeHead(500);
      res.end(String(e?.message ?? e));
    }
  });

  await new Promise<void>((resolve, reject) => {
    const onError = (err: Error) => {
      server?.off("error", onError);
      reject(err);
    };
    server!.on("error", onError);
    server!.listen(port, "127.0.0.1", () => {
      server?.off("error", onError);
      resolve();
    });
  });

  vscode.window.showInformationMessage(
    `AC Companion Python server started on port ${port}.`
  );

  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    0
  );
  statusBarItem.text = `ACCP: Running`;
  statusBarItem.command = "ac-companion-python.stop";
  statusBarItem.show();
}

function stopServer() {
  if (!server) {
    return;
  }
  server.close();
  server = null;
  vscode.window.showInformationMessage("AC Companion Python server stopped.");
}

function readBody(req: http.IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (d) => chunks.push(Buffer.isBuffer(d) ? d : Buffer.from(d)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function getContestIdFromUrl(url: URL): string | null {
  const parts = url.pathname.split("/");
  const index = parts.indexOf("contests");
  if (index !== -1 && parts.length > index + 1) {
    return parts[index + 1];
  }
  return null;
}

function getTaskIdFromUrl(url: URL): string | null {
  const parts = url.pathname.split("/");
  const index = parts.indexOf("tasks");
  if (index !== -1 && parts.length > index + 1) {
    return parts[index + 1];
  }
  return null;
}

/**
 * VS Code の拡張設定から AC Companion Python の構成を読み取ります。
 */
function loadSettings(): AcCompanionPythonSettings {
  const config = vscode.workspace.getConfiguration("ac-companion-python");
  const interpreter = config.get<Interpreter>("interpreter", "cpython");
  const runCwdMode = config.get<RunCwdMode>("runCwdMode", "workspace");
  const compareMode = config.get<string>("compare.mode", "exact");
  const mode: AcCompanionPythonSettings["compare"]["mode"] =
    compareMode === "exact" ? "exact" : "exact";
  const compareCaseSensitive = config.get<boolean>(
    "compare.caseSensitive",
    true
  );

  const timeoutMs = config.get<number | null>("timeoutMs");

  return {
    port: config.get<number>("port", 10043),
    testCaseSaveDirName: config.get<string>("testCaseSaveDirName", "tests"),
    templateFilePath: config.get<string>(
      "templateFilePath",
      TEMPLATE_FILE_DEFAULT
    ),
    interpreter,
    pythonCommand: config.get<string>("pythonCommand", "python"),
    pypyCommand: config.get<string>("pypyCommand", "pypy3"),
    runCwdMode,
    timeoutMs: typeof timeoutMs === "number" ? timeoutMs : null,
    compare: {
      mode,
      caseSensitive: compareCaseSensitive ?? true,
    },
  };
}

/**
 * 保存先ディレクトリ内の既存テストケース番号を確認し、
 * 末尾のインデックス（＋1）を返します。
 * @param dir テストケースディレクトリ
 */
function getNextTestIndex(dir: string): number {
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
function normalizeLineEndings(value: string): string {
  return value.replace(/\r\n?/g, "\n");
}

async function openCodeFileAndSetCursor(fileUrl: vscode.Uri) {
  try {
    const document = await vscode.workspace.openTextDocument(fileUrl);

    // プレースホルダーを探して選択状態にする
    const text = document.getText();
    const index = text.indexOf(PLACEHOLDER);

    // エディタで開く
    const editor = await vscode.window.showTextDocument(document, {
      preview: false,
    });

    if (index === -1) {
      return;
    }

    const start = document.positionAt(index);
    const end = document.positionAt(index + PLACEHOLDER.length);

    editor.selection = new vscode.Selection(start, end);
    editor.revealRange(
      new vscode.Range(start, end),
      vscode.TextEditorRevealType.InCenter
    );
  } catch (err) {
    vscode.window.showErrorMessage(
      `Failed to open code file: ${
        err instanceof Error ? err.message : String(err)
      }`
    );
  }
}
