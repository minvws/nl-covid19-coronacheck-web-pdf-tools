# nl-covid19-coronacheck-web-pdf-tools

This is a JavaScript library for generating PDFs for (static) Dutch `domestic` and `european` signed proofs.

## Usage

Use this repository's `git:` URL to install the package in your project:

```sh
npm install "https://github.com/minvws/nl-covid19-coronacheck-web-pdf-tools.git#VERSION"
```

Replace `VERSION` with the tag name of the [latest release](https://github.com/minvws/nl-covid19-coronacheck-web-pdf-tools/releases/latest).

### In Node.js

Usage in Node.js requires polyfills for `atob` and `DOMParser`. Be sure to polyfill these before `require`ing or `import()`ing from `nl-covid19-coronacheck-web-pdf-tools`.

E.g. using `jsdom`:

```js
const JSDOM = require("jsdom").JSDOM;
const jsdomWindow = new JSDOM().window;
global.atob = jsdomWindow.atob;
global.DOMParser = jsdomWindow.DOMParser;

const { parseProofData, getDocument } = require("nl-covid19-coronacheck-web-pdf-tools");
```

Note: when using ES modules, it's important to use the async `import()`, as static `import`s would cause the code to be evaluated at load time, before the polyfills are installed.

## Upgrade

Please refer to the [upgrade guide](documentation/upgrade_guide.md)

## License

This project is licensed under the `EUPL-1.2`. See [LICENSE](./LICENSE).
