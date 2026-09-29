// Edugates-ClipSAT Science Labs - Self-Contained Offline SVG QR Code Generator
// Supports byte-mode encoding with Reed-Solomon error correction for offline printing & deep-linking

// Galois Field GF(256) tables with primitive polynomial 0x11d (285)
const EXP_TABLE = new Uint8Array(512);
const LOG_TABLE = new Uint8Array(256);

(function initGaloisField() {
  let val = 1;
  for (let i = 0; i < 255; i++) {
    EXP_TABLE[i] = val;
    EXP_TABLE[i + 255] = val;
    LOG_TABLE[val] = i;
    val <<= 1;
    if (val & 0x100) {
      val ^= 0x11d;
    }
  }
})();

function gfMultiply(a, b) {
  if (a === 0 || b === 0) return 0;
  return EXP_TABLE[LOG_TABLE[a] + LOG_TABLE[b]];
}

// Reed-Solomon generator polynomial
function getGeneratorPolynomial(degree) {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    const nextPoly = new Array(poly.length + 1).fill(0);
    const factor = EXP_TABLE[i];
    for (let j = 0; j < poly.length; j++) {
      nextPoly[j] ^= gfMultiply(poly[j], factor);
      nextPoly[j + 1] ^= poly[j];
    }
    poly = nextPoly;
  }
  return poly;
}

// Compute Reed-Solomon Error Correction Codewords
function calculateErrorCorrection(data, ecCount) {
  const gen = getGeneratorPolynomial(ecCount);
  const result = new Array(data.length + ecCount).fill(0);
  for (let i = 0; i < data.length; i++) {
    result[i] = data[i];
  }

  for (let i = 0; i < data.length; i++) {
    const lead = result[i];
    if (lead !== 0) {
      for (let j = 0; j < gen.length; j++) {
        result[i + j] ^= gfMultiply(gen[j], lead);
      }
    }
  }
  return result.slice(data.length);
}

// QR Code Specifications for Versions 1 through 10 (Error Correction Level L & M)
// We dynamically choose the smallest QR version that fits the text payload.
const QR_SPECS = [
  // { version, size, ecL: { dataCap, ecCount }, ecM: { dataCap, ecCount }, alignments }
  { v: 1, size: 21, dataCap: 17, ec: 7, align: [] },
  { v: 2, size: 25, dataCap: 32, ec: 10, align: [6, 18] },
  { v: 3, size: 29, dataCap: 53, ec: 15, align: [6, 22] },
  { v: 4, size: 33, dataCap: 78, ec: 20, align: [6, 26] },
  { v: 5, size: 37, dataCap: 106, ec: 26, align: [6, 30] },
  { v: 6, size: 41, dataCap: 134, ec: 18, align: [6, 34] }, // 2 blocks
  { v: 7, size: 45, dataCap: 154, ec: 20, align: [6, 22, 38] },
  { v: 8, size: 49, dataCap: 192, ec: 24, align: [6, 24, 42] },
  { v: 9, size: 53, dataCap: 230, ec: 30, align: [6, 26, 46] },
  { v: 10, size: 57, dataCap: 271, ec: 18, align: [6, 28, 50] }
];

// Pack string to 8-bit byte mode bit stream
function encodeData(text, spec) {
  const bytes = [];
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code < 128) {
      bytes.push(code);
    } else if (code < 2048) {
      bytes.push((code >> 6) | 192, (code & 63) | 128);
    } else {
      bytes.push((code >> 12) | 224, ((code >> 6) & 63) | 128, (code & 63) | 128);
    }
  }

  // Bit stream building: Mode Indicator (0100 for 8-bit byte)
  const bitStream = [];
  function pushBits(val, len) {
    for (let i = len - 1; i >= 0; i--) {
      bitStream.push((val >> i) & 1);
    }
  }

  pushBits(0b0100, 4); // 8-bit byte mode
  pushBits(bytes.length, spec.v < 10 ? 8 : 16); // Character count indicator

  for (let i = 0; i < bytes.length; i++) {
    pushBits(bytes[i], 8);
  }

  // Terminator (up to 4 zeroes)
  const maxBits = spec.dataCap * 8;
  const termLen = Math.min(4, maxBits - bitStream.length);
  pushBits(0, termLen);

  // Pad to multiple of 8
  while (bitStream.length % 8 !== 0 && bitStream.length < maxBits) {
    bitStream.push(0);
  }

  // Convert bits to bytes
  const dataBytes = [];
  for (let i = 0; i < bitStream.length; i += 8) {
    let byteVal = 0;
    for (let b = 0; b < 8; b++) {
      byteVal = (byteVal << 1) | (bitStream[i + b] || 0);
    }
    dataBytes.push(byteVal);
  }

  // Pad bytes alternating 0xEC and 0x11
  let padByte = 0xec;
  while (dataBytes.length < spec.dataCap) {
    dataBytes.push(padByte);
    padByte = padByte === 0xec ? 0x11 : 0xec;
  }

  return dataBytes;
}

