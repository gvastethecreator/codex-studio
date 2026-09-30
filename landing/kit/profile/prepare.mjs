import { fileUrlToPath, posixIsAbsolute, posixJoin } from "../io.mjs";
import { kitFileExists, readKitFile } from "../render.mjs";
import { formatBytes, formatCount, formatDate, formatMetric, githubYears, relativeDate, shortRepository } from "./format.mjs";
import {
  availableActivityYears,
  buildDetailedHeatmap,
  buildFolioWeeks,
  buildHeatmapWeeks,
  buildOrbitTerrain,
  chartGeometry,
  daysForYear,
  heatmapMonthMarkers,
  longestActiveStreak,
  normalizeYearDays,
  periodThesis,
  summarizeMonths,
} from "./metrics.mjs";
import { fetchPublicProfileSync, readCachedProfile, userCachePath } from "./fetch-public.mjs";
import { assertDeployableSnapshot } from "./policy.mjs";
import { GITHUB_LOGIN_RE, normalizeGitHubLogin } from "./schema.mjs";
import { validateProfileSnapshot } from "./validator.mjs";

function moduleRoot() {
  try {
    return fileUrlToPath(new URL("../..", import.meta.url));
  } catch {
    return "";
  }
}

const ROOT = moduleRoot();
const LANGUAGE_FALLBACKS = {
  TypeScript: "#7ee787",
  JavaScript: "#b6a95b",
  Rust: "#c68f65",
  Python: "#62a782",
  CSS: "#4fa1a8",
  HTML: "#b96c53",
};

const ACTIVITY_LABELS = {
  CreateEvent: "Created",
  DeleteEvent: "Deleted",
  ForkEvent: "Forked",
  PullRequestReviewEvent: "Reviewed pull request",
  PushEvent: "Pushed to",
  ReleaseEvent: "Published release",
  WatchEvent: "Starred",
};

function fail(message) {
  throw new Error(`[gvaste-pages] ${message}`);
}

function activityLabel(type, action) {
  if (type === "IssuesEvent") return action ? `${action[0].toUpperCase()}${action.slice(1)} issue` : "Issue activity";
  if (type === "PullRequestEvent") {
    return action ? `${action[0].toUpperCase()}${action.slice(1)} pull request` : "Pull request activity";
  }
  return ACTIVITY_LABELS[type] ?? "Public activity in";
}

function sourceLabel(snapshot) {
  if (snapshot.sourceMode === "sample") return "Sample data · local static JSON";
  if (snapshot.sourceMode === "owner-anonymous") return "Owner aggregate · identifiers excluded";
  return "Public GitHub profile data";
}

function trailKind(snapshot) {
  const visibility = snapshot.contributions?.calendarVisibility;
  if (visibility === "public-profile" || visibility === "sample") return "contributions";
  return "repository-updates";
}

function contributionDays(snapshot, kind) {
  if (kind === "contributions") {
    return (snapshot.contributions?.daily ?? []).map((day) => ({
      date: day.date,
      count: day.count,
      level: day.level ?? 0,
    }));
  }
  const counts = new Map();
  for (const repo of snapshot.repositories ?? []) {
    const date = String(repo.updatedAt ?? "").slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    counts.set(date, (counts.get(date) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, count]) => ({ date, count, level: Math.min(4, count) }));
}

function languageColor(name, color) {
  return color || LANGUAGE_FALLBACKS[name] || "#78917d";
}

function resolveSnapshotPath(contentRoot, snapshot) {
  if (!snapshot) return null;
  if (posixIsAbsolute(snapshot)) return snapshot;
  const fileName = snapshot.replace(/^.*[/\\]/, "");
  const candidates = [
    posixJoin(contentRoot || "", snapshot),
    posixJoin(ROOT, snapshot),
    posixJoin(ROOT, "playground", "cases", snapshot),
    snapshot,
    `playground/cases/${snapshot}`,
    `examples/gitbound/${snapshot}`,
    `examples/catalog/${snapshot}`,
    `tests/fixtures/profile/${fileName}`,
  ];
  return candidates.find((path) => kitFileExists(path)) ?? candidates[0];
}

