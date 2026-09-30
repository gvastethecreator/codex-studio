import {
  CALENDAR_VISIBILITY,
  GITHUB_LOGIN_RE,
  PROFILE_SNAPSHOT_SCHEMA_ID,
  PROFILE_SNAPSHOT_SCHEMA_VERSION,
  ROLES,
  SOURCE_MODES,
} from "./schema.mjs";

export class ProfileSnapshotValidationError extends Error {
  constructor(issues) {
    super(
      `Invalid profile snapshot (${issues.length} issue${issues.length === 1 ? "" : "s"}): ${issues
        .map((issue) => `${issue.path} ${issue.message}`)
        .join("; ")}`,
    );
    this.name = "ProfileSnapshotValidationError";
    this.issues = issues;
  }
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
const GITHUB_HOST = "github.com";
const GITHUB_AVATAR_HOSTS = new Set(["avatars.githubusercontent.com", GITHUB_HOST]);
const GITHUB_REPOSITORY_NAME_RE = /^(?!\.{1,2}$)[A-Za-z0-9._-]{1,100}$/;
const SPONSOR_PROVIDERS = new Map([
  ["patreon.com", "Patreon"],
  ["ko-fi.com", "Ko-fi"],
  ["buymeacoffee.com", "Buy Me a Coffee"],
  ["opencollective.com", "Open Collective"],
  ["polar.sh", "Polar"],
]);

const isRecord = (value) =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const add = (
  issues,
  path,
  message,
) => {
  issues.push({ path, message });
};

const checkAllowedKeys = (
  value,
  path,
  allowed,
  issues,
) => {
  const allowedSet = new Set(allowed);
  for (const key of Object.keys(value)) {
    if (!allowedSet.has(key)) add(issues, path ? `${path}.${key}` : key, "is not allowed in the browser snapshot");
  }
};

const checkString = (
  value,
  path,
  issues,
  options = {},
) => {
  if (options.nullable && value === null) return true;
  if (typeof value !== "string") {
    add(issues, path, "must be a string");
    return false;
  }
  if (options.min !== undefined && value.length < options.min) {
    add(issues, path, `must be at least ${options.min} characters`);
  }
  if (options.max !== undefined && value.length > options.max) {
    add(issues, path, `must be at most ${options.max} characters`);
  }
  return true;
};

const parseHttpsUrl = (
  value,
  path,
  issues,
  options = {},
) => {
  if (typeof value !== "string") return null;
  let url;
  try {
    url = new URL(value);
  } catch {
    add(issues, path, "must be an absolute HTTPS URL");
    return null;
  }
  if (url.protocol !== "https:" || url.username || url.password || (!options.allowCustomPort && url.port)) {
    add(issues, path, `must be an absolute HTTPS URL without credentials${options.allowCustomPort ? "" : " or a custom port"}`);
    return null;
  }
  return url;
};

const githubPathParts = (url) => {
  if (url.hostname.toLowerCase() !== GITHUB_HOST || url.search || url.hash) return null;
  try {
    if (url.pathname.includes("%")) return null;
    const parts = url.pathname.split("/").filter(Boolean).map((part) => decodeURIComponent(part));
    return parts.some((part) => !part || part === "." || part === ".." || /[\\/]/.test(part)) ? null : parts;
  } catch {
    return null;
  }
};

const isCanonicalGitHubUrlText = (value, path) => {
  if (typeof value !== "string") return false;
  const canonical = `https://github.com/${path}`.toLowerCase();
  const candidate = value.toLowerCase();
  return candidate === canonical || candidate === `${canonical}/`;
};

const checkGitHubProfileUrl = (
  value,
  expectedLogin,
  path,
  issues,
) => {
  const url = parseHttpsUrl(value, path, issues);
  if (!url) return;
  const parts = githubPathParts(url);
  if (parts?.length !== 1 || !GITHUB_LOGIN_RE.test(parts[0] ?? "") || (typeof expectedLogin === "string" && (!isCanonicalGitHubUrlText(value, expectedLogin) || parts[0]?.toLowerCase() !== expectedLogin.toLowerCase()))) {
    add(issues, path, "must be the canonical github.com profile URL for profile.login");
  }
};

const checkGitHubRepositoryUrl = (
  value,
  expectedRepository,
  path,
  issues,
  expectedName = null,
) => {
  const url = parseHttpsUrl(value, path, issues);
  if (!url) return;
  const parts = githubPathParts(url);
  const actualRepository = parts?.length === 2 ? parts.join("/") : null;
  if (!actualRepository || !GITHUB_LOGIN_RE.test(parts?.[0] ?? "") || !GITHUB_REPOSITORY_NAME_RE.test(parts?.[1] ?? "") || (expectedName && parts?.[1]?.toLowerCase() !== expectedName.toLowerCase()) || (expectedRepository && (!isCanonicalGitHubUrlText(value, expectedRepository) || actualRepository.toLowerCase() !== expectedRepository.toLowerCase()))) {
    add(issues, path, "must be the canonical github.com repository URL for this evidence");
  }
};

const isSafeSampleAssetPath = (value) => {
  const hasControlCharacter = [...value].some((character) => {
    const code = character.charCodeAt(0);
    return code <= 0x1f || (code >= 0x7f && code <= 0x9f);
  });
  if (!value.startsWith("assets/") || /[\\?%#]/.test(value) || hasControlCharacter) return false;
  const segments = value.split("/");
  return segments.length > 1 && segments[0] === "assets" && segments.every((segment) => segment.length > 0 && segment !== "." && segment !== "..");
};

const checkNumber = (
  value,
  path,
  issues,
) => {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    add(issues, path, "must be a finite non-negative number");
    return false;
  }
  return true;
};

const checkCount = (
  value,
  path,
  issues,
) => {
  const validNumber = checkNumber(value, path, issues);
  if (validNumber && !Number.isInteger(value)) add(issues, path, "must be an integer");
  return validNumber && Number.isInteger(value);
};

const checkIsoDate = (
  value,
  path,
  issues,
) => {
  if (typeof value !== "string") {
    add(issues, path, "must be an ISO date or date-time");
    return;
  }
  const isDateOnly = ISO_DATE.test(value);
  const datePart = value.slice(0, 10);
  const parsedDatePart = new Date(`${datePart}T00:00:00.000Z`);
  const hasRealCalendarDate = ISO_DATE.test(datePart) && !Number.isNaN(parsedDatePart.getTime()) && parsedDatePart.toISOString().slice(0, 10) === datePart;
  const isValidDateOnly = isDateOnly && hasRealCalendarDate;
  const isValidDateTime = !isDateOnly && ISO_DATE_TIME.test(value) && hasRealCalendarDate && !Number.isNaN(Date.parse(value));
  if (!isValidDateOnly && !isValidDateTime) add(issues, path, "must be an ISO date or date-time");
};

const checkIsoDateOnly = (
  value,
  path,
  issues,
) => {
  if (typeof value !== "string" || !ISO_DATE.test(value)) {
    add(issues, path, "must be an ISO date in YYYY-MM-DD form");
    return false;
  }
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    add(issues, path, "must be a real ISO calendar date");
    return false;
  }
  return true;
};

const checkDaily = (
  value,
  path,
  issues,
) => {
  if (!isRecord(value)) {
    add(issues, path, "must be an object");
    return false;
  }
  checkAllowedKeys(value, path, ["date", "count", "level"], issues);
  checkIsoDateOnly(value.date, `${path}.date`, issues);
  checkCount(value.count, `${path}.count`, issues);
  if (![0, 1, 2, 3, 4].includes(value.level)) {
    add(issues, `${path}.level`, "must be an integer from 0 to 4");
  }
  return true;
};

const checkRoleTotals = (
  value,
  path,
  issues,
  extraKeys = [],
) => {
  if (!isRecord(value)) {
    add(issues, path, "must be an object");
    return;
  }
  checkAllowedKeys(value, path, ["commits", "pullRequests", "reviews", "issues", "total", ...extraKeys], issues);
  for (const key of ["commits", "pullRequests", "reviews", "issues", "total"]) {
    checkCount(value[key], `${path}.${key}`, issues);
  }
};

const checkNoForbiddenKeys = (
  value,
  path,
  issues,
) => {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => {
      checkNoForbiddenKeys(entry, `${path}[${index}]`, issues);
    });
    return;
  }
  if (!isRecord(value)) return;
  for (const [key, child] of Object.entries(value)) {
    const allowedPrivacyKey =
      key === "privateAggregate" ||
      key === "privateAggregateIncluded" ||
      key === "privateIdentifiersExcluded" ||
      key === "privateContentExcluded";
    if (!allowedPrivacyKey && /token|secret|raw(response)?|private(repo|organization|org|url|id|name)|ownerView/i.test(key)) {
      add(issues, path ? `${path}.${key}` : key, "is not allowed in the browser snapshot");
    }
    checkNoForbiddenKeys(child, path ? `${path}.${key}` : key, issues);
  }
};

