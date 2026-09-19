import { IconCheck as Check } from '@tabler/icons-react';
import React from 'react';
import { getStyleRuntimePresetDisplayName, type StyleRuntimePreset } from './stylesData';
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

function styleSlotName(preset: StyleRuntimePreset) {
  return getStyleRuntimePresetDisplayName(preset);
}

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
      <div className="rounded-[var(--wb-radius)] border border-dashed border-[color:var(--wb-line)] bg-[color:var(--wb-panel)] px-3 py-4 text-center text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-muted)] shadow-lg shadow-black/25">
        Select styles first
      </div>
    );
  }

  return (
    <div
      data-style-advanced-controls
      className="rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-panel)] p-2 shadow-lg shadow-black/35"
    >
      <div className="space-y-2">
        {selectedStyles.map((slot, index) => {
          const layer = selectedStyleLayers[index] ?? createSelectedStyleLayer(slot, index);
          const enabled = slot.enabled ?? true;
          const presetName = styleSlotName(slot.preset);
          return (
            <div
              key={slot.preset.id}
              className={`rounded-[var(--wb-radius)] border p-2.5 transition-colors ${
                enabled
                  ? 'border-[color:var(--wb-line)] bg-[color:var(--wb-panel)]/84'
                  : 'border-[color:var(--wb-line)] bg-[color:var(--wb-panel)]/52 text-[color:var(--wb-muted)] opacity-75'
              }`}
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-muted)]">
                    Slot {index + 1} / {slot.packName}
                  </div>
                  <div className="truncate text-[length:var(--wbp-label)] font-semibold tracking-tight text-[color:var(--wb-ink)]">
                    {presetName}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleStyleEnabled(slot.preset.id)}
                  aria-pressed={enabled}
                  className={`flex h-7 shrink-0 items-center gap-1 rounded-[var(--wb-radius)] border px-2 text-[length:var(--wbp-label)] font-semibold tracking-normal transition-colors ${
                    enabled
                      ? 'border-emerald-400/2 bg-emerald-500/14 text-[color:var(--wb-success)] '
                      : 'border-[color:var(--wb-line)] bg-white/7 text-[color:var(--wb-muted)]'
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
                      className={`h-7 rounded-[var(--wb-radius)] border px-2 text-[length:var(--wbp-label)] font-semibold tracking-normal transition-colors ${
                        active
                          ? 'border-accent-400/2 bg-accent-500/15 text-accent-100'
                          : 'border-[color:var(--wb-line)] bg-white/[0.05] text-[color:var(--wb-muted)] hover:text-[color:var(--wb-ink)]'
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
                      className="grid grid-cols-[4.9rem_minmax(0,1fr)] items-center gap-2 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-black/22 p-1.5"
                    >
                      <button
                        type="button"
                        onClick={() => onToggleField(slot.preset.id, field.id)}
                        aria-pressed={fieldEnabled}
                        className={`h-7 rounded-[var(--wb-radius)] border px-2 text-left text-[length:var(--wbp-label)] font-semibold tracking-normal transition-colors ${
                          fieldEnabled
                            ? 'border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] text-[color:var(--wb-ink)]'
                            : 'border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_3%,transparent)] text-[color:var(--wb-dim)]'
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
                          className="studio-range"
                          aria-label={`${field.label} weight ${presetName}`}
                        />
                        <span className="w-7 text-right text-[length:var(--wbp-label)] font-semibold tabular-nums text-[color:var(--wb-muted)]">
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
