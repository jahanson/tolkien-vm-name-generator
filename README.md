# Tolkien-themed VM name generator

A dependency-free Deno CLI that generates memorable, lowercase, DNS-label-friendly VM names.

## Run

```sh
deno task names 5 --prefix prod
```

Add numeric suffixes when you want extra combinations:

```sh
deno task names 5 --prefix prod --digits 2
```

Repeatable output:

```sh
deno task names 3 --seed fellowship --json
```

## Test and compile

```sh
deno task test
deno task check
deno task compile
```
