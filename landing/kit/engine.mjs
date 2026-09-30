// Public Gvaste Pages engine bridge.
//
// `render.mjs` remains the v1 compatibility implementation while this module
// makes the semantic section registry authoritative for composition. Both
// Astro and Studio consume this module so new sections do not create a second
// renderer path.
import registry from "./section-registry.json" with { type: "json" };
import {
  detectLang,
  fileNameFor,
  highlightLines,
  langLabel,
} from "./js/modules/highlight.mjs";
import { prepareProfile } from "./profile/prepare.mjs";
import * as legacy from "./render.mjs";
import { SCHEMA, V1_NAV_LABELS, V1_PRESET_IDS, V1_PRESETS, V1_SECTION_IDS } from "./v1-contract.mjs";

const CATALOG = registry.sections ?? {};
const PRESETS = V1_PRESETS;

function fail(message) {
  throw new Error(`[gvaste-pages] ${message}`);
}

function implementedVariants(id) {
  return new Set(CATALOG[id]?.implementedVariants ?? []);
}

function requireImplementedVariant(id, value) {
  const variant = String(value ?? "").trim().toLowerCase();
  if (implementedVariants(id).has(variant)) return variant;
  if (CATALOG[id]?.variants?.includes(variant)) {
    fail(`${id}.${variant} is registered but not implemented yet`);
  }
  fail(`Unknown ${id} variant "${variant}"`);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function titleHtml(value) {
  return escapeHtml(value)
    .replaceAll("\r\n", "\n")
    .replaceAll("\\n", "\n")
    .split("\n")
    .map((line) => line.replaceAll(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("<br>");
}

function sectionList(raw) {
  const preset = String(raw?.preset ?? "library");
  const presetSections = PRESETS[preset];
  if (!Array.isArray(presetSections)) fail(`Unknown preset "${preset}"`);
  const sections = Array.isArray(raw?.sections) ? raw.sections.map(String) : [...presetSections];
  if (!sections.length) fail("sections must list at least one section");
  const seen = new Set();
  for (const id of sections) {
    if (!CATALOG[id]) fail(`Unknown section "${id}"`);
    if (seen.has(id)) fail(`Duplicate section "${id}" is not supported by gvaste-pages/v1`);
    seen.add(id);
  }
  return sections;
}

function imageItem(item, path) {
  if (!item || typeof item !== "object" || Array.isArray(item)) fail(`${path} must be an image mapping`);
  const src = String(item.src ?? "").trim();
  const alt = String(item.alt ?? "").trim();
  if (!src) fail(`${path}.src is required`);
  if (!alt) fail(`${path}.alt is required`);
  const href = String(item.href ?? "").trim();
  // `light` is the same picture taken in light mode; the page swaps it with its theme.
  const light = String(item.light ?? "").trim();
  return {
    ...item,
    src,
    alt,
    href,
    light,
    hasLight: Boolean(light),
    linked: Boolean(href),
    plain: !href,
  };
}

function codeEntry(item, path) {
  const raw = typeof item === "string" ? { code: item } : item;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) fail(`${path} must be a code mapping`);
  const source = String(raw.code ?? "").replace(/\r\n/g, "\n").replace(/\n$/, "");
  if (!source.trim()) fail(`${path}.code is required`);
  const lang = detectLang(source, raw.lang, raw.file);
  return {
    ...raw,
    code: source,
    lang,
    langLabel: langLabel(lang),
    file: fileNameFor({ ...raw, lang }),
    highlighted: highlightLines(source, lang),
  };
}

// Shaders a capability card can run behind its content (see kit/js/modules/shade-variants.js).
const CARD_SHADES = ["mist", "grain", "veil", "liquid", "flow", "speckle"];
// Scenes a card can draw instead (kit/js/modules/card-fx.js).
const CARD_FX = ["rosette", "horizon", "lift", "prompt"];

function aboutCapability(item, path, variant) {
  if (!item || typeof item !== "object" || Array.isArray(item)) fail(`${path} must be a capability mapping`);
  const title = String(item.title ?? "").trim();
  const body = String(item.body ?? "").trim();
  if (!title) fail(`${path}.title is required`);
  if (!body) fail(`${path}.body is required`);
  const image = item.image ? imageItem(item.image, `${path}.image`) : undefined;
  const result = item.result ? imageItem(item.result, `${path}.result`) : undefined;
  const code = item.code ? codeEntry(item.code, `${path}.code`) : undefined;
  const fact = String(item.fact ?? "").trim();
  const logo = String(item.logo ?? "").trim();
  if (variant === "logo-cards" && !logo) fail(`${path}.logo is required for about.logo-cards`);
  const tint = String(item.tint ?? "").trim();
  if (tint && !/^#[0-9a-f]{3,8}$/i.test(tint)) fail(`${path}.tint must be a hex colour like #10a37f`);
  const shade = String(item.shade ?? "").trim();
  if (shade && !CARD_SHADES.includes(shade)) fail(`${path}.shade must be one of ${CARD_SHADES.join(", ")}`);
  const fx = String(item.fx ?? "").trim();
  if (fx && !CARD_FX.includes(fx)) fail(`${path}.fx must be one of ${CARD_FX.join(", ")}`);
  if (fx && shade) fail(`${path} takes shade or fx, not both`);

  if (variant === "visual-cards" && !image) fail(`${path}.image is required for about.visual-cards`);
  if (variant === "alternating-feature" && !image && !result) {
    fail(`${path} needs image or result evidence for about.alternating-feature`);
  }
  if (variant === "code-backed" && !code) fail(`${path}.code is required for about.code-backed`);
  if (variant === "result-backed" && !result) fail(`${path}.result is required for about.result-backed`);

  return {
    ...item,
    title,
    body,
    image,
    result,
    code,
    fact,
    logo,
    logoMono: Boolean(logo) && item.mono === true,
    logoImage: Boolean(logo) && item.mono !== true,
    tint,
    shade,
    fx,
    cardStyle: tint ? `--cap-tint: ${tint}` : "",
    // The shader reads its hue from --accent on its own host, so the card's colour stays on the card.
    shadeStyle: tint ? `--accent: ${tint}; --accent-6: ${tint}` : "",
  };
}

function prepareAbout(block, legacyAbout) {
  const requested = block?.variant;
  if (requested == null || String(requested).trim() === "") return legacyAbout;
  if (!block || typeof block !== "object" || Array.isArray(block)) fail("about must be a mapping");
  const variant = requireImplementedVariant("about", requested);
  const title = String(block.title ?? "").trim();
  if (!title) fail("about.title is required");
  const sourceItems = Array.isArray(block.capabilities)
    ? block.capabilities
    : Array.isArray(block.features)
      ? block.features
      : [];
  if (sourceItems.length < 2 || sourceItems.length > 5) {
    fail("semantic about needs 2 to 5 capabilities");
  }
  const capabilities = sourceItems.map((item, index) =>
    aboutCapability(item, `about.capabilities[${index}]`, variant),
  );
  return {
    ...block,
    title,
    titleHtml: titleHtml(title),
    variant,
    isSemantic: true,
    capabilities,
    capabilityCount: capabilities.length,
    hasFeatures: false,
    hasSteps: false,
    hasNotes: false,
  };
}

function preparePreview(block, project) {
  if (!block) fail("preview is required when the preview section is selected");
  if (typeof block !== "object" || Array.isArray(block)) fail("preview must be a mapping");
  const sourceImages = Array.isArray(block.images)
    ? block.images
    : Array.isArray(block.items)
      ? block.items
      : block.image
        ? [block.image]
        : [];
  if (!sourceImages.length) fail("preview needs image, images, or items");
  const images = sourceImages.map((item, index) => imageItem(item, `preview.images[${index}]`));
  const inferred = images.length > 1 ? "gallery" : "single";
  const variant = requireImplementedVariant("preview", block.variant ?? inferred);
  const primary = images[0];
  const annotations = Array.isArray(block.annotations)
    ? block.annotations.map((item, index) => {
        const path = `preview.annotations[${index}]`;
        if (!item || typeof item !== "object" || Array.isArray(item)) fail(`${path} must be a mapping`);
        const label = String(item.label ?? "").trim();
        if (!label) fail(`${path}.label is required`);
        const x = Number(item.x);
        const y = Number(item.y);
        if (!Number.isFinite(x) || x < 0 || x > 100) fail(`${path}.x must be 0 to 100`);
        if (!Number.isFinite(y) || y < 0 || y > 100) fail(`${path}.y must be 0 to 100`);
        return { label, x, y };
      })
    : [];
  if (variant === "annotated") {
    if (annotations.length < 2 || annotations.length > 6) fail("preview.annotated needs 2 to 6 annotations");
  }
  // walkthrough: one screen, 2 to 5 steps; each step lights one spot on the screen.
  const steps = Array.isArray(block.steps)
    ? block.steps.map((item, index) => {
        const path = `preview.steps[${index}]`;
        if (!item || typeof item !== "object" || Array.isArray(item)) fail(`${path} must be a mapping`);
        const title = String(item.title ?? "").trim();
        if (!title) fail(`${path}.title is required`);
        const x = Number(item.x);
        const y = Number(item.y);
        const radius = Number(item.radius ?? 18);
        if (!Number.isFinite(x) || x < 0 || x > 100) fail(`${path}.x must be 0 to 100`);
        if (!Number.isFinite(y) || y < 0 || y > 100) fail(`${path}.y must be 0 to 100`);
        if (!Number.isFinite(radius) || radius < 4 || radius > 60) fail(`${path}.radius must be 4 to 60`);
        // A step may bring its own screen; x, y and radius then point into that screen.
        const shot = item.image ? imageItem(item.image, `${path}.image`) : null;
        return {
          title,
          body: String(item.body ?? "").trim(),
          x,
          y,
          radius,
          shot,
          index,
          n: String(index + 1).padStart(2, "0"),
          active: index === 0,
        };
      })
    : [];
  if (variant === "walkthrough" && (steps.length < 2 || steps.length > 5)) {
    fail("preview.walkthrough needs 2 to 5 steps");
  }
  return {
    ...block,
    title: block.title || "Preview",
    titleHtml: titleHtml(block.title || "Preview"),
    variant,
    images,
    primary,
    annotations,
    hasHeader: true,
    hasCarousel: variant === "carousel" && images.length > 1,
    hasBar: variant === "carousel" && images.length > 1,
    hasGrid: variant === "gallery" || variant === "result-grid",
    hasSingle:
      variant === "single" ||
      variant === "window" ||
      variant === "device" ||
      (variant === "carousel" && images.length === 1),
    hasAnnotated: variant === "annotated",
    hasWalkthrough: variant === "walkthrough",
    steps,
    stepCount: steps.length,
    hasStepShots: steps.some((step) => step.shot),
    isWindow: variant === "window",
    isDevice: variant === "device",
    carouselLabel: `${project?.name ?? "Project"} preview`,
    captionInitial: primary?.caption ?? "",
    glowSrc: primary?.src ?? "",
  };
}

// showcase.marquee: many small images in two endless rows moving in opposite directions.
function prepareShowcase(block) {
  if (!block || typeof block !== "object" || Array.isArray(block)) fail("showcase must be a mapping");
  const variant = requireImplementedVariant("showcase", block.variant ?? "marquee");
  const title = String(block.title ?? "").trim();
  if (!title) fail("showcase.title is required");
  const rowCount = block.rows ?? 2;
  if (![2, 3, 4].includes(rowCount)) fail("showcase.rows must be 2, 3 or 4");
  const source = Array.isArray(block.images) ? block.images : [];
  if (source.length < rowCount * 3) fail(`showcase.marquee needs at least ${rowCount * 3} images for ${rowCount} rows`);
  const images = source.map((item, index) => imageItem(item, `showcase.images[${index}]`));
  const size = Math.ceil(images.length / rowCount);
  // Rows alternate direction and drift at slightly different speeds.
  const rows = Array.from({ length: rowCount }, (_, index) => ({
    direction: index % 2 ? 1 : -1,
    duration: [46, 54, 40, 60][index],
    items: images.slice(index * size, (index + 1) * size),
  }));
  return {
    ...block,
    title,
    titleHtml: titleHtml(title),
    variant,
    rowCount,
    rows,
  };
}

function withTabChrome(items, prefix) {
  return items.map((item, index) => ({
    ...item,
    n: index + 1,
    first: index === 0,
    tabId: `${prefix}-tab-${index}`,
    panelId: `${prefix}-panel-${index}`,
    selected: index === 0 ? "true" : "false",
    tabIndex: index === 0 ? "0" : "-1",
    hidden: index !== 0,
  }));
}

function playgroundScenario(item, path) {
  if (!item || typeof item !== "object" || Array.isArray(item)) fail(`${path} must be a scenario mapping`);
  const title = String(item.title ?? "").trim();
  const body = String(item.body ?? "").trim();
  if (!title) fail(`${path}.title is required`);
  if (!body) fail(`${path}.body is required`);
  const imageSource = item.image ?? item.result;
  if (!imageSource) fail(`${path}.image is required for playground.scenario`);
  return {
    ...item,
    title,
    body,
    note: String(item.note ?? "").trim(),
    image: imageItem(imageSource, `${path}.image`),
  };
}

function preparePlayground(block) {
  if (!block) fail("playground is required when the playground section is selected");
  if (typeof block !== "object" || Array.isArray(block)) fail("playground must be a mapping");
  const variant = requireImplementedVariant("playground", block.variant ?? "scenario");
  const executionSource = String(block.executionSource ?? "kit-native").trim().toLowerCase();
  const allowedSources = CATALOG.playground?.executionSources ?? [];
  if (!allowedSources.includes(executionSource)) {
    fail(`playground execution source "${executionSource}" is not allowed`);
  }
  const network = String(block.network ?? "none").trim().toLowerCase();
  const allowedNetwork = CATALOG.playground?.networkPolicies ?? [];
  if (!allowedNetwork.includes(network)) fail(`playground network policy "${network}" is not allowed`);
  if (variant === "scenario" && executionSource !== "kit-native") {
    fail("playground.scenario requires executionSource: kit-native");
  }
  const sourceItems = Array.isArray(block.scenarios)
    ? block.scenarios
    : Array.isArray(block.items)
      ? block.items
      : [];
  if (variant === "scenario" && (sourceItems.length < 2 || sourceItems.length > 6)) {
    fail("playground.scenario requires 2 to 6 maintained scenarios");
  }
  const scenarios = withTabChrome(
    sourceItems.map((item, index) => playgroundScenario(item, `playground.scenarios[${index}]`)),
    "playground",
  );
  return {
    ...block,
    title: block.title || "Playground",
    titleHtml: titleHtml(block.title || "Playground"),
    variant,
    executionSource,
    network,
    scenarios,
    isScenario: variant === "scenario",
  };
}

function terminalEntry(item, path) {
  const raw = typeof item === "string" ? { command: item } : item;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) fail(`${path} must be a command mapping`);
  const command = String(raw.command ?? "").trim();
  if (!command) fail(`${path}.command is required`);
  const output = raw.output == null ? "" : String(raw.output).replace(/\r\n/g, "\n").replace(/\n$/, "");
  return {
    ...raw,
    command,
    output,
    hasOutput: Boolean(output),
    hasMeta: Boolean(raw.label || raw.note),
  };
}

function prepareTerminal(block) {
  if (!block) fail("terminal is required when the terminal section is selected");
  if (typeof block !== "object" || Array.isArray(block)) fail("terminal must be a mapping");
  const sourceItems = Array.isArray(block.items)
    ? block.items
    : block.command
      ? [{ command: block.command, output: block.output, label: block.label, note: block.note }]
      : [];
  if (!sourceItems.length) fail("terminal needs command or items");
  const items = sourceItems.map((item, index) => ({
    ...terminalEntry(item, `terminal.items[${index}]`),
    n: index + 1,
    first: index === 0,
  }));
  const inferred = items.length > 1 ? "task-list" : items[0].hasOutput ? "session" : "command";
  const variant = requireImplementedVariant("terminal", block.variant ?? inferred);
  if (variant === "tabs" && items.length < 2) fail("terminal.tabs requires at least two items");
  const tabbed = withTabChrome(items, "terminal").map((item) => ({
    ...item,
    label: String(item.label ?? item.command).trim() || `Command ${item.n}`,
  }));
  return {
    ...block,
    title: block.title || "Terminal",
    titleHtml: titleHtml(block.title || "Terminal"),
    variant,
    items: variant === "tabs" ? tabbed : items,
    hasHeader: true,
    isSteps: variant === "steps",
    isSession: variant === "session",
    isTaskList: variant === "task-list",
    isTabs: variant === "tabs",
    hasList: variant !== "tabs",
  };
}

function prepareCode(block) {
  if (!block) fail("code is required when the code section is selected");
  if (typeof block !== "object" || Array.isArray(block)) fail("code must be a mapping");
  const sourceItems = Array.isArray(block.items)
    ? block.items
    : block.code
      ? [{ code: block.code, lang: block.lang, file: block.file, note: block.note, title: block.label }]
      : [];
  if (!sourceItems.length) fail("code needs code or items");
  const items = sourceItems.map((item, index) => ({
    ...codeEntry(item, `code.items[${index}]`),
    n: index + 1,
    first: index === 0,
  }));
  const resultSource = block.result?.image ?? block.result ?? block.image;
  const result = resultSource ? imageItem(resultSource, "code.result") : undefined;
  const inferred = items.length > 1 ? "steps" : result ? "split" : "snippet";
  const variant = requireImplementedVariant("code", block.variant ?? inferred);
  if (variant === "split" && !result) fail("code.split requires result or image evidence");
  if (variant === "steps" && items.length < 2) fail("code.steps requires at least two items");
  if (variant === "tabs" && items.length < 2) fail("code.tabs requires at least two items");
  const tabbed = withTabChrome(items, "code").map((item) => ({
    ...item,
    label: String(item.title ?? item.file ?? item.langLabel).trim() || `Example ${item.n}`,
  }));
  return {
    ...block,
    title: block.title || "Code",
    titleHtml: titleHtml(block.title || "Code"),
    variant,
    items: variant === "tabs" ? tabbed : items,
    primary: items[0],
    result,
    hasSingle: variant !== "steps" && variant !== "tabs",
    hasSteps: variant === "steps",
    hasTabs: variant === "tabs",
    hasResult: variant === "split" && Boolean(result),
  };
}

function comparisonSide(value, path, fallbackLabel) {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail(`${path} is required`);
  const imageSource = value.image ?? (value.src ? value : undefined);
  if (!imageSource) fail(`${path}.image is required`);
  return {
    ...value,
    label: String(value.label ?? fallbackLabel),
    config: value.config == null ? "" : String(value.config).replace(/\r\n/g, "\n").replace(/\n$/, ""),
    image: imageItem(imageSource, `${path}.image`),
  };
}

function prepareComparison(block) {
  if (!block) fail("comparison is required when the comparison section is selected");
  if (typeof block !== "object" || Array.isArray(block)) fail("comparison must be a mapping");
  const variant = requireImplementedVariant("comparison", block.variant ?? "before-after");
  const items = Array.isArray(block.items) ? block.items : [];
  const leftRaw = block.left ?? block.before ?? items[0];
  const rightRaw = block.right ?? block.after ?? items[1];
  const leftLabel = variant === "before-after" || variant === "slider" ? "Before" : "A";
  const rightLabel = variant === "before-after" || variant === "slider" ? "After" : "B";
  const left = comparisonSide(leftRaw, "comparison.left", leftLabel);
  const right = comparisonSide(rightRaw, "comparison.right", rightLabel);
  const provenance = block.provenance && typeof block.provenance === "object" && !Array.isArray(block.provenance)
    ? { ...block.provenance }
    : {};
  if ((variant === "before-after" || variant === "configuration" || variant === "slider") && provenance.sameInput !== true) {
    fail(`comparison.${variant} requires provenance.sameInput: true`);
  }
  if (variant === "configuration" && (!left.config || !right.config)) {
    fail("comparison.configuration requires config on both sides");
  }
  if (provenance.source) {
    if (!provenance.source.label || !provenance.source.href) {
      fail("comparison.provenance.source requires label and href");
    }
  }
  return {
    ...block,
    title: block.title || "Comparison",
    titleHtml: titleHtml(block.title || "Comparison"),
    variant,
    left,
    right,
    provenance,
    hasSlider: variant === "slider",
    hasPair: variant !== "slider",
  };
}

function setupItem(item, path, variant) {
  if (!item || typeof item !== "object" || Array.isArray(item)) fail(`${path} must be a setup item mapping`);
  // A script reads as one terminal, so its lines only need the command.
  if (variant === "script" && !String(item.command ?? "").trim()) fail(`${path}.command is required for setup.script`);
  const title = String(item.title ?? (variant === "script" ? item.command : "") ?? "").trim();
  if (!title) fail(`${path}.title is required`);
  const body = String(item.body ?? item.note ?? "").trim();
  const value = String(item.value ?? "").trim();
  const command = String(item.command ?? "").trim();
  if (!body && !value && !command) fail(`${path} needs body, value, or command evidence`);
  return { ...item, title, body, value, command };
}

function setupConfig(value) {
  if (value == null) return undefined;
  const raw = typeof value === "string" ? { code: value, lang: "yaml", file: "config.yaml" } : value;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) fail("setup.config must be text or a mapping");
  const code = String(raw.code ?? "").replace(/\r\n/g, "\n").replace(/\n$/, "");
  if (!code.trim()) fail("setup.config.code is required");
  const lang = detectLang(code, raw.lang, raw.file);
  return {
    ...raw,
    code,
    lang,
    langLabel: langLabel(lang),
    file: fileNameFor({ ...raw, lang }),
    highlighted: highlightLines(code, lang),
  };
}

function prepareSetup(block) {
  if (!block) fail("setup is required when the setup section is selected");
  if (typeof block !== "object" || Array.isArray(block)) fail("setup must be a mapping");
  const variant = requireImplementedVariant("setup", block.variant ?? "steps");
  const items = Array.isArray(block.items)
    ? block.items.map((item, index) => ({
        ...setupItem(item, `setup.items[${index}]`, variant),
        n: index + 1,
      }))
    : [];
  const config = setupConfig(block.config);
  const verification = String(block.verification ?? "").trim();
  const notes = Array.isArray(block.notes)
    ? block.notes.map((item, index) => {
        const path = `setup.notes[${index}]`;
        if (!item || typeof item !== "object" || Array.isArray(item)) fail(`${path} must be a mapping`);
        const title = String(item.title ?? "").trim();
        const body = String(item.body ?? "").trim();
        if (!title) fail(`${path}.title is required`);
        if (!body) fail(`${path}.body is required`);
        return { title, body };
      })
    : [];

  if ((variant === "steps" || variant === "script") && items.length < 2) fail(`setup.${variant} requires at least two items`);
  if (variant === "config" && !config) fail("setup.config requires config evidence");
  if ((variant === "accounts" || variant === "environment") && items.length < 1) {
    fail(`setup.${variant} requires at least one item`);
  }
  if (variant === "first-run") {
    if (items.length < 1) fail("setup.first-run requires at least one item");
    if (!verification) fail("setup.first-run requires a verification signal");
  }

  return {
    ...block,
    title: block.title || "Setup",
    titleHtml: titleHtml(block.title || "Setup"),
    variant,
    items,
    itemCount: items.length,
    config,
    verification,
    notes,
    hasItems: items.length > 0 && variant !== "script",
    isScript: variant === "script",
    showVerification: Boolean(verification) && variant !== "script",
    scriptText: items.map((item) => item.command).join("\n"),
    hasConfig: Boolean(config),
    hasNotes: notes.length > 0,
  };
}

// skill.handoff: the page hands the project to the reader's coding agent. A prompt to copy,
// the agents it works with, and a short run of what the agent does (read, run, a step for the
// reader, make), ending on the picture it made.
const HANDOFF_KINDS = ["read", "run", "you", "make"];

function accentHtml(html, accent) {
  const needle = escapeHtml(String(accent ?? "").trim());
  const at = needle ? html.indexOf(needle) : -1;
  if (at === -1) return html;
  return `${html.slice(0, at)}<span class="hero-accent">${needle}</span>${html.slice(at + needle.length)}`;
}

function prepareSkill(block, legacySkill) {
  if (String(block?.variant ?? "").trim().toLowerCase() !== "handoff") return legacySkill;
  if (typeof block !== "object" || Array.isArray(block)) fail("skill must be a mapping");
  const variant = requireImplementedVariant("skill", block.variant);
  const title = String(block.title ?? "").trim();
  const prompt = String(block.prompt ?? "").trim();
  if (!title) fail("skill.title is required");
  if (!prompt) fail("skill.handoff requires a prompt");
  const steps = (Array.isArray(block.steps) ? block.steps : []).map((item, index) => {
    const path = `skill.steps[${index}]`;
    if (!item || typeof item !== "object" || Array.isArray(item)) fail(`${path} must be a mapping`);
    const kind = String(item.kind ?? "run").trim();
    if (!HANDOFF_KINDS.includes(kind)) fail(`${path}.kind must be one of ${HANDOFF_KINDS.join(", ")}`);
    const text = String(item.text ?? "").trim();
    if (!text) fail(`${path}.text is required`);
    return {
      kind,
      text,
      note: String(item.note ?? "").trim(),
      output: String(item.output ?? "").trim(),
      isRun: kind === "run",
      isYou: kind === "you",
      n: index + 1,
    };
  });
  if (steps.length < 2) fail("skill.handoff requires at least two steps");
  const agents = (Array.isArray(block.agents) ? block.agents : []).map((name) => String(name).trim()).filter(Boolean);
  const result = block.result ? imageItem(block.result, "skill.result") : null;
  return {
    ...block,
    variant,
    isHandoff: true,
    title,
    titleHtml: accentHtml(titleHtml(title), block.accent),
    prompt,
    promptLabel: String(block.promptLabel ?? "").trim(),
    agents,
    hasAgents: agents.length > 0,
    steps,
    result,
    hasResult: Boolean(result),
    resultCaption: String(block.result?.caption ?? "").trim(),
  };
}

const SEMANTIC_PREPARERS = {
  about: (raw, view) => prepareAbout(raw.about, view.about),
  preview: (raw, view) => preparePreview(raw.preview, view.project),
  showcase: (raw) => prepareShowcase(raw.showcase),
  playground: (raw) => preparePlayground(raw.playground),
  terminal: (raw) => prepareTerminal(raw.terminal),
  code: (raw) => prepareCode(raw.code),
  comparison: (raw) => prepareComparison(raw.comparison),
  setup: (raw) => prepareSetup(raw.setup),
  skill: (raw, view) => prepareSkill(raw.skill, view.skill),
  profile: (raw) => {
    const requested = String(raw?.profile?.variant ?? "standard").trim().toLowerCase();
    const variant = requested === "default" || requested === "" ? "standard" : requested;
    requireImplementedVariant("profile", variant);
    return prepareProfile({ ...raw.profile, variant }, { contentRoot: legacy.getContentRoot?.() });
  },
};

function hasSemanticOverride(id, raw) {
  if (id === "profile") return true;
  if (id === "skill") return String(raw?.skill?.variant ?? "").trim().toLowerCase() === "handoff";
  return id === "about" && raw?.about?.variant != null && String(raw.about.variant).trim() !== "";
}

// A section may rename its header link with navLabel.
function navFor(sections, raw) {
  return sections
    .map((id) => ({ id, label: String(raw?.[id]?.navLabel ?? "").trim() || CATALOG[id]?.navLabel }))
    .filter((item) => item.label)
    .map((item) => ({ label: item.label, href: `#${item.id}`, anchor: true }));
}

function prepareWith(raw, legacyPrepare) {
  const sections = sectionList(raw);
  for (const id of sections) {
    const section = CATALOG[id];
    if (section.v1 && !hasSemanticOverride(id, raw)) continue;
    if (!SEMANTIC_PREPARERS[id]) {
      fail(`Section "${id}" is registered but not implemented by the semantic engine yet`);
    }
  }

  const bridgeSections = sections.filter(
    (id) => CATALOG[id]?.v1 === true && !hasSemanticOverride(id, raw),
  );
  const bridgeRaw = { ...raw, sections: bridgeSections };
  for (const id of sections) {
    if (hasSemanticOverride(id, raw)) delete bridgeRaw[id];
  }
  const view = legacyPrepare(bridgeRaw);
  const semantic = {};
  for (const id of sections) {
    const prepare = SEMANTIC_PREPARERS[id];
    if (prepare) semantic[id] = prepare(raw, view);
  }
  return {
    ...view,
    ...semantic,
    sections,
    nav: navFor(sections, raw),
    // header.pauseButton: true adds a button that pauses animations that run on their own.
    hasMotionToggle: raw?.header?.pauseButton === true,
    // brand.sounds: true plays quiet cues for clicks and animations.
    hasSound: raw?.brand?.sounds === true,
  };
}

export function prepareView(raw) {
  return prepareWith(raw, legacy.prepareView);
}

export function prepareSiteDocument(yamlPath, raw) {
  return prepareWith(raw, (bridgeRaw) => legacy.prepareSiteDocument(yamlPath, bridgeRaw));
}

export function prepareSite(yamlPath) {
  const raw = legacy.loadYaml(yamlPath);
  return prepareSiteDocument(yamlPath, raw);
}

export function validate(raw) {
  prepareView(raw);
  return raw;
}

export const configureEngine = legacy.configureEngine;
export const faviconSvg = legacy.faviconSvg;
export const injectFooterHtml = legacy.injectFooterHtml;
export const loadYaml = legacy.loadYaml;
export const renderFooterHtml = legacy.renderFooterHtml;
export const renderHeaderHtml = legacy.renderHeaderHtml;
export const renderSectionHtml = legacy.renderSectionHtml;
export const commandsKeyboardHtml = legacy.commandsKeyboardHtml;
export const commandsKeyboardKind = legacy.commandsKeyboardKind;
export const commandsKeyboardLayout = legacy.commandsKeyboardLayout;
export const commandKeyIds = legacy.commandKeyIds;

export { registry as SECTION_REGISTRY };
export { SCHEMA, V1_NAV_LABELS, V1_PRESET_IDS, V1_PRESETS, V1_SECTION_IDS };