// Generate QR Matrix
export function generateQRMatrix(text) {
  // Find suitable version
  let spec = null;
  // Estimate byte length
  const utf8Len = encodeURIComponent(text).replace(/%[A-F\d]{2}/g, 'U').length;
  for (const s of QR_SPECS) {
    if (s.dataCap >= utf8Len + 3) {
      spec = s;
      break;
    }
  }
  if (!spec) spec = QR_SPECS[QR_SPECS.length - 1];

  const size = spec.size;
  const matrix = Array.from({ length: size }, () => new Array(size).fill(null));
  const isReserved = Array.from({ length: size }, () => new Array(size).fill(false));

  function setModule(r, c, val, reserved = true) {
    if (r >= 0 && r < size && c >= 0 && c < size) {
      matrix[r][c] = val;
      if (reserved) isReserved[r][c] = true;
    }
  }

  // 1. Finder patterns (7x7 with 1px separator)
  function placeFinder(row, col) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const nr = row + r;
        const nc = col + c;
        if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
        if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
          if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
            setModule(nr, nc, 1);
          } else {
            setModule(nr, nc, 0);
          }
        } else {
          setModule(nr, nc, 0); // separator
        }
      }
    }
  }

  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);

  // 2. Alignment patterns for Version >= 2
  if (spec.align && spec.align.length > 0) {
    const coords = spec.align;
    for (let i = 0; i < coords.length; i++) {
      for (let j = 0; j < coords.length; j++) {
        const r = coords[i];
        const c = coords[j];
        // Skip finder areas
        if ((r < 9 && c < 9) || (r < 9 && c >= size - 9) || (r >= size - 9 && c < 9)) continue;
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            if (Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0)) {
              setModule(r + dr, c + dc, 1);
            } else {
              setModule(r + dr, c + dc, 0);
            }
          }
        }
      }
    }
  }

  // 3. Timing patterns
  for (let i = 8; i < size - 8; i++) {
    const val = i % 2 === 0 ? 1 : 0;
    if (matrix[6][i] === null) setModule(6, i, val);
    if (matrix[i][6] === null) setModule(i, 6, val);
  }

  // Dark module
  setModule(size - 8, 8, 1);

  // Reserve format information areas
  for (let i = 0; i < 9; i++) {
    if (matrix[8][i] === null) isReserved[8][i] = true;
    if (matrix[i][8] === null) isReserved[i][8] = true;
  }
  for (let i = 0; i < 8; i++) {
    isReserved[8][size - 1 - i] = true;
    isReserved[size - 1 - i][8] = true;
  }

  // 4. Encode data + calculate Reed Solomon Error Correction
  const dataBytes = encodeData(text, spec);
  const ecBytes = calculateErrorCorrection(dataBytes, spec.ec);
  const allCodewords = dataBytes.concat(ecBytes);

  // Convert codewords to bit array
  const codewordBits = [];
  for (let i = 0; i < allCodewords.length; i++) {
    for (let b = 7; b >= 0; b--) {
      codewordBits.push((allCodewords[i] >> b) & 1);
    }
  }

  // 5. Place data bits in matrix (right to left, zigzag)
  let bitIndex = 0;
  let dir = -1; // -1 = up, 1 = down
  let col = size - 1;

  while (col > 0) {
    if (col === 6) col--; // Skip vertical timing pattern

    const rows = dir === -1
      ? Array.from({ length: size }, (_, i) => size - 1 - i)
      : Array.from({ length: size }, (_, i) => i);

    for (const row of rows) {
      for (const c of [col, col - 1]) {
        if (!isReserved[row][c]) {
          const bit = bitIndex < codewordBits.length ? codewordBits[bitIndex++] : 0;
          // Apply standard mask pattern 000: (row + col) % 2 === 0
          const mask = (row + c) % 2 === 0 ? 1 : 0;
          matrix[row][c] = bit ^ mask;
        }
      }
    }
    dir = -dir;
    col -= 2;
  }

  // 6. Format information (Mask 000 + Error Correction Level L = 01 -> Format string: 111011111000100)
  const formatBits = [1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0];
  // Top-left
  for (let i = 0; i < 6; i++) matrix[8][i] = formatBits[i];
  matrix[8][7] = formatBits[6];
  matrix[8][8] = formatBits[7];
  matrix[7][8] = formatBits[8];
  for (let i = 9; i < 15; i++) matrix[14 - i][8] = formatBits[i];

  // Top-right & Bottom-left
  for (let i = 0; i < 8; i++) matrix[8][size - 1 - i] = formatBits[i];
  for (let i = 8; i < 15; i++) matrix[size - 15 + i][8] = formatBits[i];

  return matrix;
}

// Render QR Matrix as crisp Vector SVG
export function generateQRSvg(text, options = {}) {
  const {
    pixelSize = 4,
    margin = 2,
    fgColor = "#000000",
    bgColor = "#ffffff"
  } = options;

  const matrix = generateQRMatrix(text);
  const size = matrix.length;
  const fullSize = size + margin * 2;
  const viewBoxSize = fullSize * pixelSize;

  let rects = "";
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c] === 1) {
        const x = (c + margin) * pixelSize;
        const y = (r + margin) * pixelSize;
        rects += `<rect x="${x}" y="${y}" width="${pixelSize}" height="${pixelSize}" fill="${fgColor}"/>`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" width="100%" height="100%" style="display: block; shape-rendering: crispEdges;">
    <rect width="${viewBoxSize}" height="${viewBoxSize}" fill="${bgColor}"/>
    ${rects}
  </svg>`;
}
