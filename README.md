# woff2otf

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
