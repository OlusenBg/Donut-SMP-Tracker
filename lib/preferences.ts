export type Theme = "donut" | "dark" | "sprinkles";
export type Layout = "tiles" | "list";

export const THEMES: { value: Theme; label: string }[] = [
  { value: "donut", label: "Donut" },
  { value: "dark", label: "Dark" },
  { value: "sprinkles", label: "Sprinkles" },
];

export const LAYOUTS: { value: Layout; label: string }[] = [
  { value: "tiles", label: "Tiles" },
  { value: "list", label: "List" },
];

const THEME_KEY = "donut-smp-theme";
const LAYOUT_KEY = "donut-smp-layout";
const ONBOARDED_KEY = "donut-smp-onboarded";
const CHANGE_EVENT = "donut-smp-preferences-changed";

const DEFAULT_THEME: Theme = "donut";
const DEFAULT_LAYOUT: Layout = "tiles";

function isTheme(value: string | null): value is Theme {
  return value === "donut" || value === "dark" || value === "sprinkles";
}

function isLayout(value: string | null): value is Layout {
  return value === "tiles" || value === "list";
}

export function getTheme(): Theme {
  if (typeof window === "undefined") return DEFAULT_THEME;
  const stored = window.localStorage.getItem(THEME_KEY);
  return isTheme(stored) ? stored : DEFAULT_THEME;
}

export function getLayout(): Layout {
  if (typeof window === "undefined") return DEFAULT_LAYOUT;
  const stored = window.localStorage.getItem(LAYOUT_KEY);
  return isLayout(stored) ? stored : DEFAULT_LAYOUT;
}

export function hasOnboarded(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(ONBOARDED_KEY) === "1";
}

/** Applies the theme to the DOM immediately (sets data-theme on <html>) —
 * separate from setTheme() so the no-flash inline script in layout.tsx
 * and the React-side setters can share this one code path. */
export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
}

export function setTheme(theme: Theme): void {
  window.localStorage.setItem(THEME_KEY, theme);
  applyTheme(theme);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function setLayout(layout: Layout): void {
  window.localStorage.setItem(LAYOUT_KEY, layout);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function setOnboarded(): void {
  window.localStorage.setItem(ONBOARDED_KEY, "1");
}

export function subscribePreferences(callback: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

/** Inline script text, injected into <head> so the stored theme applies
 * before first paint — otherwise the page would flash the default Donut
 * theme and then snap to the stored one once React hydrates. */
export const THEME_INIT_SCRIPT = `
(function () {
  try {
    var t = localStorage.getItem(${JSON.stringify(THEME_KEY)});
    if (t === "dark" || t === "sprinkles") {
      document.documentElement.dataset.theme = t;
    }
  } catch (e) {}
})();
`;
