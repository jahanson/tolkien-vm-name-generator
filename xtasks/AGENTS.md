# Xtasks DOX

## Purpose

- This subtree owns local repository task scripts.

## Ownership

- `pre-commit` is the staged-file pre-commit task used by `deno task pre-commit` and the hook shim
  in `scripts/hooks/pre-commit`.

## Local Contracts

- `xtasks/pre-commit` runs from the repository root and inspects staged, non-deleted files.
- It always runs `deno fmt --check` when staged files exist.
- Staged TypeScript or JavaScript changes run `deno task check` and `deno task test`.
- Staged Deno config or TOML changes run `deno task check`.
- Staged GitHub Actions workflow changes require `actionlint`; `shellcheck` is used with
  `actionlint` when available.
- Staged shell script changes require both `shellcheck` and `shfmt`.
- Tool discovery checks common mise install paths before falling back to `PATH`.

## Work Guidance

- Keep staged-file routing explicit by file type or path.
- Preserve `set -euo pipefail` and the repository-root `cd`.
- Keep checks proportional, but do not silently skip validation for file types that already have a
  configured checker.

## Verification

- `bash -n xtasks/pre-commit` validates shell syntax.
- `shellcheck xtasks/pre-commit` checks shell issues when `shellcheck` is available.
- `shfmt -d xtasks/pre-commit` checks shell formatting when `shfmt` is available.
- `deno task pre-commit` exercises the script against currently staged files.

## Child DOX Index

- No child AGENTS.md files.
