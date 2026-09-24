import { useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import type { GeneratedImageWithConfig } from '../../../types';
import {
  TCG_FINISHES,
  TCG_LAYOUTS,
  TCG_RECIPES,
  buildTcgRecipeArtPrompt,
  resolveTcgRecipe,
} from './tcgComponentModel';
import type { TcgFinish, TcgLayout, TcgRecipe } from './tcgComponentModel';
import { getRequiredTcgArtworkCount, getRequiredTcgMasks } from './tcgCardRenderer';
import type { TcgArtworkSource, TcgRenderInput } from './tcgCardRenderer';
import { getTcgCompositionReadiness, useTcgCompositionPreview } from './useTcgCompositionPreview';

export interface TcgComponentStudioProps {
  query: string;
  images: GeneratedImageWithConfig[];
  onGenerateArtwork: (artPrompt: string) => void;
  isGenerating?: boolean;
}

type ArtworkChoice =
  | { kind: 'generated'; imageId: string }
  | { kind: 'upload'; dataUrl: string; fileName: string }
  | null;

interface MaskAsset {
  dataUrl: string;
  fileName: string;
}

interface CardFields {
  name: string;
  type: string;
  rules: string;
}

const EMPTY_ARTWORK_CHOICES: ArtworkChoice[] = [null, null, null, null];
const EMPTY_CARD_FIELDS: CardFields[] = [
  { name: '', type: '', rules: '' },
  { name: '', type: '', rules: '' },
  { name: '', type: '', rules: '' },
  { name: '', type: '', rules: '' },
];

export function TcgComponentStudio({
  query,
  images,
  onGenerateArtwork,
  isGenerating = false,
}: TcgComponentStudioProps) {
  const initialRecipe = TCG_RECIPES[0];
  const [recipeId, setRecipeId] = useState<TcgRecipe['id']>(initialRecipe.id);
  const [finishId, setFinishId] = useState<TcgFinish['id']>(initialRecipe.finishId);
  const [layoutId, setLayoutId] = useState<TcgLayout['id']>(initialRecipe.layoutId);
  const [subjectPrompt, setSubjectPrompt] = useState('');
  const [artworkChoices, setArtworkChoices] = useState<ArtworkChoice[]>(EMPTY_ARTWORK_CHOICES);
  const [cardFields, setCardFields] = useState<CardFields[]>(EMPTY_CARD_FIELDS);
  const [maskAssets, setMaskAssets] = useState<Record<string, MaskAsset>>({});
  const [panoramaColumns, setPanoramaColumns] = useState<2 | 3>(2);
  const [activeFace, setActiveFace] = useState<0 | 1>(0);
  const [fileError, setFileError] = useState('');
  const [generationError, setGenerationError] = useState('');

  const selectedRecipe = TCG_RECIPES.find((entry) => entry.id === recipeId) ?? initialRecipe;
  const selectedFinish = TCG_FINISHES.find((entry) => entry.id === finishId) ?? TCG_FINISHES[0];
  const selectedLayout = TCG_LAYOUTS.find((entry) => entry.id === layoutId) ?? TCG_LAYOUTS[0];
  const imageById = useMemo(() => new Map(images.map((image) => [image.id, image])), [images]);
  const requiredArtworkCount = getRequiredTcgArtworkCount(layoutId);
  const requiredMaskKeys = getRequiredTcgMasks(finishId, layoutId);

  const artwork = useMemo<TcgArtworkSource[]>(
    () =>
      EMPTY_CARD_FIELDS.map((fields, index) => {
        const choice = artworkChoices[index];
        const src =
          choice?.kind === 'upload'
            ? choice.dataUrl
            : choice?.kind === 'generated'
              ? (imageById.get(choice.imageId)?.src ?? null)
              : null;
        return { ...fields, ...(cardFields[index] ?? fields), src };
      }),
    [artworkChoices, cardFields, imageById],
  );

  const maskSources = useMemo(
    () =>
      Object.fromEntries(Object.entries(maskAssets).map(([key, value]) => [key, value.dataUrl])),
    [maskAssets],
  );
  const renderInput = useMemo<TcgRenderInput>(
    () => ({
      layoutId,
      finishId,
      artwork,
      masks: maskSources,
      activeFace,
      panoramaColumns,
    }),
    [layoutId, finishId, artwork, maskSources, activeFace, panoramaColumns],
  );

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filterCatalog = <T extends { id: string; name: string; summary: string }>(entries: T[]) =>
    normalizedQuery
      ? entries.filter((entry) =>
          `${entry.id} ${entry.name} ${entry.summary}`
            .toLocaleLowerCase()
            .includes(normalizedQuery),
        )
      : entries;
  const matchedFinishes = filterCatalog(TCG_FINISHES);
  const matchedLayouts = filterCatalog(TCG_LAYOUTS);
  const matchedRecipes = filterCatalog(TCG_RECIPES);
  const filteredCatalogCount =
    matchedFinishes.length + matchedLayouts.length + matchedRecipes.length;

  const { canvasRef, renderError, setRenderError, rendering, renderHealth } =
    useTcgCompositionPreview(renderInput);
  const { selectedArtCount, canExport, selectedReasons } = getTcgCompositionReadiness({
    artwork,
    requiredArtworkCount,
    requiredMaskKeys,
    maskSources,
    renderInput,
    renderHealth,
    rendering,
    renderError,
  });

  const setRecipe = (newRecipeId: TcgRecipe['id']) => {
    const recipe = TCG_RECIPES.find((entry) => entry.id === newRecipeId);
    if (!recipe) return;
    setRecipeId(recipe.id);
    setFinishId(recipe.finishId);
    setLayoutId(recipe.layoutId);
    setActiveFace(0);
  };

  const updateCardField = (index: number, field: keyof CardFields, value: string) => {
    setCardFields((current) =>
      current.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, [field]: value } : entry,
      ),
    );
  };

  const updateArtworkChoice = (index: number, choice: ArtworkChoice) => {
    setArtworkChoices((current) =>
      current.map((entry, entryIndex) => (entryIndex === index ? choice : entry)),
    );
  };

  const handleArtworkUpload = async (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;
    setFileError('');
    try {
      const dataUrl = await readFileAsDataUrl(file);
      updateArtworkChoice(index, { kind: 'upload', dataUrl, fileName: file.name });
    } catch (error) {
      setFileError(
        error instanceof Error ? error.message : 'No se pudo leer el archivo de imagen.',
      );
    }
  };

  const handleMaskUpload = async (key: string, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;
    setFileError('');
    try {
      if (!(await hasPngSignature(file)))
        throw new Error(`${file.name}: la máscara debe ser un PNG válido.`);
      const dataUrl = await readFileAsDataUrl(file);
      setMaskAssets((current) => ({ ...current, [key]: { dataUrl, fileName: file.name } }));
    } catch (error) {
      setMaskAssets((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
      setFileError(error instanceof Error ? error.message : 'No se pudo leer la máscara PNG.');
    }
  };

  const handleGenerate = () => {
    if (!subjectPrompt.trim()) {
      setGenerationError('Describe el sujeto para pedir la ilustración.');
      return;
    }
    setGenerationError('');
    try {
      onGenerateArtwork(buildTcgRecipeArtPrompt(recipeId, subjectPrompt.trim()));
    } catch (error) {
      setGenerationError(
        error instanceof Error ? error.message : 'No se pudo iniciar la generación.',
      );
    }
  };

  const exportPng = () => {
    const canvas = canvasRef.current;
    if (!canvas || !canExport) return;
    canvas.toBlob((blob) => {
      if (!blob) {
        setRenderError('El navegador no pudo exportar este lienzo como PNG.');
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const name =
        (artwork[activeFace]?.name || 'tcg-composition')
          .trim()
          .replace(/[^\p{L}\p{N}_-]+/gu, '-')
          .replace(/^-+|-+$/g, '') || 'tcg-composition';
      const faceSuffix = layoutId === 'TCG-L009' ? (activeFace === 0 ? '-face-a' : '-face-b') : '';
      link.href = url;
      link.download = `${name}${faceSuffix}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
  };

  const recipeResolution = resolveTcgRecipe(recipeId);
  const getArtworkSlotLabel = (index: number) => {
    if (layoutId === 'TCG-L009') return index === 0 ? 'Cara A' : 'Cara B';
    if (layoutId === 'TCG-L008') return `Panel ${index + 1} de 4`;
    if (layoutId === 'TCG-L007') return `Panel ${index + 1} del díptico`;
    if (layoutId === 'TCG-L006') return `Narrativa ${index + 1}`;
    return 'Arte principal';
  };

  return (
    <div className="space-y-5" data-tcg-component-studio>
      <header className="space-y-1">
        <h2 className="text-base font-semibold text-[color:var(--wb-ink)]">TCG Component Studio</h2>
        <p className="text-xs leading-relaxed text-[color:var(--wb-muted)]">
          Compone una carta desde arte, estructura, datos y acabado. Los efectos del lienzo son
          aproximaciones digitales; no certifican un proceso ni una salida de imprenta.
        </p>
      </header>

      <div className="grid min-w-0 gap-5">
        <div className="space-y-5">
          <section
            aria-labelledby="tcg-recipe-heading"
            className="space-y-3 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-panel)] p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3
                id="tcg-recipe-heading"
                className="text-sm font-semibold text-[color:var(--wb-ink)]"
              >
                Receta de arte
              </h3>
              <span className="text-[10px] text-[color:var(--wb-dim)]">12 recetas</span>
            </div>
            <label
              htmlFor="tcg-recipe"
              className="block text-xs font-medium text-[color:var(--wb-muted)]"
            >
              Receta
            </label>
            <select
              id="tcg-recipe"
              value={recipeId}
              onChange={(event) => setRecipe(event.currentTarget.value as TcgRecipe['id'])}
              className="w-full rounded border border-[color:var(--wb-line)] bg-[color:var(--wb-bg)] px-3 py-2 text-sm text-[color:var(--wb-ink)]"
            >
              {TCG_RECIPES.map((recipe) => (
                <option key={recipe.id} value={recipe.id}>
                  {recipe.name} — {recipe.id}
                </option>
              ))}
            </select>
            <p className="text-xs leading-relaxed text-[color:var(--wb-muted)]">
              {selectedRecipe.summary}
            </p>
            <p className="text-[11px] leading-relaxed text-[color:var(--wb-dim)]">
              La receta acota la influencia secundaria a «{selectedRecipe.secondaryScope}». El
              acabado y el layout se aplican aquí después de generar la ilustración.
            </p>
            <label
              htmlFor="tcg-subject"
              className="block text-xs font-medium text-[color:var(--wb-muted)]"
            >
              Sujeto de la carta
            </label>
            <textarea
              id="tcg-subject"
              value={subjectPrompt}
              onChange={(event) => setSubjectPrompt(event.currentTarget.value)}
              rows={3}
              placeholder="Describe el sujeto, acción y encuadre que quieres conservar."
              className="w-full resize-y rounded border border-[color:var(--wb-line)] bg-[color:var(--wb-bg)] px-3 py-2 text-sm text-[color:var(--wb-ink)] placeholder:text-[color:var(--wb-dim)]"
            />
            {generationError ? (
              <p role="alert" className="text-xs text-red-700">
                {generationError}
              </p>
            ) : null}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="rounded border border-[color:var(--wb-ink)] bg-[color:var(--wb-ink)] px-3 py-2 text-xs font-semibold text-[color:var(--wb-bg)] disabled:cursor-not-allowed disabled:opacity-55"
              >
                {isGenerating ? 'Generando arte…' : 'Generar ilustración'}
              </button>
              <span className="text-[10px] text-[color:var(--wb-dim)]">
                No añade marco, texto ni acabado al prompt de arte.
              </span>
            </div>
            <div className="flex flex-wrap items-start justify-between gap-2 border-t border-[color:var(--wb-line)] pt-3">
              <p className="max-w-xl text-[11px] leading-relaxed text-[color:var(--wb-muted)]">
                Valores por receta: {recipeResolution.finish.name} · {recipeResolution.layout.name}.
              </p>
              <button
                type="button"
                onClick={() => {
                  setFinishId(selectedRecipe.finishId);
                  setLayoutId(selectedRecipe.layoutId);
                }}
                className="rounded border border-[color:var(--wb-line)] px-2 py-1 text-[10px] font-medium text-[color:var(--wb-muted)] hover:text-[color:var(--wb-ink)]"
              >
                Restaurar valores de receta
              </button>
            </div>
          </section>

          <section
            aria-labelledby="tcg-layout-finish-heading"
            className="space-y-3 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-panel)] p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3
                id="tcg-layout-finish-heading"
                className="text-sm font-semibold text-[color:var(--wb-ink)]"
              >
                Estructura de carta
              </h3>
              <span className="text-[10px] text-[color:var(--wb-dim)]">12 layouts</span>
            </div>
            <label
              htmlFor="tcg-layout"
              className="block text-xs font-medium text-[color:var(--wb-muted)]"
            >
              Layout
            </label>
            <select
              id="tcg-layout"
              value={layoutId}
              onChange={(event) => {
                setLayoutId(event.currentTarget.value as TcgLayout['id']);
                setActiveFace(0);
              }}
              className="w-full rounded border border-[color:var(--wb-line)] bg-[color:var(--wb-bg)] px-3 py-2 text-sm text-[color:var(--wb-ink)]"
            >
              {TCG_LAYOUTS.map((layout) => (
                <option key={layout.id} value={layout.id}>
                  {layout.name} — {layout.id}
                </option>
              ))}
            </select>
            <p className="text-xs leading-relaxed text-[color:var(--wb-muted)]">
              {selectedLayout.summary}
            </p>
            {layoutId === 'TCG-L008' ? (
              <div className="space-y-1">
                <label
                  htmlFor="tcg-panorama-columns"
                  className="block text-xs font-medium text-[color:var(--wb-muted)]"
                >
                  Columnas de la grilla
                </label>
                <select
                  id="tcg-panorama-columns"
                  value={panoramaColumns}
                  onChange={(event) =>
                    setPanoramaColumns(Number(event.currentTarget.value) as 2 | 3)
                  }
                  className="rounded border border-[color:var(--wb-line)] bg-[color:var(--wb-bg)] px-2 py-1 text-xs text-[color:var(--wb-ink)]"
                >
                  <option value={2}>2 columnas</option>
                  <option value={3}>3 columnas</option>
                </select>
                <p className="text-[10px] text-[color:var(--wb-dim)]">
                  La vista contiene cuatro cartas; los archivos de arte deben seleccionarse por
                  separado.
                </p>
              </div>
            ) : null}
            {layoutId === 'TCG-L009' ? (
              <div
                className="flex flex-wrap gap-2"
                aria-label="Seleccionar cara para la vista y exportación"
              >
                <button
                  type="button"
                  aria-pressed={activeFace === 0}
                  onClick={() => setActiveFace(0)}
                  className={faceButtonClass(activeFace === 0)}
                >
                  Cara A
                </button>
                <button
                  type="button"
                  aria-pressed={activeFace === 1}
                  onClick={() => setActiveFace(1)}
                  className={faceButtonClass(activeFace === 1)}
                >
                  Cara B
                </button>
                <span className="self-center text-[10px] text-[color:var(--wb-dim)]">
                  La exportación descarga una cara a la vez.
                </span>
              </div>
            ) : null}
            <div className="border-t border-[color:var(--wb-line)] pt-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-[color:var(--wb-ink)]">
                  Acabado digital
                </h3>
                <span className="text-[10px] text-[color:var(--wb-dim)]">18 acabados</span>
              </div>
              <label
                htmlFor="tcg-finish"
                className="mt-2 block text-xs font-medium text-[color:var(--wb-muted)]"
              >
                Acabado
              </label>
              <select
                id="tcg-finish"
                value={finishId}
                onChange={(event) => setFinishId(event.currentTarget.value as TcgFinish['id'])}
                className="w-full rounded border border-[color:var(--wb-line)] bg-[color:var(--wb-bg)] px-3 py-2 text-sm text-[color:var(--wb-ink)]"
              >
                {TCG_FINISHES.map((finish) => (
                  <option key={finish.id} value={finish.id}>
                    {finish.name} — {finish.id}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs leading-relaxed text-[color:var(--wb-muted)]">
                {selectedFinish.summary}
              </p>
              {selectedFinish.caution ? (
                <p className="mt-1 text-[10px] leading-relaxed text-[color:var(--wb-dim)]">
                  {selectedFinish.caution}
                </p>
              ) : null}
            </div>
          </section>

          <section
            aria-labelledby="tcg-artwork-heading"
            className="space-y-3 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-panel)] p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3
                id="tcg-artwork-heading"
                className="text-sm font-semibold text-[color:var(--wb-ink)]"
              >
                Archivos de arte
              </h3>
              <span className="text-[10px] text-[color:var(--wb-dim)]">
                {selectedArtCount}/{requiredArtworkCount} listos
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-[color:var(--wb-muted)]">
              Elige una imagen generada o carga un archivo local. Los layouts de varias piezas
              requieren arte separado para cada panel o cara; no se infiere continuidad entre
              archivos.
            </p>
            {Array.from({ length: requiredArtworkCount }, (_, index) => {
              const choice = artworkChoices[index];
              const sourceSelectValue =
                choice?.kind === 'generated'
                  ? choice.imageId
                  : choice?.kind === 'upload'
                    ? '__uploaded__'
                    : '';
              const slotId = `tcg-art-${index + 1}`;
              return (
                <fieldset
                  key={slotId}
                  className="space-y-2 rounded border border-[color:var(--wb-line)] p-3"
                >
                  <legend className="px-1 text-xs font-semibold text-[color:var(--wb-ink)]">
                    {getArtworkSlotLabel(index)}
                  </legend>
                  <label
                    htmlFor={`${slotId}-generated`}
                    className="block text-[11px] font-medium text-[color:var(--wb-muted)]"
                  >
                    Imagen generada
                  </label>
                  <select
                    id={`${slotId}-generated`}
                    value={sourceSelectValue}
                    onChange={(event) => {
                      const value = event.currentTarget.value;
                      if (value === '__uploaded__') return;
                      updateArtworkChoice(
                        index,
                        value ? { kind: 'generated', imageId: value } : null,
                      );
                    }}
                    className="w-full rounded border border-[color:var(--wb-line)] bg-[color:var(--wb-bg)] px-2 py-2 text-xs text-[color:var(--wb-ink)]"
                  >
                    <option value="">Sin seleccionar</option>
                    {choice?.kind === 'upload' ? (
                      <option value="__uploaded__">Archivo local: {choice.fileName}</option>
                    ) : null}
                    {images.map((image, imageIndex) => (
                      <option key={`${image.id}-${imageIndex}`} value={image.id}>
                        {getGeneratedImageLabel(image, imageIndex)}
                      </option>
                    ))}
                  </select>
                  <label
                    htmlFor={`${slotId}-file`}
                    className="block text-[11px] font-medium text-[color:var(--wb-muted)]"
                  >
                    o cargar imagen
                  </label>
                  <input
                    id={`${slotId}-file`}
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      void handleArtworkUpload(index, event);
                    }}
                    className="block w-full text-xs text-[color:var(--wb-muted)] file:mr-2 file:rounded file:border file:border-[color:var(--wb-line)] file:bg-[color:var(--wb-bg)] file:px-2 file:py-1 file:text-xs file:text-[color:var(--wb-ink)]"
                  />
                  {choice?.kind === 'upload' ? (
                    <p className="text-[10px] text-[color:var(--wb-dim)]">
                      Archivo local: {choice.fileName}
                    </p>
                  ) : null}
                  <details className="pt-1">
                    <summary className="cursor-pointer text-[11px] font-medium text-[color:var(--wb-muted)]">
                      Editar datos de esta carta
                    </summary>
                    <div className="mt-2 space-y-2">
                      <label
                        htmlFor={`${slotId}-name`}
                        className="block text-[10px] font-medium text-[color:var(--wb-muted)]"
                      >
                        Nombre
                      </label>
                      <input
                        id={`${slotId}-name`}
                        value={cardFields[index]?.name ?? ''}
                        maxLength={90}
                        onChange={(event) =>
                          updateCardField(index, 'name', event.currentTarget.value)
                        }
                        className="w-full rounded border border-[color:var(--wb-line)] bg-[color:var(--wb-bg)] px-2 py-1.5 text-xs text-[color:var(--wb-ink)]"
                      />
                      <label
                        htmlFor={`${slotId}-type`}
                        className="block text-[10px] font-medium text-[color:var(--wb-muted)]"
                      >
                        Tipo / grupo
                      </label>
                      <input
                        id={`${slotId}-type`}
                        value={cardFields[index]?.type ?? ''}
                        maxLength={90}
                        onChange={(event) =>
                          updateCardField(index, 'type', event.currentTarget.value)
                        }
                        className="w-full rounded border border-[color:var(--wb-line)] bg-[color:var(--wb-bg)] px-2 py-1.5 text-xs text-[color:var(--wb-ink)]"
                      />
                      <label
                        htmlFor={`${slotId}-rules`}
                        className="block text-[10px] font-medium text-[color:var(--wb-muted)]"
                      >
                        Reglas o texto de carta
                      </label>
                      <textarea
                        id={`${slotId}-rules`}
                        value={cardFields[index]?.rules ?? ''}
                        maxLength={600}
                        rows={3}
                        onChange={(event) =>
                          updateCardField(index, 'rules', event.currentTarget.value)
                        }
                        className="w-full resize-y rounded border border-[color:var(--wb-line)] bg-[color:var(--wb-bg)] px-2 py-1.5 text-xs text-[color:var(--wb-ink)]"
                      />
                    </div>
                  </details>
                </fieldset>
              );
            })}
            {layoutId === 'TCG-L012' ? (
              <p className="text-[10px] text-[color:var(--wb-dim)]">
                Art Plate muestra solo la ilustración; los datos editados no se dibujan en ese
                layout.
              </p>
            ) : null}
          </section>

          <section
            aria-labelledby="tcg-masks-heading"
            className="space-y-3 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-panel)] p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3
                id="tcg-masks-heading"
                className="text-sm font-semibold text-[color:var(--wb-ink)]"
              >
                Máscaras requeridas
              </h3>
              <span className="text-[10px] text-[color:var(--wb-dim)]">
                {requiredMaskKeys.length} PNG
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-[color:var(--wb-muted)]">
              Carga un PNG real por cada capa que pide el acabado. Blanco aplica la máscara y negro
              la excluye; los tonos grises modulan el efecto. Se ajusta al lienzo completo. No se
              generan máscaras automáticamente.
            </p>
            {layoutId === 'TCG-L005' ? (
              <p className="rounded border border-amber-700/30 bg-amber-50 px-2 py-1.5 text-[10px] leading-relaxed text-amber-950">
                Frame Break requiere subjectMask y occlusionMask explícitas. Blanco en subjectMask
                recorta la zona del sujeto que cruza el marco; blanco en occlusionMask retira esa
                zona del sujeto superpuesto.
              </p>
            ) : null}
            <div className="grid gap-2 sm:grid-cols-2">
              {requiredMaskKeys.map((key) => {
                const id = `tcg-mask-${key}`;
                return (
                  <div
                    key={key}
                    className="space-y-1 rounded border border-[color:var(--wb-line)] p-2"
                  >
                    <label
                      htmlFor={id}
                      className="block text-[11px] font-medium text-[color:var(--wb-ink)]"
                    >
                      {key} · PNG obligatorio
                    </label>
                    <input
                      id={id}
                      type="file"
                      accept="image/png,.png"
                      onChange={(event) => {
                        void handleMaskUpload(key, event);
                      }}
                      className="block w-full text-[10px] text-[color:var(--wb-muted)] file:mr-1 file:rounded file:border file:border-[color:var(--wb-line)] file:bg-[color:var(--wb-bg)] file:px-1.5 file:py-1 file:text-[10px] file:text-[color:var(--wb-ink)]"
                    />
                    {maskAssets[key] ? (
                      <p className="text-[10px] text-emerald-800">
                        Cargada: {maskAssets[key].fileName}
                      </p>
                    ) : (
                      <p className="text-[10px] text-[color:var(--wb-dim)]">Sin máscara.</p>
                    )}
                  </div>
                );
              })}
            </div>
            {fileError ? (
              <p role="alert" className="text-xs text-red-700">
                {fileError}
              </p>
            ) : null}
          </section>
        </div>

        <section
          aria-labelledby="tcg-preview-heading"
          className="space-y-3 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-panel)] p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3
              id="tcg-preview-heading"
              className="text-sm font-semibold text-[color:var(--wb-ink)]"
            >
              Vista compuesta
            </h3>
            <button
              type="button"
              onClick={exportPng}
              disabled={!canExport}
              title={
                canExport ? 'Exportar la composición actual como PNG' : selectedReasons.join(' ')
              }
              className="rounded border border-[color:var(--wb-ink)] px-3 py-2 text-xs font-semibold text-[color:var(--wb-ink)] disabled:cursor-not-allowed disabled:opacity-45"
            >
              Exportar PNG
            </button>
          </div>
          <p className="text-[11px] leading-relaxed text-[color:var(--wb-muted)]">
            {layoutId === 'TCG-L007'
              ? 'El archivo muestra dos cartas contiguas en un lienzo compartido.'
              : layoutId === 'TCG-L008'
                ? 'El archivo contiene la grilla completa con los cuatro paneles.'
                : layoutId === 'TCG-L009'
                  ? `Previsualizando y exportando Cara ${activeFace === 0 ? 'A' : 'B'}.`
                  : 'La vista representa una composición digital del layout y el acabado seleccionados.'}
          </p>
          <div className="flex min-h-64 items-center justify-center overflow-auto rounded border border-[color:var(--wb-line)] bg-[#20252b] p-3">
            <canvas
              ref={canvasRef}
              aria-label="Vista previa de la composición de carta"
              className="block h-auto max-h-[72vh] max-w-full rounded shadow-lg"
            />
          </div>
          {rendering ? (
            <p role="status" className="text-xs text-[color:var(--wb-muted)]">
              Actualizando vista…
            </p>
          ) : null}
          {renderError ? (
            <p role="alert" className="text-xs text-red-700">
              {renderError}
            </p>
          ) : null}
          {!renderError && !canExport ? (
            <div
              role="status"
              className="space-y-1 rounded border border-[color:var(--wb-line)] bg-[color:var(--wb-bg)] p-3"
            >
              <p className="text-xs font-medium text-[color:var(--wb-ink)]">
                Completa los recursos para habilitar la exportación.
              </p>
              <ul className="list-inside list-disc space-y-0.5 text-[10px] text-[color:var(--wb-muted)]">
                {selectedReasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <p className="text-[10px] leading-relaxed text-[color:var(--wb-dim)]">
            Archivo de composición para revisión en pantalla. No certifica medidas, capas, respuesta
            UV, troquel ni compatibilidad con una imprenta.
          </p>
        </section>
      </div>

      <details
        open={!!normalizedQuery}
        className="rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-panel)] p-4"
      >
        <summary className="cursor-pointer text-sm font-semibold text-[color:var(--wb-ink)]">
          Explorar componentes del atlas · 42 registros · {filteredCatalogCount} coinciden
        </summary>
        {normalizedQuery && filteredCatalogCount === 0 ? (
          <p className="mt-3 text-xs text-[color:var(--wb-muted)]">
            No hay acabados, layouts o recetas que coincidan con «{query}».
          </p>
        ) : null}
        <div className="mt-3 grid gap-4 lg:grid-cols-3">
          <CatalogGroup
            title="Acabados"
            count={TCG_FINISHES.length}
            entries={matchedFinishes}
            selectedId={finishId}
            onSelect={(id) => setFinishId(id as TcgFinish['id'])}
          />
          <CatalogGroup
            title="Layouts"
            count={TCG_LAYOUTS.length}
            entries={matchedLayouts}
            selectedId={layoutId}
            onSelect={(id) => {
              setLayoutId(id as TcgLayout['id']);
              setActiveFace(0);
            }}
          />
          <CatalogGroup
            title="Recetas"
            count={TCG_RECIPES.length}
            entries={matchedRecipes}
            selectedId={recipeId}
            onSelect={(id) => setRecipe(id as TcgRecipe['id'])}
          />
        </div>
      </details>
    </div>
  );
}

interface CatalogGroupProps {
  title: string;
  count: number;
  entries: Array<{ id: string; name: string; summary: string }>;
  selectedId: string;
  onSelect: (id: string) => void;
}

function CatalogGroup({ title, count, entries, selectedId, onSelect }: CatalogGroupProps) {
  return (
    <section aria-label={`${title}, ${count} registros`} className="space-y-2">
      <h4 className="border-b border-[color:var(--wb-line)] pb-1 text-xs font-semibold text-[color:var(--wb-ink)]">
        {title} · {entries.length}/{count}
      </h4>
      <div className="max-h-80 space-y-1 overflow-y-auto pr-1">
        {entries.map((entry) => (
          <button
            key={entry.id}
            type="button"
            aria-pressed={entry.id === selectedId}
            onClick={() => onSelect(entry.id)}
            className={`block w-full rounded border px-2 py-1.5 text-left ${entry.id === selectedId ? 'border-[color:var(--wb-ink)] bg-[color:var(--wb-bg)]' : 'border-transparent hover:border-[color:var(--wb-line)]'}`}
          >
            <span className="block text-[11px] font-medium text-[color:var(--wb-ink)]">
              {entry.name}{' '}
              <span className="font-normal text-[color:var(--wb-dim)]">{entry.id}</span>
            </span>
            <span className="mt-0.5 block text-[10px] leading-relaxed text-[color:var(--wb-muted)]">
              {entry.summary}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function getGeneratedImageLabel(image: GeneratedImageWithConfig, index: number) {
  const prompt = image.config.prompt?.trim();
  const label = prompt ? prompt.replace(/\s+/g, ' ') : `Imagen ${index + 1}`;
  return `${label.slice(0, 76)}${label.length > 76 ? '…' : ''}`;
}

function faceButtonClass(active: boolean) {
  return `rounded border px-2.5 py-1 text-[11px] font-medium ${active ? 'border-[color:var(--wb-ink)] bg-[color:var(--wb-ink)] text-[color:var(--wb-bg)]' : 'border-[color:var(--wb-line)] text-[color:var(--wb-muted)]'}`;
}

async function hasPngSignature(file: File): Promise<boolean> {
  const bytes = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  return (
    bytes.length === signature.length && signature.every((value, index) => bytes[index] === value)
  );
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`No se pudo leer ${file.name}.`));
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error(`El archivo ${file.name} no produjo una imagen válida.`));
    };
    reader.readAsDataURL(file);
  });
}
