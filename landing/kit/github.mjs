// Public GitHub evidence: snapshot load, public-only rules, and the github
// section view model. render.mjs calls prepareGithub; it does not own this policy.
const GITHUB_SHOW = ["stats", "activity", "releases", "commits"];
const GITHUB_STATS = ["stars", "forks", "watchers", "issues"];
const GITHUB_SOCIAL = ["stars", "forks", "watchers"];
const GITHUB_STAT_LABELS = {
  stars: "Stars",
  forks: "Forks",
  watchers: "Watching",
  issues: "Open issues",
};
const GITHUB_STAT_ICON = {
  stars: '<path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z"/>',
  forks: '<path d="M12 18m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/><path d="M7 6m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/><path d="M17 6m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/><path d="M7 8v2a2 2 0 0 0 2 2h6a2 2 0 0 0 2 -2v-2"/><path d="M12 12l0 4"/>',
  watchers: '<path d="M10 12a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/><path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6"/>',
  issues: '<path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M12 8l0 .01"/><path d="M11 12l1 0l0 4l1 0"/>',
};
const GITHUB_CLOCK_ICON = '<path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M12 7v5l3 3"/>';
const GITHUB_COMMIT_ICON = '<path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/><path d="M12 3l0 6"/><path d="M12 15l0 6"/>';
const GITHUB_CALENDAR_ICON = '<path d="M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12z"/><path d="M16 3v4"/><path d="M8 3v4"/><path d="M4 11h16"/>';
const GITHUB_SNAPSHOT_MS = 6 * 60 * 60 * 1000;
export const GITHUB_BOOTSTRAP_VERSION = 2;

function fail(message) {
  throw new Error(`[gvaste-pages] ${message}`);
}

function githubIconSvg(paths, size = 18) {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}

function countLimit(value, fallback) {
  if (value === false) return 0;
  const n = Number(value ?? fallback);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(20, Math.floor(n)));
}

export function parseGithubRepo(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  if (!raw.includes("://") && !raw.includes("@")) {
    const shorthand = raw.match(/^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?$/);
    if (shorthand) return { owner: shorthand[1], name: shorthand[2].replace(/\.git$/i, "") };
    return null;
  }
  const ssh = raw.match(/^git@github\.com:([^/]+)\/([^/]+?)(?:\.git)?$/i);
  if (ssh) return { owner: ssh[1], name: ssh[2] };
  try {
    const url = new URL(raw);
    if (!/^(www\.)?github\.com$/i.test(url.hostname)) return null;
    const parts = url.pathname.replace(/^\/+|\/+$/g, "").replace(/\.git$/i, "").split("/");
    if (parts.length < 2 || !parts[0] || !parts[1]) return null;
    if (["orgs", "users", "sponsors", "settings", "marketplace"].includes(parts[0].toLowerCase())) {
      return null;
    }
    return { owner: parts[0], name: parts[1] };
  } catch {
    return null;
  }
}

export function assertPublicGithubPayload(payload, file = "<snapshot>") {
  const repo = payload?.repo;
  if (!repo) return payload;
  if (repo.private === true || repo.visibility === "private") {
    throw new Error(`[github-bootstrap] Refusing to serialize private repository data in ${file}`);
  }
  return payload;
}

export function annotateGithubPayload(payload, { fetchedAt = Date.now(), source = "build" } = {}) {
  if (!payload?.repo) return payload;
  assertPublicGithubPayload(payload);
  return {
    ...payload,
    bootstrapVersion: GITHUB_BOOTSTRAP_VERSION,
    bootstrapSource: source,
    fetchedAt: Number(fetchedAt),
  };
}

function githubSnapshotPath(root, join, owner, name) {
  return join(root, ".cache", "github", `${owner}-${name}.json`);
}

