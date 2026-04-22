import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@accessibility_config';

const defaultConfig = {
  fontScale: 1,
  highContrast: false,
};

const AccessibilityContext = createContext({
  config: defaultConfig,
  setFontScale: () => {},
  setHighContrast: () => {},
  scale: (n) => n,
});

export function AccessibilityProvider({ children }) {
  const [config, setConfig] = useState(defaultConfig);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) setConfig({ ...defaultConfig, ...JSON.parse(saved) });
      } catch {}
    })();
  }, []);

  async function persist(newConfig) {
    setConfig(newConfig);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    } catch {}
  }

  function setFontScale(fontScale) {
    persist({ ...config, fontScale });
  }

  function setHighContrast(highContrast) {
    persist({ ...config, highContrast });
  }

  function scale(value) {
    if (typeof value === 'number') return Math.round(value * config.fontScale);
    return value;
  }

  return (
    <AccessibilityContext.Provider
      value={{ config, setFontScale, setHighContrast, scale }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  return useContext(AccessibilityContext);
}
