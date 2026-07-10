import {
  IconBolt as Bolt,
  IconBook as BookOpen,
  IconBox as Box,
  IconBuilding as Building,
  IconCamera as Camera,
  IconChevronLeft as ChevronLeft,
  IconChevronRight as ChevronRight,
  IconMovie as Clapperboard,
  IconDeviceGamepad2 as Gamepad2,
  IconHeart as Heart,
  IconStack as Layers,
  IconPalette as Palette,
  IconPencil as PenTool,
  IconPlayerPlay as Play,
  IconSearch as Search,
  IconShirt as Shirt,
  IconAdjustmentsHorizontal as SlidersHorizontal,
  IconMoodPlus as SmilePlus,
  IconSparkles as Sparkles,
  IconStar as Star,
  IconSword as Sword,
  IconDeviceTv as Tv,
  IconWand as Wand2,
  IconMoonStars as MoonStars,
} from '@tabler/icons-react';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import gsap from '../../lib/motionRuntime';
import {
  STYLE_COLLECTION_FAMILIES,
  STYLE_COLLECTIONS,
} from './styles/collections/styleCollectionDefinitions';
import type { StyleCollection } from './styles/collections/styleCollectionTypes';
import {
  getStyleCollectionFolderImageCandidates,
  getStyleFolderImages,
  STYLE_FOLDER_FILE_LIMIT,
  type StyleFolderImageCandidate,
} from './styles/collections/styleCollectionFolderImages';
import { STYLE_RUNTIME_PACK_SUMMARIES } from './stylesData';
import { USER_STYLE_PACK_ID } from './userStyleRuntimeAdapter';

const FAVORITES_PACK_ID = 'favorites';
const STYLE_FOLDER_EASE = 'power3.out';
const STYLE_FOLDER_EXIT_EASE = 'power2.inOut';
const STYLE_FOLDER_SCATTER_X = [-34, 32, -12, 25, -24] as const;
const STYLE_FOLDER_SCATTER_Y = [-52, -66, -78, -59, -72] as const;
const STYLE_FOLDER_SCATTER_ROTATE = [-7, 8, -4, 5, -6] as const;
const STYLE_NAVIGATION_PREVIEW_DELAY_MS = 150;

type StyleTheme = { bg: string; text: string };

const PACK_THEMES: Record<string, StyleTheme> = {
  [USER_STYLE_PACK_ID]: { bg: 'bg-sky-500', text: 'text-sky-400' },
  [FAVORITES_PACK_ID]: { bg: 'bg-rose-600', text: 'text-rose-500' },
  pack_01: { bg: 'bg-cyan-500', text: 'text-cyan-400' },
  pack_02: { bg: 'bg-indigo-500', text: 'text-indigo-400' },
  pack_03: { bg: 'bg-rose-500', text: 'text-rose-400' },
  pack_04: { bg: 'bg-fuchsia-500', text: 'text-fuchsia-400' },
  pack_05: { bg: 'bg-red-600', text: 'text-red-500' },
  pack_06: { bg: 'bg-amber-500', text: 'text-amber-400' },
  pack_07: { bg: 'bg-emerald-500', text: 'text-emerald-400' },
  pack_08: { bg: 'bg-violet-500', text: 'text-violet-400' },
  pack_09: { bg: 'bg-lime-500', text: 'text-lime-400' },
  pack_10: { bg: 'bg-blue-500', text: 'text-blue-400' },
  pack_11: { bg: 'bg-orange-500', text: 'text-orange-400' },
  pack_12: { bg: 'bg-emerald-500', text: 'text-emerald-400' },
  pack_13: { bg: 'bg-pink-500', text: 'text-pink-400' },
  pack_14: { bg: 'bg-violet-500', text: 'text-violet-400' },
  pack_15: { bg: 'bg-teal-500', text: 'text-teal-400' },
  pack_16: { bg: 'bg-rose-500', text: 'text-rose-400' },
  pack_17: { bg: 'bg-green-500', text: 'text-green-400' },
};

const COLLECTION_FAMILY_THEMES: Record<string, StyleTheme> = {
  personal: PACK_THEMES[USER_STYLE_PACK_ID],
  capture_reality: PACK_THEMES.pack_01,
  screen_motion: PACK_THEMES.pack_02,
  illustration_art_media: PACK_THEMES.pack_04,
  design_assets_materials: PACK_THEMES.pack_09,
  worlds_genres: PACK_THEMES.pack_15,
  experimental_play: PACK_THEMES.pack_10,
};

const VISIBLE_STYLE_COLLECTIONS = STYLE_COLLECTIONS.filter(
  (collection) => collection.entries.length > 0 && collection.id !== 'my_styles',
);
const STYLE_NAVIGATION_COLLECTIONS = VISIBLE_STYLE_COLLECTIONS.filter(
  (collection) => collection.familyId !== 'personal',
);

const PACK_CARD_TITLES: Record<string, string> = {
  pack_01: 'Photo Realism',
  pack_02: 'Cinematic Media',
  pack_03: '3D CGI',
  pack_04: 'Graphic Novel',
  pack_05: 'Anime Battle',
  pack_06: 'Essential Art',
  pack_07: 'Architecture',
  pack_08: 'Fashion Costume',
  pack_09: 'Texture Material',
  pack_10: 'Abstract Lab',
  pack_11: 'Fun Oddities',
  pack_12: 'Game Originals',
  pack_13: 'Anime Lifestyle',
  pack_14: 'Mythic Noir',
  pack_15: 'Punk Spectrum',
  pack_16: 'Anime Prestige',
  pack_17: 'Dungeon Zine',
};

