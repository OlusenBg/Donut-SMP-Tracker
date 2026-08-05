// One-off script that expands lib/items-catalog.json from the original
// hand-curated 55 items to (almost) every survival-obtainable Minecraft
// item, using minecraft-data for the canonical registry. Not run at build
// time. Re-run with: node scripts/generate-catalog.mjs
//
// The 55 originally hand-curated items keep their exact existing
// name/category/basePrice/volatility/texturePath untouched. Everything
// else is categorized and priced heuristically (keyword/pattern rules
// below), since hand-tuning ~1200 individual prices isn't practical.
import { writeFileSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import minecraftData from "minecraft-data";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CATALOG_PATH = path.join(__dirname, "..", "lib", "items-catalog.json");

const mcData = minecraftData("1.21.1");
const allItems = Object.values(mcData.itemsByName);
const foodNames = new Set(Object.keys(mcData.foodsByName));

// Technical/creative-only items with no legitimate survival acquisition
// path — not "items you could own on a real server".
const EXCLUDE = new Set([
  "air",
  "bedrock",
  "petrified_oak_slab",
  "spawner",
  "trial_spawner",
  "vault",
  "reinforced_deepslate",
  "end_portal_frame",
  "command_block",
  "repeating_command_block",
  "chain_command_block",
  "command_block_minecart",
  "barrier",
  "light",
  "structure_void",
  "structure_block",
  "jigsaw",
  "knowledge_book",
  "debug_stick",
  "dragon_head",
]);
for (const item of allItems) {
  if (item.name.endsWith("_spawn_egg")) EXCLUDE.add(item.name);
}

const existingCatalog = JSON.parse(readFileSync(CATALOG_PATH, "utf-8"));
const curatedBySlug = new Map(existingCatalog.map((item) => [item.slug, item]));

// --- Categorization + pricing rules -----------------------------------
// Evaluated top to bottom; first match wins. [regex, category, [min, max], volatility]
const RULES = [
  [/^(diamond|netherite|iron|golden|leather|chainmail)_(helmet|chestplate|leggings|boots)$/, "Armor", [40_000, 250_000], 0.04],
  [/^turtle_helmet$/, "Armor", [40_000, 250_000], 0.04],
  [/_sword$/, "Weapons", [500, 150_000], 0.05],
  [/^(bow|crossbow|arrow|spectral_arrow|tipped_arrow)$/, "Weapons", [200, 15_000], 0.06],
  [/_(pickaxe|axe|shovel|hoe)$/, "Tools", [200, 150_000], 0.05],
  [/^(shears|flint_and_steel|fishing_rod|shield|spyglass|brush|compass|clock|lead|name_tag|saddle|carrot_on_a_stick|warped_fungus_on_a_stick)$/, "Tools", [500, 80_000], 0.05],
  [/^(potion|splash_potion|lingering_potion|experience_bottle)$/, "Potions", [500, 15_000], 0.07],
  [/^(nether_wart|glass_bottle|blaze_powder|fermented_spider_eye|glowstone_dust|redstone|sugar|rabbit_foot|phantom_membrane|magma_cream|dragon_breath|turtle_helmet)$/, "Potions", [50, 8_000], 0.06],
  [/^(netherite_(scrap|ingot)|ancient_debris)$/, "Ores", [1_500_000, 3_000_000], 0.05],
  [/^(diamond|deepslate_diamond)_ore$/, "Ores", [6_000, 12_000], 0.04],
  [/^(emerald|deepslate_emerald)_ore$/, "Ores", [4_500, 9_000], 0.04],
  [/^raw_(gold|iron|copper)$/, "Ores", [100, 4_000], 0.04],
  [/^(gold|deepslate_gold)_ore$/, "Ores", [800, 3_000], 0.04],
  [/^gold_(ingot|nugget)$/, "Ores", [200, 2_500], 0.04],
  [/^(iron|deepslate_iron)_ore$/, "Ores", [80, 600], 0.03],
  [/^iron_(ingot|nugget)$/, "Ores", [40, 500], 0.03],
  [/^(copper|deepslate_copper)_ore$/, "Ores", [30, 300], 0.03],
  [/^(copper_ingot|coal|charcoal|lapis_lazuli|redstone|quartz|amethyst_shard)$/, "Ores", [10, 250], 0.03],
  [/(_ore)$/, "Ores", [50, 1_000], 0.04],
  [/^(oak|spruce|birch|jungle|acacia|dark_oak|mangrove|cherry|bamboo|crimson|warped|pale_oak)_(log|wood|planks|stairs|slab|fence|fence_gate|door|trapdoor|sign|hanging_sign|boat|chest_boat|pressure_plate|button)/, "Wood", [1, 200], 0.03],
  [/^stripped_/, "Wood", [1, 200], 0.03],
  [/^(redstone_torch|repeater|comparator|piston|sticky_piston|observer|dispenser|dropper|hopper|rail|powered_rail|detector_rail|activator_rail|lever|.*_button|.*_pressure_plate|target|tripwire_hook|note_block|daylight_detector|lectern|redstone_lamp|redstone_block)$/, "Redstone", [10, 3_000], 0.04],
  [/^(netherrack|soul_sand|soul_soil|basalt|polished_basalt|blackstone|gilded_blackstone|crimson_(nylium|fungus|roots)|warped_(nylium|fungus|roots)|nether_(bricks|brick|quartz_ore|gold_ore)|magma_block|shroomlight|weeping_vines|twisting_vines|chorus_.*)$/, "Nether", [5, 2_000], 0.04],
  [/^(end_stone|end_stone_bricks|purpur_block|purpur_pillar|purpur_stairs|purpur_slab|end_rod|ender_pearl|ender_eye|shulker_box|.*_shulker_box)$/, "End", [500, 400_000], 0.05],
  [/^(prismarine|prismarine_bricks|dark_prismarine|sea_lantern|kelp|dried_kelp.*|sea_pickle|.*_coral.*|nautilus_shell|tropical_fish|pufferfish|cod|salmon|ink_sac|glow_ink_sac|sponge|wet_sponge)$/, "Ocean", [5, 5_000], 0.04],
  [/(_seeds|_sapling)$/, "Farming", [1, 50], 0.04],
  [/^(wheat|carrot|potato|beetroot|melon.*|pumpkin.*|sugar_cane|cocoa_beans|sweet_berries|glow_berries|egg|milk_bucket|honey_bottle|honeycomb.*|torchflower.*|pitcher_.*)$/, "Farming", [5, 300], 0.04],
  [/^(bone|bone_meal|string|gunpowder|slime_ball|rotten_flesh|spider_eye|feather|leather|rabbit_hide|ghast_tear|nether_star_shard|wither_skeleton_skull)$/, "Mob Drops", [5, 500], 0.05],
  [/(_wool|_carpet|_concrete|_concrete_powder|_terracotta|_glazed_terracotta|_stained_glass|_stained_glass_pane|_banner|_bed|_candle|_dye|flower_pot|.*_glass|.*_glass_pane)$/, "Decoration", [2, 150], 0.03],
  [/^(.*sherd|decorated_pot)$/, "Decoration", [50, 2_000], 0.05],
  [/^(.*_smithing_template)$/, "Rare", [500_000, 5_000_000], 0.04],
  [/^(music_disc_.*)$/, "Rare", [100_000, 500_000], 0.06],
  [/^(totem_of_undying|elytra|nether_star|dragon_egg|beacon|conduit)$/, "Rare", [10_000_000, 100_000_000], 0.04],
];

const DEFAULT_CATEGORY = "Blocks";
const DEFAULT_RANGE = [1, 100];
const DEFAULT_VOLATILITY = 0.03;

function categorize(name) {
  if (foodNames.has(name)) return { category: "Food", range: [5, 500], volatility: 0.05 };
  for (const [pattern, category, range, volatility] of RULES) {
    if (pattern.test(name)) return { category, range, volatility };
  }
  return { category: DEFAULT_CATEGORY, range: DEFAULT_RANGE, volatility: DEFAULT_VOLATILITY };
}

function toDisplayName(mcDisplayName) {
  return mcDisplayName;
}

const generated = [];
for (const item of allItems) {
  if (EXCLUDE.has(item.name)) continue;
  if (curatedBySlug.has(item.name)) continue; // keep hand-curated entry as-is

  const { category, range, volatility } = categorize(item.name);
  const [min, max] = range;
  const basePrice = Math.round(min + Math.random() * (max - min));

  generated.push({
    slug: item.name,
    name: toDisplayName(item.displayName),
    texturePath: null, // resolved by scripts/download-full-textures.mjs
    category,
    basePrice,
    volatility,
  });
}

const fullCatalog = [...existingCatalog, ...generated];
writeFileSync(CATALOG_PATH, JSON.stringify(fullCatalog, null, 2) + "\n");

console.log(`Curated (untouched): ${existingCatalog.length}`);
console.log(`Generated: ${generated.length}`);
console.log(`Total catalog: ${fullCatalog.length}`);
