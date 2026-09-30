import { posixDirname, posixJoin } from "../io.mjs";
import { PROFILE_SNAPSHOT_SCHEMA_ID, PROFILE_SNAPSHOT_SCHEMA_VERSION } from "./schema.mjs";

function nodeIo() {
  if (typeof process === "undefined" || typeof process.getBuiltinModule !== "function") return null;
  const fs = process.getBuiltinModule("node:fs");
  const child = process.getBuiltinModule("node:child_process");
  return {
    mkdirSync: fs.mkdirSync,
    readFileSync: fs.readFileSync,
    writeFileSync: fs.writeFileSync,
    spawnSync: child.spawnSync,
  };
}
import { validateProfileSnapshot } from "./validator.mjs";

const GITHUB_API_VERSION = "2022-11-28";

function emptyRoles() {
  return { commits: 0, pullRequests: 0, reviews: 0, issues: 0, total: 0 };
}

function publicWebsiteUrl(blog) {
  const raw = String(blog ?? "").trim();
  if (!raw) return null;
  const href = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const parsed = new URL(href);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    parsed.protocol = "https:";
    return parsed.toString();
  } catch {
    return null;
  }
}

export function buildPublicProfileSnapshot({ user, repositories, events, generatedAt }) {
  const generated = generatedAt ?? new Date().toISOString();
  const login = user.login;
  const selected = (repositories ?? []).slice(0, 24).map((repo) => ({
    id: String(repo.id),
    name: repo.name,
    ownerLogin: repo.owner?.login ?? login,
    url: repo.html_url,
    description: repo.description ?? null,
    stars: repo.stargazers_count ?? 0,
    forks: repo.forks_count ?? 0,
    primaryLanguage: repo.language ?? null,
    topics: Array.isArray(repo.topics) ? repo.topics : [],
    updatedAt: repo.updated_at ?? null,
    visibility: "public",
  }));
  const stars = selected.reduce((sum, repo) => sum + repo.stars, 0);
  const forks = selected.reduce((sum, repo) => sum + repo.forks, 0);
  const recentPublicActivity = (events ?? []).slice(0, 30).map((event) => ({
    type: event.type ?? "Event",
    occurredAt: `${String(event.created_at ?? generated).slice(0, 10)}T00:00:00Z`,
    repositoryName: event.repo?.name ?? `${login}/unknown`,
    repositoryUrl: `https://github.com/${event.repo?.name ?? `${login}/unknown`}`,
    action: event.payload?.action ?? null,
  }));
  const recentWindowFrom = recentPublicActivity.at(-1)?.occurredAt ?? null;
  const recentWindowTo = recentPublicActivity[0]?.occurredAt ?? null;
  const countType = (type) => recentPublicActivity.filter((item) => item.type === type).length;
  const zero = emptyRoles();
  const snapshot = {
    schemaVersion: PROFILE_SNAPSHOT_SCHEMA_VERSION,
    schemaId: PROFILE_SNAPSHOT_SCHEMA_ID,
    generatedAt: generated,
    sourceMode: "public-profile",
    profile: {
      login,
      name: user.name ?? null,
      avatarUrl: user.avatar_url ?? null,
      bio: user.bio ?? null,
      location: user.location ?? null,
      websiteUrl: publicWebsiteUrl(user.blog),
      createdAt: user.created_at ?? null,
      githubUrl: user.html_url ?? `https://github.com/${login}`,
      followers: user.followers ?? 0,
      following: user.following ?? 0,
      company: user.company ?? null,
    },
    contributions: {
      timezone: "UTC",
      sourceMode: "public-profile",
      calendarVisibility: "not-verified",
      range: { from: generated, to: generated },
      daily: [],
      weekly: [],
      total: 0,
      activeDays: 0,
    },
    roles: [
      { role: "author", label: "Code authored", count: 0 },
      { role: "reviewer", label: "Reviews", count: 0 },
      { role: "issue-solver", label: "Issues", count: 0 },
      { role: "maintainer", label: "Pull requests", count: 0 },
    ],
    roleTotals: zero,
    totals: {
      ...zero,
      publicRepositories: Math.max(user.public_repos ?? 0, selected.length),
      publicBytes: 0,
    },
    languages: [],
    repositories: selected,
    publicRepositories: selected,
    recentPublicActivity,
    publicMetrics: {
      repositoriesMeasured: selected.length,
      stars,
      forks,
      publicGists: user.public_gists ?? 0,
      indexedPublicCommits: null,
      indexedPublicCommitsIncomplete: false,
      recentCommits: 0,
      recentPushes: countType("PushEvent"),
      recentPullRequests: countType("PullRequestEvent"),
      recentReviews: countType("PullRequestReviewEvent"),
      recentIssues: countType("IssuesEvent"),
      recentReleases: countType("ReleaseEvent"),
      recentWindowFrom,
      recentWindowTo,
    },
    provenance: {
      generatedAt: generated,
      source: "github",
      sourceMode: "public-profile",
      githubApiVersion: GITHUB_API_VERSION,
      exporterVersion: "gvaste-pages-public-rest@1",
      contributionCalendarSource: "not-verified",
    },
    privacy: {
      mode: "public-profile",
      privateAggregateIncluded: false,
      privateIdentifiersExcluded: true,
      privateContentExcluded: true,
      publicClaim: false,
      contributionCalendarVisibility: "not-verified",
      notes: [
        "Only public REST endpoints are requested at build time.",
        "Contribution totals are not claimed from this source.",
      ],
    },
    limitations: [
      "Contribution calendar totals are unavailable from anonymous public REST.",
      "Repository-update dates are not contribution counts.",
      "Language mix is omitted until a reviewed snapshot supplies byte evidence.",
    ],
  };
  return validateProfileSnapshot(snapshot);
}

