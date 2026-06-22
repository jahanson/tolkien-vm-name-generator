import assert from "node:assert/strict";
import { generateVmNames, normalizeHostnamePart, parseCliArgs } from "./main.ts";

Deno.test("default count is zero", () => {
  const options = parseCliArgs([]);
  assert.equal(options.count, 0);
});

Deno.test("positional count is parsed", () => {
  const options = parseCliArgs(["5"]);
  assert.equal(options.count, 5);
});

Deno.test("flag count overrides positional count", () => {
  const options = parseCliArgs(["5", "--count", "3"]);
  assert.equal(options.count, 3);
});

Deno.test("zero count returns empty array", () => {
  assert.deepEqual(generateVmNames({ count: 0 }), []);
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
