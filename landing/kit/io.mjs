// Engine IO seam. No `node:` static imports — Node uses process.getBuiltinModule.
// Studio injects a virtual file map through configureEngine({ files }).

export function posixPath(path) {
  return String(path).replaceAll("\\", "/");
}

export function posixJoin(...parts) {
  return parts.filter((part) => part !== undefined && part !== null && part !== "").join("/").replaceAll("\\", "/").replace(/\/+/g, "/");
}

export function posixDirname(path) {
  const posix = posixPath(path).replace(/\/+$/, "");
  const at = posix.lastIndexOf("/");
  return at <= 0 ? posix : posix.slice(0, at);
}

export function posixIsAbsolute(path) {
  return /^(?:[a-zA-Z]:)?[\\/]/.test(String(path));
}

export function fileUrlToPath(url) {
  if (typeof process !== "undefined" && typeof process.getBuiltinModule === "function") {
    try {
      return process.getBuiltinModule("node:url").fileURLToPath(url);
    } catch {}
  }
  const parsed = new URL(String(url));
  let path = decodeURIComponent(parsed.pathname);
  if (/^\/[A-Za-z]:/.test(path)) path = path.slice(1);
  return path;
}

export function lookupVirtualFile(files, path) {
  if (!files) return undefined;
  const posix = posixPath(path);
  if (Object.prototype.hasOwnProperty.call(files, posix)) return files[posix];
  const kitAt = posix.lastIndexOf("/kit/");
  if (kitAt >= 0) {
    const rel = posix.slice(kitAt + 1);
    if (Object.prototype.hasOwnProperty.call(files, rel)) return files[rel];
  }
  if (posix.startsWith("kit/") && Object.prototype.hasOwnProperty.call(files, posix)) {
    return files[posix];
  }
  return undefined;
}

export function createVirtualIo(files = {}) {
  return {
    readFileSync(path) {
      const virtual = lookupVirtualFile(files, path);
      if (virtual !== undefined) return virtual;
      throw new Error("browser engine needs configureEngine(): " + path);
    },
    existsSync(path) {
      return lookupVirtualFile(files, path) !== undefined;
    },
    mkdirSync() {},
    writeFileSync() {},
    copyFileSync() {},
    cpSync() {},
    execFileSync() {
      return "";
    },
    spawnSync() {
      return { status: 1, stdout: "", stderr: "" };
    },
    dirname: posixDirname,
    join: posixJoin,
    resolve: posixJoin,
    isAbsolute: posixIsAbsolute,
    fileURLToPath: fileUrlToPath,
  };
}

export function createNodeIo() {
  if (typeof process === "undefined" || typeof process.getBuiltinModule !== "function") {
    return null;
  }
  const fs = process.getBuiltinModule("node:fs");
  const path = process.getBuiltinModule("node:path");
  const child = process.getBuiltinModule("node:child_process");
  const url = process.getBuiltinModule("node:url");
  return {
    copyFileSync: fs.copyFileSync,
    cpSync: fs.cpSync,
    existsSync: fs.existsSync,
    mkdirSync: fs.mkdirSync,
    readFileSync: fs.readFileSync,
    writeFileSync: fs.writeFileSync,
    execFileSync: child.execFileSync,
    spawnSync: child.spawnSync,
    dirname: path.dirname,
    join: path.join,
    resolve: path.resolve,
    isAbsolute: path.isAbsolute,
    fileURLToPath: url.fileURLToPath,
  };
}

export function resolveEngineIo(options = {}) {
  if (options.io) return options.io;
  if (options.files) return createVirtualIo(options.files);
  return createNodeIo() ?? createVirtualIo({});
}
