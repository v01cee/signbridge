// Генерация PWA иконок без внешних зависимостей.
// Запуск: node scripts/make-icons.mjs
import fs from "node:fs";
import zlib from "node:zlib";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "../public");

// Палитра SignBridge
const BG = [0x0f, 0x11, 0x17];
const ACCENT_FROM = [0x6c, 0x63, 0xff];
const ACCENT_TO = [0x8b, 0x84, 0xff];
const WHITE = [0xff, 0xff, 0xff];

function lerp(a, b, t) {
  return a + (b - a) * t;
}
function mix(c1, c2, t) {
  return [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];
}

// Простой рендер символа жеста (стилизованная «ладонь» из пикселей)
// 24x24 битмаска — 1 = заливка accent, 2 = заливка white
const HAND_BITMAP = [
  "............111.........",
  "............111.........",
  "...111......111......111",
  "...111..111.111..111.111",
  "...111..111.111..111.111",
  "...111..111.111..111.111",
  "...111..111.111..111.111",
  "...111..111.111..111.111",
  "...111..111.111..111.111",
  "...111..111.111..111.111",
  "...111..111.111..111.111",
  "...1111111111111111.111.",
  "....111111111111111.111.",
  "....111111111111111111..",
  "....111111111111111111..",
  ".....1111111111111111...",
  "......11111111111111....",
  ".......111111111111.....",
  "........1111111111......",
  ".........11111111.......",
  "..........111111........",
  "...........1111.........",
  "............11..........",
  "........................",
];

function createPNG(size) {
  const stride = 1 + size * 3;
  const raw = Buffer.alloc(stride * size);

  // Радиус скругления
  const radius = Math.floor(size * 0.2);
  const circleCx = size / 2;
  const circleCy = size / 2;
  const circleR = size * 0.38;

  for (let y = 0; y < size; y++) {
    raw[y * stride] = 0;
    for (let x = 0; x < size; x++) {
      const offset = y * stride + 1 + x * 3;
      let color = BG;

      // Внутри скруглённого квадрата?
      const inRoundedSquare =
        !(x < radius && y < radius && (radius - x) ** 2 + (radius - y) ** 2 > radius ** 2) &&
        !(x >= size - radius && y < radius && (x - (size - radius)) ** 2 + (radius - y) ** 2 > radius ** 2) &&
        !(x < radius && y >= size - radius && (radius - x) ** 2 + (y - (size - radius)) ** 2 > radius ** 2) &&
        !(x >= size - radius && y >= size - radius && (x - (size - radius)) ** 2 + (y - (size - radius)) ** 2 > radius ** 2);

      if (inRoundedSquare) {
        color = BG;

        // Внутри круга?
        const dx = x - circleCx;
        const dy = y - circleCy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= circleR) {
          const t = dist / circleR;
          color = mix(ACCENT_FROM, ACCENT_TO, t).map(Math.round);
        }

        // Bitmap текста SB поверх (по центру)
        const bmpSize = size * 0.5;
        const bmpX = Math.floor((x - (size - bmpSize) / 2) / (bmpSize / 24));
        const bmpY = Math.floor((y - (size - bmpSize) / 2) / (bmpSize / 24));
        if (bmpX >= 0 && bmpX < 24 && bmpY >= 0 && bmpY < 24) {
          if (HAND_BITMAP[bmpY][bmpX] === "1") {
            color = WHITE;
          }
        }
      } else {
        // Прозрачный фон не делаем — RGB, поэтому просто темный
        color = BG;
      }

      raw[offset] = color[0];
      raw[offset + 1] = color[1];
      raw[offset + 2] = color[2];
    }
  }

  return encodePNG(raw, size, size);
}

function encodePNG(rawData, width, height) {
  const compressed = zlib.deflateSync(rawData);
  const crcTable = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })();

  function crc32(buf) {
    let crc = 0xffffffff;
    for (const b of buf) crc = (crc >>> 8) ^ crcTable[(crc ^ b) & 0xff];
    return (crc ^ 0xffffffff) >>> 0;
  }

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const t = Buffer.from(type, "ascii");
    const c = Buffer.alloc(4);
    c.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
    return Buffer.concat([len, t, data, c]);
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2; // RGB
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", compressed),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, "icon-192.png"), createPNG(192));
fs.writeFileSync(path.join(OUT_DIR, "icon-512.png"), createPNG(512));
console.log("Icons created in", OUT_DIR);
