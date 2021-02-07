#!/usr/bin/env node
'use strict';

/* eslint no-process-exit: 0 */
/* eslint global-require: 0 */

if (require.main === module) {
  let sliceN = 1;
  if (process.argv.indexOf(module.filename) > -1 || require('path').basename(process.argv[1]) === 'woff2otf') {
    sliceN = 2;
  }
  const args = process.argv.slice(sliceN, process.argv.length);

  if (args.length !== 2) {
    console.error('You must pass a WOFF font to convert and an output OTF file path');
    process.exit(1);
  }

  const fs = require('fs');
  const woff2otf = require('./woff2otf');
  console.log(woff2otf);

  if (fs.existsSync(args[1])) {
    fs.unlinkSync(args[1]);
  }

  const woffFileB = fs.readFileSync(args[0]);

  const otfFileB = woff2otf(woffFileB);
  fs.writeFileSync(args[1], otfFileB);
}
