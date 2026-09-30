import { effect, frame, init, surface } from "vgpu";
import { DEFAULT_SHADE, resolveShadeId, SHADE_IDS } from "./shade-variants.js";
import { createGlBackend } from "./shade-webgl.js";
import shadeCommon from "./shade-common.wgsl";
import shadeCommonGlsl from "./shade-common.glsl";
import flowWgsl from "./shades/flow.wgsl";
import grainWgsl from "./shades/grain.wgsl";
import liquidWgsl from "./shades/liquid.wgsl";
import mistWgsl from "./shades/mist.wgsl";
import speckleWgsl from "./shades/speckle.wgsl";
import veilWgsl from "./shades/veil.wgsl";
import flowGlsl from "./shades/flow.glsl";
import grainGlsl from "./shades/grain.glsl";
import liquidGlsl from "./shades/liquid.glsl";
import mistGlsl from "./shades/mist.glsl";
import speckleGlsl from "./shades/speckle.glsl";
import veilGlsl from "./shades/veil.glsl";

const BODIES = {
  mist: mistWgsl,
  grain: grainWgsl,
  veil: veilWgsl,
  liquid: liquidWgsl,
  flow: flowWgsl,
  speckle: speckleWgsl,
};

const GLSL_BODIES = {
  mist: mistGlsl,
  grain: grainGlsl,
  veil: veilGlsl,
  liquid: liquidGlsl,
  flow: flowGlsl,
  speckle: speckleGlsl,
};

export const SHADE_SOURCES = Object.fromEntries(
  SHADE_IDS.map((id) => [id, `${shadeCommon}\n${BODIES[id]}`]),
);

export const SHADE_GLSL = Object.fromEntries(
  SHADE_IDS.map((id) => [id, `${shadeCommonGlsl}\n${GLSL_BODIES[id]}`]),
);

export const SHADE_WGSL = SHADE_SOURCES[DEFAULT_SHADE];

let gpuPromise = null;

function getGpu() {
  if (typeof navigator === "undefined" || !navigator.gpu) return Promise.resolve(null);
  if (!gpuPromise) {
    gpuPromise = init({ powerPreference: "low-power" }).catch((error) => {
      gpuPromise = null;
      throw error;
    });
  }
  return gpuPromise;
}

export function parseCssColor(value) {
  const v = String(value || "").trim();
  const hex = /^#([0-9a-f]{3,8})$/i.exec(v);
  if (hex) {
    let h = hex[1];
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join("");
    return [
      parseInt(h.slice(0, 2), 16) / 255,
      parseInt(h.slice(2, 4), 16) / 255,
      parseInt(h.slice(4, 6), 16) / 255,
    ];
  }
  const probe = document.createElement("span");
  probe.style.color = v || "#111111";
  document.documentElement.appendChild(probe);
  const computed = getComputedStyle(probe).color;
  probe.remove();
  const parts = computed.match(/[\d.]+/g);
  if (parts && parts.length >= 3) {
    const scale = computed.startsWith("rgb") || Number(parts[0]) > 1 ? 255 : 1;
    return [Number(parts[0]) / scale, Number(parts[1]) / scale, Number(parts[2]) / scale];
  }
  return [0.067, 0.067, 0.067];
}

function readTheme(theme) {
  if (typeof theme === "function") return theme() === "light" ? 1 : 0;
  if (theme === "light" || theme === "dark") return theme === "light" ? 1 : 0;
  return document.documentElement.getAttribute("data-theme") === "light" ? 1 : 0;
}

function cssToken(hostStyle, root, names) {
  for (const name of names) {
    const value = hostStyle.getPropertyValue(name).trim() || root.getPropertyValue(name).trim();
    if (value) return parseCssColor(value);
  }
  return [0.067, 0.067, 0.067];
}

function readShadeId(host, options = {}) {
  return resolveShadeId(
    options.variant ?? host.getAttribute("data-shade") ?? document.documentElement.getAttribute("data-shade"),
  );
}

