import * as vscode from "vscode";

export class WebviewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  constructor(private extensionUri: vscode.Uri) {}

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;
    webviewView.webview.options = { enableScripts: true };
    webviewView.webview.html = `
      <!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>AC Companion Python</title>
      </head>
      <body>
        <div id="root"></div>
        <script src="${webviewView.webview.asWebviewUri(
          vscode.Uri.joinPath(this.extensionUri, "media", "frontend", "main.js")
        )}"></script>
      </body>
      </html>
    `;
  }

  public postMessage(message: any) {
    this._view?.webview.postMessage(message);
  }
}
