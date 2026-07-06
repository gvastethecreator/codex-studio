import { IconCheck as Check } from '@tabler/icons-react';
import React from 'react';
import {
  createSelectedStyleLayer,
  formatStyleLayerFieldWeight,
  STYLE_LAYER_FIELD_DEFINITIONS,
  type SelectedStyleLayer,
  type SelectedStyleSlot,
  type StyleLayerAvoidRulesMode,
  type StyleLayerFieldId,
} from './styleLayerComposer';

const STYLE_AVOID_RULE_MODES: { id: StyleLayerAvoidRulesMode; label: string }[] = [
  { id: 'merge', label: 'Merge' },
  { id: 'ignore', label: 'Ignore' },
  { id: 'strict', label: 'Strict' },
];

interface StyleAdvancedControlsPanelProps {
  selectedStyles: SelectedStyleSlot[];
  selectedStyleLayers: SelectedStyleLayer[];
  onToggleStyleEnabled: (presetId: string) => void;
  onToggleField: (presetId: string, fieldId: StyleLayerFieldId) => void;
  onUpdateFieldWeight: (presetId: string, fieldId: StyleLayerFieldId, weight: number) => void;
  onSetAvoidRulesMode: (presetId: string, mode: StyleLayerAvoidRulesMode) => void;
}

export const StyleAdvancedControlsPanel: React.FC<StyleAdvancedControlsPanelProps> = ({
  selectedStyles,
  selectedStyleLayers,
  onToggleStyleEnabled,
  onToggleField,
  onUpdateFieldWeight,
  onSetAvoidRulesMode,
}) => {
  if (selectedStyles.length === 0) {
    return (
      <div className="rounded-[8px] border border-dashed border-white/12 bg-zinc-950/88 px-3 py-4 text-center text-[9px] font-black uppercase tracking-widest text-zinc-500 shadow-lg shadow-black/25">
        Select styles first
      </div>
    );
  }

  return (
    <div
      data-style-advanced-controls
      className="rounded-[8px] border border-white/12 bg-zinc-950/92 p-2 shadow-lg shadow-black/35"
    >
      <div className="mb-2 flex items-center justify-between gap-2 border-b border-white/8 px-1 pb-2">
        <div className="text-[9px] font-black uppercase tracking-[0.22em] text-zinc-400">
          Advanced Layers
        </div>
        <div className="rounded-[5px] border border-white/10 bg-white/6 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-zinc-500">
          {selectedStyles.length} active
        </div>
      </div>
      <div className="space-y-2">
        {selectedStyles.map((slot, index) => {
          const layer = selectedStyleLayers[index] ?? createSelectedStyleLayer(slot, index);
          const enabled = slot.enabled ?? true;
          return (
            <div
              key={slot.preset.id}
              className={`rounded-[7px] border p-2.5 transition-colors ${
                enabled
                  ? 'border-white/12 bg-zinc-900/84'
                  : 'border-white/7 bg-zinc-900/52 text-zinc-500 opacity-75'
              }`}
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-[8px] font-black uppercase tracking-widest text-zinc-500">
                    Slot {index + 1} / {slot.packName}
                  </div>
                  <div className="truncate text-[10px] font-black uppercase tracking-tight text-white">
                    {slot.preset.name}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleStyleEnabled(slot.preset.id)}
                  aria-pressed={enabled}
                  className={`flex h-7 shrink-0 items-center gap-1 rounded-[6px] border px-2 text-[8px] font-black uppercase tracking-widest transition-colors ${
                    enabled
                      ? 'border-emerald-400/24 bg-emerald-500/14 text-emerald-100'
                      : 'border-white/10 bg-white/7 text-zinc-500'
                  }`}
                >
                  <Check size={11} />
                  {enabled ? 'On' : 'Off'}
                </button>
              </div>

              <div className="mb-2 flex flex-wrap gap-1">
                {STYLE_AVOID_RULE_MODES.map((mode) => {
                  const active = (slot.avoidRulesMode ?? 'merge') === mode.id;
                  return (
                    <button
                      type="button"
                      key={mode.id}
                      onClick={() => onSetAvoidRulesMode(slot.preset.id, mode.id)}
                      className={`h-7 rounded-[6px] border px-2 text-[8px] font-black uppercase tracking-widest transition-colors ${
                        active
                          ? 'border-accent-400/25 bg-accent-500/15 text-accent-100'
                          : 'border-white/10 bg-white/[0.05] text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {mode.label}
                    </button>
                  );
                })}
              </div>

              <div className="grid gap-2">
                {STYLE_LAYER_FIELD_DEFINITIONS.map((field) => {
                  const fieldState = layer.fields[field.id];
                  const fieldEnabled = enabled && fieldState.enabled;
                  return (
                    <div
                      key={field.id}
                      className="grid grid-cols-[4.9rem_minmax(0,1fr)] items-center gap-2 rounded-[6px] border border-white/6 bg-black/22 p-1.5"
                    >
                      <button
                        type="button"
                        onClick={() => onToggleField(slot.preset.id, field.id)}
                        aria-pressed={fieldEnabled}
                        className={`h-7 rounded-[6px] border px-2 text-left text-[8px] font-black uppercase tracking-widest transition-colors ${
                          fieldEnabled
                            ? 'border-white/14 bg-white/10 text-zinc-100'
                            : 'border-white/8 bg-white/[0.03] text-zinc-600'
                        }`}
                      >
                        {field.label}
                      </button>
                      <div className="flex min-w-0 items-center gap-1.5">
                        <input
                          type="range"
                          min={0.1}
                          max={1}
                          step={0.05}
                          disabled={!fieldEnabled}
                          value={fieldState.weight}
                          onChange={(event) =>
                            onUpdateFieldWeight(
                              slot.preset.id,
                              field.id,
                              Number(event.target.value),
                            )
                          }
                          className="h-1 min-w-0 flex-1 accent-white disabled:opacity-30"
                          aria-label={`${field.label} weight ${slot.preset.name}`}
                        />
                        <span className="w-7 text-right text-[8px] font-black tabular-nums text-zinc-400">
                          {formatStyleLayerFieldWeight(fieldState.weight)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
