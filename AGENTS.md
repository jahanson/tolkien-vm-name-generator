# DOX framework

- DOX is the AGENTS.md hierarchy installed here.
- Agent work must follow the nearest applicable AGENTS.md plus every parent above it.

## Purpose

- This repository is a dependency-free Deno CLI and library for generating lowercase,
  DNS-label-friendly Tolkien-themed VM names.
- The public code surface is `main.ts`; the installer surface is owned by `scripts/AGENTS.md`.

## Ownership

- Root owns project-wide behavior, Deno tasks, README usage, `.gitignore`, `.vscode/settings.json`,
  `main.ts`, and `main_test.ts`.
- Root owns ignored compiled output such as `tolkien-vm-name`; regenerate it with
  `deno task compile` instead of editing it directly.
- Child AGENTS.md files own their listed subtrees and local contracts.

## Core Contract

- AGENTS.md files are binding work contracts for their subtrees.
- Work products, source materials, instructions, records, assets, and durable docs must stay
  understandable from the nearest applicable AGENTS.md plus every parent AGENTS.md above it.

## Read Before Editing

1. Read the root AGENTS.md.
2. Identify every file or folder you expect to touch.
3. Walk from the repository root to each target path.
4. Read every AGENTS.md found along each route.
5. If a parent AGENTS.md lists a child AGENTS.md whose scope contains the path, read that child and
   continue from there.
6. Use the nearest AGENTS.md as the local contract and parent docs for repo-wide rules.
7. If docs conflict, the closer doc controls local work details, but no child doc may weaken DOX.

Do not rely on memory. Re-read the applicable DOX chain in the current session before editing.

## Update After Editing

Every meaningful change requires a DOX pass before the task is done.

Update the closest owning AGENTS.md when a change affects:

- purpose, scope, ownership, or responsibilities
- durable structure, contracts, workflows, or operating rules
- required inputs, outputs, permissions, constraints, side effects, or artifacts
- user preferences about behavior, communication, process, organization, or quality
- AGENTS.md creation, deletion, move, rename, or index contents

Update parent docs when parent-level structure, ownership, workflow, or child index changes. Update
child docs when parent changes alter local rules. Remove stale or contradictory text immediately.
Small edits that do not change behavior or contracts may leave docs unchanged, but the DOX pass
still must happen.

## Hierarchy

- Root AGENTS.md is the DOX rail: project-wide instructions, global preferences, durable workflow
  rules, and the top-level Child DOX Index.
- Child AGENTS.md files own domain-specific instructions and their own Child DOX Index.
- Each parent explains what its direct children cover and what stays owned by the parent.
- The closer a doc is to the work, the more specific and practical it must be.

## Child Doc Shape

- Create a child AGENTS.md when a folder becomes a durable boundary with its own purpose, rules,
  responsibilities, workflow, materials, or quality standards.
- Work Guidance must reflect the current standards of the project or user instructions; if there are
  no specific standards or instructions yet, leave it empty.
- Verification must reflect an existing check; if no verification framework exists yet, leave it
  empty and update it when one exists.

Default section order:

- Purpose
- Ownership
- Local Contracts
- Work Guidance
- Verification
- Child DOX Index

## Local Contracts

- Use Deno 2 tasks from `deno.json`; do not introduce Node package-manager workflows unless the
  project intentionally changes toolchains.
- Keep `main.ts` dependency-free and usable as both CLI and library.
- `parseCliArgs([])` defaults the CLI count to 5; `generateVmNames()` defaults the library count to
  1. Preserve that distinction unless intentionally changing both contracts.
- Generated hostnames must remain lowercase DNS labels, trim trailing hyphens, and stay within the
  configured 35-63 character maximum.
- Numeric suffixes are opt-in: CLI and library defaults use `digits: 0`.
- Seeded generation must remain deterministic for repeatable output and tests.

## Work Guidance

- Prefer focused tests in `main_test.ts` for CLI parsing, normalization, validation, and generator
  behavior changes.
- Keep README examples aligned with `deno task names`, `deno task test`, `deno task check`,
  `deno task compile`, and `deno task install`.
- Avoid editing ignored build artifacts; update source and regenerate when needed.

## Verification

- `deno task test` runs the Deno test suite.
- `deno task check` runs formatting, linting, and type checks.
- `deno task compile` verifies the standalone binary can be built.
- `deno task pre-commit` runs staged-file checks through `xtasks/pre-commit`.

## User Preferences

- When the user requests a durable behavior change, record it here or in the relevant child
  AGENTS.md.

## Child DOX Index

- `.github/AGENTS.md` owns GitHub Actions workflows and repository automation under `.github/`.
- `scripts/AGENTS.md` owns the installer implementation, installer tests, and hook shims under
  `scripts/`.
- `xtasks/AGENTS.md` owns local task scripts under `xtasks/`, including staged pre-commit routing.