function loadSnapshotFromDisk(path) {
  if (!kitFileExists(path)) fail(`profile.snapshot file is missing: ${path}`);
  try {
    return validateProfileSnapshot(JSON.parse(readKitFile(path)));
  } catch (error) {
    if (error.name === "ProfileSnapshotValidationError") {
      fail(`profile.snapshot failed validation: ${error.message}`);
    }
    fail(`profile.snapshot is not valid JSON: ${error.message}`);
  }
}

function resolveSnapshot(block, contentRoot) {
  const login = normalizeGitHubLogin(block.user);
  if (!login) fail("profile.user must be a valid GitHub login");
  if (block.snapshot && typeof block.snapshot === "object" && !Array.isArray(block.snapshot)) {
    const snapshot = validateProfileSnapshot(block.snapshot);
    if (snapshot.profile.login.toLowerCase() !== login.toLowerCase()) {
      fail("profile.user must match snapshot profile.login");
    }
    if (snapshot.sourceMode !== "sample") assertDeployableSnapshot(login, snapshot);
    return snapshot;
  }
  const snapshotPath = String(block.snapshot ?? "").trim();
  if (snapshotPath) {
    const snapshot = loadSnapshotFromDisk(resolveSnapshotPath(contentRoot, snapshotPath));
    if (snapshot.profile.login.toLowerCase() !== login.toLowerCase()) {
      fail("profile.user must match snapshot profile.login");
    }
    if (snapshot.sourceMode !== "sample") assertDeployableSnapshot(snapshotPath, snapshot);
    return snapshot;
  }
  const cachePath = userCachePath(ROOT, login);
  const cached = readCachedProfile(cachePath);
  if (cached) {
    assertDeployableSnapshot(login, cached);
    return cached;
  }
  const fetched = fetchPublicProfileSync(login, { cachePath });
  if (!fetched) {
    fail("profile.snapshot is required when a public GitHub snapshot cannot be fetched");
  }
  assertDeployableSnapshot(login, fetched);
  return fetched;
}

function toSheet(snapshot) {
  const kind = trailKind(snapshot);
  const days = contributionDays(snapshot, kind);
  const metrics = snapshot.publicMetrics ?? {};
  const generatedAt = snapshot.generatedAt;
  const from = new Date(generatedAt);
  const languages = (snapshot.languages ?? []).map((language) => ({
    name: language.name,
    bytes: language.bytes,
    share: Math.round(language.share * 100),
    color: languageColor(language.name, language.color),
    width: `${Math.max(language.share * 100, 0.8)}%`,
  }));
  return {
    login: snapshot.profile.login,
    name: snapshot.profile.name || snapshot.profile.login,
    avatarUrl: snapshot.profile.avatarUrl || "assets/sample-character.png",
    url: snapshot.profile.githubUrl,
    bio: snapshot.profile.bio,
    location: snapshot.profile.location,
    joinedAt: snapshot.profile.createdAt,
    websiteUrl: snapshot.profile.websiteUrl,
    websiteLabel: snapshot.profile.websiteUrl ? snapshot.profile.websiteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "") : null,
    followers: snapshot.profile.followers ?? null,
    following: snapshot.profile.following ?? null,
    company: snapshot.profile.company ?? null,
    generatedAt,
    generatedLabel: `${formatDate(generatedAt)} · UTC`,
    sourceMode: snapshot.sourceMode,
    sourceLabel: sourceLabel(snapshot),
    sourceKind: snapshot.sourceMode === "sample" ? "sample" : "local-snapshot",
    languageScope: "selected public repositories",
    isSample: snapshot.sourceMode === "sample",
    hasRoleEvidence: (snapshot.roleTotals?.total ?? 0) > 0 && kind === "contributions",
    trailKind: kind,
    noun: kind === "contributions" ? "contributions" : "repository updates",
    limitations: snapshot.limitations ?? [],
    privacyNotes: snapshot.privacy?.notes ?? [],
    publicClaim: snapshot.privacy?.publicClaim === true,
    metrics,
    profileLinks: snapshot.profileLinks ?? [],
    totals: snapshot.totals ?? {},
    contributionDays: days,
    languages,
    recentActivity: (snapshot.recentPublicActivity ?? []).map((activity) => ({
      type: activity.type,
      label: activityLabel(activity.type, activity.action),
      occurredAt: activity.occurredAt,
      occurredLabel: relativeDate(activity.occurredAt, from),
      repository: activity.repositoryName,
      shortRepository: shortRepository(activity.repositoryName),
      url: activity.repositoryUrl,
    })),
    repositories: (snapshot.repositories ?? []).map((repository) => ({
      id: repository.id,
      name: repository.name,
      owner: repository.ownerLogin,
      url: repository.url,
      description: repository.description || "No description.",
      stars: repository.stars,
      starsLabel: formatCount(repository.stars),
      forks: repository.forks,
      forksLabel: formatCount(repository.forks),
      language: repository.primaryLanguage,
      languageColor: languageColor(repository.primaryLanguage, languages.find((item) => item.name === repository.primaryLanguage)?.color),
      topics: repository.topics ?? [],
      updatedAt: repository.updatedAt ?? generatedAt,
      updatedLabel: relativeDate(repository.updatedAt ?? generatedAt, from),
      role: repository.ownerLogin?.toLowerCase() === snapshot.profile.login.toLowerCase() ? "Owner" : "Contributor",
    })),
    followersLabel: formatMetric(snapshot.profile.followers ?? null),
    followingLabel: formatMetric(snapshot.profile.following ?? null),
    yearsOnGitHub: snapshot.profile.createdAt ? githubYears(snapshot.profile.createdAt, generatedAt) : null,
    joinedLabel: snapshot.profile.createdAt
      ? formatDate(snapshot.profile.createdAt, { month: "short", year: "numeric" })
      : null,
    repoCoverage: `${formatCount(metrics.repositoriesMeasured ?? snapshot.repositories?.length ?? 0)} of ${formatCount(snapshot.totals?.publicRepositories ?? snapshot.repositories?.length ?? 0)} repos`,
  };
}

