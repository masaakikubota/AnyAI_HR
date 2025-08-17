# TL;DV Analyzer GUI — Finished Template

管理GUIの完成版テンプレートです。以下を満たしています：
- パイプラインビルダー：ステップ（プロンプト）の追加・削除・編集、D&Dで順序入れ替え
- 共有コンテクストが基本。不可時はサーバ側で Transcript 追記フォールバックを実装してください
- 言語 {Lang} は Settings で指定。全プロンプト冒頭に `Please make a response in {Lang}.` を自動付与（クライアント側）
- Email Composer：どのステップ結果を本文に含めるかを D&D（テキストブロックも挿入可）
- 実行 & 送信：`Run Pipeline & Send Email` で `/gui/run-and-email` に POST（404なら `/analyze-and-email` フォールバック）
- Settings：Backend URL / To Email / Lang / Model（既定 `google/gemini-2.5-pro`）/ Job Description / Transcript（貼り付け検証用）

## 起動
```bash
npm install
npm run dev
# http://localhost:5173
```

## 環境変数
- `VITE_BACKEND_URL` … 省略時は Settings の Backend URL を使用（既定: http://localhost:8787）

## API 期待仕様（/gui/run-and-email）
`POST /gui/run-and-email`
```jsonc
{
  "pipeline": {
    "model": "google/gemini-2.5-pro",
    "lang": "ja",
    "shareContext": true,
    "fallbackAppendTranscript": true,
    "steps": [{ "id":"s1","name":"要約","prompt":"Please make a response in ja. ..."}]
  },
  "sections": [
    { "id":"s1","type":"prompt","stepId":"s1","name":"要約" },
    { "id":"text_123","type":"text","name":"TextBlock","content":"### Intro ..." }
  ],
  "subjectTemplate": "[TL;DV] 会議まとめ: {{meta.meeting_title}}",
  "settings": {
    "backendUrl": "http://localhost:8787",
    "emailTo": "you@example.com",
    "lang": "ja",
    "model": "google/gemini-2.5-pro",
    "jobDescription": "（任意）",
    "transcript": "（貼り付けたトランスクリプト）"
  }
}
```

サーバ側は以下を実施：
1) `pipeline.shareContext` が `true` なら、単一セッションでステップを順次実行（Geminiのチャット履歴を共有）。
2) 共有不能なら `fallbackAppendTranscript` に従い、各ステップのプロンプト末尾に Transcript を付与して単発生成。
3) `sections` の順序どおりに本文を合成し、`settings.emailTo` 宛に送信。

## 参考（白画面の元原因）
- `EmailComposer.tsx` で未定義の `SortableSection` を参照していたこと、`Grid` の親子関係、`TextField` に `undefined` が渡る点を修正済み。これで真っ白画面は解消されます。

