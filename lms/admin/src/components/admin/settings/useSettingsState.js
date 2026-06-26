import { useCallback, useEffect, useState } from 'react';
import {
  ACCENT_PRESETS,
  ACCENT_STORAGE_KEY,
  DEFAULT_SETTINGS,
  SETTINGS_STORAGE_KEY,
} from './constants';

function loadSettings() {
  if (typeof window === 'undefined') return { ...DEFAULT_SETTINGS };
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    return {
      profile: { ...DEFAULT_SETTINGS.profile, ...parsed.profile },
      quickPrefs: { ...DEFAULT_SETTINGS.quickPrefs, ...parsed.quickPrefs },
      notifPrefs: { ...DEFAULT_SETTINGS.notifPrefs, ...parsed.notifPrefs },
      platform: { ...DEFAULT_SETTINGS.platform, ...parsed.platform },
      billing: { ...DEFAULT_SETTINGS.billing, ...parsed.billing },
      security: { ...DEFAULT_SETTINGS.security, ...parsed.security },
      appearancePrefs: { ...DEFAULT_SETTINGS.appearancePrefs, ...parsed.appearancePrefs },
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function loadAccent() {
  if (typeof window === 'undefined') return ACCENT_PRESETS[0].value;
  const stored = localStorage.getItem(ACCENT_STORAGE_KEY);
  const preset = ACCENT_PRESETS.find((p) => p.id === stored || p.value === stored);
  return preset?.value ?? ACCENT_PRESETS[0].value;
}

export function applyAccentCss(value) {
  if (typeof document === 'undefined') return;
  document.documentElement.style.setProperty('--admin-accent', value);
}

export function useSettingsState() {
  const [settings, setSettings] = useState(loadSettings);
  const [accent, setAccentState] = useState(loadAccent);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    applyAccentCss(accent);
  }, [accent]);

  const markDirty = useCallback(() => setDirty(true), []);

  const updateProfile = useCallback((patch) => {
    setSettings((s) => ({
      ...s,
      profile: {
        ...s.profile,
        ...patch,
        lastUpdated: 'Just now',
      },
    }));
    markDirty();
  }, [markDirty]);

  const updateQuickPrefs = useCallback((patch) => {
    setSettings((s) => ({ ...s, quickPrefs: { ...s.quickPrefs, ...patch } }));
    markDirty();
  }, [markDirty]);

  const updateNotifPrefs = useCallback((key, value) => {
    setSettings((s) => ({
      ...s,
      notifPrefs: { ...s.notifPrefs, [key]: value },
    }));
    markDirty();
  }, [markDirty]);

  const updatePlatform = useCallback((patch) => {
    setSettings((s) => ({ ...s, platform: { ...s.platform, ...patch } }));
    markDirty();
  }, [markDirty]);

  const updateBilling = useCallback((patch) => {
    setSettings((s) => ({ ...s, billing: { ...s.billing, ...patch } }));
    markDirty();
  }, [markDirty]);

  const updateSecurity = useCallback((patch) => {
    setSettings((s) => ({ ...s, security: { ...s.security, ...patch } }));
    markDirty();
  }, [markDirty]);

  const updateAppearancePrefs = useCallback((patch) => {
    setSettings((s) => ({ ...s, appearancePrefs: { ...s.appearancePrefs, ...patch } }));
    markDirty();
  }, [markDirty]);

  const setAccent = useCallback((value, presetId) => {
    setAccentState(value);
    const id = presetId ?? ACCENT_PRESETS.find((p) => p.value === value)?.id ?? 'custom';
    localStorage.setItem(ACCENT_STORAGE_KEY, id);
    applyAccentCss(value);
    markDirty();
  }, [markDirty]);

  const saveAll = useCallback(() => {
    const { profile, quickPrefs, notifPrefs, platform, billing, security, appearancePrefs } =
      settings;
    localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({
        profile,
        quickPrefs,
        notifPrefs,
        platform,
        billing,
        security,
        appearancePrefs,
      }),
    );
    setDirty(false);
    return true;
  }, [settings]);

  const exportSettings = useCallback(() => {
    const payload = {
      exportedAt: new Date().toISOString(),
      accent,
      ...settings,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uptoskills-settings-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [settings, accent]);

  const resetDirty = useCallback(() => {
    setSettings(loadSettings());
    setAccentState(loadAccent());
    setDirty(false);
  }, []);

  return {
    settings,
    accent,
    dirty,
    markDirty,
    updateProfile,
    updateQuickPrefs,
    updateNotifPrefs,
    updatePlatform,
    updateBilling,
    updateSecurity,
    updateAppearancePrefs,
    setAccent,
    saveAll,
    exportSettings,
    resetDirty,
  };
}
