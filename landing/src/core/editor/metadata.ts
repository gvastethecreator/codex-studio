import { SHADE_VARIANTS } from "../../../kit/js/modules/shade-variants.js";
import registry from "../../../kit/section-registry.json" with { type: "json" };

export type WidgetType =
  | "string"
  | "textarea"
  | "number"
  | "slider"
  | "boolean"
  | "enum"
  | "color"
  | "font"
  | "alignment"
  | "spacing"
  | "url"
  | "command"
  | "image"
  | "array"
  | "object"
  | "set"
  | "variant";

export type FieldGroup = "content" | "layout" | "style" | "responsive" | "advanced" | "page";
export type FieldOwner = "site" | "template";

export interface ItemField {
  key: string;
  label: string;
  widget: WidgetType;
  icon?: string;
  help?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  itemFields?: ItemField[];
  itemLabel?: string;
  itemDefault?: unknown;
  min?: number;
  max?: number;
  step?: number;
  units?: string;
  minItems?: number;
  maxItems?: number;
}

export interface FieldMeta extends ItemField {
  path: string;
  group: FieldGroup;
  owner: FieldOwner;
  inline?: boolean;
  inlineSelector?: string;
}

export interface SectionMeta {
  id: string;
  label: string;
  icon: string;
  category: string;
  description: string;
  variants: { id: string; label: string }[];
  defaults: Record<string, unknown>;
}

export const SECTION_METADATA: Record<string, SectionMeta> = {
  hero: {
    id: "hero",
    label: "Hero",
    icon: "layout",
    category: "Foundation",
    description: "Title, lede, actions, and optional gallery.",
    variants: [
      { id: "default", label: "Default" },
      { id: "editorial", label: "Editorial" },
    ],
    defaults: { title: "New project.", lede: "One sentence about what it does." },
  },
  about: {
    id: "about",
    label: "About",
    icon: "info",
    category: "Foundation",
    description: "Two to four features. The active one opens HTML or an image.",
    variants: [{ id: "default", label: "Default" }],
    defaults: {
      title: "About.",
      features: [
        {
          title: "Feature",
          body: "One line.",
          tabler: "layout",
          html: "<p>What this path solves.</p>",
        },
        {
          title: "Feature",
          body: "One line.",
          tabler: "browser",
          html: "<p>What this path solves.</p>",
        },
      ],
    },
  },
  github: {
    id: "github",
    label: "GitHub",
    icon: "git",
    category: "Trust / project",
    description: "Public repository pulse.",
    variants: [
      { id: "default", label: "Default" },
      { id: "signal-desk", label: "Signal desk" },
    ],
    defaults: {},
  },
  profile: {
    id: "profile",
    label: "Profile",
    icon: "git",
    category: "Trust / project",
    description: "Public GitHub user page from a reviewed snapshot.",
    variants: [
      { id: "default", label: "Standard" },
      { id: "folio", label: "Folio" },
      { id: "observatory", label: "Observatory" },
      { id: "heatmap", label: "Heatmap" },
      { id: "orbit", label: "Orbit" },
      { id: "projects", label: "Projects" },
    ],
    defaults: {
      user: "sample-builder",
      snapshot: "assets/profile-sample.json",
    },
  },
  screens: {
    id: "screens",
    label: "Screens",
    icon: "image",
    category: "Proof",
    description: "Screenshot stage or carousel.",
    variants: [
      { id: "default", label: "Default" },
      { id: "stage", label: "Stage" },
    ],
    defaults: { title: "Screens.", images: [] },
  },
  demo: {
    id: "demo",
    label: "Demo",
    icon: "play",
    category: "Proof",
    description: "Component workbench with preview, source, prompt, compare, and playground layouts.",
    variants: [{ id: "default", label: "Default" }],
    defaults: {
      views: [{ id: "one", label: "One", title: "First view", lang: "html", file: "one.html", code: "<button type=\"button\">Action</button>" }],
    },
  },
  docs: {
    id: "docs",
    label: "Docs",
    icon: "book",
    category: "Adoption",
    description: "Documentation links.",
    variants: [{ id: "default", label: "Default" }],
    defaults: { items: [{ title: "Readme", href: "https://example.com" }] },
  },
  download: {
    id: "download",
    label: "Download",
    icon: "download",
    category: "Adoption",
    description: "Platform downloads.",
    variants: [{ id: "default", label: "Default" }],
    defaults: { items: [{ platform: "Windows", href: "https://example.com" }] },
  },
  commands: {
    id: "commands",
    label: "Commands",
    icon: "keyboard",
    category: "Proof",
    description: "Shortcut or CLI table.",
    variants: [
      { id: "default", label: "Default" },
      { id: "mac", label: "Mac" },
      { id: "terminal", label: "Terminal" },
      { id: "schematic", label: "Tactile" },
    ],
    defaults: { items: [{ keys: "Ctrl+K", action: "Open command palette" }] },
  },
  matrix: {
    id: "matrix",
    label: "Status",
    icon: "table",
    category: "Adoption",
    description: "Status matrix.",
    variants: [{ id: "default", label: "Default" }],
    defaults: { columns: ["Item", "Status"], rows: [{ name: "Core", status: "ready" }] },
  },
  faq: {
    id: "faq",
    label: "FAQ",
    icon: "info",
    category: "Trust / project",
    description: "Numbered questions with short answers.",
    variants: [{ id: "default", label: "Default" }],
    defaults: {
      title: "Questions that come up.",
      items: [{ question: "Where does the copy live?", answer: "In site.yaml." }],
    },
  },
  trust: {
    id: "trust",
    label: "Privacy",
    icon: "shield",
    category: "Trust / project",
    description: "Local vs network trust.",
    variants: [{ id: "default", label: "Default" }],
    defaults: {
      local: { title: "Stays local", items: ["Nothing leaves the machine."] },
      network: { title: "Leaves the machine", items: ["Named network call."] },
    },
  },
  skill: {
    id: "skill",
    label: "Skill",
    icon: "spark",
    category: "Adoption",
    description: "Agent skill install.",
    variants: [{ id: "default", label: "Default" }],
    defaults: { command: "npx skills add example" },
  },
  links: {
    id: "links",
    label: "Links",
    icon: "link",
    category: "Conversion",
    description: "Outbound project links.",
    variants: [{ id: "default", label: "Default" }],
    defaults: { items: [{ label: "Repository", href: "https://github.com/example/app" }] },
  },
  closing: {
    id: "closing",
    label: "Closing",
    icon: "flag",
    category: "Conversion",
    description: "Final line and action.",
    variants: [{ id: "default", label: "Default" }],
    defaults: { text: "Ship the page." },
  },
};