function languageSegments(languages) {
  const visible = languages.filter((language) => language.share >= 1).slice(0, 8);
  const visibleShare = visible.reduce((total, language) => total + language.share, 0);
  const other = Math.max(0, 100 - visibleShare);
  return { visible, other, hasOther: other >= 1 };
}

function yearPanels(sheet) {
  const years = availableActivityYears(sheet.contributionDays, sheet.generatedAt);
  return years.map((year, index) => {
    const yearDays = daysForYear(sheet.contributionDays, year);
    const rawWeeks = buildHeatmapWeeks(yearDays, year, sheet.generatedAt);
    const weeks = rawWeeks.map((days) => ({ days }));
    const total = yearDays.reduce((sum, day) => sum + day.count, 0);
    const activeDays = yearDays.filter((day) => day.count > 0).length;
    const bestDay = Math.max(0, ...yearDays.map((day) => day.count));
    const streak = longestActiveStreak(yearDays);
    const months = summarizeMonths(sheet.contributionDays, year);
    const normalized = normalizeYearDays(sheet.contributionDays, year, sheet.generatedAt);
    const geometry = chartGeometry(normalized);
    return {
      year,
      active: index === 0,
      weeks,
      months: heatmapMonthMarkers(rawWeeks),
      heatmapWidth: `${Math.max(rawWeeks.length * 17, 540)}px`,
      observatoryWidth: `${Math.max(520, rawWeeks.length * 15 + 52)}px`,
      total,
      totalLabel: formatCount(total),
      activeDays,
      bestDay,
      streak,
      heading: sheet.trailKind === "contributions" ? String(year) : "Public activity",
      calendarLabel: `${formatCount(total)} ${sheet.noun} in ${year}`,
      monthsTable: months.map((month) => ({
        ...month,
        label: formatDate(`${month.month}-01`, { month: "long", year: "numeric" }),
      })),
      thesis: periodThesis(months, sheet.noun),
      geometry,
      orbit: buildOrbitTerrain(sheet.contributionDays, year, sheet.generatedAt, sheet.recentActivity.map((item) => ({
        date: item.occurredAt.slice(0, 10),
        repository: item.repository,
        url: item.url,
        label: item.label,
      }))),
    };
  });
}

