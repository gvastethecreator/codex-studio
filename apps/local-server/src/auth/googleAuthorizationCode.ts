import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import type { SubscriptionProviderId } from '../../../../packages/shared/src';
import { GOOGLE_OAUTH_LOGIN_MAX_MS, GOOGLE_OAUTH_SCOPE, studioUserAgent } from './constants';
import { readGoogleOAuthConfig } from './googleOAuthConfig';
import { readOAuthJson, safeOAuthText } from './oauthHttp';
import type { StoredSubscriptionTokens } from './store';
import type { AuthFetch } from './tokens';
import { tokensFromOAuthPayload } from './tokens';

const CALLBACK_PATH = '/oauth/google/callback';
const MAX_CALLBACK_URL_CHARS = 8 * 1024;

export interface GoogleAuthorizationCodeStart {
  providerId: Extract<SubscriptionProviderId, 'google'>;
  authorizationUrl: string;
  expiresAt: string;
  poll: (signal: AbortSignal) => Promise<StoredSubscriptionTokens>;
}

export interface GoogleAuthorizationCodeDependencies {
  env?: Record<string, string | undefined>;
  fetch?: AuthFetch;
  now?: () => number;
  random?: (bytes: number) => Buffer;
  signal?: AbortSignal;
  loginTimeoutMs?: number;
}

function createAbortError() {
  const error = new Error('Google login cancelled.');
  error.name = 'AbortError';
  return error;
}

export {
  isGoogleOAuthConfigured,
  readGoogleOAuthConfig,
  resolveGoogleOAuthEndpoint,
} from './googleOAuthConfig';

function base64Url(value: Buffer) {
  return value.toString('base64url');
}

export function createGooglePkce(random: (bytes: number) => Buffer = randomBytes) {
  const verifier = base64Url(random(64));
  return {
    verifier,
    challenge: createHash('sha256').update(verifier).digest('base64url'),
    state: base64Url(random(32)),
  };
}

function stateMatches(actual: string, expected: string) {
  const actualBytes = Buffer.from(actual);
  const expectedBytes = Buffer.from(expected);
  return actualBytes.length === expectedBytes.length && timingSafeEqual(actualBytes, expectedBytes);
}

function requestSignal(signal: AbortSignal) {
  return AbortSignal.any([signal, AbortSignal.timeout(20_000)]);
}

function sendBrowserResponse(
  response: import('node:http').ServerResponse,
  status: number,
  title: string,
  message: string,
) {
  response.writeHead(status, {
    'Cache-Control': 'no-store',
    'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'",
    'Content-Type': 'text/html; charset=utf-8',
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(
    `<!doctype html><html lang="en"><meta charset="utf-8"><title>${title}</title><body><main><h1>${title}</h1><p>${message}</p><p>You can close this tab.</p></main></body></html>`,
  );
}

interface LoopbackAuthorization {
  redirectUri: string;
  waitForCode(signal: AbortSignal): Promise<string>;
}

async function listenForAuthorizationCode({
  expectedState,
  timeoutMs,
  signal,
}: {
  expectedState: string;
  timeoutMs: number;
  signal?: AbortSignal;
}): Promise<LoopbackAuthorization> {
  if (signal?.aborted) throw createAbortError();

  let resolveCode!: (code: string) => void;
  let rejectCode!: (error: Error) => void;
  const codePromise = new Promise<string>((resolve, reject) => {
    resolveCode = resolve;
    rejectCode = reject;
  });
  void codePromise.catch(() => undefined);
  let settled = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let server: Server;
  let onLifecycleAbort: (() => void) | null = null;

  const close = () => {
    if (timer) clearTimeout(timer);
    timer = null;
    if (onLifecycleAbort) signal?.removeEventListener('abort', onLifecycleAbort);
    if (server.listening) server.close();
  };
  const settleCode = (code: string) => {
    if (settled) return;
    settled = true;
    close();
    resolveCode(code);
  };
  const settleError = (error: Error) => {
    if (settled) return;
    settled = true;
    close();
    rejectCode(error);
  };
  onLifecycleAbort = () => settleError(createAbortError());

  server = createServer((request, response) => {
    const requestTarget = request.url ?? '';
    if (requestTarget.length > MAX_CALLBACK_URL_CHARS) {
      sendBrowserResponse(response, 414, 'Google Sign in failed', 'The callback URL was too long.');
      settleError(new Error('Google OAuth callback URL was too long.'));
      return;
    }
    let callback: URL;
    try {
      callback = new URL(requestTarget, 'http://127.0.0.1');
    } catch {
      response.writeHead(400, { 'Cache-Control': 'no-store' });
      response.end();
      return;
    }
    if (request.method !== 'GET' || callback.pathname !== CALLBACK_PATH) {
      response.writeHead(404, { 'Cache-Control': 'no-store' });
      response.end();
      return;
    }
    const state = callback.searchParams.get('state') ?? '';
    if (!stateMatches(state, expectedState)) {
      sendBrowserResponse(
        response,
        400,
        'Google Sign in failed',
        'The callback state was invalid.',
      );
      settleError(new Error('Google OAuth callback state did not match.'));
      return;
    }
    const providerError = safeOAuthText(callback.searchParams.get('error'), 100);
    if (providerError) {
      sendBrowserResponse(
        response,
        400,
        'Google Sign in cancelled',
        'Google did not authorize Studio.',
      );
      settleError(new Error(`Google OAuth authorization failed: ${providerError}.`));
      return;
    }
    const code = callback.searchParams.get('code')?.trim() ?? '';
    if (!code || code.length > 4096 || /[\u0000-\u001f\u007f\s]/.test(code)) {
      sendBrowserResponse(response, 400, 'Google Sign in failed', 'The callback code was invalid.');
      settleError(new Error('Google OAuth callback did not include a valid code.'));
      return;
    }
    sendBrowserResponse(response, 200, 'Google Sign in complete', 'Codex Studio is connected.');
    settleCode(code);
  });

  await new Promise<void>((resolve, reject) => {
    const onStartAbort = () => {
      server.close();
      reject(createAbortError());
    };
    signal?.addEventListener('abort', onStartAbort, { once: true });
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      signal?.removeEventListener('abort', onStartAbort);
      server.removeListener('error', reject);
      resolve();
    });
  });

  const address = server.address() as AddressInfo | null;
  if (!address || typeof address.port !== 'number') {
    server.close();
    throw new Error('Google OAuth loopback listener did not bind to a local port.');
  }

  server.on('error', () => settleError(new Error('Google OAuth loopback listener failed.')));
  signal?.addEventListener('abort', onLifecycleAbort, { once: true });
  timer = setTimeout(
    () => settleError(new Error('Google login timed out after 15 minutes.')),
    timeoutMs,
  );

  return {
    redirectUri: `http://127.0.0.1:${address.port}${CALLBACK_PATH}`,
    waitForCode(pollSignal) {
      if (pollSignal.aborted) {
        settleError(createAbortError());
        return Promise.reject(createAbortError());
      }
      const onAbort = () => settleError(createAbortError());
      pollSignal.addEventListener('abort', onAbort, { once: true });
      return codePromise.finally(() => pollSignal.removeEventListener('abort', onAbort));
    },
  };
}

