import {
  IconCheck as Check,
  IconCopy as Copy,
  IconDeviceFloppy as Save,
  IconPhoto as Photo,
  IconSparkles as Sparkles,
  IconTrash as Trash2,
  IconUpload as Upload,
  IconWand as Wand2,
  IconX as X,
} from '@tabler/icons-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type {
  CodexStyleReferenceImage,
  UserStyleDraftAction,
  UserStyleDraftFieldId,
  UserStylePreset,
  UserStylePresetDraft,
  UserStylePresetSource,
  UserStylePresetTask,
  UserStyleVisualDnaKey,
} from '../../packages/shared/src';
import { USER_STYLE_SUPPORTED_TASKS } from '../../packages/shared/src';
import {
  archiveUserStylePreset,
  createUserStylePreset,
  draftUserStylePreset,
  duplicateUserStylePreset,
  updateUserStylePreset,
} from '../../services/localStudioService';
import {
  USER_STYLE_DNA_FIELDS,
  createUserStyleDraftFromReferenceImages,
  createUserStyleReferenceImageSummary,
  createUserStyleInputFromDraft,
  createUserStyleVisualDna,
  mergeUserStyleDraftWithDisabledFields,
} from './userStyleDraftBuilders';

type UserStyleEditorMode = 'create' | 'edit';

interface UserStyleEditorSurfaceProps {
  sessionId: number;
  mode: UserStyleEditorMode;
  initialDraft: UserStylePresetDraft;
  initialSource: UserStylePresetSource | null;
  editingStyleId?: string;
  selectedStyleLayers?: unknown[];
  onClose: () => void;
  onSaved: (style: UserStylePreset) => void;
  onArchived: (style: UserStylePreset) => void;
}

const DRAFT_ACTIONS: Array<{ id: UserStyleDraftAction; label: string }> = [
  { id: 'draft_from_description', label: 'Draft' },
  { id: 'improve_draft', label: 'Improve' },
  { id: 'make_transferable', label: 'Transfer' },
  { id: 'audit_style_quality', label: 'Audit' },
];

const MAX_REFERENCE_IMAGES = 12;
const DEFAULT_REFERENCE_ASSIST_PROMPT =
  'Distill these references into a transferable style preset. Extract visual DNA only; avoid source pose, exact composition, readable text, logos, or character likeness.';

const DRAFT_FIELD_SWITCHES: Array<{ id: UserStyleDraftFieldId; label: string }> = [
  { id: 'name', label: 'Name' },
  { id: 'category', label: 'Category' },
  { id: 'tags', label: 'Tags' },
  { id: 'supportedTasks', label: 'Tasks' },
  { id: 'creative_brief', label: 'Brief' },
  ...USER_STYLE_DNA_FIELDS.map((field) => ({ id: field.key, label: field.label })),
  { id: 'avoidRules', label: 'Avoid' },
];

type UserStyleAuthoringMode = 'manual' | 'codex_assist';

type ReferenceImageItem = CodexStyleReferenceImage & {
  id: string;
  previewUrl: string;
  included: boolean;
};

function parseListText(value: string) {
  const seen = new Set<string>();
  const list: string[] = [];
  for (const part of value.split(/[,;\n]/g)) {
    const clean = part.trim().replace(/\s+/g, ' ');
    if (!clean) continue;
    const key = clean.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    list.push(clean);
  }
  return list;
}

function uniqueTextList(values: string[]) {
  const seen = new Set<string>();
  const list: string[] = [];
  for (const value of values) {
    const clean = value.trim();
    if (!clean) continue;
    const key = clean.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    list.push(clean);
  }
  return list;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Style action failed.';
}

function taskLabel(task: UserStylePresetTask) {
  return task.replace(/_/g, ' ');
}

