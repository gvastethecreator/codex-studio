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
      <div className="md:col-span-2 space-y-3 rounded-lg border border-white/2 bg-white/4 p-4">
        <p className="text-xs text-white">ChatGPT HTTP · GPT-5.5</p>
        <p className="text-xs text-zinc-400">{CODEX_HTTP_IMAGE_DISPLAY_NAME} · Medium · Managed</p>
        {incompatible ? (
          <p role="status" className="text-xs text-amber-200">
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
          className="rounded bg-white/10 px-3 py-2 text-xs text-white"
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
      : 'Provider bootstrap';

  return (
    <div className="md:col-span-2 grid gap-3 rounded-lg border border-white/2 bg-white/4 p-4 md:grid-cols-3">
      <div className="md:col-span-3">
        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
          Provider Execution Defaults
        </div>
        <p className="mt-1 text-[10px] leading-relaxed text-zinc-600">
          Used when a job does not send an explicit override. Empty values fall back to the provider
          bootstrap configuration.
        </p>
      </div>
      <label className="flex flex-col gap-2">
        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Model</span>
        {modelOptions.length > 0 ? (
          <select
            value={value.model ?? ''}
            onChange={(event) => onChange({ model: event.target.value.trim() || null })}
            aria-label="Provider default model"
            className="h-10 rounded-lg border border-white/2 bg-black/30 px-3 font-mono text-xs text-white outline-none transition-colors focus:border-accent-400/2"
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
            placeholder="Provider bootstrap"
            aria-label="Provider default model"
            className="h-10 rounded-lg border border-white/2 bg-black/30 px-3 font-mono text-xs text-white outline-none transition-colors placeholder:text-zinc-700 focus:border-accent-400/2"
          />
        )}
        {modelOptions.length > 0 && storedModel && !modelIsKnown ? (
          <p role="status" className="text-[10px] leading-relaxed text-amber-200/80">
            {storedModel} is not in the current provider model list. Choose the provider default or
            a listed model.
          </p>
        ) : null}
      </label>
      <label className="flex flex-col gap-2">
        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">
          Reasoning
        </span>
        {isAgentCli ? (
          <select
            value={value.reasoningEffort ?? ''}
            onChange={(event) => onChange({ reasoningEffort: event.target.value.trim() || null })}
            aria-label="Provider default reasoning effort"
            className="h-10 rounded-lg border border-white/2 bg-black/30 px-3 text-xs font-black uppercase tracking-widest text-white outline-none transition-colors focus:border-accent-400/2"
          >
            <option value="">Provider bootstrap</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        ) : (
          <input
            value={value.reasoningEffort ?? ''}
            onChange={(event) => onChange({ reasoningEffort: event.target.value.trim() || null })}
            placeholder="Provider bootstrap"
            aria-label="Provider default reasoning effort"
            className="h-10 rounded-lg border border-white/2 bg-black/30 px-3 font-mono text-xs text-white outline-none transition-colors placeholder:text-zinc-700 focus:border-accent-400/2"
          />
        )}
      </label>
      {isAgentCli ? null : (
        <label className="flex flex-col gap-2">
          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">
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
            className="h-10 rounded-lg border border-white/2 bg-black/30 px-3 text-xs font-black uppercase tracking-widest text-white outline-none transition-colors focus:border-accent-400/2"
          >
            <option value="">Provider bootstrap</option>
            <option value="fast">Fast</option>
            <option value="flex">Flex</option>
          </select>
        </label>
      )}
    </div>
  );
}
