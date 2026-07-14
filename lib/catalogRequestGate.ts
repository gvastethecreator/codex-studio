export interface CatalogRequestToken {
  generation: number;
  requestId: number;
}

export interface CatalogRequestGate {
  invalidate(): void;
  beginReplace(): CatalogRequestToken;
  beginAppend(): CatalogRequestToken | null;
  isCurrent(token: CatalogRequestToken): boolean;
  finish(token: CatalogRequestToken): boolean;
  getGeneration(): number;
}

export function createCatalogRequestGate(): CatalogRequestGate {
  let generation = 0;
  let requestId = 0;
  let activeRequest: CatalogRequestToken | null = null;

  const begin = (): CatalogRequestToken => {
    const token = { generation, requestId: ++requestId };
    activeRequest = token;
    return token;
  };

  return {
    invalidate() {
      generation += 1;
      activeRequest = null;
    },
    beginReplace() {
      generation += 1;
      return begin();
    },
    beginAppend() {
      return activeRequest ? null : begin();
    },
    isCurrent(token) {
      return token.generation === generation && activeRequest?.requestId === token.requestId;
    },
    finish(token) {
      if (!this.isCurrent(token)) return false;
      activeRequest = null;
      return true;
    },
    getGeneration() {
      return generation;
    },
  };
}
