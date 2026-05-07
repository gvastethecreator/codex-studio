import { useCallback, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

const STORAGE_KEY = 'chorita-theme-index';

const PALETTES = [
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
    name: 'Emerald',
    colors: {
      50: '236 253 245',
      100: '209 250 229',
      200: '167 243 208',
      300: '110 231 183',
      400: '52 211 153',
      500: '16 185 129',
      600: '5 150 105',
      700: '4 120 87',
      800: '6 95 70',
      900: '6 78 59',
      950: '2 44 34',
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

export const useTheme = () => {
  const [currentPaletteIndex, setCurrentPaletteIndex] = useLocalStorage<number>(STORAGE_KEY, 0);

  const applyTheme = useCallback(
    (index: number) => {
      const palette = PALETTES[index];
      const root = document.documentElement;

      Object.entries(palette.colors).forEach(([shade, value]) => {
        root.style.setProperty(`--accent-${shade}`, value);
      });
      setCurrentPaletteIndex(index);
    },
    [setCurrentPaletteIndex],
  );

  const cycleTheme = useCallback(() => {
    setCurrentPaletteIndex((prevIndex) => {
      const nextIndex = (prevIndex + 1) % PALETTES.length;
      applyTheme(nextIndex);
      return nextIndex;
    });
  }, [applyTheme, setCurrentPaletteIndex]);

  useEffect(() => {
    applyTheme(currentPaletteIndex);
  }, [applyTheme, currentPaletteIndex]);

  return {
    currentTheme: PALETTES[currentPaletteIndex].name,
    cycleTheme,
  };
};