function standardSummary(sheet, panel) {
  if (sheet.trailKind === "contributions") {
    return [
      { value: panel.totalLabel, label: "Contributions", detail: `${panel.year} calendar` },
      { value: formatCount(panel.activeDays), label: "Active days", detail: "Verified dates" },
      {
        value: panel.activeDays ? formatCount(Math.round(panel.total / panel.activeDays)) : "0",
        label: "Avg / active day",
        detail: "Calendar total",
      },
      { value: formatCount(panel.bestDay), label: "Best day", detail: "Highest daily count" },
    ];
  }
  return [
    { value: formatCount(sheet.totals.publicRepositories ?? sheet.repositories.length), label: "Public repositories", detail: `${sheet.repoCoverage} measured` },
    { value: formatMetric(sheet.metrics.stars ?? null), label: "Repository stars", detail: sheet.repoCoverage },
    { value: formatMetric(sheet.metrics.recentCommits ?? null), label: "Recent commits", detail: "Public feed" },
    { value: formatMetric(sheet.metrics.forks ?? null), label: "Repository forks", detail: sheet.repoCoverage },
  ];
}

function workEvidence(sheet) {
  if (sheet.trailKind === "contributions") {
    return [
      { value: formatMetric(sheet.totals.commits ?? null), label: "Commits", detail: "Contribution window" },
      { value: formatMetric(sheet.totals.pullRequests ?? null), label: "Pull requests", detail: "Contribution window" },
      { value: formatMetric(sheet.totals.reviews ?? null), label: "Reviews", detail: "Contribution window" },
      { value: formatMetric(sheet.totals.issues ?? null), label: "Issues", detail: "Contribution window" },
      { value: formatMetric(sheet.metrics.stars ?? null), label: "Stars", detail: sheet.repoCoverage },
      { value: formatMetric(sheet.metrics.forks ?? null), label: "Forks", detail: sheet.repoCoverage },
    ];
  }
  return [
    { value: formatMetric(sheet.metrics.recentPushes ?? null), label: "Pushes", detail: "Public feed" },
    { value: formatMetric(sheet.metrics.recentPullRequests ?? null), label: "PR events", detail: "Public feed" },
    { value: formatMetric(sheet.metrics.recentReviews ?? null), label: "Review events", detail: "Public feed" },
    { value: formatMetric(sheet.metrics.recentIssues ?? null), label: "Issue events", detail: "Public feed" },
    { value: formatMetric(sheet.metrics.recentReleases ?? null), label: "Releases", detail: "Public feed" },
    { value: formatCount(sheet.recentActivity.length), label: "Public events", detail: "Recent window" },
  ];
}

