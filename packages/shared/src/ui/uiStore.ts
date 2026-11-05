import { useStore } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createStore } from 'zustand/vanilla';
import { createGlobalStore } from '../store/createGlobalStore';

export type ToastType = 'success' | 'danger' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface UiState {
  toasts: Toast[];
  sidebarCollapsed: boolean;
}

const TOAST_DURATION_MS = 4000;

const uiStore = createGlobalStore('ui', () =>
  createStore<UiState>()(
    persist((): UiState => ({ toasts: [], sidebarCollapsed: false }), {
      name: 'rib.ui',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
    }),
  ),
);

export function dismissToast(id: string): void {
  uiStore.setState((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
}

/** Shows a toast in whichever shell is hosting the caller. Safe to call from any MFE. */
export function notify(message: string, type: ToastType = 'success'): void {
  // Several failing requests often produce the same message at once.
  if (uiStore.getState().toasts.some((t) => t.message === message && t.type === type)) return;
  const id = crypto.randomUUID();
  uiStore.setState((state) => ({ toasts: [...state.toasts, { id, type, message }] }));
  setTimeout(() => dismissToast(id), TOAST_DURATION_MS);
}

export function toggleSidebar(): void {
  uiStore.setState((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
}

export const useToasts = (): Toast[] => useStore(uiStore, (state) => state.toasts);

export const useSidebarCollapsed = (): boolean => useStore(uiStore, (state) => state.sidebarCollapsed);
