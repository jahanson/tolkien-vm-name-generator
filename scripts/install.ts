type InstallOs = "darwin" | "linux" | "windows";
type Env = Record<string, string | undefined>;

interface InstallDirectoryOptions {
  env: Env;
  explicitDirectory?: string;
  existingDirectories?: ReadonlySet<string>;
  os: InstallOs;
}

interface InstallArgs {
  directory?: string;
  dryRun: boolean;
  help: boolean;
}

const APP_NAME = "tolkien-vm-name-generator";
const BINARY_NAME = "tolkien-vm-name";
const INSTALL_DIRECTORY_ENV = "TOLKIEN_VM_NAME_INSTALL_DIR";

function pathSeparator(os: InstallOs): string {
  return os === "windows" ? "\\" : "/";
}

function trimTrailingSeparators(path: string): string {
  if (/^[A-Za-z]:[\\/]?$/.test(path)) return path.replace(/\//g, "\\");
  if (path === "/" || path === "\\") return path;
  return path.replace(/[\\/]+$/g, "");
}

function trimSurroundingSeparators(path: string): string {
  return path.replace(/^[\\/]+|[\\/]+$/g, "");
}

function joinPath(os: InstallOs, first: string, ...parts: string[]): string {
  const separator = pathSeparator(os);
  const normalizedFirst = trimTrailingSeparators(first);
  const normalizedParts = parts
    .filter((part) => part.length > 0)
    .map(trimSurroundingSeparators);

  return [normalizedFirst, ...normalizedParts].join(separator);
}

function normalizeForComparison(path: string, os: InstallOs): string {
  const normalized = trimTrailingSeparators(path).replace(/[\\/]+/g, pathSeparator(os));
  return os === "windows" ? normalized.toLowerCase() : normalized;
}

function uniquePaths(paths: string[], os: InstallOs): string[] {
  const seen = new Set<string>();
  const unique: string[] = [];

  for (const path of paths) {
    const key = normalizeForComparison(path, os);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(path);
  }

  return unique;
}

function getPathValue(env: Env): string {
  return env.PATH ?? env.Path ?? env.path ?? "";
}

function getPathEntries(env: Env, os: InstallOs): string[] {
  const separator = os === "windows" ? ";" : ":";
  return getPathValue(env)
    .split(separator)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

function getHomeDirectory(env: Env, os: InstallOs): string {
  if (os === "windows") {
    if (env.USERPROFILE) return env.USERPROFILE;
    if (env.HOMEDRIVE && env.HOMEPATH) return `${env.HOMEDRIVE}${env.HOMEPATH}`;
  }

  if (env.HOME) return env.HOME;

  throw new Error(`could not determine home directory; pass --dir or set ${INSTALL_DIRECTORY_ENV}`);
}

function expandHome(path: string, env: Env, os: InstallOs): string {
  if (path === "~") return getHomeDirectory(env, os);
  if (path.startsWith("~/") || path.startsWith("~\\")) {
    return joinPath(os, getHomeDirectory(env, os), path.slice(2));
  }
  return path;
}

function optionalCandidate(value: string | undefined, os: InstallOs): string | undefined {
  if (!value) return undefined;
  return joinPath(os, value, "bin");
}

export function getBinaryName(os: InstallOs): string {
  return os === "windows" ? `${BINARY_NAME}.exe` : BINARY_NAME;
}

export function getDefaultInstallCandidates(options: {
  env: Env;
  os: InstallOs;
}): string[] {
  const { env, os } = options;
  const home = getHomeDirectory(env, os);
  const denoInstallBin = optionalCandidate(env.DENO_INSTALL, os);

  if (os === "windows") {
    return uniquePaths([
      joinPath(os, home, ".local", "bin"),
      joinPath(os, home, "bin"),
      joinPath(os, home, ".deno", "bin"),
      ...(denoInstallBin ? [denoInstallBin] : []),
      ...(env.LOCALAPPDATA ? [joinPath(os, env.LOCALAPPDATA, "Programs", APP_NAME, "bin")] : []),
    ], os);
  }

  return uniquePaths([
    ...(env.XDG_BIN_HOME ? [env.XDG_BIN_HOME] : []),
    joinPath(os, home, ".local", "bin"),
    joinPath(os, home, "bin"),
    joinPath(os, home, ".deno", "bin"),
    ...(denoInstallBin ? [denoInstallBin] : []),
  ], os);
}

export function resolveInstallDirectory(options: InstallDirectoryOptions): string {
  const { env, explicitDirectory, existingDirectories, os } = options;

  if (explicitDirectory?.trim()) {
    return expandHome(explicitDirectory.trim(), env, os);
  }

  if (env[INSTALL_DIRECTORY_ENV]?.trim()) {
    return expandHome(env[INSTALL_DIRECTORY_ENV].trim(), env, os);
  }

  const candidates = getDefaultInstallCandidates({ env, os });
  const pathEntries = new Set(
    getPathEntries(env, os).map((entry) => normalizeForComparison(entry, os)),
  );
  const existing = existingDirectories
    ? new Set(
      [...existingDirectories].map((entry) => normalizeForComparison(entry, os)),
    )
    : undefined;

  for (const candidate of candidates) {
    const key = normalizeForComparison(candidate, os);
    if (pathEntries.has(key) && existing?.has(key)) return candidate;
  }

  for (const candidate of candidates) {
    if (pathEntries.has(normalizeForComparison(candidate, os))) return candidate;
  }

  return candidates[0];
}

async function getExistingDirectories(paths: string[]): Promise<Set<string>> {
  const existing = new Set<string>();

  for (const path of paths) {
    try {
      const stat = await Deno.stat(path);
      if (stat.isDirectory) existing.add(path);
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) throw error;
    }
  }

  return existing;
}

function isDirectoryOnPath(directory: string, env: Env, os: InstallOs): boolean {
  const directoryKey = normalizeForComparison(directory, os);
  return getPathEntries(env, os).some((entry) =>
    normalizeForComparison(entry, os) === directoryKey
  );
}

function getPathAdvice(directory: string, os: InstallOs): string {
  if (os === "windows") {
    return `Add ${directory} to your user PATH, then open a new terminal.`;
  }

  return `Add this to your shell profile if needed: export PATH="${directory}:$PATH"`;
}

function parseInstallArgs(args: readonly string[]): InstallArgs {
  const options: InstallArgs = {
    dryRun: false,
    help: false,
  };

  for (let index = 0; index < args.length; index++) {
    const argument = args[index];

    if (argument === "--") {
      continue;
    }

    if (argument === "-h" || argument === "--help") {
      options.help = true;
      continue;
    }

    if (argument === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (argument === "--dir") {
      const value = args[++index];
      if (value === undefined) throw new Error("--dir requires a value");
      options.directory = value;
      continue;
    }

    if (argument.startsWith("--dir=")) {
      options.directory = argument.slice("--dir=".length);
      if (!options.directory) throw new Error("--dir requires a value");
      continue;
    }

    throw new Error(`unknown option: ${argument}`);
  }

  return options;
}

function formatCommand(args: readonly string[]): string {
  return args.map((arg) => arg.includes(" ") ? JSON.stringify(arg) : arg).join(" ");
}

async function runInstall(args: readonly string[]): Promise<void> {
  const parsed = parseInstallArgs(args);

  if (parsed.help) {
    console.log(`Install Tolkien-themed VM name generator

Usage:
  deno task install [-- --dir <path>] [--dry-run]

Options:
      --dir <path>            Install directory (default: common per-user bin path)
      --dry-run               Print what would be installed without compiling
  -h, --help                  Show this help

Environment:
  ${INSTALL_DIRECTORY_ENV}    Install directory override
`);
    return;
  }

  const env = Deno.env.toObject();
  const os = Deno.build.os as InstallOs;
  const candidates = getDefaultInstallCandidates({ env, os });
  const existingDirectories = await getExistingDirectories(candidates);
  const installDirectory = resolveInstallDirectory({
    env,
    existingDirectories,
    explicitDirectory: parsed.directory,
    os,
  });
  const outputPath = joinPath(os, installDirectory, getBinaryName(os));
  const entrypoint = new URL("../main.ts", import.meta.url).href;
  const compileArgs = ["compile", "--output", outputPath, entrypoint];

  if (parsed.dryRun) {
    console.log(`Install directory: ${installDirectory}`);
    console.log(`Binary path: ${outputPath}`);
    console.log(`Compile command: ${formatCommand([Deno.execPath(), ...compileArgs])}`);
    if (!isDirectoryOnPath(installDirectory, env, os)) {
      console.log(getPathAdvice(installDirectory, os));
    }
    return;
  }

  await Deno.mkdir(installDirectory, { recursive: true });

  const command = new Deno.Command(Deno.execPath(), {
    args: compileArgs,
    stderr: "piped",
    stdout: "piped",
  });
  const result = await command.output();

  if (result.stdout.length > 0) await Deno.stdout.write(result.stdout);
  if (result.stderr.length > 0) await Deno.stderr.write(result.stderr);

  if (result.code !== 0) {
    throw new Error(`deno compile failed with exit code ${result.code}`);
  }

  if (os !== "windows") {
    await Deno.chmod(outputPath, 0o755);
  }

  console.log(`Installed ${outputPath}`);
  if (!isDirectoryOnPath(installDirectory, env, os)) {
    console.log(getPathAdvice(installDirectory, os));
  }
}

if (import.meta.main) {
  try {
    await runInstall(Deno.args);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`error: ${message}`);
    Deno.exitCode = 1;
  }
}
