# woff2otf

[![NPM version][npm-version-image]][npm-link]
[![License][license-image]][license-link]
[![CI][ci-image]][ci-link]

Convert WOFF font files to OTF using NodeJS.

## Installation

```bash
npm install woff2otf
```

## Usage

### CLI

```bash
woff2otf fontToConvert.woff outputFont.otf
```

WARNING: if the output file exists will be overwritten!

### NodeJS

```javascript
const fs = require('fs');
const woff2otf = require('woff2otf');

const woffFileBuffer = fs.readFileSync('path/to/file.woff');
const otfFileBuffer = woff2otf(woffFileBuffer);
fs.writeFileSync('path/to/file.otf', otfFileBuffer);
```

## Thanks to

- [@hanikesn](https://github.com/hanikesn) because this program is a port from Python of [hanikesn/woff2otf](https://github.com/hanikesn/woff2otf).

[npm-link]: https://www.npmjs.com/package/woff2otf
[npm-version-image]: https://img.shields.io/npm/v/woff2otf
[license-image]: https://img.shields.io/npm/l/woff2otf?color=brightgreen
[license-link]: https://github.com/mondeja/woff2otf/blob/master/LICENSE
[ci-image]: https://img.shields.io/github/workflow/status/mondeja/woff2otf/CI
[ci-link]: https://github.com/mondeja/woff2otf/actions?query=workflow%3ACI
