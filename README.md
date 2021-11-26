# dcc-pdf-tools

This is a JavaScript library for generating PDFs for (static) Dutch `domestic` and `european` signed proofs.

## Usage

1. Follow the instruction for [installing an npm package from GitHub Packages](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#installing-a-package), adding the `91divoc-ln` owner to your project's `.npmrc`:
    ```
    @91divoc-ln:registry=https://npm.pkg.github.com
    ```
2. Install and import the `@91divoc-ln/dcc-pdf-tools` package.

### In Node.js

Usage in Node.js requires polyfills for `atob` and `DOMParser`. Be sure to polyfill these before `require`ing or `import()`ing from `dcc-pdf-tools`.

E.g. using `jsdom`:

```js
const JSDOM = require("jsdom").JSDOM;
const jsdomWindow = new JSDOM().window;
global.atob = jsdomWindow.atob;
global.DOMParser = jsdomWindow.DOMParser;

const { parseProofData, getDocument } = require("dcc-pdf-tools");
```

Note: when using ES modules, it's important to use the async `import()`, as static `import`s would cause the code to be evaluated at load time, before the polyfills are installed.

## License

This project is licensed under the `EUPL-1.2`. See [LICENSE](./LICENSE).
