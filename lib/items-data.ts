import rawCatalog from "./items-catalog.json";

export type Category =
  | "Rare"
  | "Weapons"
  | "Tools"
  | "Armor"
  | "Blocks"
  | "Food"
  | "Misc";

export interface CatalogItem {
  slug: string;
  name: string;
  texturePath: string;
  category: Category;
  basePrice: number;
  volatility: number;
}

export const catalog = rawCatalog as CatalogItem[];

export const catalogBySlug: Record<string, CatalogItem> = Object.fromEntries(
  catalog.map((item) => [item.slug, item]),
);

export function getItem(slug: string): CatalogItem | undefined {
  return catalogBySlug[slug];
}

export function searchCatalog(query: string, limit = 8): CatalogItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const starts: CatalogItem[] = [];
  const contains: CatalogItem[] = [];

  for (const item of catalog) {
    const name = item.name.toLowerCase();
    if (name.startsWith(q)) starts.push(item);
    else if (name.includes(q)) contains.push(item);
  }

  return [...starts, ...contains].slice(0, limit);
}