export function fetchPublicProfileSync(login, { cachePath } = {}) {
  if (typeof process === "undefined" || !process.execPath) return null;
  if (process.env.NODE_TEST_CONTEXT || process.env.GV_GITHUB_SNAPSHOT === "0") return null;
  const code = `
const login = ${JSON.stringify(login)};
const headers = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": ${JSON.stringify(GITHUB_API_VERSION)},
  "User-Agent": "gvaste-pages-build"
};
if (process.env.GITHUB_TOKEN) headers.Authorization = "Bearer " + process.env.GITHUB_TOKEN;
const get = async (url) => {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(String(res.status));
  return res.json();
};
const run = async () => {
  const user = await get("https://api.github.com/users/" + encodeURIComponent(login));
  if (user && user.type && user.type !== "User" && user.type !== "Organization") throw new Error("not-a-user");
  const [repositories, events] = await Promise.all([
    get("https://api.github.com/users/" + encodeURIComponent(login) + "/repos?per_page=100&sort=updated&type=owner"),
    get("https://api.github.com/users/" + encodeURIComponent(login) + "/events/public?per_page=30").catch(() => []),
  ]);
  process.stdout.write(JSON.stringify({
    user,
    repositories: Array.isArray(repositories) ? repositories.filter((repo) => !repo.private) : [],
    events: Array.isArray(events) ? events : [],
  }));
};
run().catch((error) => { console.error(error.message || error); process.exit(1); });
`;
  const io = nodeIo();
  if (!io) return null;
  const result = io.spawnSync(process.execPath, ["--input-type=module", "-e", code], {
    encoding: "utf8",
    timeout: 30_000,
    env: process.env,
  });
  if (result.status !== 0) return null;
  try {
    const payload = JSON.parse(result.stdout);
    const snapshot = buildPublicProfileSnapshot(payload);
    if (cachePath) {
      io.mkdirSync(posixDirname(cachePath), { recursive: true });
      io.writeFileSync(cachePath, JSON.stringify({ at: Date.now(), payload: snapshot }));
    }
    return snapshot;
  } catch {
    return null;
  }
}

export function readCachedProfile(cachePath) {
  try {
    const io = nodeIo();
    if (!io) return null;
    const parsed = JSON.parse(io.readFileSync(cachePath, "utf8"));
    if (parsed?.payload?.profile?.login) return validateProfileSnapshot(parsed.payload);
  } catch {}
  return null;
}

export function userCachePath(root, login) {
  return posixJoin(root, ".cache", "github", `user-${login}.json`);
}
