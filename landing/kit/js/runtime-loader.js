/* Gvaste Pages runtime loader: capability-driven first-party modules + optional motion. */
(() => {
  "use strict";

  const ownScript = document.currentScript;
  const vendorBase = ownScript && ownScript.src
    ? new URL("./", ownScript.src)
    : new URL("vendor/", window.location.href);
  const pageBase = new URL("../", vendorBase);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGithubSurface = Boolean(document.querySelector(".github[data-github-owner][data-github-name]"));
  const hasDemoSurface = Boolean(document.querySelector(".demo"));
  const hasProfileSurface = Boolean(document.querySelector(".profile[data-profile-variant]"));
  const hasShadeSurface = Boolean(
    document.querySelector(".hero-icon:not(.hero-icon--file), .docs-tree__shade, [data-card-shade]"),
  );

  const hasStageSurface = Boolean(
    document.querySelector("[data-deck], [data-marquee], [data-walkthrough], [data-handoff], [data-mascot]"),
  );

  const stackCount = document.querySelectorAll(".stack-panel").length;
  const hasMotionSurface = Boolean(
    document.querySelector("[data-carousel], [data-proof-tabs], [data-compare-slider], .hero, .about, .screens, .preview, .demo, .commands, .faq, .docs")
  );
  const needsMotionRuntime = !reduced && (stackCount > 1 || hasMotionSurface || hasStageSurface);

  function report(step, error) {
    try {
      document.documentElement.setAttribute(
        "data-runtime-error",
        `${step}: ${error && error.message ? error.message : String(error)}`,
      );
    } catch {}
    if (typeof console !== "undefined") console.error(`[runtime-loader] ${step}`, error);
  }

  function loadClassic(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = String(url);
      script.async = false;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Could not load ${url}`));
      document.head.appendChild(script);
    });
  }

  function loadStylesheet(url) {
    return new Promise((resolve, reject) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = String(url);
      link.onload = resolve;
      link.onerror = () => reject(new Error(`Could not load ${url}`));
      document.head.appendChild(link);
    });
  }

  async function boot() {
    if (document.documentElement.hasAttribute("data-accent-cycle")) {
      import(new URL("accent-cycle.js", vendorBase)).catch((error) => report("accent-cycle", error));
    }
    if (document.documentElement.hasAttribute("data-sound")) {
      import(new URL("sound.js", vendorBase)).catch((error) => report("sound", error));
    }
    if (document.querySelector("canvas[data-card-fx]")) {
      import(new URL("card-fx.js", vendorBase)).catch((error) => report("card-fx", error));
    }

    const hasTypeSurface = Boolean(
      document.querySelector(
        ".hero-copy h1, .section-head h2, .about-head h2, .screens-copy h2, .lede, .closing__text",
      ),
    );
    if (hasTypeSurface) {
      import(new URL("type-fit.js", vendorBase)).catch((error) => report("type-fit", error));
    }

    if (hasShadeSurface) {
      window.__gvasteHeroShade = import(new URL("hero-shade.js", vendorBase)).catch((error) => {
        report("hero-shade", error);
        return null;
      });
    }

    if (hasGithubSurface) {
      try {
        await Promise.all([
          loadStylesheet(new URL("github-signal.css", vendorBase)),
          import(new URL("github-signal.js", vendorBase)),
        ]);
      } catch (error) {
        report("github-signal", error);
      }
    }

    if (needsMotionRuntime) {
      try {
        await loadClassic(new URL("gsap.min.js", vendorBase));
        await loadClassic(new URL("ScrollToPlugin.min.js", vendorBase));
        await loadClassic(new URL("ScrollTrigger.min.js", vendorBase));
      } catch (error) {
        report("motion", error);
      }
    } else {
      document.documentElement.classList.add("runtime-motion-skipped");
    }

    if (hasProfileSurface) {
      try {
        await import(new URL("profile.js", vendorBase));
      } catch (error) {
        report("profile", error);
      }
    }

    if (hasDemoSurface) {
      try {
        await import(new URL("demo-workbench.js", vendorBase));
      } catch (error) {
        report("demo-workbench", error);
      }
    }

    try {
      await loadClassic(new URL("app.js", pageBase));
    } catch (error) {
      document.documentElement.classList.remove("js-motion");
      report("app", error);
    }

    if (hasStageSurface) {
      try {
        await import(new URL("stage-motion.js", vendorBase));
      } catch (error) {
        report("stage-motion", error);
      }
    }
  }

  boot();
})();
