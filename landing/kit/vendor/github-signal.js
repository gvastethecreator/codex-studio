const BOOTSTRAP_FRESH_MS = 15 * 60 * 1000;

export { BOOTSTRAP_FRESH_MS };

export function normalizeActivityNote(value) {
  const text = String(value ?? "").trim();
  const match = text.match(/^(\d+(?:[.,]\d+)?[kKmM]?) commits across (\d+) active (days|weeks|months)\.?$/i);
  if (!match) return text;
  return `${match[1]} recent commits · ${match[2]} active ${match[3].toLowerCase()}.`;
}

export function parseCompactNumber(value) {
  const raw = String(value ?? "").trim().replace(/,/g, "");
  if (!raw || raw === "—") return null;
  const match = raw.match(/^(-?\d+(?:\.\d+)?)([kKmMbB])?$/);
  if (!match) {
    const direct = Number(raw);
    return Number.isFinite(direct) ? direct : null;
  }
  const base = Number(match[1]);
  const multiplier = { k: 1e3, m: 1e6, b: 1e9 }[String(match[2] || "").toLowerCase()] || 1;
  return base * multiplier;
}

export function shortAge(iso, now = Date.now()) {
  const then = Date.parse(iso);
  if (!Number.isFinite(then)) return "";
  const delta = Math.max(0, now - then);
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (delta < minute) return "now";
  if (delta < hour) return `${Math.max(1, Math.floor(delta / minute))}m`;
  if (delta < day) return `${Math.max(1, Math.floor(delta / hour))}h`;
  if (delta < day * 56) return `${Math.max(1, Math.floor(delta / day))}d`;
  if (delta < day * 365 * 2) return `${Math.max(1, Math.floor(delta / (day * 7)))}w`;
  return `${Math.max(1, Math.floor(delta / (day * 365)))}y`;
}

export function rankSignals({ stats = {}, latestRelease = null, lastCommitAt = "" } = {}, now = Date.now()) {
  const candidates = [];
  if (latestRelease && latestRelease.value) {
    candidates.push({ id: "release", kind: "release", value: String(latestRelease.value), label: "Latest release", score: 100 });
  }
  if (lastCommitAt) {
    const age = shortAge(lastCommitAt, now);
    if (age) candidates.push({ id: "freshness", kind: "freshness", value: age, label: "Last commit", score: 92 });
  }

  const weights = { stars: 82, issues: 68, forks: 58, watchers: 48 };
  const labels = { stars: "Stars", forks: "Forks", watchers: "Watching", issues: "Open issues" };
  for (const id of Object.keys(weights)) {
    const numeric = Number(stats[id]);
    if (!Number.isFinite(numeric) || numeric <= 0) continue;
    const bonus = Math.min(12, Math.log10(numeric + 1) * 4);
    candidates.push({ id, kind: "metric", value: numeric, label: labels[id], score: weights[id] + bonus });
  }

  return candidates
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, 4);
}

export function bootstrapFresh(payload, now = Date.now(), maxAge = BOOTSTRAP_FRESH_MS) {
  const fetchedAt = Number(payload && payload.fetchedAt);
  return Number.isFinite(fetchedAt) && fetchedAt > 0 && now - fetchedAt >= 0 && now - fetchedAt < maxAge;
}

export function bootstrapResponseForUrl(url, entry) {
  if (!entry || !entry.payload || !entry.owner || !entry.name) return null;
  const sponsors = bootstrapSponsors(url, entry);
  if (sponsors !== null) return sponsors;
  let parsed;
  try {
    parsed = new URL(String(url));
  } catch {
    return null;
  }
  if (parsed.origin !== "https://api.github.com") return null;
  const parts = parsed.pathname.split("/").filter(Boolean).map((part) => decodeURIComponent(part));
  if (parts[0] !== "repos" || parts[1] !== entry.owner || parts[2] !== entry.name) return null;
  const tail = parts.slice(3);
  if (tail.length === 0) return entry.payload.repo ?? null;
  if (tail.length !== 1) return null;
  if (tail[0] === "releases") return Array.isArray(entry.payload.releases) ? entry.payload.releases : [];
  if (tail[0] === "commits") return Array.isArray(entry.payload.commits) ? entry.payload.commits : [];
  if (tail[0] === "languages") return entry.payload.languages && typeof entry.payload.languages === "object"
    ? entry.payload.languages
    : {};
  if (tail[0] === "contributors") {
    return Array.isArray(entry.payload.contributors) ? entry.payload.contributors : null;
  }
  return null;
}

