import { CatalogCardBackdrop } from '../CatalogCardBackdrop';
import {
  IconChevronLeft as ChevronLeft,
  IconChevronRight as ChevronRight,
  IconStack as Layers,
} from '@tabler/icons-react';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
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
import { STYLE_LANDING_FOLDER_SUMMARIES_BY_ID } from '../../lib/styleLandingFolderIndex.generated';
import {
  loadStyleThumbnailPack,
  getStyleThumbnail,
  subscribeStyleThumbnailCatalog,
} from '../../lib/styleThumbnailCatalog';
import { STYLE_RUNTIME_PACK_SUMMARIES } from './stylesData';
import { resolveStyleRuntimePackLoadRequest } from './styleRuntimePackRequirements';
import { STYLE_PACKS_TAB_ID } from './styleTabRouting';
import { USER_STYLE_PACK_ID } from './userStyleRuntimeAdapter';
import {
  COLLECTION_FAMILY_THEMES,
  PACK_THEMES,
  getPackIcon,
  getStyleCollectionIcon,
  getStyleCollectionTheme,
} from './styleNavigationPresentation';
import type { StyleTheme } from './StyleRecipeNavigationPanel';

const FAVORITES_PACK_ID = 'favorites';
const STYLE_FOLDER_EASE = 'power3.out';
const STYLE_FOLDER_SCATTER_X = [-34, 32, -12, 25, -24] as const;
const STYLE_FOLDER_SCATTER_Y = [-52, -66, -78, -59, -72] as const;
const STYLE_FOLDER_SCATTER_ROTATE = [-7, 8, -4, 5, -6] as const;
const STYLE_NAVIGATION_PREVIEW_DELAY_MS = 150;

type StyleFolderGsap = typeof import('../../lib/motionRuntime').default;
type StyleFolderTimeline = ReturnType<StyleFolderGsap['timeline']>;

let styleFolderGsapPromise: Promise<StyleFolderGsap> | null = null;

function loadStyleFolderGsap() {
  styleFolderGsapPromise ??= import('../../lib/motionRuntime').then((module) => module.default);
  return styleFolderGsapPromise;
}

const VISIBLE_STYLE_COLLECTIONS = STYLE_COLLECTIONS.filter(
  (collection) => collection.entries.length > 0 && collection.id !== 'my_styles',
);
const STYLE_NAVIGATION_COLLECTIONS = VISIBLE_STYLE_COLLECTIONS.filter(
  (collection) => collection.familyId !== 'personal',
);

