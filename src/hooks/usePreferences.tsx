import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  language: "en" | "he";
  notifyEmail: boolean;
  notifyTelegram: boolean;
  notifyPush: boolean;
  notifyInApp: boolean;
  dashboardWidgets: string[];
}

const COOKIE_KEY = "ba_prefs";
const DEFAULT_PREFS: UserPreferences = {
  theme: "system",
  language: "en",
  notifyEmail: false,
  notifyTelegram: true,
  notifyInApp: true,
  notifyPush: false,
  dashboardWidgets: ["tasks", "calendar", "messages", "linear"],
};

function readCookie(): UserPreferences {
  try {
    const raw = document.cookie.split("; ").find(c => c.startsWith(`${COOKIE_KEY}=`));
    if (raw) return { ...DEFAULT_PREFS, ...JSON.parse(decodeURIComponent(raw.split("=").slice(1).join("="))) };
  } catch {}
  return { ...DEFAULT_PREFS };
}

function writeCookie(prefs: UserPreferences) {
  const val = encodeURIComponent(JSON.stringify(prefs));
  document.cookie = `${COOKIE_KEY}=${val};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
}

interface PrefsContextType {
  prefs: UserPreferences;
  updatePrefs: (partial: Partial<UserPreferences>) => void;
}

const PrefsContext = createContext<PrefsContextType>({
  prefs: DEFAULT_PREFS,
  updatePrefs: () => {},
});

export const usePreferences = () => useContext(PrefsContext);

export const PreferencesProvider = ({ children }: { children: ReactNode }) => {
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFS);

  useEffect(() => {
    setPrefs(readCookie());
  }, []);

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    if (prefs.theme === "dark") {
      root.classList.add("dark");
    } else if (prefs.theme === "light") {
      root.classList.remove("dark");
    } else {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      if (mq.matches) root.classList.add("dark");
      else root.classList.remove("dark");
    }
  }, [prefs.theme]);

  const updatePrefs = useCallback((partial: Partial<UserPreferences>) => {
    setPrefs(prev => {
      const next = { ...prev, ...partial };
      writeCookie(next);
      return next;
    });
  }, []);

  return (
    <PrefsContext.Provider value={{ prefs, updatePrefs }}>
      {children}
    </PrefsContext.Provider>
  );
};
