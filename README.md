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

### 1.0.0 (next merge target)

- Competitive Companion から受信したサンプルケースの追記保存（マージポリシー）を導入し、既存ケースを上書きしないようにしました。
- `main.py` は既に存在する場合にテンプレートで上書きされず、ステータスバーからもアクセス可能な状態を維持します。
- 新しい設定項目（インタプリタ、タイムアウト、比較モードなど）とそのドキュメントを追加し、将来的なランナー/サイドバー連携に備えています。
- テストケースユーティリティにユニットテストを追加し、コードの安定性を高めました。

## Extension Settings

この拡張機能では以下の設定項目を提供しています。
- `ac-companion-python.port` (既定値: `10043`)  
  Competitive Companion からの POST を受け付けるポート番号。
- `ac-companion-python.testCaseSaveDirName` (既定値: `tests`)  
  テスト用 `.in/.out` を配置するディレクトリ名。
- `ac-companion-python.templateFilePath` (既定値: `.config/templates/main.py`)  
  `main.py` が見つからない際にコピーされるテンプレートファイルへのパス。
- `ac-companion-python.interpreter` (既定値: `cpython`)  
  実行時に使用するインタプリタ（`cpython` または `pypy`）。
- `ac-companion-python.pythonCommand` (既定値: `python`)  
  CPython 実行時のコマンド名/パス。
- `ac-companion-python.pypyCommand` (既定値: `pypy3`)  
  PyPy 実行時のコマンド名/パス。
- `ac-companion-python.runCwdMode` (既定値: `workspace`)  
  テスト実行時のカレントディレクトリ（現時点ではワークスペースルートのみ）。
- `ac-companion-python.timeoutMs` (既定値: `null`)  
  個別ケースのタイムアウト上限（ミリ秒）。未設定時は問題の timeLimit × 1.2 を目安に実行。
- `ac-companion-python.compare.mode` (既定値: `exact`)  
  出力比較モード（将来的に `trim`/`tokens` なども追加予定）。
- `ac-companion-python.compare.caseSensitive` (既定値: `true`)  
  出力比較時の大文字小文字判定。
