'use strict';

const zlib = require('zlib');

const struct = require('python-struct');

const woff2otf = function (woffFileB) {
  const WOFFHeader = {
    'signature': struct.unpack('>I', woffFileB.slice(0, 4))[0],
    'flavor': struct.unpack('>I', woffFileB.slice(4, 8))[0],
    'length': struct.unpack('>I', woffFileB.slice(8, 12))[0],
    'numTables': struct.unpack('>H', woffFileB.slice(12, 14))[0],
    'reserved': struct.unpack('>H', woffFileB.slice(14, 16))[0],
    'totalSfntSize': struct.unpack('>I', woffFileB.slice(16, 20))[0],
    'majorVersion': struct.unpack('>H', woffFileB.slice(20, 22))[0],
    'minorVersion': struct.unpack('>H', woffFileB.slice(22, 24))[0],
    'metaOffset': struct.unpack('>I', woffFileB.slice(24, 28))[0],
    'metaLength': struct.unpack('>I', woffFileB.slice(28, 32))[0],
    'metaOrigLength': struct.unpack('>I', woffFileB.slice(32, 36))[0],
    'privOffset': struct.unpack('>I', woffFileB.slice(36, 40))[0],
    'privLength': struct.unpack('>I', woffFileB.slice(40, 44))[0],
  };

  const flavorB = struct.pack('>I', WOFFHeader['flavor']);
  const numTablesB = struct.pack('>H', WOFFHeader['numTables']);

  let maximum = null;
  for (let n = 0; n < 64; n++) {
    if (Math.pow(2, n) > WOFFHeader['numTables']) {
      break;
    } else {
      maximum = [n, Math.pow(2, n)];
    }
  }

  const searchRange = maximum[1] * 16;
  const searchRangeB = struct.pack('>H', searchRange);

  const entrySelector = maximum[0];
  const entrySelectorB = struct.pack('>H', entrySelector);

  const rangeShift = WOFFHeader['numTables'] * 16 - searchRange;
  const rangeShiftB = struct.pack('>H', rangeShift);

  let otfFileB = Buffer.concat([
    flavorB, numTablesB, searchRangeB, entrySelectorB, rangeShiftB,
  ]);


  let offset = (
    flavorB.byteLength + numTablesB.byteLength + searchRangeB.byteLength +
    entrySelectorB.byteLength + rangeShiftB.byteLength
  );

  const tableDirectoryEntries = [];
  for (let i = 0; i < WOFFHeader['numTables']; i++) {
    tableDirectoryEntries.push({
      'tag': struct.unpack('>I', woffFileB.slice(44 + i * 20, 48 + i * 20)),
      'offset': struct.unpack('>I', woffFileB.slice(48 + i * 20, 52 + i * 20))[0],
      'compLength': struct.unpack('>I', woffFileB.slice(52 + i * 20, 56 + i * 20))[0],
      'origLength': struct.unpack('>I', woffFileB.slice(56 + i * 20, 60 + i * 20))[0],
      'origChecksum': struct.unpack('>I', woffFileB.slice(60 + i * 20, 64 + i * 20))[0],
    });
    offset += 4 * 4;
  }

  for (let i = 0; i < tableDirectoryEntries.length; i++) {
    const tableDirectoryEntry = tableDirectoryEntries[i];
    otfFileB = Buffer.concat([
      otfFileB,
      struct.pack('>I', tableDirectoryEntry['tag']),
      struct.pack('>I', tableDirectoryEntry['origChecksum']),
      struct.pack('>I', offset),
      struct.pack('>I', tableDirectoryEntry['origLength']),
    ]);

    tableDirectoryEntry['outOffset'] = offset;
    offset += tableDirectoryEntry['origLength'];
    if ((offset % 4) !== 0) {
      offset += 4 - (offset % 4);
    }
  }

  for (let i = 0; i < tableDirectoryEntries.length; i++) {
    const tableDirectoryEntry = tableDirectoryEntries[i];
    const compressedData = woffFileB.slice(
      tableDirectoryEntry['offset'],
      tableDirectoryEntry['offset'] + tableDirectoryEntry['compLength']
    );
    let uncompressedData;
    if (tableDirectoryEntry['compLength'] !== tableDirectoryEntry['origLength']) {
      uncompressedData = zlib.inflateSync(compressedData);
    } else {
      uncompressedData = compressedData;
    }
    offset = tableDirectoryEntry['outOffset'] + tableDirectoryEntry['origLength'];

    let padding = 0;
    if ((offset % 4) !== 0) {
      padding = 4 - (offset % 4);
    }

    otfFileB = Buffer.concat([
      otfFileB,
      uncompressedData,
      Buffer.alloc(padding)
    ]);
  }

  return otfFileB;
};

module.exports = woff2otf;

