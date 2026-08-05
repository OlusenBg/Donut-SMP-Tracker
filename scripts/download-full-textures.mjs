// One-off script: resolves + downloads textures for every catalog entry
// with texturePath === null (i.e. everything generate-catalog.mjs added),
// trying a fallback chain of likely texture paths against the
// minecraft-assets mirror. Entries with no resolvable texture are DROPPED
// from the catalog rather than shipping a broken image. Not run at build
// time. Re-run with: node scripts/download-full-textures.mjs
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CATALOG_PATH = path.join(__dirname, "..", "lib", "items-catalog.json");
const OUT_DIR = path.join(__dirname, "..", "public", "items");
const BASE =
  "https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21/assets/minecraft/textures";

const CONCURRENCY = 24;

// A handful of items where Mojang's real texture filename has no
// derivable relationship to the item id at all.
const MANUAL_OVERRIDES = {
  magma_block: "block/magma",
  snow_block: "block/snow",
  sticky_piston: "block/piston_top_sticky",
  crossbow: "item/crossbow_standby",
  shield: "item/shield_pattern",
  light_weighted_pressure_plate: "block/gold_block",
  heavy_weighted_pressure_plate: "block/iron_block",
  moss_carpet: "block/moss_block",
};

function pathCandidates(slug) {
  return [
    `item/${slug}`,
    `block/${slug}`,
    `block/${slug}_top`,
    `block/${slug}_side`,
    `block/${slug}_front`,
    `block/${slug}_still`,
    `item/${slug}_still`,
    `block/${slug}_stage7`,
    `block/${slug}0`,
    `item/${slug}_00`,
    `block/${slug}_00`,
  ];
}

const WOOD_SPECIES = [
  "oak", "spruce", "birch", "jungle", "acacia", "dark_oak",
  "mangrove", "cherry", "bamboo", "crimson", "warped",
];
const WOOD_SHAPE_SUFFIXES = [
  "stairs", "slab", "fence", "fence_gate", "button", "pressure_plate", "trapdoor", "door",
];

// Many block ITEMS (stairs, slabs, walls, fences, beds, banners, carpets,
// waxed copper, ...) render in-inventory as a 3D model composited from
// several textures at runtime — there's no single flat "icon" file for
// them in the raw resource pack, unlike plain items/ores/food/tools. This
// derives visually-reasonable stand-in base materials to try instead
// (e.g. oak_stairs -> oak_planks, white_bed -> white_wool), so those
// items still get a sensible icon instead of being dropped.
function fallbackSlugs(slug) {
  const out = [];

  if (slug.startsWith("waxed_")) out.push(slug.slice("waxed_".length));
  if (slug.startsWith("enchanted_")) out.push(slug.slice("enchanted_".length));
  if (slug.startsWith("infested_")) out.push(slug.slice("infested_".length));
  if (slug.startsWith("smooth_")) out.push(slug.slice("smooth_".length));
  if (slug.endsWith("_hyphae")) out.push(slug.replace(/_hyphae$/, "_stem"));

  const colorish = slug.match(/^(.+)_(bed|banner|carpet)$/);
  if (colorish) out.push(`${colorish[1]}_wool`);

  // Wood species use "<species>_planks" as the base material for these
  // shapes, not the bare species name (oak_stairs -> oak_planks, not oak).
  const woodShape = slug.match(
    new RegExp(`^(${WOOD_SPECIES.join("|")})_(${WOOD_SHAPE_SUFFIXES.join("|")})$`),
  );
  if (woodShape) out.push(`${woodShape[1]}_planks`);

  const compoundShape = slug.match(
    /^(.+)_(stairs|slab|wall|fence_gate|fence|pressure_plate|button|trapdoor|door)$/,
  );
  if (compoundShape) {
    out.push(compoundShape[1]);
    // Mojang inconsistently singularizes "_bricks"/"_tiles" in these
    // compound names (stone_brick_wall) while the block id stays plural
    // (stone_bricks) — try both.
    out.push(`${compoundShape[1]}s`);
    // A few materials (purpur, quartz) need "_block" appended back.
    out.push(`${compoundShape[1]}_block`);
  }

  if (slug.endsWith("_wood")) out.push(slug.replace(/_wood$/, "_log"));
  if (slug.endsWith("_block")) out.push(slug.replace(/_block$/, ""));

  // Second pass: apply the same rules once more to each derived fallback,
  // so e.g. waxed_oxidized_cut_copper_stairs -> oxidized_cut_copper_stairs
  // -> oxidized_cut_copper.
  const secondPass = [];
  for (const base of out) {
    if (base.startsWith("waxed_")) secondPass.push(base.slice("waxed_".length));
    const shape2 = base.match(
      /^(.+)_(stairs|slab|wall|fence_gate|fence|pressure_plate|button|trapdoor|door)$/,
    );
    if (shape2) {
      secondPass.push(shape2[1]);
      secondPass.push(`${shape2[1]}s`);
    }
  }

  return [...out, ...secondPass];
}

async function resolveTexture(slug) {
  if (MANUAL_OVERRIDES[slug]) {
    const url = `${BASE}/${MANUAL_OVERRIDES[slug]}.png`;
    const res = await fetch(url);
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      return { texturePath: MANUAL_OVERRIDES[slug], buf };
    }
  }

  const slugsToTry = [slug, ...fallbackSlugs(slug)];
  for (const s of slugsToTry) {
    for (const candidate of pathCandidates(s)) {
      const url = `${BASE}/${candidate}.png`;
      try {
        const res = await fetch(url);
        if (res.ok) {
          const buf = Buffer.from(await res.arrayBuffer());
          return { texturePath: candidate, buf };
        }
      } catch {
        // try next candidate
      }
    }
  }
  return null;
}

async function pooledMap(items, worker, concurrency) {
  const results = new Array(items.length);
  let next = 0;
  async function runOne() {
    while (next < items.length) {
      const i = next++;
      results[i] = await worker(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, runOne));
  return results;
}

const catalog = JSON.parse(await readFile(CATALOG_PATH, "utf-8"));
const pending = catalog.filter((item) => item.texturePath === null);

await mkdir(OUT_DIR, { recursive: true });

let resolved = 0;
let failed = 0;
const failedSlugs = [];

await pooledMap(
  pending,
  async (item) => {
    const dest = path.join(OUT_DIR, `${item.slug}.png`);
    if (existsSync(dest)) {
      item.texturePath = item.texturePath ?? "item/" + item.slug;
      resolved++;
      return;
    }
    const result = await resolveTexture(item.slug);
    if (!result) {
      failed++;
      failedSlugs.push(item.slug);
      return;
    }
    await writeFile(dest, result.buf);
    item.texturePath = result.texturePath;
    resolved++;
  },
  CONCURRENCY,
);

const finalCatalog = catalog.filter((item) => item.texturePath !== null);
await writeFile(CATALOG_PATH, JSON.stringify(finalCatalog, null, 2) + "\n");

console.log(`Resolved: ${resolved}`);
console.log(`Failed (dropped from catalog): ${failed}`);
console.log(`Final catalog size: ${finalCatalog.length}`);
if (failedSlugs.length) {
  console.log("Dropped:", failedSlugs.join(", "));
}
