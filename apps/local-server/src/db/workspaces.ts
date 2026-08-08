/**
 * Workspace domain DB helpers — re-export seam for modular ownership.
 * Implementation remains in db.ts until full store split lands.
 */
export { ensureDefaultWorkspace, getWorkspace } from '../db';
