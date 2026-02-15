import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ACTIVE_USER_STORAGE_KEY } from "./constants";
import { SessionContext } from "./session-context";
import { loginUser, updateUserSettings } from "../api/users";
import { useLanguage } from "../i18n/useLanguage";

export function SessionProvider({ children }) {
  const { language, setLanguage, theme, setTheme } = useLanguage();
  const [user, setUser] = useState(null);
  const [settingsSyncError, setSettingsSyncError] = useState("");
  const serverSettingsRef = useRef({
    userId: null,
    language: null,
    theme: null,
  });
  const isApplyingServerSettingsRef = useRef(false);

  const login = useCallback(async ({ userId, pin }) => {
    const response = await loginUser({ userId, pin });
    const nextUser = response?.user ?? null;
    if (!nextUser) {
      throw new Error("Invalid login response.");
    }

    const nextLanguage = response?.settings?.language ?? "ro";
    const nextTheme = response?.settings?.theme ?? "night";
    isApplyingServerSettingsRef.current = true;
    serverSettingsRef.current = {
      userId: nextUser.id,
      language: nextLanguage,
      theme: nextTheme,
    };

    setUser(nextUser);
    setLanguage(nextLanguage);
    setTheme(nextTheme);
    window.localStorage.setItem(ACTIVE_USER_STORAGE_KEY, String(nextUser.id));
    setSettingsSyncError("");
    return response;
  }, [setLanguage, setTheme]);

  const logout = useCallback(() => {
    setUser(null);
    setSettingsSyncError("");
    serverSettingsRef.current = {
      userId: null,
      language: null,
      theme: null,
    };
    isApplyingServerSettingsRef.current = false;
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    if (isApplyingServerSettingsRef.current) {
      const sameAsServer =
        user.id === serverSettingsRef.current.userId &&
        language === serverSettingsRef.current.language &&
        theme === serverSettingsRef.current.theme;
      if (sameAsServer) {
        isApplyingServerSettingsRef.current = false;
      }
      return;
    }

    const lastPersisted = serverSettingsRef.current;
    if (
      lastPersisted.userId === user.id &&
      lastPersisted.language === language &&
      lastPersisted.theme === theme
    ) {
      return;
    }

    let cancelled = false;
    const persistSettings = async () => {
      try {
        const saved = await updateUserSettings({
          userId: user.id,
          actorId: user.id,
          language,
          theme,
        });
        if (cancelled) {
          return;
        }
        serverSettingsRef.current = {
          userId: user.id,
          language: saved?.language ?? language,
          theme: saved?.theme ?? theme,
        };
        setSettingsSyncError("");
      } catch (error) {
        if (!cancelled) {
          setSettingsSyncError(error.message ?? "Failed to save user settings.");
        }
      }
    };

    persistSettings();

    return () => {
      cancelled = true;
    };
  }, [language, theme, user]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
      settingsSyncError,
    }),
    [login, logout, settingsSyncError, user],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
