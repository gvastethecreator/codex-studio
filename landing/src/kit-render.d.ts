declare module "*/kit/engine.mjs" {
  export function commandKeyIds(value: string): string[];
  export function commandsKeyboardHtml(kind: string, boundIds: Iterable<string>, layoutId?: string | null): string;
  export function commandsKeyboardKind(value: string): string | null;
  export function commandsKeyboardLayout(value: string | null | undefined): string | null | false;
  export function configureEngine(options?: {
    files?: Record<string, string>;
    github?: unknown;
    io?: Record<string, unknown>;
  }): void;
  export function faviconSvg(initials: string): string;
  export function injectFooterHtml(sectionHtml: string, footerHtml: string): string;
  export function loadYaml(path: string): any;
  export function prepareSite(yamlPath: string): any;
  export function prepareView(site: any): any;
  export function renderFooterHtml(view: any): string;
  export function renderHeaderHtml(view: any): string;
  export function renderSectionHtml(id: string, view: any): string;
  export function validate(site: any): void;
}

declare module "*/kit/render.mjs" {
  export function commandKeyIds(value: string): string[];
  export function commandsKeyboardHtml(kind: string, boundIds: Iterable<string>, layoutId?: string | null): string;
  export function commandsKeyboardKind(value: string): string | null;
  export function commandsKeyboardLayout(value: string | null | undefined): string | null | false;
  export function configureEngine(options?: { files?: Record<string, string>; github?: unknown }): void;
  export function faviconSvg(initials: string): string;
  export function injectFooterHtml(sectionHtml: string, footerHtml: string): string;
  export function loadYaml(path: string): any;
  export function prepareSite(yamlPath: string): any;
  export function prepareView(site: any): any;
  export function renderFooterHtml(view: any): string;
  export function renderHeaderHtml(view: any): string;
  export function renderSectionHtml(id: string, view: any): string;
  export function validate(site: any): void;
}

declare module "*/scripts/write-hosts.mjs" {
  export function playgroundHostJson(): Record<string, string>;
}
