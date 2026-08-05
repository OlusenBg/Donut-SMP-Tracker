// One-off script to fetch Minecraft item/block textures into public/items/.
// Not run at build time — images are committed to the repo.
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import catalog from "../lib/items-catalog.json" with { type: "json" };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "items");
const BASE =
  "https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21/assets/minecraft/textures";

await mkdir(outDir, { recursive: true });

let ok = 0;
let failed = [];

for (const item of catalog) {
  const dest = path.join(outDir, `${item.slug}.png`);
  if (existsSync(dest)) {
    ok++;
    continue;
  }
  const url = `${BASE}/${item.texturePath}.png`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(dest, buf);
    console.log(`OK   ${item.slug} <- ${item.texturePath}`);
    ok++;
  } catch (err) {
    console.error(`FAIL ${item.slug} <- ${item.texturePath}: ${err.message}`);
    failed.push(item.slug);
  }
}

console.log(`\nDownloaded ${ok}/${catalog.length} textures.`);
if (failed.length) {
  console.error(`Failed: ${failed.join(", ")}`);
  process.exit(1);
}