interface StyleCollectionsLandingSurfaceProps {
  favoritesCount: number;
  userStyleCount: number;
  isNavigationPanelOpen: boolean;
  getCollectionTabId: (collectionId: string) => string;
  getStyleTabHash: (tabId: string) => string;
  onNavigateToStyleTab: (tabId: string) => void;
  onPrefetchStyleTab?: (tabId: string) => void;
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
  onPrefetch?: () => void;
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

function getStyleCollectionTitleClassName(title: string) {
  if (title.length > 33) return 'text-[length:var(--wbp-label)]';
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
  onPrefetch,
}: StyleFolderCardProps) {
  const rootRef = useRef<HTMLButtonElement | null>(null);
  const coverRef = useRef<HTMLDivElement | null>(null);
  const fileRefs = useRef<Array<HTMLDivElement | null>>([]);
  const gsapRef = useRef<StyleFolderGsap | null>(null);
  const timelineRef = useRef<StyleFolderTimeline | null>(null);
  const isOpenRef = useRef(false);
  const folderImages = useMemo(
    () => getStyleFolderImages({ seedId: id, sourcePackIds, imageCandidates }),
    [id, sourcePackIds, imageCandidates],
  );
  const [filesMounted, setFilesMounted] = useState(
    () => Boolean(folderImages.cover.src) || folderImages.files.some((file) => Boolean(file.src)),
  );

  useEffect(() => {
    if (folderImages.cover.src || folderImages.files.some((file) => Boolean(file.src))) {
      setFilesMounted(true);
    }
  }, [folderImages]);
  const { cover, files } = folderImages;
  const coverImage = cover.src;
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
    gsapRef.current?.killTweensOf([root, coverNode, ...fileNodes].filter(Boolean));
    gsapRef.current?.set([root, coverNode, ...fileNodes].filter(Boolean), {
      willChange: 'auto',
    });
  }, [getFileNodes]);

  const animateFolder = useCallback(
    async (nextOpen: boolean) => {
      const root = rootRef.current;
      const coverNode = coverRef.current;
      const fileNodes = getFileNodes();
      if (shouldReduceMotion()) return;
      if (!root || !coverNode || fileNodes.length === 0) return;
      if (isOpenRef.current === nextOpen) return;

      const gsap = await loadStyleFolderGsap();
      if (!rootRef.current) return;
      gsapRef.current = gsap;

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

  const handleOpen = useCallback(() => {
    if (!filesMounted) setFilesMounted(true);
    onOpen();
  }, [filesMounted, onOpen]);

  const handleFolderEnter = useCallback(() => {
    if (!filesMounted) setFilesMounted(true);
    onPrefetch?.();
    void animateFolder(true);
  }, [animateFolder, filesMounted, onPrefetch]);

  useEffect(() => {
    if (isHighlighted && !filesMounted) setFilesMounted(true);
  }, [filesMounted, isHighlighted]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const coverNode = coverRef.current;
    const fileNodes = getFileNodes();
    if (!root || !coverNode || fileNodes.length === 0) return undefined;

    root.dataset.stylePackFolderOpen = 'false';
    isOpenRef.current = false;

    return () => {
      timelineRef.current?.kill();
      gsapRef.current?.killTweensOf([root, coverNode, ...fileNodes]);
    };
  }, [files.length, getFileNodes]);

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
      onPointerLeave={() => void animateFolder(false)}
      onFocus={handleFolderEnter}
      onBlur={() => void animateFolder(false)}
      className={`catalog-art-card style-folder-enter group relative z-0 block aspect-[3/4] w-full cursor-pointer overflow-visible rounded-[var(--wb-radius)] text-left outline-none transition-[filter] duration-200 hover:z-20 focus-visible:z-20 focus-visible:ring-2 focus-visible:ring-white/35 ${
        isHighlighted ? 'z-30 brightness-[1.08]' : ''
      }`}
      style={
        {
          perspective: '1200px',
          '--style-folder-enter-delay': `${Math.min(0.42, index * 0.026)}s`,
        } as React.CSSProperties
      }
      {...dataAttributes}
    >
      {isHighlighted && (
        <span className="pointer-events-none absolute -inset-2 z-[70] rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_22px_55px_rgba(255,255,255,0.10)]" />
      )}
      <div className="absolute inset-0 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-panel)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]" />

      {files.map((file, fileIndex) => (
        <div
          key={file.id}
          ref={(node) => {
            fileRefs.current[fileIndex] = node;
          }}
          data-style-pack-folder-file={file.id}
          aria-hidden="true"
          className="absolute inset-x-4 bottom-11 top-8 overflow-hidden rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-panel)] shadow-[0_18px_34px_rgba(0,0,0,0.38)]"
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
            <div
              className={`flex size-full items-center justify-center bg-[color:var(--wb-panel)] ${theme.text}`}
            >
              {icon}
            </div>
          ) : (
            <div className="size-full bg-[color:var(--wb-panel)]" />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-white/10" />
          <div
            className={`absolute left-2 top-2 flex size-6 items-center justify-center rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-black/42 ${theme.text} backdrop-blur`}
          >
            {icon}
          </div>
        </div>
      ))}

      <div
        ref={coverRef}
        data-style-pack-folder-cover={id}
        className="absolute inset-0 overflow-visible rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-panel)] shadow-[0_18px_42px_rgba(0,0,0,0.38)]"
        style={{ transformOrigin: 'center bottom' }}
      >
        <div className="absolute inset-0 overflow-hidden rounded-[var(--wb-radius)]">
          <div className="absolute inset-0 bg-[color:var(--wb-panel)]">
            {coverImage ? (
              <img
                src={coverImage}
                alt=""
                width={420}
                height={560}
                loading="lazy"
                decoding="async"
                className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.025]"
              />
            ) : (
              <div className={`flex size-full items-center justify-center ${theme.text}`}>
                {icon}
              </div>
            )}
            <div className={`absolute inset-x-0 top-0 h-1 ${theme.bg}`} />
          </div>

          <span
            data-style-pack-count={id}
            aria-label={countAriaLabel}
            className="absolute right-2 top-2 rounded-[var(--wb-radius)] bg-[color:var(--wb-panel)] px-2 py-1 text-xs"
          >
            {countLabel}
          </span>
          <CatalogCardBackdrop
            interactive={false}
            label={title}
            title={
              <span data-style-pack-card-title={id} className="flex min-w-0 items-center gap-1.5">
                <span className={theme.text}>{icon}</span>
                <span className="truncate">{title}</span>
              </span>
            }
          >
            <span className="sr-only">{eyebrow}</span>
            <p>{description}</p>
          </CatalogCardBackdrop>
        </div>
      </div>
    </button>
  );
}

