import type { ProviderDefaultSettings } from '../../packages/shared/src/studioSettings';
import {
  CODEX_HTTP_CHAT_MODEL,
  CODEX_HTTP_IMAGE_DISPLAY_NAME,
  CODEX_HTTP_REASONING,
  type CodexExecutionTransport,
} from '../../packages/shared/src/codexExecutionContract';

export function ProviderExecutionDefaultsFields({
  value,
  onChange,
  availableModels,
  providerDefaultModel,
  codexTransport,
}: {
  value: ProviderDefaultSettings;
  onChange: (patch: Partial<ProviderDefaultSettings>) => void;
  availableModels?: string[];
  providerDefaultModel?: string | null;
  codexTransport?: CodexExecutionTransport;
}) {
  if (value.providerId === 'codex' && codexTransport === 'subscription_http') {
    const incompatible =
      (value.model && value.model !== CODEX_HTTP_CHAT_MODEL) ||
      (value.reasoningEffort && value.reasoningEffort !== CODEX_HTTP_REASONING) ||
      value.serviceTier;
    return (
      <div className="md:col-span-2 space-y-3 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_4%,transparent)] p-4">
        <p className="text-xs text-[color:var(--wb-ink)]">ChatGPT HTTP · GPT-5.5</p>
        <p className="text-xs text-[color:var(--wb-muted)]">
          {CODEX_HTTP_IMAGE_DISPLAY_NAME} · Medium · Managed
        </p>
        {incompatible ? (
          <p role="status" className="text-xs text-[color:var(--wb-warning)] ">
            The saved execution defaults do not match HTTP. Apply the current HTTP settings before
            generating.
          </p>
        ) : null}
        <button
          type="button"
          onClick={() =>
            onChange({
              model: CODEX_HTTP_CHAT_MODEL,
              reasoningEffort: CODEX_HTTP_REASONING,
              serviceTier: null,
            })
          }
          className="rounded bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] px-3 py-2 text-xs text-[color:var(--wb-ink)]"
        >
          Apply HTTP execution settings
        </button>
      </div>
    );
  }
  const isAgentCli = value.providerId === 'grok' || value.providerId === 'antigravity';
  const modelOptions = availableModels ?? [];
  const storedModel = value.model?.trim() || '';
  const modelIsKnown = !storedModel || modelOptions.includes(storedModel);
  const defaultLabel = providerDefaultModel
    ? `${isAgentCli ? 'CLI' : 'Provider'} default (${providerDefaultModel})`
    : isAgentCli
      ? 'CLI default'
      : 'Provider default';

  return (
    <div className="md:col-span-2 grid gap-3 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_4%,transparent)] p-4 md:grid-cols-3">
      <div className="md:col-span-3">
        <div className="text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-muted)]">
          Execution defaults
        </div>
        <p className="mt-1 text-[length:var(--wbp-label)] leading-relaxed text-[color:var(--wb-dim)]">
          Used unless a generation overrides them. Leave blank to use provider defaults.
        </p>
      </div>
      <label className="flex flex-col gap-2">
        <span className="text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-dim)]">
          Model
        </span>
        {modelOptions.length > 0 ? (
          <select
            value={value.model ?? ''}
            onChange={(event) => onChange({ model: event.target.value.trim() || null })}
            aria-label="Provider default model"
            className="h-10 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] px-3 font-mono text-xs text-[color:var(--wb-ink)] outline-none transition-colors focus:border-accent-400/2"
          >
            <option value="">{defaultLabel}</option>
            {storedModel && !modelIsKnown ? (
              <option value={storedModel}>{storedModel} (unavailable)</option>
            ) : null}
            {modelOptions.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        ) : (
          <input
            value={value.model ?? ''}
            onChange={(event) => onChange({ model: event.target.value.trim() || null })}
            placeholder="Provider default"
            aria-label="Provider default model"
            className="h-10 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] px-3 font-mono text-xs text-[color:var(--wb-ink)] outline-none transition-colors placeholder:text-[color:var(--wb-dim)] focus:border-accent-400/2"
          />
        )}
        {modelOptions.length > 0 && storedModel && !modelIsKnown ? (
          <p
            role="status"
            className="text-[length:var(--wbp-label)] leading-relaxed text-[color:var(--wb-warning)] "
          >
            {storedModel} is not in the current provider model list. Choose the provider default or
            a listed model.
          </p>
        ) : null}
      </label>
      <label className="flex flex-col gap-2">
        <span className="text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-dim)]">
          Reasoning
        </span>
        {isAgentCli ? (
          <select
            value={value.reasoningEffort ?? ''}
            onChange={(event) => onChange({ reasoningEffort: event.target.value.trim() || null })}
            aria-label="Provider default reasoning effort"
            className="h-10 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] px-3 text-xs font-semibold tracking-normal text-[color:var(--wb-ink)] outline-none transition-colors focus:border-accent-400/2"
          >
            <option value="">Provider default</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        ) : (
          <input
            value={value.reasoningEffort ?? ''}
            onChange={(event) => onChange({ reasoningEffort: event.target.value.trim() || null })}
            placeholder="Provider default"
            aria-label="Provider default reasoning effort"
            className="h-10 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] px-3 font-mono text-xs text-[color:var(--wb-ink)] outline-none transition-colors placeholder:text-[color:var(--wb-dim)] focus:border-accent-400/2"
          />
        )}
      </label>
      {isAgentCli ? null : (
        <label className="flex flex-col gap-2">
          <span className="text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-dim)]">
            Service Tier
          </span>
          <select
            value={value.serviceTier ?? ''}
            onChange={(event) =>
              onChange({
                serviceTier:
                  event.target.value === 'fast' || event.target.value === 'flex'
                    ? event.target.value
                    : null,
              })
            }
            aria-label="Provider default service tier"
            className="h-10 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] px-3 text-xs font-semibold tracking-normal text-[color:var(--wb-ink)] outline-none transition-colors focus:border-accent-400/2"
          >
            <option value="">Provider default</option>
            <option value="fast">Fast</option>
            <option value="flex">Flex</option>
          </select>
        </label>
      )}
    </div>
  );
}