export async function startGoogleAuthorizationCode({
  env = process.env,
  fetch: fetchImpl = fetch,
  now = Date.now,
  random = randomBytes,
  signal,
  loginTimeoutMs = GOOGLE_OAUTH_LOGIN_MAX_MS,
}: GoogleAuthorizationCodeDependencies = {}): Promise<GoogleAuthorizationCodeStart> {
  const config = readGoogleOAuthConfig(env);
  const pkce = createGooglePkce(random);
  const loopback = await listenForAuthorizationCode({
    expectedState: pkce.state,
    timeoutMs: loginTimeoutMs,
    signal,
  });
  const authorizationUrl = new URL(config.authorizeUrl);
  authorizationUrl.searchParams.set('client_id', config.clientId);
  authorizationUrl.searchParams.set('redirect_uri', loopback.redirectUri);
  authorizationUrl.searchParams.set('response_type', 'code');
  authorizationUrl.searchParams.set('scope', GOOGLE_OAUTH_SCOPE);
  authorizationUrl.searchParams.set('code_challenge', pkce.challenge);
  authorizationUrl.searchParams.set('code_challenge_method', 'S256');
  authorizationUrl.searchParams.set('state', pkce.state);
  authorizationUrl.searchParams.set('access_type', 'offline');
  authorizationUrl.searchParams.set('prompt', 'consent');
  authorizationUrl.searchParams.set('include_granted_scopes', 'true');
  const expiresAt = new Date(now() + loginTimeoutMs).toISOString();

  return {
    providerId: 'google',
    authorizationUrl: authorizationUrl.href,
    expiresAt,
    async poll(pollSignal) {
      const code = await loopback.waitForCode(pollSignal);
      let response: Response;
      try {
        response = await fetchImpl(config.tokenUrl, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': studioUserAgent(),
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: loopback.redirectUri,
            client_id: config.clientId,
            code_verifier: pkce.verifier,
            ...(config.clientSecret ? { client_secret: config.clientSecret } : {}),
          }).toString(),
          redirect: 'error',
          signal: requestSignal(pollSignal),
        });
      } catch (error) {
        if (pollSignal.aborted) throw createAbortError();
        throw error;
      }
      const payload = await readOAuthJson(response);
      if (!response.ok) {
        const providerMessage = safeOAuthText(payload.error_description);
        throw new Error(
          providerMessage
            ? `Google token exchange failed: ${providerMessage}`
            : `Google token exchange failed (${response.status}).`,
        );
      }
      return tokensFromOAuthPayload(
        payload,
        { refreshToken: null, accountLabel: null, chatgptAccountId: null },
        now(),
      );
    },
  };
}
