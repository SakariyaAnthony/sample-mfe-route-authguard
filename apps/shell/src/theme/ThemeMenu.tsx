import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { CUSTOM_PALETTES } from './palettes';
import { getThemeState, selectApiTheme, selectPalette, subscribeTheme } from './themeStore';

function useTheme() {
  return useSyncExternalStore(subscribeTheme, getThemeState, getThemeState);
}

function ThemeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.25" />
      <path fill="currentColor" d="M8 2.2a5.8 5.8 0 0 0 0 11.6V2.2z" />
    </svg>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" focusable="false" style={{ transform: open ? 'rotate(90deg)' : undefined }}>
      <path d="M4 2.2 8 6 4 9.8" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ThemeMenu() {
  const theme = useTheme();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [palettesOpen, setPalettesOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const chooseApiTheme = (mode: 'light' | 'dark') => {
    selectApiTheme(mode);
    setOpen(false);
  };

  return (
    <div className="theme-menu dropdown" ref={rootRef}>
      <button
        type="button"
        className="btn btn-sm btn-outline-light theme-menu-button"
        aria-label="Choose theme"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-busy={theme.loading}
        onClick={() => {
          setOpen((value) => {
            const next = !value;
            if (next) setPalettesOpen(theme.mode === 'custom');
            return next;
          });
        }}
      >
        <ThemeIcon />
      </button>
      {open && (
        <div className="dropdown-menu dropdown-menu-end show" role="menu" aria-label="Themes">
          <button
            type="button"
            role="menuitemradio"
            aria-checked={theme.mode === 'light'}
            className={`dropdown-item${theme.mode === 'light' ? ' active' : ''}`}
            onClick={() => chooseApiTheme('light')}
          >
            Light
          </button>
          <button
            type="button"
            role="menuitemradio"
            aria-checked={theme.mode === 'dark'}
            className={`dropdown-item${theme.mode === 'dark' ? ' active' : ''}`}
            onClick={() => chooseApiTheme('dark')}
          >
            Dark
          </button>
          <button
            type="button"
            className={`dropdown-item d-flex justify-content-between align-items-center${theme.mode === 'custom' ? ' active' : ''}`}
            aria-expanded={palettesOpen}
            onClick={() => setPalettesOpen((value) => !value)}
          >
            Custom
            <Chevron open={palettesOpen} />
          </button>
          {palettesOpen &&
            CUSTOM_PALETTES.map((palette) => (
              <button
                key={palette.id}
                type="button"
                role="menuitemradio"
                aria-checked={theme.paletteId === palette.id}
                className={`dropdown-item d-flex align-items-center gap-2 ps-4${theme.paletteId === palette.id ? ' active' : ''}`}
                onClick={() => {
                  selectPalette(palette);
                  setOpen(false);
                }}
              >
                <span className="theme-swatch border" aria-hidden="true">
                  <span style={{ backgroundColor: palette.primary }} />
                  <span style={{ backgroundColor: palette.bodyBg }} />
                </span>
                {palette.name}
              </button>
            ))}
          {theme.error && <p className="dropdown-item-text text-danger small mb-0">{theme.error}</p>}
        </div>
      )}
    </div>
  );
}
