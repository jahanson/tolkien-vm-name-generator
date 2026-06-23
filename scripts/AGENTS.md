# Scripts DOX

## Purpose

- This subtree owns install-time tooling and script entrypoints that support the CLI.

## Ownership

- `install.ts` implements `deno task install`.
- `install_test.ts` tests installer path selection and binary naming.
- `hooks/pre-commit` is the Git hook shim that delegates to `xtasks/pre-commit`.

## Local Contracts

- `deno task install` runs `scripts/install.ts` with `--allow-env`, `--allow-read`, `--allow-write`,
  and `--allow-run`.
- The installer compiles `main.ts` through `deno compile` and writes `tolkien-vm-name` or
  `tolkien-vm-name.exe`.
- `--dir` overrides the install directory; `TOLKIEN_VM_NAME_INSTALL_DIR` is the environment
  fallback.
- `--dry-run` prints the selected install directory, binary path, and compile command without
  compiling or creating directories.
- Keep `getBinaryName`, `getDefaultInstallCandidates`, and `resolveInstallDirectory` exported for
  tests.
- Hook business logic belongs in `xtasks/pre-commit`; `scripts/hooks/pre-commit` should stay a
  repo-root delegation shim.

## Work Guidance

- Keep installer logic dependency-free and cross-platform.
- Test OS-specific path behavior with pure functions before relying on host-specific integration
  behavior.
- When compile arguments, binary naming, or install location rules change, update README examples
  and CI smoke tests if their public behavior changes.

## Verification

- `deno task test` runs installer tests with the rest of the suite.
- `deno task check` type-checks `scripts/install.ts` and `scripts/install_test.ts`.
- `deno task install -- --dry-run` checks install command resolution without writing output.
- For install behavior changes, run `deno task install -- --dir <temp-dir>` and execute the
  resulting binary when a real compile smoke test is needed.

## Child DOX Index

- No child AGENTS.md files. `scripts/hooks/` is owned here because it only contains hook shims.
