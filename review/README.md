# Automated exam-question review

Workflow: Actions > Evidence-gated AI question review > Run workflow.

1. Set OPENAI_API_KEY in repository Settings > Secrets and variables > Actions.
2. Populate review/evidence.json with **verified official-source excerpts**. Each entry must include id, title, url, excerpt, and question_ids (e.g. ["L001"]).
3. Run 20 questions at a time, starting at 0, 20, 40, ... 240.
4. Download the review-candidates artifact. Every candidate requires independent factual review before publication.

The 28-page reference book is not imported into this repository. Do not upload copyrighted scans to a public repository without authorization.

**Safety:** This workflow never edits questions.js, never publishes changes, and never merges PRs. Without evidence it fails closed. AI suggestions are not proof of legal correctness.

**Costs:** API charges are usage-based; this initial scaffold has NO hard spending cap. Set an API project budget before running. GitHub standard hosted Actions are free for public repositories.
