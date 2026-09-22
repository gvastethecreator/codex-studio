import React, {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';

import {
  APPEARANCE_STORAGE_KEY,
  applyWorkbenchAmbientToDocument,
  type WorkbenchAppearance,
} from '../lib/workbenchAmbient';
import { useLocalStorage } from './useLocalStorage';

const STORAGE_KEY = 'codex-studio-accent-palette';

export type AccentPalette = {
  name: string;
  colors: Record<
    '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | '950',
    string
  >;
};

export function rgbTripletToHex(rgb: string): string {
  const [r, g, b] = rgb
    .trim()
    .split(/\s+/)
    .map((part) => Number.parseInt(part, 10));
  const toHex = (channel: number) =>
    Math.max(0, Math.min(255, Number.isFinite(channel) ? channel : 0))
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function accentOnColor(rgb: string): string {
  const [r, g, b] = rgb
    .trim()
    .split(/\s+/)
    .map((part) => Number.parseInt(part, 10));
  const y = ((r || 0) * 299 + (g || 0) * 587 + (b || 0) * 114) / 1000;
  return y >= 150 ? '#141414' : '#f4f4f4';
}

export const ACCENT_PALETTES: AccentPalette[] = [
  {
    name: 'Neutral',
    colors: {
      50: '250 250 250',
      100: '245 245 245',
      200: '229 229 229',
      300: '212 212 212',
      400: '163 163 163',
      500: '115 115 115',
      600: '82 82 82',
      700: '64 64 64',
      800: '38 38 38',
      900: '23 23 23',
      950: '10 10 10',
    },
  },
  {
    name: 'Rose',
    colors: {
      50: '255 241 242',
      100: '255 228 230',
      200: '254 205 211',
      300: '253 164 175',
      400: '251 113 133',
      500: '244 63 94',
      600: '225 29 72',
      700: '190 18 60',
      800: '159 18 57',
      900: '136 19 55',
      950: '76 5 25',
    },
  },
  {
    name: 'Orange',
    colors: {
      50: '255 247 237',
      100: '255 237 213',
      200: '254 215 170',
      300: '253 186 116',
      400: '251 146 60',
      500: '249 115 22',
      600: '234 88 12',
      700: '194 65 12',
      800: '154 52 18',
      900: '124 45 18',
      950: '67 20 7',
    },
  },
  {
    name: 'Amber',
    colors: {
      50: '255 251 235',
      100: '254 243 199',
      200: '253 230 138',
      300: '252 211 77',
      400: '251 191 36',
      500: '245 158 11',
      600: '217 119 6',
      700: '180 83 9',
      800: '146 64 14',
      900: '120 53 15',
      950: '69 26 3',
    },
  },
  {
    name: 'Green',
    colors: {
      50: '240 253 244',
      100: '220 252 231',
      200: '187 247 208',
      300: '134 239 172',
      400: '74 222 128',
      500: '34 197 94',
      600: '22 163 74',
      700: '21 128 61',
      800: '22 101 52',
      900: '20 83 45',
      950: '5 46 22',
    },
  },
  {
    name: 'Cyan',
    colors: {
      50: '236 254 255',
      100: '207 250 254',
      200: '165 243 252',
      300: '103 232 249',
      400: '34 211 238',
      500: '6 182 212',
      600: '8 145 178',
      700: '14 116 144',
      800: '21 94 117',
      900: '22 78 99',
      950: '8 51 68',
    },
  },
  {
    name: 'Blue',
    colors: {
      50: '239 246 255',
      100: '219 234 254',
      200: '191 219 254',
      300: '147 197 253',
      400: '96 165 250',
      500: '59 130 246',
      600: '37 99 235',
      700: '29 78 216',
      800: '30 64 175',
      900: '30 58 138',
      950: '23 37 84',
    },
  },
  {
    name: 'Violet',
    colors: {
      50: '245 243 255',
      100: '237 233 254',
      200: '221 214 254',
      300: '196 181 253',
      400: '167 139 250',
      500: '139 92 246',
      600: '124 58 237',
      700: '109 40 217',
      800: '91 33 182',
      900: '76 29 149',
      950: '46 16 101',
    },
  },
];

export function applyAccentPaletteToDocument(
  palette: AccentPalette,
  root: CSSStyleDeclaration | HTMLElement = document.documentElement,
) {
  const style = 'style' in root ? root.style : root;
  Object.entries(palette.colors).forEach(([shade, value]) => {
    style.setProperty(`--accent-${shade}`, value);
  });
  const hex = rgbTripletToHex(palette.colors[500]);
  const onAccent = accentOnColor(palette.colors[500]);
  style.setProperty('--wb-accent', hex);
  style.setProperty('--wba-accent', hex);
  style.setProperty('--wbp-accent', hex);
  style.setProperty('--create-primary', hex);
  style.setProperty('--wb-on-accent', onAccent);
  style.setProperty('--create-on-primary', onAccent);
}

type ThemeContextValue = {
  appearance: WorkbenchAppearance;
  currentTheme: string;
  cycleTheme: () => void;
  toggleAppearance: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function useThemeState(): ThemeContextValue {
  const [storedPalette, setStoredPalette] = useLocalStorage<string>(STORAGE_KEY, 'Neutral');
  const palette =
    ACCENT_PALETTES.find((entry) => entry.name === storedPalette) ?? ACCENT_PALETTES[0];
  const initialized = useRef(false);
  const [appearance, setAppearance] = useLocalStorage<WorkbenchAppearance>(
    APPEARANCE_STORAGE_KEY,
    typeof window === 'undefined'
      ? 'dark'
      : (() => {
          try {
            const raw = window.localStorage.getItem(APPEARANCE_STORAGE_KEY);
            if (!raw) return 'dark';
            const parsed = JSON.parse(raw) as unknown;
            return parsed === 'light' ? 'light' : 'dark';
          } catch {
            return 'dark';
          }
        })(),
  );

  const cycleTheme = useCallback(() => {
    setStoredPalette((current) => {
      const index = Math.max(
        0,
        ACCENT_PALETTES.findIndex((entry) => entry.name === current),
      );
      return ACCENT_PALETTES[(index + 1) % ACCENT_PALETTES.length].name;
    });
  }, [setStoredPalette]);

  const toggleAppearance = useCallback(() => {
    setAppearance((current) => {
      const next: WorkbenchAppearance = current === 'light' ? 'dark' : 'light';
      applyWorkbenchAmbientToDocument(document, next);
      return next;
    });
  }, [setAppearance]);

  useLayoutEffect(() => {
    applyWorkbenchAmbientToDocument(document, appearance);
  }, [appearance]);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!initialized.current || reducedMotion?.matches) {
      initialized.current = true;
      applyAccentPaletteToDocument(palette);
      return;
    }

    // Interpolate shared tokens once per frame, including portal and SVG consumers.
    // A new click starts from the displayed colors and cancels the previous frame.
    const computed = getComputedStyle(root);
    const shades = Object.entries(palette.colors).map(([shade, target]) => ({
      shade,
      from: computed.getPropertyValue(`--accent-${shade}`).trim().split(/\s+/).map(Number),
      to: target.split(' ').map(Number),
    }));
    const start = performance.now();
    let frame = 0;
    const finish = () => {
      cancelAnimationFrame(frame);
      applyAccentPaletteToDocument(palette);
    };
    const tick = (now: number) => {
      const progress = Math.max(0, Math.min(1, (now - start) / 280));
      const eased = 1 - (1 - progress) ** 3;
      const colors = Object.fromEntries(
        shades.map(({ shade, from, to }) => [
          shade,
          to
            .map((channel, index) => Math.round(from[index] + (channel - from[index]) * eased))
            .join(' '),
        ]),
      ) as AccentPalette['colors'];
      applyAccentPaletteToDocument({ name: palette.name, colors });
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    reducedMotion?.addEventListener('change', finish);
    return () => {
      cancelAnimationFrame(frame);
      reducedMotion?.removeEventListener('change', finish);
    };
  }, [palette]);

  return useMemo(
    () => ({
      appearance,
      currentTheme: palette.name,
      cycleTheme,
      toggleAppearance,
    }),
    [appearance, cycleTheme, palette.name, toggleAppearance],
  );
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const value = useThemeState();
  return React.createElement(ThemeContext, { value }, children);
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme requires ThemeProvider');
  }
  return context;
};
