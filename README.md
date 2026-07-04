# Kosen Tech Quest

高専生向けの「技術クエスト型学習・仕事マッチングWebアプリ」プロトタイプです。

企業の小さな技術課題を、学生が挑戦できる「成長クエスト」に変換し、学習、経験値、スキルツリー、教員承認、相互評価、ポートフォリオ証明までを1つのローカルNext.jsアプリで体験できます。

## 起動方法

```bash
pnpm install
pnpm dev
```

起動後、ブラウザで `http://localhost:3000` を開いてください。

この環境のように Node.js が PATH にない場合は、Codex同梱ランタイムの pnpm を使えます。

```powershell
& 'C:\Users\gorir\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\pnpm.cmd' install
& 'C:\Users\gorir\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\pnpm.cmd' dev
```


## 公開用ファイル構成

GitHub Pagesなど、リポジトリ直下を公開する静的ホスティングで `README.md` が表示されないように、公開入口として `index.html` を配置しています。
`index.html` は静的エクスポート済みアプリの `docs/` に自動遷移します。

静的公開ファイルを更新する場合は、次のコマンドを実行してください。

```bash
npm run build:pages
```

このコマンドは Next.js アプリを静的エクスポートし、生成結果を `docs/` にコピーします。

## 技術構成

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui風のローカルUIコンポーネント
- lucide-react icons
- localStorage 永続化
- バックエンド、DB、ログインなし

## ディレクトリ構成

```text
app/
  globals.css
  layout.tsx
  page.tsx
components/
  app-shell.tsx
  screens.tsx
  ui/
data/
  mock-data.ts
hooks/
  use-guild-state.ts
lib/
  types.ts
  utils.ts
```

## 実装済み機能

- ホーム画面: レベル、総経験値、連続学習日数、バッジ、ランキング、デイリークエスト、広告枠
- クエスト一覧: 15件以上の企業クエスト、難易度、安全レベル、危険度ラベル、教員承認ステータス表示
- クエスト詳細: 背景、依頼内容、成果物、注意事項、評価基準、参考教材、提出ボタン
- 企業投稿フォーム: 入力後、教員承認待ちクエストとして一覧へ追加
- 機械設計学習ページ: 15件の教材、ミニクイズ、学習完了で経験値とスキル経験値を加算
- スキルツリー: 10種類のスキルレベルと進捗
- プロフィール: 完了クエスト、学習済み教材、バッジ、評価、実績一覧
- 教員承認画面: 承認、差し戻し、却下、コメント記録
- 成果物提出テンプレート: 8種類の提出テンプレート
- 相互評価画面: 企業から学生、学生から企業への評価記録
- スキル証明書: 印刷またはPDF保存向けプレビュー
- チームクエスト: 5件のチーム案件と参加申請
- localStorage 保存: 経験値、追加クエスト、承認状態、完了教材、完了クエスト、チーム申請、評価

## 今後追加すべき機能

- 学校・企業・学生ごとのログインと権限管理
- 実DBと提出ファイル管理
- 教員承認フローの通知
- NDA同意、公開可否、ポートフォリオ公開範囲設定
- 企業案件の審査履歴と監査ログ
- ルーブリック評価と証明書の署名
- 学科横断チームのチャット、タスク分解、進捗管理
- インターン応募や求人票との接続
- PDF生成ライブラリによる正式な証明書出力
