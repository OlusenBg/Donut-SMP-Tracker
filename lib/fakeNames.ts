// Deterministic fake usernames for the "recent sales" feed — deterministic
// so the same price_history row always shows the same "player" instead of
// relabeling itself on every poll.
const NAMES = [
  "Cobble_King", "xX_Enderman_Xx", "PixelPirate", "NetheriteNick", "DiamondDasher",
  "BlockBuilder22", "Skele_Sniper", "QuartzQueen", "ObsidianOtto", "RedstoneRuby",
  "GhastGamer", "Vex_Vibes", "TridentTina", "ShulkerShane", "EnderPearlEd",
  "CreeperCarl", "PhantomPhoebe", "WitherWendy", "AnvilAndy", "LapisLola",
  "BeaconBella", "TotemTerry", "AxeAlex", "PickaxePat", "ScuteScott",
  "MossyMara", "GlowGabe", "AmethystAva", "SoulSandSam", "DripstoneDan",
  "HoneyHank", "AllayAria", "WardenWes", "SculkStella", "PrismarinePaul",
  "MagmaMax", "BlazeBex", "PiglinPete", "ZombifiedZoe", "IronIvy",
];

export function nameForId(id: number): string {
  // Plain modulo, not a multiplicative hash — `id` is a Postgres bigint
  // that keeps growing, and multiplying it first risks exceeding
  // Number.MAX_SAFE_INTEGER. A rotating pattern is fine here: each item's
  // feed only ever shows a handful of rows at a time.
  const index = ((id % NAMES.length) + NAMES.length) % NAMES.length;
  return NAMES[index];
}
