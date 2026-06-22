import assert from "node:assert/strict";
import { generateVmNames, normalizeHostnamePart, parseCliArgs } from "./main.ts";

Deno.test("default count is one", () => {
  const options = parseCliArgs([]);
  assert.equal(options.count, 1);
});

Deno.test("numeric suffixes are disabled by default in CLI options", () => {
  const options = parseCliArgs([]);
  assert.equal(options.digits, 0);
});

Deno.test("default count generates one name", () => {
  assert.equal(generateVmNames({ seed: "default-one" }).length, 1);
});

Deno.test("generated names do not include numeric suffixes by default", () => {
  const [name] = generateVmNames({ seed: "default-no-digits" });
  assert.doesNotMatch(name, /-\d+$/);
});

Deno.test("numeric suffixes can be enabled with digits", () => {
  const [name] = generateVmNames({ seed: "digits-enabled", digits: 2 });
  assert.match(name, /-\d{2}$/);
});

Deno.test("positional count is parsed", () => {
  const options = parseCliArgs(["5"]);
  assert.equal(options.count, 5);
});

Deno.test("flag count overrides positional count", () => {
  const options = parseCliArgs(["5", "--count", "3"]);
  assert.equal(options.count, 3);
});

Deno.test("seeded output is repeatable", () => {
  const first = generateVmNames({ count: 5, seed: "fellowship" });
  const second = generateVmNames({ count: 5, seed: "fellowship" });
  assert.deepEqual(first, second);
});

Deno.test("generated names are VM-safe DNS labels", () => {
  const names = generateVmNames({
    count: 100,
    seed: "second-breakfast",
    prefix: "Production Web",
  });

  for (const name of names) {
    assert.match(name, /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/);
    assert.ok(name.length <= 63);
  }
});

Deno.test("prefixes are normalized", () => {
  assert.equal(normalizeHostnamePart("  Dév API!  "), "dev-api");
});
