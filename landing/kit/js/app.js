/* Gvaste Pages runtime: depth carousel, lightbox, nav motion. */
(() => {
  "use strict";

  const gsap = window.gsap;
  const hasGsap = typeof gsap === "object" && gsap !== null;
  const hasScrollTo = hasGsap && typeof window.ScrollToPlugin === "object";
  const hasScrollTrigger = hasGsap && typeof window.ScrollTrigger === "function";
  if (hasGsap) {
    try {
      gsap.registerPlugin(window.ScrollToPlugin, window.ScrollTrigger);
      if (window.ScrollTrigger) {
        window.ScrollTrigger.config({ ignoreMobileResize: true });
      }
    } catch (error) {
      report("registerPlugin", error);
    }
  }
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const compactQuery = () => window.matchMedia("(max-width: 840px)");
  const isCompactViewport = () => compactQuery().matches;
  const theaterEnabled = () => !reduced && !isCompactViewport();
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  function report(step, error) {
    try {
      document.documentElement.setAttribute("data-app-error", `${step}: ${error && error.message ? error.message : String(error)}`);
    } catch {}
    if (typeof console !== "undefined") console.error(`[app] ${step}`, error);
  }

  function parseJSON(text) {
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  }

  /* Tabler Icons (https://tabler.io/icons) — 24px stroke icons, MIT. */
  const icon = (paths, size = 24) =>
    `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths
      .map((d) => `<path d="${d}"/>`)
      .join("")}</svg>`;

  const ICONS = {
    chevronLeft: ["M15 6l-6 6l6 6"],
    chevronRight: ["M9 6l6 6l-6 6"],
    close: ["M18 6l-12 12", "M6 6l12 12"],
    arrowUp: ["M12 5v14", "M5 12l7 -7l7 7"]
  };

  /* ------------------------------------------------------------------ */
  /* Lightbox: shape-morphing, position-aware image viewer               */
  /* ------------------------------------------------------------------ */

  const LIGHTBOX_SHADOW = "0 40px 90px -20px rgba(0,0,0,0.7), 0 8px 24px -12px rgba(0,0,0,0.55)";
  const LIGHTBOX_EASE = "power3.inOut";

  class Lightbox {
    constructor() {
      this.root = null;
      this.controller = null;
      this.state = "closed";
      this.tl = null;
      this.hiddenEl = null;
      this.onKeyDown = (event) => this.handleKey(event);
      this.onResize = () => this.refit();
    }

    ensureDom() {
      if (this.root) return;
      this.root = document.createElement("div");
      this.root.className = "lightbox";
      this.root.setAttribute("role", "dialog");
      this.root.setAttribute("aria-modal", "true");
      this.root.setAttribute("aria-label", "Image viewer");
      this.root.innerHTML = `
        <div class="lightbox__backdrop" data-lightbox-close></div>
        <span class="lightbox__counter" aria-live="polite"></span>
        <button type="button" class="lightbox__close" aria-label="Close viewer" data-lightbox-close>${icon(ICONS.close, 20)}</button>
        <button type="button" class="lightbox__nav lightbox__nav--prev" aria-label="Previous image">${icon(ICONS.chevronLeft, 28)}</button>
        <button type="button" class="lightbox__nav lightbox__nav--next" aria-label="Next image">${icon(ICONS.chevronRight, 28)}</button>
        <div class="lightbox__stage">
          <div class="lightbox__frame"><img class="lightbox__image" alt=""></div>
          <p class="lightbox__caption"></p>
        </div>
      `;
      document.body.appendChild(this.root);
      this.backdrop = this.root.querySelector(".lightbox__backdrop");
      this.frame = this.root.querySelector(".lightbox__frame");
      this.img = this.root.querySelector(".lightbox__image");
      this.caption = this.root.querySelector(".lightbox__caption");
      this.counter = this.root.querySelector(".lightbox__counter");
      this.closeBtn = this.root.querySelector(".lightbox__close");
      this.prevBtn = this.root.querySelector(".lightbox__nav--prev");
      this.nextBtn = this.root.querySelector(".lightbox__nav--next");
      this.root.addEventListener("click", (event) => {
        if (event.target.closest("[data-lightbox-close]")) this.close();
      });
      this.prevBtn.addEventListener("click", () => this.step(-1));
      this.nextBtn.addEventListener("click", () => this.step(1));
    }

    handleKey(event) {
      if (event.key === "Escape") {
        this.close();
        return;
      }
      if (event.key === "ArrowLeft") {
        this.step(-1);
        return;
      }
      if (event.key === "ArrowRight") {
        this.step(1);
        return;
      }
      if (event.key === "Tab") {
        const focusables = [this.closeBtn, this.prevBtn, this.nextBtn].filter(
          (el) => el.offsetParent !== null
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    source() {
      return this.controller ? this.controller.source() : null;
    }

    chrome() {
      return [this.counter, this.closeBtn, this.prevBtn, this.nextBtn];
    }

    applySource({ src, alt, index, total }) {
      this.img.src = src;
      this.img.alt = alt || "";
      this.caption.textContent = alt || "";
      this.counter.textContent = total > 1 ? `${index + 1} / ${total}` : "";
      const multiple = total > 1;
      this.prevBtn.style.display = multiple ? "" : "none";
      this.nextBtn.style.display = multiple ? "" : "none";
      if (!this.img.complete || !this.img.naturalWidth) {
        this.img.addEventListener(
          "load",
          () => {
            if (this.state === "open") this.refit();
          },
          { once: true }
        );
      }
    }

    fittedSize(naturalWidth, naturalHeight) {
      const maxW = Math.min(window.innerWidth * 0.86, 1400);
      const maxH = window.innerHeight * 0.78;
      const ratio = naturalWidth && naturalHeight ? naturalWidth / naturalHeight : 16 / 10;
      let width = maxW;
      let height = width / ratio;
      if (height > maxH) {
        height = maxH;
        width = height * ratio;
      }
      return { width, height };
    }

    fittedFrame(source) {
      const target = this.fittedSize(source.naturalWidth, source.naturalHeight);
      return {
        left: (window.innerWidth - target.width) / 2,
        top: (window.innerHeight - target.height) / 2 - 10,
        width: target.width,
        height: target.height,
        radius: 12
      };
    }

    place(box, extra = {}) {
      const props = {
        left: box.left,
        top: box.top,
        width: box.width,
        height: box.height,
        borderRadius: box.radius,
        ...extra
      };
      if (hasGsap) {
        gsap.set(this.frame, props);
        return;
      }
      this.frame.style.left = `${box.left}px`;
      this.frame.style.top = `${box.top}px`;
      this.frame.style.width = `${box.width}px`;
      this.frame.style.height = `${box.height}px`;
      this.frame.style.borderRadius = `${box.radius}px`;
    }

    placeCaption(box) {
      this.caption.style.left = `${box.left}px`;
      this.caption.style.top = `${box.top + box.height + 12}px`;
      this.caption.style.width = `${box.width}px`;
    }

    concealSource() {
      if (this.hiddenEl) this.hiddenEl.style.visibility = "";
      const source = this.source();
      this.hiddenEl = source && source.el ? source.el : null;
      if (this.hiddenEl) this.hiddenEl.style.visibility = "hidden";
    }

    revealSource() {
      if (this.hiddenEl) this.hiddenEl.style.visibility = "";
      this.hiddenEl = null;
    }

    lockScroll() {
      if (this.scrollLocked) return;
      const scrollbar = window.innerWidth - document.documentElement.clientWidth;
      this.savedOverflow = document.body.style.overflow;
      this.savedPadding = document.body.style.paddingRight;
      document.body.style.overflow = "hidden";
      if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
      this.scrollLocked = true;
    }

    unlockScroll() {
      if (!this.scrollLocked) return;
      document.body.style.overflow = this.savedOverflow || "";
      document.body.style.paddingRight = this.savedPadding || "";
      this.scrollLocked = false;
    }

    killTween() {
      if (this.tl) {
        this.tl.kill();
        this.tl = null;
      }
    }

    finishClose() {
      this.killTween();
      this.root.classList.remove("is-open", "is-closing");
      this.revealSource();
      this.unlockScroll();
      this.state = "closed";
      this.controller = null;
      this.opener?.focus({ preventScroll: true });
    }

    open(controller) {
      if (this.state === "open" || this.state === "opening") return;
      this.ensureDom();
      this.killTween();
      this.controller = controller;
      this.opener = document.activeElement;
      this.lockScroll();
      const source = this.source();
      if (!source) {
        this.unlockScroll();
        return;
      }

      this.applySource(source);
      this.state = "opening";
      document.addEventListener("keydown", this.onKeyDown);
      window.addEventListener("resize", this.onResize);

      const from = {
        left: source.rect.left,
        top: source.rect.top,
        width: source.rect.width,
        height: source.rect.height,
        radius: source.radius
      };
      const to = this.fittedFrame(source);
      this.placeCaption(to);
      this.place(from, { boxShadow: source.shadow });
      this.root.classList.add("is-open");
      this.root.classList.remove("is-closing");
      this.concealSource();

      const armed = () => {
        this.state = "open";
        this.closeBtn.focus({ preventScroll: true });
      };

      if (!hasGsap || reduced) {
        this.place(to, { boxShadow: LIGHTBOX_SHADOW });
        gsapSafeSet([this.backdrop, this.caption, ...this.chrome()], { opacity: 1, x: 0 });
        armed();
        return;
      }

      const side = from.left + from.width / 2 < window.innerWidth / 2 ? -1 : 1;
      gsapSafeSet(this.chrome(), { opacity: 0 });
      gsapSafeSet(this.caption, { opacity: 0, x: side * 18 });
      gsapSafeSet(this.backdrop, { opacity: 0 });

      const play = () => {
        if (this.state !== "opening") return;
        this.tl = gsap
          .timeline({ onComplete: armed, defaults: { overwrite: "auto" } })
          .to(this.backdrop, { opacity: 1, duration: 0.28, ease: "power2.out" }, 0)
          .to(
            this.frame,
            {
              left: to.left,
              top: to.top,
              width: to.width,
              height: to.height,
              borderRadius: to.radius,
              boxShadow: LIGHTBOX_SHADOW,
              duration: 0.4,
              ease: LIGHTBOX_EASE
            },
            0
          )
          .to(this.caption, { opacity: 1, x: 0, duration: 0.24, ease: "power2.out" }, 0.22)
          .to(this.chrome(), { opacity: 1, duration: 0.22, ease: "power2.out", stagger: 0.03 }, 0.2);
      };

      requestAnimationFrame(play);
    }

    refit() {
      if (this.state !== "open") return;
      const source = this.source();
      if (!source) return;
      const to = this.fittedFrame(source);
      this.place(to);
      this.placeCaption(to);
    }

    step(direction) {
      if (this.state !== "open" || !this.controller) return;
      const source = this.controller.step(direction);
      if (!source) return;
      this.concealSource();
      this.applySource(source);
      const to = this.fittedFrame(source);
      this.placeCaption(to);
      if (!hasGsap || reduced) {
        this.place(to);
        return;
      }
      gsap.to(this.frame, {
        left: to.left,
        top: to.top,
        width: to.width,
        height: to.height,
        duration: 0.3,
        ease: "power2.inOut",
        overwrite: "auto"
      });
      gsap.fromTo(
        [this.img, this.caption],
        { opacity: 0.18 },
        { opacity: 1, duration: 0.26, ease: "power2.out" }
      );
    }

    close() {
      if (!this.root || this.state === "closed" || this.state === "closing") return;
      this.killTween();
      this.state = "closing";
      this.root.classList.add("is-closing");
      document.removeEventListener("keydown", this.onKeyDown);
      window.removeEventListener("resize", this.onResize);

      const source = this.source();
      if (!hasGsap || reduced || !source) {
        this.finishClose();
        return;
      }

      this.tl = gsap
        .timeline({ onComplete: () => this.finishClose(), defaults: { overwrite: "auto" } })
        .to([this.caption, ...this.chrome()], { opacity: 0, duration: 0.16, ease: "power2.out" }, 0)
        .to(
          this.frame,
          {
            left: source.rect.left,
            top: source.rect.top,
            width: source.rect.width,
            height: source.rect.height,
            borderRadius: source.radius,
            boxShadow: source.shadow,
            duration: 0.36,
            ease: LIGHTBOX_EASE
          },
          0
        )
        .to(this.backdrop, { opacity: 0, duration: 0.26, ease: "power2.out" }, 0.08);
    }
  }

  function gsapSafeSet(targets, props) {
    const list = Array.isArray(targets) ? targets.filter(Boolean) : [targets];
    if (hasGsap) {
      gsap.set(list, props);
      return;
    }
    list.forEach((el) => {
      if (!el || !el.style) return;
      Object.entries(props).forEach(([key, value]) => {
        if (key === "opacity") el.style.opacity = String(value);
        if (key === "x") el.style.transform = value ? `translateX(${value}px)` : "none";
      });
    });
  }

  const lightbox = new Lightbox();

  /* ------------------------------------------------------------------ */
  /* DepthCarousel: vanilla port of the depth carousel component         */
  /* ------------------------------------------------------------------ */

  const CAROUSEL_DEFAULTS = {
    cardWidth: 720,
    cardHeight: 450,
    radius: 16,
    tint: "#05060a",
    depth: 280,
    spread: 86,
    tilt: 16,
    tiltDirection: "right",
    perspective: 1400,
    visibleCards: 1,
    falloff: 0.28,
    blur: 5,
    duration: 560,
    ease: "power2.inOut",
    autoplay: false,
    autoplayDelay: 3200,
    loop: true,
    showControls: true,
    showIndicators: false
  };

  class DepthCarousel {
    constructor(root) {
      this.root = root;
      this.cfg = { ...CAROUSEL_DEFAULTS, ...(parseJSON(root.dataset.carousel) || {}) };
      this.cards = Array.from(root.querySelectorAll(".depth-carousel__card"));
      this.tints = this.cards.map((card) => card.querySelector(".depth-carousel__tint"));
      this.count = this.cards.length;
      if (this.count === 0) return;

      this.pos = 0;
      this.focus = 0;
      this.active = 0;
      this.scale = 1;
      this.tween = null;
      this.drag = null;
      this.wheelTimer = null;
      this.autoTimer = null;
      this.suppressClick = false;
      this.pointerInside = false;
      this.pointerPressed = false;
      this.travelDir = 1;
      this.swap = null;
      this.moveGen = 0;
      this.fits = [];
      this.activeSize = { width: this.cfg.cardWidth, height: this.cfg.cardHeight };

      const scope = root.closest(".screens, .hero, .preview");
      this.scope = scope;
      this.inScreens = Boolean(scope?.classList.contains("screens") || scope?.classList.contains("preview"));
      if (this.inScreens) {
        this.cfg.autoplay = true;
      }
      this.thumbs = scope ? Array.from(scope.querySelectorAll("[data-thumb]")) : [];
      this.bar = scope
        ? {
            counter: scope.querySelector("[data-carousel-counter]"),
            caption: scope.querySelector("[data-carousel-caption]"),
            progress: scope.querySelector("[data-carousel-progress]")
          }
        : null;
      this.holdRoot = (scope && scope.querySelector(".screens-media")) || root;

      this.cards.forEach((card, index) => {
        card.style.borderRadius = `${this.cfg.radius}px`;
        card.addEventListener("click", () => this.onCardClick(index));
        const img = card.querySelector(".depth-carousel__img");
        img?.addEventListener("load", () => {
          this.sizeCards();
          this.layout();
          if (index === this.active) this.syncGlow();
        });
      });

      this.mountGlow();
      this.buildControls();
      this.bindDrag();
      this.bindWheel();
      this.bindKeyboard();
      this.bindAutoplay();
      this.observeResize();
      this.layout(this.pos);
      this.root.classList.add("is-ready");
      this.root.setAttribute("data-carousel-ready", "");
    }

    /* Lightbox controller: exposes the focused card and step navigation. */
    controller() {
      const carousel = this;
      return {
        source() {
          const card = carousel.cards[carousel.focus];
          const img = card?.querySelector(".depth-carousel__img");
          if (!img) return null;
          const rect = card.getBoundingClientRect();
          const style = getComputedStyle(card);
          return {
            el: card,
            src: img.currentSrc || img.src,
            alt: img.alt,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            radius: carousel.cfg.radius * carousel.scale,
            shadow: style.boxShadow === "none" ? "0 30px 60px -20px rgba(0,0,0,0.65), 0 8px 20px -10px rgba(0,0,0,0.5)" : style.boxShadow,
            rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
            index: carousel.focus,
            total: carousel.count
          };
        },
        step(direction) {
          carousel.navigateBy(direction);
          return this.source();
        }
      };
    }

    buildControls() {
      if (this.count < 2) return;
      if (this.cfg.showControls) {
        const prev = document.createElement("button");
        prev.type = "button";
        prev.className = "depth-carousel__arrow depth-carousel__arrow--prev";
        prev.setAttribute("aria-label", "Previous slide");
        prev.innerHTML = icon(ICONS.chevronLeft, 28);
        prev.addEventListener("pointerdown", (event) => event.stopPropagation());
        prev.addEventListener("click", () => this.navigateBy(-1, true));

        const next = document.createElement("button");
        next.type = "button";
        next.className = "depth-carousel__arrow depth-carousel__arrow--next";
        next.setAttribute("aria-label", "Next slide");
        next.innerHTML = icon(ICONS.chevronRight, 28);
        next.addEventListener("pointerdown", (event) => event.stopPropagation());
        next.addEventListener("click", () => this.navigateBy(1, true));

        this.root.append(prev, next);
      }
      if (this.cfg.showIndicators && !this.bar?.counter && !this.thumbs.length) {
        const dots = document.createElement("div");
        dots.className = "depth-carousel__dots";
        dots.setAttribute("role", "tablist");
        dots.setAttribute("aria-label", "Slides");
        this.dotBtns = this.cards.map((_, index) => {
          const dot = document.createElement("button");
          dot.type = "button";
          dot.className = "depth-carousel__dot";
          dot.setAttribute("role", "tab");
          dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
          dot.addEventListener("click", () => this.goTo(index, true, true));
          dots.appendChild(dot);
          return dot;
        });
        this.root.appendChild(dots);
      }
      this.thumbs.forEach((thumb, index) => {
        thumb.addEventListener("click", () => {
          if (index === this.focus) this.openLightbox();
          else this.goTo(index, true, true);
        });
      });
      this.syncState();
      this.updateArrowOffset();
    }

    openLightbox() {
      try {
        lightbox.open(this.controller());
      } catch (error) {
        report("lightbox", error);
      }
    }

    updateArrowOffset() {
      const widths = (this.fits || []).map((fit) => fit.width);
      const width = Math.max(this.activeSize?.width || 0, ...widths) || this.cfg.cardWidth;
      const offset = width / 2 + 52;
      this.root.style.setProperty("--dc-arrow-offset", `${Math.round(offset)}px`);
    }

    cardAspect(index) {
      const img = this.cards[index]?.querySelector(".depth-carousel__img");
      const width = img?.naturalWidth || 0;
      const height = img?.naturalHeight || 0;
      if (width > 0 && height > 0) return width / height;
      return this.cfg.cardWidth / this.cfg.cardHeight;
    }

    fitIn(ar, availW, availH) {
      const width = Math.min(availW, availH * ar);
      return { width, height: width / Math.max(ar, 0.01) };
    }

    sizeCards() {
      const width = this.root.clientWidth;
      const height = this.root.clientHeight;
      if (width < 2 || height < 2) return;

      const bezel = 4;
      const insetX = 112;
      const insetY = this.inScreens ? 20 : 12;
      const availW = Math.max(120, width - insetX - bezel);
      const availH = Math.max(80, height - insetY - bezel);
      this.fits = this.cards.map((_, index) => {
        const inner = this.fitIn(this.cardAspect(index), availW, availH);
        return { width: inner.width + bezel, height: inner.height + bezel };
      });
      this.cards.forEach((card, index) => {
        const fit = this.fits[index];
        card.style.width = `${Math.round(fit.width)}px`;
        card.style.height = `${Math.round(fit.height)}px`;
      });
      this.activeSize = this.fits[this.active] || this.fits[0] || this.activeSize;
      this.scale = 1;
      this.root.style.setProperty("--dc-card-w", `${Math.round(this.activeSize.width)}px`);
      this.root.style.setProperty("--dc-card-h", `${Math.round(this.activeSize.height)}px`);
      this.holdRoot?.style.setProperty("--dc-card-w", `${Math.round(this.activeSize.width)}px`);
      this.holdRoot?.style.setProperty("--dc-card-h", `${Math.round(this.activeSize.height)}px`);
      this.updateArrowOffset();
      this.sizeGlow();
    }

    syncState() {
      this.cards.forEach((card, index) => card.setAttribute("aria-hidden", String(this.active !== index)));
      if (this.dotBtns) {
        this.dotBtns.forEach((dot, index) => {
          dot.classList.toggle("is-active", this.active === index);
          dot.setAttribute("aria-selected", String(this.active === index));
        });
      }
      if (this.thumbs.length) {
        this.thumbs.forEach((thumb, index) => {
          const on = this.active === index;
          thumb.classList.toggle("is-active", on);
          thumb.hidden = on;
          thumb.setAttribute("aria-hidden", String(on));
          thumb.tabIndex = on ? -1 : 0;
        });
      }
      if (this.bar) {
        const pad = (value) => String(value).padStart(2, "0");
        if (this.bar.counter) this.bar.counter.textContent = `${pad(this.active + 1)} / ${pad(this.count)}`;
        if (this.bar.caption) {
          const img = this.cards[this.active]?.querySelector(".depth-carousel__img");
          this.bar.caption.textContent = img?.dataset.caption ?? "";
        }
        if (this.bar.progress) this.bar.progress.style.transform = `scaleX(${(this.active + 1) / this.count})`;
      }
      this.syncGlow();
    }

    mountGlow() {
      let root = this.root.querySelector(":scope > .depth-carousel__glow");
      const initial = this.cards[0]?.querySelector(".depth-carousel__img");
      const initialSrc = initial?.currentSrc || initial?.src || "";

      if (root && root.tagName === "IMG") {
        const wrap = document.createElement("div");
        wrap.className = "depth-carousel__glow";
        wrap.setAttribute("aria-hidden", "true");
        root.replaceWith(wrap);
        wrap.appendChild(root);
        root.removeAttribute("class");
        root = wrap;
      }
      if (!root) {
        root = document.createElement("div");
        root.className = "depth-carousel__glow";
        root.setAttribute("aria-hidden", "true");
        const stage = this.root.querySelector(".depth-carousel__stage");
        this.root.insertBefore(root, stage);
      }

      this.glow = root;
      const layers = Array.from(root.querySelectorAll("img"));
      this.glowFront = layers[0] || root.appendChild(this.makeGlowLayer(initialSrc));
      this.glowBack = layers[1] || root.appendChild(this.makeGlowLayer(""));
      this.glowGen = 0;
      this.glowTween = null;
      this.glowSrc = this.glowFront.currentSrc || this.glowFront.src || initialSrc;
      this.setGlowLayer(this.glowFront, 1, 1);
      this.setGlowLayer(this.glowBack, 0, 0);
      this.syncGlow();
      this.sizeGlow();
    }

    makeGlowLayer(src) {
      const img = document.createElement("img");
      img.alt = "";
      img.decoding = "async";
      img.draggable = false;
      img.setAttribute("aria-hidden", "true");
      if (src) img.src = src;
      return img;
    }

    setGlowLayer(el, opacity, z) {
      if (!el) return;
      if (hasGsap) gsap.set(el, { opacity, zIndex: z, scale: 1 });
      else {
        el.style.opacity = String(opacity);
        el.style.transform = "none";
        el.style.zIndex = String(z);
      }
    }

    syncGlow() {
      if (!this.glow || !this.glowFront || !this.glowBack) return;
      const img = this.cards[this.active]?.querySelector(".depth-carousel__img");
      const src = img?.currentSrc || img?.src || "";
      if (!src || src === this.glowSrc) return;

      this.glowGen += 1;
      const gen = this.glowGen;
      const incoming = this.glowBack;
      const outgoing = this.glowFront;
      incoming.src = src;
      this.glowSrc = src;

      const play = () => {
        if (gen !== this.glowGen) return;
        const duration = !reduced && hasGsap ? this.cfg.duration / 1000 : 0;
        if (!hasGsap || duration === 0) {
          this.setGlowLayer(incoming, 1, 1);
          this.setGlowLayer(outgoing, 0, 0);
          this.glowFront = incoming;
          this.glowBack = outgoing;
          return;
        }
        this.glowTween?.kill();
        this.setGlowLayer(incoming, 0, 2);
        this.setGlowLayer(outgoing, 1, 1);
        this.glowTween = gsap
          .timeline({
            defaults: { duration, ease: this.cfg.ease },
            onComplete: () => {
              if (gen !== this.glowGen) return;
              this.glowFront = incoming;
              this.glowBack = outgoing;
            }
          })
          .to(incoming, { opacity: 1 }, 0)
          .to(outgoing, { opacity: 0 }, 0);
      };

      if (incoming.complete && incoming.naturalWidth) play();
      else incoming.addEventListener("load", play, { once: true });
    }

    sizeGlow() {
      if (!this.glow) return;
      const fits = this.fits || [];
      const width = Math.max(...fits.map((fit) => fit.width), this.activeSize?.width || this.cfg.cardWidth);
      const height = Math.max(...fits.map((fit) => fit.height), this.activeSize?.height || this.cfg.cardHeight);
      this.root.style.setProperty("--dc-glow-w", `${Math.round(width * 2.2)}px`);
      this.root.style.setProperty("--dc-glow-h", `${Math.round(height * 3.1)}px`);
    }

    wrapDelta(delta) {
      const n = this.count;
      if (!this.cfg.loop || n <= 1) return delta;
      let d = ((delta % n) + n) % n;
      if (d > n / 2) d -= n;
      return d;
    }

    moving() {
      if (this.swap) return true;
      const nearest = Math.round(this.pos);
      return Math.abs(this.pos - nearest) > 0.02;
    }

    placeCard(index, d) {
      const cfg = this.cfg;
      const el = this.cards[index];
      if (!el) return;

      const az = Math.abs(d);
      const side = az < 0.001 ? 0 : Math.sign(d);
      const shown = az <= 1.15;
      const dir = cfg.tiltDirection === "left" ? -1 : 1;
      const tz = -cfg.depth * az;
      const tx = dir * cfg.spread * d;
      const ry = dir * cfg.tilt * clamp(d, -1, 1);
      const opacity = shown ? clamp(1 - az, 0, 1) : 0;
      const brightness = Math.max(0.22, 1 - az * cfg.falloff);
      const incoming = side !== 0 && side === (this.travelDir || 1);
      const zi = Math.round(2000 - az * 40 + (incoming ? 8 : 0));
      const front = shown && az < 0.45;

      el.style.visibility = shown && opacity > 0.02 ? "visible" : "hidden";
      el.style.transform = `translate(-50%, -50%) translateX(${tx.toFixed(2)}px) translateZ(${tz.toFixed(2)}px) rotateY(${ry.toFixed(3)}deg)`;
      el.style.opacity = opacity.toFixed(3);
      el.style.filter = `brightness(${brightness.toFixed(3)})`;
      el.style.zIndex = String(zi);
      el.style.pointerEvents = front ? "auto" : "none";

      const tint = this.tints[index];
      if (tint) {
        tint.style.background = cfg.tint;
        tint.style.opacity = clamp(az * cfg.falloff * 1.35, 0, 0.86).toFixed(3);
      }
    }

    layout(pos = this.pos) {
      const n = this.count;
      if (!n) return;

      if (this.swap) {
        const { from, to, dir, p } = this.swap;
        for (let i = 0; i < n; i++) {
          let d = 99;
          if (i === from) d = -dir * p;
          else if (i === to) d = dir * (1 - p);
          this.placeCard(i, d);
        }
      } else {
        for (let i = 0; i < n; i++) this.placeCard(i, this.wrapDelta(i - pos));
      }

      const front = this.currentIndex();
      if (front !== this.active) {
        this.active = front;
        this.activeSize = this.fits[front] || this.activeSize;
        this.syncState();
      }
    }

    clearSwap() {
      if (!this.swap) return;
      this.pos = this.swap.p > 0.5 ? this.swap.to : this.swap.from;
      this.swap = null;
    }

    tweenTo(target, animate) {
      const gen = ++this.moveGen;
      this.tween?.kill();
      this.tween = null;
      this.swap = null;
      const cfg = this.cfg;
      const proxy = { p: this.pos };
      const duration = animate && !reduced && hasGsap ? cfg.duration / 1000 : 0;
      if (!hasGsap || duration === 0) {
        const n = this.count;
        this.pos = n > 0 ? ((target % n) + n) % n : target;
        this.focus = this.wrapIndex(Math.round(this.pos));
        this.layout(this.pos);
        return;
      }
      this.tween = gsap.to(proxy, {
        p: target,
        duration,
        ease: cfg.ease,
        overwrite: true,
        onUpdate: () => {
          if (gen !== this.moveGen) return;
          this.pos = proxy.p;
          this.layout(this.pos);
        },
        onComplete: () => {
          if (gen !== this.moveGen) return;
          this.tween = null;
          const n = this.count;
          if (n > 0) this.pos = ((this.pos % n) + n) % n;
          this.focus = this.wrapIndex(Math.round(this.pos));
          this.layout(this.pos);
        }
      });
    }

    animatePair(from, to, dir, fromUser) {
      this.travelDir = dir;
      this.focus = to;
      this.active = to;
      this.syncState();
      if (fromUser) this.restartAutoplay();
      this.pos = from;
      this.tweenTo(from + dir, true);
    }

    wrapIndex(value) {
      const n = this.count;
      if (!n) return 0;
      return ((value % n) + n) % n;
    }

    signedDelta(from, to) {
      const n = this.count;
      if (!n) return 0;
      let delta = to - from;
      if (this.cfg.loop && n > 1) {
        delta = ((delta % n) + n) % n;
        if (delta > n / 2) delta -= n;
      }
      return delta;
    }

    posDeltaTo(index) {
      const n = this.count;
      if (!n) return 0;
      const current = ((this.pos % n) + n) % n;
      return this.signedDelta(current, index);
    }

    /* Keep moving in `dir` even when the shortest wrap would reverse. */
    deltaToward(index, dir) {
      const n = this.count;
      if (!n) return 0;
      const current = ((this.pos % n) + n) % n;
      let k = (((this.wrapIndex(index) - current) % n) + n) % n;
      if (dir < 0 && k > 0) k -= n;
      return k;
    }

    currentIndex() {
      if (this.swap) return this.swap.p >= 0.5 ? this.swap.to : this.swap.from;
      return this.wrapIndex(Math.round(this.pos));
    }

    applyMove(index, targetPos, animate, fromUser) {
      const wrapped = this.wrapIndex(index);
      this.focus = wrapped;
      this.travelDir = Math.sign(targetPos - this.pos) || this.travelDir || 1;
      this.tweenTo(targetPos, animate);
      if (fromUser) this.restartAutoplay();
    }

    setFocus(rawIndex, animate = true, fromUser = false) {
      this.goTo(rawIndex, animate, fromUser);
    }

    goTo(rawIndex, animate = true, fromUser = false) {
      const n = this.count;
      if (!n) return;
      const idx = this.cfg.loop ? this.wrapIndex(rawIndex) : clamp(rawIndex, 0, n - 1);
      const delta = this.posDeltaTo(idx);
      if (Math.abs(delta) < 0.001 && this.wrapIndex(Math.round(this.pos)) === idx && !this.tween) return;
      this.applyMove(idx, this.pos + delta, animate, fromUser);
    }

    navigateBy(step, fromUser = false) {
      if (!this.count) return;
      const dir = step < 0 ? -1 : 1;
      const idx = this.cfg.loop
        ? this.wrapIndex(this.focus + dir)
        : clamp(this.focus + dir, 0, this.count - 1);
      const delta = this.deltaToward(idx, dir);
      if (Math.abs(delta) < 0.001 && !this.tween) return;
      this.applyMove(idx, this.pos + delta, true, fromUser);
    }

    onCardClick(index) {
      if (this.suppressClick || this.drag?.moved) return;
      if (this.moving()) {
        this.goTo(index, true, true);
        return;
      }
      if (index === this.focus) {
        this.openLightbox();
        return;
      }
      this.goTo(index, true, true);
    }

    bindDrag() {
      const root = this.root;
      root.addEventListener("pointerdown", (event) => {
        if (this.count < 2) return;
        if (event.target.closest("button, a")) return;
        this.drag = { x: event.clientX, startPos: this.pos, lastX: event.clientX, lastT: performance.now(), v: 0, moved: false, id: event.pointerId };
      });
      root.addEventListener("pointermove", (event) => {
        const drag = this.drag;
        if (!drag) return;
        const stepPx = Math.max((this.activeSize?.width || this.cfg.cardWidth) * 0.55, 40);
        const dx = event.clientX - drag.x;
        if (!drag.moved && Math.abs(dx) > 4) {
          drag.moved = true;
          this.tween?.kill();
          this.tween = null;
          this.moveGen += 1;
          this.clearSwap();
          drag.startPos = this.pos;
          try {
            root.setPointerCapture(drag.id);
          } catch {}
        }
        if (!drag.moved) return;
        const now = performance.now();
        const dt = Math.max(now - drag.lastT, 1);
        drag.v = (event.clientX - drag.lastX) / dt;
        drag.lastX = event.clientX;
        drag.lastT = now;
        this.pos = drag.startPos - dx / stepPx;
        this.travelDir = Math.sign(this.pos - drag.startPos) || this.travelDir;
        this.layout(this.pos);
      });
      const endDrag = () => {
        const drag = this.drag;
        if (!drag) return;
        this.drag = null;
        if (!drag.moved) return;
        this.suppressClick = true;
        window.setTimeout(() => {
          this.suppressClick = false;
        }, 0);
        const stepPx = Math.max((this.activeSize?.width || this.cfg.cardWidth) * 0.55, 40);
        const projected = this.pos - (drag.v * 180) / stepPx;
        this.setFocus(this.wrapIndex(Math.round(projected)), true, true);
      };
      root.addEventListener("pointerup", endDrag);
      root.addEventListener("pointercancel", endDrag);
    }

    bindWheel() {
      this.root.addEventListener("wheel", (event) => {
        if (this.count < 2) return;
        event.preventDefault();
        this.tween?.kill();
        this.tween = null;
        this.moveGen += 1;
        this.clearSwap();
        const raw = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
        const delta = event.deltaMode === 1 ? raw * 24 : raw;
        const step = clamp(delta / ((this.activeSize?.width || this.cfg.cardWidth) * 0.9), -0.6, 0.6);
        this.pos += step;
        this.layout(this.pos);
        if (this.wheelTimer) clearTimeout(this.wheelTimer);
        this.wheelTimer = setTimeout(() => this.setFocus(Math.round(this.pos), true, true), 130);
      }, { passive: false });
    }

    bindKeyboard() {
      this.root.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          this.navigateBy(-1, true);
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          this.navigateBy(1, true);
        }
      });
    }

    isLightboxOpen() {
      return Boolean(document.querySelector(".lightbox.is-open, .lightbox.is-closing"));
    }

    isHeld() {
      return this.pointerInside || this.pointerPressed || this.isLightboxOpen();
    }

    stopAutoplay() {
      if (this.autoTimer) {
        clearInterval(this.autoTimer);
        this.autoTimer = null;
      }
    }

    startAutoplay() {
      this.stopAutoplay();
      if (!this.cfg.autoplay || reduced || this.count < 2 || this.isHeld()) return;
      this.autoTimer = window.setInterval(() => {
        if (this.isHeld()) return;
        this.navigateBy(1);
      }, Math.max(this.cfg.autoplayDelay, 600));
    }

    restartAutoplay() {
      if (!this.cfg.autoplay || reduced) return;
      this.startAutoplay();
    }

    bindAutoplay() {
      if (!this.cfg.autoplay || reduced || this.count < 2) return;
      const holdRoot = this.holdRoot;
      holdRoot.addEventListener("pointerenter", () => {
        this.pointerInside = true;
        this.stopAutoplay();
      });
      holdRoot.addEventListener("pointerleave", () => {
        this.pointerInside = false;
        this.pointerPressed = false;
        this.startAutoplay();
      });
      holdRoot.addEventListener("pointerdown", (event) => {
        if (event.pointerType === "touch" || event.pointerType === "pen") {
          this.pointerPressed = true;
          this.stopAutoplay();
        }
      });
      window.addEventListener("pointerup", () => {
        if (!this.pointerPressed) return;
        this.pointerPressed = false;
        this.startAutoplay();
      });
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) this.stopAutoplay();
        else this.startAutoplay();
      });
      this.startAutoplay();
    }

    observeResize() {
      const apply = () => {
        this.sizeCards();
        this.layout();
      };
      apply();
      if (!("ResizeObserver" in window)) return;
      const ro = new ResizeObserver(() => apply());
      ro.observe(this.root);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Page scroll: GSAP owns snap, anchors, and spy                       */
  /* ------------------------------------------------------------------ */

  let scrollTween = null;
  let programmaticScroll = false;
  let scrollGen = 0;
  let scrollTargetIndex = -1;

  function headerHeight() {
    const head = document.querySelector(".site-head");
    return head ? head.offsetHeight : 48;
  }

  function frameScroller() {
    return document.querySelector(".page-frame__scroll");
  }

  function scrollY() {
    const node = frameScroller();
    return node ? node.scrollTop : window.scrollY;
  }

  function viewHeight() {
    const node = frameScroller();
    return node ? node.clientHeight : window.innerHeight;
  }

  function scrollTriggerVars(vars) {
    const node = frameScroller();
    return node ? { ...vars, scroller: node } : vars;
  }

  function flowOffset(el) {
    let y = 0;
    let node = el;
    while (node) {
      y += node.offsetTop;
      node = node.offsetParent;
    }
    return y;
  }

  function maxScrollY() {
    const node = frameScroller();
    if (node) return Math.max(0, node.scrollHeight - node.clientHeight);
    return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  }

  function panelY(el) {
    if (el.classList.contains("stack-panel")) {
      let y = 0;
      let sib = el.previousElementSibling;
      while (sib) {
        y += sib.offsetHeight;
        sib = sib.previousElementSibling;
      }
      return Math.max(0, Math.min(maxScrollY(), y));
    }
    return Math.max(0, Math.min(maxScrollY(), flowOffset(el) - headerHeight()));
  }

  function stackPanels() {
    return Array.from(document.querySelectorAll("main > .stack-panel"));
  }

  function snapYs() {
    const ys = stackPanels().map((el) => panelY(el));
    return [...new Set(ys.map((y) => Math.round(y)))].sort((a, b) => a - b);
  }

  function scrollToY(y, duration = 0.5) {
    const target = Math.max(0, Math.min(maxScrollY(), y));
    const gen = ++scrollGen;
    scrollTween?.kill();
    programmaticScroll = true;
    const clear = () => {
      if (gen !== scrollGen) return;
      programmaticScroll = false;
      scrollTween = null;
      scrollTargetIndex = -1;
    };
    const node = frameScroller();
    if (!hasGsap || !hasScrollTo || reduced || duration === 0) {
      if (node) node.scrollTo(0, target);
      else window.scrollTo(0, target);
      clear();
      return;
    }
    scrollTween = gsap.to(node || window, {
      scrollTo: { y: target, autoKill: true },
      duration,
      ease: "power3.out",
      overwrite: true,
      onComplete: clear,
      onInterrupt: clear
    });
  }

  function scrollToEl(el, duration = 0.5) {
    if (!el) return;
    const index = stackPanels().indexOf(el);
    if (index >= 0) scrollTargetIndex = index;
    scrollToY(panelY(el), duration);
  }

  function panelMetrics(panel) {
    const start = panelY(panel);
    const view = viewHeight();
    const end = Math.max(start, start + panel.offsetHeight - view);
    const short = end - start < 80 || panel.offsetHeight <= view - headerHeight() + 32;
    return { start, end, short };
  }

  function indexAt(y, panels) {
    let idx = 0;
    let best = Infinity;
    panels.forEach((panel, i) => {
      const dist = Math.abs(panelY(panel) - y);
      if (dist < best) {
        best = dist;
        idx = i;
      }
    });
    return idx;
  }

  function settleScroll(direction) {
    if (!theaterEnabled() || programmaticScroll || scrollTween) return;
    const y = scrollY();
    const points = snapYs();
    if (!points.length) return;
    const threshold = viewHeight() * 0.42;
    if (direction < 0) {
      let prev = points[0];
      for (const point of points) {
        if (point <= y + 4) prev = point;
      }
      if (y - prev > 8 && y - prev <= threshold) scrollToY(prev, 0.36);
      return;
    }
    if (direction > 0) {
      const next = points.find((point) => point >= y - 4) ?? points[points.length - 1];
      if (next - y > 8 && next - y <= threshold) scrollToY(next, 0.36);
    }
  }

  const EDGE_ARM_MS = 1000;
  const edgeHold = new WeakMap();
  const bouncing = new WeakSet();

  function bounceScroller(node, dir, onDone) {
    if (reduced || !hasGsap || !node) {
      onDone?.();
      return;
    }
    if (!node.closest || !node.closest("[data-docs]")) {
      onDone?.();
      return;
    }
    if (node.closest(".docs-reader.is-sliding")) {
      onDone?.();
      return;
    }
    if (bouncing.has(node)) {
      gsap.killTweensOf(node, "y");
      bouncing.delete(node);
    }
    bouncing.add(node);
    const offset = dir > 0 ? -14 : 14;
    const done = () => {
      gsap.set(node, { y: 0 });
      bouncing.delete(node);
      onDone?.();
    };
    gsap.timeline({ overwrite: "auto", onComplete: done, onInterrupt: done })
      .fromTo(node, { y: 0 }, { y: offset, duration: 0.08, ease: "power2.out" })
      .to(node, { y: 0, duration: 0.34, ease: "back.out(1.85)" });
  }

  function scrollerAbsorbs(node, event) {
    if (!node) return false;
    const dy = event.deltaY;
    if (!dy) return false;
    const max = node.scrollHeight - node.clientHeight;
    if (max <= 1) return false;
    const dir = dy > 0 ? 1 : -1;
    const atEdge = dir > 0 ? node.scrollTop >= max - 1 : node.scrollTop <= 1;
    if (!atEdge) {
      edgeHold.delete(node);
      return true;
    }
    const now = performance.now();
    const prev = edgeHold.get(node);
    if (bouncing.has(node)) {
      if (event.cancelable) event.preventDefault();
      return true;
    }
    if (prev && prev.dir === dir && now < prev.until) {
      edgeHold.delete(node);
      return false;
    }
    bounceScroller(node, dir, () => {
      const span = node.scrollHeight - node.clientHeight;
      const still =
        dir > 0 ? node.scrollTop >= span - 1 : node.scrollTop <= 1;
      if (still) edgeHold.set(node, { dir, until: performance.now() + EDGE_ARM_MS });
    });
    if (event.cancelable) event.preventDefault();
    return true;
  }

  function isYScroller(node) {
    if (!node || node.nodeType !== 1) return false;
    const overflowY = getComputedStyle(node).overflowY;
    return overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay";
  }

  function docsScrollerAbsorbs(event) {
    const target = event.target;
    const docs = target && target.closest && target.closest("[data-docs]");
    if (!docs) return false;
    let node = target && target.nodeType === 1 ? target : target && target.parentElement;
    while (node && docs.contains(node)) {
      if (isYScroller(node) && scrollerAbsorbs(node, event)) return true;
      if (node === docs) break;
      node = node.parentElement;
    }
    return false;
  }

  function demoPreviewAbsorbs(event) {
    const target = event.target;
    const el = target && target.nodeType === 1 ? target : target && target.parentElement;
    const demo = el && el.closest && el.closest("[data-demo]");
    if (!demo) return false;
    const liveStage = el.closest(".demo-preview__stage[data-kind='live']");
    if (liveStage && !el.closest("[data-demo-scroll], .demo-input, .demo-play__body, .demo-prompt__body")) {
      return false;
    }
    let node = el;
    while (node && demo.contains(node)) {
      if (isYScroller(node) && scrollerAbsorbs(node, event)) return true;
      if (node === demo) break;
      node = node.parentElement;
    }
    return false;
  }

  function shouldIgnoreSwipe(event) {
    if (!event) return true;
    const target = event.target;
    if (target && typeof target.closest === "function" && target.closest("[data-carousel], .lightbox, [data-compare-item], [data-docs-scroll], [data-docs-tree], [data-demo]")) {
      return true;
    }
    const pointerType = event.pointerType;
    if (pointerType === "mouse") return true;
    if (pointerType === "touch" || pointerType === "pen") return false;
    if (event.touches && event.touches.length) return false;
    const type = typeof event.type === "string" ? event.type : "";
    if (type.startsWith("touch")) return false;
    return true;
  }

  function initPageScroll() {
    if (!hasGsap || !hasScrollTo || reduced) return;
    const applyTheaterClass = () => {
      document.documentElement.classList.toggle("gsap-scroll", theaterEnabled());
    };
    applyTheaterClass();
    const theaterMq = compactQuery();
    if (typeof theaterMq.addEventListener === "function") {
      theaterMq.addEventListener("change", applyTheaterClass);
    } else if (typeof theaterMq.addListener === "function") {
      theaterMq.addListener(applyTheaterClass);
    }

    const scroller = frameScroller() || window;
    let lastY = scrollY();
    let scrollDir = 0;
    let settleTimer = 0;
    const onScroll = () => {
      const y = scrollY();
      if (Math.abs(y - lastY) > 1) scrollDir = y > lastY ? 1 : -1;
      lastY = y;
      if (scrollTween) return;
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => settleScroll(scrollDir), 100);
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    scroller.addEventListener("scrollend", () => settleScroll(scrollDir), { passive: true });

    const panels = stackPanels();
    if (panels.length > 1) {
      const activeIndex = () =>
        scrollTween && scrollTargetIndex >= 0 ? scrollTargetIndex : indexAt(scrollY(), panels);

      const goTo = (index, event) => {
        const i = clamp(index, 0, panels.length - 1);
        event?.preventDefault?.();
        scrollTargetIndex = i;
        scrollToEl(panels[i], 0.42);
        return true;
      };

      const goNext = (event) => {
        const i = activeIndex();
        if (!scrollTween) {
          const { end, short } = panelMetrics(panels[i]);
          if (!short && scrollY() < end - 24) return false;
        }
        if (i >= panels.length - 1) return false;
        return goTo(i + 1, event);
      };

      const goPrev = (event) => {
        const y = scrollY();
        const last = panels[panels.length - 1];
        if (!scrollTween && y > panelY(last) + 32) {
          return goTo(panels.length - 1, event);
        }
        const i = activeIndex();
        if (!scrollTween) {
          const { start, short } = panelMetrics(panels[i]);
          if (!short && y > start + 48) return false;
        }
        if (i <= 0) return false;
        return goTo(i - 1, event);
      };

      // One wheel gesture moves one panel. A fast wheel spin or trackpad inertia sends many
      // events; after a move they are held until the wheel has been quiet for a moment.
      const WHEEL_QUIET_MS = 200;
      const WHEEL_STEP = 40;
      let wheelHeld = false;
      let wheelQuiet = 0;
      let wheelSum = 0;
      let wheelSumReset = 0;
      const holdWheel = () => {
        wheelHeld = true;
        window.clearTimeout(wheelQuiet);
        wheelQuiet = window.setTimeout(() => {
          wheelHeld = false;
        }, WHEEL_QUIET_MS);
      };

      window.addEventListener(
        "wheel",
        (event) => {
          if (!theaterEnabled() || event.ctrlKey) return;
          if (docsScrollerAbsorbs(event)) return;
          if (demoPreviewAbsorbs(event)) return;
          if (wheelHeld) {
            holdWheel();
            if (event.cancelable) event.preventDefault();
            return;
          }
          // Small trackpad deltas add up: a slow, light swipe scrolls a little before it pages.
          wheelSum += event.deltaY;
          window.clearTimeout(wheelSumReset);
          wheelSumReset = window.setTimeout(() => {
            wheelSum = 0;
          }, 160);
          const moved = wheelSum > WHEEL_STEP ? goNext(event) : wheelSum < -WHEEL_STEP ? goPrev(event) : false;
          if (moved) {
            wheelSum = 0;
            holdWheel();
          }
        },
        { passive: false, capture: true }
      );

      // Page Down, Page Up, Space, Home and End move by panel; arrow keys keep scrolling freely.
      document.addEventListener("keydown", (event) => {
        if (!theaterEnabled() || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
        const target = event.target instanceof Element ? event.target : null;
        if (target?.closest("input, textarea, select, button, a, [contenteditable], [role=tab], .lightbox")) return;
        if (event.key === "PageDown" || (event.key === " " && !event.shiftKey)) goNext(event);
        else if (event.key === "PageUp" || (event.key === " " && event.shiftKey)) goPrev(event);
        else if (event.key === "Home") goTo(0, event);
        else if (event.key === "End") goTo(panels.length - 1, event);
      });
      const observe = window.Observer
        ? (vars) => window.Observer.create(vars)
        : hasScrollTrigger && typeof window.ScrollTrigger.observe === "function"
          ? (vars) => window.ScrollTrigger.observe(vars)
          : null;
      if (observe) {
        observe({
          type: "touch,pointer",
          tolerance: 28,
          preventDefault: false,
          onDown: (self) => {
            if (!theaterEnabled() || shouldIgnoreSwipe(self.event)) return;
            goPrev(self.event);
          },
          onUp: (self) => {
            if (!theaterEnabled() || shouldIgnoreSwipe(self.event)) return;
            goNext(self.event);
          }
        });
      }
    }

    const refresh = () => {
      if (hasScrollTrigger) window.ScrollTrigger.refresh();
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh).catch(() => {});
    window.addEventListener("load", refresh);
    if (location.hash) {
      const hash = location.hash;
      const docsPanel = hash.startsWith("#doc-") ? document.getElementById("docs") : null;
      let el = docsPanel;
      if (!el) {
        try {
          el = document.querySelector(hash);
        } catch {
          el = null;
        }
      }
      if (el) requestAnimationFrame(() => scrollToEl(el, 0));
    }
  }

  function initSiteNav() {
    const head = document.querySelector(".site-head");
    const nav = head ? head.querySelector(".site-nav") : null;
    const toggle = head ? head.querySelector("[data-nav-toggle]") : null;
    const backdrop = document.querySelector("[data-nav-backdrop]");
    if (!head || !nav || !toggle) return;

    const links = Array.from(nav.querySelectorAll("a"));
    if (!links.length) {
      toggle.hidden = true;
      return;
    }

    let open = false;
    const mq = compactQuery();

    const setOpen = (next, restore) => {
      open = Boolean(next) && head.classList.contains("is-compact");
      head.classList.toggle("is-nav-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      if (backdrop) backdrop.hidden = !open;
      if (open) {
        const active = nav.querySelector("a.is-active") || links[0];
        if (active) active.focus({ preventScroll: true });
      } else if (restore) {
        toggle.focus({ preventScroll: true });
      }
    };

    const syncCompact = () => {
      const compact = mq.matches;
      head.classList.toggle("is-compact", compact);
      if (!compact) setOpen(false, false);
    };

    toggle.addEventListener("click", () => setOpen(!open, true));
    if (backdrop) backdrop.addEventListener("click", () => setOpen(false, true));
    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) setOpen(false, false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || !open) return;
      event.preventDefault();
      setOpen(false, true);
    });
    document.addEventListener("focusin", (event) => {
      if (!open) return;
      if (head.contains(event.target) || (backdrop && backdrop.contains(event.target))) return;
      setOpen(false, false);
    });

    syncCompact();
    if (typeof mq.addEventListener === "function") mq.addEventListener("change", syncCompact);
    else if (typeof mq.addListener === "function") mq.addListener(syncCompact);
  }

  function initNavigation() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach((link) => {
      link.addEventListener("click", (event) => {
        const hash = link.getAttribute("href");
        if (!hash || hash === "#") return;
        const target = document.querySelector(hash);
        if (!target) return;
        event.preventDefault();
        history.replaceState(null, "", hash);
        scrollToEl(target, 0.55);
      });
    });

    const navLinks = Array.from(document.querySelectorAll(".site-head nav a[data-nav-anchor]"));
    const sections = navLinks
      .map((link) => {
        const hash = link.getAttribute("href");
        return { link, section: hash && hash !== "#" ? document.querySelector(hash) : null };
      })
      .filter((item) => item.section);
    if (!sections.length) return;

    const setActive = (hash) => {
      sections.forEach(({ link }) => link.classList.toggle("is-active", link.getAttribute("href") === hash));
    };

    if (hasScrollTrigger) {
      sections.forEach(({ link, section }) => {
        window.ScrollTrigger.create(scrollTriggerVars({
          trigger: section,
          start: () => (frameScroller() ? "top 72px" : `top ${headerHeight() + 72}px`),
          end: () => (frameScroller() ? "bottom 72px" : `bottom ${headerHeight() + 72}px`),
          invalidateOnRefresh: true,
          // A panel without a header link (the closing one) leaves no link lit.
          onToggle: (self) => {
            if (self.isActive) setActive(link.getAttribute("href"));
            else link.classList.remove("is-active");
          }
        }));
      });
      return;
    }

    let spyTick = false;
    const spy = () => {
      const node = frameScroller();
      const origin = node ? node.getBoundingClientRect().top : 0;
      const line = origin + (node ? 0 : headerHeight()) + viewHeight() * 0.35;
      let current = sections[0].link.getAttribute("href");
      sections.forEach(({ link, section }) => {
        if (section.getBoundingClientRect().top <= line) current = link.getAttribute("href");
      });
      setActive(current);
      spyTick = false;
    };
    (frameScroller() || window).addEventListener("scroll", () => {
      if (!spyTick) {
        spyTick = true;
        window.requestAnimationFrame(spy);
      }
    }, { passive: true });
    spy();
  }

  function initToTop() {
    const button = document.querySelector(".to-top");
    if (!button) return;
    const toggle = () => button.classList.toggle("is-visible", scrollY() > 600);
    toggle();
    if (hasScrollTrigger) {
      window.ScrollTrigger.create(scrollTriggerVars({
        start: 600,
        onToggle: (self) => button.classList.toggle("is-visible", self.scroll() > 600),
        onUpdate: (self) => button.classList.toggle("is-visible", self.scroll() > 600)
      }));
    } else {
      (frameScroller() || window).addEventListener("scroll", toggle, { passive: true });
    }
    button.addEventListener("click", () => scrollToY(0, 0.55));
  }

  /* ------------------------------------------------------------------ */
  /* Entrance animations                                                  */
  /* ------------------------------------------------------------------ */

  const HERO_SELECTORS = [
    ".hero .hero-brand",
    ".hero h1",
    ".hero .lede",
    ".hero .actions .button",
    ".hero .hero-command",
    ".hero .hero-stage"
  ];

  const ABOUT_ENTER = [
    ".about-head",
    ".about-features__index > li",
    ".about-features__stage",
    ".about-path__index > li",
    ".about-path__said",
    ".about-asides__index > li"
  ];

  const FAQ_ENTER = [".faq .section-head", ".faq-item"];
  const DOCS_ENTER = [".docs-tree", ".docs-reader"];

  const ENTER_EASE = "power3.out";
  const playedEnter = typeof WeakSet === "function" ? new WeakSet() : null;

  function queryAll(selectors) {
    return gsap.utils.toArray(selectors.join(","));
  }

  function isMediaEnter(el) {
    return el.matches(".hero .hero-stage, .screens-media, .screens-image");
  }

  function enterOffset(el) {
    return isMediaEnter(el) ? { y: 10, scale: 1 } : { y: 6, scale: 1 };
  }

  function setEntering(els, on) {
    els.forEach((el) => el.classList.toggle("is-entering", on));
  }

  function markPlayed(el) {
    if (playedEnter) playedEnter.add(el);
    else el.setAttribute("data-entered", "");
  }

  function wasPlayed(el) {
    return playedEnter ? playedEnter.has(el) : el.hasAttribute("data-entered");
  }

  function releaseEnter(els) {
    setEntering(els, false);
    gsap.set(els, { clearProps: "transform,opacity,visibility" });
  }

  function playEnter(els, vars = {}) {
    const pending = els.filter((el) => !wasPlayed(el));
    if (!pending.length) return null;
    pending.forEach(markPlayed);
    setEntering(pending, true);
    return gsap.to(pending, {
      y: 0,
      scale: 1,
      autoAlpha: 1,
      duration: 0.72,
      ease: ENTER_EASE,
      stagger: 0.05,
      overwrite: true,
      ...vars,
      onComplete: () => releaseEnter(pending)
    });
  }

  function prepareEnter(els) {
    els.forEach((el) => {
      const from = enterOffset(el);
      gsap.set(el, { y: from.y, scale: from.scale, autoAlpha: 0 });
    });
    setEntering(els, true);
  }

  function playHero(items) {
    if (!items.length) return;
    const copy = items.filter((el) => !isMediaEnter(el));
    const media = items.filter(isMediaEnter);
    const pending = items.filter((el) => !wasPlayed(el));
    pending.forEach(markPlayed);
    setEntering(pending, true);
    const tl = gsap.timeline({
      defaults: { ease: ENTER_EASE, overwrite: "auto" },
      onComplete: () => releaseEnter(pending)
    });
    if (copy.length) {
      tl.to(copy, { y: 0, scale: 1, autoAlpha: 1, duration: 0.78, stagger: 0.05 }, 0);
    }
    if (media.length) {
      tl.to(media, { y: 0, scale: 1, autoAlpha: 1, duration: 0.86, stagger: 0.06 }, copy.length ? 0.08 : 0);
    }
  }

  function bindPanelReveals(items) {
    if (!items.length) return;
    const groups = new Map();
    items.forEach((el) => {
      const panel = el.closest("main > .stack-panel") || el;
      const list = groups.get(panel);
      if (list) list.push(el);
      else groups.set(panel, [el]);
    });

    if (!hasScrollTrigger) {
      groups.forEach((els) => playEnter(els));
      return;
    }

    groups.forEach((els, panel) => {
      window.ScrollTrigger.create(scrollTriggerVars({
        trigger: panel,
        start: "clamp(top 82%)",
        once: true,
        onEnter: () => playEnter(els)
      }));
    });
  }

  function releaseMotionCss() {
    document.documentElement.classList.remove("js-motion", "is-motion-ready");
  }

  function initMotion() {
    if (!hasGsap) {
      releaseMotionCss();
      return;
    }

    try {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: reduce)", () => {
        releaseMotionCss();
      });
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        document.documentElement.classList.add("js-motion");
        const hero = queryAll(HERO_SELECTORS).filter((el) => el.closest(".hero"));
        prepareEnter(hero);
        if (theaterEnabled()) {
          stackPanels().forEach((panel, index) => {
            if (index > 0) panel.style.setProperty("--stack-content", "0");
          });
        }
        document.documentElement.classList.add("is-motion-ready");
        playHero(hero);
        const aboutBits = queryAll(ABOUT_ENTER);
        if (aboutBits.length) {
          prepareEnter(aboutBits);
          bindPanelReveals(aboutBits);
        }
        const faqBits = queryAll(FAQ_ENTER);
        if (faqBits.length) {
          prepareEnter(faqBits);
          bindPanelReveals(faqBits);
        }
        const docsBits = queryAll(DOCS_ENTER);
        if (docsBits.length) {
          prepareEnter(docsBits);
          bindPanelReveals(docsBits);
        }
        return () => {
          document.documentElement.classList.remove("is-motion-ready");
        };
      });
    } catch (error) {
      releaseMotionCss();
      throw error;
    }
  }

  /* ------------------------------------------------------------------ */
  /* Copy-to-clipboard for the install command                           */
  /* ------------------------------------------------------------------ */

  function fadeCurve(value) {
    const t = clamp(value, 0, 1);
    return t * t * (3 - 2 * t);
  }

  function syncPanelContentFade(panels) {
    if (!theaterEnabled()) {
      panels.forEach((panel) => {
        panel.style.setProperty("--stack-content", "1");
        panel.style.setProperty("--stack-shade", "0");
        panel.removeAttribute("inert");
      });
      return;
    }
    const y = scrollY();
    const view = Math.max(1, viewHeight());
    panels.forEach((panel, index) => {
      const start = panelY(panel);
      const next = panels[index + 1];
      const arrive = clamp(1 - (start - y) / view, 0, 1);
      const span = next ? Math.max(1, panelY(next) - start) : view;
      const cover = next ? clamp((y - start) / span, 0, 1) : 0;
      const opacity = fadeCurve(arrive) * (1 - fadeCurve(cover));
      panel.style.setProperty("--stack-content", opacity.toFixed(4));
      if (next) {
        panel.style.setProperty("--stack-shade", String(cover * 0.32));
        if (cover >= 0.98) panel.setAttribute("inert", "");
        else panel.removeAttribute("inert");
      }
    });
  }

  function initStack() {
    const panels = Array.from(document.querySelectorAll("main > .stack-panel"));
    panels.forEach((panel, index) => {
      panel.style.zIndex = String(index + 1);
    });
    if (!hasScrollTrigger || reduced || panels.length < 2) return;
    const update = () => syncPanelContentFade(panels);
    update();
    window.ScrollTrigger.create(scrollTriggerVars({
      start: 0,
      end: "max",
      onUpdate: update,
      onRefresh: update
    }));
  }

  function initProofTabs() {
    document.querySelectorAll("[data-proof-tabs]").forEach((root) => {
      const tabs = Array.from(root.querySelectorAll("[role='tab']"));
      const panels = Array.from(root.querySelectorAll("[role='tabpanel']"));
      if (!tabs.length || tabs.length !== panels.length) return;
      const select = (index) => {
        tabs.forEach((tab, i) => {
          const on = i === index;
          tab.classList.toggle("is-on", on);
          tab.setAttribute("aria-selected", String(on));
          tab.tabIndex = on ? 0 : -1;
          panels[i].hidden = !on;
        });
      };
      tabs.forEach((tab, index) => {
        tab.addEventListener("click", () => select(index));
        tab.addEventListener("keydown", (event) => {
          if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
          event.preventDefault();
          const next = event.key === "ArrowRight"
            ? (index + 1) % tabs.length
            : (index - 1 + tabs.length) % tabs.length;
          select(next);
          tabs[next].focus();
        });
      });
    });
  }

  function initCompareSlider() {
    document.querySelectorAll("[data-compare-slider]").forEach((root) => {
      const handle = root.querySelector("[data-compare-handle]");
      const after = root.querySelector(".comparison__slider-after");
      if (!after) return;
      const setSplit = (pct) => {
        const next = Math.min(0.92, Math.max(0.08, pct));
        root.style.setProperty("--split", `${(next * 100).toFixed(2)}%`);
        if (handle) handle.setAttribute("aria-valuenow", String(Math.round(next * 100)));
      };
      if (handle) {
        const fromPointer = (event) => {
          const point = event.touches ? event.touches[0] : event;
          if (!point) return;
          const stage = after.parentElement || root;
          const box = stage.getBoundingClientRect();
          if (!box.width) return;
          setSplit((point.clientX - box.left) / box.width);
        };
        let dragging = false;
        handle.addEventListener("pointerdown", (event) => {
          dragging = true;
          handle.setPointerCapture(event.pointerId);
          handle.focus();
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
          const now = Number(handle.getAttribute("aria-valuenow") || 50) / 100;
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            setSplit(now - 0.04);
          }
          if (event.key === "ArrowRight") {
            event.preventDefault();
            setSplit(now + 0.04);
          }
          if (event.key === "Home") {
            event.preventDefault();
            setSplit(0.08);
          }
          if (event.key === "End") {
            event.preventDefault();
            setSplit(0.92);
          }
        });
      }
      setSplit(0.5);
    });
  }

  function selectCommandText(host) {
    const node = host.querySelector("code") || host;
    const selection = window.getSelection && window.getSelection();
    if (!selection || !node) return;
    const range = document.createRange();
    range.selectNodeContents(node);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function initCopy() {
    document.querySelectorAll("[data-copy]").forEach((button) => {
      if (button.classList.contains("demo-copy")) return;
      const label = button.querySelector("[data-copy-label]");
      const host = button.closest(".hero-command, .command-slab") || button;
      const toast = host.querySelector("[data-copy-toast]");
      if (!label && !toast && !button.getAttribute("aria-label")) return;
      const initialLabel = label?.textContent ?? "";
      const initialAria = button.getAttribute("aria-label");
      let timer = 0;
      button.addEventListener("click", async () => {
        const text = button.getAttribute("data-copy") ?? "";
        let ok = false;
        try {
          await navigator.clipboard.writeText(text);
          ok = true;
        } catch {}
        const message = ok ? "Copied" : "Select the command";
        if (label) label.textContent = message;
        if (initialAria) button.setAttribute("aria-label", message);
        button.classList.toggle("is-copied", ok);
        host.classList.toggle("is-copied", ok);
        if (toast) toast.textContent = message;
        if (!ok) selectCommandText(host);
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          if (label) label.textContent = initialLabel;
          if (initialAria) button.setAttribute("aria-label", initialAria);
          button.classList.remove("is-copied");
          host.classList.remove("is-copied");
          if (toast) toast.textContent = "";
        }, 1800);
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Theme toggle: sun / moon, persisted                                  */
  /* ------------------------------------------------------------------ */

  const THEME_KEY = `gvaste-theme:${location.pathname}`;

  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  }

  function applyTheme(theme, persist) {
    document.documentElement.setAttribute("data-theme", theme);
    const scheme = document.querySelector('meta[name="color-scheme"]');
    const paint = document.querySelector('meta[name="theme-color"]');
    if (scheme) scheme.setAttribute("content", theme);
    if (paint) {
      const paper = document.documentElement.getAttribute(
        theme === "light" ? "data-paper-light" : "data-paper-dark",
      );
      paint.setAttribute("content", paper || (theme === "light" ? "#eee8dc" : "#000000"));
    }
    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      button.setAttribute("aria-label", theme === "dark" ? "Use light theme" : "Use dark theme");
    });
    if (persist) {
      try {
        localStorage.setItem(THEME_KEY, theme);
      } catch {}
    }
    heroShades.forEach((shade) => shade.sync());
    syncGithubTheme(theme);
  }

  const THEME_WIPE_DURATION = 0.85;
  let themeWipeTween = null;
  let themeWiping = false;

  function clearThemeWipe() {
    if (themeWipeTween) {
      themeWipeTween.kill();
      themeWipeTween = null;
    }
    document.querySelectorAll(".theme-wipe").forEach((node) => node.remove());
  }

  function buildThemeSnapshot() {
    const overlay = document.createElement("div");
    overlay.className = "theme-wipe";
    overlay.setAttribute("aria-hidden", "true");
    const shot = document.createElement("div");
    shot.className = "theme-wipe__shot";
    const clone = document.body.cloneNode(true);
    clone.querySelectorAll("script, .theme-wipe").forEach((node) => node.remove());
    clone.querySelectorAll("canvas").forEach((node) => node.remove());
    clone.style.position = "relative";
    clone.style.top = `${-window.scrollY}px`;
    shot.appendChild(clone);
    overlay.appendChild(shot);
    return overlay;
  }

  function wipeThemeWithGsap(next) {
    if (!hasGsap) {
      applyTheme(next, true);
      return;
    }
    clearThemeWipe();
    const overlay = buildThemeSnapshot();
    document.body.appendChild(overlay);
    applyTheme(next, true);
    themeWiping = true;
    themeWipeTween = gsap.fromTo(
      overlay,
      { clipPath: "inset(0% 0% 0% 0%)" },
      {
        clipPath: "inset(100% 0% 0% 0%)",
        duration: THEME_WIPE_DURATION,
        ease: "power4.out",
        onComplete: () => {
          overlay.remove();
          themeWipeTween = null;
          themeWiping = false;
        }
      }
    );
  }

  function requestThemeChange(next) {
    if (next === currentTheme() || themeWiping) return;
    if (reduced) {
      applyTheme(next, true);
      return;
    }
    if (typeof document.startViewTransition === "function") {
      themeWiping = true;
      const transition = document.startViewTransition(() => {
        applyTheme(next, true);
      });
      const unlock = () => {
        themeWiping = false;
      };
      if (transition.finished) transition.finished.then(unlock, unlock);
      else unlock();
      return;
    }
    wipeThemeWithGsap(next);
  }

  function initTheme() {
    applyTheme(currentTheme(), false);
    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      button.addEventListener("click", () => {
        requestThemeChange(currentTheme() === "dark" ? "light" : "dark");
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Section widgets: pointer tilt                                       */
  /* ------------------------------------------------------------------ */

  function initTilt() {
    if (reduced || !hasGsap) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    document.querySelectorAll("[data-tilt]").forEach((el) => {
      const rx = gsap.quickTo(el, "rotationX", { duration: 0.6, ease: "power3.out" });
      const ry = gsap.quickTo(el, "rotationY", { duration: 0.6, ease: "power3.out" });
      el.addEventListener("pointerenter", () => gsap.set(el, { transformPerspective: 1200 }));
      el.addEventListener("pointermove", (event) => {
        const rect = el.getBoundingClientRect();
        const px = (event.clientX - rect.left) / Math.max(1, rect.width) - 0.5;
        const py = (event.clientY - rect.top) / Math.max(1, rect.height) - 0.5;
        rx(-py * 3.5);
        ry(px * 4.5);
      });
      el.addEventListener("pointerleave", () => {
        rx(0);
        ry(0);
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Data sections: about path, faq accordion, commands                 */
  /* ------------------------------------------------------------------ */


  function initFaq() {
    document.querySelectorAll("[data-faq]").forEach((root) => {
      const exclusive = root.getAttribute("data-faq-exclusive") !== "false";
      const items = Array.from(root.querySelectorAll("[data-faq-item]"));
      if (!items.length) return;
      root.classList.add("is-enhanced");
      items.forEach((item) => item.removeAttribute("name"));
      const summaries = items.map((item) => item.querySelector("summary")).filter(Boolean);
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const setOpenClass = (item, on) => {
        item.classList.toggle("is-open", on);
        const summary = item.querySelector("summary");
        if (summary) summary.setAttribute("aria-expanded", on ? "true" : "false");
      };
      const openItem = (item) => {
        item.open = true;
        if (reducedMotion) { setOpenClass(item, true); return; }
        if (!item.classList.contains("is-open")) {
          setOpenClass(item, false);
          requestAnimationFrame(() => setOpenClass(item, true));
          return;
        }
        setOpenClass(item, true);
      };
      const closeItem = (item) => {
        if (!item.open && !item.classList.contains("is-open")) return;
        setOpenClass(item, false);
        if (reducedMotion) { item.open = false; return; }
        const body = item.querySelector(".faq-item__body");
        let done = false;
        const finish = () => {
          if (done) return;
          done = true;
          item.open = false;
          body?.removeEventListener("transitionend", onEnd);
        };
        const onEnd = (event) => {
          if (event.target !== body) return;
          if (event.propertyName && event.propertyName !== "grid-template-rows") return;
          finish();
        };
        body?.addEventListener("transitionend", onEnd);
        window.setTimeout(finish, 400);
      };
      items.forEach((item) => {
        const summary = item.querySelector("summary");
        if (!summary) return;
        summary.addEventListener("click", (event) => {
          event.preventDefault();
          const willOpen = !item.classList.contains("is-open");
          if (willOpen) {
            if (exclusive) items.forEach((other) => { if (other !== item) closeItem(other); });
            openItem(item);
            return;
          }
          closeItem(item);
        });
      });
      root.addEventListener("keydown", (event) => {
        const index = summaries.indexOf(document.activeElement);
        if (index === -1) return;
        let next = -1;
        if (event.key === "ArrowDown" || event.key === "ArrowRight") next = (index + 1) % summaries.length;
        else if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = (index - 1 + summaries.length) % summaries.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = summaries.length - 1;
        else return;
        event.preventDefault();
        summaries[next]?.focus();
      });
      const fromHash = () => {
        const hash = String(location.hash || "").replace(/^#/, "");
        if (!hash.startsWith("faq-")) return;
        const target = items.find((item) => item.id === hash);
        if (!target) return;
        if (exclusive) items.forEach((other) => { if (other !== target) closeItem(other); });
        openItem(target);
      };
      fromHash();
      window.addEventListener("hashchange", fromHash);
    });
  }

  function initAbout() {
    const bodyOf = (button) => button.parentElement?.querySelector("[data-about-body]")?.textContent ?? "";

    const swapText = (el, next, animate) => {
      if (!el) return;
      const token = (Number(el.dataset.aboutSwap) || 0) + 1;
      el.dataset.aboutSwap = String(token);
      if (!animate || reduced || !el.textContent) {
        el.textContent = next;
        el.classList.remove("is-swap");
        return;
      }
      const finish = (event) => {
        if (event && event.propertyName && event.propertyName !== "opacity") return;
        if (el.dataset.aboutSwap !== String(token)) return;
        el.removeEventListener("transitionend", finish);
        el.textContent = next;
        el.classList.remove("is-swap");
      };
      el.addEventListener("transitionend", finish);
      el.classList.add("is-swap");
      if (el.classList.contains("is-swap") && getComputedStyle(el).transitionDuration === "0s") {
        finish();
      }
    };

    document.querySelectorAll("[data-about-path]").forEach((root) => {
      const buttons = Array.from(root.querySelectorAll("[data-about-step]"));
      const said = root.querySelector("[data-about-said]");
      const ink = root.querySelector("[data-about-ink]");
      const track = root.querySelector(".about-path__track") ?? root;
      if (!buttons.length || !said) return;

      const placeInk = (button, animate) => {
        if (!ink || !button) return;
        const box = {
          x: button.offsetLeft,
          y: button.offsetTop + button.offsetHeight - 2,
          width: button.offsetWidth,
          height: 2
        };
        if (hasGsap && !reduced && animate) {
          gsap.to(ink, {
            x: box.x,
            y: box.y,
            width: box.width,
            height: 2,
            opacity: 1,
            duration: 0.28,
            ease: "power3.out",
            overwrite: "auto"
          });
          return;
        }
        if (hasGsap) {
          gsap.set(ink, { x: box.x, y: box.y, width: box.width, height: 2, opacity: 1 });
          return;
        }
        ink.style.transform = `translate(${box.x}px, ${box.y}px)`;
        ink.style.width = `${box.width}px`;
        ink.style.opacity = "1";
      };

      const setActive = (button, animate) => {
        buttons.forEach((el) => {
          const on = el === button;
          el.classList.toggle("is-on", on);
          el.setAttribute("aria-expanded", on ? "true" : "false");
        });
        swapText(said, bodyOf(button), animate);
        placeInk(button, animate);
      };

      buttons.forEach((button) => {
        button.addEventListener("click", () => setActive(button, true));
      });

      root.addEventListener("keydown", (event) => {
        const index = buttons.indexOf(document.activeElement);
        if (index === -1) return;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          event.preventDefault();
          const next = buttons[(index + 1) % buttons.length];
          next.focus();
          setActive(next, true);
        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          event.preventDefault();
          const prev = buttons[(index - 1 + buttons.length) % buttons.length];
          prev.focus();
          setActive(prev, true);
        }
      });

      const initial = buttons.find((el) => el.classList.contains("is-on")) ?? buttons[0];
      placeInk(initial, false);
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => placeInk(initial, false)).catch(() => {});
      }
      if ("ResizeObserver" in window) {
        new ResizeObserver(() => {
          const on = buttons.find((el) => el.classList.contains("is-on")) ?? buttons[0];
          placeInk(on, false);
        }).observe(track);
      }
    });

    document.querySelectorAll("[data-about-features]").forEach((root) => {
      const buttons = Array.from(root.querySelectorAll("[data-about-feature]"));
      const panels = Array.from(root.querySelectorAll("[role='tabpanel']"));
      const stage = root.querySelector(".about-features__stage");
      if (!buttons.length || !panels.length) return;

      const showPanel = (panel) => {
        panels.forEach((el) => {
          const on = el === panel;
          el.classList.toggle("is-on", on);
          el.hidden = !on;
          el.toggleAttribute("inert", !on);
        });
      };

      const setActive = (button, animate) => {
        const panel = panels.find((el) => el.id === button.getAttribute("aria-controls"));
        buttons.forEach((el) => {
          const on = el === button;
          el.classList.toggle("is-on", on);
          el.setAttribute("aria-selected", on ? "true" : "false");
          el.tabIndex = on ? 0 : -1;
        });
        if (!panel) return;
        if (!animate || reduced || !stage) {
          stage?.classList.remove("is-swap");
          showPanel(panel);
          return;
        }
        const token = (Number(stage.dataset.aboutSwap) || 0) + 1;
        stage.dataset.aboutSwap = String(token);
        const finish = (event) => {
          if (event && event.propertyName && event.propertyName !== "opacity") return;
          if (stage.dataset.aboutSwap !== String(token)) return;
          stage.removeEventListener("transitionend", finish);
          showPanel(panel);
          stage.classList.remove("is-swap");
        };
        stage.addEventListener("transitionend", finish);
        stage.classList.add("is-swap");
        if (getComputedStyle(stage).transitionDuration === "0s") finish();
      };

      buttons.forEach((button) => {
        button.addEventListener("click", () => setActive(button, true));
      });

      root.addEventListener("keydown", (event) => {
        const index = buttons.indexOf(document.activeElement);
        if (index === -1) return;
        let next = -1;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % buttons.length;
        else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + buttons.length) % buttons.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = buttons.length - 1;
        else return;
        event.preventDefault();
        buttons[next]?.focus();
        setActive(buttons[next], true);
      });
    });

    document.querySelectorAll("[data-about-asides]").forEach((root) => {
      const buttons = Array.from(root.querySelectorAll("[data-about-note]"));
      const said = root.querySelector("[data-about-aside-said]");
      if (!buttons.length || !said) return;

      const close = () => {
        buttons.forEach((el) => {
          el.classList.remove("is-on");
          el.setAttribute("aria-expanded", "false");
        });
        said.hidden = true;
        said.textContent = "";
        said.classList.remove("is-swap");
      };

      const open = (button, animate) => {
        buttons.forEach((el) => {
          const on = el === button;
          el.classList.toggle("is-on", on);
          el.setAttribute("aria-expanded", on ? "true" : "false");
        });
        said.hidden = false;
        swapText(said, bodyOf(button), animate);
      };

      buttons.forEach((button) => {
        button.addEventListener("click", () => {
          if (button.classList.contains("is-on")) close();
          else open(button, true);
        });
      });
    });
  }

  let keyAudio = null;
  let keyNoise = null;
  let keyTickAt = 0;

  function keyAudioContext() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!keyAudio) {
      keyAudio = new AC();
      const length = Math.max(1, Math.floor(keyAudio.sampleRate * 0.028));
      keyNoise = keyAudio.createBuffer(1, length, keyAudio.sampleRate);
      const data = keyNoise.getChannelData(0);
      for (let i = 0; i < length; i += 1) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 3.4;
      }
    }
    if (keyAudio.state === "suspended") {
      keyAudio.resume().catch(() => {});
    }
    return keyAudio;
  }

  function playKeyTick(voice = "mech", opts = {}) {
    const audio = keyAudioContext();
    if (!audio || !keyNoise) return;
    const fire = () => {
      if (audio.state !== "running") return;
      const now = performance.now();
      if (!opts.force && now - keyTickAt < 42) return;
      keyTickAt = now;
      const t = audio.currentTime;
      if (voice === "beep") {
        const osc = audio.createOscillator();
        osc.type = "square";
        osc.frequency.value = 880 + Math.random() * 260;
        const gain = audio.createGain();
        gain.gain.setValueAtTime(0.02, t);
        gain.gain.exponentialRampToValueAtTime(0.0004, t + 0.045);
        osc.connect(gain);
        gain.connect(audio.destination);
        osc.start(t);
        osc.stop(t + 0.05);
        return;
      }
      const src = audio.createBufferSource();
      src.buffer = keyNoise;
      const filter = audio.createBiquadFilter();
      filter.type = "bandpass";
      const gain = audio.createGain();
      if (voice === "tick") {
        filter.frequency.value = 1200 + Math.random() * 500;
        filter.Q.value = 1.6;
        gain.gain.setValueAtTime(0.028, t);
        gain.gain.exponentialRampToValueAtTime(0.0005, t + 0.02);
        src.connect(filter);
        filter.connect(gain);
        gain.connect(audio.destination);
        src.start(t);
        src.stop(t + 0.022);
        return;
      }
      filter.frequency.value = 2100 + Math.random() * 1100;
      filter.Q.value = 3.2;
      gain.gain.setValueAtTime(0.016, t);
      gain.gain.exponentialRampToValueAtTime(0.0006, t + 0.03);
      src.connect(filter);
      filter.connect(gain);
      gain.connect(audio.destination);
      src.start(t);
      src.stop(t + 0.032);
    };
    if (audio.state === "suspended") {
      audio.resume().then(fire).catch(() => {});
      return;
    }
    fire();
  }

  function keyboardVoice(root) {
    if (root.classList.contains("keyboard--terminal")) return "beep";
    return "mech";
  }

  function initCommandKeyboard(section) {
    const root = section.querySelector("[data-keyboard]");
    if (!root) return;
    const rows = Array.from(section.querySelectorAll(".key-table tbody tr[data-keys]"));
    if (!rows.length) return;
    const keys = Array.from(root.querySelectorAll("[data-key]"));
    const byId = new Map();
    keys.forEach((el) => {
      const raw = el.getAttribute("data-bind") || el.getAttribute("data-key");
      const ids = (raw || "").split(/\s+/).filter(Boolean);
      ids.forEach((id) => {
        const group = byId.get(id);
        if (group) group.push(el);
        else byId.set(id, [el]);
      });
    });

    const idsFrom = (row) => (row.getAttribute("data-keys") || "").split(/\s+/).filter(Boolean);

    const voice = keyboardVoice(root);
    let tickTimers = [];
    const clearTicks = () => {
      tickTimers.forEach((id) => window.clearTimeout(id));
      tickTimers = [];
    };

    const motion = hasGsap && !reduced;
    if (motion) root.classList.add("has-gsap-keys");

    const board = root.querySelector(".keyboard__board");
    const unit = Number.parseFloat(board ? getComputedStyle(board).getPropertyValue("--u") : "") || 28;
    const isMac = root.classList.contains("keyboard--mac");
    const isTerminal = root.classList.contains("keyboard--terminal");
    const pressTo = isMac
      ? { y: 1, scale: 0.98 }
      : isTerminal
        ? { y: 1, "--tty-fill": "100%" }
        : { y: Math.round(unit * 0.085 * 10) / 10 };
    const restTo = isMac ? { y: 0, scale: 1 } : isTerminal ? { y: 0, "--tty-fill": "0%" } : { y: 0 };
    const tweenVars = { ease: "power2.out", overwrite: "auto", force3D: false };
    const restDelay = new Map();
    const clearProps = isTerminal ? "transform,--tty-fill" : "transform";

    const cancelRest = (el) => {
      restDelay.get(el)?.kill();
      restDelay.delete(el);
    };

    const idleKey = (el) => {
      if (el.classList.contains("is-lit") || el.classList.contains("is-hovering") || el.classList.contains("is-down")) {
        return;
      }
      gsap.set(el, { clearProps });
    };

    const pressKeys = (targets, stagger = 0) => {
      if (!motion || !targets.length) return;
      targets.forEach((el) => cancelRest(el));
      gsap.to(targets, { ...pressTo, ...tweenVars, duration: 0.12, stagger });
    };

    const restKeys = (targets, { snap = false, delay = 0, stagger = 0 } = {}) => {
      if (!motion || !targets.length) return;
      targets.forEach((el) => cancelRest(el));
      if (snap) {
        gsap.killTweensOf(targets);
        gsap.set(targets, { clearProps });
        return;
      }
      if (delay) {
        targets.forEach((el) => {
          restDelay.set(
            el,
            gsap.delayedCall(delay, () => {
              restDelay.delete(el);
              gsap.to(el, {
                ...restTo,
                ...tweenVars,
                duration: 0.1,
                ease: "power2.inOut",
                onComplete: () => idleKey(el),
              });
            }),
          );
        });
        return;
      }
      gsap.to(targets, {
        ...restTo,
        ...tweenVars,
        duration: 0.1,
        ease: "power2.inOut",
        stagger,
        onComplete() {
          targets.forEach(idleKey);
        },
      });
    };

    let current = null;
    let pendingRow = null;
    let lightFrame = 0;

    const stopLightFrame = () => {
      if (!lightFrame) return;
      cancelAnimationFrame(lightFrame);
      lightFrame = 0;
    };

    const applyLight = (row) => {
      if (current?.row === row) return;
      const ids = idsFrom(row);
      const els = [];
      ids.forEach((id) => {
        const group = byId.get(id);
        if (!group) return;
        group.forEach((el) => els.push(el));
      });
      const nextSet = new Set(els);
      const leaving = [];
      (current?.els || []).forEach((el) => {
        if (nextSet.has(el)) return;
        el.classList.remove("is-lit", "is-hovering");
        leaving.push(el);
      });
      els.forEach((el) => el.classList.add("is-lit"));
      current?.row.classList.remove("is-hot");
      row.classList.add("is-hot");
      root.classList.toggle("is-playing", els.length > 0);
      restKeys(leaving, { stagger: 0.02 });
      pressKeys(els, 0.028);
      keyAudioContext();
      clearTicks();
      if (!reduced) {
        ids.forEach((id, index) => {
          if (!byId.get(id)) return;
          tickTimers.push(
            window.setTimeout(() => playKeyTick(voice, { force: true }), Math.min(index, 5) * 32),
          );
        });
      }
      current = { row, els };
    };

    const clear = () => {
      pendingRow = null;
      stopLightFrame();
      root.classList.remove("is-playing");
      clearTicks();
      if (!current) return;
      current.row.classList.remove("is-hot");
      current.els.forEach((el) => el.classList.remove("is-lit", "is-hovering"));
      restKeys(current.els, { stagger: 0.02 });
      current = null;
    };

    const light = (row) => {
      pendingRow = row;
      if (lightFrame) return;
      if (!current) {
        pendingRow = null;
        applyLight(row);
        return;
      }
      lightFrame = requestAnimationFrame(() => {
        lightFrame = 0;
        const next = pendingRow;
        pendingRow = null;
        if (next) applyLight(next);
      });
    };

    rows.forEach((row) => {
      row.addEventListener("pointerenter", () => light(row));
    });
    const body = rows[0]?.parentElement;
    if (body) {
      body.addEventListener("pointerleave", (event) => {
        const next = event.relatedTarget;
        if (next && body.contains(next)) return;
        clear();
      });
    }

    const releaseKey = (el) => {
      el.classList.remove("is-down");
      if (!el.classList.contains("is-lit") && !el.classList.contains("is-hovering")) restKeys([el]);
    };
    keys.forEach((el) => {
      el.addEventListener("pointerenter", (event) => {
        if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
        el.classList.add("is-hovering");
        pressKeys([el]);
        playKeyTick(voice);
      });
      el.addEventListener("pointerleave", (event) => {
        if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
        el.classList.remove("is-hovering");
        if (el.classList.contains("is-lit")) return;
        restKeys([el], { delay: 0.1 });
      });
      el.addEventListener("pointerdown", (event) => {
        keyAudioContext();
        if (event.pointerType !== "touch") return;
        el.classList.add("is-down");
        try {
          el.setPointerCapture(event.pointerId);
        } catch {}
        pressKeys([el]);
        playKeyTick(voice);
      });
      el.addEventListener("pointerup", () => releaseKey(el));
      el.addEventListener("pointercancel", () => releaseKey(el));
    });
  }

  function initCommands() {
    document.querySelectorAll(".commands").forEach((section) => {
      const rows = Array.from(section.querySelectorAll(".key-table tbody tr"));
      if (rows.length >= 8) {
        const input = document.createElement("input");
        input.type = "search";
        input.className = "commands-filter";
        input.setAttribute("aria-label", "Filter commands");
        input.placeholder = "Filter commands";
        const table = section.querySelector(".key-table");
        table.parentNode.insertBefore(input, table);
        input.addEventListener("input", () => {
          const query = input.value.trim().toLowerCase();
          rows.forEach((row) => {
            row.style.display = !query || row.textContent.toLowerCase().includes(query) ? "" : "none";
          });
        });
      }
      initCommandKeyboard(section);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Hero mark: WebGPU shade behind the glyph (vgpu)                     */
  /* ------------------------------------------------------------------ */

  const heroShades = [];

  function loadHeroShadeApi() {
    return Promise.resolve(window.__gvasteHeroShade).then((mod) => mod || null);
  }

  async function mountHeroShade(host, options = {}) {
    const mod = await loadHeroShadeApi();
    if (!mod?.mountHeroShade) return null;
    return mod.mountHeroShade(host, {
      ...options,
      reduced,
      theme: currentTheme,
    });
  }

  function initHeroShade() {
    if (window.matchMedia("(forced-colors: active)").matches) return;
    const hosts = document.querySelectorAll(".hero-icon:not(.hero-icon--file):not([data-shade-managed])");
    if (!hosts.length) return;
    (async () => {
      for (const host of hosts) {
        try {
          const shade = await mountHeroShade(host);
          if (shade) heroShades.push(shade);
        } catch (error) {
          report("hero-shade", error);
        }
      }
    })();
  }

  /* ------------------------------------------------------------------ */
  /* GitHub: public API pulse                                            */
  /* ------------------------------------------------------------------ */

  const GH_API = "https://api.github.com";
  const GH_CACHE_FRESH_MS = 15 * 60 * 1000;
  const GH_CACHE_KEEP_MS = 7 * 24 * 60 * 60 * 1000;

  function escapeText(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function compactNumber(value) {
    const num = Number(value);
    if (!Number.isFinite(num)) return "—";
    if (Math.abs(num) < 1000) return String(Math.round(num));
    return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(num);
  }

  function timeAgo(iso) {
    const then = Date.parse(iso);
    if (!Number.isFinite(then)) return "";
    const sec = Math.round((then - Date.now()) / 1000);
    const abs = Math.abs(sec);
    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
    if (abs < 3600) return rtf.format(Math.round(sec / 60), "minute");
    if (abs < 86400) return rtf.format(Math.round(sec / 3600), "hour");
    if (abs < 86400 * 45) return rtf.format(Math.round(sec / 86400), "day");
    return new Date(then).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  function shortAge(iso, now = Date.now()) {
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

  function firstLine(value, max = 88) {
    const line = String(value ?? "").replace(/\r\n/g, "\n").split("\n")[0].trim();
    if (line.length <= max) return line;
    return `${line.slice(0, max - 1).trim()}…`;
  }

  function plainNote(value, max = 160) {
    const text = String(value ?? "")
      .replace(/\r\n/g, "\n")
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .replace(/^#+\s+/gm, "")
      .replace(/[*_`>~]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!text) return "";
    if (/^Full Changelog:\s*https?:\/\//i.test(text)) return "";
    if (text.length <= max) return text;
    return `${text.slice(0, max - 1).trim()}…`;
  }

  function githubCacheKey(owner, name) {
    return `gvaste-gh:v4:${owner}/${name}`;
  }

  function readGithubCacheRecord(owner, name) {
    const key = githubCacheKey(owner, name);
    try {
      const parsed = parseJSON(localStorage.getItem(key) || sessionStorage.getItem(key));
      if (parsed?.payload?.repo && Date.now() - parsed.at < GH_CACHE_KEEP_MS) return parsed;
    } catch {}
    return null;
  }

  function writeGithubCache(owner, name, payload) {
    const record = JSON.stringify({ at: Date.now(), payload });
    try {
      localStorage.setItem(githubCacheKey(owner, name), record);
    } catch {}
    try {
      sessionStorage.setItem(githubCacheKey(owner, name), record);
    } catch {}
  }

  function readGithubBootstrap(root) {
    const slot = root.querySelector("[data-github-bootstrap]");
    if (!slot) return null;
    try {
      const parsed = parseJSON(slot.textContent);
      return parsed?.repo ? parsed : null;
    } catch {
      return null;
    }
  }

  async function githubGet(url) {
    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
      }
    });
    return response;
  }

  async function githubJson(url) {
    const response = await githubGet(url);
    if (response.status === 202) return { pending: true, ok: false, status: 202, data: null };
    if (!response.ok) return { pending: false, ok: false, status: response.status, data: null };
    return { pending: false, ok: true, status: response.status, data: await response.json() };
  }

  function setGithubText(root, key, text, isHtml = false) {
    const el = root.querySelector(`[data-github="${key}"]`);
    if (!el) return;
    if (!text) {
      el.hidden = true;
      if (!isHtml) el.textContent = "";
      return;
    }
    el.hidden = false;
    if (isHtml) el.innerHTML = text;
    else el.textContent = text;
  }

  const GH_MARK = {
    star: '<path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z"/>',
    fork: '<path d="M12 18m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/><path d="M7 6m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/><path d="M17 6m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/><path d="M7 8v2a2 2 0 0 0 2 2h6a2 2 0 0 0 2 -2v-2"/><path d="M12 12l0 4"/>',
    tag: '<path d="M7.5 7.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M3 6v5.172a2 2 0 0 0 .586 1.414l7.71 7.71a2.41 2.41 0 0 0 3.408 0l5.592 -5.592a2.41 2.41 0 0 0 0 -3.408l-7.71 -7.71a2 2 0 0 0 -1.414 -.586h-5.172a3 3 0 0 0 -3 3z"/>',
    commit: '<path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/><path d="M12 3l0 6"/><path d="M12 15l0 6"/>',
    code: '<path d="M7 8l-4 4l4 4"/><path d="M17 8l4 4l-4 4"/><path d="M14 4l-4 16"/>',
    license: '<path d="M3 21l18 0"/><path d="M5 21v-14l8 -4v18"/><path d="M19 21v-10l-6 -4"/>',
    clock: '<path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M12 7l0 5l3 3"/>',
    issue: '<path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M12 8l0 .01"/><path d="M11 12l1 0l0 4l1 0"/>',
    external: '<path d="M7 17l10 -10"/><path d="M8 7h9v9"/>'
  };

  const SHIELD_BRANDS = {
    rust: { color: "dea584", label: "Rust" },
    slint: { color: "2379f4", label: "Slint" },
    windows: { color: "0078d4", label: "Windows" },
    linux: { color: "fcc624", label: "Linux" },
    javascript: { color: "f7df1e", label: "JavaScript" },
    js: { color: "f7df1e", label: "JavaScript" },
    typescript: { color: "3178c6", label: "TypeScript" },
    ts: { color: "3178c6", label: "TypeScript" },
    python: { color: "3776ab", label: "Python" },
    go: { color: "00add8", label: "Go" },
    golang: { color: "00add8", label: "Go" },
    css: { color: "663399", label: "CSS" },
    html: { color: "e34f26", label: "HTML" },
    scss: { color: "cc6699", label: "SCSS" },
    sass: { color: "cc6699", label: "Sass" },
    shell: { color: "4eaa25", label: "Shell" },
    yaml: { color: "cb171e", label: "YAML" },
    yml: { color: "cb171e", label: "YAML" },
    json: { color: "292929", label: "JSON" },
    markdown: { color: "000000", label: "Markdown" },
    c: { color: "a8b9cc", label: "C" },
    "c++": { color: "00599c", label: "C++" },
    cpp: { color: "00599c", label: "C++" },
    "c#": { color: "512bd4", label: "C#" },
    csharp: { color: "512bd4", label: "C#" },
    java: { color: "437291", label: "Java" },
    ruby: { color: "cc342d", label: "Ruby" },
    php: { color: "777bb4", label: "PHP" },
    swift: { color: "f05138", label: "Swift" },
    kotlin: { color: "7f52ff", label: "Kotlin" },
    dart: { color: "0175c2", label: "Dart" },
    vue: { color: "4fc08d", label: "Vue" },
    svelte: { color: "ff3e00", label: "Svelte" },
    react: { color: "61dafb", label: "React" },
    node: { color: "5fa04e", label: "Node" },
    "node.js": { color: "5fa04e", label: "Node.js" },
    npm: { color: "cb3837", label: "npm" },
    "github pages": { color: "222222", label: "GitHub Pages" },
    githubpages: { color: "222222", label: "GitHub Pages" },
    docker: { color: "2496ed", label: "Docker" },
    wgpu: { color: "005a9c", label: "WebGPU" },
    webgpu: { color: "005a9c", label: "WebGPU" },
    webgl: { color: "990000", label: "WebGL" },
    threejs: { color: "049ef4", label: "Three.js" },
    "three.js": { color: "049ef4", label: "Three.js" },
    desktop: { color: "6b7280", label: "Desktop" },
    "desktop app": { color: "6b7280", label: "Desktop" },
    "inno setup": { color: "e34c26", label: "Inno Setup" },
    just: { color: "384d54", label: "Just" }
  };

  const STACK_MARK = {
    rust: '<path d="M10.139 3.463c.473 -1.95 3.249 -1.95 3.722 0a1.916 1.916 0 0 0 2.859 1.185c1.714 -1.045 3.678 .918 2.633 2.633a1.916 1.916 0 0 0 1.184 2.858c1.95 .473 1.95 3.249 0 3.722a1.916 1.916 0 0 0 -1.185 2.859c1.045 1.714 -.918 3.678 -2.633 2.633a1.916 1.916 0 0 0 -2.858 1.184c-.473 1.95 -3.249 1.95 -3.722 0a1.916 1.916 0 0 0 -2.859 -1.185c-1.714 1.045 -3.678 -.918 -2.633 -2.633a1.916 1.916 0 0 0 -1.184 -2.858c-1.95 -.473 -1.95 -3.249 0 -3.722a1.916 1.916 0 0 0 1.185 -2.859c-1.045 -1.714 .918 -3.678 2.633 -2.633a1.914 1.914 0 0 0 2.858 -1.184z"/><path d="M8 12h6a2 2 0 1 0 0 -4h-6v8v-4z"/><path d="M19 16h-2a2 2 0 0 1 -2 -2a2 2 0 0 0 -2 -2h-1"/><path d="M9 8h-4"/><path d="M5 16h4"/>',
    slint: '<path d="M8 4m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z"/><path d="M4 8m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z"/>',
    windows: '<path d="M17.8 20l-12 -1.5c-1 -.1 -1.8 -.9 -1.8 -1.9v-9.2c0 -1 .8 -1.8 1.8 -1.9l12 -1.5c1.2 -.1 2.2 .8 2.2 1.9v12.1c0 1.2 -1.1 2.1 -2.2 1.9z"/><path d="M12 5l0 14"/><path d="M4 12l16 0"/>',
    linux: '<path d="M12 17c-2.397 -.943 -4 -3.153 -4 -5.635c0 -2.19 1.039 -3.14 1.604 -3.595c2.646 -2.133 6.396 -.27 6.396 3.23c0 2.5 -2.905 2.121 -3.5 1.5c-.595 -.621 -1 -1.5 -.5 -2.5"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/>',
    javascript: '<path d="M20 4l-2 14.5l-6 2l-6 -2l-2 -14.5z"/><path d="M7.5 8h3v8l-2 -1"/><path d="M16.5 8h-2.5a.5 .5 0 0 0 -.5 .5v3a.5 .5 0 0 0 .5 .5h1.423a.5 .5 0 0 1 .495 .57l-.418 2.93l-2 .5"/>',
    js: '<path d="M20 4l-2 14.5l-6 2l-6 -2l-2 -14.5z"/><path d="M7.5 8h3v8l-2 -1"/><path d="M16.5 8h-2.5a.5 .5 0 0 0 -.5 .5v3a.5 .5 0 0 0 .5 .5h1.423a.5 .5 0 0 1 .495 .57l-.418 2.93l-2 .5"/>',
    typescript: '<path d="M15 17.5c.32 .32 .754 .5 1.207 .5h.543c.69 0 1.25 -.56 1.25 -1.25v-.25a1.5 1.5 0 0 0 -1.5 -1.5a1.5 1.5 0 0 1 -1.5 -1.5v-.25c0 -.69 .56 -1.25 1.25 -1.25h.543c.453 0 .887 .18 1.207 .5"/><path d="M9 12h4"/><path d="M11 12v6"/><path d="M21 19v-14a2 2 0 0 0 -2 -2h-14a2 2 0 0 0 -2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2 -2z"/>',
    ts: '<path d="M15 17.5c.32 .32 .754 .5 1.207 .5h.543c.69 0 1.25 -.56 1.25 -1.25v-.25a1.5 1.5 0 0 0 -1.5 -1.5a1.5 1.5 0 0 1 -1.5 -1.5v-.25c0 -.69 .56 -1.25 1.25 -1.25h.543c.453 0 .887 .18 1.207 .5"/><path d="M9 12h4"/><path d="M11 12v6"/><path d="M21 19v-14a2 2 0 0 0 -2 -2h-14a2 2 0 0 0 -2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2 -2z"/>',
    python: '<path d="M12 9h-7a2 2 0 0 0 -2 2v4a2 2 0 0 0 2 2h3"/><path d="M12 15h7a2 2 0 0 0 2 -2v-4a2 2 0 0 0 -2 -2h-3"/><path d="M8 9v-4a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v5a2 2 0 0 1 -2 2h-4a2 2 0 0 0 -2 2v5a2 2 0 0 0 2 2h4a2 2 0 0 0 2 -2v-4"/><path d="M11 6l0 .01"/><path d="M13 18l0 .01"/>',
    go: '<path d="M15.695 14.305c1.061 1.06 2.953 .888 4.226 -.384c1.272 -1.273 1.444 -3.165 .384 -4.226c-1.061 -1.06 -2.953 -.888 -4.226 .384c-1.272 1.273 -1.444 3.165 -.384 4.226z"/><path d="M12.68 9.233c-1.084 -.497 -2.545 -.191 -3.591 .846c-1.284 1.273 -1.457 3.165 -.388 4.226c1.07 1.06 2.978 .888 4.261 -.384a3.669 3.669 0 0 0 1.038 -1.921h-2.427"/><path d="M5.5 15h-1.5"/><path d="M6 9h-2"/><path d="M5 12h-3"/>',
    golang: '<path d="M15.695 14.305c1.061 1.06 2.953 .888 4.226 -.384c1.272 -1.273 1.444 -3.165 .384 -4.226c-1.061 -1.06 -2.953 -.888 -4.226 .384c-1.272 1.273 -1.444 3.165 -.384 4.226z"/><path d="M12.68 9.233c-1.084 -.497 -2.545 -.191 -3.591 .846c-1.284 1.273 -1.457 3.165 -.388 4.226c1.07 1.06 2.978 .888 4.261 -.384a3.669 3.669 0 0 0 1.038 -1.921h-2.427"/><path d="M5.5 15h-1.5"/><path d="M6 9h-2"/><path d="M5 12h-3"/>',
    css: '<path d="M20 4l-2 14.5l-6 2l-6 -2l-2 -14.5z"/><path d="M8.5 8h7l-4.5 4h4l-.5 3.5l-2.5 .75l-2.5 -.75l-.1 -.5"/>',
    html: '<path d="M20 4l-2 14.5l-6 2l-6 -2l-2 -14.5z"/><path d="M15.5 8h-7l.5 4h6l-.5 3.5l-2.5 .75l-2.5 -.75l-.1 -.5"/>',
    scss: '<path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M12 10.523c2.46 -.826 4 -.826 4 -2.155c0 -1.366 -1.347 -1.366 -2.735 -1.366c-1.91 0 -3.352 .49 -4.537 1.748c-.848 .902 -1.027 2.449 -.153 3.307c.973 .956 3.206 1.789 2.884 3.493c-.233 1.235 -1.469 1.823 -2.617 1.202c-.782 -.424 -.454 -1.746 .626 -2.512s2.822 -.992 4.1 -.24c.98 .575 1.046 1.724 .434 2.193"/>',
    sass: '<path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M12 10.523c2.46 -.826 4 -.826 4 -2.155c0 -1.366 -1.347 -1.366 -2.735 -1.366c-1.91 0 -3.352 .49 -4.537 1.748c-.848 .902 -1.027 2.449 -.153 3.307c.973 .956 3.206 1.789 2.884 3.493c-.233 1.235 -1.469 1.823 -2.617 1.202c-.782 -.424 -.454 -1.746 .626 -2.512s2.822 -.992 4.1 -.24c.98 .575 1.046 1.724 .434 2.193"/>',
    yaml: '<path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"/><path d="M9 9l1 0"/><path d="M9 13l6 0"/><path d="M9 17l6 0"/>',
    yml: '<path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"/><path d="M9 9l1 0"/><path d="M9 13l6 0"/><path d="M9 17l6 0"/>',
    json: '<path d="M20 16v-8l3 8v-8"/><path d="M15 8a2 2 0 0 1 2 2v4a2 2 0 1 1 -4 0v-4a2 2 0 0 1 2 -2z"/><path d="M1 8h3v6.5a1.5 1.5 0 0 1 -3 0v-.5"/><path d="M7 15a1 1 0 0 0 1 1h1a1 1 0 0 0 1 -1v-2a1 1 0 0 0 -1 -1h-1a1 1 0 0 1 -1 -1v-2a1 1 0 0 1 1 -1h1a1 1 0 0 1 1 1"/>',
    markdown: '<path d="M3 5m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z"/><path d="M7 15v-6l2 2l2 -2v6"/><path d="M14 13l2 2l2 -2m-2 2v-6"/>',
    docker: '<path d="M22 12.54c-1.804 -.345 -2.701 -1.08 -3.523 -2.94c-.487 .696 -1.102 1.568 -.92 2.4c.028 .238 -.32 1 -.557 1h-14c0 5.208 3.164 7 6.196 7c4.124 .022 7.828 -1.376 9.854 -5c1.146 -.101 2.296 -1.505 2.95 -2.46z"/><path d="M5 10h3v3h-3z"/><path d="M8 10h3v3h-3z"/><path d="M11 10h3v3h-3z"/><path d="M8 7h3v3h-3z"/><path d="M11 7h3v3h-3z"/><path d="M11 4h3v3h-3z"/><path d="M4.571 18c1.5 0 2.047 -.074 2.958 -.78"/><path d="M10 16l0 .01"/>',
    react: '<path d="M6.306 8.711c-2.602 .723 -4.306 1.926 -4.306 3.289c0 2.21 4.477 4 10 4c.773 0 1.526 -.035 2.248 -.102"/><path d="M17.692 15.289c2.603 -.722 4.308 -1.926 4.308 -3.289c0 -2.21 -4.477 -4 -10 -4c-.773 0 -1.526 .035 -2.25 .102"/><path d="M6.305 15.287c-.676 2.615 -.485 4.693 .695 5.373c1.913 1.105 5.703 -1.877 8.464 -6.66c.387 -.67 .733 -1.339 1.036 -2"/><path d="M17.694 8.716c.677 -2.616 .487 -4.696 -.694 -5.376c-1.913 -1.105 -5.703 1.877 -8.464 6.66c-.387 .67 -.733 1.34 -1.037 2"/><path d="M12 5.424c-1.925 -1.892 -3.82 -2.766 -5 -2.084c-1.913 1.104 -1.226 5.877 1.536 10.66c.386 .67 .793 1.304 1.212 1.896"/><path d="M12 18.574c1.926 1.893 3.821 2.768 5 2.086c1.913 -1.104 1.226 -5.877 -1.536 -10.66c-.375 -.65 -.78 -1.283 -1.212 -1.897"/><path d="M11.5 12.866a1 1 0 1 0 1 -1.732a1 1 0 0 0 -1 1.732z"/>',
    vue: '<path d="M16.5 4l-4.5 8l-4.5 -8"/><path d="M3 4l9 16l9 -16"/>',
    svelte: '<path d="M15 8l-5 3l.821 -.495c1.86 -1.15 4.412 -.49 5.574 1.352a3.91 3.91 0 0 1 -1.264 5.42l-5.053 3.126c-1.86 1.151 -4.312 .591 -5.474 -1.251a3.91 3.91 0 0 1 1.263 -5.42l.26 -.16"/><path d="M8 17l5 -3l-.822 .496c-1.86 1.151 -4.411 .491 -5.574 -1.351a3.91 3.91 0 0 1 1.264 -5.42l5.054 -3.127c1.86 -1.15 4.311 -.59 5.474 1.252a3.91 3.91 0 0 1 -1.264 5.42l-.26 .16"/>',
    node: '<path d="M9 9v8.044a2 2 0 0 1 -2.996 1.734l-1.568 -.9a3 3 0 0 1 -1.436 -2.561v-6.635a3 3 0 0 1 1.436 -2.56l6 -3.667a3 3 0 0 1 3.128 0l6 3.667a3 3 0 0 1 1.436 2.561v6.634a3 3 0 0 1 -1.436 2.56l-6 3.667a3 3 0 0 1 -3.128 0"/><path d="M17 9h-3.5a1.5 1.5 0 0 0 0 3h2a1.5 1.5 0 0 1 0 3h-3.5"/>',
    "node.js": '<path d="M9 9v8.044a2 2 0 0 1 -2.996 1.734l-1.568 -.9a3 3 0 0 1 -1.436 -2.561v-6.635a3 3 0 0 1 1.436 -2.56l6 -3.667a3 3 0 0 1 3.128 0l6 3.667a3 3 0 0 1 1.436 2.561v6.634a3 3 0 0 1 -1.436 2.56l-6 3.667a3 3 0 0 1 -3.128 0"/><path d="M17 9h-3.5a1.5 1.5 0 0 0 0 3h2a1.5 1.5 0 0 1 0 3h-3.5"/>',
    npm: '<path d="M1 8h22v7h-12v2h-4v-2h-6z"/><path d="M7 8v7"/><path d="M14 8v7"/><path d="M17 11v4"/><path d="M4 11v4"/><path d="M11 11v1"/><path d="M20 11v4"/>',
    "github pages": '<path d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5"/>',
    githubpages: '<path d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5"/>',
    c: '<path d="M9 9a3 3 0 0 0 -3 -3h-.5a3.5 3.5 0 0 0 -3.5 3.5v5a3.5 3.5 0 0 0 3.5 3.5h.5a3 3 0 0 0 3 -3"/>',
    "c++": '<path d="M18 12h4"/><path d="M20 10v4"/><path d="M11 12h4"/><path d="M13 10v4"/><path d="M9 9a3 3 0 0 0 -3 -3h-.5a3.5 3.5 0 0 0 -3.5 3.5v5a3.5 3.5 0 0 0 3.5 3.5h.5a3 3 0 0 0 3 -3"/>',
    cpp: '<path d="M18 12h4"/><path d="M20 10v4"/><path d="M11 12h4"/><path d="M13 10v4"/><path d="M9 9a3 3 0 0 0 -3 -3h-.5a3.5 3.5 0 0 0 -3.5 3.5v5a3.5 3.5 0 0 0 3.5 3.5h.5a3 3 0 0 0 3 -3"/>',
    "c#": '<path d="M10 9a3 3 0 0 0 -3 -3h-.5a3.5 3.5 0 0 0 -3.5 3.5v5a3.5 3.5 0 0 0 3.5 3.5h.5a3 3 0 0 0 3 -3"/><path d="M16 7l-1 10"/><path d="M20 7l-1 10"/><path d="M14 10h7.5"/><path d="M21 14h-7.5"/>',
    csharp: '<path d="M10 9a3 3 0 0 0 -3 -3h-.5a3.5 3.5 0 0 0 -3.5 3.5v5a3.5 3.5 0 0 0 3.5 3.5h.5a3 3 0 0 0 3 -3"/><path d="M16 7l-1 10"/><path d="M20 7l-1 10"/><path d="M14 10h7.5"/><path d="M21 14h-7.5"/>',
    java: '<path d="M3 14c.83 .642 2.077 1.017 3.5 1c1.423 .017 2.67 -.358 3.5 -1c.83 -.642 2.077 -1.017 3.5 -1c1.423 -.017 2.67 .358 3.5 1"/><path d="M8 3a2.4 2.4 0 0 0 -1 2a2.4 2.4 0 0 0 1 2"/><path d="M12 3a2.4 2.4 0 0 0 -1 2a2.4 2.4 0 0 0 1 2"/><path d="M3 10h14v5a6 6 0 0 1 -6 6h-2a6 6 0 0 1 -6 -6v-5z"/><path d="M16.746 16.726a3 3 0 1 0 .252 -5.555"/>',
    ruby: '<path d="M6 8l6 -4l6 4l-6 12z"/><path d="M6 8h12"/><path d="M8 8l4 12l4 -12"/>',
    php: '<path d="M12 12m-10 0a10 9 0 1 0 20 0a10 9 0 1 0 -20 0"/><path d="M5.5 15l.395 -1.974l.605 -3.026h1.32a1 1 0 0 1 .986 1.164l-.167 1a1 1 0 0 1 -.986 .836h-1.653"/><path d="M15.5 15l.395 -1.974l.605 -3.026h1.32a1 1 0 0 1 .986 1.164l-.167 1a1 1 0 0 1 -.986 .836h-1.653"/><path d="M12 7.5l-1 5.5"/><path d="M11.6 10h2.4l-.5 3"/>',
    swift: '<path d="M20.547 15.828c1.33 -4.126 -1.384 -9.521 -6.047 -12.828c-.135 -.096 2.39 6.704 1.308 9.124c-2.153 -1.454 -4.756 -3.494 -7.808 -6.124l-.5 2l-3.5 -1c4.36 4.748 7.213 7.695 8.56 8.841c-4.658 2.089 -10.65 -.978 -10.56 -.841c1.016 1.545 6 6 11 6c2 0 3.788 -.502 4.742 -1.389c.005 -.005 .432 -.446 1.378 -.17c.504 .148 1.463 .667 2.88 1.559v-1.507c0 -1.377 -.515 -2.67 -1.453 -3.665z"/>',
    kotlin: '<path d="M20 20h-16v-16h16"/><path d="M4 20l16 -16"/><path d="M4 12l8 -8"/><path d="M12 12l8 8"/>',
    dart: '<path d="M8 6l8 0l4 4l-10 10l-6 -6z"/><path d="M14 6l4 4"/>',
    shell: '<path d="M8 9l3 3l-3 3"/><path d="M13 15l3 0"/><path d="M3 4m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z"/>',
    threejs: '<path d="M8 22l-5 -19l19 5.5z"/><path d="M12.573 17.58l-6.152 -1.576l8.796 -9.466l1.914 6.64"/><path d="M12.573 17.58l-1.573 -6.58l6.13 2.179"/><path d="M9.527 4.893l1.473 6.107l-6.31 -1.564z"/>',
    "three.js": '<path d="M8 22l-5 -19l19 5.5z"/><path d="M12.573 17.58l-6.152 -1.576l8.796 -9.466l1.914 6.64"/><path d="M12.573 17.58l-1.573 -6.58l6.13 2.179"/><path d="M9.527 4.893l1.473 6.107l-6.31 -1.564z"/>',
    webgpu: '<path d="M5 5m0 1a1 1 0 0 1 1 -1h12a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-12a1 1 0 0 1 -1 -1z"/><path d="M9 9h6v6h-6z"/><path d="M3 10h2"/><path d="M3 14h2"/><path d="M10 3v2"/><path d="M14 3v2"/><path d="M21 10h-2"/><path d="M21 14h-2"/><path d="M14 21v-2"/><path d="M10 21v-2"/>',
    wgpu: '<path d="M5 5m0 1a1 1 0 0 1 1 -1h12a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-12a1 1 0 0 1 -1 -1z"/><path d="M9 9h6v6h-6z"/><path d="M3 10h2"/><path d="M3 14h2"/><path d="M10 3v2"/><path d="M14 3v2"/><path d="M21 10h-2"/><path d="M21 14h-2"/><path d="M14 21v-2"/><path d="M10 21v-2"/>',
    webgl: '<path d="M8 22l-5 -19l19 5.5z"/>',
    desktop: '<path d="M3 5a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-10z"/><path d="M7 20h10"/><path d="M9 16v4"/><path d="M15 16v4"/>',
    "desktop app": '<path d="M3 5a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-10z"/><path d="M7 20h10"/><path d="M9 16v4"/><path d="M15 16v4"/>',
    "inno setup": '<path d="M12 3l8 4.5v9l-8 4.5l-8 -4.5v-9z"/><path d="M12 12l8 -4.5"/><path d="M12 12v9"/><path d="M12 12l-8 -4.5"/>',
    just: '<path d="M8 9l3 3l-3 3"/><path d="M13 15l3 0"/><path d="M3 4m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z"/>'
  };

  function shieldBrand(name) {
    return SHIELD_BRANDS[String(name || "").trim().toLowerCase()] || null;
  }

  function stackIconHtml(name, size = 13) {
    const key = String(name || "").trim().toLowerCase();
    const paths = STACK_MARK[key] || GH_MARK.code;
    return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  }

  function pillInk(hex) {
    const n = parseInt(String(hex || "").replace("#", ""), 16);
    if (!Number.isFinite(n)) return "#f6f6f6";
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    const l = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return l > 0.62 ? "#121212" : "#f6f6f6";
  }

  function stackBadgeHtml(name) {
    const brand = shieldBrand(name);
    const label = brand ? brand.label : String(name || "").replace(/[-_]+/g, " ");
    const color = brand ? `#${brand.color}` : "#8a8a8a";
    return `<li class="github-pill" style="--pill:${color};--pill-ink:${pillInk(color)}"><span class="github-pill__mark">${stackIconHtml(name)}</span><span class="github-pill__label">${escapeText(label)}</span></li>`;
  }

  function ghMarkHtml(name, size = 16) {
    return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${GH_MARK[name] || ""}</svg>`;
  }

  function syncGithubTheme(theme) {
    document.querySelectorAll("img[data-shieldcn]").forEach((img) => {
      try {
        const url = new URL(img.getAttribute("src"), location.href);
        url.searchParams.set("mode", theme);
        const next = url.toString();
        if (img.src !== next) img.src = next;
      } catch {}
    });
  }

  function fillGithubStat(root, id, value) {
    const el = root.querySelector(`[data-github-stat="${id}"]`);
    if (!el) return;
    el.textContent = compactNumber(value);
    el.title = Number.isFinite(Number(value)) ? String(value) : "";
    const pill = el.closest(".github-pill[data-stat]");
    if (pill && pill.dataset.stat === id) {
      const numeric = Number(value);
      pill.hidden = !Number.isFinite(numeric) || numeric <= 0;
    }
  }

  function fillLastCommit(root, commits) {
    const card = root.querySelector('[data-stat="freshness"]');
    const value = card && card.querySelector('[data-github="freshness"]');
    if (!card || !value) return;
    const item = Array.isArray(commits) ? commits[0] : null;
    const iso = (item && item.commit && item.commit.author && item.commit.author.date) ||
      (item && item.commit && item.commit.committer && item.commit.committer.date) ||
      "";
    const age = shortAge(iso);
    if (!age) {
      card.hidden = true;
      value.textContent = "—";
      return;
    }
    card.hidden = false;
    value.textContent = age;
    value.title = iso;
  }

  function syncGithubMeters(root) {
    const host = root.querySelector(".github-meters");
    if (!host) return;
    const visible = Array.from(host.children).some((item) => !item.hidden);
    host.hidden = !visible;
  }

  function fillActivityMeta(root, grouped) {
    const totalPill = root.querySelector('[data-github-pill="total"]');
    const spanPill = root.querySelector('[data-github-pill="span"]');
    const totalEl = root.querySelector('[data-github="activity-total"]');
    const spanEl = root.querySelector('[data-github="activity-span"]');
    const unitEl = root.querySelector('[data-github="activity-unit"]');
    const has = Boolean(grouped && grouped.buckets && grouped.buckets.length);
    if (totalPill) {
      totalPill.hidden = !has;
      if (has && totalEl) totalEl.textContent = compactNumber(grouped.total);
    }
    if (spanPill) {
      spanPill.hidden = !has;
      if (has && spanEl) spanEl.textContent = String(grouped.buckets.length);
      if (has && unitEl) unitEl.textContent = grouped.unitLabel || "days";
    }
  }

  function syncTreeTail(root) {
    const tree = root.querySelector(".github-tree");
    if (!tree) return;
    const nodes = tree.querySelectorAll(".github-tree__node");
    const last = nodes[nodes.length - 1];
    if (!last) {
      tree.style.removeProperty("--spine-solid");
      tree.classList.remove("has-tail");
      return;
    }
    const treeRect = tree.getBoundingClientRect();
    const lastRect = last.getBoundingClientRect();
    const lastCenter = lastRect.top + lastRect.height / 2 - treeRect.top;
    const extra = tree.clientHeight - lastCenter;
    if (lastRect.top > treeRect.bottom - 8 || extra <= 20) {
      tree.style.setProperty("--spine-solid", "100%");
      tree.classList.remove("has-tail");
      return;
    }
    tree.style.setProperty("--spine-solid", `${Math.max(0, Math.round(lastCenter - 12))}px`);
    tree.classList.add("has-tail");
  }

  function watchTreeTail(root) {
    const tree = root.querySelector(".github-tree");
    if (!tree || tree.dataset.tailWatch) return;
    tree.dataset.tailWatch = "1";
    const run = () => syncTreeTail(root);
    tree.addEventListener("scroll", run, { passive: true });
    if ("ResizeObserver" in window) new ResizeObserver(run).observe(tree);
  }

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function commitTime(item) {
    const raw = (item && item.commit && item.commit.author && item.commit.author.date) ||
      (item && item.commit && item.commit.committer && item.commit.committer.date);
    const t = Date.parse(raw);
    return Number.isFinite(t) ? t : 0;
  }

  function dayKey(ms) {
    const d = new Date(ms);
    return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
  }

  function weekKey(ms) {
    const d = new Date(ms);
    const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    const day = t.getUTCDay() || 7;
    t.setUTCDate(t.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
    const week = Math.ceil((((t - yearStart) / 86400000) + 1) / 7);
    return `${t.getUTCFullYear()}-W${pad2(week)}`;
  }

  function monthKey(ms) {
    const d = new Date(ms);
    return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}`;
  }

  function formatDayLabel(key) {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      timeZone: "UTC"
    });
  }

  function formatWeekLabel(key) {
    const [year, week] = key.split("-W");
    const jan4 = new Date(Date.UTC(Number(year), 0, 4));
    const dow = jan4.getUTCDay() || 7;
    const monday = new Date(jan4);
    monday.setUTCDate(jan4.getUTCDate() - dow + 1 + (Number(week) - 1) * 7);
    const sunday = new Date(monday);
    sunday.setUTCDate(monday.getUTCDate() + 6);
    const a = monday.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
    const b = sunday.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
    return `${a}–${b}`;
  }

  function formatMonthLabel(key) {
    const [y, m] = key.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-GB", {
      month: "short",
      year: "numeric",
      timeZone: "UTC"
    });
  }

  function bucketCommits(dated, keyFn, labelFn) {
    const map = new Map();
    dated.forEach((item) => {
      const key = keyFn(item.t);
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([key, count]) => ({ key, count, label: labelFn(key) }))
      .filter((item) => item.count > 0)
      .sort((a, b) => a.key.localeCompare(b.key));
  }

  function groupCommitActivity(commits, width) {
    const dated = (Array.isArray(commits) ? commits : [])
      .map((item) => ({ t: commitTime(item) }))
      .filter((item) => item.t > 0);
    if (!dated.length) return { unit: "day", unitLabel: "days", buckets: [], total: 0 };
    const minBar = 8;
    const gap = 3;
    const maxBars = Math.max(1, Math.floor(((Number(width) || 0) + gap) / (minBar + gap)));
    const days = bucketCommits(dated, dayKey, formatDayLabel);
    if (days.length <= maxBars) return { unit: "day", unitLabel: "days", buckets: days, total: dated.length };
    const weeks = bucketCommits(dated, weekKey, formatWeekLabel);
    if (weeks.length <= maxBars) return { unit: "week", unitLabel: "weeks", buckets: weeks, total: dated.length };
    const months = bucketCommits(dated, monthKey, formatMonthLabel);
    return { unit: "month", unitLabel: "months", buckets: months, total: dated.length };
  }

  function heatLevel(count, max) {
    const t = count / Math.max(1, max);
    if (t > 0.75) return 4;
    if (t > 0.45) return 3;
    if (t > 0.2) return 2;
    return 1;
  }

  function renderSpark(commits, width) {
    const { buckets, total, unitLabel } = groupCommitActivity(commits, width);
    if (!buckets.length) return "";
    const max = Math.max(1, ...buckets.map((item) => item.count));
    const bars = buckets
      .map((item, index) => {
        const heat = (item.count / max).toFixed(3);
        const level = heatLevel(item.count, max);
        const delay = `${Math.round(index * 18)}ms`;
        const noun = item.count === 1 ? "commit" : "commits";
        const tip = `${item.label} · ${item.count} ${noun}`;
        return `<span data-level="${level}" data-tip="${escapeText(tip)}" style="--heat:${heat};--delay:${delay}"><i></i></span>`;
      })
      .join("");
    return `<div class="github-activity__bars" role="img" aria-label="${total} commits across ${buckets.length} active ${unitLabel}">${bars}</div>`;
  }

  function releaseFlags(item, when, { latest = false } = {}) {
    const assets = Array.isArray(item.assets) ? item.assets.length : 0;
    return [
      item.prerelease ? "Pre-release" : latest ? "Latest" : "",
      assets ? `${assets} ${assets === 1 ? "asset" : "assets"}` : "",
      when
    ]
      .filter(Boolean)
      .join(" · ");
  }

  function releaseTitle(item) {
    const tag = item.tag_name || item.name || "release";
    return item.name && item.name !== item.tag_name ? item.name : tag;
  }

  function renderReleaseRow(item, href) {
    const title = releaseTitle(item);
    const when = timeAgo(item.published_at || item.created_at);
    const note = plainNote(item.body);
    return `<li><a href="${escapeText(item.html_url || href)}"><span class="github-list__mark">${ghMarkHtml("tag", 16)}</span><strong>${escapeText(title)}</strong><span class="github-list__meta">${escapeText(releaseFlags(item, when))}</span>${
      note ? `<span class="github-list__note">${escapeText(note)}</span>` : ""
    }</a></li>`;
  }

  function renderLatestRelease(item, href) {
    const title = releaseTitle(item);
    const when = timeAgo(item.published_at || item.created_at);
    const note = plainNote(item.body);
    const url = item.html_url || href;
    return `<article class="github-release is-latest"><span class="github-release__mark">${ghMarkHtml("tag", 18)}</span><div class="github-release__copy"><p class="github-release__kicker">Latest release</p><strong>${escapeText(title)}</strong><span class="github-release__meta">${escapeText(releaseFlags(item, when, { latest: true }))}</span>${
      note ? `<p class="github-release__note">${escapeText(note)}</p>` : ""
    }<a class="button primary github-release__cta" href="${escapeText(url)}">Open release</a></div></article>`;
  }

  function renderReleases(releases, href) {
    const items = (Array.isArray(releases) ? releases : []).filter((item) => item && !item.draft);
    if (!items.length) {
      return `<div class="github-release github-release--empty"><span class="github-release__mark">${ghMarkHtml("tag", 16)}</span><div class="github-release__copy"><strong>No tagged releases</strong><span class="github-release__meta"><a href="${escapeText(href)}">Open releases</a></span></div></div>`;
    }
    const latestIndex = items.findIndex((item) => !item.prerelease);
    const latest = items[latestIndex >= 0 ? latestIndex : 0];
    const rest = items.filter((item) => item !== latest);
    const list = rest.length
      ? `<ol class="github-list">${rest.map((item) => renderReleaseRow(item, href)).join("")}</ol>`
      : "";
    return `${renderLatestRelease(latest, href)}${list}`;
  }

  function formatCommitDate(iso) {
    const t = Date.parse(iso);
    if (!Number.isFinite(t)) return "";
    return new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  function renderCommits(commits, href) {
    const items = Array.isArray(commits) ? commits : [];
    if (!items.length) {
      return `<li><span class="github-tree__node" aria-hidden="true"></span><span class="github-tree__msg">No commits returned.</span><span class="github-tree__hover"><a class="github-tree__open" href="${escapeText(href)}">${ghMarkHtml("external", 14)}</a></span></li>`;
    }
    return items
      .map((item) => {
        const message = firstLine(item.commit && item.commit.message, 72);
        const merge = /^\s*merge\b/i.test(item.commit && item.commit.message ? item.commit.message : "");
        const iso = (item.commit && item.commit.author && item.commit.author.date) ||
          (item.commit && item.commit.committer && item.commit.committer.date) ||
          "";
        const sha = String(item.sha || "");
        return `<li${merge ? ' class="is-merge"' : ""} data-sha="${escapeText(sha)}" data-date="${escapeText(iso)}"><span class="github-tree__node" aria-hidden="true"></span><span class="github-tree__msg">${escapeText(message || sha.slice(0, 7))}</span><span class="github-tree__hover"><time datetime="${escapeText(iso)}">${escapeText(formatCommitDate(iso))}</time><span class="github-tree__diff" hidden></span><a class="github-tree__open" href="${escapeText(item.html_url || href)}" aria-label="Open commit">${ghMarkHtml("external", 14)}</a></span></li>`;
      })
      .join("");
  }

  const commitDiffCache = new Map();

  async function loadCommitDiff(li, owner, name) {
    const sha = li.dataset.sha;
    const slot = li.querySelector(".github-tree__diff");
    if (!sha || !slot || slot.dataset.loaded) return;
    slot.dataset.loaded = "1";
    const cacheKey = `${owner}/${name}/${sha}`;
    let stats = commitDiffCache.get(cacheKey);
    if (!stats) {
      const result = await githubJson(`${GH_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/commits/${encodeURIComponent(sha)}`);
      stats = result.ok && result.data && result.data.stats ? result.data.stats : null;
      if (stats) commitDiffCache.set(cacheKey, stats);
    }
    if (!stats) return;
    slot.hidden = false;
    slot.innerHTML = `<span class="github-tree__add">+${escapeText(stats.additions)}</span> <span class="github-tree__del">−${escapeText(stats.deletions)}</span>`;
  }

  function bindCommitHovers(root, owner, name) {
    root.querySelectorAll(".github-tree li[data-sha]").forEach((li) => {
      const load = () => {
        loadCommitDiff(li, owner, name);
      };
      li.addEventListener("pointerenter", load, { once: true });
      li.addEventListener("focusin", load, { once: true });
    });
  }

  function collectStackNames(root, payload) {
    const seen = new Set();
    const names = [];
    const add = (value) => {
      const raw = String(value || "").trim();
      if (!raw) return;
      const key = raw.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      names.push(raw);
    };
    const languages = payload.languages && typeof payload.languages === "object" ? payload.languages : null;
    if (languages) {
      Object.keys(languages)
        .sort((a, b) => Number(languages[b]) - Number(languages[a]))
        .forEach(add);
    } else if (payload.repo && payload.repo.language) {
      add(payload.repo.language);
    }
    String(root.dataset.githubStack || "")
      .split("|")
      .forEach(add);
    return names;
  }

  function renderTags(root, payload) {
    const host = root.querySelector('[data-github="tags"]');
    if (!host) return;
    const show = root.dataset.githubTopics === "true";
    const topics = show && payload.repo && Array.isArray(payload.repo.topics)
      ? payload.repo.topics.map((item) => String(item || "").trim()).filter(Boolean)
      : [];
    host.hidden = topics.length === 0;
    host.innerHTML = topics.map((topic) => `<li title="${escapeText(topic)}">${escapeText(topic)}</li>`).join("");
  }

  function isGithubBot(item) {
    const login = String((item && item.login) || "").trim();
    const type = String((item && item.type) || "");
    if (!login) return true;
    if (type === "Bot" || type === "Anonymous") return true;
    return /\[bot\]$/i.test(login);
  }

  function githubAvatarSrc(item, size) {
    const login = String((item && item.login) || "").trim();
    const raw = String((item && item.avatar_url) || "").trim();
    if (raw) {
      try {
        const url = new URL(raw);
        url.searchParams.set("s", String(size));
        return url.toString();
      } catch {}
    }
    return login ? `https://github.com/${encodeURIComponent(login)}.png?size=${size}` : "";
  }

  function githubPersonHtml(item, { named = false, size = 32 } = {}) {
    const login = String((item && item.login) || "").trim();
    if (!login) return "";
    const href = item.html_url || `https://github.com/${encodeURIComponent(login)}`;
    const src = githubAvatarSrc(item, size * 2);
    const label = String(item.name || login);
    return `<li><a href="${escapeText(href)}" title="${escapeText(login)}"><img src="${escapeText(src)}" alt="${escapeText(login)}" width="${size}" height="${size}" loading="lazy">${named ? `<span>${escapeText(label)}</span>` : ""}</a></li>`;
  }

  function publicPeople(list) {
    return (Array.isArray(list) ? list : []).filter((item) => item && !isGithubBot(item));
  }

  function splitSponsors(list) {
    const people = publicPeople(list);
    if (people.length <= 7) return { featured: people, rest: [] };
    return { featured: people.slice(0, 6), rest: people.slice(6, 46) };
  }

  function fillPeopleBand(root, key, people, options) {
    const band = root.querySelector(`[data-github="${key}"]`);
    if (!band) return;
    const list = band.querySelector("ul");
    if (!list) return;
    band.hidden = people.length === 0;
    list.innerHTML = people.map((item) => githubPersonHtml(item, options)).join("");
  }

  function renderContributors(root, payload) {
    const host = root.querySelector(".github-contributors");
    const list = root.querySelector('[data-github="contributors"]');
    if (!host || !list) return;
    const people = publicPeople(payload.contributors).slice(0, 48);
    list.innerHTML = people.map((item) => githubPersonHtml(item, { size: 32 })).join("");
    host.hidden = people.length === 0;
  }

  function renderSponsors(root, payload) {
    const empty = root.querySelector('[data-github="sponsors-empty"]');
    const { featured, rest } = splitSponsors(payload.sponsors);
    fillPeopleBand(root, "sponsors-featured", featured, { named: true, size: 56 });
    fillPeopleBand(root, "sponsors-grid", rest, { named: true, size: 36 });
    if (empty) empty.hidden = featured.length + rest.length > 0;
  }

  function renderStackShields(root, payload) {
    const host = root.querySelector('[data-github="stack"]');
    if (!host) return;
    const items = collectStackNames(root, payload).map(stackBadgeHtml);
    host.hidden = items.length === 0;
    host.innerHTML = items.join("");
  }

  const activityStore = new WeakMap();

  function paintActivity(root, animate) {
    const stored = activityStore.get(root);
    const plot = root.querySelector('[data-github="spark"]');
    if (!stored || !plot) return null;
    const host = plot.closest(".github-activity") || plot;
    const width = host.clientWidth || plot.clientWidth || plot.getBoundingClientRect().width;
    const grouped = groupCommitActivity(stored.commits, width);
    const html = renderSpark(stored.commits, width);
    plot.hidden = !html;
    plot.innerHTML = html;
    if (animate && html) {
      plot.querySelectorAll(".github-activity__bars i").forEach((bar) => {
        bar.addEventListener(
          "animationend",
          () => {
            bar.style.animation = "none";
          },
          { once: true }
        );
      });
    }
    return grouped;
  }

  function bindActivityTip(root) {
    const activity = root.querySelector(".github-activity");
    const plot = root.querySelector('[data-github="spark"]');
    const tip = root.querySelector('[data-github="spark-tip"]');
    if (!activity || !plot || !tip || activity.dataset.tipBound) return;
    activity.dataset.tipBound = "1";
    let hot = null;
    let hideTimer = 0;
    let listening = false;
    const setHot = (bar) => {
      if (hot === bar) return;
      if (hot) hot.classList.remove("is-hot");
      hot = bar;
      if (hot) hot.classList.add("is-hot");
      const row = plot.querySelector(".github-activity__bars");
      if (row) row.classList.toggle("is-tip", Boolean(hot));
    };
    const stopListen = () => {
      if (!listening) return;
      window.removeEventListener("pointermove", onMove);
      listening = false;
    };
    const hide = () => {
      clearTimeout(hideTimer);
      hideTimer = 0;
      tip.hidden = true;
      setHot(null);
      stopListen();
    };
    const rowBox = () => {
      const row = plot.querySelector(".github-activity__bars");
      return row ? row.getBoundingClientRect() : null;
    };
    const barAtX = (clientX) => {
      const row = plot.querySelector(".github-activity__bars");
      if (!row) return null;
      const bars = row.querySelectorAll(":scope > span");
      if (!bars.length) return null;
      const box = row.getBoundingClientRect();
      if (box.width <= 0) return null;
      const t = Math.min(0.999999, Math.max(0, (clientX - box.left) / box.width));
      return bars[Math.min(bars.length - 1, Math.floor(t * bars.length))];
    };
    const placeTip = (clientX, clientY) => {
      const pad = 14;
      const left = Math.min(window.innerWidth - tip.offsetWidth - 8, clientX + pad);
      const top = Math.max(8, clientY - tip.offsetHeight - 12);
      tip.style.left = `${Math.max(8, left)}px`;
      tip.style.top = `${top}px`;
    };
    const onMove = (event) => {
      const box = rowBox();
      if (!box || event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) {
        if (!hideTimer) hideTimer = window.setTimeout(hide, 120);
        return;
      }
      clearTimeout(hideTimer);
      hideTimer = 0;
      const bar = barAtX(event.clientX);
      const text = bar ? bar.dataset.tip || "" : "";
      if (!text) return;
      setHot(bar);
      if (tip.textContent !== text) tip.textContent = text;
      tip.hidden = false;
      placeTip(event.clientX, event.clientY);
    };
    const startListen = (event) => {
      clearTimeout(hideTimer);
      hideTimer = 0;
      if (!listening) {
        window.addEventListener("pointermove", onMove, { passive: true });
        listening = true;
      }
      onMove(event);
    };
    activity.addEventListener("pointerenter", startListen);
    plot.addEventListener("pointerdown", startListen);
  }

  function renderGithub(root, payload) {
    const repo = payload.repo || {};
    const href = repo.html_url || `https://github.com/${root.dataset.githubOwner}/${root.dataset.githubName}`;
    setGithubText(root, "description", repo.description || "");
    renderTags(root, payload);
    renderStackShields(root, payload);
    renderSponsors(root, payload);
    renderContributors(root, payload);
    bindActivityTip(root);
    fillGithubStat(root, "stars", repo.stargazers_count);
    fillGithubStat(root, "issues", repo.open_issues_count);
    fillLastCommit(root, Array.isArray(payload.commits) ? payload.commits : []);
    syncGithubMeters(root);
    const history = Array.isArray(payload.commits) ? payload.commits : [];
    activityStore.set(root, { commits: history });
    const grouped = paintActivity(root, !root.dataset.githubSparkReady);
    root.dataset.githubSparkReady = "1";
    if (root.querySelector('[data-github="spark"]') && !root.dataset.githubSparkWatch && "ResizeObserver" in window) {
      root.dataset.githubSparkWatch = "1";
      let lastW = 0;
      const ro = new ResizeObserver((entries) => {
        const w = Math.round(entries[0].contentRect.width);
        if (!w || Math.abs(w - lastW) < 12) return;
        lastW = w;
        const next = paintActivity(root, false);
        if (next) {
          root.classList.toggle("is-live", next.buckets.length > 0);
          fillActivityMeta(root, next);
        }
      });
      ro.observe(root.querySelector('[data-github="spark"]'));
    }
    root.classList.toggle("is-live", Boolean(grouped && grouped.buckets.length));
    fillActivityMeta(root, grouped);
    const releases = root.querySelector('[data-github="releases"]');
    if (releases) releases.innerHTML = renderReleases(payload.releases, `${href}/releases`);
    const limit = Math.max(0, Math.min(20, Number(root.dataset.githubCommits || 12)));
    const commits = root.querySelector('[data-github="commits"]');
    if (commits) {
      commits.innerHTML = renderCommits(history.slice(0, limit || 12), `${href}/commits`);
      bindCommitHovers(root, root.dataset.githubOwner, root.dataset.githubName);
      watchTreeTail(root);
      syncTreeTail(root);
    }
    root.classList.remove("is-error");
    setGithubText(root, "status", "");
    root.setAttribute("aria-busy", "false");
  }

  function failGithub(root, message) {
    root.classList.add("is-error");
    root.setAttribute("aria-busy", "false");
    const owner = root.dataset.githubOwner || "";
    const name = root.dataset.githubName || "";
    const status = root.querySelector('[data-github="status"]');
    if (!status) return;
    status.hidden = false;
    if (owner && name) {
      status.innerHTML = `${escapeText(message)} <a href="https://github.com/${escapeText(owner)}/${escapeText(name)}">Open ${escapeText(`${owner}/${name}`)}</a>.`;
      return;
    }
    status.textContent = message;
  }

  async function refreshGithub(root, owner, name) {
    const releaseLimit = Math.max(0, Math.min(20, Number(root.dataset.githubReleases || 0)));
    const base = `${GH_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`;
    const [repoResult, releaseResult, commitResult, langResult, contribResult, userSponsorResult, orgSponsorResult] = await Promise.all([
      githubJson(base),
      releaseLimit ? githubJson(`${base}/releases?per_page=${releaseLimit}`) : Promise.resolve({ ok: true, data: [] }),
      githubJson(`${base}/commits?per_page=100`),
      githubJson(`${base}/languages`),
      githubJson(`${base}/contributors?per_page=100`),
      githubJson(`${GH_API}/users/${encodeURIComponent(owner)}/sponsors?per_page=100`),
      githubJson(`${GH_API}/orgs/${encodeURIComponent(owner)}/sponsors?per_page=100`)
    ]);
    if (!repoResult.ok || !repoResult.data) {
      return { ok: false, status: repoResult.status || 0 };
    }
    const sponsorResult = userSponsorResult.ok ? userSponsorResult : orgSponsorResult;
    const payload = {
      repo: repoResult.data,
      releases: releaseResult.ok && Array.isArray(releaseResult.data) ? releaseResult.data : [],
      commits: commitResult.ok && Array.isArray(commitResult.data) ? commitResult.data : [],
      languages: langResult.ok && langResult.data && typeof langResult.data === "object" ? langResult.data : null,
      contributors: contribResult.ok && Array.isArray(contribResult.data) ? contribResult.data : [],
      sponsors: sponsorResult.ok && Array.isArray(sponsorResult.data) ? sponsorResult.data : []
    };
    writeGithubCache(owner, name, payload);
    return { ok: true, payload };
  }

  async function loadGithub(root) {
    const owner = root.dataset.githubOwner;
    const name = root.dataset.githubName;
    if (!owner || !name) {
      failGithub(root, "This section has no repository.");
      return;
    }
    const cached = readGithubCacheRecord(owner, name);
    const boot = readGithubBootstrap(root);
    const known = cached?.payload || boot;
    const complete = Boolean(known && Array.isArray(known.contributors) && Array.isArray(known.sponsors));
    const fresh = Boolean(cached && Date.now() - cached.at < GH_CACHE_FRESH_MS);
    if (known) renderGithub(root, known);
    if (fresh && complete) return;
    try {
      const next = await refreshGithub(root, owner, name);
      if (next.ok) {
        renderGithub(root, next.payload);
        return;
      }
      if (known) return;
      const reason =
        next.status === 403
          ? "GitHub rate-limited this browser."
          : next.status === 404
            ? "GitHub did not find that public repository."
            : "GitHub did not return repository data.";
      failGithub(root, reason);
    } catch (error) {
      report("github", error);
      if (!known) failGithub(root, "The browser could not reach the GitHub API.");
    }
  }

  function initGithub() {
    const roots = document.querySelectorAll(".github[data-github-owner]");
    if (!roots.length) return;
    const start = (root) => {
      if (root.dataset.githubStarted) return;
      root.dataset.githubStarted = "1";
      loadGithub(root);
    };
    if (!("IntersectionObserver" in window)) {
      roots.forEach(start);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          io.unobserve(entry.target);
          start(entry.target);
        });
      },
      { rootMargin: "240px 0px", threshold: 0.01 }
    );
    roots.forEach((root) => io.observe(root));
  }

  function initDocs() {
    document.querySelectorAll("[data-docs]").forEach((root) => {
      const workbench = root.querySelector(".docs-workbench");
      const reader = root.querySelector(".docs-reader");
      const files = Array.from(root.querySelectorAll(".docs-tree__file"));
      const pages = Array.from(root.querySelectorAll(".docs-page"));
      const folders = Array.from(root.querySelectorAll(".docs-tree__folder"));
      const pathEl = root.querySelector(".docs-reader__path");
      const openEl = root.querySelector(".docs-reader__open");
      const track = root.querySelector(".docs-tree__track");
      const shadeHost = root.querySelector(".docs-tree__shade");
      const toggles = Array.from(root.querySelectorAll("[data-docs-tree-toggle]"));
      if (!workbench || !files.length || !pages.length) return;

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const hoverExpand = window.matchMedia("(hover: hover) and (pointer: fine)");
      let current = files.find((btn) => btn.classList.contains("is-active")) || files[0];
      let currentPage = pages.find((page) => page.getAttribute("data-doc") === current?.getAttribute("data-doc")) || pages[0];
      let slideGen = 0;
      let fileShade = null;

      const setFolderOpenClass = (folder, on) => {
        folder.classList.toggle("is-open", on);
        const summary = folder.querySelector(":scope > .docs-tree__summary");
        if (summary) summary.setAttribute("aria-expanded", on ? "true" : "false");
      };

      folders.forEach((folder) => {
        if (folder.open) setFolderOpenClass(folder, true);
      });
      root.dataset.docsEnhanced = "true";
      root.setAttribute("data-docs-enhanced", "");

      const fileBoxInTrack = (file) => {
        const trackRect = track.getBoundingClientRect();
        const fileRect = file.getBoundingClientRect();
        const width = Math.max(1, file.offsetWidth);
        const height = Math.max(1, file.offsetHeight);
        const left = fileRect.left - trackRect.left + (fileRect.width - width) / 2;
        const top = fileRect.top - trackRect.top + (fileRect.height - height) / 2;
        return {
          left: Math.round(left),
          top: Math.round(top),
          width: Math.round(width),
          height: Math.round(height)
        };
      };

      const applyShadeBox = (box) => {
        shadeHost.style.left = `${box.left}px`;
        shadeHost.style.top = `${box.top}px`;
        shadeHost.style.width = `${box.width}px`;
        shadeHost.style.height = `${box.height}px`;
      };

      const placeShade = (file, animate) => {
        if (!shadeHost || !track || !file) return;
        const next = fileBoxInTrack(file);
        if (!animate || reducedMotion || !hasGsap) {
          fileShade?.stir(1);
          if (hasGsap) {
            gsap.killTweensOf(shadeHost);
            gsap.set(shadeHost, { x: 0, y: 0, ...next });
          } else applyShadeBox(next);
          return;
        }
        const duration = 0.28;
        const stir = function () {
          const d = this.duration();
          fileShade?.stir(d ? this.time() / d : 1);
        };
        fileShade?.stir(0);
        gsap.to(shadeHost, {
          x: 0,
          y: 0,
          ...next,
          duration,
          ease: "power2.out",
          overwrite: "auto",
          onUpdate: stir,
          onComplete() {
            fileShade?.stir(1);
          }
        });
      };

      const followShade = () => {
        if (!shadeHost || !track || !current) return;
        if (!current.getClientRects().length) return;
        if (hasGsap) {
          gsap.killTweensOf(shadeHost);
          fileShade?.stir(1);
        }
        applyShadeBox(fileBoxInTrack(current));
      };

      try {
        if (hasGsap && shadeHost) gsap.set(shadeHost, { transformOrigin: "0% 0%", x: 0, y: 0 });
        placeShade(current, false);
        if (shadeHost) {
          mountHeroShade(shadeHost, { tint: 0.5 })
            .then((shade) => {
              if (shade) {
                fileShade = shade;
                heroShades.push(shade);
              } else shadeHost.hidden = true;
            })
            .catch((error) => {
              shadeHost.hidden = true;
              report("docs-shade", error);
            });
        }
      } catch (error) {
        if (shadeHost) shadeHost.hidden = true;
        report("docs-shade", error);
      }

      const treeNav = root.querySelector(".docs-tree__nav");
      const treeRail = root.querySelector("[data-docs-rail]");
      const pageRail = root.querySelector("[data-docs-rail-page]");

      const syncOverflow = (node) => {
        if (!node || node.hidden) {
          node?.classList.remove("is-overflow-top", "is-overflow-bottom");
          return;
        }
        const view = node.clientHeight;
        if (view <= 0) return;
        const max = node.scrollHeight - view;
        node.classList.toggle("is-overflow-top", node.scrollTop > 4);
        node.classList.toggle("is-overflow-bottom", max > 4 && node.scrollTop < max - 4);
      };

      const syncRail = (scroller, rail) => {
        if (!rail) return;
        if (!scroller || scroller.hidden) {
          rail.classList.remove("is-needed");
          return;
        }
        const view = scroller.clientHeight;
        if (view <= 0) return;
        const total = scroller.scrollHeight;
        const max = total - view;
        if (max <= 4) {
          rail.classList.remove("is-needed");
          return;
        }
        rail.classList.add("is-needed");
        const thumb = rail.querySelector(".docs-scroll__thumb");
        if (!thumb) return;
        const track = rail.clientHeight;
        const thumbH = Math.max(24, Math.round((view / total) * track));
        const maxTop = Math.max(0, track - thumbH);
        const top = max <= 0 ? 0 : Math.round((scroller.scrollTop / max) * maxTop);
        thumb.style.height = `${thumbH}px`;
        thumb.style.transform = `translate3d(0, ${top}px, 0)`;
      };

      const syncTreeChrome = () => {
        syncOverflow(treeNav);
        syncRail(treeNav, treeRail);
      };

      const syncPageChrome = (page) => {
        if (!page) return;
        syncOverflow(page);
        if (!page.hidden) syncRail(page, pageRail);
      };

      const finishSlide = (gen, page) => {
        if (gen !== slideGen) return;
        reader?.classList.remove("is-sliding");
        syncPageChrome(page);
        syncTreeChrome();
      };

      const setTreeOpen = (open) => {
        workbench.classList.toggle("is-tree-open", open);
        toggles.forEach((btn) => {
          if (btn.classList.contains("docs-reader__files")) {
            btn.setAttribute("aria-expanded", open ? "true" : "false");
          }
        });
      };

      const bindSource = (btn) => {
        if (!openEl) return;
        const href = btn.getAttribute("data-docs-href") || "";
        openEl.setAttribute("target", "_blank");
        openEl.setAttribute("rel", "noreferrer");
        if (href) {
          openEl.href = href;
          openEl.hidden = false;
          openEl.classList.remove("is-empty");
        } else {
          openEl.removeAttribute("href");
          openEl.hidden = true;
          openEl.classList.add("is-empty");
        }
      };

      const select = (btn, { animate = true, hash = true } = {}) => {
        if (!btn) return;
        const id = btn.getAttribute("data-doc");
        const next = pages.find((page) => page.getAttribute("data-doc") === id);
        if (!next) return;
        if (btn === current && !next.hidden) {
          setTreeOpen(false);
          return;
        }
        files.forEach((file) => {
          const on = file === btn;
          file.classList.toggle("is-active", on);
          if (on) file.setAttribute("aria-current", "page");
          else file.removeAttribute("aria-current");
        });
        current = btn;
        folders.forEach((folder) => {
          if (folder.contains(btn) && (!folder.classList.contains("is-open") || folder.classList.contains("is-compact"))) {
            openFolder(folder, { animate: false });
          }
        });
        if (pathEl) pathEl.textContent = btn.getAttribute("data-docs-path") || btn.getAttribute("data-docs-title") || "";
        bindSource(btn);
        const leave = currentPage;
        const gen = ++slideGen;
        pages.forEach((page) => {
          if (page !== next && page !== leave) {
            if (hasGsap) gsap.killTweensOf(page);
            page.hidden = true;
            page.classList.remove("is-stacked", "is-leaving");
          }
        });
        next.hidden = false;
        next.scrollTop = 0;
        placeShade(btn, animate);
        if (fileShade?.sync) fileShade.sync();
        if (animate && !reducedMotion && hasGsap && leave && leave !== next) {
          leave.hidden = false;
          leave.classList.add("is-stacked", "is-leaving");
          reader?.classList.add("is-sliding");
          let pending = 2;
          const done = () => {
            pending -= 1;
            if (pending > 0) return;
            finishSlide(gen, next);
          };
          const fromX = Number(gsap.getProperty(leave, "xPercent")) || 0;
          gsap.fromTo(
            leave,
            { xPercent: fromX },
            {
              xPercent: -100,
              duration: 0.42,
              ease: "power3.inOut",
              overwrite: "auto",
              onComplete: () => {
                if (gen !== slideGen) return;
                leave.hidden = true;
                leave.classList.remove("is-stacked", "is-leaving");
                gsap.set(leave, { clearProps: "transform" });
                done();
              }
            }
          );
          gsap.fromTo(
            next,
            { xPercent: 100 },
            {
              xPercent: 0,
              duration: 0.42,
              ease: "power3.inOut",
              overwrite: "auto",
              onComplete: () => {
                if (gen !== slideGen) return;
                gsap.set(next, { clearProps: "transform" });
                done();
              }
            }
          );
        } else {
          if (hasGsap) gsap.killTweensOf([leave, next].filter(Boolean));
          if (leave && leave !== next) {
            leave.hidden = true;
            leave.classList.remove("is-stacked", "is-leaving");
            if (hasGsap) gsap.set(leave, { clearProps: "transform" });
          }
          if (hasGsap) gsap.set(next, { clearProps: "transform" });
          reader?.classList.remove("is-sliding");
          syncPageChrome(next);
          syncTreeChrome();
        }
        currentPage = next;
        setTreeOpen(false);
        if (hash && id) {
          const nextHash = `#doc-${id}`;
          if (location.hash !== nextHash) {
            try {
              history.replaceState(null, "", nextHash);
            } catch {}
          }
        }
      };

      const FOLD_DUR = 0.28;
      const FOLD_EASE = "power2.inOut";

      const folderNodes = (folder) =>
        Array.from(folder.querySelectorAll(":scope > .docs-tree__fold .docs-tree__node"));

      const pathNodes = (folder) => {
        const kept = new Set();
        if (!current || !folder.contains(current)) return kept;
        let node = current.closest(".docs-tree__node");
        while (node && folder.contains(node)) {
          const own = node.querySelector(":scope > .docs-tree__folder");
          if (own === folder) break;
          kept.add(node);
          node = node.parentElement?.closest(".docs-tree__node");
        }
        return kept;
      };

      const stowTargets = (folder) => {
        const kept = pathNodes(folder);
        return folderNodes(folder).filter((node) => !kept.has(node));
      };

      const killFolderTweens = (folder) => {
        if (!hasGsap) return;
        gsap.killTweensOf(folderNodes(folder));
      };

      const afterFold = () => {
        followShade();
        syncTreeChrome();
      };

      const openFolder = (folder, { animate = true } = {}) => {
        killFolderTweens(folder);
        folder.open = true;
        folder.classList.remove("is-compact");
        setFolderOpenClass(folder, true);
        const hidden = folderNodes(folder).filter(
          (node) => node.classList.contains("is-stowed") || node.classList.contains("is-stowing")
        );
        const reveal = () => {
          hidden.forEach((node) => {
            node.classList.remove("is-stowed", "is-stowing");
            node.style.removeProperty("height");
            node.style.removeProperty("opacity");
            node.style.removeProperty("overflow");
          });
          afterFold();
        };
        if (!hidden.length) {
          afterFold();
          return;
        }
        if (!animate || reducedMotion || !hasGsap) {
          reveal();
          return;
        }
        hidden.forEach((node) => {
          node.classList.remove("is-stowed");
          node.classList.add("is-stowing");
          node.style.overflow = "hidden";
          node.style.height = "0px";
          node.style.opacity = "0";
        });
        gsap.to(hidden, {
          height: "auto",
          opacity: 1,
          duration: FOLD_DUR,
          ease: FOLD_EASE,
          stagger: 0.012,
          overwrite: "auto",
          onUpdate: followShade,
          onComplete: reveal
        });
      };

      const closeFolder = (folder) => {
        if (!folder.open && !folder.classList.contains("is-open") && !folder.classList.contains("is-compact")) return;
        killFolderTweens(folder);
        const kept = pathNodes(folder);
        const compact = kept.size > 0;
        const hide = stowTargets(folder);
        folder.classList.toggle("is-compact", compact);
        if (compact) {
          folder.open = true;
          setFolderOpenClass(folder, true);
        } else {
          setFolderOpenClass(folder, false);
        }
        const finish = () => {
          hide.forEach((node) => {
            node.classList.add("is-stowed");
            node.classList.remove("is-stowing");
            node.style.removeProperty("height");
            node.style.removeProperty("opacity");
            node.style.removeProperty("overflow");
          });
          if (!compact) folder.open = false;
          afterFold();
        };
        if (!hide.length) {
          finish();
          return;
        }
        if (reducedMotion || !hasGsap) {
          finish();
          return;
        }
        hide.forEach((node) => {
          node.classList.add("is-stowing");
          node.style.overflow = "hidden";
        });
        gsap.to(hide, {
          height: 0,
          opacity: 0,
          duration: FOLD_DUR,
          ease: FOLD_EASE,
          stagger: compact ? 0.01 : 0,
          overwrite: "auto",
          onUpdate: followShade,
          onComplete: finish
        });
      };

      folders.forEach((folder) => {
        const summary = folder.querySelector(":scope > .docs-tree__summary");
        if (!summary) return;
        let expandTimer = 0;
        const clearExpand = () => {
          if (expandTimer) {
            window.clearTimeout(expandTimer);
            expandTimer = 0;
          }
        };
        const isExpanded = () => folder.classList.contains("is-open") && !folder.classList.contains("is-compact");
        summary.addEventListener("click", (event) => {
          event.preventDefault();
          clearExpand();
          if (isExpanded()) closeFolder(folder);
          else openFolder(folder);
        });
        folder.addEventListener("pointerenter", (event) => {
          if (!hoverExpand.matches) return;
          if (event.pointerType && event.pointerType !== "mouse") return;
          if (folder.classList.contains("is-open")) return;
          clearExpand();
          expandTimer = window.setTimeout(() => {
            expandTimer = 0;
            openFolder(folder);
          }, 1000);
        });
        folder.addEventListener("pointerleave", clearExpand);
      });

      files.forEach((btn) => {
        btn.addEventListener("click", () => select(btn));
      });

      treeNav?.addEventListener("scroll", syncTreeChrome, { passive: true });
      pages.forEach((page) => {
        page.addEventListener("scroll", () => {
          if (page === currentPage) syncPageChrome(page);
        }, { passive: true });
      });
      if (typeof ResizeObserver === "function") {
        const pageRo = new ResizeObserver(() => syncPageChrome(currentPage));
        pages.forEach((page) => pageRo.observe(page));
        if (track) {
          const trackRo = new ResizeObserver(() => {
            placeShade(current, false);
            syncTreeChrome();
          });
          trackRo.observe(track);
        }
        if (treeNav) {
          const navRo = new ResizeObserver(syncTreeChrome);
          navRo.observe(treeNav);
        }
      }
      syncPageChrome(currentPage);
      syncTreeChrome();

      root.addEventListener("keydown", (event) => {
        const visible = files.filter((file) => file.getClientRects().length && !file.closest(".docs-tree__node.is-stowed"));
        const index = visible.indexOf(document.activeElement);
        if (index === -1) return;
        let next = -1;
        if (event.key === "ArrowDown") next = Math.min(visible.length - 1, index + 1);
        else if (event.key === "ArrowUp") next = Math.max(0, index - 1);
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = visible.length - 1;
        else if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          select(visible[index]);
          return;
        } else return;
        event.preventDefault();
        visible[next]?.focus();
      });

      toggles.forEach((btn) => {
        btn.addEventListener("click", () => {
          setTreeOpen(!workbench.classList.contains("is-tree-open"));
        });
      });

      root.addEventListener("keydown", (event) => {
        if (event.key === "Escape") setTreeOpen(false);
      });

      const fromHash = () => {
        const hash = String(location.hash || "").replace(/^#/, "");
        if (!hash.startsWith("doc-")) return;
        const id = hash.slice(4);
        const btn = files.find((file) => file.getAttribute("data-doc") === id);
        if (btn) select(btn, { animate: false, hash: false });
      };
      fromHash();
      bindSource(current);
      placeShade(current, false);
      syncPageChrome(currentPage);
      syncTreeChrome();
      requestAnimationFrame(() => {
        placeShade(current, false);
        syncPageChrome(currentPage);
        syncTreeChrome();
      });
    });
  }

  /* Pause button: html[data-motion="paused"], kept per browser; motion modules listen for
     "motion:change". */
  function initMotionToggle() {
    const buttons = Array.from(document.querySelectorAll("[data-motion-toggle]"));
    if (!buttons.length) return;
    const KEY = "gvaste-motion";
    const root = document.documentElement;
    let paused = false;
    try {
      paused = localStorage.getItem(KEY) === "paused";
    } catch {}
    const apply = (next) => {
      paused = next;
      if (paused) root.dataset.motion = "paused";
      else delete root.dataset.motion;
      const label = paused ? "Play animations" : "Pause animations";
      buttons.forEach((button) => {
        button.setAttribute("aria-pressed", String(paused));
        button.setAttribute("aria-label", label);
        button.title = label;
      });
      document.dispatchEvent(new CustomEvent("motion:change", { detail: { paused } }));
    };
    apply(paused);
    buttons.forEach((button) =>
      button.addEventListener("click", () => {
        apply(!paused);
        try {
          if (paused) localStorage.setItem(KEY, "paused");
          else localStorage.removeItem(KEY);
        } catch {}
      })
    );
  }

  /* Pictures with a light-mode twin (data-light-src) follow the page theme. */
  function initThemeTwins() {
    const images = Array.from(document.querySelectorAll("img[data-light-src]"));
    if (!images.length) return;
    images.forEach((img) => (img.dataset.darkSrc = img.getAttribute("src")));
    const apply = () => {
      const light = document.documentElement.dataset.theme === "light";
      images.forEach((img) => {
        const next = light ? img.dataset.lightSrc : img.dataset.darkSrc;
        if (img.getAttribute("src") !== next) img.setAttribute("src", next);
      });
    };
    apply();
    new MutationObserver(apply).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  }

  /* A single picture that opens in the viewer: a button with data-zoom around an img.
     data-zoom may name a larger file; otherwise the shown picture opens. */
  function initZoom() {
    document.querySelectorAll("[data-zoom]").forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const img = trigger.querySelector("img");
        if (!img) return;
        const src = trigger.dataset.zoom || img.currentSrc || img.src;
        try {
          lightbox.open({
            source() {
              const rect = img.getBoundingClientRect();
              return {
                el: img,
                src,
                alt: img.alt,
                naturalWidth: img.naturalWidth,
                naturalHeight: img.naturalHeight,
                radius: parseFloat(getComputedStyle(img).borderRadius) || 8,
                shadow: "0 30px 60px -20px rgba(0,0,0,0.65), 0 8px 20px -10px rgba(0,0,0,0.5)",
                rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
                index: 0,
                total: 1
              };
            },
            step() {
              return this.source();
            }
          });
        } catch (error) {
          report("zoom", error);
        }
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Boot                                                                */
  /* ------------------------------------------------------------------ */

  const STEPS = [
    ["theme", initTheme],
    ["hero-shade", initHeroShade],
    ["motion-toggle", initMotionToggle],
    ["theme-twins", initThemeTwins],
    ["carousel", () => document.querySelectorAll("[data-carousel]").forEach((root) => new DepthCarousel(root))],
    ["zoom", initZoom],
    ["motion", initMotion],
    ["scroll", initPageScroll],
    ["site-nav", initSiteNav],
    ["navigation", initNavigation],
    ["to-top", initToTop],
    ["stack", initStack],
    ["tilt", initTilt],
    ["about", initAbout],
    ["faq", initFaq],
    ["docs", initDocs],
    ["github", initGithub],
    ["commands", initCommands],
    ["copy", initCopy],
    ["proof-tabs", initProofTabs],
    ["compare-slider", initCompareSlider]
  ];

  function init() {
    document.documentElement.setAttribute("data-app", "ready");
    for (const [name, step] of STEPS) {
      try {
        step();
      } catch (error) {
        if (name === "motion") releaseMotionCss();
        report(name, error);
      }
    }
    if (hasScrollTrigger) window.ScrollTrigger.refresh();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
