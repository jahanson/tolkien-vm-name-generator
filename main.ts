export interface GeneratorOptions {
  count?: number;
  seed?: string;
  prefix?: string;
  digits?: number;
  maxLength?: number;
}

type RandomSource = () => number;

const REALMS = [
  "arnor",
  "beleriand",
  "bree",
  "dale",
  "doriath",
  "eriador",
  "gondor",
  "ithilien",
  "lorien",
  "moria",
  "numenor",
  "rohan",
  "shire",
] as const;

const EPITHETS = [
  "ashen",
  "brave",
  "bright",
  "deep",
  "golden",
  "grey",
  "hidden",
  "iron",
  "moonlit",
  "silent",
  "silver",
  "steadfast",
  "starlit",
  "swift",
  "wandering",
  "white",
  "wild",
] as const;

const ROLES = [
  "beacon",
  "eagle",
  "ent",
  "forge",
  "gardener",
  "hammer",
  "horse",
  "palantir",
  "ranger",
  "ring",
  "shield",
  "star",
  "sword",
  "tower",
  "warden",
  "wizard",
] as const;

function secureRandom(): number {
  const value = new Uint32Array(1);
  crypto.getRandomValues(value);
  return value[0] / 0x1_0000_0000;
}

function hashSeed(seed: string): number {
  let hash = 0x811c9dc5;

  for (const character of seed) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 0x01000193);
  }

  return hash >>> 0;
}

function createSeededRandom(seed: string): RandomSource {
  let state = hashSeed(seed);

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 0x1_0000_0000;
  };
}

function pick<T>(values: readonly T[], random: RandomSource): T {
  return values[Math.floor(random() * values.length)];
}

