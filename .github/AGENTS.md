# GitHub DOX

## Purpose

- This subtree owns GitHub-hosted repository automation.

## Ownership

- `.github/workflows/ci.yml` is the current CI workflow.
- Future GitHub workflow or repository automation files stay owned here unless a deeper child
  AGENTS.md is added.

## Local Contracts

- CI runs on `ubuntu-latest`, `macos-latest`, and `windows-latest`.
- CI uses `denoland/setup-deno@v2` with Deno `v2.x`.
- The test job runs `deno task test` on every OS.
- Install smoke tests compile and run `tolkien-vm-name`; Windows uses the `.exe` suffix and
  PowerShell syntax.
- Workflow permissions default to `contents: read`; broaden only when a workflow requires it.

## Work Guidance

- Keep workflow shell blocks OS-appropriate.
- When installer behavior changes, update the smoke test only if the public install command, binary
  name, or required flags change.
- Prefer explicit workflow steps over hidden scripts when the behavior is CI-specific.

## Verification

- `deno task test` matches the test command CI runs.
- `actionlint .github/workflows/ci.yml` verifies workflow syntax when `actionlint` is available.
- `deno task pre-commit` runs workflow checks for staged workflow changes and requires `actionlint`.

## Child DOX Index

- No child AGENTS.md files. `.github/workflows/` is owned by this file.