function titleCase(id: string) {
  return id
    .split("-")
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

function catalogVariants(id: string, section: { v1?: boolean; variants?: string[]; implementedVariants?: string[] }) {
  const ids = section.implementedVariants?.length
    ? section.implementedVariants
    : section.v1
      ? ["default"]
      : section.variants?.length
        ? section.variants
        : ["default"];
  return ids.map((variantId) => ({ id: variantId, label: titleCase(variantId) }));
}

for (const [id, section] of Object.entries(registry.sections as Record<string, any>)) {
  if (section.v1 !== true && section.implementationStatus !== "implemented") continue;
  const overlay = SECTION_METADATA[id];
  SECTION_METADATA[id] = {
    id,
    label: section.navLabel || overlay?.label || titleCase(id),
    icon: overlay?.icon ?? "layout",
    category: section.studioCategory || overlay?.category || "Page",
    description: overlay?.description ?? "",
    variants: catalogVariants(id, section),
    defaults: overlay?.defaults ?? {},
  };
}

const item = (key: string, label: string, extra: Partial<ItemField> = {}): ItemField => ({
  key,
  label,
  widget: extra.widget ?? "string",
  ...extra,
});

export const ACTION_FIELDS: ItemField[] = [
  item("label", "Label", { icon: "type", placeholder: "Get started" }),
  item("href", "Link", { widget: "url", icon: "url", placeholder: "https://" }),
  item("command", "Command", { widget: "command", icon: "command", placeholder: "pnpm add …" }),
  item("primary", "Primary", { widget: "boolean", icon: "spark" }),
];

export const IMAGE_FIELDS: ItemField[] = [
  item("src", "File", { widget: "image", icon: "image", placeholder: "assets/shot.png" }),
  item("alt", "Alt text", { icon: "type", placeholder: "What the image shows" }),
  item("caption", "Caption", { icon: "note" }),
  item("href", "Link", { widget: "url", icon: "url" }),
];

export const TEXT_ITEM_FIELDS: ItemField[] = [
  item("title", "Title", { icon: "type" }),
  item("body", "Body", { widget: "textarea", icon: "note" }),
  item("href", "Link", { widget: "url", icon: "url" }),
  item("note", "Note", { icon: "note" }),
];

export const FAQ_ITEM_FIELDS: ItemField[] = [
  item("question", "Question", { icon: "type" }),
  item("answer", "Answer", { widget: "textarea", icon: "note" }),
  item("open", "Open", { widget: "boolean", icon: "spark" }),
];

export const EXAMPLE_FIELDS: ItemField[] = [
  item("name", "Name", { icon: "type" }),
  item("body", "Body", { widget: "textarea", icon: "note" }),
  item("href", "Link", { widget: "url", icon: "url" }),
];

export const DEMO_VIEW_FIELDS: ItemField[] = [
  item("id", "Id", { icon: "hash", placeholder: "one" }),
  item("label", "Tab", { icon: "flag" }),
  item("title", "Title", { icon: "type" }),
  item("body", "Body", { widget: "textarea", icon: "note" }),
  item("lang", "Language", {
    widget: "enum",
    icon: "code",
    options: [
      { value: "html", label: "HTML" },
      { value: "css", label: "CSS" },
      { value: "javascript", label: "JavaScript" },
      { value: "yaml", label: "YAML" },
      { value: "json", label: "JSON" },
      { value: "bash", label: "Shell" },
      { value: "text", label: "Text" },
    ],
  }),
  item("file", "File name", { icon: "file", placeholder: "button.html" }),
  item("code", "Code", { widget: "textarea", icon: "code" }),
  item("preview", "Preview HTML", { widget: "textarea", icon: "play" }),
  item("prompt", "Prompt", { widget: "textarea", icon: "spark" }),
];

export const DOWNLOAD_FIELDS: ItemField[] = [
  item("platform", "Platform", {
    widget: "enum",
    icon: "desktop",
    options: [
      { value: "Windows", label: "Windows" },
      { value: "macOS", label: "macOS" },
      { value: "Linux", label: "Linux" },
    ],
  }),
  item("arch", "Arch", { icon: "cpu", placeholder: "x64" }),
  item("version", "Version", { icon: "hash" }),
  item("label", "Label", { icon: "type" }),
  item("href", "File URL", { widget: "url", icon: "url" }),
];

export const COMMAND_FIELDS: ItemField[] = [
  item("keys", "Keys", { icon: "keyboard", placeholder: "Ctrl+K" }),
  item("action", "Action", { icon: "type" }),
];

export const MATRIX_ROW_FIELDS: ItemField[] = [
  item("name", "Name", { icon: "type" }),
  item("status", "Status", {
    widget: "enum",
    icon: "check",
    options: [
      { value: "ready", label: "Ready" },
      { value: "wip", label: "In progress" },
      { value: "planned", label: "Planned" },
      { value: "na", label: "N/A" },
    ],
  }),
];

export const DOCS_ITEM_FIELDS: ItemField[] = [
  item("title", "Title", { icon: "type" }),
  item("label", "Label", { icon: "type" }),
  item("file", "Markdown file", { icon: "note", placeholder: "README.md" }),
  item("href", "URL", { widget: "url", icon: "url", placeholder: "https://" }),
  item("body", "Body", { widget: "textarea", icon: "note" }),
  item("note", "Note", { icon: "note" }),
];

export const LINK_ITEM_FIELDS: ItemField[] = [
  item("title", "Title", { icon: "type" }),
  item("label", "Label", { icon: "type" }),
  item("href", "URL", { widget: "url", icon: "url", placeholder: "https://" }),
  item("body", "Body", { widget: "textarea", icon: "note" }),
  item("note", "Note", { icon: "note" }),
];

export const TRUST_PANE_FIELDS: ItemField[] = [
  item("title", "Title", { icon: "type" }),
  item("items", "Points", { widget: "array", icon: "list", itemLabel: "Point", itemDefault: "" }),
];

const DISPLAY_FONTS = ["Arimo", "IBM Plex Sans", "Inter", "Source Serif 4", "Newsreader", "Geist"];
const MONO_FONTS = ["Geist Mono", "IBM Plex Mono", "JetBrains Mono", "Source Code Pro"];

const inline = (
  path: string,
  label: string,
  extra: Partial<FieldMeta> & { inlineSelector: string },
): FieldMeta => ({
  path,
  key: path.split("/").at(-1) ?? path,
  label,
  group: "content",
  widget: extra.widget ?? "string",
  owner: "site",
  inline: true,
  icon: extra.icon ?? (extra.widget === "textarea" ? "note" : "type"),
  ...extra,
});

const siteField = (path: string, label: string, extra: Partial<FieldMeta> = {}): FieldMeta => ({
  path,
  key: path.split("/").at(-1) ?? path,
  label,
  group: extra.group ?? "content",
  widget: extra.widget ?? "string",
  owner: "site",
  ...extra,
});

const tokenField = (path: string, label: string, extra: Partial<FieldMeta>): FieldMeta => ({
  path,
  key: path.split("/").at(-1) ?? path,
  label,
  group: extra.group ?? "style",
  widget: extra.widget ?? "string",
  owner: "template",
  ...extra,
});

export const FIELD_METADATA: FieldMeta[] = [
  siteField("/site/project/name", "Project name", { group: "page", icon: "type" }),
  siteField("/site/project/tagline", "Tagline", { group: "page", icon: "type" }),
  siteField("/site/project/description", "Description", { group: "page", widget: "textarea", icon: "note" }),
  siteField("/site/project/url", "Project URL", { group: "page", widget: "url", icon: "url" }),
  siteField("/site/project/repo", "Repository", { group: "page", widget: "url", icon: "git" }),
  siteField("/site/project/license", "License", { group: "page", icon: "file" }),
  siteField("/site/project/stack", "Stack", { group: "page", icon: "layers" }),
  siteField("/site/brand/initials", "Initials", { group: "page", icon: "type", placeholder: "NP" }),
  siteField("/site/brand/accent", "Accent", {
    group: "page",
    widget: "enum",
    icon: "color",
    options: [
      "flamingo", "pink", "red", "coral", "mahogany", "apricot", "bronze", "orange",
      "amber", "mustard", "yellow", "turmeric", "pear", "avocado", "lime", "green",
      "emerald", "aquamarine", "turquoise", "cyan", "electric", "pelorus", "sky",
      "cerulean", "steel", "azure", "blue", "neon", "iris", "lavender", "violet",
      "purple", "fuchsia", "orchid", "byzantium", "mulberry",
    ].map((value) => ({ value, label: value })),
  }),
  siteField("/site/brand/theme", "Theme", {
    group: "page",
    widget: "enum",
    icon: "palette",
    options: [
      { value: "dark", label: "Dark" },
      { value: "light", label: "Light" },
    ],
  }),
  siteField("/site/preset", "Preset", {
    group: "page",
    widget: "enum",
    icon: "template",
    options: ["skill", "app", "library", "cli", "playground", "profile"].map((value) => ({ value, label: value })),
  }),

  inline("/site/hero/title", "Title", { inlineSelector: ".hero h1, #hero h1, section#hero h1" }),
  inline("/site/hero/lede", "Lede", { widget: "textarea", inlineSelector: ".hero .lede, #hero .lede" }),
  siteField("/site/hero/accent", "Accent word", { icon: "spark" }),
  siteField("/site/hero/actions", "Actions", {
    widget: "array",
    icon: "command",
    itemLabel: "Action",
    itemFields: ACTION_FIELDS,
    itemDefault: { label: "Action", href: "#" },
    maxItems: 4,
  }),
  siteField("/site/hero/examples", "Examples", {
    widget: "array",
    icon: "list",
    itemLabel: "Example",
    itemFields: EXAMPLE_FIELDS,
    itemDefault: { name: "Example" },
  }),
  siteField("/site/hero/gallery", "Gallery", {
    widget: "array",
    icon: "image",
    itemLabel: "Image",
    itemFields: IMAGE_FIELDS,
    itemDefault: { src: "assets/placeholder.png", alt: "Screenshot" },
  }),
  siteField("/site/hero/artifact", "Artifact", { widget: "object", icon: "image", itemFields: IMAGE_FIELDS }),

  inline("/site/about/kicker", "Kicker", { inlineSelector: "#about .kicker", icon: "flag" }),
  inline("/site/about/title", "Title", { inlineSelector: "#about h2, #about .title" }),
  inline("/site/about/lede", "Lede", { widget: "textarea", inlineSelector: "#about .lede" }),
  siteField("/site/about/features", "Features", {
    widget: "array",
    icon: "spark",
    itemLabel: "Feature",
    minItems: 2,
    maxItems: 4,
    itemFields: [
      item("title", "Title", { icon: "type" }),
      item("body", "Body", { widget: "textarea", icon: "note" }),
      item("tabler", "Tabler icon", { icon: "spark" }),
      item("html", "Figure HTML", { widget: "textarea", icon: "note" }),
      item("image", "Figure image", { widget: "object", icon: "image", itemFields: IMAGE_FIELDS }),
    ],
    itemDefault: { title: "Feature", body: "", tabler: "layout", html: "<p></p>" },
  }),
  siteField("/site/about/steps", "Steps", {
    widget: "array",
    icon: "route",
    itemLabel: "Step",
    itemFields: TEXT_ITEM_FIELDS,
    itemDefault: { title: "Step", body: "" },
  }),
  siteField("/site/about/notes", "Notes", {
    widget: "array",
    icon: "note",
    itemLabel: "Note",
    itemFields: TEXT_ITEM_FIELDS,
    itemDefault: { title: "Note", body: "" },
  }),

  inline("/site/github/kicker", "Kicker", { inlineSelector: "#github .kicker", icon: "flag" }),
  inline("/site/github/title", "Title", { inlineSelector: "#github h2" }),
  inline("/site/github/lede", "Lede", { widget: "textarea", inlineSelector: "#github .lede" }),
  siteField("/site/github/repo", "Repository", { widget: "url", icon: "git", placeholder: "https://github.com/org/repo" }),
  siteField("/site/github/show", "Show", {
    widget: "set",
    icon: "layers",
    options: [
      { value: "stats", label: "Stats" },
      { value: "activity", label: "Activity" },
      { value: "releases", label: "Releases" },
      { value: "commits", label: "Commits" },
      { value: "topics", label: "Topics" },
    ],
  }),
  siteField("/site/github/stats", "Stats", {
    widget: "set",
    icon: "hash",
    options: [
      { value: "stars", label: "Stars" },
      { value: "forks", label: "Forks" },
      { value: "watchers", label: "Watchers" },
      { value: "issues", label: "Issues" },
    ],
  }),
  siteField("/site/github/stack", "Stack", { icon: "layers" }),

  inline("/site/screens/title", "Title", { inlineSelector: "#screens h2" }),
  siteField("/site/screens/images", "Images", {
    widget: "array",
    icon: "image",
    itemLabel: "Image",
    itemFields: IMAGE_FIELDS,
    itemDefault: { src: "assets/placeholder.png", alt: "Screenshot" },
  }),

  siteField("/site/demo/views", "Views", {
    widget: "array",
    icon: "play",
    itemLabel: "View",
    itemFields: DEMO_VIEW_FIELDS,
    itemDefault: { id: "view", label: "View", title: "View" },
    minItems: 1,
    maxItems: 4,
  }),

  inline("/site/docs/title", "Title", { inlineSelector: "#docs h2" }),
  siteField("/site/docs/items", "Items", {
    widget: "array",
    icon: "book",
    itemLabel: "Doc",
    itemFields: DOCS_ITEM_FIELDS,
    itemDefault: { title: "Readme", file: "README.md" },
  }),

  inline("/site/download/title", "Title", { inlineSelector: "#download h2" }),
  siteField("/site/download/items", "Items", {
    widget: "array",
    icon: "download",
    itemLabel: "Download",
    itemFields: DOWNLOAD_FIELDS,
    itemDefault: { platform: "Windows", href: "https://example.com" },
  }),

  inline("/site/commands/title", "Title", { inlineSelector: "#commands h2" }),
  siteField("/site/commands/keyboard", "Keyboard", {
    widget: "enum",
    icon: "keyboard",
    options: [
      { value: "windows", label: "Windows" },
      { value: "mac", label: "Mac" },
      { value: "terminal", label: "Terminal" },
      { value: "schematic", label: "Tactile" },
    ],
  }),
  siteField("/site/commands/layout", "Layout", {
    widget: "enum",
    icon: "keyboard",
    options: [
      { value: "100", label: "100% full size" },
      { value: "1800", label: "1800" },
      { value: "96", label: "96% compact" },
      { value: "tkl", label: "80% TKL" },
      { value: "75-exploded", label: "75% exploded" },
      { value: "75", label: "75% compact" },
      { value: "65-exploded", label: "65% exploded" },
      { value: "65", label: "65% compact" },
      { value: "60", label: "60%" },
      { value: "50", label: "50%" },
      { value: "40", label: "40%" },
    ],
  }),
  siteField("/site/commands/items", "Items", {
    widget: "array",
    icon: "keyboard",
    itemLabel: "Shortcut",
    itemFields: COMMAND_FIELDS,
    itemDefault: { keys: "", action: "" },
  }),

  inline("/site/matrix/title", "Title", { inlineSelector: "#matrix h2" }),
  siteField("/site/matrix/columns", "Columns", { widget: "array", icon: "table", itemLabel: "Column", itemDefault: "Column" }),
  siteField("/site/matrix/rows", "Rows", {
    widget: "array",
    icon: "list",
    itemLabel: "Row",
    itemFields: MATRIX_ROW_FIELDS,
    itemDefault: { name: "Item", status: "ready" },
  }),

  inline("/site/faq/title", "Title", { inlineSelector: "#faq h2" }),
  inline("/site/faq/lede", "Lede", { widget: "textarea", inlineSelector: "#faq .lede" }),
  siteField("/site/faq/exclusive", "One open at a time", { widget: "boolean", icon: "spark" }),
  siteField("/site/faq/items", "Questions", {
    widget: "array",
    icon: "info",
    itemLabel: "Question",
    itemFields: FAQ_ITEM_FIELDS,
    itemDefault: { question: "Question?", answer: "Short answer." },
  }),

  inline("/site/trust/title", "Title", { inlineSelector: "#trust h2" }),
  siteField("/site/trust/local", "Local", { widget: "object", icon: "shield", itemFields: TRUST_PANE_FIELDS }),
  siteField("/site/trust/network", "Network", { widget: "object", icon: "link", itemFields: TRUST_PANE_FIELDS }),

  inline("/site/skill/title", "Title", { inlineSelector: "#skill h2" }),
  siteField("/site/skill/command", "Command", { widget: "command", icon: "command" }),
  siteField("/site/skill/trigger", "Trigger", { icon: "spark" }),
  siteField("/site/skill/hosts", "Hosts", { widget: "array", icon: "folder", itemLabel: "Host", itemDefault: ".agents" }),
  siteField("/site/skill/uses", "When to use", {
    widget: "array",
    icon: "list",
    itemLabel: "Use",
    itemFields: [
      item("title", "Title", { icon: "type" }),
      item("body", "Body", { widget: "textarea", icon: "note" }),
    ],
    itemDefault: { title: "", body: "" },
  }),

  inline("/site/profile/title", "Title", { inlineSelector: "#profile h1, #profile h2" }),
  siteField("/site/profile/user", "GitHub login", {
    icon: "git",
    placeholder: "octocat",
    help: "Public GitHub login. Must match the snapshot profile.login.",
  }),
  siteField("/site/profile/snapshot", "Snapshot", {
    icon: "file",
    placeholder: "assets/profile.json",
    help: "Reviewed profile-snapshot JSON. Public GitHub only. Never a token.",
  }),
  inline("/site/profile/kicker", "Kicker", { inlineSelector: "#profile .kicker, #profile .eyebrow", icon: "flag" }),
  inline("/site/profile/lede", "Lede", { widget: "textarea", inlineSelector: "#profile .lede" }),

  inline("/site/links/title", "Title", { inlineSelector: "#links h2" }),
  siteField("/site/links/items", "Items", {
    widget: "array",
    icon: "link",
    itemLabel: "Link",
    itemFields: LINK_ITEM_FIELDS,
    itemDefault: { label: "Repository", href: "https://github.com/example/app" },
  }),

  inline("/site/closing/text", "Text", { inlineSelector: "#closing p, #closing .closing-text" }),
  siteField("/site/closing/action", "Action", {
    widget: "object",
    icon: "command",
    itemFields: ACTION_FIELDS,
  }),

  tokenField("/template/tokens/color/paper", "Paper", { widget: "color", icon: "color" }),
  tokenField("/template/tokens/color/surface", "Surface", { widget: "color", icon: "color" }),
  tokenField("/template/tokens/color/ink", "Ink", { widget: "color", icon: "color" }),
  tokenField("/template/tokens/color/muted", "Muted", { widget: "color", icon: "color" }),
  tokenField("/template/tokens/color/accent", "Accent", { widget: "color", icon: "color" }),
  tokenField("/template/tokens/typography/display", "Display font", {
    widget: "font",
    group: "style",
    icon: "type",
    options: DISPLAY_FONTS.map((value) => ({ value, label: value })),
  }),
  tokenField("/template/tokens/typography/mono", "Mono font", {
    widget: "font",
    icon: "code",
    options: MONO_FONTS.map((value) => ({ value, label: value })),
  }),
  tokenField("/template/tokens/typography/scale", "Type scale", {
    widget: "slider",
    icon: "type",
    min: 0.8,
    max: 1.5,
    step: 0.05,
  }),
  tokenField("/template/tokens/layout/maxWidth", "Max width", {
    widget: "slider",
    group: "layout",
    icon: "layout",
    min: 720,
    max: 1440,
    units: "px",
  }),
  tokenField("/template/tokens/layout/sectionPadding", "Section padding", {
    widget: "slider",
    group: "layout",
    icon: "spacing",
    min: 24,
    max: 128,
    units: "px",
  }),
  tokenField("/template/tokens/shape/radius", "Radius", {
    widget: "slider",
    group: "layout",
    icon: "box",
    min: 0,
    max: 24,
    units: "px",
  }),
  tokenField("/template/tokens/motion/enabled", "Motion", { widget: "boolean", group: "advanced", icon: "spark" }),
  tokenField("/template/tokens/motion/duration", "Duration", {
    widget: "slider",
    group: "advanced",
    icon: "sliders",
    min: 0,
    max: 600,
    units: "ms",
  }),
  tokenField("/template/chrome/frame/variant", "Frame", {
    widget: "enum",
    group: "layout",
    icon: "layout",
    options: [
      { value: "full", label: "Full" },
      { value: "window", label: "Window" },
    ],
  }),
  tokenField("/template/chrome/header/variant", "Header", {
    widget: "enum",
    group: "layout",
    icon: "layout",
    options: [
      { value: "sticky", label: "Sticky" },
      { value: "static", label: "Static" },
    ],
  }),
  tokenField("/template/chrome/shade/variant", "Shade", {
    widget: "enum",
    group: "style",
    icon: "spark",
    options: SHADE_VARIANTS.map((item) => ({ value: item.id, label: item.label })),
  }),
];

const FIELD_BY_PATH = new Map(FIELD_METADATA.map((field) => [field.path, field]));

export function fieldMeta(path: string): FieldMeta | undefined {
  return FIELD_BY_PATH.get(path);
}

export function fieldsForSelection(selection: { kind: string; sectionId?: string }): FieldMeta[] {
  if (selection.kind === "page" || !selection.sectionId) {
    return FIELD_METADATA.filter((field) => field.group === "page" || field.owner === "template");
  }
  const prefix = `/site/${selection.sectionId}/`;
  const templatePrefix = `/template/sections/${selection.sectionId}/`;
  return FIELD_METADATA.filter((field) => field.path.startsWith(prefix) || field.path.startsWith(templatePrefix));
}

export function inlineFieldsForSection(sectionId: string): FieldMeta[] {
  return FIELD_METADATA.filter((field) => field.inline && field.path.startsWith(`/site/${sectionId}/`));
}

export function genericFallback(path: string): FieldMeta {
  const leaf = path.split("/").filter(Boolean).at(-1) ?? path;
  return {
    path,
    key: leaf,
    label: leaf.replace(/([A-Z])/g, " $1").replace(/^./, (ch) => ch.toUpperCase()),
    group: "advanced",
    widget: "string",
    owner: path.startsWith("/template") ? "template" : "site",
  };
}