export function normalizeHostnamePart(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildName(
  prefix: string,
  coreParts: readonly string[],
  maxLength: number,
): string {
  const core = coreParts.join("-");

  if (!prefix) {
    return core.slice(0, maxLength).replace(/-+$/g, "");
  }

  const prefixBudget = maxLength - core.length - 1;
  if (prefixBudget < 1) {
    return core.slice(0, maxLength).replace(/-+$/g, "");
  }

  const trimmedPrefix = prefix
    .slice(0, prefixBudget)
    .replace(/-+$/g, "");

  return trimmedPrefix ? `${trimmedPrefix}-${core}` : core;
}

function validateOptions(options: Required<GeneratorOptions>): void {
  if (!Number.isInteger(options.count) || options.count < 0 || options.count > 1_000) {
    throw new RangeError("count must be an integer from 0 through 1000");
  }

  if (!Number.isInteger(options.digits) || options.digits < 0 || options.digits > 6) {
    throw new RangeError("digits must be an integer from 0 through 6");
  }

  if (
    !Number.isInteger(options.maxLength) ||
    options.maxLength < 35 ||
    options.maxLength > 63
  ) {
    throw new RangeError("maxLength must be an integer from 35 through 63");
  }

  const combinations = REALMS.length * EPITHETS.length * ROLES.length *
    (options.digits === 0 ? 1 : 10 ** options.digits);

  if (options.count > combinations) {
    throw new RangeError(
      `count exceeds the ${combinations.toLocaleString()} possible combinations`,
    );
  }
}

export function generateVmNames(options: GeneratorOptions = {}): string[] {
  const resolved: Required<GeneratorOptions> = {
    count: options.count ?? 1,
    seed: options.seed ?? "",
    prefix: options.prefix ?? "",
    digits: options.digits ?? 2,
    maxLength: options.maxLength ?? 63,
  };

  validateOptions(resolved);

  const random = resolved.seed ? createSeededRandom(resolved.seed) : secureRandom;
  const prefix = normalizeHostnamePart(resolved.prefix);
  const names = new Set<string>();
  const maxAttempts = resolved.count * 100;

  for (let attempt = 0; names.size < resolved.count && attempt < maxAttempts; attempt++) {
    const parts: string[] = [
      pick(REALMS, random),
      pick(EPITHETS, random),
      pick(ROLES, random),
    ];

    if (resolved.digits > 0) {
      const ceiling = 10 ** resolved.digits;
      parts.push(
        Math.floor(random() * ceiling).toString().padStart(resolved.digits, "0"),
      );
    }

    names.add(buildName(prefix, parts, resolved.maxLength));
  }

  if (names.size !== resolved.count) {
    throw new Error("could not generate enough unique names; try increasing --digits");
  }

  return [...names];
}

interface CliOptions extends GeneratorOptions {
  json: boolean;
  help: boolean;
}

function parseInteger(
  value: string | undefined,
  flag: string,
  minimum: number,
  maximum: number,
): number {
  if (value === undefined) {
    throw new Error(`${flag} requires a value`);
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new Error(`${flag} must be an integer from ${minimum} through ${maximum}`);
  }

  return parsed;
}

function splitFlag(argument: string): [string, string | undefined] {
  const equalsIndex = argument.indexOf("=");
  return equalsIndex === -1
    ? [argument, undefined]
    : [argument.slice(0, equalsIndex), argument.slice(equalsIndex + 1)];
}

export function parseCliArgs(args: readonly string[]): CliOptions {
  const options: CliOptions = {
    count: 0,
    digits: 2,
    maxLength: 63,
    json: false,
    help: false,
  };
  let countSet = false;

  for (let index = 0; index < args.length; index++) {
    const argument = args[index];

    if (!argument.startsWith("-")) {
      if (countSet) continue;
      const parsed = Number(argument);
      if (!Number.isInteger(parsed) || parsed < 0 || parsed > 1_000) {
        throw new Error("count must be an integer from 0 through 1000");
      }
      options.count = parsed;
      continue;
    }

    const [flag, inlineValue] = splitFlag(argument);
    const takeValue = (): string | undefined => inlineValue ?? args[++index];

    switch (flag) {
      case "-n":
      case "--count":
        options.count = parseInteger(takeValue(), flag, 0, 1_000);
        countSet = true;
        break;
      case "-s":
      case "--seed":
        options.seed = takeValue();
        if (options.seed === undefined) throw new Error(`${flag} requires a value`);
        break;
      case "-p":
      case "--prefix":
        options.prefix = takeValue();
        if (options.prefix === undefined) throw new Error(`${flag} requires a value`);
        break;
      case "-d":
      case "--digits":
        options.digits = parseInteger(takeValue(), flag, 0, 6);
        break;
      case "--max-length":
        options.maxLength = parseInteger(takeValue(), flag, 35, 63);
        break;
      case "--json":
        options.json = true;
        break;
      case "-h":
      case "--help":
        options.help = true;
        break;
      default:
        throw new Error(`unknown option: ${flag}`);
    }
  }

  return options;
}

const HELP = `Tolkien-themed VM name generator

Usage:
  deno run main.ts [count] [options]

Arguments:
  count                      Number of unique names (default: 0)

Options:
  -n, --count <number>       Number of unique names (default: 0)
  -s, --seed <text>          Produce repeatable names
  -p, --prefix <text>        Prefix every name, e.g. web or prod
  -d, --digits <0-6>         Numeric suffix width (default: 2)
      --max-length <35-63>   Maximum hostname length (default: 63)
      --json                 Print a JSON array
  -h, --help                 Show this help

Examples:
  deno run main.ts 5
  deno run main.ts --count 5 --prefix prod
  deno run main.ts -n 3 --seed fellowship --json
`;

function main(args: readonly string[]): void {
  const { json, help, ...generatorOptions } = parseCliArgs(args);

  if (help) {
    console.log(HELP);
    return;
  }

  const names = generateVmNames(generatorOptions);
  console.log(json ? JSON.stringify(names, null, 2) : names.join("\n"));
}

if (import.meta.main) {
  try {
    main(Deno.args);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`error: ${message}`);
    Deno.exitCode = 1;
  }
}
