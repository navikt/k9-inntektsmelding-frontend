import { useEffect, useState } from "react";
import type { ZodSchema } from "zod";

/** En useState versjon som lagrer innholdet til session storage.
 *
 * Session storage er en måte å lagre data på i nettleseren, som varer til
 * nettleservinduet lukkes. Dataen deles ikke på tvers av tabs eller vinduer.
 *
 * @param key - Nøkkelen som brukes for å lagre dataen i session storage.
 * @param defaultValue - Standardverdien som brukes om det ikke finnes noe lagret data.
 *
 * @example
 * ```tsx
 * const [count, setCount] = useSessionStorageState("count", 0);
 * ```
 */
export function useSessionStorageState<T = unknown>(
  key: string,
  defaultValue: T,
  schema: ZodSchema,
) {
  const [state, setState] = useState<T>(
    () => parseStorageItem<T>(sessionStorage, key, schema) ?? defaultValue,
  );
  useEffect(() => {
    sessionStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);
  return [state, setState] as const;
}

export function useLocalStorageState<T = unknown>(
  key: string,
  defaultValue: T,
  schema: ZodSchema,
) {
  const [state, setState] = useState<T>(
    () => parseStorageItem<T>(localStorage, key, schema) ?? defaultValue,
  );
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);
  return [state, setState] as const;
}

export function parseStorageItem<T = unknown>(
  storage: Storage,
  key: string,
  schema: ZodSchema,
): T | undefined {
  const item = storage.getItem(key);

  if (item) {
    const { success, data } = schema.safeParse(JSON.parse(item));
    return success ? (data as T) : undefined;
  }
  return undefined;
}
