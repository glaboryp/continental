# SDD ledger — plan: /home/gloria/p/personal/continental/docs/superpowers/plans/2026-09-25-test-coverage.md

## Pre-flight review

| Tasks / interface | Finding | Ruling |
| --- | --- | --- |
| 1 → 2–6 / `pnpm test` coverage gate | Task 1 intentionally makes the suite fail until later tasks add coverage. | Run scoped test commands before the final full suite; this is necessary to make the gate enforceable. |
| 1 → 6 / CI test command | Task 1 makes `pnpm test` enforce coverage; Task 6 preserves the existing CI command. | No workflow command change is required unless coverage configuration exposes an actual CI incompatibility. |
| 2 → 3–5 / real Pinia store | Utility/store tests create the isolated real-store pattern consumed by all component tests. | Use shared test setup helpers only if duplication makes tests less clear; do not mock domain logic. |
| 3–5 / component coverage | Component tasks cover different source files but share Pinia and jsdom setup. | Implement sequentially to avoid overlapping configuration and coverage thresholds. |

Task 1: Ruling: scoped commands may fail global thresholds before all source tests exist — this is expected and costs only interim red output.

## Task 1 report

- Files changed: `package.json`, `pnpm-lock.yaml`, `vite.config.js`, `.gitignore`, `README.md`.
- Verification: baseline `pnpm test` passed (3 files, 17 tests); after adding `--coverage`, `pnpm test` failed as expected for the missing V8 provider; after installation/configuration it ran 17 passing tests and failed the required 100% thresholds (29.71% lines, 28.02% statements, 30.3% functions, 19.2% branches), listing uncovered `src` files. `pnpm build` and `git diff --check` passed.
- Commit: `2ad8f08` (`test: enforce source coverage thresholds`).
- Concerns: `pnpm lint` exits 0 but reports one pre-existing/generated warning from `coverage/block-navigation.js` after coverage output exists. The full coverage command is intentionally red until Tasks 2–5 add source coverage.

## Independent review — Task 1

- Verdict: **APPROVED**
- Reviewed commit `2ad8f08` against its parent and the binding Task 1 plan/spec.
- Evidence: `package.json` runs `vitest run --coverage`; `vite.config.js` uses V8 coverage for `src/**/*.{js,vue}`, excludes only `src/**/*.test.js`, emits text/HTML reports, and sets all four global thresholds to exactly `100`; `.gitignore` ignores `coverage`.
- Verification: `pnpm test` executed the coverage gate, passed all 17 existing tests, and correctly failed the 100% thresholds with currently uncovered source files, as Task 1 explicitly expects before Tasks 2–5.

Task 1: complete (commits faa4d9b..2ad8f08, review clean)
Ruling: add `coverage/**` to ESLint ignores in Task 6 — generated HTML/JavaScript is outside source lint scope; without this, a local coverage run creates irrelevant lint warnings. Cost if wrong: generated output could hide future lint warnings.
Ruling: use `--coverage.enabled=false` for task-scoped functional test commands until Task 5 supplies full source coverage; the final `pnpm test` remains the strict coverage gate. Cost if wrong: interim task verification could falsely appear blocked by unrelated uncovered files.

## Task 2 report

- Files changed: `src/utils/defaultRounds.test.js`, `src/utils/scoring.test.js`, `src/utils/id.test.js`, `src/stores/game.test.js`.
- Verification: `pnpm vitest run src/utils/scoring.test.js src/utils/defaultRounds.test.js src/utils/id.test.js src/stores/game.test.js --coverage.enabled=false` passed (4 files, 37 tests). `pnpm vitest run src/utils src/stores --coverage.enabled=true` passed all 37 tests; utility and store files reached 100% for lines, statements, functions, and branches. The command exited 1 only because globally instrumented, later-task source files remain uncovered (39.75% lines, 40.83% statements, 45.45% functions, 35.02% branches).
- Commit: `6d54391` (`test: cover game state and utility branches`).
- Concerns: the strict global coverage command remains intentionally red until Tasks 3–5 cover Vue components, `App.vue`, and `main.js`.

## Independent review — Task 2

- Verdict: **APPROVED**
- Critical findings: none.
- Important findings: none.
- Minor findings: none.
- Evidence: the commit changes only the four Task 2 test files, so it introduces no production implementation compromise. The tests exercise both `createId` paths, valid/malformed/absent persisted state, all game store getter/action branches, both `confirmRound` outcomes, score creation/overwrite/clearing, and zero/nonzero mid-game joins. V8 reports 100% statements, branches, functions, and lines for `src/stores/game.js` (100/100, 56/56, 34/34, 82/82) and all three utility modules.
- Verification: `pnpm vitest run src/utils/scoring.test.js src/utils/defaultRounds.test.js src/utils/id.test.js src/stores/game.test.js --coverage.enabled=false` passed (4 files, 37 tests). `pnpm vitest run src/utils src/stores --coverage` executed all 37 tests successfully; its process exit is expected to be nonzero because the binding global 100% threshold also instruments later-task component, app, and entry-point files. `pnpm lint` reported no errors and one pre-existing generated-coverage warning.

Task 2: complete (commits 2ad8f08..6d54391, review clean)

## Task 3 report

- Files changed: `src/components/PlayerSetup.test.js`, `src/components/RoundSetup.test.js`.
- Verification: `pnpm vitest run src/components/PlayerSetup.test.js src/components/RoundSetup.test.js --coverage.enabled=false` passed (2 files, 12 tests). The full functional suite, `pnpm vitest run --coverage.enabled=false`, passed (6 files, 49 tests). The coverage-enabled component run executed all 12 tests and reached 100% lines, statements, functions, and branches for both setup components; its exit was expectedly nonzero because later-task source files remain globally uncovered (44.97% lines, 44.98% statements, 45.45% functions, 49.15% branches).
- Commit: `2c4d775` (`test: cover player and round setup flows`).
- Concerns: `pnpm lint` exits 0 with the pre-existing generated `coverage/block-navigation.js` unused-disable warning. The strict global coverage gate remains intentionally red until Tasks 4–5 cover the remaining components, app shell, and entry point.
