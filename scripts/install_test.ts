import assert from "node:assert/strict";
import { getBinaryName, getDefaultInstallCandidates, resolveInstallDirectory } from "./install.ts";

Deno.test("uses .local/bin as the default Linux user install directory", () => {
  const candidates = getDefaultInstallCandidates({
    os: "linux",
    env: {
      HOME: "/home/ada",
      PATH: "/usr/local/bin:/usr/bin",
    },
  });

  assert.equal(candidates[0], "/home/ada/.local/bin");
});

Deno.test("uses .local/bin as the default macOS user install directory", () => {
  const candidates = getDefaultInstallCandidates({
    os: "darwin",
    env: {
      HOME: "/Users/ada",
      PATH: "/opt/homebrew/bin:/usr/local/bin:/usr/bin",
    },
  });

  assert.equal(candidates[0], "/Users/ada/.local/bin");
});

Deno.test("uses a Windows user-local bin directory and exe suffix", () => {
  const candidates = getDefaultInstallCandidates({
    os: "windows",
    env: {
      USERPROFILE: "C:\\Users\\Ada",
      Path: "C:\\Windows\\System32",
    },
  });

  assert.equal(candidates[0], "C:\\Users\\Ada\\.local\\bin");
  assert.equal(getBinaryName("windows"), "tolkien-vm-name.exe");
});

Deno.test("chooses an existing candidate already on PATH", () => {
  const directory = resolveInstallDirectory({
    os: "linux",
    env: {
      HOME: "/home/ada",
      PATH: "/home/ada/bin:/usr/bin",
    },
    existingDirectories: new Set(["/home/ada/bin"]),
  });

  assert.equal(directory, "/home/ada/bin");
});

Deno.test("explicit install directory overrides defaults", () => {
  const directory = resolveInstallDirectory({
    os: "linux",
    env: {
      HOME: "/home/ada",
      PATH: "/usr/bin",
    },
    explicitDirectory: "~/tools",
  });

  assert.equal(directory, "/home/ada/tools");
});
