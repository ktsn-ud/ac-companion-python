import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "ac-companion-python.helloWorld",
    () => {
      vscode.window.showInformationMessage(
        "Hello World from ac-companion-python!"
      );
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