export function prepareProfile(block, options = {}) {
  if (!block) fail("profile is required when the profile section is selected");
  if (typeof block !== "object" || Array.isArray(block)) fail("profile must be a mapping");
  const variant = String(block.variant ?? options.variant ?? "standard").trim().toLowerCase();
  const snapshot = resolveSnapshot(block, options.contentRoot);
  const sheet = toSheet(snapshot);
  const languages = languageSegments(sheet.languages);
  const years = yearPanels(sheet);
  const activeYear = years[0];
  const heatmapRaw = buildDetailedHeatmap(sheet.contributionDays, sheet.generatedAt);
  const heatmap = {
    ...heatmapRaw,
    weeks: heatmapRaw.weeks.map((days) => ({ days })),
  };
  const folioWeeksRaw = buildFolioWeeks(sheet.contributionDays);
  const folioTotal = folioWeeksRaw.reduce((sum, week) => sum + week.count, 0);
  const folioMax = Math.max(1, ...folioWeeksRaw.map((week) => week.count));
  const folioWeeks = folioWeeksRaw.map((week) => ({
    ...week,
    height: `${Math.max(week.count > 0 ? 8 : 3, Math.round((week.count / folioMax) * 100))}%`,
  }));
  const coverageStart = sheet.contributionDays[0]?.date;
  const coverageEnd = sheet.contributionDays.at(-1)?.date;
  const repoLanguages = [...new Set(sheet.repositories.map((item) => item.language).filter(Boolean))].sort();

  return {
    ...block,
    variant,
    isStandard: variant === "standard",
    isFolio: variant === "folio",
    isObservatory: variant === "observatory",
    isHeatmap: variant === "heatmap",
    isOrbit: variant === "orbit",
    isProjects: variant === "projects",
    user: sheet.login,
    ...sheet,
    languagesVisible: languages.visible,
    languagesOther: Math.round(languages.other),
    hasLanguageOther: languages.hasOther,
    hasLanguages: languages.visible.length > 0,
    hasLinks: sheet.profileLinks.length > 0,
    hasActivity: sheet.recentActivity.length > 0,
    recentActivity: sheet.recentActivity.slice(0, 8),
    listedRepositories: sheet.repositories.slice(0, variant === "projects" ? 24 : 9),
    allRepositories: sheet.repositories,
    years,
    activeYear,
    summary: activeYear ? standardSummary(sheet, activeYear) : [],
    workEvidence: workEvidence(sheet),
    streakLabel: activeYear && activeYear.streak > 0 ? `${activeYear.streak} day best streak` : null,
    coverageLabel:
      coverageStart && coverageEnd
        ? `${formatDate(coverageStart, { month: "short", year: "numeric" })} — ${formatDate(coverageEnd, { month: "short", year: "numeric" })}`
        : "No dated repository activity",
    isContributionCalendar: sheet.trailKind === "contributions",
    heatmap,
    heatmapBest: heatmap.bestDay,
    heatmapNoun: sheet.noun,
    folioWeeks,
    folioTotal: formatCount(folioTotal),
    folioActiveWeeks: folioWeeks.filter((week) => week.count > 0).length,
    folioActiveWeeksLabel: `${folioWeeks.filter((week) => week.count > 0).length}/${folioWeeks.length}`,
    folioWeekCount: folioWeeks.length,
    folioWeeklyAverage: folioWeeks.length ? (folioTotal / folioWeeks.length).toFixed(1) : "—",
    folioTrailNoun: sheet.trailKind === "contributions" ? "Total contributions" : "Repository updates",
    identityFacts: [
      { label: "Followers", value: sheet.followersLabel },
      { label: "Following", value: sheet.followingLabel },
      ...(sheet.yearsOnGitHub == null ? [] : [{ label: "Years on GitHub", value: String(sheet.yearsOnGitHub) }]),
      ...(sheet.company ? [{ label: "Company", value: sheet.company }] : []),
      ...(sheet.location ? [{ label: "Location", value: sheet.location }] : []),
    ],
    scopeFacts: [
      { label: "Source", value: sheet.sourceLabel },
      { label: "Generated", value: sheet.generatedLabel },
      { label: "Coverage", value: sheet.repoCoverage },
      { label: "Privacy", value: "Public data only" },
    ],
    serviceStats: sheet.hasRoleEvidence
      ? [
          { label: "Commits", detail: "Contribution window", value: formatMetric(sheet.totals.commits ?? null) },
          { label: "Pull requests", detail: "Contribution window", value: formatMetric(sheet.totals.pullRequests ?? null) },
          { label: "Reviews", detail: "Contribution window", value: formatMetric(sheet.totals.reviews ?? null) },
          { label: "Issues", detail: "Contribution window", value: formatMetric(sheet.totals.issues ?? null) },
        ]
      : [
          { label: "Public repositories", detail: "Owned and visible", value: formatCount(sheet.totals.publicRepositories ?? sheet.repositories.length) },
          { label: "Repository stars", detail: "Measured repositories", value: formatMetric(sheet.metrics.stars ?? null) },
          { label: "Repository forks", detail: "Measured repositories", value: formatMetric(sheet.metrics.forks ?? null) },
        ],
    publicBytesLabel: formatBytes(sheet.totals.publicBytes ?? null),
    repoLanguages,
    projectStats: [
      { label: "Listed", value: formatCount(sheet.repositories.length) },
      { label: "Measured", value: formatCount(sheet.metrics.repositoriesMeasured ?? sheet.repositories.length) },
      { label: "Stars", value: formatMetric(sheet.metrics.stars ?? null) },
      { label: "Forks", value: formatMetric(sheet.metrics.forks ?? null) },
    ],
    collaboration: [
      { label: "Push events", value: formatMetric(sheet.metrics.recentPushes ?? null) },
      { label: "Pull request events", value: formatMetric(sheet.metrics.recentPullRequests ?? null) },
      { label: "Review events", value: formatMetric(sheet.metrics.recentReviews ?? null) },
      { label: "Issue events", value: formatMetric(sheet.metrics.recentIssues ?? null) },
      { label: "Releases", value: formatMetric(sheet.metrics.recentReleases ?? null) },
    ],
    methodology: sheet.limitations,
  };
}

export { GITHUB_LOGIN_RE, validateProfileSnapshot };
