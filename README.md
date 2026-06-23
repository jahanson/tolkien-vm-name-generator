# Tolkien-themed VM name generator

A dependency-free Deno CLI that generates memorable, lowercase, DNS-label-friendly VM names.

## Run

Default is 5 names:

```sh
deno task names
```

Override the count:

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

## Install

Build a self-contained binary with `deno compile` and install it to a common per-user bin directory:

```sh
deno task install
```

Default install locations:

- Linux/macOS: `~/.local/bin/tolkien-vm-name`
- Windows: `%USERPROFILE%\.local\bin\tolkien-vm-name.exe`

Use a custom directory when you prefer another user-local bin path:

```sh
deno task install -- --dir ~/bin
```

Preview the install without compiling:

```sh
deno task install -- --dry-run
```

## Test, compile, and install

```sh
deno task test
deno task check
deno task compile
deno task install
```