const PACK_CARD_DESCRIPTIONS: Record<string, string> = {
  pack_01: 'Photography, film stock, lens, portrait, lighting.',
  pack_02: 'Film, broadcast, animation, media-grade looks.',
  pack_03: 'CGI, render engines, materials, stylized 3D.',
  pack_04: 'Comics, illustration, ink, posters, editorial art.',
  pack_05: 'Action anime, battles, mecha, fantasy worlds.',
  pack_06: 'Painting, print, drawing, mixed media, digital art.',
  pack_07: 'Architecture, interiors, landscapes, spatial design.',
  pack_08: 'Fashion, costume, fabric, subculture silhouettes.',
  pack_09: 'Materials, surfaces, texture, wear, procedural FX.',
  pack_10: 'Glitch, geometry, surreal systems, visual experiments.',
  pack_11: 'Playful objects, food, toys, science curiosities.',
  pack_12: 'Game-native worlds, arenas, quests, encounter moods.',
  pack_13: 'Character anime, slice-of-life, shojo, magical moods.',
  pack_14: 'Dark myth, elegant symbols, noir authorial looks.',
  pack_15: 'Punk languages, DIY rebellion, biotech, media ghosts.',
  pack_16: 'Classic anime craft, prestige drama, retro eras.',
  pack_17: 'Fantasy zines, dungeons, bestiary, grim kingdoms.',
};

interface StyleCollectionsLandingSurfaceProps {
  favoritesCount: number;
  userStyleCount: number;
  isNavigationPanelOpen: boolean;
  getCollectionTabId: (collectionId: string) => string;
  getStyleTabHash: (tabId: string) => string;
  onNavigateToStyleTab: (tabId: string) => void;
  onToggleNavigationPanel: () => void;
}

interface StyleFolderCardProps {
  id: string;
  targetId: string;
  title: string;
  description: string;
  countLabel: string;
  countAriaLabel: string;
  eyebrow: string;
  sourcePackIds: string[];
  imageCandidates?: StyleFolderImageCandidate[];
  icon: React.ReactNode;
  theme: StyleTheme;
  index: number;
  tabId: string;
  tabHash: string;
  dataAttributes: Record<string, string>;
  isHighlighted: boolean;
  onOpen: () => void;
}

interface StyleNavigationItem {
  id: string;
  targetId: string;
  label: string;
  caption: string;
  countLabel: string;
  tabId: string;
  theme: StyleTheme;
  icon: React.ReactNode;
  kind: 'collection' | 'source';
}

interface StyleNavigationSection {
  id: string;
  title: string;
  items: StyleNavigationItem[];
}

function getStyleCollectionIcon(icon: string, size = 18): React.ReactNode {
  switch (icon) {
    case 'sparkles':
      return <Sparkles size={size} />;
    case 'heart':
      return <Heart size={size} fill="currentColor" />;
    case 'clock':
      return <Star size={size} />;
    case 'camera':
      return <Camera size={size} />;
    case 'film':
    case 'clapperboard':
      return <Clapperboard size={size} />;
    case 'bolt':
    case 'zap':
      return <Bolt size={size} />;
    case 'scan':
      return <Search size={size} />;
    case 'tv':
      return <Tv size={size} />;
    case 'play':
      return <Play size={size} />;
    case 'book':
      return <BookOpen size={size} />;
    case 'palette':
    case 'brush':
      return <Palette size={size} />;
    case 'pen':
      return <PenTool size={size} />;
    case 'wand':
      return <Wand2 size={size} />;
    case 'box':
      return <Box size={size} />;
    case 'layers':
    case 'grid':
      return <Layers size={size} />;
    case 'shirt':
      return <Shirt size={size} />;
    case 'building':
      return <Building size={size} />;
    case 'gamepad':
      return <Gamepad2 size={size} />;
    case 'moon':
    case 'moon-stars':
      return <MoonStars size={size} />;
    case 'sword':
      return <Sword size={size} />;
    case 'sliders':
      return <SlidersHorizontal size={size} />;
    case 'smile':
      return <SmilePlus size={size} />;
    default:
      return <Layers size={size} />;
  }
}

function getPackIcon(id: string): React.ReactNode {
  const size = 18;
  switch (id) {
    case 'pack_01':
      return <Camera size={size} />;
    case 'pack_02':
      return <Clapperboard size={size} />;
    case 'pack_03':
      return <Box size={size} />;
    case 'pack_04':
      return <PenTool size={size} />;
    case 'pack_05':
      return <Sword size={size} />;
    case 'pack_06':
      return <Palette size={size} />;
    case 'pack_07':
      return <Building size={size} />;
    case 'pack_08':
      return <Shirt size={size} />;
    case 'pack_09':
      return <Layers size={size} />;
    case 'pack_10':
      return <Wand2 size={size} />;
    case 'pack_11':
      return <SmilePlus size={size} />;
    case 'pack_12':
      return <Gamepad2 size={size} />;
    case 'pack_13':
      return <Heart size={size} />;
    case 'pack_14':
      return <MoonStars size={size} />;
    case 'pack_15':
      return <Bolt size={size} />;
    case 'pack_16':
      return <Star size={size} />;
    case 'pack_17':
      return <BookOpen size={size} />;
    default:
      return <Layers size={size} />;
  }
}

