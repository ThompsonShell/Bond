export type ThemeName = 'olxori' | 'olxori-yorug' | 'binafsha' | 'binafsha-tungi';
export type ThemeMode = 'tungi' | 'yorug';
export type ThemeFamily = 'olxori' | 'binafsha';

export const THEME_COOKIE = 'bondi-theme';

/** Palette chosen by the client. Changing it only swaps the default theme. */
export const THEME_FAMILY: ThemeFamily = process.env.NEXT_PUBLIC_THEME_FAMILY === 'binafsha' ? 'binafsha' : 'olxori';

/** Standard theme of each palette: olxori is dark, binafsha is light. */
const DEFAULT_MODE: Record<ThemeFamily, ThemeMode> = { olxori: 'tungi', binafsha: 'yorug' };

export function resolveTheme(mode: string | undefined, family: ThemeFamily = THEME_FAMILY): ThemeName {
  const m: ThemeMode = mode === 'tungi' || mode === 'yorug' ? mode : DEFAULT_MODE[family];
  if (family === 'binafsha') return m === 'tungi' ? 'binafsha-tungi' : 'binafsha';
  return m === 'tungi' ? 'olxori' : 'olxori-yorug';
}

export function modeOf(theme: string): ThemeMode {
  return theme === 'olxori' || theme === 'binafsha-tungi' ? 'tungi' : 'yorug';
}

/** Applies a mode in the browser and remembers it in a cookie (read by the root layout). */
export function applyMode(mode: ThemeMode) {
  document.documentElement.dataset.theme = resolveTheme(mode);
  document.cookie = `${THEME_COOKIE}=${mode}; path=/; max-age=31536000; samesite=lax`;
}
