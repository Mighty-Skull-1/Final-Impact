// Final Impact - Web package for itch.io / any static host
// Builds the public release bundle and zips exactly the files the browser needs:
//   index.html, style.css, dist/game.bundle.js, vendor/peerjs.min.js
// Upload the zip to itch.io as an "HTML" project and tick "This file will be played in the browser".
// Usage: npm run package:web   →  builds/Final-Impact-web.zip
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { execSync } from 'child_process';

execSync('node scripts/build.mjs --release', { stdio: 'inherit' });

const FILES = ['index.html', 'style.css', 'dist/game.bundle.js', 'vendor/peerjs.min.js'];

// CRC32 for the zip format
const CRC_TABLE = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function dosDateTime(d) {
  const time = (d.getHours() << 11) | (d.getMinutes() << 5) | Math.floor(d.getSeconds() / 2);
  const date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  return { time, date };
}

const locals = [];
const centrals = [];
let offset = 0;
const { time, date } = dosDateTime(new Date());

for (const rel of FILES) {
  const data = fs.readFileSync(rel);
  const comp = zlib.deflateRawSync(data, { level: 9 });
  const name = Buffer.from(rel.replace(/\\/g, '/'));
  const crc = crc32(data);

  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(20, 4);
  local.writeUInt16LE(0, 6);
  local.writeUInt16LE(8, 8);
  local.writeUInt16LE(time, 10);
  local.writeUInt16LE(date, 12);
  local.writeUInt32LE(crc, 14);
  local.writeUInt32LE(comp.length, 18);
  local.writeUInt32LE(data.length, 22);
  local.writeUInt16LE(name.length, 26);
  local.writeUInt16LE(0, 28);
  locals.push(local, name, comp);

  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50, 0);
  central.writeUInt16LE(20, 4);
  central.writeUInt16LE(20, 6);
  central.writeUInt16LE(0, 8);
  central.writeUInt16LE(8, 10);
  central.writeUInt16LE(time, 12);
  central.writeUInt16LE(date, 14);
  central.writeUInt32LE(crc, 16);
  central.writeUInt32LE(comp.length, 20);
  central.writeUInt32LE(data.length, 24);
  central.writeUInt16LE(name.length, 28);
  central.writeUInt32LE(offset, 42);
  centrals.push(central, name);

  offset += local.length + name.length + comp.length;
}

const centralSize = centrals.reduce((n, b) => n + b.length, 0);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0);
end.writeUInt16LE(FILES.length, 8);
end.writeUInt16LE(FILES.length, 10);
end.writeUInt32LE(centralSize, 12);
end.writeUInt32LE(offset, 16);

fs.mkdirSync('builds', { recursive: true });
const outPath = path.join('builds', 'Final-Impact-web.zip');
fs.writeFileSync(outPath, Buffer.concat([...locals, ...centrals, end]));
console.log(`\n✓ ${outPath} (${(fs.statSync(outPath).size / 1024).toFixed(0)} KB) — upload this to itch.io as an HTML game.`);
