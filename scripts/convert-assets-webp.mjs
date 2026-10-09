#!/usr/bin/env node
/**
 * Edugates Science Lab - High-Performance Asset WebP Conversion Script
 * Converts high-resolution JPG and PNG bench photos, chapter headers, and diagram images
 * to modern WebP format for optimal Core Web Vitals (LCP), low latency, and reduced bandwidth.
 *
 * Usage:
 *   node scripts/convert-assets-webp.mjs [--run] [--quality 85]
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const rootDir = process.cwd();
const assetsDir = path.join(rootDir, "assets");

// Parse arguments
const args = process.argv.slice(2);
const shouldRun = args.includes("--run");
const qualityIdx = args.indexOf("--quality");
const quality = qualityIdx !== -1 && args[qualityIdx + 1] ? parseInt(args[qualityIdx + 1], 10) : 85;

console.log("========================================================");
console.log("🖼️  Edugates Science Lab - WebP Asset Optimizer");
console.log("========================================================\n");

// Check for cwebp tool
let cwebpPath = null;
try {
  cwebpPath = execSync("which cwebp", { encoding: "utf8" }).trim();
} catch (e) {
  // Check common macOS Homebrew locations
  if (fs.existsSync("/opt/homebrew/bin/cwebp")) {
    cwebpPath = "/opt/homebrew/bin/cwebp";
  } else if (fs.existsSync("/usr/local/bin/cwebp")) {
    cwebpPath = "/usr/local/bin/cwebp";
  }
}

// Find all candidate images
function getImagesRecursively(dir) {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of list) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getImagesRecursively(fullPath));
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if ([".jpg", ".jpeg", ".png"].includes(ext)) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

const allImages = getImagesRecursively(assetsDir);
console.log(`🔍 Found ${allImages.length} candidate image assets in ./assets/`);
console.log(`⚙️  Target WebP Quality: ${quality}%\n`);

let totalOriginalBytes = 0;
let totalConvertedBytes = 0;
let convertedCount = 0;
let skippedCount = 0;

for (const imgPath of allImages) {
  const stat = fs.statSync(imgPath);
  totalOriginalBytes += stat.size;
  const webpPath = imgPath.replace(/\.(jpe?g|png)$/i, ".webp");
  const relPath = path.relative(rootDir, imgPath);
  const relWebp = path.relative(rootDir, webpPath);

  if (fs.existsSync(webpPath)) {
    const webpStat = fs.statSync(webpPath);
    totalConvertedBytes += webpStat.size;
    skippedCount++;
    continue;
  }

  if (shouldRun && cwebpPath) {
    try {
      execSync(`"${cwebpPath}" -q ${quality} "${imgPath}" -o "${webpPath}"`, { stdio: "pipe" });
      const newStat = fs.statSync(webpPath);
      totalConvertedBytes += newStat.size;
      const savings = (((stat.size - newStat.size) / stat.size) * 100).toFixed(1);
      console.log(`  ✅ Converted: ${relPath} (${(stat.size / 1024).toFixed(1)} KB) ➔ ${relWebp} (${(newStat.size / 1024).toFixed(1)} KB) [Saved ${savings}%]`);
      convertedCount++;
    } catch (err) {
      console.error(`  ❌ Failed converting ${relPath}:`, err.message);
      totalConvertedBytes += stat.size;
    }
  } else {
    // Dry run
    console.log(`  📋 Plan: ${relPath} (${(stat.size / 1024).toFixed(1)} KB) ➔ ${relWebp}`);
  }
}

console.log("\n========================================================");
if (shouldRun && cwebpPath) {
  const savedMb = ((totalOriginalBytes - totalConvertedBytes) / (1024 * 1024)).toFixed(2);
  const percentOverall = totalOriginalBytes > 0 ? (((totalOriginalBytes - totalConvertedBytes) / totalOriginalBytes) * 100).toFixed(1) : 0;
  console.log(`🎉 Optimization Complete: ${convertedCount} newly converted, ${skippedCount} already existed.`);
  console.log(`📦 Original Size: ${(totalOriginalBytes / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`✨ Optimized Size: ${(totalConvertedBytes / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`🚀 Bandwidth Savings: ${savedMb} MB (${percentOverall}% reduction)`);
} else {
  console.log("ℹ️  Dry-run completed.");
  if (!cwebpPath) {
    console.log("⚠️  'cwebp' tool was not found in PATH.");
    console.log("   To install cwebp on macOS: brew install webp");
    console.log("   To install on Ubuntu/Debian: sudo apt-get install webp");
    console.log("   Or via Node.js: npm install -g cwebp-bin");
  } else {
    console.log(`💡 To execute batch conversion now, run:`);
    console.log(`   node scripts/convert-assets-webp.mjs --run --quality 85`);
  }
}
console.log("========================================================\n");
