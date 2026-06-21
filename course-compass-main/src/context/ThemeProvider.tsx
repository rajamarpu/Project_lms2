import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ThemePreference = "light" | "dark" | "system";
type ResolvedTheme = Exclude<ThemePreference, "system">;

interface ThemeContextValue {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = "uptoskills-theme";
const ThemeContext = createContext<ThemeContextValue | null>(null);

const systemTheme = (): ResolvedTheme =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const storedTheme = (): ThemePreference => {
  const value = localStorage.getItem(STORAGE_KEY);
  return value === "light" || value === "dark" || value === "system" ? value : "system";
};

const applyTheme = (preference: ThemePreference): ResolvedTheme => {
  const resolved = preference === "system" ? systemTheme() : preference;
  const root = document.documentElement;
  root.dataset.theme = resolved;
  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
  return resolved;
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreference>(storedTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => applyTheme(storedTheme()));

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => setResolvedTheme(applyTheme(theme));
    sync();
    if (theme === "system") media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(() => ({
    theme,
    resolvedTheme,
    setTheme: (nextTheme) => {
      localStorage.setItem(STORAGE_KEY, nextTheme);
      setThemeState(nextTheme);
    },
    toggleTheme: () => {
      const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
      localStorage.setItem(STORAGE_KEY, nextTheme);
      setThemeState(nextTheme);
    },
  }), [theme, resolvedTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
