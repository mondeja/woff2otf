"use strict"

const fs = require('fs');
const zlib = require("zlib");

const struct = require("python-struct");

const woff2otf = function(infile, outfile) {
  const woffFile = fs.readFileSync(infile);
  const WOFFHeader = {
    "signature": struct.unpack(">I", woffFile.slice(0, 4))[0],
    "flavor": struct.unpack(">I", woffFile.slice(4, 8))[0],
    "length": struct.unpack(">I", woffFile.slice(8, 12))[0],
    "numTables": struct.unpack(">H", woffFile.slice(12, 14))[0],
    "reserved": struct.unpack(">H", woffFile.slice(14, 16))[0],
    'totalSfntSize': struct.unpack(">I", woffFile.slice(16, 20))[0],
    "majorVersion": struct.unpack(">H", woffFile.slice(20, 22))[0],
    "minorVersion": struct.unpack(">H", woffFile.slice(22, 24))[0],
    "metaOffset": struct.unpack(">I", woffFile.slice(24, 28))[0],
    "metaLength": struct.unpack(">I", woffFile.slice(28, 32))[0],
    "metaOrigLength": struct.unpack(">I", woffFile.slice(32, 36))[0],
    "privOffset": struct.unpack(">I", woffFile.slice(36, 40))[0],
    "privLength": struct.unpack(">I", woffFile.slice(40, 44))[0],
  };

  const flavorB = struct.pack(">I", WOFFHeader['flavor']);
  const numTablesB = struct.pack(">H", WOFFHeader['numTables']);
  fs.appendFileSync(outfile, flavorB);
  fs.appendFileSync(outfile, numTablesB);

  let maximum = null;
  for (let n=0; n<64; n++) {
    if (2**n > WOFFHeader['numTables']) {
      break
    } else {
      maximum = [n, 2**n];
    }
  }

  const searchRange = maximum[1] * 16;
  const searchRangeB = struct.pack(">H", searchRange);
  fs.appendFileSync(outfile, searchRangeB);

  const entrySelector = maximum[0]
  const entrySelectorB = struct.pack(">H", entrySelector);
  fs.appendFileSync(outfile, entrySelectorB);

  const rangeShift = WOFFHeader['numTables'] * 16 - searchRange;
  const rangeShiftB = struct.pack(">H", rangeShift);
  fs.appendFileSync(outfile, rangeShiftB);
  
  
  let offset = (
    flavorB.byteLength + numTablesB.byteLength + searchRangeB.byteLength +
    entrySelectorB.byteLength + rangeShiftB.byteLength
  )
  
  const tableDirectoryEntries = [];
  for (let i=0; i<WOFFHeader['numTables']; i++) {
    tableDirectoryEntries.push({
      "tag": struct.unpack(">I", woffFile.slice(44 + i * 20, 48 + i * 20)),
      "offset": struct.unpack(">I", woffFile.slice(48 + i * 20, 52 + i * 20))[0],
      "compLength": struct.unpack(">I", woffFile.slice(52 + i * 20, 56 + i * 20))[0],
      "origLength": struct.unpack(">I", woffFile.slice(56 + i * 20, 60 + i * 20))[0],
      "origChecksum": struct.unpack(">I", woffFile.slice(60 + i * 20, 64 + i * 20))[0],
    })
    offset += 4 * 4
  }
  
  for (let i=0; i<tableDirectoryEntries.length; i++) {
    let tableDirectoryEntry = tableDirectoryEntries[i];
    fs.appendFileSync(outfile, struct.pack(">I", tableDirectoryEntry['tag']));
    fs.appendFileSync(outfile, struct.pack(">I", tableDirectoryEntry['origChecksum']));
    fs.appendFileSync(outfile, struct.pack(">I", offset));
    fs.appendFileSync(outfile, struct.pack(">I", tableDirectoryEntry['origLength']));
    tableDirectoryEntry["outOffset"] = offset;
    offset += tableDirectoryEntry['origLength'];
    if ((offset % 4) != 0) {
      offset += 4 - (offset % 4)
    }
  }
  
  for (let i=0; i<tableDirectoryEntries.length; i++) {
    let tableDirectoryEntry = tableDirectoryEntries[i];
    let compressedData = woffFile.slice(
      tableDirectoryEntry['offset'],
      tableDirectoryEntry['offset'] + tableDirectoryEntry['compLength'],
    );
    let uncompressedData;
    if (tableDirectoryEntry["compLength"] != tableDirectoryEntry["origLength"]) {
      uncompressedData = zlib.inflateSync(compressedData);
    } else {
      uncompressedData = compressedData;
    }
    fs.appendFileSync(outfile, uncompressedData);
    offset = tableDirectoryEntry['outOffset'] + tableDirectoryEntry['origLength'];
    
    let padding = 0
    if ((offset % 4) != 0) {
      padding = 4 - (offset % 4)
    }
    fs.appendFileSync(outfile, Buffer.alloc(padding));
  }
}

if (fs.existsSync("SimpleIcons2.otf")) {
  fs.unlinkSync("SimpleIcons2.otf");
}
woff2otf("SimpleIcons.woff", "SimpleIcons2.otf");