function readGithubSnapshotFile(ctx, owner, name) {
  const { root, io } = ctx;
  try {
    const parsed = JSON.parse(io.readFileSync(githubSnapshotPath(root, io.join, owner, name), "utf8"));
    if (parsed?.payload?.repo) return parsed;
  } catch {}
  return null;
}

function fetchGithubSnapshotSync(ctx, owner, name, releaseLimit) {
  const env = ctx.env ?? Object.create(null);
  if (typeof process === "undefined" || !process.execPath || !ctx.io?.execFileSync) return null;
  const code = `
const owner = ${JSON.stringify(owner)};
const name = ${JSON.stringify(name)};
const releaseLimit = ${Number(releaseLimit) || 0};
const headers = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "gvaste-pages-build"
};
if (process.env.GITHUB_TOKEN) headers.Authorization = "Bearer " + process.env.GITHUB_TOKEN;
const base = "https://api.github.com/repos/" + encodeURIComponent(owner) + "/" + encodeURIComponent(name);
const get = async (url) => {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(String(res.status));
  return res.json();
};
const run = async () => {
  const repo = await get(base);
  const ownerLogin = repo.owner && repo.owner.login ? repo.owner.login : owner;
  const sponsorRoot = repo.owner && repo.owner.type === "Organization" ? "orgs" : "users";
  const getList = async (url) => {
    try {
      const data = await get(url);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  };
  const [releases, commits, languages, contributors, sponsors] = await Promise.all([
    releaseLimit ? get(base + "/releases?per_page=" + releaseLimit) : Promise.resolve([]),
    get(base + "/commits?per_page=100"),
    get(base + "/languages"),
    getList(base + "/contributors?per_page=100"),
    getList("https://api.github.com/" + sponsorRoot + "/" + encodeURIComponent(ownerLogin) + "/sponsors?per_page=100")
  ]);
  process.stdout.write(JSON.stringify({
    repo,
    releases: Array.isArray(releases) ? releases : [],
    commits: Array.isArray(commits) ? commits : [],
    languages: languages && typeof languages === "object" ? languages : null,
    contributors,
    sponsors
  }));
};
run().catch((err) => { console.error(err.message); process.exit(1); });
`;
  try {
    const out = ctx.io.execFileSync(process.execPath, ["--input-type=module", "-e", code], {
      encoding: "utf8",
      timeout: 20000,
      env,
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 8 * 1024 * 1024,
    });
    const parsed = JSON.parse(out);
    return parsed?.repo ? parsed : null;
  } catch {
    return null;
  }
}

export function loadGithubSnapshot(ctx, owner, name, releaseLimit) {
  if (ctx.provider) return ctx.provider({ owner, name, releaseLimit }) ?? null;
  const env = ctx.env ?? Object.create(null);
  if (env.NODE_TEST_CONTEXT || env.GV_GITHUB_SNAPSHOT === "0") {
    const cached = readGithubSnapshotFile(ctx, owner, name);
    return cached?.payload ?? null;
  }
  const cached = readGithubSnapshotFile(ctx, owner, name);
  const now = ctx.now ?? Date.now();
  if (cached && now - cached.at < GITHUB_SNAPSHOT_MS) return cached.payload;
  const payload = fetchGithubSnapshotSync(ctx, owner, name, releaseLimit);
  if (payload?.repo) {
    try {
      const path = githubSnapshotPath(ctx.root, ctx.io.join, owner, name);
      ctx.io.mkdirSync(ctx.io.dirname(path), { recursive: true });
      ctx.io.writeFileSync(path, JSON.stringify({ at: now, payload }));
    } catch {}
    return payload;
  }
  return cached?.payload ?? null;
}