export function validateProfileSnapshot(value) {
  const issues = [];
  if (!isRecord(value)) {
    throw new ProfileSnapshotValidationError([{ path: "$", message: "must be an object" }]);
  }
  checkAllowedKeys(value, "", [
    "schemaVersion",
    "schemaId",
    "generatedAt",
    "sourceMode",
    "profile",
    "contributions",
    "roles",
    "roleTotals",
    "totals",
    "languages",
    "repositories",
    "publicRepositories",
    "recentPublicActivity",
    "publicMetrics",
    "publicCommitSubjects",
    "profileLinks",
    "privateAggregate",
    "provenance",
    "privacy",
    "limitations",
  ], issues);

  if (value.schemaVersion !== PROFILE_SNAPSHOT_SCHEMA_VERSION) {
    add(issues, "schemaVersion", `must equal ${PROFILE_SNAPSHOT_SCHEMA_VERSION}`);
  }
  if (value.schemaId !== PROFILE_SNAPSHOT_SCHEMA_ID) {
    add(issues, "schemaId", `must equal ${PROFILE_SNAPSHOT_SCHEMA_ID}`);
  }
  checkIsoDate(value.generatedAt, "generatedAt", issues);
  checkString(value.sourceMode, "sourceMode", issues);
  if (!SOURCE_MODES.includes(value.sourceMode)) {
    add(issues, "sourceMode", "must be public-profile, owner-anonymous, or sample");
  }

  const profile = value.profile;
  if (!isRecord(profile)) {
    add(issues, "profile", "must be an object");
  } else {
    checkAllowedKeys(profile, "profile", ["login", "name", "avatarUrl", "bio", "location", "websiteUrl", "createdAt", "githubUrl", "followers", "following", "company"], issues);
    if (checkString(profile.login, "profile.login", issues, { min: 1, max: 39 }) && typeof profile.login === "string" && !GITHUB_LOGIN_RE.test(profile.login)) {
      add(issues, "profile.login", "must be a valid GitHub login");
    }
    checkString(profile.name, "profile.name", issues, { nullable: true, max: 160 });
    checkString(profile.avatarUrl, "profile.avatarUrl", issues, { nullable: true, max: 2048 });
    checkString(profile.bio, "profile.bio", issues, { nullable: true, max: 5000 });
    checkString(profile.location, "profile.location", issues, { nullable: true, max: 200 });
    checkString(profile.websiteUrl, "profile.websiteUrl", issues, { nullable: true, max: 2048 });
    if (profile.createdAt !== null) checkIsoDate(profile.createdAt, "profile.createdAt", issues);
    checkString(profile.githubUrl, "profile.githubUrl", issues, { min: 1, max: 2048 });
    if (typeof profile.avatarUrl === "string") {
      if (!(value.sourceMode === "sample" && isSafeSampleAssetPath(profile.avatarUrl))) {
        const avatarUrl = parseHttpsUrl(profile.avatarUrl, "profile.avatarUrl", issues);
        if (avatarUrl && (!GITHUB_AVATAR_HOSTS.has(avatarUrl.hostname.toLowerCase()) || avatarUrl.hash)) {
          add(issues, "profile.avatarUrl", "must use a documented GitHub avatar host");
        }
      }
    }
    if (typeof profile.websiteUrl === "string") parseHttpsUrl(profile.websiteUrl, "profile.websiteUrl", issues, { allowCustomPort: true });
    checkGitHubProfileUrl(profile.githubUrl, profile.login, "profile.githubUrl", issues);
    if (profile.followers !== undefined) {
      checkCount(profile.followers, "profile.followers", issues);
    }
    if (profile.following !== undefined) {
      checkCount(profile.following, "profile.following", issues);
    }
    if (profile.company !== undefined) checkString(profile.company, "profile.company", issues, { nullable: true, max: 200 });
  }

  const contributions = value.contributions;
  if (!isRecord(contributions)) {
    add(issues, "contributions", "must be an object");
  } else {
    checkAllowedKeys(contributions, "contributions", ["timezone", "sourceMode", "calendarVisibility", "range", "daily", "weekly", "total", "activeDays"], issues);
    if (contributions.timezone !== "UTC") add(issues, "contributions.timezone", "must be UTC");
    if (!SOURCE_MODES.includes(contributions.sourceMode)) {
      add(issues, "contributions.sourceMode", "must be a valid source mode");
    }
    if (!CALENDAR_VISIBILITY.includes(contributions.calendarVisibility)) {
      add(issues, "contributions.calendarVisibility", "must be a valid calendar visibility");
    }
    if (!isRecord(contributions.range)) {
      add(issues, "contributions.range", "must be an object");
    } else {
      checkAllowedKeys(contributions.range, "contributions.range", ["from", "to"], issues);
      checkIsoDate(contributions.range.from, "contributions.range.from", issues);
      checkIsoDate(contributions.range.to, "contributions.range.to", issues);
    }
    if (!Array.isArray(contributions.daily)) add(issues, "contributions.daily", "must be an array");
    else contributions.daily.forEach((entry, index) => {
      checkDaily(entry, `contributions.daily[${index}]`, issues);
    });
    if (!Array.isArray(contributions.weekly)) add(issues, "contributions.weekly", "must be an array");
    else {
      contributions.weekly.forEach((entry, index) => {
        const path = `contributions.weekly[${index}]`;
        if (!isRecord(entry)) {
          add(issues, path, "must be an object");
          return;
        }
        checkAllowedKeys(entry, path, ["week", "startDate", "endDate", "total", "days"], issues);
        checkIsoDateOnly(entry.week, `${path}.week`, issues);
        checkIsoDateOnly(entry.startDate, `${path}.startDate`, issues);
        checkIsoDateOnly(entry.endDate, `${path}.endDate`, issues);
        checkCount(entry.total, `${path}.total`, issues);
        if (!Array.isArray(entry.days)) add(issues, `${path}.days`, "must be an array");
        else entry.days.forEach((day, dayIndex) => {
          checkDaily(day, `${path}.days[${dayIndex}]`, issues);
        });
      });
    }
    checkCount(contributions.total, "contributions.total", issues);
    checkCount(contributions.activeDays, "contributions.activeDays", issues);
  }

  if (!Array.isArray(value.roles)) add(issues, "roles", "must be an array");
  else {
    value.roles.forEach((entry, index) => {
      const path = `roles[${index}]`;
      if (!isRecord(entry)) {
        add(issues, path, "must be an object");
        return;
      }
      checkAllowedKeys(entry, path, ["role", "label", "count"], issues);
      if (!ROLES.includes(entry.role)) add(issues, `${path}.role`, "must be a known role");
      checkString(entry.label, `${path}.label`, issues, { min: 1, max: 80 });
      checkCount(entry.count, `${path}.count`, issues);
    });
  }
  checkRoleTotals(value.roleTotals, "roleTotals", issues);
  if (!isRecord(value.totals)) add(issues, "totals", "must be an object");
  else {
    checkAllowedKeys(value.totals, "totals", ["commits", "pullRequests", "reviews", "issues", "total", "publicRepositories", "publicBytes"], issues);
    checkRoleTotals(value.totals, "totals", issues, ["publicRepositories", "publicBytes"]);
    checkCount(value.totals.publicRepositories, "totals.publicRepositories", issues);
    checkCount(value.totals.publicBytes, "totals.publicBytes", issues);
  }

  if (!Array.isArray(value.languages)) add(issues, "languages", "must be an array");
  else value.languages.forEach((entry, index) => {
    const path = `languages[${index}]`;
    if (!isRecord(entry)) {
      add(issues, path, "must be an object");
      return;
    }
    checkAllowedKeys(entry, path, ["name", "bytes", "share", "color"], issues);
    checkString(entry.name, `${path}.name`, issues, { min: 1, max: 100 });
    checkCount(entry.bytes, `${path}.bytes`, issues);
    checkNumber(entry.share, `${path}.share`, issues);
    if (typeof entry.share === "number" && entry.share > 1.000001) add(issues, `${path}.share`, "must be between 0 and 1");
    checkString(entry.color, `${path}.color`, issues, { nullable: true, max: 20 });
  });

  const checkRepository = (entry, path) => {
    if (!isRecord(entry)) {
      add(issues, path, "must be an object");
      return;
    }
    checkAllowedKeys(entry, path, ["id", "name", "ownerLogin", "url", "description", "stars", "forks", "primaryLanguage", "topics", "updatedAt", "visibility"], issues);
    checkString(entry.id, `${path}.id`, issues, { min: 1, max: 200 });
    if (checkString(entry.name, `${path}.name`, issues, { min: 1, max: 100 }) && typeof entry.name === "string" && !GITHUB_REPOSITORY_NAME_RE.test(entry.name)) {
      add(issues, `${path}.name`, "must be a valid GitHub repository name");
    }
    if (checkString(entry.ownerLogin, `${path}.ownerLogin`, issues, { nullable: true, max: 39 }) && typeof entry.ownerLogin === "string" && !GITHUB_LOGIN_RE.test(entry.ownerLogin)) {
      add(issues, `${path}.ownerLogin`, "must be a valid GitHub login");
    }
    checkString(entry.url, `${path}.url`, issues, { min: 1, max: 2048 });
    const expectedRepository = typeof entry.ownerLogin === "string" && typeof entry.name === "string"
      ? `${entry.ownerLogin}/${entry.name}`
      : null;
    checkGitHubRepositoryUrl(entry.url, expectedRepository, `${path}.url`, issues, typeof entry.name === "string" ? entry.name : null);
    checkString(entry.description, `${path}.description`, issues, { nullable: true, max: 10000 });
    checkCount(entry.stars, `${path}.stars`, issues);
    checkCount(entry.forks, `${path}.forks`, issues);
    checkString(entry.primaryLanguage, `${path}.primaryLanguage`, issues, { nullable: true, max: 100 });
    if (!Array.isArray(entry.topics) || entry.topics.some((topic) => typeof topic !== "string")) {
      add(issues, `${path}.topics`, "must be an array of strings");
    }
    if (entry.updatedAt !== null) checkIsoDate(entry.updatedAt, `${path}.updatedAt`, issues);
    if (entry.visibility !== "public") add(issues, `${path}.visibility`, "must be public");
  };
  const repositories = value.repositories;
  if (!Array.isArray(repositories)) add(issues, "repositories", "must be an array");
  else repositories.forEach((entry, index) => {
    checkRepository(entry, `repositories[${index}]`);
  });
  const publicRepositories = value.publicRepositories;
  if (!Array.isArray(publicRepositories)) add(issues, "publicRepositories", "must be an array");
  else publicRepositories.forEach((entry, index) => {
    checkRepository(entry, `publicRepositories[${index}]`);
  });
  if (Array.isArray(repositories) && Array.isArray(publicRepositories) && JSON.stringify(repositories) !== JSON.stringify(publicRepositories)) {
    add(issues, "publicRepositories", "must exactly match repositories");
  }

  if (!Array.isArray(value.recentPublicActivity)) add(issues, "recentPublicActivity", "must be an array");
  else value.recentPublicActivity.forEach((entry, index) => {
    const path = `recentPublicActivity[${index}]`;
    if (!isRecord(entry)) {
      add(issues, path, "must be an object");
      return;
    }
    checkAllowedKeys(entry, path, ["type", "occurredAt", "repositoryName", "repositoryUrl", "action"], issues);
    checkString(entry.type, `${path}.type`, issues, { min: 1, max: 100 });
    checkIsoDate(entry.occurredAt, `${path}.occurredAt`, issues);
    checkString(entry.repositoryName, `${path}.repositoryName`, issues, { min: 1, max: 300 });
    if (typeof entry.repositoryName === "string") {
      const segments = entry.repositoryName.split("/");
      if (segments.length !== 2 || !GITHUB_LOGIN_RE.test(segments[0] ?? "") || !GITHUB_REPOSITORY_NAME_RE.test(segments[1] ?? "")) {
        add(issues, `${path}.repositoryName`, "must be a canonical GitHub owner/repository name");
      }
    }
    checkString(entry.repositoryUrl, `${path}.repositoryUrl`, issues, { min: 1, max: 2048 });
    checkGitHubRepositoryUrl(
      entry.repositoryUrl,
      typeof entry.repositoryName === "string" ? entry.repositoryName : null,
      `${path}.repositoryUrl`,
      issues,
    );
    checkString(entry.action, `${path}.action`, issues, { nullable: true, max: 240 });
  });

  if (value.publicCommitSubjects !== undefined) {
    if (!Array.isArray(value.publicCommitSubjects)) add(issues, "publicCommitSubjects", "must be an array");
    else value.publicCommitSubjects.forEach((entry, index) => {
      const path = `publicCommitSubjects[${index}]`;
      if (!isRecord(entry)) {
        add(issues, path, "must be an object");
        return;
      }
      checkAllowedKeys(entry, path, ["date", "repositoryName", "repositoryUrl", "sha", "subject", "url"], issues);
      if (checkString(entry.date, `${path}.date`, issues, { min: 10, max: 10 }) && typeof entry.date === "string" && !ISO_DATE.test(entry.date)) {
        add(issues, `${path}.date`, "must be YYYY-MM-DD");
      }
      checkString(entry.repositoryName, `${path}.repositoryName`, issues, { min: 1, max: 300 });
      if (typeof entry.repositoryName === "string") {
        const segments = entry.repositoryName.split("/");
        if (segments.length !== 2 || !GITHUB_LOGIN_RE.test(segments[0] ?? "") || !GITHUB_REPOSITORY_NAME_RE.test(segments[1] ?? "")) {
          add(issues, `${path}.repositoryName`, "must be a canonical GitHub owner/repository name");
        }
      }
      checkString(entry.repositoryUrl, `${path}.repositoryUrl`, issues, { min: 1, max: 2048 });
      checkGitHubRepositoryUrl(
        entry.repositoryUrl,
        typeof entry.repositoryName === "string" ? entry.repositoryName : null,
        `${path}.repositoryUrl`,
        issues,
      );
      if (checkString(entry.sha, `${path}.sha`, issues, { min: 7, max: 40 }) && typeof entry.sha === "string" && !/^[a-f0-9]+$/i.test(entry.sha)) {
        add(issues, `${path}.sha`, "must be a hexadecimal commit SHA");
      }
      checkString(entry.subject, `${path}.subject`, issues, { min: 1, max: 240 });
      checkString(entry.url, `${path}.url`, issues, { min: 1, max: 2048 });
      if (typeof entry.url === "string" && typeof entry.repositoryUrl === "string" && typeof entry.sha === "string") {
        const expectedPrefix = `${entry.repositoryUrl.replace(/\/$/, "")}/commit/`;
        if (!entry.url.startsWith(expectedPrefix)) {
          add(issues, `${path}.url`, "must be a commit URL under the repository");
        }
      }
    });
  }

  if (value.publicMetrics !== undefined) {
    const metrics = value.publicMetrics;
    if (!isRecord(metrics)) add(issues, "publicMetrics", "must be an object");
    else {
      const countKeys = [
        "repositoriesMeasured",
        "stars",
        "forks",
        "publicGists",
        "recentCommits",
        "recentPushes",
        "recentPullRequests",
        "recentReviews",
        "recentIssues",
        "recentReleases",
      ];
      checkAllowedKeys(metrics, "publicMetrics", [
        ...countKeys,
        "indexedPublicCommits",
        "indexedPublicCommitsIncomplete",
        "recentWindowFrom",
        "recentWindowTo",
      ], issues);
      for (const key of countKeys) {
        checkCount(metrics[key], `publicMetrics.${key}`, issues);
      }
      if (metrics.indexedPublicCommits !== null) {
        checkCount(metrics.indexedPublicCommits, "publicMetrics.indexedPublicCommits", issues);
      }
      if (typeof metrics.indexedPublicCommitsIncomplete !== "boolean") {
        add(issues, "publicMetrics.indexedPublicCommitsIncomplete", "must be a boolean");
      }
      if (metrics.recentWindowFrom !== null) checkIsoDate(metrics.recentWindowFrom, "publicMetrics.recentWindowFrom", issues);
      if (metrics.recentWindowTo !== null) checkIsoDate(metrics.recentWindowTo, "publicMetrics.recentWindowTo", issues);
      if ((metrics.recentWindowFrom === null) !== (metrics.recentWindowTo === null)) {
        add(issues, "publicMetrics", "recent window dates must both be present or both be null");
      }
    }
  }

  if (value.profileLinks !== undefined) {
    if (!Array.isArray(value.profileLinks)) add(issues, "profileLinks", "must be an array");
    else {
      const seenLinks = new Set();
      value.profileLinks.forEach((entry, index) => {
        const path = `profileLinks[${index}]`;
        if (!isRecord(entry)) {
          add(issues, path, "must be an object");
          return;
        }
        checkAllowedKeys(entry, path, ["kind", "label", "provider", "url"], issues);
        if (entry.kind !== "sponsor" && entry.kind !== "social") add(issues, `${path}.kind`, "must be sponsor or social");
        checkString(entry.label, `${path}.label`, issues, { min: 1, max: 120 });
        checkString(entry.provider, `${path}.provider`, issues, { min: 1, max: 80 });
        if (checkString(entry.url, `${path}.url`, issues, { min: 1, max: 2048 }) && typeof entry.url === "string") {
          const url = parseHttpsUrl(entry.url, `${path}.url`, issues, { allowCustomPort: true });
          if (url) {
            const normalized = url.toString();
            if (seenLinks.has(normalized)) add(issues, `${path}.url`, "must be unique");
            seenLinks.add(normalized);
            if (entry.kind === "sponsor") {
              const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
              const githubSponsor = hostname === GITHUB_HOST && typeof profile === "object" && isRecord(profile) && typeof profile.login === "string"
                && isCanonicalGitHubUrlText(entry.url, `sponsors/${profile.login}`);
              const expectedProvider = githubSponsor ? "GitHub Sponsors" : SPONSOR_PROVIDERS.get(hostname);
              if (!expectedProvider) add(issues, `${path}.url`, "must use a verified sponsorship provider");
              else if (entry.provider !== expectedProvider) add(issues, `${path}.provider`, `must match ${expectedProvider} for this sponsorship URL`);
            }
          }
        }
      });
    }
  }

  if (value.privateAggregate !== undefined) {
    if (!isRecord(value.privateAggregate)) add(issues, "privateAggregate", "must be an object");
    else {
      checkAllowedKeys(value.privateAggregate, "privateAggregate", ["totalContributions", "commits", "pullRequests", "reviews", "issues"], issues);
      for (const key of ["totalContributions", "commits", "pullRequests", "reviews", "issues"]) {
        checkCount(value.privateAggregate[key], `privateAggregate.${key}`, issues);
      }
    }
  }

  const provenance = value.provenance;
  if (!isRecord(provenance)) add(issues, "provenance", "must be an object");
  else {
    checkAllowedKeys(provenance, "provenance", ["generatedAt", "source", "sourceMode", "githubApiVersion", "exporterVersion", "contributionCalendarSource"], issues);
    checkIsoDate(provenance.generatedAt, "provenance.generatedAt", issues);
    if (provenance.source !== "github" && provenance.source !== "sample") add(issues, "provenance.source", "must be github or sample");
    if (!SOURCE_MODES.includes(provenance.sourceMode)) add(issues, "provenance.sourceMode", "must be a valid source mode");
    checkString(provenance.githubApiVersion, "provenance.githubApiVersion", issues, { min: 1, max: 100 });
    checkString(provenance.exporterVersion, "provenance.exporterVersion", issues, { min: 1, max: 100 });
    if (!CALENDAR_VISIBILITY.includes(provenance.contributionCalendarSource)) add(issues, "provenance.contributionCalendarSource", "must be a valid calendar source");
    if (typeof value.generatedAt === "string" && typeof provenance.generatedAt === "string" && provenance.generatedAt !== value.generatedAt) {
      add(issues, "provenance.generatedAt", "must match generatedAt");
    }
  }

  const privacy = value.privacy;
  if (!isRecord(privacy)) add(issues, "privacy", "must be an object");
  else {
    checkAllowedKeys(privacy, "privacy", ["mode", "privateAggregateIncluded", "privateIdentifiersExcluded", "privateContentExcluded", "publicClaim", "contributionCalendarVisibility", "notes"], issues);
    if (!SOURCE_MODES.includes(privacy.mode)) add(issues, "privacy.mode", "must be a valid source mode");
    if (typeof privacy.privateAggregateIncluded !== "boolean") add(issues, "privacy.privateAggregateIncluded", "must be a boolean");
    if (privacy.privateIdentifiersExcluded !== true) add(issues, "privacy.privateIdentifiersExcluded", "must be true");
    if (privacy.privateContentExcluded !== true) add(issues, "privacy.privateContentExcluded", "must be true");
    if (typeof privacy.publicClaim !== "boolean") add(issues, "privacy.publicClaim", "must be a boolean");
    if (!CALENDAR_VISIBILITY.includes(privacy.contributionCalendarVisibility)) add(issues, "privacy.contributionCalendarVisibility", "must be a valid calendar visibility");
    if (!Array.isArray(privacy.notes) || privacy.notes.some((note) => typeof note !== "string")) add(issues, "privacy.notes", "must be an array of strings");
  }
  if (!Array.isArray(value.limitations) || value.limitations.some((note) => typeof note !== "string")) add(issues, "limitations", "must be an array of strings");

  const sourceMode = value.sourceMode;
  const contributionMode = isRecord(value.contributions) ? value.contributions.sourceMode : undefined;
  const provenanceMode = isRecord(value.provenance) ? value.provenance.sourceMode : undefined;
  const privacyMode = isRecord(value.privacy) ? value.privacy.mode : undefined;
  if (contributionMode !== sourceMode) add(issues, "contributions.sourceMode", "must match sourceMode");
  if (provenanceMode !== sourceMode) add(issues, "provenance.sourceMode", "must match sourceMode");
  if (privacyMode !== sourceMode) add(issues, "privacy.mode", "must match sourceMode");
  const calendarVisibility = isRecord(value.contributions) ? value.contributions.calendarVisibility : undefined;
  const provenanceCalendar = isRecord(value.provenance) ? value.provenance.contributionCalendarSource : undefined;
  const privacyCalendar = isRecord(value.privacy) ? value.privacy.contributionCalendarVisibility : undefined;
  if (provenanceCalendar !== calendarVisibility) add(issues, "provenance.contributionCalendarSource", "must match contributions.calendarVisibility");
  if (privacyCalendar !== calendarVisibility) add(issues, "privacy.contributionCalendarVisibility", "must match contributions.calendarVisibility");
  const hasPrivateAggregate = value.privateAggregate !== undefined;
  const privateAggregateIncluded = isRecord(value.privacy) ? value.privacy.privateAggregateIncluded : undefined;
  if (privateAggregateIncluded !== hasPrivateAggregate) add(issues, "privacy.privateAggregateIncluded", "must match presence of privateAggregate");
  if (sourceMode === "owner-anonymous" && !hasPrivateAggregate) add(issues, "privateAggregate", "is required for owner-anonymous snapshots");
  if (sourceMode !== "owner-anonymous" && hasPrivateAggregate) add(issues, "privateAggregate", "is only allowed for owner-anonymous snapshots");
  if (sourceMode === "sample" && isRecord(value.provenance) && value.provenance.source !== "sample") add(issues, "provenance.source", "must be sample for sample snapshots");
  if (sourceMode !== "sample" && isRecord(value.provenance) && value.provenance.source !== "github") add(issues, "provenance.source", "must be github for generated snapshots");
  const publicClaim = isRecord(value.privacy) ? value.privacy.publicClaim === true : false;
  const validCalendarCombination =
    (sourceMode === "owner-anonymous" && calendarVisibility === "authenticated-owner-view" && !publicClaim) ||
    (sourceMode === "sample" && calendarVisibility === "sample" && !publicClaim) ||
    (sourceMode === "public-profile" && (
      (calendarVisibility === "public-profile" && publicClaim) ||
      (calendarVisibility === "authenticated-owner-view" && !publicClaim) ||
      (calendarVisibility === "not-verified" && !publicClaim)
    ));
  if (!validCalendarCombination) add(issues, "privacy", "source/calendar/publicClaim combination is not allowed");
  const contributionValues = isRecord(value.contributions) ? value.contributions : {};
  const roleTotals = isRecord(value.roleTotals) ? value.roleTotals : {};
  const totals = isRecord(value.totals) ? value.totals : {};
  const ownerCalendarOmitted = sourceMode === "public-profile" && calendarVisibility === "authenticated-owner-view";
  const viewerIdentityUnknown = calendarVisibility === "not-verified";
  const roleTotalKey = {
    author: "commits",
    reviewer: "reviews",
    "issue-solver": "issues",
    maintainer: "pullRequests",
  };
  const seenRoles = new Set();
  if (Array.isArray(value.roles)) {
    value.roles.forEach((entry, index) => {
      if (!isRecord(entry) || !ROLES.includes(entry.role)) return;
      const role = entry.role;
      const rolePath = `roles[${index}]`;
      if (seenRoles.has(role)) add(issues, `${rolePath}.role`, "must not be duplicated");
      seenRoles.add(role);
      const totalKey = roleTotalKey[role];
      if (typeof entry.count === "number" && typeof roleTotals[totalKey] === "number" && entry.count !== roleTotals[totalKey]) {
        add(issues, `${rolePath}.count`, `must match roleTotals.${totalKey}`);
      }
      if ((ownerCalendarOmitted || viewerIdentityUnknown) && entry.count !== 0) {
        add(issues, `${rolePath}.count`, "must be 0 when the calendar is owner-view or not-verified");
      }
    });
    for (const role of ROLES) {
      if (!seenRoles.has(role)) add(issues, "roles", `must include ${role}`);
    }
  }
  if (ownerCalendarOmitted || viewerIdentityUnknown) {
    if (
      (Array.isArray(contributionValues.daily) && contributionValues.daily.length > 0) ||
      (Array.isArray(contributionValues.weekly) && contributionValues.weekly.length > 0) ||
      contributionValues.total !== 0 ||
      contributionValues.activeDays !== 0 ||
      ["commits", "pullRequests", "reviews", "issues", "total"].some((key) => roleTotals[key] !== 0 || totals[key] !== 0)
    ) {
      add(issues, "contributions", "sensitive aggregates must be empty when the calendar is owner-view or not-verified");
    }
  }

  if (isRecord(value.contributions)) {
    const daily = Array.isArray(value.contributions.daily) ? value.contributions.daily : [];
    const weekly = Array.isArray(value.contributions.weekly) ? value.contributions.weekly : [];
    const range = isRecord(value.contributions.range) ? value.contributions.range : {};
    const rangeFrom = typeof range.from === "string" && ISO_DATE.test(range.from.slice(0, 10)) ? range.from.slice(0, 10) : null;
    const rangeTo = typeof range.to === "string" && ISO_DATE.test(range.to.slice(0, 10)) ? range.to.slice(0, 10) : null;
    if (rangeFrom && rangeTo && rangeFrom > rangeTo) add(issues, "contributions.range.to", "must not precede contributions.range.from");

    const dailyByDate = new Map();
    for (const [index, entry] of daily.entries()) {
      if (!isRecord(entry) || typeof entry.date !== "string") continue;
      if (dailyByDate.has(entry.date)) add(issues, `contributions.daily[${index}].date`, "must be unique");
      else dailyByDate.set(entry.date, { entry, index });
      if (rangeFrom && rangeTo && (entry.date < rangeFrom || entry.date > rangeTo)) {
        add(issues, `contributions.daily[${index}].date`, "must fall within contributions.range");
      }
    }

    const weeklyDates = new Set();
    const weeklyLabels = new Set();
    const weeklyRanges = [];
    for (const [weekIndex, entry] of weekly.entries()) {
      if (!isRecord(entry)) continue;
      const weekPath = `contributions.weekly[${weekIndex}]`;
      const weekLabel = typeof entry.week === "string" && ISO_DATE.test(entry.week) ? entry.week : null;
      const startDate = typeof entry.startDate === "string" && ISO_DATE.test(entry.startDate) ? entry.startDate : null;
      const endDate = typeof entry.endDate === "string" && ISO_DATE.test(entry.endDate) ? entry.endDate : null;
      if (weekLabel) {
        if (weeklyLabels.has(weekLabel)) add(issues, `${weekPath}.week`, "must be unique");
        weeklyLabels.add(weekLabel);
      }
      if (startDate && endDate && startDate > endDate) add(issues, `${weekPath}.endDate`, "must not precede startDate");
      if (weekLabel && startDate && weekLabel !== startDate) add(issues, `${weekPath}.week`, "must match startDate");
      if (startDate && endDate && startDate <= endDate) {
        const durationDays = Math.round((Date.parse(`${endDate}T00:00:00.000Z`) - Date.parse(`${startDate}T00:00:00.000Z`)) / 86_400_000) + 1;
        if (durationDays > 7) add(issues, `${weekPath}.endDate`, "must be no more than seven days after startDate");
        if (rangeFrom && rangeTo && (startDate < rangeFrom || startDate > rangeTo)) add(issues, `${weekPath}.startDate`, "must fall within contributions.range");
        if (rangeFrom && rangeTo && (endDate < rangeFrom || endDate > rangeTo)) add(issues, `${weekPath}.endDate`, "must fall within contributions.range");
        if (weeklyRanges.some((rangeEntry) => startDate <= rangeEntry.end && endDate >= rangeEntry.start)) {
          add(issues, `${weekPath}.startDate`, "must not overlap another weekly range");
        }
        weeklyRanges.push({ start: startDate, end: endDate });
      }
      const days = Array.isArray(entry.days) ? entry.days : [];
      let calculatedWeekTotal = 0;
      for (const [dayIndex, day] of days.entries()) {
        if (!isRecord(day) || typeof day.date !== "string") continue;
        const dayPath = `${weekPath}.days[${dayIndex}]`;
        if (weeklyDates.has(day.date)) add(issues, `${dayPath}.date`, "must be unique across weekly groups");
        weeklyDates.add(day.date);
        if (startDate && endDate && (day.date < startDate || day.date > endDate)) add(issues, `${dayPath}.date`, "must fall within its weekly range");
        if (typeof day.count === "number" && Number.isFinite(day.count)) calculatedWeekTotal += day.count;
        const matchingDaily = dailyByDate.get(day.date);
        if (!matchingDaily) {
          add(issues, `${dayPath}.date`, "must have a matching contributions.daily entry");
        } else {
          if (day.count !== matchingDaily.entry.count) add(issues, `${dayPath}.count`, "must match contributions.daily");
          if (day.level !== matchingDaily.entry.level) add(issues, `${dayPath}.level`, "must match contributions.daily");
        }
      }
      if (typeof entry.total === "number" && entry.total !== calculatedWeekTotal) {
        add(issues, `${weekPath}.total`, "must equal the sum of weekly days");
      }
    }
    for (const [date, dailyEntry] of dailyByDate) {
      if (!weeklyDates.has(date)) add(issues, `contributions.daily[${dailyEntry.index}].date`, "must appear in contributions.weekly");
    }
    const dailyTotal = daily.reduce((sum, entry) => sum + (isRecord(entry) && typeof entry.count === "number" && Number.isFinite(entry.count) ? entry.count : 0), 0);
    const activeDays = daily.filter((entry) => isRecord(entry) && typeof entry.count === "number" && entry.count > 0).length;
    if (typeof value.contributions.total === "number" && value.contributions.total !== dailyTotal) {
      add(issues, "contributions.total", "must equal the sum of contributions.daily");
    }
    if (typeof value.contributions.activeDays === "number" && value.contributions.activeDays !== activeDays) {
      add(issues, "contributions.activeDays", "must equal the number of active daily entries");
    }
  }

  const roleKeys = ["commits", "pullRequests", "reviews", "issues"];
  if (isRecord(value.roleTotals)) {
    const validatedRoleTotals = value.roleTotals;
    const calculatedRoleTotal = roleKeys.reduce((sum, key) => sum + (typeof validatedRoleTotals[key] === "number" ? validatedRoleTotals[key] : 0), 0);
    if (typeof validatedRoleTotals.total === "number" && validatedRoleTotals.total !== calculatedRoleTotal) {
      add(issues, "roleTotals.total", "must equal the sum of role counts");
    }
  }
  if (isRecord(value.roleTotals) && isRecord(value.totals)) {
    for (const key of [...roleKeys, "total"]) {
      if (typeof value.roleTotals[key] === "number" && typeof value.totals[key] === "number" && value.totals[key] !== value.roleTotals[key]) {
        add(issues, `totals.${key}`, `must match roleTotals.${key}`);
      }
    }
  }
  if (isRecord(value.privateAggregate) && isRecord(value.roleTotals) && isRecord(value.contributions)) {
    for (const key of roleKeys) {
      if (typeof value.privateAggregate[key] === "number" && typeof value.roleTotals[key] === "number" && value.privateAggregate[key] !== value.roleTotals[key]) {
        add(issues, `privateAggregate.${key}`, `must match roleTotals.${key}`);
      }
    }
    if (typeof value.privateAggregate.totalContributions === "number" && typeof value.contributions.total === "number" && value.privateAggregate.totalContributions !== value.contributions.total) {
      add(issues, "privateAggregate.totalContributions", "must match contributions.total");
    }
  }

  checkNoForbiddenKeys(value, "", issues);
  if (issues.length > 0) throw new ProfileSnapshotValidationError(issues);
  return value;
}

