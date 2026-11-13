# WORK_PROGRESS — 300問全面改修の引継ぎ

状態：作業中・本番未反映。検証完了までは main へマージしない。
作業ブランチ：exam-quality-300-staging
公開URL：https://shopping-wash.github.io/self-defense-fire-exam/

## 数量

完成済み（全品質条件合格）：0問
検証済み（添付PDF基準までの最終合格）：0問
作成済み候補：246問（全件、最終品質審査は未完了）
分野別候補数：{"activity": 50, "fire": 60, "law": 40, "facilities": 25, "equipment": 45, "building": 26}
計画：fire60 / building60 / law60 / activity50 / equipment45 / facilities25 = 300

## 保存内容

- staging/*.json：再利用可能な問題候補。単なる候補数を完成数としない。
- staging/*-review.md：個別レビュー。添付PDF前の記録があるため最終判定との区別が必要。
- staging/*-author.py 等：手書き問題をJSONへ組み立てる過程。最新JSONのレビュー修正を上書きする可能性があるため、安易に再実行しない。
- qa/official-analysis.md：公式25問の分析。写真についての旧記述は添付PDF分析後に更新する。
- app.js / index.html：学習UI改修途中。questions.js未組立の間は起動時300問チェックがエラーになる。これはステージングのみ。
- tests/app.test.cjs：node tests/app.test.cjs --fixtures は開発用、完成後 node tests/app.test.cjs は実データ用。
- question-review/*：既存ブランチにあった旧126問監査と旧10候補。新300問には追加しない。

## 問題データ構造

id固有ID / c試験区分（基礎・法令・実務）/ unit6単元 / concept中心知識 / q問題文 / a四肢 / k正答0始まり / e根拠説明 / optionExplanations四肢の正誤理由 / source公式URL / reference条文・ページ / difficulty編集上の難易度。
品質検証状態は最終統合時 reviewStatus を各問へ付ける。現在は全件最終審査待ち。
誤りを選ぶ設問では正答肢が事実として誤り、他3肢は事実として正しいことを明記する。

## 実装済み／未完了

実装済み候補：6単元、安定ID復習、25問10/5/10抽出、75分実時刻タイマー、中断再開、時間切れ提出、選択肢別解説、根拠リンク、既存実技15問。
開発用仮データによる1200採点・1000模試・保存失敗・時間切れテスト通過。実際の300問では未テスト。
実装済み追加：学習履歴・累計正答率・単元別成績・直近30問題の結果。開発用テストで二重計上防止と提出時記録を確認。
未完了：添付PDF28枚の全分析、全候補の最終レビュー、questions.js組立、実データ検査、実ブラウザスマホ検査、本番反映、公開確認。

## 次に行う作業

1. 添付PDFは56ページ（奇数ページはファイル名、偶数ページが写真28枚）。全写真を読み QUESTION_QUALITY_STANDARD.md を確定。
2. 未完成分野（building残34問、law残20問）を埋め、各問に各肢理由と根拠を付けて300候補にする。
3. 添付水準で全問審査。中心知識が他問と同じもの・露骨な誤答・条件不足を差し替える。
4. 全JSONを統合し300問以外を拒否。構造検査と各肢正誤整合検査を行う。
5. node tests/app.test.cjs、ブラウザ、スマホ幅で操作確認。
6. 本ブランチへ短い単位で保存。全件合格後mainへ反映、GitHub Pages既存URLで確認。

## 保存・再開方法

通常git pushはこの環境では認証情報不足。GitHub接続ツール create_tree→create_commit→update_ref で保存可能。
保存するたびに本ファイルを更新する。公開用mainは全条件達成まで変更しない。
直近のコミット：このファイルを含むブランチHEAD（自己SHAはコミット前には確定できないため、GitHubブランチ履歴で確認）。直前HEAD：9db3e8b0c5ca9e705ade32cc43961edaa5b0d333。
利用枠残量は取得手段がないため短い単位で保存する。

## 2026-11-14再開
GitHub最新9db3e8bから再開。220候補・最終合格0を確認。F001の最新修正を維持。添付再送PDFのSHA256は前回と同一。PDF2〜20頁の実見分析を保存、残り18写真分析中。ソースはJSON最新を優先する。

## 2026-11-14 通常チャットでの引継ぎ
既存 `staging/building-author.py` に記載済みのオリジナル26問を `staging/building.json` に変換して保存。候補総数は246問（fire60 / building26 / law40 / activity50 / equipment45 / facilities25）。構造検査で26問すべて4択・各肢解説あり・正答インデックス有効・正答説明の形式一致を確認。これらも法令・難易度の最終審査前で、完成済み問題は0問。残り54問（building34、law20）。本番は未反映。
