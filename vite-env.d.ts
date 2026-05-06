/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STUDIO_API_BASE?: string;
}

interface Window {
  codexStudio?: {
    apiBase?: string;
    desktop?: boolean;
    platform?: string;
    versions?: {
      chrome?: string;
      electron?: string;
      node?: string;
    };
  };
}

declare module '*.yaml?raw' {
  const content: string;
  export default content;
}
