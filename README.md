# minifier-test-script

`try.mjs` is a script to help debugging swc minifier.
The script creates a commit for each combination of minifier options.
It first disables one option at a time, and it then disables two options at a time.

If your app is broken with default config but it works with specific option disabled, it means there's a bug related to the specific option.
The swc minifier is 20K+ LoCs so looking at all code is impractical, but if the scope is reduced to a single option, we can debug it.

## Options

```
--dry-run                       Show operations without actually applying it.
--upstream-branch=<name>        Use <name> as the name of upstream branch.
--project-dir=<path/to/dir>     Run operations in <path/to/dir>. Useful for monorepos.
```

## Steps

### 1. Modify `next.config.js`

Add

```js
const compressConfig = require("./swc-compress.json");
```

to the top and add

```js
{
  experimental: {
    swcMinifyDebugOptions: {
      compress: compressConfig;
    }
  }
}
```

to your export.

### 2. Run script

Run `try.mjs` using absolute path, like `~/src/minifier-test-script/try.mjs`.