function bootstrapSponsors(url, entry) {
  let parsed;
  try {
    parsed = new URL(String(url));
  } catch {
    return null;
  }
  if (parsed.origin !== "https://api.github.com") return null;
  const parts = parsed.pathname.split("/").filter(Boolean).map((part) => decodeURIComponent(part));
  if (parts.length !== 3 || parts[2] !== "sponsors") return null;
  if ((parts[0] === "users" || parts[0] === "orgs") && parts[1] === entry.owner) {
    return Array.isArray(entry.payload.sponsors) ? entry.payload.sponsors : null;
  }
  return null;
}

function publicBootstrap(entry) {
  const repo = entry && entry.payload && entry.payload.repo;
  return Boolean(repo) && repo.private !== true && repo.visibility !== "private";
}

function parseBootstrap(root) {
  const slot = root.querySelector("[data-github-bootstrap]");
  if (!slot) return null;
  try {
    const payload = JSON.parse(slot.textContent || "null");
    if (!payload || !payload.repo) return null;
    return {
      owner: root.dataset.githubOwner || "",
      name: root.dataset.githubName || "",
      root,
      payload,
    };
  } catch {
    return null;
  }
}

export function installBootstrapFetchCache(win = globalThis.window, doc = globalThis.document, now = Date.now()) {
  if (!win || !doc || typeof win.fetch !== "function") return () => {};
  if (win.__gvasteGithubBootstrapFetch) return win.__gvasteGithubBootstrapFetch.restore;

  const entries = Array.from(doc.querySelectorAll(".github[data-github-owner][data-github-name]"))
    .map(parseBootstrap)
    .filter(Boolean)
    .filter(publicBootstrap)
    .filter((entry) => bootstrapFresh(entry.payload, now));
  if (!entries.length) return () => {};

  const originalFetch = win.fetch.bind(win);
  const wrapped = async (input, init = undefined) => {
    const url = typeof input === "string" || input instanceof URL ? String(input) : input && input.url;
    const method = String((init && init.method) || (input && input.method) || "GET").toUpperCase();
    if (method === "GET" && url) {
      for (const entry of entries) {
        const data = bootstrapResponseForUrl(url, entry);
        if (data !== null) {
          return new Response(JSON.stringify(data), {
            status: 200,
            headers: {
              "Content-Type": "application/json; charset=utf-8",
              "X-Gvaste-Bootstrap": "hit",
            },
          });
        }
      }
    }
    return originalFetch(input, init);
  };

  win.fetch = wrapped;
  const restore = () => {
    if (win.fetch === wrapped) win.fetch = originalFetch;
    try { delete win.__gvasteGithubBootstrapFetch; } catch {}
  };
  win.__gvasteGithubBootstrapFetch = { restore };
  return restore;
}

function enhanceRoot(root) {
  const note = root.querySelector('[data-github="activity-note"]');
  if (note) {
    const normalized = normalizeActivityNote(note.textContent);
    if (normalized && normalized !== note.textContent.trim()) note.textContent = normalized;
  }
}

function observeRoot(root) {
  let queued = false;
  const run = () => {
    queued = false;
    enhanceRoot(root);
  };
  const schedule = () => {
    if (queued) return;
    queued = true;
    queueMicrotask(run);
  };
  const observer = new MutationObserver(schedule);
  observer.observe(root, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["aria-busy", "hidden"] });
  schedule();
  return () => observer.disconnect();
}

function initBrowser() {
  const roots = Array.from(document.querySelectorAll(".github[data-github-owner][data-github-name]"));
  roots.forEach((root) => {
    const bootstrap = parseBootstrap(root);
    if (bootstrap && !publicBootstrap(bootstrap)) {
      root.classList.add("is-error");
      root.setAttribute("aria-busy", "false");
      const status = root.querySelector('[data-github="status"]');
      if (status) {
        status.hidden = false;
        status.textContent = "Private repository data is not rendered by Gvaste Pages.";
      }
      return;
    }
    observeRoot(root);
  });
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  installBootstrapFetchCache(window, document);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initBrowser, { once: true });
  else initBrowser();
}
