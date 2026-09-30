// scripts/apply-specimen-updates.mjs
// Injects the curated ELEMENT_SPECIMEN_MAPPING into data/periodic-table-data.js.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ELEMENT_SPECIMEN_MAPPING } from "./verify-all-element-specimens.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const dataFilePath = path.join(rootDir, "data", "periodic-table-data.js");
let content = fs.readFileSync(dataFilePath, "utf-8");

// Load the module to get the list of elements
const mod = await import("../data/periodic-table-data.js");
const elements = mod.PERIODIC_ELEMENTS;

let replacedCount = 0;

for (const el of elements) {
  const mapping = ELEMENT_SPECIMEN_MAPPING[el.z];
  if (!mapping) {
    console.warn(`No mapping for Z=${el.z} (${el.s})`);
    continue;
  }

  // Find the block for this element: z: ${el.z}, s: "${el.s}"
  // We want to replace image: "..." and imageDesc: "..."
  const blockStartRegex = new RegExp(`z:\\s*${el.z},\\s*s:\\s*"${el.s}"`, "g");
  const match = blockStartRegex.exec(content);
  if (!match) {
    console.error(`Could not locate block for Z=${el.z} (${el.s})`);
    continue;
  }

  // Find the end of this element object block (up to `},\n` or next `z:`)
  const startIndex = match.index;
  const nextBlockIndex = content.indexOf("},\n", startIndex);
  if (nextBlockIndex === -1) {
    console.error(`Could not locate block end for Z=${el.z}`);
    continue;
  }

  const blockContent = content.substring(startIndex, nextBlockIndex + 2);

  // Replace image: "..." and imageDesc: "..."
  const updatedBlock = blockContent
    .replace(/image:\s*"[^"]*",?/, `image: "${mapping.image}",`)
    .replace(/imageDesc:\s*"[^"]*",?/, `imageDesc: "${mapping.imageDesc.replace(/"/g, '\\"')}"`);

  content = content.substring(0, startIndex) + updatedBlock + content.substring(nextBlockIndex + 2);
  replacedCount++;
}

fs.writeFileSync(dataFilePath, content, "utf-8");
console.log(`Successfully updated ${replacedCount} / ${elements.length} elements with raw samples and gas applications!`);
