export interface OnboardingStyleCarouselSeed {
  presetId: string;
  styleName: string;
  packName: string;
  prompt: string;
}

export interface OnboardingStyleCarouselEntry extends OnboardingStyleCarouselSeed {
  imageUrl: string;
  alt: string;
}

export const ONBOARDING_STYLE_CAROUSEL_SEEDS: OnboardingStyleCarouselSeed[] = [
  {
    presetId: 'SP02-001',
    styleName: 'Film Noir',
    packName: 'Cinematic & Media',
    prompt:
      'Use the Styles recipe preset SP02-001 Film Noir: one original subject in silver-gelatin contrast, venetian slat shadows, hard directional key light, deep charcoal blacks, no text, no UI.',
  },
  {
    presetId: 'SP02-003',
    styleName: '80s Sci-Fi',
    packName: 'Cinematic & Media',
    prompt:
      'Use the Styles recipe preset SP02-003 80s Sci-Fi: one clear subject in nocturnal magenta/cyan neon, wet reflections, volumetric haze, anamorphic flare, practical-FX atmosphere, no text, no UI.',
  },
  {
    presetId: 'SP02-004',
    styleName: 'Technicolor Musical',
    packName: 'Cinematic & Media',
    prompt:
      'Use the Styles recipe preset SP02-004 Technicolor Musical: one theatrical subject with ruby, emerald, and sapphire dye-transfer saturation, broad studio fill, painted-backdrop clarity, no text, no UI.',
  },
  {
    presetId: 'SP01-005',
    styleName: 'Cinematic Close-up',
    packName: 'Photography & Realism',
    prompt:
      'Use the Styles recipe preset SP01-005 Cinematic Close-up: one focused subject in tight anamorphic framing, shallow depth of field, teal-orange tension, Rembrandt shadow, no text, no UI.',
  },
  {
    presetId: 'SP06-082',
    styleName: 'SNES Mode 7 Vista',
    packName: 'Essential Art Styles',
    prompt:
      'Use the Styles recipe preset SP06-082 SNES Mode 7 Vista: a readable scene flattened into affine 16-bit pseudo-3D plane depth, chunky scanline artifacts, scaled sprites, no text, no UI.',
  },
  {
    presetId: 'SP06-095',
    styleName: 'Sega Genesis Dither-Heavy',
    packName: 'Essential Art Styles',
    prompt:
      'Use the Styles recipe preset SP06-095 Sega Genesis Dither-Heavy: one bold subject with crunchy 16-bit contours, checkerboard transparency dithering, 64-color grit, parallax energy, no text, no UI.',
  },
  {
    presetId: 'SP11-047',
    styleName: 'Candy Land',
    packName: 'Miscellaneous & Fun',
    prompt:
      'Use the Styles recipe preset SP11-047 Candy Land: one playful subject rebuilt with sugar-gloss materials, gumdrop translucency, frosting edges, candy-pattern color harmony, no text, no UI.',
  },
  {
    presetId: 'SP11-050',
    styleName: 'Cocktail Macro',
    packName: 'Miscellaneous & Fun',
    prompt:
      'Use the Styles recipe preset SP11-050 Cocktail Macro: one luxurious close subject through chilled glass optics, condensation beads, ice caustics, liquid gradients, garnish-like accents, no text, no UI.',
  },
];

const FALLBACK_CAROUSEL_SEED: OnboardingStyleCarouselSeed = {
  presetId: 'SP01-001',
  styleName: 'Studio Headshot',
  packName: 'Photography & Realism',
  prompt:
    'Use the Styles recipe preset SP01-001 Studio Headshot: one centered subject with polished studio softbox lighting, neutral seamless backdrop, realistic surface detail, no text, no UI.',
};

export function buildOnboardingStyleCarouselEntries(
  imageByPresetId: Record<string, string | undefined>,
  fallbackImageUrl: string,
): OnboardingStyleCarouselEntry[] {
  const entries = ONBOARDING_STYLE_CAROUSEL_SEEDS.flatMap((seed) => {
    const imageUrl = imageByPresetId[seed.presetId];
    if (!imageUrl) return [];

    return [
      {
        ...seed,
        imageUrl,
        alt: `${seed.styleName} style recipe preview`,
      },
    ];
  });

  if (entries.length > 0) return entries;

  return [
    {
      ...FALLBACK_CAROUSEL_SEED,
      imageUrl: fallbackImageUrl,
      alt: `${FALLBACK_CAROUSEL_SEED.styleName} style recipe preview`,
    },
  ];
}

export function pickNextOnboardingStyleCarouselIndex(
  length: number,
  currentIndex: number,
  random: () => number = Math.random,
) {
  if (length <= 1) return 0;

  const nextIndex = Math.floor(random() * length);
  return nextIndex === currentIndex ? (nextIndex + 1) % length : nextIndex;
}