export function prepareGithub(site, ctx = {}) {
  if (!(site.sections ?? []).includes("github")) return undefined;
  const raw = site.github && typeof site.github === "object" && !Array.isArray(site.github) ? site.github : {};
  const parsed = parseGithubRepo(raw.repo || site.project?.repo);
  if (!parsed) return undefined;
  const showSource = Array.isArray(raw.show) && raw.show.length ? raw.show.map(String) : GITHUB_SHOW;
  const show = new Set(showSource);
  const releaseLimit = countLimit(raw.releases, 4);
  const commitLimit = countLimit(raw.commits, 12);
  const showReleases = show.has("releases") && releaseLimit > 0;
  const showCommits = show.has("commits") && commitLimit > 0;
  const statIds = Array.isArray(raw.stats) && raw.stats.length
    ? raw.stats.map(String).filter((id) => GITHUB_STATS.includes(id))
    : GITHUB_STATS;
  const socialIds = statIds.filter((id) => GITHUB_SOCIAL.includes(id));
  const showIssues = show.has("stats") && statIds.includes("issues");
  const showLastCommit = show.has("activity") || showCommits;
  const href = `https://github.com/${parsed.owner}/${parsed.name}`;
  const changelogPath = String(raw.changelog ?? "").replace(/^\/+/, "").trim();
  const stack = String(raw.stack ?? site.project?.stack ?? "")
    .split(/[·|,]/)
    .map((item) => item.trim())
    .filter(Boolean);
  const block = {
    kicker: raw.kicker || "Repository",
    title: raw.title || "Public GitHub pulse.",
    lede: raw.lede || "Stars, activity, releases, and recent commits. The browser reads the public GitHub API.",
    source: raw.source,
    owner: parsed.owner,
    name: parsed.name,
    href,
    releasesHref: `${href}/releases`,
    commitsHref: `${href}/commits`,
    issuesHref: `${href}/issues`,
    sponsorsHref: String(site.project?.sponsor || "").trim() || `https://github.com/sponsors/${parsed.owner}`,
    contributorsHref: `${href}/graphs/contributors`,
    license: raw.license || site.project?.license || "",
    releaseLimit,
    commitLimit,
    showStats: show.has("stats") && statIds.length > 0,
    showStars: show.has("stats") && socialIds.includes("stars"),
    showIssues,
    showLastCommit,
    showMeters: showIssues || showLastCommit,
    showBadges: show.has("activity") || showIssues || showLastCommit,
    showActivity: show.has("activity"),
    showReleases,
    showCommits,
    showAside: show.has("activity") || showCommits || showIssues || showLastCommit,
    showTopics: show.has("topics"),
    stackAttr: stack.join("|"),
    starsHref: `${href}/stargazers`,
    starIconHtml: githubIconSvg(GITHUB_STAT_ICON.stars, 13),
    commitIconHtml: githubIconSvg(GITHUB_COMMIT_ICON, 13),
    spanIconHtml: githubIconSvg(GITHUB_CALENDAR_ICON, 13),
    issueItem: showIssues
      ? {
          id: "issues",
          label: GITHUB_STAT_LABELS.issues,
          iconHtml: githubIconSvg(GITHUB_STAT_ICON.issues, 13),
        }
      : undefined,
    freshnessIconHtml: showLastCommit ? githubIconSvg(GITHUB_CLOCK_ICON, 13) : "",
    changelog: changelogPath
      ? { label: changelogPath, href: `${href}/blob/HEAD/${changelogPath}` }
      : undefined,
  };
  const snapshot = loadGithubSnapshot(ctx, parsed.owner, parsed.name, releaseLimit);
  const annotated = snapshot?.repo
    ? annotateGithubPayload(snapshot, {
        fetchedAt: ctx.now ?? Date.now(),
        source: ctx.provider ? "studio" : "build",
      })
    : null;
  const bootstrapJson = annotated ? JSON.stringify(annotated).replaceAll("<", "\\u003c") : "";
  const titleHtml = ctx.titleHtml ?? ((value) => String(value ?? ""));
  return {
    ...block,
    titleHtml: titleHtml(block.title),
    hasBootstrap: Boolean(bootstrapJson),
    bootstrapJson,
  };
}
