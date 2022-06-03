# minifier-test-script

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
