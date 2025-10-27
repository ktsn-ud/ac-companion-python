# AC Companion Python

AC Companion Python は、AtCoder の問題ページから取得したサンプルテストケースを VS Code ワークスペース内に自動保存するための拡張機能です。Competitive Companion ブラウザ拡張機能が解析した問題情報を受け取り、コンテスト ID／タスク ID ごとのディレクトリにテストケースを整理して配置します。

## Features

- Competitive Companion から送信されるサンプルテストケースをローカルサーバーで受信
- `コンテストID/タスクID/<保存ディレクトリ名>` という構造でテストケースを自動配置
- VS Code コマンドパレットからのサーバー開始・停止 (`AC Companion Python: Start` / `AC Companion Python: Stop`)
- ポート番号と保存ディレクトリ名を設定からカスタマイズ可能

## Requirements

1. [Competitive Companion](https://github.com/jmerle/competitive-companion) ブラウザ拡張機能
   - 拡張機能の “Custom test case endpoints” に `http://127.0.0.1:10043/`（または設定したポート番号）を登録してください。
   - 対応サイトとして AtCoder を有効にしておきます。
2. テストケースを保存したいフォルダを VS Code のワークスペースとして開いていること

## Extension Settings

この拡張機能は次の設定項目を提供します。

- `ac-companion-python.port` (既定値: `10043`)  
  Competitive Companion が POST するポート番号。ブラウザ側のエンドポイント設定と揃えてください。
- `ac-companion-python.testCaseSaveDirName` (既定値: `tests`)  
  テストケースを保存するディレクトリ名。存在しない場合は自動で作成されます。

## Known Issues

現在報告されている既知の問題はありません。

## Release Notes

### 0.0.1

- Competitive Companion から受信したテストケースを自動保存する基本機能を実装。
- コマンドパレットからのサーバー開始・停止に対応。
- 保存先ディレクトリとポート番号の設定を追加。

### 0.1.0

- テストケースを受け取った後にテンプレートファイルを自動コピーする機能を実装
- エディタ上でテンプレートファイルを自動でオープンし，`pass`を選択する
