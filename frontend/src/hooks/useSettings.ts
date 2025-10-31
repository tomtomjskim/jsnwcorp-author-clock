import { useState, useEffect } from 'react';

export type TimeFormat = '24h' | '12h';
export type QuoteInterval = 1 | 5 | 10 | 30 | 60 | 360 | 720 | 1440; // minutes
export type DateFormat = 'hidden' | 'ko-long' | 'ko-short' | 'en-long' | 'en-short' | 'en-iso';
export type DatePosition = 'above-time' | 'below-time' | 'above-quote' | 'below-quote';

export interface Settings {
  timeFormat: TimeFormat;
  quoteInterval: QuoteInterval;
  dateFormat: DateFormat;
  datePosition: DatePosition;
}

const DEFAULT_SETTINGS: Settings = {
  timeFormat: '24h',
  quoteInterval: 1440, // 24 hours (daily)
  dateFormat: 'ko-long',
  datePosition: 'above-time',
};

const STORAGE_KEY = 'author-clock-settings';

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return {
    settings,
    updateSettings,
    resetSettings,
  };
}
