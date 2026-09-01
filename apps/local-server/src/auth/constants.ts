export const STUDIO_OAUTH_STORE_VERSION = 1;
export const STUDIO_OAUTH_FILE_NAME = 'studio-oauth.json';

export const CODEX_OAUTH_CLIENT_ID = 'app_EMoamEEZ73f0CkXaXp7hrann';
export const CODEX_OAUTH_ISSUER = 'https://auth.openai.com';
export const CODEX_OAUTH_TOKEN_URL = `${CODEX_OAUTH_ISSUER}/oauth/token`;
export const CODEX_DEVICE_USERCODE_URL = `${CODEX_OAUTH_ISSUER}/api/accounts/deviceauth/usercode`;
export const CODEX_DEVICE_TOKEN_URL = `${CODEX_OAUTH_ISSUER}/api/accounts/deviceauth/token`;
export const CODEX_DEVICE_VERIFICATION_URL = `${CODEX_OAUTH_ISSUER}/codex/device`;
export const CODEX_DEVICE_REDIRECT_URI = `${CODEX_OAUTH_ISSUER}/deviceauth/callback`;
export const CODEX_ACCESS_TOKEN_REFRESH_SKEW_MS = 120_000;
export const CODEX_DEVICE_POLL_MAX_MS = 15 * 60_000;

export const XAI_OAUTH_ISSUER = 'https://auth.x.ai';
export const XAI_OAUTH_DISCOVERY_URL = `${XAI_OAUTH_ISSUER}/.well-known/openid-configuration`;
export const XAI_OAUTH_CLIENT_ID = 'b1a00492-073a-47ea-816f-4c329264a828';
export const XAI_OAUTH_SCOPE = 'openid profile email offline_access grok-cli:access api:access';
export const XAI_OAUTH_DEVICE_CODE_URL = `${XAI_OAUTH_ISSUER}/oauth2/device/code`;
export const XAI_OAUTH_TOKEN_URL = `${XAI_OAUTH_ISSUER}/oauth2/token`;
export const XAI_ACCESS_TOKEN_REFRESH_SKEW_MS = 3_600_000;

export const CODEX_RESPONSES_BASE_URL = 'https://chatgpt.com/backend-api/codex';
export const XAI_API_BASE_URL = 'https://api.x.ai/v1';

export function studioPackageVersion() {
  return process.env.npm_package_version?.trim() || '0.0.0';
}

export function studioUserAgent() {
  return `CodexStudio/${studioPackageVersion()}`;
}

export function studioCodexOriginator(env: Record<string, string | undefined> = process.env) {
  return env.STUDIO_CODEX_ORIGINATOR?.trim() || 'codex-studio';
}