function clamp01(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

function clampSpeed(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 1;
  return Math.min(4, Math.max(0.15, n));
}

function readControl(host, attr, fallback) {
  const raw = host.getAttribute(attr) ?? document.documentElement.getAttribute(attr);
  if (raw == null || raw === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

function makeCanvas(variant) {
  const canvas = document.createElement("canvas");
  canvas.className = "hero-icon__shade";
  canvas.setAttribute("aria-hidden", "true");
  canvas.dataset.shade = variant;
  return canvas;
}

async function createGpuBackend(canvas, { gpu, variant, params }) {
  const canvasSurface = surface(gpu, canvas, {
    dpr: [1, 2],
    alphaMode: "premultiplied",
    clearColor: [0, 0, 0, 0],
    label: "hero-shade",
  });
  let shade = null;
  const bag = { ...params, resolution: canvasSurface.size };

  async function compile(id) {
    const next = effect(gpu, SHADE_SOURCES[id], {
      label: `hero-shade-${id}`,
      set: { params: bag },
    });
    await next.compile({ colors: [canvasSurface.format] });
    return next;
  }

  try {
    shade = await compile(variant);
  } catch (error) {
    canvasSurface.dispose();
    throw error;
  }

  const unsubResize = canvasSurface.onResize(() => {
    bag.resolution = canvasSurface.size;
    shade?.set({ params: { resolution: canvasSurface.size } });
  });

  return {
    kind: "webgpu",
    set(next = {}) {
      Object.assign(bag, next);
      shade?.set({ params: next });
    },
    async setVariant(id) {
      shade = await compile(id);
      shade.set({ params: bag });
    },
    draw() {
      if (gpu.disposed || !shade) return;
      bag.resolution = canvasSurface.size;
      shade.set({ params: bag });
      frame(gpu, (current) => current.pass(canvasSurface, shade));
    },
    dispose() {
      unsubResize();
      canvasSurface.dispose();
    },
    size() {
      return canvasSurface.size;
    },
  };
}

export async function mountHeroShade(host, options = {}) {
  let hostEl = host;
  const tintEl = host.querySelector(".github-stats__icon");
  const tintMix = Number(options.tint);
  let accentTint = clamp01(Number.isFinite(tintMix) ? tintMix : 0);
  const seed = Math.random() * 97 + 3;
  const timeShift = Math.random() * 180;
  let alpha = tintEl ? 0.48 : 1;
  const reduced = Boolean(options.reduced);
  let variant = readShadeId(host, options);

  let canvas = makeCanvas(variant);
  host.prepend(canvas);

  function fail(step, error) {
    canvas.remove();
    if (typeof console !== "undefined") console.error(`[hero-shade] ${step}`, error);
    return null;
  }

  function colors() {
    const root = getComputedStyle(document.documentElement);
    const hostStyle = getComputedStyle(hostEl);
    const accent = tintEl
      ? parseCssColor(getComputedStyle(tintEl).color)
      : cssToken(hostStyle, root, ["--accent-6", "--accent"]);
    return {
      paper: cssToken(hostStyle, root, ["--paper"]),
      surface: cssToken(hostStyle, root, ["--surface"]),
      ink: cssToken(hostStyle, root, ["--ink"]),
      muted: cssToken(hostStyle, root, ["--muted"]),
      accent,
      light: readTheme(options.theme),
    };
  }

  let palette = colors();
  const animate = !reduced;
  let raf = 0;
  let running = false;
  let visible = false;
  let pageHidden = document.hidden;
  let timeScale = 1;
  let lastTick = performance.now();
  let simTime = timeShift;
  let warp = 0;
  let spread = 0.5;
  let contrast = 1;
  let detail = 0.5;
  const storm = { warp: 0, speed: 1 };
  let backend = null;

  function applyMotionFromDom() {
    accentTint = clamp01(readControl(hostEl, "data-shade-tint", accentTint));
    warp = clamp01(readControl(hostEl, "data-shade-warp", warp));
    timeScale = clampSpeed(readControl(hostEl, "data-shade-speed", timeScale));
    alpha = clamp01(readControl(hostEl, "data-shade-alpha", alpha));
    spread = clamp01(readControl(hostEl, "data-shade-spread", spread));
    contrast = clamp01(readControl(hostEl, "data-shade-contrast", contrast));
    detail = clamp01(readControl(hostEl, "data-shade-detail", detail));
    backend?.set(paramsBag());
    canvas.dataset.shadeWarp = String(Math.round(warp * 100) / 100);
    canvas.dataset.shadeSpeed = String(Math.round(timeScale * 100) / 100);
    canvas.dataset.shadeTint = String(Math.round(accentTint * 100) / 100);
    canvas.dataset.shadeAlpha = String(Math.round(alpha * 100) / 100);
  }

  function paramsBag(extra = {}) {
    return {
      time: animate ? simTime : 0,
      light: palette.light,
      seed,
      alpha,
      warp,
      tint: accentTint,
      spread,
      contrast,
      detail,
      pad0: 0,
      paper: palette.paper,
      surface: palette.surface,
      ink: palette.ink,
      muted: palette.muted,
      accent: palette.accent,
      ...extra,
    };
  }

  applyMotionFromDom();

  try {
    const gpu = await getGpu();
    if (!gpu) throw new Error("WebGPU adapter unavailable");
    backend = await createGpuBackend(canvas, {
      gpu,
      variant,
      params: paramsBag(),
    });
    canvas.dataset.shadeBackend = "webgpu";
  } catch (gpuError) {
    const fresh = makeCanvas(variant);
    canvas.replaceWith(fresh);
    canvas = fresh;
    try {
      backend = createGlBackend(canvas, {
        source: SHADE_GLSL[variant],
        params: paramsBag(),
      });
      canvas.dataset.shadeBackend = "webgl";
    } catch (glError) {
      return fail("init", glError || gpuError);
    }
  }

  applyMotionFromDom();

  function draw(now) {
    if (!backend) return;
    const dt = Math.max(0, Math.min(0.05, (now - lastTick) * 0.001));
    lastTick = now;
    if (animate) simTime += dt * timeScale;
    backend.set(paramsBag());
    backend.draw();
  }

  function tick(now) {
    raf = 0;
    if (!running) return;
    draw(now);
    raf = window.requestAnimationFrame(tick);
  }

  function setRunning(on) {
    if (on === running) return;
    running = on;
    if (on) {
      lastTick = performance.now();
      if (!raf) raf = window.requestAnimationFrame(tick);
    } else if (raf) {
      window.cancelAnimationFrame(raf);
      raf = 0;
    }
  }

  function evaluate() {
    const on = visible && !pageHidden && animate;
    setRunning(on);
    if (!on) draw(performance.now());
  }

  const io =
    typeof IntersectionObserver === "function"
      ? new IntersectionObserver((entries) => {
          visible = entries.some((entry) => entry.isIntersecting);
          evaluate();
        })
      : null;
  if (io) io.observe(hostEl);
  else visible = true;

  const ro =
    typeof ResizeObserver === "function"
      ? new ResizeObserver(() => {
          if (!running) draw(performance.now());
        })
      : null;
  if (ro) ro.observe(hostEl);

  const onVis = () => {
    pageHidden = document.hidden;
    evaluate();
  };
  document.addEventListener("visibilitychange", onVis);

  const themeWatch =
    typeof MutationObserver === "function"
      ? new MutationObserver((records) => {
          const attrs = new Set(records.map((record) => record.attributeName).filter(Boolean));
          const next = readShadeId(hostEl, options);
          if (next !== variant) {
            variant = next;
            canvas.dataset.shade = variant;
            Promise.resolve(backend.setVariant(backend.kind === "webgl" ? SHADE_GLSL[variant] : variant))
              .then(() => evaluate())
              .catch((error) => {
                if (typeof console !== "undefined") console.error("[hero-shade] variant", error);
              });
            return;
          }
          if (
            attrs.has("data-shade-tint") ||
            attrs.has("data-shade-warp") ||
            attrs.has("data-shade-speed") ||
            attrs.has("data-shade-alpha") ||
            attrs.has("data-shade-spread") ||
            attrs.has("data-shade-contrast") ||
            attrs.has("data-shade-detail")
          ) {
            applyMotionFromDom();
          }
          if (
            attrs.has("data-theme") ||
            attrs.has("style") ||
            attrs.has("data-accent-tinted") ||
            attrs.size === 0
          ) {
            palette = colors();
            backend.set({
              light: palette.light,
              paper: palette.paper,
              surface: palette.surface,
              ink: palette.ink,
              muted: palette.muted,
              accent: palette.accent,
              tint: accentTint,
            });
          }
          if (!running) draw(performance.now());
        })
      : null;
  if (themeWatch) {
    themeWatch.observe(document.documentElement, {
      attributes: true,
      attributeFilter: [
        "data-theme",
        "data-shade",
        "style",
        "data-accent-tinted",
        "data-shade-tint",
        "data-shade-warp",
        "data-shade-speed",
        "data-shade-alpha",
        "data-shade-spread",
        "data-shade-contrast",
        "data-shade-detail",
      ],
    });
    themeWatch.observe(hostEl, {
      attributes: true,
      attributeFilter: [
        "data-shade",
        "data-shade-tint",
        "data-shade-warp",
        "data-shade-speed",
        "data-shade-alpha",
        "data-shade-spread",
        "data-shade-contrast",
        "data-shade-detail",
      ],
    });
  }

  hostEl.classList.add("hero-icon--shaded");
  evaluate();

  function restStorm() {
    storm.warp = 0;
    storm.speed = 1;
    warp = 0;
    timeScale = 1;
    canvas.dataset.shadeWarp = "0";
    canvas.dataset.shadeSpeed = "1";
  }

  function applyStorm() {
    warp = storm.warp;
    timeScale = storm.speed;
    canvas.dataset.shadeWarp = String(Math.round(warp * 100) / 100);
    canvas.dataset.shadeSpeed = String(Math.round(timeScale * 100) / 100);
  }

  const api = {
    stir(unit) {
      if (!animate) {
        restStorm();
        return;
      }
      const t = Math.min(1, Math.max(0, Number(unit) || 0));
      const k = t >= 1 ? 0 : Math.cos(t * Math.PI * 0.5);
      storm.warp = k;
      storm.speed = 1 + 11 * k;
      applyStorm();
    },
    configure(next = {}) {
      if ("tint" in next) accentTint = clamp01(next.tint);
      if ("warp" in next) warp = clamp01(next.warp);
      if ("speed" in next) timeScale = clampSpeed(next.speed);
      if ("alpha" in next) alpha = clamp01(next.alpha);
      if ("spread" in next) spread = clamp01(next.spread);
      if ("contrast" in next) contrast = clamp01(next.contrast);
      if ("detail" in next) detail = clamp01(next.detail);
      palette = colors();
      backend.set(paramsBag());
      canvas.dataset.shadeWarp = String(Math.round(warp * 100) / 100);
      canvas.dataset.shadeSpeed = String(Math.round(timeScale * 100) / 100);
      canvas.dataset.shadeTint = String(Math.round(accentTint * 100) / 100);
      canvas.dataset.shadeAlpha = String(Math.round(alpha * 100) / 100);
      draw(performance.now());
    },
    sync() {
      palette = colors();
      backend.set(paramsBag());
      draw(performance.now());
    },
    attach(next) {
      if (!next || next === hostEl) {
        this.sync();
        return;
      }
      hostEl.classList.remove("hero-icon--shaded");
      if (io) io.unobserve(hostEl);
      if (ro) ro.unobserve(hostEl);
      hostEl = next;
      next.prepend(canvas);
      next.classList.add("hero-icon--shaded");
      if (io) io.observe(next);
      if (ro) ro.observe(next);
      if (themeWatch) themeWatch.observe(next, { attributes: true, attributeFilter: ["data-shade"] });
      palette = colors();
      this.sync();
      evaluate();
    },
    dispose() {
      setRunning(false);
      document.removeEventListener("visibilitychange", onVis);
      if (themeWatch) themeWatch.disconnect();
      if (io) io.disconnect();
      if (ro) ro.disconnect();
      hostEl.classList.remove("hero-icon--shaded");
      if (hostEl.__gvasteShade === api) hostEl.__gvasteShade = null;
      backend.dispose();
      canvas.remove();
    },
  };

  hostEl.__gvasteShade = api;
  hostEl.dispatchEvent(new CustomEvent("gvaste-shade-ready", { bubbles: true }));
  return api;
}
