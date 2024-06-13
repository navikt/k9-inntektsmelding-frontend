import * as React from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const state = React.useState<T>(() =>
    getParsedLocalStorageItem(key, initialValue),
  );

  React.useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state[0]));
  }, [state[0]]);

  return state;
}

export function getParsedLocalStorageItem<T>(key: string, initialValue: T) {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : initialValue;
}
