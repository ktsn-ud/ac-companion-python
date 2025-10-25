import * as vscode from "vscode";
import * as http from "http";
import * as fs from "fs";
import * as path from "path";

import {
  TestCase,
  CompetitiveCompanionsResponse,
} from "./types/CompetitiveCompanions";

let server: http.Server | null = null;

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("ac-companion-python.start", startServer),
    vscode.commands.registerCommand("ac-companion-python.stop", stopServer)
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

  const config = vscode.workspace.getConfiguration("ac-companion-python");
  const port = config.get<number>("port") || 10043;

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

        const contestId = getContestIdFromUrl(url);
        const taskId = getTaskIdFromUrl(url);
        if (!contestId || !taskId) {
          res.writeHead(400);
          res.end("Could not extract contest or task ID from URL.");
          return;
        }

        // 保存ディレクトリの作成
        const dirRelative = config.get<string>("testCaseSaveDirName") || "test";
        const saveDir = path.join(
          workspaceFolders.uri.fsPath,
          contestId,
          taskId,
          dirRelative
        );
        fs.mkdirSync(saveDir, { recursive: true });

        // テストケースの保存
        tests.forEach((test, index) => {
          const idx = index + 1;
          fs.writeFileSync(
            path.join(saveDir, `${idx}.in`),
            test?.input ?? "",
            "utf-8"
          );
          fs.writeFileSync(
            path.join(saveDir, `${idx}.out`),
            test?.output ?? "",
            "utf-8"
          );
        });

        vscode.window.showInformationMessage(
          `Saved ${tests.length} test case(s) to ${saveDir}.`
        );

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
    server!.listen(port, "127.0.0.1", () => resolve());
    server!.on("error", reject);
  });

  vscode.window.showInformationMessage(
    `AC Companion Python server started on port ${port}.`
  );
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
