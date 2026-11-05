import type { StoreApi } from 'zustand';

// @bank/shared is bundled separately into the host and each remote, so a store
// created at module level would exist once per bundle. Keeping the instance on
// globalThis makes the first bundle that loads create it and the rest reuse it.
type StoreRegistry = Record<string, StoreApi<unknown>>;

const globalScope = globalThis as typeof globalThis & { __bankStores__?: StoreRegistry };
const registry: StoreRegistry = (globalScope.__bankStores__ ??= {});

export function createGlobalStore<T>(key: string, create: () => StoreApi<T>): StoreApi<T> {
  registry[key] ??= create() as StoreApi<unknown>;
  return registry[key] as StoreApi<T>;
}