function getStyleCollectionTheme(collection: StyleCollection): StyleTheme {
  return COLLECTION_FAMILY_THEMES[collection.familyId] ?? PACK_THEMES.pack_01;
}

function getStyleCollectionTitleClassName(title: string) {
  if (title.length > 33) return 'text-[10px]';
  if (title.length > 25) return 'text-[11px]';
  if (title.length > 17) return 'text-xs';
  return 'text-sm';
}

function shouldReduceMotion() {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function StyleFolderCard({
  id,
  targetId,
  title,
  description,
  countLabel,
  countAriaLabel,
  eyebrow,
  sourcePackIds,
  imageCandidates,
  icon,
  theme,
  index,
  tabId: _tabId,
  tabHash,
  dataAttributes,
  isHighlighted,
  onOpen,
}: StyleFolderCardProps) {
  const rootRef = useRef<HTMLButtonElement | null>(null);
  const coverRef = useRef<HTMLDivElement | null>(null);
  const fileRefs = useRef<Array<HTMLDivElement | null>>([]);
  const timelineRef = useRef<ReturnType<typeof gsap.timeline> | null>(null);
  const entryTimelineRef = useRef<ReturnType<typeof gsap.timeline> | null>(null);
  const isOpenRef = useRef(false);
  const isNavigatingRef = useRef(false);
  const [filesMounted, setFilesMounted] = useState(false);
  const folderImages = useMemo(
    () => getStyleFolderImages({ seedId: id, sourcePackIds, imageCandidates }),
    [id, sourcePackIds, imageCandidates],
  );
  const { cover, files } = folderImages;
  const coverImage = cover.src;
  const titleClassName = getStyleCollectionTitleClassName(title);
  const getFileNodes = useCallback(
    () => fileRefs.current.slice(0, files.length).filter((node): node is HTMLDivElement => !!node),
    [files.length],
  );

  const stopFolderAnimation = useCallback(() => {
    const root = rootRef.current;
    const coverNode = coverRef.current;
    const fileNodes = getFileNodes();

    timelineRef.current?.kill();
    timelineRef.current = null;
    gsap.killTweensOf([root, coverNode, ...fileNodes].filter(Boolean));
    gsap.set([root, coverNode, ...fileNodes].filter(Boolean), { willChange: 'auto' });
  }, [getFileNodes]);

  const animateFolder = useCallback(
    (nextOpen: boolean) => {
      const root = rootRef.current;
      const coverNode = coverRef.current;
      const fileNodes = getFileNodes();
      if (shouldReduceMotion()) return;
      if (!root || !coverNode || fileNodes.length === 0 || isNavigatingRef.current) return;
      if (isOpenRef.current === nextOpen) return;

      isOpenRef.current = nextOpen;
      root.dataset.stylePackFolderOpen = nextOpen ? 'true' : 'false';
      stopFolderAnimation();

      const animatedNodes = [root, coverNode, ...fileNodes];
      const timeline = gsap.timeline({
        defaults: { overwrite: 'auto' },
        onStart: () => gsap.set(animatedNodes, { willChange: 'transform, opacity' }),
        onComplete: () => gsap.set(animatedNodes, { willChange: 'auto' }),
      });
      timeline.to(
        root,
        {
          y: nextOpen ? -3 : 0,
          duration: nextOpen ? 0.34 : 0.28,
          ease: STYLE_FOLDER_EASE,
        },
        0,
      );
      timeline.to(
        coverNode,
        {
          y: nextOpen ? 5 : 0,
          rotation: nextOpen ? -0.8 : 0,
          scale: nextOpen ? 0.985 : 1,
          duration: nextOpen ? 0.42 : 0.3,
          ease: STYLE_FOLDER_EASE,
        },
        0,
      );

      fileNodes.forEach((node, fileIndex) => {
        timeline.to(
          node,
          {
            x: nextOpen ? STYLE_FOLDER_SCATTER_X[fileIndex % STYLE_FOLDER_SCATTER_X.length] : 0,
            y: nextOpen
              ? STYLE_FOLDER_SCATTER_Y[fileIndex % STYLE_FOLDER_SCATTER_Y.length]
              : fileIndex * -4,
            rotation: nextOpen
              ? STYLE_FOLDER_SCATTER_ROTATE[fileIndex % STYLE_FOLDER_SCATTER_ROTATE.length]
              : 0,
            scale: nextOpen ? 1 : 0.94 + fileIndex * 0.012,
            zIndex: nextOpen ? 14 + fileIndex : 8 + fileIndex,
            duration: nextOpen ? 0.46 : 0.32,
            ease: STYLE_FOLDER_EASE,
          },
          nextOpen ? fileIndex * 0.035 : (STYLE_FOLDER_FILE_LIMIT - fileIndex - 1) * 0.016,
        );
      });

      timelineRef.current = timeline;
    },
    [getFileNodes, stopFolderAnimation],
  );

  const runExitAnimation = useCallback(() => {
    const root = rootRef.current;
    const coverNode = coverRef.current;
    const fileNodes = getFileNodes();
    if (shouldReduceMotion()) {
      onOpen();
      return;
    }
    if (!root || !coverNode || fileNodes.length === 0 || isNavigatingRef.current) return;

    isNavigatingRef.current = true;
    root.dataset.stylePackFolderOpen = 'exit';
    stopFolderAnimation();
    entryTimelineRef.current?.kill();

    const animatedNodes = [root, coverNode, ...fileNodes];
    const timeline = gsap.timeline({
      defaults: { overwrite: 'auto' },
      onStart: () => gsap.set(animatedNodes, { willChange: 'transform, opacity' }),
      onComplete: onOpen,
    });

    fileNodes.forEach((node, fileIndex) => {
      timeline.to(
        node,
        {
          x: STYLE_FOLDER_SCATTER_X[fileIndex % STYLE_FOLDER_SCATTER_X.length] * 0.8,
          y: STYLE_FOLDER_SCATTER_Y[fileIndex % STYLE_FOLDER_SCATTER_Y.length] - 20,
          rotation:
            STYLE_FOLDER_SCATTER_ROTATE[fileIndex % STYLE_FOLDER_SCATTER_ROTATE.length] * 1.2,
          scale: 0.98,
          opacity: 0,
          duration: 0.24,
          ease: STYLE_FOLDER_EXIT_EASE,
        },
        fileIndex * 0.018,
      );
    });

    timeline.to(
      coverNode,
      {
        y: 10,
        scale: 0.96,
        opacity: 0,
        duration: 0.22,
        ease: STYLE_FOLDER_EXIT_EASE,
      },
      0.04,
    );
    timeline.to(
      root,
      {
        y: -10,
        scale: 0.985,
        opacity: 0,
        duration: 0.24,
        ease: STYLE_FOLDER_EXIT_EASE,
      },
      0.08,
    );

    timelineRef.current = timeline;
  }, [getFileNodes, onOpen, stopFolderAnimation]);

  const handleOpen = useCallback(() => {
    if (!filesMounted) {
      setFilesMounted(true);
      window.requestAnimationFrame(runExitAnimation);
      return;
    }

    runExitAnimation();
  }, [filesMounted, runExitAnimation]);

  const handleFolderEnter = useCallback(() => {
    if (!filesMounted) setFilesMounted(true);
    animateFolder(true);
  }, [animateFolder, filesMounted]);

  useEffect(() => {
    if (isHighlighted) {
      if (!filesMounted) setFilesMounted(true);
      window.requestAnimationFrame(() => animateFolder(true));
      return;
    }

    animateFolder(false);
  }, [animateFolder, filesMounted, isHighlighted]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const coverNode = coverRef.current;
    const fileNodes = getFileNodes();
    if (!root || !coverNode || fileNodes.length === 0) return undefined;

    root.dataset.stylePackFolderOpen = 'false';
    isOpenRef.current = false;
    isNavigatingRef.current = false;

    gsap.set(root, {
      opacity: shouldReduceMotion() ? 1 : 0,
      y: shouldReduceMotion() ? 0 : 14,
      scale: shouldReduceMotion() ? 1 : 0.985,
      transformOrigin: 'center bottom',
    });
    gsap.set(coverNode, {
      y: 0,
      rotation: 0,
      scale: 1,
      opacity: 1,
      zIndex: 40,
      transformOrigin: 'center bottom',
    });
    fileNodes.forEach((node, fileIndex) => {
      gsap.set(node, {
        x: 0,
        y: fileIndex * -4,
        rotation: 0,
        scale: 0.94 + fileIndex * 0.012,
        opacity: 1,
        zIndex: 8 + fileIndex,
        transformOrigin: 'center center',
      });
    });

    if (!shouldReduceMotion()) {
      entryTimelineRef.current?.kill();
      entryTimelineRef.current = gsap
        .timeline({
          defaults: { overwrite: 'auto' },
          onStart: () => gsap.set(root, { willChange: 'transform, opacity' }),
          onComplete: () => gsap.set(root, { willChange: 'auto' }),
        })
        .to(root, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.36,
          delay: Math.min(0.42, index * 0.026),
          ease: STYLE_FOLDER_EASE,
        });
    }

    return () => {
      timelineRef.current?.kill();
      entryTimelineRef.current?.kill();
      gsap.killTweensOf([root, coverNode, ...fileNodes]);
    };
  }, [files.length, getFileNodes, index]);

  return (
    <button
      type="button"
      ref={rootRef}
      data-style-pack-folder-open="false"
      data-style-folder-target={targetId}
      data-style-folder-highlighted={isHighlighted ? 'true' : 'false'}
      data-style-tab-url={`#${tabHash}`}
      aria-label={`Open ${title}`}
      onClick={handleOpen}
      onPointerEnter={handleFolderEnter}
      onPointerLeave={() => animateFolder(false)}
      onFocus={handleFolderEnter}
      onBlur={() => animateFolder(false)}
      className={`group relative z-0 block aspect-[3/4] min-h-[252px] w-full cursor-pointer overflow-visible rounded-[6px] text-left outline-none transition-[filter] duration-200 hover:z-20 focus-visible:z-20 focus-visible:ring-2 focus-visible:ring-white/35 sm:min-h-[286px] ${
        isHighlighted ? 'z-30 brightness-[1.08]' : ''
      }`}
      style={{ perspective: '1200px' }}
      {...dataAttributes}
    >
      {isHighlighted && (
        <span className="pointer-events-none absolute -inset-2 z-[70] rounded-[9px] border border-white/30 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_22px_55px_rgba(255,255,255,0.10)]" />
      )}
      <div className="absolute inset-0 rounded-[6px] border border-white/8 bg-zinc-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]" />
      <div
        className={`absolute -top-2 left-0 h-4 w-[46%] rounded-t-[6px] border-x border-t border-white/10 ${theme.bg} opacity-60 shadow-[0_8px_22px_rgba(0,0,0,0.28)]`}
      />

      {files.map((file, fileIndex) => (
        <div
          key={file.id}
          ref={(node) => {
            fileRefs.current[fileIndex] = node;
          }}
          data-style-pack-folder-file={file.id}
          aria-hidden="true"
          className="absolute inset-x-4 bottom-11 top-8 overflow-hidden rounded-[6px] border border-white/10 bg-zinc-900 shadow-[0_18px_34px_rgba(0,0,0,0.38)]"
        >
          {filesMounted && file.src ? (
            <img
              src={file.src}
              alt=""
              width={320}
              height={420}
              loading="lazy"
              decoding="async"
              className="size-full object-cover"
            />
          ) : filesMounted ? (
            <div className={`flex size-full items-center justify-center bg-zinc-900 ${theme.text}`}>
              {icon}
            </div>
          ) : (
            <div className="size-full bg-zinc-900" />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-white/10" />
          <div
            className={`absolute left-2 top-2 flex size-6 items-center justify-center rounded-[6px] border border-white/10 bg-black/42 ${theme.text} backdrop-blur`}
          >
            {icon}
          </div>
        </div>
      ))}

      <div
        ref={coverRef}
        data-style-pack-folder-cover={id}
        className="absolute inset-0 overflow-visible rounded-[6px] border border-white/10 bg-zinc-900 shadow-[0_18px_42px_rgba(0,0,0,0.38)]"
        style={{ transformOrigin: 'center bottom' }}
      >
        <div
          className={`absolute -top-3 left-0 h-5 w-[54%] rounded-t-[6px] border-x border-t border-white/10 ${theme.bg} opacity-75 shadow-[0_8px_22px_rgba(0,0,0,0.32)]`}
        />
        <div className="absolute inset-0 overflow-hidden rounded-[6px]">
          <div className="absolute inset-0 bg-zinc-950">
            {coverImage ? (
              <img
                src={coverImage}
                alt=""
                width={420}
                height={560}
                loading="lazy"
                decoding="async"
                className="size-full object-cover opacity-[0.72] transition-[opacity,transform,filter] duration-300 group-hover:scale-[1.025] group-hover:opacity-[0.88] group-hover:saturate-[1.05]"
              />
            ) : (
              <div className={`flex size-full items-center justify-center ${theme.text}`}>
                {icon}
              </div>
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black via-black/46 to-black/8" />
            <div className={`absolute inset-x-0 top-0 h-1 ${theme.bg}`} />
          </div>

          <div className="relative z-10 flex h-full flex-col justify-end p-3.5 sm:p-4">
            <div className="absolute right-3 top-3 sm:right-4 sm:top-4">
              <span
                data-style-pack-count={id}
                aria-label={countAriaLabel}
                className={`flex min-w-9 items-center justify-center rounded-[6px] border border-white/10 ${theme.bg} px-2 py-1 text-[10px] font-black tabular-nums text-white/95 shadow-[0_8px_18px_rgba(0,0,0,0.28)] backdrop-blur-md`}
                style={
                  {
                    '--tw-bg-opacity': '0.76',
                    textShadow: '0 1px 5px rgba(0,0,0,0.78)',
                  } as React.CSSProperties
                }
              >
                {countLabel}
              </span>
            </div>

            <div className="min-w-0">
              <p className={`mb-1 text-[9px] font-black uppercase tracking-widest ${theme.text}`}>
                {eyebrow}
              </p>
              <h3
                data-style-pack-card-title={id}
                className={`flex min-w-0 items-center gap-1.5 whitespace-nowrap font-black leading-tight tracking-normal text-white ${titleClassName}`}
              >
                <span className={`flex size-6 shrink-0 items-center justify-center ${theme.text}`}>
                  {icon}
                </span>
                <span className="min-w-0 truncate">{title}</span>
              </h3>
              <p className="mt-1.5 line-clamp-2 text-[10px] font-medium leading-snug text-zinc-300/86">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

function StyleCollectionCard({
  collection,
  countLabel,
  familyLabel,
  targetId,
  index,
  tabId,
  isHighlighted,
  onOpen,
  getStyleTabHash,
}: {
  collection: StyleCollection;
  countLabel: string;
  familyLabel: string;
  targetId: string;
  index: number;
  tabId: string;
  isHighlighted: boolean;
  onOpen: () => void;
  getStyleTabHash: (tabId: string) => string;
}) {
  const theme = getStyleCollectionTheme(collection);
  const imageCandidates = useMemo(
    () => getStyleCollectionFolderImageCandidates(collection),
    [collection],
  );

  return (
    <StyleFolderCard
      id={collection.id}
      targetId={targetId}
      title={collection.title}
      description={collection.description}
      countLabel={countLabel}
      countAriaLabel={`${collection.title} count ${countLabel}`}
      eyebrow={familyLabel}
      sourcePackIds={collection.sourcePackIds}
      imageCandidates={imageCandidates}
      icon={getStyleCollectionIcon(collection.icon)}
      theme={theme}
      index={index}
      tabId={tabId}
      tabHash={getStyleTabHash(tabId)}
      dataAttributes={{ 'data-style-collection-card': collection.id }}
      isHighlighted={isHighlighted}
      onOpen={onOpen}
    />
  );
}

function SourcePackCard({
  pack,
  targetId,
  index,
  getStyleTabHash,
  isHighlighted,
  onOpen,
}: {
  pack: (typeof STYLE_RUNTIME_PACK_SUMMARIES)[number];
  targetId: string;
  index: number;
  getStyleTabHash: (tabId: string) => string;
  isHighlighted: boolean;
  onOpen: () => void;
}) {
  const theme = PACK_THEMES[pack.id] ?? PACK_THEMES.pack_01;
  const title = PACK_CARD_TITLES[pack.id] ?? pack.name;

  return (
    <StyleFolderCard
      id={pack.id}
      targetId={targetId}
      title={title}
      description={PACK_CARD_DESCRIPTIONS[pack.id] ?? pack.description}
      countLabel={`${pack.presetCount}`}
      countAriaLabel={`${pack.name} presets ${pack.presetCount}`}
      eyebrow="Source pack"
      sourcePackIds={[pack.id]}
      icon={getPackIcon(pack.id)}
      theme={theme}
      index={index}
      tabId={pack.id}
      tabHash={getStyleTabHash(pack.id)}
      dataAttributes={{ 'data-style-pack-card': pack.id }}
      isHighlighted={isHighlighted}
      onOpen={onOpen}
    />
  );
}

function StyleNavigationPanel({
  sections,
  activeTargetId,
  onPreview,
  onOpen,
  onClose,
}: {
  sections: StyleNavigationSection[];
  activeTargetId: string | null;
  onPreview: (item: StyleNavigationItem) => void;
  onOpen: (tabId: string) => void;
  onClose: () => void;
}) {
  const previewDelayRef = useRef<number | null>(null);

  const cancelDelayedPreview = useCallback(() => {
    if (previewDelayRef.current === null) return;
    window.clearTimeout(previewDelayRef.current);
    previewDelayRef.current = null;
  }, []);

  const scheduleDelayedPreview = useCallback(
    (item: StyleNavigationItem) => {
      cancelDelayedPreview();
      previewDelayRef.current = window.setTimeout(() => {
        previewDelayRef.current = null;
        onPreview(item);
      }, STYLE_NAVIGATION_PREVIEW_DELAY_MS);
    },
    [cancelDelayedPreview, onPreview],
  );

  useEffect(() => cancelDelayedPreview, [cancelDelayedPreview]);

  return (
    <aside className="hidden min-h-0 min-w-0 lg:block" data-style-landing-navigation>
      <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[6px] border border-white/8 bg-zinc-950/78 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <div className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-white/6 px-3">
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-zinc-500">
              Quick Map
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            data-style-landing-navigation-toggle
            className="flex size-7 shrink-0 items-center justify-center rounded-[6px] border border-white/8 bg-white/[0.035] text-zinc-500 transition-colors hover:bg-white/8 hover:text-white"
            aria-label="Hide style map"
            title="Hide style map"
          >
            <ChevronLeft size={14} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-2 custom-scrollbar">
          {sections.map((section) => (
            <div key={section.id} className="mb-3 last:mb-0">
              <div className="mb-1.5 flex items-center gap-2 px-1">
                <span className="h-px flex-1 bg-white/6" />
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-600">
                  {section.title}
                </span>
                <span className="h-px flex-1 bg-white/6" />
              </div>
              <div className="flex flex-col gap-1">
                {section.items.map((item) => {
                  const active = activeTargetId === item.targetId;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      data-style-nav-item={item.targetId}
                      onPointerEnter={(event) => {
                        if (event.pointerType === 'touch') return;
                        scheduleDelayedPreview(item);
                      }}
                      onPointerLeave={cancelDelayedPreview}
                      onFocus={() => {
                        cancelDelayedPreview();
                        onPreview(item);
                      }}
                      onClick={() => {
                        cancelDelayedPreview();
                        onOpen(item.tabId);
                      }}
                      className={`group/nav flex min-h-9 w-full items-center gap-2 rounded-[6px] border px-2 py-1.5 text-left outline-none transition-[background-color,border-color,transform,color] duration-150 focus-visible:ring-2 focus-visible:ring-white/30 ${
                        active
                          ? 'border-white/18 bg-white/10 text-white'
                          : 'border-transparent bg-transparent text-zinc-500 hover:border-white/10 hover:bg-white/[0.045] hover:text-zinc-200'
                      }`}
                    >
                      <span
                        className={`flex size-6 shrink-0 items-center justify-center rounded-[5px] border border-white/8 bg-white/[0.035] ${item.theme.text}`}
                      >
                        {item.icon}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={`block truncate text-[10px] font-black uppercase tracking-normal ${
                            active ? item.theme.text : 'text-zinc-300 group-hover/nav:text-white'
                          }`}
                        >
                          {item.label}
                        </span>
                        <span className="block truncate text-[9px] font-medium text-zinc-600">
                          {item.caption}
                        </span>
                      </span>
                      <span
                        className={`rounded-[5px] border border-white/8 px-1.5 py-0.5 text-[8px] font-black tabular-nums ${active ? `${item.theme.bg} text-white` : 'bg-white/[0.035] text-zinc-500'}`}
                        style={
                          active
                            ? ({ '--tw-bg-opacity': '0.68' } as React.CSSProperties)
                            : undefined
                        }
                      >
                        {item.countLabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

export function StyleCollectionsLandingSurface({
  favoritesCount,
  userStyleCount,
  isNavigationPanelOpen,
  getCollectionTabId,
  getStyleTabHash,
  onNavigateToStyleTab,
  onToggleNavigationPanel,
}: StyleCollectionsLandingSurfaceProps) {
  const [activeNavigationTargetId, setActiveNavigationTargetId] = useState<string | null>(null);
  const cardsScrollerRef = useRef<HTMLDivElement | null>(null);
  const previewFrameRef = useRef<number | null>(null);
  const personalStyleCollections = useMemo(
    () =>
      STYLE_COLLECTIONS.filter(
        (collection) => collection.id === 'my_styles' || collection.id === 'favorites',
      ),
    [],
  );
  const styleCollectionFamilySections = useMemo(
    () =>
      STYLE_COLLECTION_FAMILIES.map((family) => ({
        family,
        collections: STYLE_NAVIGATION_COLLECTIONS.filter(
          (collection) => collection.familyId === family.id,
        ),
      })).filter((section) => section.collections.length > 0),
    [],
  );
  const navigationSections = useMemo<StyleNavigationSection[]>(() => {
    const personalItems = personalStyleCollections.map((collection) => {
      const isUserStyles = collection.id === 'my_styles';
      const tabId = isUserStyles ? USER_STYLE_PACK_ID : FAVORITES_PACK_ID;
      const theme = getStyleCollectionTheme(collection);
      return {
        id: `collection:${collection.id}`,
        targetId: `collection:${collection.id}`,
        label: collection.title,
        caption: 'Personal',
        countLabel: `${isUserStyles ? userStyleCount : favoritesCount}`,
        tabId,
        theme,
        icon: getStyleCollectionIcon(collection.icon, 14),
        kind: 'collection',
      } satisfies StyleNavigationItem;
    });

    const collectionSections = styleCollectionFamilySections.map(({ family, collections }) => ({
      id: family.id,
      title: family.title,
      items: collections.map((collection) => {
        const theme = getStyleCollectionTheme(collection);
        return {
          id: `collection:${collection.id}`,
          targetId: `collection:${collection.id}`,
          label: collection.title,
          caption: family.title,
          countLabel: `${collection.sourcePackIds.length}`,
          tabId: getCollectionTabId(collection.id),
          theme,
          icon: getStyleCollectionIcon(collection.icon, 14),
          kind: 'collection',
        } satisfies StyleNavigationItem;
      }),
    }));

    return [
      { id: 'personal', title: 'Personal', items: personalItems },
      ...collectionSections,
      {
        id: 'source',
        title: 'Source',
        items: STYLE_RUNTIME_PACK_SUMMARIES.map((pack) => {
          const theme = PACK_THEMES[pack.id] ?? PACK_THEMES.pack_01;
          return {
            id: `source:${pack.id}`,
            targetId: `source:${pack.id}`,
            label: PACK_CARD_TITLES[pack.id] ?? pack.name,
            caption: 'Source pack',
            countLabel: `${pack.presetCount}`,
            tabId: pack.id,
            theme,
            icon: getPackIcon(pack.id),
            kind: 'source',
          } satisfies StyleNavigationItem;
        }),
      },
    ];
  }, [
    favoritesCount,
    getCollectionTabId,
    personalStyleCollections,
    styleCollectionFamilySections,
    userStyleCount,
  ]);

  const previewNavigationItem = useCallback((item: StyleNavigationItem) => {
    setActiveNavigationTargetId(item.targetId);
    if (previewFrameRef.current !== null) window.cancelAnimationFrame(previewFrameRef.current);

    previewFrameRef.current = window.requestAnimationFrame(() => {
      const scroller = cardsScrollerRef.current;
      const target = document.querySelector<HTMLElement>(
        `[data-style-folder-target="${item.targetId}"]`,
      );
      if (!scroller || !target) return;

      const scrollerRect = scroller.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const targetTop = targetRect.top - scrollerRect.top + scroller.scrollTop;
      const centeredTop = targetTop - Math.max(0, (scroller.clientHeight - targetRect.height) / 2);
      const maxTop = Math.max(0, scroller.scrollHeight - scroller.clientHeight);

      scroller.scrollTo({
        top: Math.min(Math.max(0, centeredTop), maxTop),
        behavior: shouldReduceMotion() ? 'auto' : 'smooth',
      });
    });
  }, []);

  useEffect(() => {
    return () => {
      if (previewFrameRef.current !== null) window.cancelAnimationFrame(previewFrameRef.current);
    };
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-4 sm:px-5 sm:py-5 2xl:px-6">
      <div className="mb-4 shrink-0 flex flex-col gap-1">
        <h2 className="vt-style-pack-title text-2xl font-black uppercase tracking-normal text-white sm:tracking-tight">
          Style Packs
        </h2>
        <p className="max-w-3xl text-[10px] font-medium leading-relaxed text-zinc-500">
          Collection-first style systems grouped by creative intent.
        </p>
      </div>

      <div
        className={`grid min-h-0 min-w-0 flex-1 gap-4 overflow-hidden ${
          isNavigationPanelOpen
            ? 'lg:grid-cols-[216px_minmax(0,1fr)]'
            : 'lg:grid-cols-[40px_minmax(0,1fr)]'
        }`}
      >
        {isNavigationPanelOpen ? (
          <StyleNavigationPanel
            sections={navigationSections}
            activeTargetId={activeNavigationTargetId}
            onPreview={previewNavigationItem}
            onOpen={onNavigateToStyleTab}
            onClose={onToggleNavigationPanel}
          />
        ) : (
          <aside
            data-style-landing-navigation-rail
            className="hidden min-h-0 min-w-0 items-start justify-center rounded-[6px] border border-white/8 bg-zinc-950/70 p-1.5 lg:flex"
          >
            <button
              type="button"
              onClick={onToggleNavigationPanel}
              data-style-landing-navigation-toggle
              className="flex size-7 items-center justify-center rounded-[6px] text-zinc-500 transition-colors hover:bg-white/8 hover:text-white"
              aria-label="Show style map"
              title="Show style map"
            >
              <ChevronRight size={14} />
            </button>
          </aside>
        )}

        <div
          ref={cardsScrollerRef}
          data-style-card-scroll-root
          className="min-h-0 min-w-0 overflow-y-auto overflow-x-hidden pr-1 custom-scrollbar"
        >
          <div className="flex min-w-0 flex-col gap-5 pb-16">
            <section data-style-collection-family="personal" className="min-w-0">
              <div className="mb-2 flex items-center gap-2">
                <div className="h-4 w-1 rounded-[2px] bg-sky-500" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300">
                  Personal
                </h3>
                <div className="h-px flex-1 bg-white/6" />
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3 xl:grid-cols-[repeat(auto-fill,minmax(210px,1fr))]">
                {personalStyleCollections.map((collection, index) => {
                  const tabId =
                    collection.id === 'my_styles' ? USER_STYLE_PACK_ID : FAVORITES_PACK_ID;
                  const isUserStyles = collection.id === 'my_styles';
                  const targetId = `collection:${collection.id}`;
                  return (
                    <StyleCollectionCard
                      key={collection.id}
                      collection={collection}
                      countLabel={`${isUserStyles ? userStyleCount : favoritesCount}`}
                      familyLabel="Personal"
                      targetId={targetId}
                      index={index}
                      tabId={tabId}
                      isHighlighted={activeNavigationTargetId === targetId}
                      getStyleTabHash={getStyleTabHash}
                      onOpen={() => onNavigateToStyleTab(tabId)}
                    />
                  );
                })}
              </div>
            </section>

            {styleCollectionFamilySections.map(({ family, collections }) => {
              const familyTheme = COLLECTION_FAMILY_THEMES[family.id] ?? PACK_THEMES.pack_01;
              return (
                <section
                  key={family.id}
                  data-style-collection-family={family.id}
                  className="min-w-0"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <div className={`h-4 w-1 rounded-[2px] ${familyTheme.bg}`} />
                    <div className="min-w-0">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300">
                        {family.title}
                      </h3>
                      <p className="mt-0.5 line-clamp-1 text-[10px] font-medium text-zinc-600">
                        {family.description}
                      </p>
                    </div>
                    <div className="h-px flex-1 bg-white/6" />
                  </div>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3 xl:grid-cols-[repeat(auto-fill,minmax(210px,1fr))]">
                    {collections.map((collection, index) => {
                      const tabId = getCollectionTabId(collection.id);
                      const targetId = `collection:${collection.id}`;
                      return (
                        <StyleCollectionCard
                          key={collection.id}
                          collection={collection}
                          countLabel={`${collection.sourcePackIds.length}`}
                          familyLabel={family.title}
                          targetId={targetId}
                          index={index}
                          tabId={tabId}
                          isHighlighted={activeNavigationTargetId === targetId}
                          getStyleTabHash={getStyleTabHash}
                          onOpen={() => onNavigateToStyleTab(tabId)}
                        />
                      );
                    })}
                  </div>
                </section>
              );
            })}

            <section
              data-style-source-packs-section
              className="rounded-[6px] border border-white/8 bg-zinc-950/72"
            >
              <div
                data-style-source-packs-summary
                className="flex items-center gap-2 px-3 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400"
              >
                <Layers size={16} />
                Source Packs
                <span className="ml-auto rounded-[6px] border border-white/10 bg-white/[0.035] px-2 py-1 text-[9px] text-zinc-500">
                  {STYLE_RUNTIME_PACK_SUMMARIES.length}
                </span>
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(158px,1fr))] gap-3 border-t border-white/6 p-3 sm:grid-cols-[repeat(auto-fill,minmax(190px,1fr))] xl:grid-cols-[repeat(auto-fill,minmax(204px,1fr))]">
                {STYLE_RUNTIME_PACK_SUMMARIES.map((pack, index) => {
                  const targetId = `source:${pack.id}`;
                  return (
                    <SourcePackCard
                      key={pack.id}
                      pack={pack}
                      targetId={targetId}
                      index={index}
                      getStyleTabHash={getStyleTabHash}
                      isHighlighted={activeNavigationTargetId === targetId}
                      onOpen={() => onNavigateToStyleTab(pack.id)}
                    />
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