function formatFileSize(sizeBytes: number | undefined) {
  if (!sizeBytes || sizeBytes < 1) return '';
  if (sizeBytes < 1024 * 1024) return `${Math.round(sizeBytes / 1024)} KB`;
  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

function stripReferenceImage(item: ReferenceImageItem): CodexStyleReferenceImage {
  return {
    id: item.id,
    name: item.name,
    mimeType: item.mimeType,
    sizeBytes: item.sizeBytes,
    role: item.role,
    notes: item.notes,
  };
}

function mergeSourceData(sourceData: unknown, extraData: Record<string, unknown>) {
  if (sourceData && typeof sourceData === 'object' && !Array.isArray(sourceData)) {
    return { ...sourceData, ...extraData };
  }
  if (sourceData === undefined || sourceData === null) return extraData;
  return { previous: sourceData, ...extraData };
}

export const UserStyleEditorSurface: React.FC<UserStyleEditorSurfaceProps> = ({
  sessionId,
  mode,
  initialDraft,
  initialSource,
  editingStyleId,
  selectedStyleLayers = [],
  onClose,
  onSaved,
  onArchived,
}) => {
  const [draft, setDraft] = useState<UserStylePresetDraft>(initialDraft);
  const [source, setSource] = useState<UserStylePresetSource | null>(initialSource);
  const [authoringMode, setAuthoringMode] = useState<UserStyleAuthoringMode>(
    initialSource?.kind === 'codex_assist' ? 'codex_assist' : 'manual',
  );
  const [referenceImages, setReferenceImages] = useState<ReferenceImageItem[]>([]);
  const [disabledDraftFields, setDisabledDraftFields] = useState<UserStyleDraftFieldId[]>([]);
  const [tagsText, setTagsText] = useState(initialDraft.tags.join(', '));
  const [avoidRulesText, setAvoidRulesText] = useState(initialDraft.avoidRules.join('\n'));
  const [assistPrompt, setAssistPrompt] = useState('');
  const [assistAction, setAssistAction] = useState<UserStyleDraftAction>('draft_from_description');
  const [assistWarnings, setAssistWarnings] = useState<string[]>(initialDraft.warnings);
  const [isSaving, setIsSaving] = useState(false);
  const [isAssisting, setIsAssisting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const referenceImageUrlsRef = useRef<string[]>([]);

  useEffect(
    () => () => {
      for (const url of referenceImageUrlsRef.current) URL.revokeObjectURL(url);
      referenceImageUrlsRef.current = [];
    },
    [],
  );

  useEffect(() => {
    for (const url of referenceImageUrlsRef.current) URL.revokeObjectURL(url);
    referenceImageUrlsRef.current = [];
    setDraft(initialDraft);
    setSource(initialSource);
    setAuthoringMode(initialSource?.kind === 'codex_assist' ? 'codex_assist' : 'manual');
    setReferenceImages([]);
    setDisabledDraftFields([]);
    setTagsText(initialDraft.tags.join(', '));
    setAvoidRulesText(initialDraft.avoidRules.join('\n'));
    setAssistPrompt('');
    setAssistAction('draft_from_description');
    setAssistWarnings(initialDraft.warnings);
    setError(null);
  }, [initialDraft, initialSource, sessionId]);

  const normalizedDraft = useMemo(
    () => ({
      ...draft,
      tags: parseListText(tagsText),
      avoidRules: parseListText(avoidRulesText),
      visualDna: createUserStyleVisualDna(draft.visualDna),
    }),
    [avoidRulesText, draft, tagsText],
  );

  const canSave = normalizedDraft.name.trim().length > 0 && !isSaving;
  const sourceKind = source?.kind ?? 'manual';
  const includedReferenceImages = useMemo(
    () => referenceImages.filter((image) => image.included).map(stripReferenceImage),
    [referenceImages],
  );
  const referenceSummary = useMemo(
    () => createUserStyleReferenceImageSummary(includedReferenceImages),
    [includedReferenceImages],
  );
  const disabledDraftFieldSet = useMemo(
    () => new Set<UserStyleDraftFieldId>(disabledDraftFields),
    [disabledDraftFields],
  );
  const workflowSteps = useMemo(
    () => [
      {
        label: 'Source',
        state: referenceImages.length > 0 ? 'complete' : 'idle',
        detail:
          referenceImages.length > 0
            ? `${includedReferenceImages.length}/${referenceImages.length} refs`
            : sourceKind.replace(/_/g, ' '),
      },
      {
        label: 'Draft',
        state: isAssisting ? 'active' : normalizedDraft.name.trim() ? 'complete' : 'idle',
        detail: isAssisting ? 'working' : normalizedDraft.category || 'empty',
      },
      {
        label: 'Review',
        state: disabledDraftFields.length > 0 || assistWarnings.length > 0 ? 'active' : 'idle',
        detail:
          disabledDraftFields.length > 0
            ? `${disabledDraftFields.length} locked`
            : assistWarnings.length > 0
              ? `${assistWarnings.length} notes`
              : 'ready',
      },
      {
        label: 'Save',
        state: canSave ? 'complete' : 'idle',
        detail: canSave ? 'enabled' : 'blocked',
      },
    ],
    [
      assistWarnings.length,
      canSave,
      disabledDraftFields.length,
      includedReferenceImages.length,
      isAssisting,
      normalizedDraft.category,
      normalizedDraft.name,
      referenceImages.length,
      sourceKind,
    ],
  );

  const updateDraft = <K extends keyof UserStylePresetDraft>(
    key: K,
    value: UserStylePresetDraft[K],
  ) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const updateVisualDna = (key: UserStyleVisualDnaKey | 'creative_brief', value: string) => {
    setDraft((current) => ({
      ...current,
      visualDna: {
        ...current.visualDna,
        [key]: value,
      },
    }));
  };

  const toggleTask = (task: UserStylePresetTask) => {
    setDraft((current) => {
      const exists = current.supportedTasks.includes(task);
      const supportedTasks = exists
        ? current.supportedTasks.filter((item) => item !== task)
        : [...current.supportedTasks, task];
      return { ...current, supportedTasks };
    });
  };

  const toggleDraftField = (field: UserStyleDraftFieldId) => {
    setDisabledDraftFields((current) =>
      current.includes(field) ? current.filter((item) => item !== field) : [...current, field],
    );
  };

  const handleReferenceFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const images = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (images.length === 0) {
      setAssistWarnings((current) =>
        uniqueTextList([...current, 'Only image files can be used as style references.']),
      );
      return;
    }

    const items = images.map((file, index) => {
      const previewUrl = URL.createObjectURL(file);
      referenceImageUrlsRef.current.push(previewUrl);
      return {
        id: `style-ref-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
        name: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        role: 'style_reference' as const,
        notes: '',
        previewUrl,
        included: true,
      };
    });

    const referenceDraft = createUserStyleDraftFromReferenceImages(
      items.map(stripReferenceImage),
      assistPrompt,
    );
    if (referenceImages.length === 0 && normalizedDraft.name.trim() === 'Custom Style') {
      setDraft(referenceDraft);
      setTagsText(referenceDraft.tags.join(', '));
      setAvoidRulesText(referenceDraft.avoidRules.join('\n'));
      setAssistWarnings((current) => uniqueTextList([...current, ...referenceDraft.warnings]));
    }

    setReferenceImages((current) => {
      const openSlots = Math.max(0, MAX_REFERENCE_IMAGES - current.length);
      const accepted = items.slice(0, openSlots);
      for (const item of items.slice(openSlots)) URL.revokeObjectURL(item.previewUrl);
      return [...current, ...accepted];
    });
    setAssistAction('draft_from_description');
    setAssistPrompt((current) => current || DEFAULT_REFERENCE_ASSIST_PROMPT);
    setSource(
      (current) =>
        current ?? {
          kind: 'manual',
          note: 'Created from visual references in Style Editor.',
        },
    );
  };

  const handleRemoveReferenceImage = (id: string) => {
    setReferenceImages((current) => {
      const target = current.find((image) => image.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return current.filter((image) => image.id !== id);
    });
  };

  const updateReferenceImage = (
    id: string,
    patch: Partial<Pick<ReferenceImageItem, 'included' | 'notes' | 'role'>>,
  ) => {
    setReferenceImages((current) =>
      current.map((image) => (image.id === id ? { ...image, ...patch } : image)),
    );
  };

  const createSourceForSave = () => {
    const baseSource =
      source ??
      ({
        kind: 'manual',
        note: 'Created manually in Style Editor.',
      } satisfies UserStylePresetSource);
    if (includedReferenceImages.length === 0 && disabledDraftFields.length === 0) return baseSource;

    return {
      ...baseSource,
      note:
        baseSource.note ??
        (includedReferenceImages.length > 0
          ? 'Created with visual references in Style Editor.'
          : 'Created in Style Editor.'),
      data: mergeSourceData(baseSource.data, {
        ...(includedReferenceImages.length > 0
          ? {
              referenceImages: includedReferenceImages,
              referenceSummary,
            }
          : {}),
        ...(disabledDraftFields.length > 0 ? { disabledDraftFields } : {}),
      }),
    };
  };

  const handleAssist = async () => {
    setError(null);
    setIsAssisting(true);
    try {
      const description = [assistPrompt.trim(), referenceSummary].filter(Boolean).join('\n\n');
      const response = await draftUserStylePreset({
        action: assistAction,
        description,
        draft: normalizedDraft,
        selectedStyleLayers,
        referenceImages: includedReferenceImages,
        disabledFields: disabledDraftFields,
      });
      const nextDraft = mergeUserStyleDraftWithDisabledFields(
        normalizedDraft,
        response.draft,
        disabledDraftFields,
      );
      setDraft(nextDraft);
      setTagsText(nextDraft.tags.join(', '));
      setAvoidRulesText(nextDraft.avoidRules.join('\n'));
      setAssistWarnings(uniqueTextList([...nextDraft.warnings, ...response.warnings]));
      setSource({
        kind: 'codex_assist',
        note:
          includedReferenceImages.length > 0
            ? 'Created or revised through style assist with visual references.'
            : 'Created or revised through style assist.',
        data: {
          action: assistAction,
          source: response.source,
          referenceImages: includedReferenceImages,
          disabledDraftFields,
        },
      });
      setAuthoringMode('codex_assist');
    } catch (assistError) {
      setError(getErrorMessage(assistError));
    } finally {
      setIsAssisting(false);
    }
  };

  const handleSave = async () => {
    setError(null);
    setIsSaving(true);
    try {
      const input = createUserStyleInputFromDraft(normalizedDraft, createSourceForSave());
      const saved =
        mode === 'edit' && editingStyleId
          ? await updateUserStylePreset(editingStyleId, input)
          : await createUserStylePreset(input);
      onSaved(saved);
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!editingStyleId) return;
    setError(null);
    setIsSaving(true);
    try {
      const archived = await archiveUserStylePreset(editingStyleId);
      onArchived(archived);
    } catch (archiveError) {
      setError(getErrorMessage(archiveError));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDuplicate = async () => {
    if (!editingStyleId) return;
    setError(null);
    setIsSaving(true);
    try {
      const duplicate = await duplicateUserStylePreset(editingStyleId);
      onSaved(duplicate);
    } catch (duplicateError) {
      setError(getErrorMessage(duplicateError));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      data-user-style-editor
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/76 p-2 text-white backdrop-blur-md sm:p-4"
    >
      <div className="flex h-full max-h-[calc(100vh-4.5rem)] w-full max-w-[1180px] flex-col overflow-hidden rounded-[8px] border border-white/14 bg-zinc-950 shadow-[0_24px_80px_rgba(0,0,0,0.72)]">
        <div className="flex min-h-14 shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-zinc-950/98 px-4 sm:px-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.22em] text-zinc-500">
              <Sparkles size={13} />
              <span>{mode === 'edit' ? 'Edit Style' : 'Style Editor'}</span>
              <span className="rounded-[5px] border border-white/12 bg-white/8 px-1.5 py-0.5 text-[8px] text-zinc-300">
                {sourceKind.replace(/_/g, ' ')}
              </span>
            </div>
            <h2 className="mt-1 truncate text-base font-black uppercase tracking-tight text-white">
              {normalizedDraft.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 shrink-0 items-center justify-center rounded-[6px] border border-white/12 bg-white/7 text-zinc-300 transition-colors hover:bg-white/12 hover:text-white"
            aria-label="Close style editor"
          >
            <X size={16} />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden bg-zinc-950/95 p-3 lg:grid-cols-[minmax(0,1fr)_360px] lg:p-4">
          <section className="min-h-0 min-w-0 overflow-y-auto rounded-[8px] border border-white/12 bg-zinc-900/88 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] custom-scrollbar">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1.5">
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                  Name
                </span>
                <input
                  value={draft.name}
                  onChange={(event) => updateDraft('name', event.target.value)}
                  className="h-10 rounded-[6px] border border-white/14 bg-zinc-950 px-3 text-sm font-bold text-white outline-none transition-colors focus:border-accent-400/45"
                />
              </label>
              <label className="grid gap-1.5">
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                  Category
                </span>
                <input
                  value={draft.category}
                  onChange={(event) => updateDraft('category', event.target.value)}
                  className="h-10 rounded-[6px] border border-white/14 bg-zinc-950 px-3 text-sm font-bold text-white outline-none transition-colors focus:border-accent-400/45"
                />
              </label>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1.5">
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                  Tags
                </span>
                <input
                  value={tagsText}
                  onChange={(event) => setTagsText(event.target.value)}
                  className="h-10 rounded-[6px] border border-white/14 bg-zinc-950 px-3 text-xs font-bold text-white outline-none transition-colors focus:border-accent-400/45"
                />
              </label>
              <div className="grid gap-1.5">
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                  Tasks
                </span>
                <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-[6px] border border-white/14 bg-zinc-950 p-1">
                  {USER_STYLE_SUPPORTED_TASKS.map((task) => {
                    const active = draft.supportedTasks.includes(task);
                    return (
                      <button
                        key={task}
                        type="button"
                        onClick={() => toggleTask(task)}
                        aria-pressed={active}
                        className={`flex h-7 items-center gap-1 rounded-[5px] border px-2 text-[8px] font-black uppercase tracking-widest transition-colors ${
                          active
                            ? 'border-accent-400/25 bg-accent-500/15 text-accent-100'
                            : 'border-white/8 bg-white/5 text-zinc-500 hover:text-white'
                        }`}
                      >
                        {active && <Check size={10} />}
                        {taskLabel(task)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <label className="mt-3 grid gap-1.5">
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                Creative Brief
              </span>
              <textarea
                value={draft.visualDna.creative_brief ?? ''}
                onChange={(event) => updateVisualDna('creative_brief', event.target.value)}
                rows={3}
                className="resize-none rounded-[6px] border border-white/14 bg-zinc-950 px-3 py-2 text-xs font-medium leading-relaxed text-white outline-none transition-colors focus:border-accent-400/45"
              />
            </label>

            <div className="mt-3 grid gap-3 xl:grid-cols-2">
              {USER_STYLE_DNA_FIELDS.map((field) => (
                <label key={field.key} className="grid gap-1.5">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                    {field.label}
                  </span>
                  <textarea
                    value={draft.visualDna[field.key] ?? ''}
                    onChange={(event) => updateVisualDna(field.key, event.target.value)}
                    rows={4}
                    className="resize-none rounded-[6px] border border-white/14 bg-zinc-950 px-3 py-2 text-xs font-medium leading-relaxed text-white outline-none transition-colors focus:border-accent-400/45"
                  />
                </label>
              ))}
            </div>

            <label className="mt-3 grid gap-1.5">
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                Avoid
              </span>
              <textarea
                value={avoidRulesText}
                onChange={(event) => setAvoidRulesText(event.target.value)}
                rows={3}
                className="resize-none rounded-[6px] border border-white/14 bg-zinc-950 px-3 py-2 text-xs font-medium leading-relaxed text-white outline-none transition-colors focus:border-accent-400/45"
              />
            </label>
          </section>

          <aside className="min-h-0 min-w-0 overflow-y-auto rounded-[8px] border border-white/12 bg-zinc-900/92 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] custom-scrollbar">
            <div className="rounded-[8px] border border-white/10 bg-zinc-950/70 p-3">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.22em] text-zinc-400">
                  <Sparkles size={13} />
                  Source
                </div>
                <span className="rounded-[5px] border border-white/10 bg-white/5 px-2 py-1 text-[8px] font-black uppercase tracking-widest text-zinc-500">
                  {authoringMode === 'codex_assist' ? 'Codex' : 'Manual'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'manual' as const, label: 'Manual' },
                  { id: 'codex_assist' as const, label: 'Codex' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAuthoringMode(item.id)}
                    aria-pressed={authoringMode === item.id}
                    className={`h-8 rounded-[6px] border px-2 text-[8px] font-black uppercase tracking-widest transition-colors ${
                      authoringMode === item.id
                        ? 'border-sky-300/25 bg-sky-500/15 text-sky-100'
                        : 'border-white/8 bg-white/5 text-zinc-500 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="mt-3 grid gap-1.5">
                {workflowSteps.map((step) => (
                  <div
                    key={step.label}
                    className={`grid grid-cols-[72px_minmax(0,1fr)] items-center gap-2 rounded-[6px] border px-2 py-1.5 ${
                      step.state === 'complete'
                        ? 'border-emerald-400/12 bg-emerald-500/8 text-emerald-100'
                        : step.state === 'active'
                          ? 'border-sky-400/12 bg-sky-500/8 text-sky-100'
                          : 'border-white/8 bg-white/4 text-zinc-500'
                    }`}
                  >
                    <span className="text-[8px] font-black uppercase tracking-widest">
                      {step.label}
                    </span>
                    <span className="truncate text-right font-mono text-[9px]">{step.detail}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 rounded-[8px] border border-white/10 bg-zinc-950/70 p-3">
              <div className="mb-3 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.22em] text-zinc-400">
                <Photo size={13} />
                References
              </div>

              <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-[7px] border border-dashed border-white/14 bg-white/[0.03] px-3 py-4 text-center transition-colors hover:border-sky-300/30 hover:bg-sky-500/8">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={(event) => {
                    handleReferenceFiles(event.currentTarget.files);
                    event.currentTarget.value = '';
                  }}
                />
                <Upload size={18} className="text-sky-200" />
                <span className="mt-2 text-[9px] font-black uppercase tracking-widest text-zinc-300">
                  Add Images
                </span>
                <span className="mt-1 text-[10px] font-medium leading-relaxed text-zinc-500">
                  {referenceImages.length}/{MAX_REFERENCE_IMAGES} references
                </span>
              </label>

              {referenceImages.length > 0 && (
                <div className="mt-3 space-y-2">
                  {referenceImages.map((image) => (
                    <div
                      key={image.id}
                      className={`rounded-[7px] border p-2 ${
                        image.included
                          ? 'border-white/12 bg-white/[0.045]'
                          : 'border-white/6 bg-white/[0.02] opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <img
                          src={image.previewUrl}
                          alt=""
                          className="h-14 w-14 shrink-0 rounded-[6px] object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[10px] font-black text-zinc-100">
                            {image.name}
                          </div>
                          <div className="mt-0.5 truncate font-mono text-[9px] text-zinc-500">
                            {image.mimeType || 'image'} {formatFileSize(image.sizeBytes)}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                updateReferenceImage(image.id, { included: !image.included })
                              }
                              aria-pressed={image.included}
                              className={`h-6 rounded-[5px] border px-2 text-[8px] font-black uppercase tracking-widest transition-colors ${
                                image.included
                                  ? 'border-emerald-400/20 bg-emerald-500/12 text-emerald-100'
                                  : 'border-white/8 bg-white/5 text-zinc-500'
                              }`}
                            >
                              {image.included ? 'On' : 'Off'}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                updateReferenceImage(image.id, {
                                  role:
                                    image.role === 'avoid_reference'
                                      ? 'style_reference'
                                      : 'avoid_reference',
                                })
                              }
                              className="h-6 rounded-[5px] border border-white/8 bg-white/5 px-2 text-[8px] font-black uppercase tracking-widest text-zinc-400 transition-colors hover:text-white"
                            >
                              {image.role === 'avoid_reference' ? 'Avoid' : 'Style'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveReferenceImage(image.id)}
                              className="h-6 rounded-[5px] border border-red-400/14 bg-red-500/8 px-2 text-[8px] font-black uppercase tracking-widest text-red-100 transition-colors hover:bg-red-500/14"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                      <input
                        value={image.notes ?? ''}
                        onChange={(event) =>
                          updateReferenceImage(image.id, { notes: event.target.value })
                        }
                        placeholder="Reference notes"
                        className="mt-2 h-8 w-full rounded-[6px] border border-white/10 bg-zinc-950 px-2 text-[10px] font-medium text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-sky-300/35"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-3 rounded-[8px] border border-white/10 bg-zinc-950/70 p-3">
              <div className="mb-3 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.22em] text-zinc-400">
                <Check size={13} />
                Apply
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {DRAFT_FIELD_SWITCHES.map((field) => {
                  const enabled = !disabledDraftFieldSet.has(field.id);
                  return (
                    <button
                      key={field.id}
                      type="button"
                      onClick={() => toggleDraftField(field.id)}
                      aria-pressed={enabled}
                      className={`flex h-8 items-center justify-between gap-2 rounded-[6px] border px-2 text-[8px] font-black uppercase tracking-widest transition-colors ${
                        enabled
                          ? 'border-emerald-400/14 bg-emerald-500/8 text-emerald-100'
                          : 'border-white/8 bg-white/4 text-zinc-600'
                      }`}
                    >
                      <span className="truncate">{field.label}</span>
                      {enabled && <Check size={10} />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-3 rounded-[8px] border border-white/10 bg-zinc-950/70 p-3">
              <div className="mb-3 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.22em] text-zinc-400">
                <Wand2 size={13} />
                Assist
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {DRAFT_ACTIONS.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => setAssistAction(action.id)}
                    aria-pressed={assistAction === action.id}
                    className={`h-8 rounded-[6px] border px-2 text-[8px] font-black uppercase tracking-widest transition-colors ${
                      assistAction === action.id
                        ? 'border-accent-400/25 bg-accent-500/15 text-accent-100'
                        : 'border-white/8 bg-white/5 text-zinc-500 hover:text-white'
                    }`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
              <textarea
                value={assistPrompt}
                onChange={(event) => setAssistPrompt(event.target.value)}
                rows={8}
                className="mt-3 w-full resize-none rounded-[6px] border border-white/14 bg-zinc-950 px-3 py-2 text-xs font-medium leading-relaxed text-white outline-none transition-colors focus:border-accent-400/45"
              />
              <button
                type="button"
                onClick={handleAssist}
                disabled={isAssisting}
                className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-[6px] border border-accent-400/20 bg-accent-500/18 px-4 text-[10px] font-black uppercase tracking-widest text-accent-100 transition-colors hover:bg-accent-500/25 disabled:opacity-45"
              >
                <Sparkles size={14} />
                {isAssisting ? 'Working' : 'Assist'}
              </button>
            </div>

            {assistWarnings.length > 0 && (
              <div className="mt-3 space-y-2">
                {assistWarnings.map((warning, index) => (
                  <div
                    key={`${warning}-${index}`}
                    className="rounded-[6px] border border-amber-400/12 bg-amber-500/8 px-3 py-2 text-[10px] font-medium leading-relaxed text-amber-100/85"
                  >
                    {warning}
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="mt-3 rounded-[6px] border border-red-400/20 bg-red-500/10 px-3 py-2 text-[10px] font-bold leading-relaxed text-red-100">
                {error}
              </div>
            )}
          </aside>
        </div>

        <div className="flex min-h-14 shrink-0 flex-wrap items-center justify-between gap-2 border-t border-white/10 bg-zinc-950/98 px-4 py-2 sm:px-5">
          <div className="flex items-center gap-2">
            {mode === 'edit' && (
              <>
                <button
                  type="button"
                  onClick={handleDuplicate}
                  disabled={isSaving}
                  className="flex h-9 items-center gap-2 rounded-[6px] border border-white/10 bg-white/5 px-3 text-[9px] font-black uppercase tracking-widest text-zinc-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-45"
                >
                  <Copy size={14} />
                  Duplicate
                </button>
                <button
                  type="button"
                  onClick={handleArchive}
                  disabled={isSaving}
                  className="flex h-9 items-center gap-2 rounded-[6px] border border-red-400/15 bg-red-500/8 px-3 text-[9px] font-black uppercase tracking-widest text-red-100 transition-colors hover:bg-red-500/14 disabled:opacity-45"
                >
                  <Trash2 size={14} />
                  Archive
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="flex h-10 items-center gap-2 rounded-[6px] border border-accent-400/20 bg-accent-500/18 px-4 text-[10px] font-black uppercase tracking-widest text-accent-100 transition-colors hover:bg-accent-500/25 disabled:cursor-not-allowed disabled:border-white/8 disabled:bg-white/5 disabled:text-zinc-600"
          >
            <Save size={15} />
            {isSaving ? 'Saving' : 'Save Style'}
          </button>
        </div>
      </div>
    </div>
  );
};
