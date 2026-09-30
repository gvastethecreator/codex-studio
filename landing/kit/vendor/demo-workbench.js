import {
  highlightLines,
  buildPreviewDocument,
} from "./highlight.mjs";

(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const KNOB_PROPS = new Set([
    "border-radius",
    "padding",
    "padding-inline",
    "padding-block",
    "font-size",
    "min-height",
    "gap",
    "letter-spacing",
  ]);

  function motion() {
    return window.gsap && !reduced ? window.gsap : null;
  }

  function themeName() {
    return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  }

  function modeEnabled(panel, mode) {
    if (!panel) return false;
    const hasPreview = panel.classList.contains("has-preview");
    const hasSource = panel.classList.contains("has-source");
    const live = panel.classList.contains("is-live");
    if (mode === "preview") return hasPreview || hasSource;
    if (mode === "source" || mode === "prompt") return hasSource;
    if (mode === "split") return hasPreview && hasSource;
    if (mode === "compare") return live && hasPreview;
    if (mode === "playground") return live;
    return true;
  }

  function knobsFromCode(code) {
    const styleMatch = String(code).match(/<style[^>]*>([\s\S]*?)<\/style>/i);
    const css = styleMatch ? styleMatch[1] : "";
    const block = css.match(/([.#][\w-]+(?:\s*,\s*[.#][\w-]+)*)\s*\{([^}]+)\}/);
    if (!block) return [];
    const selector = block[1].trim().split(",")[0].trim();
    const knobs = [];
    for (const line of block[2].split(";")) {
      const match = line.match(/^\s*([\w-]+)\s*:\s*([-+]?\d*\.?\d+)(px|rem|em|%)?\s*$/);
      const padXY = line.match(/^\s*padding\s*:\s*\S+\s+([-+]?\d*\.?\d+)(px|rem|em)\s*$/);
      if (padXY) {
        const num = Number(padXY[1]);
        if (Number.isFinite(num)) {
          knobs.push({
            prop: "padding-inline",
            selector,
            unit: padXY[2],
            origin: num,
            min: 0,
            max: Math.max(num * 2.2, num + 16, 8),
            step: padXY[2] === "px" ? 1 : 0.01,
          });
        }
        continue;
      }
      if (!match || !KNOB_PROPS.has(match[1])) continue;
      const num = Number(match[2]);
      if (!Number.isFinite(num)) continue;
      const unit = match[3] || "px";
      knobs.push({
        prop: match[1],
        selector,
        unit,
        origin: num,
        min: 0,
        max: unit === "%" ? Math.max(100, Math.round(num * 1.4)) : Math.max(num * 2.2, num + 16, 8),
        step: unit === "px" ? 1 : 0.01,
      });
    }
    return knobs.slice(0, 5);
  }

  function formatKnob(value, unit) {
    if (unit === "px") return `${Math.round(Number(value))}px`;
    const num = Number(value);
    return `${Number.isInteger(num) ? num : num.toFixed(2)}${unit}`;
  }

  function bindRails(shell) {
    if (!shell) return () => {};
    const yRail = shell.querySelector("[data-demo-rail]");
    const xRail = shell.querySelector("[data-demo-rail-x]");
    const scroller =
      shell.querySelector(".demo-input") ||
      shell.querySelector("[data-demo-scroll]");
    if (!scroller) return () => {};

    const syncOverflow = () => {
      const view = scroller.clientHeight;
      if (view <= 0) return;
      const max = scroller.scrollHeight - view;
      scroller.classList.toggle("is-overflow-top", scroller.scrollTop > 4);
      scroller.classList.toggle("is-overflow-bottom", max > 4 && scroller.scrollTop < max - 4);
    };

    const syncRail = (rail, axis) => {
      if (!rail) return;
      const thumb = rail.querySelector(".demo-scroll__thumb");
      if (!thumb) return;
      const view = axis === "y" ? scroller.clientHeight : scroller.clientWidth;
      const total = axis === "y" ? scroller.scrollHeight : scroller.scrollWidth;
      const max = total - view;
      if (view <= 0 || max <= 4) {
        rail.classList.remove("is-needed");
        return;
      }
      rail.classList.add("is-needed");
      const ratio = view / total;
      const offset = axis === "y" ? scroller.scrollTop : scroller.scrollLeft;
      const span = axis === "y" ? rail.clientHeight : rail.clientWidth;
      const size = Math.max(24, span * ratio);
      const travel = Math.max(0, span - size);
      const pos = max > 0 ? (offset / max) * travel : 0;
      if (axis === "y") {
        thumb.style.height = `${size}px`;
        thumb.style.transform = `translateY(${pos}px)`;
      } else {
        thumb.style.width = `${size}px`;
        thumb.style.transform = `translateX(${pos}px)`;
      }
    };

    const sync = () => {
      syncOverflow();
      syncRail(yRail, "y");
      syncRail(xRail, "x");
    };

    scroller.addEventListener("scroll", sync, { passive: true });
    if (typeof ResizeObserver === "function") {
      const observer = new ResizeObserver(sync);
      observer.observe(scroller);
      observer.observe(shell);
    }
    sync();
    return sync;
  }

  function applyPlay(panel) {
    const frame = panel.querySelector(".demo-preview__frame");
    const doc = frame && frame.contentDocument;
    if (!doc || !doc.head) return;
    let tag = doc.getElementById("demo-knobs");
    if (!tag) {
      tag = doc.createElement("style");
      tag.id = "demo-knobs";
      doc.head.appendChild(tag);
    }
    const scale = Number(panel.querySelector("[data-knob='scale']")?.value || 100) / 100;
    const rules = [`body{transform:scale(${scale});transform-origin:center center}`];
    panel.querySelectorAll("[data-knob-prop]").forEach((input) => {
      const prop = input.getAttribute("data-knob-prop");
      const selector = input.getAttribute("data-knob-selector");
      const unit = input.getAttribute("data-knob-unit") || "px";
      if (!prop || !selector) return;
      rules.push(`${selector}{${prop}:${input.value}${unit} !important}`);
    });
    tag.textContent = rules.join("");
  }

  function mountKnobs(panel) {
    const host = panel.querySelector("[data-demo-knobs]");
    const source = panel.querySelector(".demo-input");
    if (!host) return;
    const knobs = knobsFromCode(source ? source.value : "");
    host.replaceChildren();
    knobs.forEach((knob) => {
      const row = document.createElement("label");
      row.className = "demo-play__row";
      const name = document.createElement("span");
      name.textContent = knob.prop.replace(/-/g, " ");
      const input = document.createElement("input");
      input.type = "range";
      input.min = String(knob.min);
      input.max = String(Math.round(knob.max * 100) / 100);
      input.step = String(knob.step);
      input.value = String(knob.origin);
      input.setAttribute("data-knob-prop", knob.prop);
      input.setAttribute("data-knob-selector", knob.selector);
      input.setAttribute("data-knob-unit", knob.unit);
      input.setAttribute("data-knob-origin", String(knob.origin));
      const output = document.createElement("output");
      output.textContent = formatKnob(knob.origin, knob.unit);
      input.addEventListener("input", () => {
        output.textContent = formatKnob(input.value, knob.unit);
        applyPlay(panel);
      });
      row.append(name, input, output);
      host.append(row);
    });
  }

  function bindPanel(panel) {
    const source = panel.querySelector(".demo-input");
    const code = panel.querySelector(".demo-code code");
    const frame = panel.querySelector(".demo-preview__frame");
    const originHost = panel.querySelector(".demo-preview__origin");
    const originFrame = originHost?.querySelector("iframe") || (originHost?.tagName === "IFRAME" ? originHost : null);
    const lang = panel.getAttribute("data-lang") || "text";
    const kind = panel.getAttribute("data-preview-kind") || "";
    const cssNode = panel.querySelector("[data-demo-css]");
    const css = cssNode ? cssNode.textContent : "";
    const previewNode = panel.querySelector("[data-demo-preview]");
    const lockedPreview = previewNode ? previewNode.textContent : "";
    const live = kind === "live";
    const originalCode = source ? source.value : "";
    let lastScrollWidth = 0;
    const rails = [];
    panel.querySelectorAll(".demo-scroll-shell").forEach((shell) => rails.push(bindRails(shell)));

    const syncScroll = () => {
      const pre = panel.querySelector(".demo-code");
      if (!pre || !source) return;
      const maxX = Math.max(0, source.scrollWidth - source.clientWidth);
      const maxY = Math.max(0, source.scrollHeight - source.clientHeight);
      if (source.scrollLeft > maxX) source.scrollLeft = maxX;
      if (source.scrollTop > maxY) source.scrollTop = maxY;
      pre.scrollTop = source.scrollTop;
      pre.scrollLeft = source.scrollLeft;
      rails.forEach((sync) => sync());
    };

    const paint = () => {
      const value = source ? source.value : "";
      if (code && source) code.innerHTML = highlightLines(value, lang);
      const promptCode = panel.querySelector(".demo-prompt__code code");
      if (promptCode) promptCode.innerHTML = highlightLines(originalCode, lang);
      if (live) {
        const theme = themeName();
        if (frame) {
          const doc = buildPreviewDocument({
            code: source ? source.value : "",
            lang,
            preview: lockedPreview || undefined,
            css,
            theme,
          });
          if (frame.getAttribute("srcdoc") !== doc) frame.setAttribute("srcdoc", doc);
        }
        if (originFrame) {
          const frozen = buildPreviewDocument({
            code: originalCode,
            lang,
            preview: lockedPreview || undefined,
            css,
            theme,
          });
          if (originFrame.getAttribute("srcdoc") !== frozen) originFrame.setAttribute("srcdoc", frozen);
        }
      }
      if (source) {
        if (lastScrollWidth && source.scrollWidth < lastScrollWidth * 0.7) {
          source.scrollLeft = 0;
          source.scrollTop = 0;
        }
        lastScrollWidth = source.scrollWidth;
        syncScroll();
      }
    };

    if (frame && live) {
      frame.addEventListener("load", () => applyPlay(panel));
    }

    if (source && code) {
      let frameId = 0;
      source.addEventListener("input", () => {
        if (reduced) {
          paint();
          mountKnobs(panel);
          applyPlay(panel);
          return;
        }
        cancelAnimationFrame(frameId);
        frameId = requestAnimationFrame(() => {
          paint();
          applyPlay(panel);
        });
      });
      source.addEventListener("scroll", syncScroll, { passive: true });
    }

    const scale = panel.querySelector("[data-knob='scale']");
    if (scale) {
      const out = panel.querySelector("[data-knob-out='scale']");
      scale.addEventListener("input", () => {
        if (out) out.textContent = `${scale.value}%`;
        applyPlay(panel);
      });
    }

    panel.querySelectorAll(".demo-device").forEach((btn) => {
      btn.addEventListener("click", () => {
        const stage = panel.querySelector(".demo-preview__stage");
        const device = btn.getAttribute("data-device") || "desktop";
        panel.querySelectorAll(".demo-device").forEach((node) => {
          const on = node === btn;
          node.classList.toggle("is-active", on);
          node.setAttribute("aria-pressed", on ? "true" : "false");
        });
        if (stage) stage.setAttribute("data-device", device);
      });
    });

    const reset = panel.querySelector("[data-demo-reset]");
    if (reset) {
      reset.addEventListener("click", () => {
        if (scale) {
          scale.value = "100";
          const out = panel.querySelector("[data-knob-out='scale']");
          if (out) out.textContent = "100%";
        }
        panel.querySelectorAll("[data-knob-origin]").forEach((input) => {
          input.value = input.getAttribute("data-knob-origin") || input.value;
          const output = input.parentElement?.querySelector("output");
          const unit = input.getAttribute("data-knob-unit") || "px";
          if (output) output.textContent = formatKnob(input.value, unit);
        });
        panel.querySelectorAll(".demo-device").forEach((node) => {
          const on = node.getAttribute("data-device") === "desktop";
          node.classList.toggle("is-active", on);
          node.setAttribute("aria-pressed", on ? "true" : "false");
        });
        const stage = panel.querySelector(".demo-preview__stage");
        if (stage) stage.setAttribute("data-device", "desktop");
        applyPlay(panel);
      });
    }

    const panes = panel.querySelector(".demo-panes");
    const handle = panel.querySelector("[data-demo-compare]");
    if (panes && handle) {
      const setCompare = (pct) => {
        const next = Math.min(0.92, Math.max(0.08, pct));
        panes.style.setProperty("--compare", `${(next * 100).toFixed(2)}%`);
        handle.setAttribute("aria-valuenow", String(Math.round(next * 100)));
      };
      const fromPointer = (event) => {
        const point = event.touches ? event.touches[0] : event;
        if (!point) return;
        const stage = panel.querySelector(".demo-preview") || panes;
        const box = stage.getBoundingClientRect();
        if (!box.width) return;
        setCompare((point.clientX - box.left) / box.width);
      };
      let dragging = false;
      handle.addEventListener("pointerdown", (event) => {
        dragging = true;
        handle.setPointerCapture(event.pointerId);
        fromPointer(event);
        event.preventDefault();
      });
      handle.addEventListener("pointermove", (event) => {
        if (!dragging) return;
        fromPointer(event);
      });
      const stopDrag = () => {
        dragging = false;
      };
      handle.addEventListener("pointerup", stopDrag);
      handle.addEventListener("pointercancel", stopDrag);
      handle.addEventListener("keydown", (event) => {
        const now = Number(handle.getAttribute("aria-valuenow") || 42) / 100;
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          setCompare(now - 0.04);
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          setCompare(now + 0.04);
        }
        if (event.key === "Home") {
          event.preventDefault();
          setCompare(0.08);
        }
        if (event.key === "End") {
          event.preventDefault();
          setCompare(0.92);
        }
      });
    }

    mountKnobs(panel);
    paint();
    return { paint, rails };
  }

  function bindWorkbench(root) {
    const workbench = root.querySelector(".demo-workbench");
    if (!workbench) return;
    const modes = workbench.querySelector(".demo-modes");
    const shade = workbench.querySelector(".demo-modes__shade");
    const copy = workbench.querySelector(".demo-copy");
    const fileMeta = workbench.querySelector("[data-demo-file]");
    const panels = Array.from(workbench.querySelectorAll(".demo-panel"));
    const paints = panels.map((panel) => bindPanel(panel));
    let mode = workbench.getAttribute("data-mode") || "preview";
    let copyTimer = 0;

    const activePanel = () => {
      const checked = workbench.querySelector(".demo-samples input:checked");
      if (!checked) return panels[0];
      const index = checked.id.replace("demo-view-", "");
      return workbench.querySelector(`.demo-panel[data-view="${index}"]`) || panels[0];
    };

    const followShade = (animate) => {
      const btn = modes?.querySelector(".demo-mode.is-active");
      if (!shade || !btn || !modes) return;
      const host = modes.getBoundingClientRect();
      const box = btn.getBoundingClientRect();
      const next = {
        x: box.left - host.left,
        y: box.top - host.top,
        width: box.width,
        height: box.height,
      };
      const gsap = motion();
      if (!gsap) {
        shade.style.transform = `translate(${next.x}px, ${next.y}px)`;
        shade.style.width = `${next.width}px`;
        shade.style.height = `${next.height}px`;
        return;
      }
      if (!animate) {
        gsap.set(shade, next);
        return;
      }
      gsap.to(shade, { ...next, duration: 0.28, ease: "power2.out", overwrite: "auto" });
    };

    const syncCopy = () => {
      const panel = activePanel();
      if (!copy || !panel) return;
      const prompt = panel.querySelector("[data-demo-prompt]");
      const source = panel.querySelector(".demo-input");
      const code = source ? source.value : "";
      const promptText = prompt ? prompt.value : "";
      const usingPrompt = mode === "prompt" && promptText;
      copy.setAttribute("data-copy", usingPrompt ? promptText : code);
      copy.hidden = !(usingPrompt ? promptText : code);
      copy.setAttribute("aria-label", usingPrompt ? "Copy prompt" : "Copy source");
      if (fileMeta) fileMeta.textContent = panel.getAttribute("data-file") || "";
    };

    const syncModeButtons = () => {
      const panel = activePanel();
      workbench.querySelectorAll("[data-demo-mode]").forEach((btn) => {
        const id = btn.getAttribute("data-demo-mode");
        const on = modeEnabled(panel, id);
        btn.disabled = !on;
        btn.setAttribute("aria-disabled", on ? "false" : "true");
      });
    };

    const syncCompareChrome = () => {
      const active = activePanel();
      panels.forEach((panel) => {
        const on = mode === "compare" && panel === active;
        const handle = panel.querySelector("[data-demo-compare]");
        const origin = panel.querySelector(".demo-preview__origin");
        if (handle) {
          handle.hidden = !on;
          handle.tabIndex = on ? 0 : -1;
          handle.setAttribute("aria-hidden", on ? "false" : "true");
        }
        if (origin) origin.hidden = !on;
      });
    };

    const releaseMotion = (panel) => {
      const gsap = motion();
      const nodes = [
        workbench.querySelector(".demo-stage"),
        panel?.querySelector(".demo-preview"),
        panel?.querySelector(".demo-source"),
        panel?.querySelector(".demo-aside"),
        panel?.querySelector(".demo-prompt"),
        panel?.querySelector(".demo-play"),
        panel?.querySelector("[data-demo-compare]"),
      ].filter(Boolean);
      if (gsap) {
        gsap.killTweensOf(nodes);
        gsap.set(nodes, { clearProps: "opacity,visibility,transform,autoAlpha,x,y" });
      } else {
        nodes.forEach((node) => {
          node.style.opacity = "";
          node.style.visibility = "";
          node.style.transform = "";
        });
      }
      panels.forEach((item) => {
        const panes = item.querySelector(".demo-panes");
        if (panes) panes.style.gridTemplateColumns = "";
      });
    };

    const enterTarget = (panel, next, from) => {
      if (next === "prompt") return panel.querySelector(".demo-prompt");
      if (next === "playground") return panel.querySelector(".demo-aside");
      if (next === "source") return panel.querySelector(".demo-source");
      if (next === "split" && from === "preview") return panel.querySelector(".demo-source");
      if (next === "compare") return null;
      return panel.querySelector(".demo-preview");
    };

    const syncInert = () => {
      const panel = activePanel();
      if (!panel) return;
      const hasPreview = panel.classList.contains("has-preview");
      const hasSource = panel.classList.contains("has-source");
      const showPreview =
        (mode === "preview" && hasPreview) ||
        mode === "split" ||
        mode === "compare" ||
        mode === "playground";
      const showSource =
        mode === "source" ||
        mode === "split" ||
        (mode === "preview" && !hasPreview && hasSource);
      const showPrompt = mode === "prompt";
      const showPlay = mode === "playground";
      panel.querySelector(".demo-preview")?.toggleAttribute("inert", !showPreview);
      panel.querySelector(".demo-source")?.toggleAttribute("inert", !showSource);
      panel.querySelector(".demo-prompt")?.toggleAttribute("inert", !showPrompt);
      panel.querySelector(".demo-play")?.toggleAttribute("inert", !showPlay);
      const handle = panel.querySelector("[data-demo-compare]");
      if (handle) handle.toggleAttribute("inert", mode !== "compare");
    };

    const setModeChrome = (next) => {
      mode = next;
      workbench.setAttribute("data-mode", next);
      workbench.querySelectorAll("[data-demo-mode]").forEach((btn) => {
        const on = btn.getAttribute("data-demo-mode") === next;
        btn.classList.toggle("is-active", on);
        btn.setAttribute("aria-checked", on ? "true" : "false");
      });
      syncModeButtons();
      syncCompareChrome();
      syncInert();
      syncCopy();
      followShade(true);
    };

    const goMode = (next, { animate = true } = {}) => {
      const panel = activePanel();
      if (!modeEnabled(panel, next)) return;
      if (next === mode && workbench.getAttribute("data-mode") === next) {
        followShade(false);
        return;
      }
      const from = mode;
      const gsap = motion();
      releaseMotion(panel);
      setModeChrome(next);
      if (!animate || !gsap) return;
      const surface = enterTarget(panel, next, from);
      if (surface) {
        gsap.fromTo(
          surface,
          { y: 10 },
          { y: 0, duration: 0.3, ease: "power2.out", clearProps: "transform" },
        );
      }
      if (next === "compare") {
        const panes = panel.querySelector(".demo-panes");
        if (panes) {
          gsap.fromTo(
            panes,
            { "--compare": from === "source" ? "92%" : "8%" },
            { "--compare": "42%", duration: 0.42, ease: "power2.inOut" },
          );
        }
      }
    };

    modes?.querySelectorAll("[data-demo-mode]").forEach((btn) => {
      btn.addEventListener("click", () => goMode(btn.getAttribute("data-demo-mode") || "preview"));
    });

    modes?.addEventListener("keydown", (event) => {
      const buttons = Array.from(modes.querySelectorAll("[data-demo-mode]:not(:disabled)"));
      const index = buttons.indexOf(document.activeElement);
      if (index < 0) return;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        buttons[(index + 1) % buttons.length]?.focus();
      }
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        buttons[(index - 1 + buttons.length) % buttons.length]?.focus();
      }
    });

    workbench.querySelectorAll(".demo-samples input").forEach((input) => {
      input.addEventListener("change", () => {
        if (!modeEnabled(activePanel(), mode)) goMode("preview", { animate: false });
        syncModeButtons();
        syncCompareChrome();
        syncCopy();
        syncInert();
        paints.forEach((entry) => entry.rails.forEach((sync) => sync()));
      });
    });

    if (copy) {
      copy.addEventListener("click", async () => {
        const text = copy.getAttribute("data-copy") ?? "";
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          return;
        }
        copy.classList.add("is-copied");
        const restoreLabel = copy.getAttribute("aria-label") || "Copy source";
        copy.setAttribute("aria-label", "Copied");
        const gsap = motion();
        const ok = copy.querySelector(".demo-copy__ok");
        if (gsap && ok) {
          gsap.fromTo(ok, { scale: 0.6 }, { scale: 1, duration: 0.28, ease: "back.out(1.8)", clearProps: "transform" });
        }
        window.clearTimeout(copyTimer);
        copyTimer = window.setTimeout(() => {
          copy.classList.remove("is-copied");
          copy.setAttribute("aria-label", restoreLabel);
        }, 1600);
      });
    }

    panels.forEach((panel) => {
      const source = panel.querySelector(".demo-input");
      if (source) source.addEventListener("input", syncCopy);
    });

    const themePaint = () => paints.forEach((entry) => entry.paint());
    const observer = new MutationObserver(themePaint);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    panels.forEach((panel) => releaseMotion(panel));
    setModeChrome(mode);
    followShade(false);
    requestAnimationFrame(() => followShade(false));
    window.addEventListener("resize", () => followShade(false), { passive: true });
    return themePaint;
  }

  function init() {
    const paints = [];
    document.querySelectorAll("[data-demo]").forEach((root) => {
      const paint = bindWorkbench(root);
      if (paint) paints.push(paint);
    });
    return paints;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
