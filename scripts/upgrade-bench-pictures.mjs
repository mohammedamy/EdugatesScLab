#!/usr/bin/env node
import fs from "fs";
import path from "path";

const labsDir = path.resolve("labs");
const files = fs.readdirSync(labsDir).filter(f => f.endsWith(".js"));

let modifiedCount = 0;
const apply = process.argv.includes("--apply");

for (const file of files) {
  const filePath = path.join(labsDir, file);
  let content = fs.readFileSync(filePath, "utf-8");

  // Match img tags for assets/labs/...jpg that are NOT already preceded by <source
  const updated = content.replace(
    /(?<!<picture>\s*<source[^>]*>\s*)<img\s+src="(assets\/labs\/([a-zA-Z0-9_-]+)\.jpg)"([^>]*?)>/g,
    (match, fullSrc, baseName, rest) => {
      const webpPath = `assets/labs/${baseName}.webp`;
      if (!fs.existsSync(path.resolve(webpPath))) {
        return match; // Keep unchanged if webp does not exist
      }
      // Ensure loading="lazy" and decoding="async" are present
      let cleanRest = rest;
      if (!cleanRest.includes('loading=')) {
        cleanRest = ` loading="lazy"` + cleanRest;
      }
      if (!cleanRest.includes('decoding=')) {
        cleanRest = ` decoding="async"` + cleanRest;
      }
      return `<picture>\n              <source srcset="${webpPath}" type="image/webp">\n              <img src="${fullSrc}"${cleanRest}>\n            </picture>`;
    }
  );

  if (updated !== content) {
    console.log(`  📸 Upgraded: labs/${file}`);
    modifiedCount++;
    if (apply) {
      fs.writeFileSync(filePath, updated, "utf-8");
    }
  }
}

console.log(`\n${apply ? "Applied" : "Planned"} upgrades across ${modifiedCount} lab files.`);
