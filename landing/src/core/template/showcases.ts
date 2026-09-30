export type ShowcaseTheme = "light" | "dark";

export interface ShowcaseAsset {
  from: string;
  to: string;
}

export interface HeroStill {
  src: string;
  alt: string;
  caption: string;
}

export interface TemplateShowcase {
  id: string;
  example: string;
  theme: ShowcaseTheme;
  accent: string;
  heroGallery?: HeroStill[];
  extraAssets?: ShowcaseAsset[];
}

const EXAMPLE_STILLS: HeroStill[] = [
  {
    src: "assets/example-sprite-boy.jpg",
    alt: "Pixel forest scout running through dark pines",
    caption: "SpriteBoy Studio",
  },
  {
    src: "assets/example-tokenusage.jpg",
    alt: "Five colored bars of different lengths on a dark desk",
    caption: "TokenUsage",
  },
  {
    src: "assets/example-catalog.jpg",
    alt: "Three stacked dark page boards on a black table",
    caption: "Section catalog",
  },
  {
    src: "assets/example-color-studio.jpg",
    alt: "Five painted color panels on a workbench",
    caption: "Color Studio",
  },
];

const EXAMPLE_STILL_ASSETS: ShowcaseAsset[] = [
  { from: "assets/examples/sprite-boy.jpg", to: "example-sprite-boy.jpg" },
  { from: "assets/examples/tokenusage.jpg", to: "example-tokenusage.jpg" },
  { from: "assets/examples/catalog.jpg", to: "example-catalog.jpg" },
  { from: "assets/examples/color-studio.jpg", to: "example-color-studio.jpg" },
];

const SPRITE_BOY_SCREENS: ShowcaseAsset[] = [
  { from: "examples/sprite-boy/assets/slice-workspace.png", to: "slice-workspace.png" },
  { from: "examples/sprite-boy/assets/compose-workspace.png", to: "compose-workspace.png" },
  { from: "examples/sprite-boy/assets/collision-workspace.png", to: "collision-workspace.png" },
  { from: "examples/sprite-boy/assets/export-workspace.png", to: "export-workspace.png" },
];

export const TEMPLATE_SHOWCASES: TemplateShowcase[] = [
  {
    id: "default",
    example: "catalog",
    theme: "dark",
    accent: "#c9c9c9",
    heroGallery: EXAMPLE_STILLS,
    extraAssets: [...EXAMPLE_STILL_ASSETS, ...SPRITE_BOY_SCREENS],
  },
  {
    id: "editorial-dark",
    example: "open.md",
    theme: "dark",
    accent: "#d9d9d9",
  },
  {
    id: "technical-mono",
    example: "knife",
    theme: "dark",
    accent: "#9bd4c8",
  },
  {
    id: "soft-product",
    example: "color-studio",
    theme: "light",
    accent: "#3d3d3d",
    extraAssets: [{ from: "assets/examples/color-studio.jpg", to: "example-color-studio.jpg" }],
    heroGallery: [
      {
        src: "assets/example-color-studio.jpg",
        alt: "Five painted color panels on a workbench",
        caption: "Color Studio",
      },
      { src: "assets/palette-composer.png", alt: "Palette composer", caption: "Composer" },
      { src: "assets/gradient-lab.png", alt: "Gradient lab", caption: "Gradients" },
      { src: "assets/scale-lab.png", alt: "OKLCH scale lab", caption: "OKLCH scales" },
      { src: "assets/contrast-mix.png", alt: "Contrast and mix", caption: "Contrast" },
    ],
  },
  {
    id: "terminal",
    example: "spotify2tidal",
    theme: "dark",
    accent: "#3dff8b",
  },
  {
    id: "profile-standard",
    example: "gitbound",
    theme: "dark",
    accent: "#9bb4c8",
  },
  {
    id: "profile-folio",
    example: "gitbound",
    theme: "dark",
    accent: "#d8c4a0",
  },
  {
    id: "profile-observatory",
    example: "gitbound",
    theme: "dark",
    accent: "#7eb6d0",
  },
  {
    id: "profile-heatmap",
    example: "gitbound",
    theme: "dark",
    accent: "#3fb950",
  },
  {
    id: "profile-orbit",
    example: "gitbound",
    theme: "dark",
    accent: "#57e56c",
  },
  {
    id: "profile-projects",
    example: "gitbound",
    theme: "dark",
    accent: "#c4b8d4",
  },
];

export function templateShowcase(id: string): TemplateShowcase | undefined {
  return TEMPLATE_SHOWCASES.find((item) => item.id === id);
}
