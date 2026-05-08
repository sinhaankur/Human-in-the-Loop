import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Vertical } from "@/types";
import { VERTICAL_META } from "@/lib/verticals";

type Theme = "dark" | "light";

interface TenantState {
  vertical: Vertical;
  setVertical: (v: Vertical) => void;
  theme: Theme;
  toggleTheme: () => void;
}

const TenantCtx = createContext<TenantState | null>(null);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [vertical, setVertical] = useState<Vertical>("clinical");
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    return document.documentElement.classList.contains("dark") ? "dark" : "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  const value = useMemo(
    () => ({ vertical, setVertical, theme, toggleTheme }),
    [vertical, theme, toggleTheme]
  );

  return <TenantCtx.Provider value={value}>{children}</TenantCtx.Provider>;
}

export function useTenant() {
  const ctx = useContext(TenantCtx);
  if (!ctx) throw new Error("useTenant must be used within TenantProvider");
  return ctx;
}

export function useVerticalMeta() {
  const { vertical } = useTenant();
  return VERTICAL_META[vertical];
}