function formatLandingFolderLabel(key: string) {
  const rawName = key.includes('__') ? key.slice(key.indexOf('__') + 2) : key;
  return (
    rawName
      .replace(/_/g, ' ')
      .replace(/\b[a-z]/g, (letter) => letter.toUpperCase())
      .trim() || key
  );
}

function getLandingFolderImageCandidates(id: string): StyleFolderImageCandidate[] {
  return (STYLE_LANDING_FOLDER_SUMMARIES_BY_ID[id]?.imageKeys ?? []).flatMap((key) => {
    const src = getStyleThumbnail(key);
    if (!src) return [];
    return [{ id: key, src, label: formatLandingFolderLabel(key) }];
  });
}

function useStyleLandingThumbnailCatalog() {
  const [revision, setRevision] = useState(0);

  useEffect(() => subscribeStyleThumbnailCatalog(() => setRevision((value) => value + 1)), []);

  useEffect(() => {
    const packIds = resolveStyleRuntimePackLoadRequest({
      isPackLandingOpen: true,
      currentPackId: STYLE_PACKS_TAB_ID,
      activeStyleCollectionId: null,
      activeCollectionSourcePackIds: [],
      isGlobalStyleBrowseTab: false,
      favoritesCount: 0,
      isGlobalStyleSearchActive: false,
      runtimePackIds: STYLE_RUNTIME_PACK_SUMMARIES.map((pack) => pack.id),
      favoritesPackId: FAVORITES_PACK_ID,
      visibleCollectionSourcePackIds: VISIBLE_STYLE_COLLECTIONS.flatMap(
        (collection) => collection.sourcePackIds,
      ),
    }).requiredThumbnailPackIds;
    let cancelled = false;
    void (async () => {
      for (let index = 0; index < packIds.length; index += 2) {
        if (cancelled) return;
        await Promise.all(
          packIds.slice(index, index + 2).map((packId) => loadStyleThumbnailPack(packId)),
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return revision;
}

function getLandingFolderPresetCount(id: string, fallback: number) {
  return STYLE_LANDING_FOLDER_SUMMARIES_BY_ID[id]?.presetCount ?? fallback;
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
  onPrefetch,
  getStyleTabHash,
  thumbnailRevision,
}: {
  collection: StyleCollection;
  countLabel: string;
  familyLabel: string;
  targetId: string;
  index: number;
  tabId: string;
  isHighlighted: boolean;
  onOpen: () => void;
  onPrefetch?: () => void;
  getStyleTabHash: (tabId: string) => string;
  thumbnailRevision: number;
}) {
  const theme = getStyleCollectionTheme(collection);
  const imageCandidates = useMemo(() => {
    const landingImages = getLandingFolderImageCandidates(collection.id);
    return landingImages.length > 0
      ? landingImages
      : getStyleCollectionFolderImageCandidates(collection);
  }, [collection, thumbnailRevision]);

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
      onPrefetch={onPrefetch}
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
  onPrefetch,
  thumbnailRevision,
}: {
  pack: (typeof STYLE_RUNTIME_PACK_SUMMARIES)[number];
  targetId: string;
  index: number;
  getStyleTabHash: (tabId: string) => string;
  isHighlighted: boolean;
  onOpen: () => void;
  onPrefetch?: () => void;
  thumbnailRevision: number;
}) {
  const theme = PACK_THEMES[pack.id] ?? PACK_THEMES.pack_01;
  const title = pack.cardTitle;
  const imageCandidates = useMemo(
    () => getLandingFolderImageCandidates(pack.id),
    [pack.id, thumbnailRevision],
  );

  return (
    <StyleFolderCard
      id={pack.id}
      targetId={targetId}
      title={title}
      description={pack.cardDescription}
      countLabel={`${pack.presetCount}`}
      countAriaLabel={`${pack.name} presets ${pack.presetCount}`}
      eyebrow="Source pack"
      sourcePackIds={[pack.id]}
      imageCandidates={imageCandidates}
      icon={getPackIcon(pack.id)}
      theme={theme}
      index={index}
      tabId={pack.id}
      tabHash={getStyleTabHash(pack.id)}
      dataAttributes={{ 'data-style-pack-card': pack.id }}
      isHighlighted={isHighlighted}
      onOpen={onOpen}
      onPrefetch={onPrefetch}
    />
  );
}

function useDemandMountedSection(
  scrollRootRef: React.RefObject<HTMLDivElement | null>,
  forceMount: boolean,
) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isMounted, setIsMounted] = useState(forceMount);

  useEffect(() => {
    if (forceMount) {
      setIsMounted(true);
      return;
    }
    if (isMounted) return;
    if (typeof IntersectionObserver === 'undefined') {
      setIsMounted(true);
      return;
    }

    const section = sectionRef.current;
    const root = scrollRootRef.current;
    if (!section || !root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setIsMounted(true);
        observer.disconnect();
      },
      { root, rootMargin: '360px 0px' },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [forceMount, isMounted, scrollRootRef]);

  return { sectionRef, isMounted };
}

function StyleFolderPlaceholder({
  targetId,
  title,
  tabHash,
  theme,
  dataAttributes,
  isHighlighted,
  onOpen,
}: {
  targetId: string;
  title: string;
  tabHash: string;
  theme: StyleTheme;
  dataAttributes: Record<string, string>;
  isHighlighted: boolean;
  onOpen: () => void;
  onPrefetch?: () => void;
}) {
  return (
    <button
      type="button"
      data-style-pack-folder-open="false"
      data-style-folder-target={targetId}
      data-style-folder-highlighted={isHighlighted ? 'true' : 'false'}
      data-style-tab-url={`#${tabHash}`}
      aria-label={`Open ${title}`}
      onClick={onOpen}
      className={`group relative z-0 block aspect-[3/4] w-full cursor-pointer overflow-hidden rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-panel)] text-left outline-none focus-visible:ring-2 focus-visible:ring-white/35 ${
        isHighlighted ? 'z-30 brightness-[1.08]' : ''
      }`}
      {...dataAttributes}
    >
      <span className={`absolute inset-x-0 top-0 h-1 ${theme.bg}`} />
      <span className="absolute inset-x-3 bottom-3 truncate text-xs font-semibold text-[color:var(--wb-muted)]">
        {title}
      </span>
    </button>
  );
}

function StyleCollectionFamilySection({
  family,
  collections,
  activeTargetId,
  scrollRootRef,
  getCollectionTabId,
  getStyleTabHash,
  onNavigateToStyleTab,
  onPrefetchStyleTab,
  thumbnailRevision,
}: {
  family: (typeof STYLE_COLLECTION_FAMILIES)[number];
  collections: StyleCollection[];
  activeTargetId: string | null;
  scrollRootRef: React.RefObject<HTMLDivElement | null>;
  getCollectionTabId: (collectionId: string) => string;
  getStyleTabHash: (tabId: string) => string;
  onNavigateToStyleTab: (tabId: string) => void;
  onPrefetchStyleTab?: (tabId: string) => void;
  thumbnailRevision: number;
}) {
  const forceMount = collections.some(
    (collection) => activeTargetId === `collection:${collection.id}`,
  );
  const { sectionRef, isMounted } = useDemandMountedSection(scrollRootRef, forceMount);
  const familyTheme = COLLECTION_FAMILY_THEMES[family.id] ?? PACK_THEMES.pack_01;

  return (
    <section
      ref={sectionRef}
      data-style-collection-family={family.id}
      data-style-family-mounted={isMounted ? 'true' : 'false'}
      className="min-w-0"
    >
      <div className="mb-2 flex items-center gap-2">
        <div className={`h-4 w-1 rounded-[var(--wb-radius)] ${familyTheme.bg}`} />
        <div className="min-w-0">
          <h3 className="text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-ink)]">
            {family.title}
          </h3>
          <p className="mt-0.5 line-clamp-1 text-[length:var(--wbp-label)] font-medium text-[color:var(--wb-dim)]">
            {family.description}
          </p>
        </div>
        <div className="h-px flex-1 bg-white/6" />
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3">
        {collections.map((collection, index) => {
          const tabId = getCollectionTabId(collection.id);
          const targetId = `collection:${collection.id}`;
          const sharedProps = {
            targetId,
            isHighlighted: activeTargetId === targetId,
            onOpen: () => onNavigateToStyleTab(tabId),
            onPrefetch: () => onPrefetchStyleTab?.(tabId),
          };

          return isMounted ? (
            <StyleCollectionCard
              key={collection.id}
              {...sharedProps}
              collection={collection}
              countLabel={`${getLandingFolderPresetCount(collection.id, collection.sourcePackIds.length)}`}
              familyLabel={family.title}
              index={index}
              tabId={tabId}
              getStyleTabHash={getStyleTabHash}
              thumbnailRevision={thumbnailRevision}
            />
          ) : (
            <StyleFolderPlaceholder
              key={collection.id}
              {...sharedProps}
              title={collection.title}
              tabHash={getStyleTabHash(tabId)}
              theme={getStyleCollectionTheme(collection)}
              dataAttributes={{ 'data-style-collection-card': collection.id }}
            />
          );
        })}
      </div>
    </section>
  );
}

function StyleSourcePacksSection({
  activeTargetId,
  scrollRootRef,
  getStyleTabHash,
  onNavigateToStyleTab,
  onPrefetchStyleTab,
  thumbnailRevision,
}: {
  activeTargetId: string | null;
  scrollRootRef: React.RefObject<HTMLDivElement | null>;
  getStyleTabHash: (tabId: string) => string;
  onNavigateToStyleTab: (tabId: string) => void;
  onPrefetchStyleTab?: (tabId: string) => void;
  thumbnailRevision: number;
}) {
  const forceMount = activeTargetId?.startsWith('source:') ?? false;
  const { sectionRef, isMounted } = useDemandMountedSection(scrollRootRef, forceMount);

  return (
    <section
      ref={sectionRef}
      data-style-source-packs-section
      data-style-source-packs-mounted={isMounted ? 'true' : 'false'}
      className="rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-panel)]"
    >
      <div
        data-style-source-packs-summary
        className="flex items-center gap-2 px-3 py-3 text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-muted)]"
      >
        <Layers size={16} />
        Source Packs
        <span className="ml-auto rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-white/[0.035] px-2 py-1 text-[length:var(--wbp-label)] text-[color:var(--wb-muted)]">
          {STYLE_RUNTIME_PACK_SUMMARIES.length}
        </span>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3 border-t border-[color:var(--wb-line)] p-3">
        {STYLE_RUNTIME_PACK_SUMMARIES.map((pack, index) => {
          const targetId = `source:${pack.id}`;
          const sharedProps = {
            targetId,
            isHighlighted: activeTargetId === targetId,
            onOpen: () => onNavigateToStyleTab(pack.id),
            onPrefetch: () => onPrefetchStyleTab?.(pack.id),
          };
          return isMounted ? (
            <SourcePackCard
              key={pack.id}
              {...sharedProps}
              pack={pack}
              index={index}
              getStyleTabHash={getStyleTabHash}
              thumbnailRevision={thumbnailRevision}
            />
          ) : (
            <StyleFolderPlaceholder
              key={pack.id}
              {...sharedProps}
              title={pack.cardTitle}
              tabHash={getStyleTabHash(pack.id)}
              theme={PACK_THEMES[pack.id] ?? PACK_THEMES.pack_01}
              dataAttributes={{ 'data-style-pack-card': pack.id }}
            />
          );
        })}
      </div>
    </section>
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
      <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-panel)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <div className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-[color:var(--wb-line)] px-3">
          <div className="min-w-0">
            <p className="text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-muted)]">
              Collections
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            data-style-landing-navigation-toggle
            className="flex size-7 shrink-0 items-center justify-center rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-white/[0.035] text-[color:var(--wb-muted)] transition-colors hover:bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] hover:text-[color:var(--wb-ink)]"
            aria-label="Hide style map"
            data-tooltip="Hide style map"
          >
            <ChevronLeft size={14} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-2 custom-scrollbar">
          {sections.map((section) => (
            <div key={section.id} className="mb-3 last:mb-0">
              <div className="mb-1.5 flex items-center gap-2 px-1">
                <span className="h-px flex-1 bg-white/6" />
                <span className="text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-dim)]">
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
                      className={`group/nav flex min-h-9 w-full items-center gap-2 rounded-[var(--wb-radius)] border px-2 py-1.5 text-left outline-none transition-[background-color,border-color,transform,color] duration-150 focus-visible:ring-2 focus-visible:ring-white/30 ${
                        active
                          ? 'border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] text-[color:var(--wb-ink)]'
                          : 'border-transparent bg-transparent text-[color:var(--wb-muted)] hover:border-[color:var(--wb-border)] hover:bg-white/[0.045] hover:text-[color:var(--wb-ink)]'
                      }`}
                    >
                      <span
                        className={`flex size-6 shrink-0 items-center justify-center rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-white/[0.035] ${item.theme.text}`}
                      >
                        {item.icon}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={`block truncate text-[length:var(--wbp-label)] font-semibold tracking-normal ${
                            active
                              ? item.theme.text
                              : 'text-[color:var(--wb-ink)] group-hover/nav:text-[color:var(--wb-ink)]'
                          }`}
                        >
                          {item.label}
                        </span>
                        <span className="block truncate text-[length:var(--wbp-label)] font-medium text-[color:var(--wb-dim)]">
                          {item.caption}
                        </span>
                      </span>
                      <span
                        className={`rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] px-1.5 py-0.5 text-[length:var(--wbp-label)] font-semibold tabular-nums ${active ? `${item.theme.bg} text-[color:var(--wb-ink)]` : 'bg-white/[0.035] text-[color:var(--wb-muted)]'}`}
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
  onPrefetchStyleTab,
  onToggleNavigationPanel,
}: StyleCollectionsLandingSurfaceProps) {
  const thumbnailRevision = useStyleLandingThumbnailCatalog();
  const [activeNavigationTargetId, setActiveNavigationTargetId] = useState<string | null>(null);
  const cardsScrollerRef = useRef<HTMLDivElement | null>(null);
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
          countLabel: `${getLandingFolderPresetCount(collection.id, collection.sourcePackIds.length)}`,
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
            label: pack.cardTitle,
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

  const previewNavigationItem = useCallback(
    (item: StyleNavigationItem) => {
      setActiveNavigationTargetId(item.targetId);
      onPrefetchStyleTab?.(item.tabId);
    },
    [onPrefetchStyleTab],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pt-3 pb-4 sm:px-5 sm:pt-4 sm:pb-5 2xl:px-6">
      <div className="mb-3 shrink-0 flex flex-col gap-1">
        <h2 className="vt-style-pack-title truncate text-lg font-semibold tracking-tight text-[color:var(--wb-ink)]">
          Collections
        </h2>
        <p className="max-w-3xl text-[length:var(--wbp-label)] font-medium leading-relaxed text-[color:var(--wb-muted)]">
          Browse styles by creative intent. Source packs show where styles come from.
        </p>
        <label className="styles-catalog-map-select lg:hidden">
          <span>Collections</span>
          <select
            aria-label="Browse collections"
            value={activeNavigationTargetId ?? ''}
            onChange={(event) => {
              const item = navigationSections
                .flatMap((section) => section.items)
                .find((entry) => entry.targetId === event.target.value);
              if (item) onNavigateToStyleTab(item.tabId);
            }}
          >
            {navigationSections.flatMap((section) =>
              section.items.map((item) => (
                <option key={item.id} value={item.targetId}>
                  {item.label}
                </option>
              )),
            )}
          </select>
        </label>
      </div>

      <div
        className={`style-landing-layout grid min-h-0 min-w-0 flex-1 gap-4 overflow-hidden ${
          isNavigationPanelOpen
            ? 'lg:grid-cols-[260px_minmax(0,1fr)]'
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
            className="hidden min-h-0 min-w-0 items-start justify-center rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-panel)]/70 p-1.5 lg:flex"
          >
            <button
              type="button"
              onClick={onToggleNavigationPanel}
              data-style-landing-navigation-toggle
              className="flex size-7 items-center justify-center rounded-[var(--wb-radius)] text-[color:var(--wb-muted)] transition-colors hover:bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] hover:text-[color:var(--wb-ink)]"
              aria-label="Show style map"
              data-tooltip="Show style map"
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
                <div className="h-4 w-1 rounded-[var(--wb-radius)] bg-sky-500" />
                <h3 className="text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-ink)]">
                  Personal
                </h3>
                <div className="h-px flex-1 bg-white/6" />
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3">
                {personalStyleCollections.map((collection, index) => {
                  const tabId =
                    collection.id === 'my_styles' ? USER_STYLE_PACK_ID : FAVORITES_PACK_ID;
                  const isUserStyles = collection.id === 'my_styles';
                  const targetId = `collection:${collection.id}`;
                  if ((isUserStyles ? userStyleCount : favoritesCount) === 0)
                    return (
                      <button
                        key={collection.id}
                        type="button"
                        className="studio-ghost-control flex items-center justify-between gap-2 p-3 text-xs"
                        onClick={() => onNavigateToStyleTab(tabId)}
                      >
                        <span>{isUserStyles ? 'My styles' : 'Favorites'}</span>
                        <span className="text-[color:var(--wb-muted)]">0 styles</span>
                      </button>
                    );
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
                      thumbnailRevision={thumbnailRevision}
                    />
                  );
                })}
              </div>
            </section>

            {styleCollectionFamilySections.map(({ family, collections }) => (
              <StyleCollectionFamilySection
                key={family.id}
                family={family}
                collections={collections}
                activeTargetId={activeNavigationTargetId}
                scrollRootRef={cardsScrollerRef}
                getCollectionTabId={getCollectionTabId}
                getStyleTabHash={getStyleTabHash}
                onNavigateToStyleTab={onNavigateToStyleTab}
                onPrefetchStyleTab={onPrefetchStyleTab}
                thumbnailRevision={thumbnailRevision}
              />
            ))}

            <StyleSourcePacksSection
              activeTargetId={activeNavigationTargetId}
              scrollRootRef={cardsScrollerRef}
              getStyleTabHash={getStyleTabHash}
              onNavigateToStyleTab={onNavigateToStyleTab}
              onPrefetchStyleTab={onPrefetchStyleTab}
              thumbnailRevision={thumbnailRevision}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
