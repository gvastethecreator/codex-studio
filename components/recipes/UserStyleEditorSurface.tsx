import {
  IconCheck as Check,
  IconCopy as Copy,
  IconDeviceFloppy as Save,
  IconSparkles as Sparkles,
  IconTrash as Trash2,
  IconWand as Wand2,
  IconX as X,
} from '@tabler/icons-react';
import React, { useEffect, useMemo, useState } from 'react';
import type {
  UserStyleDraftAction,
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
  createUserStyleInputFromDraft,
  createUserStyleVisualDna,
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
  const [tagsText, setTagsText] = useState(initialDraft.tags.join(', '));
  const [avoidRulesText, setAvoidRulesText] = useState(initialDraft.avoidRules.join('\n'));
  const [assistPrompt, setAssistPrompt] = useState('');
  const [assistAction, setAssistAction] = useState<UserStyleDraftAction>('draft_from_description');
  const [assistWarnings, setAssistWarnings] = useState<string[]>(initialDraft.warnings);
  const [isSaving, setIsSaving] = useState(false);
  const [isAssisting, setIsAssisting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(initialDraft);
    setSource(initialSource);
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

  const handleAssist = async () => {
    setError(null);
    setIsAssisting(true);
    try {
      const response = await draftUserStylePreset({
        action: assistAction,
        description: assistPrompt,
        draft: normalizedDraft,
        selectedStyleLayers,
      });
      setDraft(response.draft);
      setTagsText(response.draft.tags.join(', '));
      setAvoidRulesText(response.draft.avoidRules.join('\n'));
      setAssistWarnings(uniqueTextList([...response.draft.warnings, ...response.warnings]));
      setSource({
        kind: 'codex_assist',
        note: 'Created or revised through style assist.',
        data: { action: assistAction, source: response.source },
      });
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
      const input = createUserStyleInputFromDraft(
        normalizedDraft,
        source ?? { kind: 'manual', note: 'Created manually in Style Editor.' },
      );
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

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden bg-zinc-950/95 p-3 lg:grid-cols-[minmax(0,1fr)_300px] lg:p-4">
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
