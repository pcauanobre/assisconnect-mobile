import React, { createContext, useContext, useRef, useState, useCallback } from 'react';

const TAP_WINDOW_MS = 1500;
const TAPS_TO_ACTIVATE = 5;

const DebugContext = createContext({
  debugMode: false,
  notifyHomeTap: () => {},
  disableDebug: () => {},
});

export function DebugProvider({ children }) {
  const [debugMode, setDebugMode] = useState(false);
  const tapsRef = useRef([]);

  const notifyHomeTap = useCallback(() => {
    const now = Date.now();
    tapsRef.current = [...tapsRef.current, now].filter((t) => now - t <= TAP_WINDOW_MS);
    if (tapsRef.current.length >= TAPS_TO_ACTIVATE) {
      tapsRef.current = [];
      setDebugMode(true);
    }
  }, []);

  const disableDebug = useCallback(() => setDebugMode(false), []);

  return (
    <DebugContext.Provider value={{ debugMode, notifyHomeTap, disableDebug }}>
      {children}
    </DebugContext.Provider>
  );
}

export function useDebug() {
  return useContext(DebugContext);
}
