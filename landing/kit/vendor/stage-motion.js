/* Stage motion: hero card track, style marquee, walkthrough, provider cards, and the mascot guide.
 * Loaded by runtime-loader.js only when the page has one of these surfaces. GSAP and
 * ScrollTrigger are loaded first. Page scrolling stays with app.js.
 * Without motion every surface still works: the track swaps instantly, rows scroll by hand,
 * steps stay readable, and the mascot stays in the hero lockup. */

const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;
const compact = window.matchMedia("(max-width: 840px)");
const motion = Boolean(gsap && ScrollTrigger) && !reduced;
if (motion) gsap.registerPlugin(ScrollTrigger);

const root = document.documentElement;

// The header's pause button (html[data-motion="paused"]) stops what moves on its own: loops
// registered with keep() pause, and timed advances wait. Jumps and replies to the reader still play.
const stilled = () => root.dataset.motion === "paused";
let ambient = [];
const keep = (tween) => {
  ambient = ambient.filter((item) => item.parent);
  ambient.push(tween);
  if (stilled()) tween.pause();
  return tween;
};
document.addEventListener("motion:change", () => ambient.forEach((tween) => (stilled() ? tween.pause() : tween.resume())));
const clamp = (min, max, value) => Math.min(max, Math.max(min, value));

// Surfaces tell the mascot what happens through small events on the document.
const emit = (type, detail = {}) => document.dispatchEvent(new CustomEvent(`stage:${type}`, { detail }));
const on = (type, handler) => document.addEventListener(`stage:${type}`, (event) => handler(event.detail));

/* ---------- Panels: which one the reader is on ---------- */
const panels = [...document.querySelectorAll("main > .stack-panel")];
const stacked = () => root.classList.contains("gsap-scroll");
const panelOf = (el) => el?.closest("main > .stack-panel") ?? null;

function panelStart(panel) {
  let y = 0;
  for (let node = panel.previousElementSibling; node; node = node.previousElementSibling) y += node.offsetHeight;
  return y;
}

function currentPanel() {
  if (!panels.length) return -1;
  if (stacked()) {
    let best = 0;
    let distance = Infinity;
    panels.forEach((panel, index) => {
      const d = Math.abs(panelStart(panel) - window.scrollY);
      if (d < distance) {
        distance = d;
        best = index;
      }
    });
    return best;
  }
  // At the end of the page the last panel may never reach the line, so the bottom counts as it.
  const bottom = window.scrollY >= document.documentElement.scrollHeight - window.innerHeight - 2;
  if (bottom && window.scrollY > 0) return panels.length - 1;
  const line = window.innerHeight * 0.45;
  let best = 0;
  panels.forEach((panel, index) => {
    if (panel.getBoundingClientRect().top <= line) best = index;
  });
  return best;
}

let activePanel = -1;
const isActive = (el) => activePanel >= 0 && panels[activePanel]?.contains(el);

function syncPanel() {
  const index = currentPanel();
  if (index === activePanel) return;
  const previous = activePanel;
  activePanel = index;
  emit("panel", { index, previous, panel: panels[index] });
}

/* ---------- Header mascot: steam on hover and the odd blink ---------- */
if (motion) {
  for (const mini of document.querySelectorAll('[data-mascot="mini"]')) {
    const steam = mini.querySelectorAll('[data-part^="steam-"]');
    const eyes = mini.querySelectorAll('[data-part="eye-left"] > g, [data-part="eye-right"] > g');
    const puff = steam.length
      ? gsap.to(steam, { y: -26, opacity: 0.35, duration: 1.5, ease: "sine.inOut", stagger: { each: 0.35, repeat: -1, yoyo: true }, paused: true })
      : null;
    const brand = mini.closest("a, button") ?? mini;
    brand.addEventListener("pointerenter", () => puff?.play());
    brand.addEventListener("pointerleave", () => puff?.pause());
    const blink = () =>
      gsap.to(eyes, {
        scaleY: 0.08,
        transformOrigin: "50% 60%",
        duration: 0.07,
        yoyo: true,
        repeat: 1,
        onComplete: () => gsap.delayedCall(gsap.utils.random(2.5, 7), blink),
      });
    if (eyes.length) gsap.delayedCall(gsap.utils.random(1, 4), blink);
  }
}

/* ---------- Mascot rig: faces, poses and body mechanics for one inline drawing ---------- */
// Pivots in the drawing's own units (viewBox 116 380 1048 812, steam drawn above it).
const PIVOT = {
  shoulderLeft: "362 773",
  shoulderRight: "915 796",
  hipLeft: "553 927",
  hipRight: "719 930",
  feet: "640 1168",
  middle: "640 760",
  cupBase: "640 979",
  hips: "640 940",
  steam: "650 390",
};

// Each face: eye openness (0 closed, 1 open, >1 wide), happy arcs, mouth, brows, blush.
const MOODS = {
  happy: { eyes: [1, 1], arcs: [0, 0], mouth: "smile", smile: 1, brows: [0, 0], browY: 0, browTilt: 0, blush: 0.2 },
  laugh: { eyes: [0, 0], arcs: [1, 1], mouth: "laugh", smile: 1, brows: [0, 0], browY: 0, browTilt: 0, blush: 0.75 },
  wink: { eyes: [1, 0], arcs: [0, 1], mouth: "smile", smile: 1.05, brows: [1, 0], browY: -12, browTilt: -6, blush: 0.45 },
  surprised: { eyes: [1.2, 1.2], arcs: [0, 0], mouth: "o", smile: 1, brows: [1, 1], browY: -20, browTilt: 0, blush: 0.1 },
  focused: { eyes: [0.7, 0.7], arcs: [0, 0], mouth: "smile", smile: 0.55, brows: [1, 1], browY: 10, browTilt: 14, blush: 0 },
  sleepy: { eyes: [0.28, 0.28], arcs: [0, 0], mouth: "smile", smile: 0.72, brows: [0, 0], browY: 0, browTilt: 0, blush: 0.4 },
};

// The pencil rests tilted 12 degrees left of straight up.
const PENCIL_REST = -102;

function mascotRig(svg, { onCheer } = {}) {
  const q = (selector) => svg.querySelector(selector);
  const qa = (selector) => [...svg.querySelectorAll(selector)];
  const part = {
    framing: q('[id$="-framing"]'),
    world: q('[id$="-world"]'),
    upper: q('[id$="-upper"]'),
    torso: q('[id$="-torso"]'),
    eyes: [q('[id$="-eye-left"]'), q('[id$="-eye-right"]')],
    arcs: [q('[id$="-eye-left-happy"]'), q('[id$="-eye-right-happy"]')],
    mouths: { smile: q('[id$="-smile"]'), laugh: q('[id$="-laugh"]'), o: q('[id$="-mouth-o"]') },
    brows: [q('[id$="-brow"]'), q('[id$="-brow-right"]')],
    blush: q('[data-part="blush"]'),
    armLeft: q('[id$="-limb-left"]'),
    armRight: q('[id$="-limb-right"]'),
    legLeft: q('[id$="-limb-leg-left"]'),
    legRight: q('[id$="-limb-leg-right"]'),
    steam: qa('[data-part^="steam-"]'),
    plumes: qa('[id$="-steam-a"], [id$="-steam-b"]'),
    pencil: q('[id$="-pencil"]'),
    rays: qa('[id$="-pencil-sparks"] path'),
    sign: q('[id$="-sign"]'),
    signLogo: q('[id$="-sign-logo"]'),
    signMono: q('[id$="-sign-mono"]'),
    ink: qa('[id$="-ink-drawing"] path'),
    inkGroup: q('[id$="-ink-drawing"]'),
    ring: q('[id$="-impact-ring"]'),
    dust: qa('[id$="-dust"] circle'),
    shadow: q('[data-part="shadow"]'),
  };
  const some = (list) => list.filter(Boolean);
  const arms = some([part.armLeft, part.armRight]);
  const legs = some([part.legLeft, part.legRight]);
  const limbs = [...arms, ...legs];

  gsap.set(part.armLeft, { svgOrigin: PIVOT.shoulderLeft });
  gsap.set(part.armRight, { svgOrigin: PIVOT.shoulderRight });
  gsap.set(part.legLeft, { svgOrigin: PIVOT.hipLeft });
  gsap.set(part.legRight, { svgOrigin: PIVOT.hipRight });
  gsap.set(part.framing, { svgOrigin: PIVOT.feet });
  gsap.set(part.world, { svgOrigin: PIVOT.middle });
  gsap.set(part.torso, { svgOrigin: PIVOT.cupBase });
  gsap.set(part.upper, { svgOrigin: PIVOT.hips });
  gsap.set(part.steam, { svgOrigin: PIVOT.steam });
  gsap.set(part.plumes, { transformOrigin: "50% 100%" });
  gsap.set(some(part.eyes), { transformOrigin: "50% 60%" });
  gsap.set(some(part.arcs), { transformOrigin: "50% 100%", scale: 0.6 });
  gsap.set(some(Object.values(part.mouths)), { transformOrigin: "50% 40%" });
  gsap.set(some(part.brows), { transformOrigin: "50% 50%" });
  gsap.set(part.shadow, { transformOrigin: "50% 50%" });
  gsap.set(part.rays, { opacity: 0, transformOrigin: "100% 100%" });
  gsap.set(part.pencil, { transformOrigin: "50% 100%" });
  gsap.set(part.sign, { transformOrigin: "50% 100%", scale: 0, opacity: 1 });
  gsap.set(part.dust, { transformOrigin: "50% 50%", opacity: 0 });
  gsap.set(part.inkGroup, { opacity: 1 });
  gsap.set(part.ink, { strokeDasharray: 100, strokeDashoffset: 100 });

  /* Faces. A change reads as a blink: the eyes close, the features swap, the eyes open. */
  let mood = "happy";
  function setMood(name, { instant = false } = {}) {
    mood = MOODS[name] ? name : "happy";
    const m = MOODS[mood];
    const t = instant ? 0 : 1;
    const swap = instant ? 0 : 0.08;
    const tl = gsap.timeline();
    if (!instant) tl.to(some(part.eyes), { scaleY: 0.08, duration: 0.07, ease: "power2.in", overwrite: "auto" }, 0);
    part.eyes.forEach((eye, i) => {
      const v = m.eyes[i];
      if (eye) tl.to(eye, { scaleX: Math.max(1, v), scaleY: v || 0.08, opacity: v ? 1 : 0, duration: 0.2 * t, ease: "back.out(2.2)" }, swap);
    });
    part.arcs.forEach((arc, i) => {
      if (arc) tl.to(arc, { opacity: m.arcs[i], scale: m.arcs[i] ? 1 : 0.6, duration: 0.22 * t, ease: "back.out(2.4)" }, swap);
    });
    Object.entries(part.mouths).forEach(([key, el]) => {
      if (!el) return;
      const shown = key === m.mouth;
      tl.to(
        el,
        {
          opacity: shown ? 1 : 0,
          scaleX: shown ? (key === "smile" ? m.smile : 1) : 0.4,
          scaleY: shown ? 1 : 0.4,
          duration: (shown ? 0.36 : 0.12) * t,
          ease: shown ? "back.out(2.6)" : "power2.in",
        },
        shown ? swap : 0,
      );
    });
    part.brows.forEach((brow, i) => {
      if (brow) tl.to(brow, { opacity: m.brows[i], y: m.browY, rotation: i ? -m.browTilt : m.browTilt, duration: 0.28 * t, ease: "back.out(2)" }, swap);
    });
    if (part.blush) tl.to(part.blush, { opacity: m.blush, duration: 0.4 * t }, 0);
    gsap.to(part.steam, { scale: mood === "sleepy" ? 1.18 : 1, duration: 0.8, ease: "sine.inOut" });
    steamRise.timeScale(mood === "sleepy" ? 0.55 : 1);
    return tl;
  }

  /* Life: breathing, a slow sway, rising steam, blinks. */
  keep(gsap.to(part.torso, { scaleY: 1.018, scaleX: 0.992, duration: 1.7, ease: "sine.inOut", yoyo: true, repeat: -1 }));
  const steamRise = keep(gsap.to(part.steam, { y: -30, opacity: 0.4, duration: 1.6, ease: "sine.inOut", stagger: { each: 0.4, repeat: -1, yoyo: true } }));
  keep(gsap.to(part.steam, { skewX: 7, duration: 2.3, ease: "sine.inOut", yoyo: true, repeat: -1 }));
  const blink = () => {
    const m = MOODS[mood];
    const open = part.eyes.filter((eye, i) => eye && m.eyes[i] > 0.2);
    if (open.length) {
      const again = Math.random() < 0.2;
      gsap
        .timeline()
        .to(open, { scaleY: 0.08, duration: 0.07, ease: "power2.in" })
        .to(open, { scaleY: (_i, eye) => m.eyes[part.eyes.indexOf(eye)], duration: 0.12, ease: "power2.out" })
        .to(open, { scaleY: 0.08, duration: again ? 0.07 : 0, ease: "power2.in" }, again ? "+=0.08" : ">")
        .to(open, { scaleY: (_i, eye) => m.eyes[part.eyes.indexOf(eye)], duration: again ? 0.12 : 0 });
    }
    gsap.delayedCall(gsap.utils.random(2.2, 6), blink);
  };
  gsap.delayedCall(gsap.utils.random(1.5, 3), blink);

  /* Eyes follow a direction (dx, dy in -1..1). */
  const eyeX = some(part.eyes).map((eye) => gsap.quickTo(eye, "x", { duration: 0.45, ease: "power3" }));
  const eyeY = some(part.eyes).map((eye) => gsap.quickTo(eye, "y", { duration: 0.45, ease: "power3" }));
  const look = (dx, dy) => {
    eyeX.forEach((to) => to(dx * 16));
    eyeY.forEach((to) => to(dy * 12));
  };

  /* Small motions used by poses, reactions and fidgets. */
  const ring = () =>
    part.ring
      ? gsap.fromTo(part.ring, { attr: { rx: 150, ry: 16 }, opacity: 0.9 }, { attr: { rx: 330, ry: 38 }, opacity: 0, duration: 0.6, ease: "power2.out" })
      : gsap.timeline();
  const sparkle = () =>
    gsap.fromTo(part.rays, { opacity: 1, scale: 0.2 }, { scale: 1.2, opacity: 0, duration: 0.55, stagger: 0.05, ease: "power2.out" });
  const dust = (strength = 1, direction = 1) => {
    const tl = gsap.timeline();
    part.dust.forEach((puff, index) => {
      const side = index < part.dust.length / 2 ? -1 : 1;
      const push = side === direction ? 1.25 : 0.8;
      tl.fromTo(
        puff,
        { opacity: 0.6 * Math.min(1, strength), scale: 0.3, x: 0, y: 0 },
        {
          opacity: 0,
          scale: gsap.utils.random(1.1, 1.8) * Math.min(1.2, strength),
          x: side * gsap.utils.random(70, 150) * strength * push,
          y: -gsap.utils.random(14, 46) * strength,
          duration: gsap.utils.random(0.5, 0.8),
          ease: "power2.out",
        },
        index * 0.02,
      );
    });
    return tl;
  };
  const wobble = () =>
    gsap
      .timeline()
      .to(part.upper, { rotation: 8, duration: 0.1, ease: "power2.out" })
      .to(part.upper, { rotation: -6, duration: 0.14, ease: "sine.inOut" })
      .to(part.upper, { rotation: 0, duration: 0.6, ease: "elastic.out(1, 0.3)" });
  // A quick lift of the upper body, feet planted: the resting answer to something happening.
  const perk = (amount = 1) =>
    gsap
      .timeline()
      .to(part.upper, { scaleY: 1 + 0.12 * amount, scaleX: 1 - 0.05 * amount, duration: 0.14, ease: "power2.out" })
      .to(arms, { rotation: (i) => (i ? -26 : 20) * amount, duration: 0.16, ease: "power2.out" }, 0)
      .to(part.upper, { scaleY: 1, scaleX: 1, duration: 0.7, ease: "elastic.out(1.1, 0.35)" })
      .to(arms, { rotation: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" }, "<");
  // The app logo's answer to a click: a twist, a swell, and back.
  const pop = () =>
    gsap
      .timeline()
      .to(part.upper, { rotation: -12, scale: 0.88, duration: 0.084, ease: "power2.out" })
      .to(part.upper, { rotation: 9, scale: 1.12, duration: 0.147, ease: "power2.out" })
      .to(part.upper, { rotation: 0, scale: 1, duration: 0.19, ease: "expo.out" });

  /* Fidgets keep a resting mascot alive. Each lasts a second or two and ends at rest. */
  const FIDGETS = {
    stretch: () =>
      gsap
        .timeline()
        .to(part.upper, { scaleY: 1.12, scaleX: 0.94, duration: 0.5, ease: "sine.inOut" })
        .to(arms, { rotation: (i) => (i ? -40 : 30), duration: 0.5, ease: "sine.inOut" }, 0)
        .to(some(part.eyes), { scaleY: 0.1, duration: 0.2 }, 0.1)
        .to(part.mouths.o, { opacity: 1, scale: 1.2, duration: 0.3 }, 0.15)
        .to(part.mouths.smile, { opacity: 0, duration: 0.15 }, 0.15)
        .to(part.upper, { scaleY: 1, scaleX: 1, duration: 0.6, ease: "elastic.out(1, 0.45)" }, 0.9)
        .to(arms, { rotation: 0, duration: 0.6, ease: "back.out(1.6)" }, 0.9)
        .add(() => setMood(mood), 0.9),
    puff: () =>
      gsap
        .timeline()
        .to(part.plumes, { scaleY: 1.5, scaleX: 1.15, duration: 0.25, ease: "power2.out", stagger: 0.08 })
        .to(part.plumes, { scaleY: 1, scaleX: 1, duration: 0.9, ease: "elastic.out(1, 0.35)", stagger: 0.08 }),
    sway: () =>
      gsap
        .timeline()
        .to(part.upper, { rotation: -5, duration: 0.5, ease: "sine.inOut" })
        .to(part.upper, { rotation: 4, duration: 0.7, ease: "sine.inOut" })
        .to(part.upper, { rotation: 0, duration: 0.5, ease: "sine.inOut" }),
  };
  const fidget = (name) => (FIDGETS[name] ? FIDGETS[name]() : gsap.timeline());

  /* Poses loop while the mascot stays on a spot. */
  let aimAngle = 0;
  const pointRotation = () => {
    let r = aimAngle - PENCIL_REST;
    while (r > 180) r -= 360;
    while (r < -180) r += 360;
    return clamp(-85, 85, r);
  };
  const POSES = {
    idle: () =>
      gsap
        .timeline({ repeat: -1, yoyo: true, defaults: { ease: "sine.inOut" } })
        .to(part.armLeft, { rotation: 6, duration: 1.9 })
        .to(part.armRight, { rotation: -4, duration: 1.9 }, 0),
    wave: () =>
      gsap
        .timeline({ repeat: -1, repeatDelay: 1.8 })
        .to(part.armLeft, { rotation: 32, duration: 0.4, ease: "back.out(2)" })
        .to(part.armLeft, { rotation: 16, duration: 0.18, ease: "sine.inOut", yoyo: true, repeat: 5 })
        .to(part.armLeft, { rotation: 0, duration: 0.6, ease: "power3.inOut" }, "+=0.1"),
    draw: () =>
      gsap
        .timeline({ repeat: -1, repeatDelay: 1 })
        .to(part.armRight, { rotation: -26, duration: 0.5, ease: "power2.out" }, 0)
        .to(part.armLeft, { rotation: -6, duration: 0.5, ease: "power2.out" }, 0)
        .to(part.armLeft, { rotation: 10, duration: 0.1, ease: "sine.inOut", yoyo: true, repeat: 13 }, 0.5)
        .to(part.ink, { strokeDashoffset: 0, duration: 0.45, stagger: 0.42, ease: "power1.inOut" }, 0.55)
        .add(sparkle, 1.8)
        .to(part.armRight, { rotation: -40, duration: 0.35, ease: "back.out(2)" }, 1.9)
        .to(part.inkGroup, { opacity: 0, duration: 0.4 }, 3.2)
        .to([part.armLeft, part.armRight], { rotation: 0, duration: 0.6, ease: "power2.inOut" }, 3.2)
        .set(part.ink, { strokeDashoffset: 100 }, 3.7)
        .set(part.inkGroup, { opacity: 1 }, 3.7),
    point: () =>
      gsap
        .timeline({ repeat: -1, repeatDelay: 1.6, repeatRefresh: true })
        .to(part.armLeft, { rotation: pointRotation, duration: 0.45, ease: "back.out(1.8)" })
        .add(sparkle, 0.3)
        .to(part.armLeft, { rotation: () => pointRotation() - 8, duration: 0.22, ease: "sine.inOut", yoyo: true, repeat: 3 })
        .to(part.armLeft, { rotation: 0, duration: 0.7, ease: "power2.inOut" }, "+=0.8"),
    cozy: () =>
      gsap
        .timeline({ repeat: -1, yoyo: true, defaults: { ease: "sine.inOut" } })
        .to(part.upper, { rotation: 3, duration: 2.2 })
        .to(part.armRight, { rotation: -12, duration: 2.2 }, 0)
        .to(part.armLeft, { rotation: 8, duration: 2.2 }, 0),
    cheer: () =>
      gsap
        .timeline({ repeat: -1, repeatDelay: 1.6 })
        .to(part.upper, { scaleY: 0.9, scaleX: 1.06, duration: 0.14, ease: "power2.out" })
        .to(part.upper, { scaleY: 1.14, scaleX: 0.94, duration: 0.18, ease: "power3.out" })
        .to(part.armLeft, { rotation: 32, duration: 0.3, ease: "back.out(2)" }, 0.14)
        .to(part.armRight, { rotation: -130, duration: 0.3, ease: "back.out(2)" }, 0.14)
        .add(() => onCheer?.(), 0.3)
        .to(part.upper, { scaleY: 1, scaleX: 1, duration: 0.8, ease: "elastic.out(1.1, 0.35)" }, 0.32)
        .to(arms, { rotation: 0, duration: 0.6, ease: "power3.inOut" }, 1.3),
    // The pencil goes away and a card with a logo comes up in the same hand. When the card is
    // already up, it turns edge-on and comes back with the new logo.
    sign: () => {
      if (!part.sign) return POSES.wave();
      const up = gsap.getProperty(part.sign, "scaleY") > 0.5;
      const tl = gsap.timeline();
      if (up) {
        tl.to(part.sign, { scaleX: 0, rotation: 0, duration: 0.12, ease: "power2.in" }, 0)
          .add(() => applySign(), 0.12)
          .to(part.sign, { scaleX: 1, duration: 0.34, ease: "back.out(3)" }, 0.12)
          .to(part.armLeft, { rotation: 20, duration: 0.3, ease: "back.out(2)" }, 0);
      } else {
        tl.add(() => applySign(), 0)
          .to(part.pencil, { scale: 0, rotation: -70, duration: 0.2, ease: "power2.in" }, 0)
          .fromTo(part.sign, { scale: 0, rotation: -30 }, { scale: 1, rotation: 0, duration: 0.5, ease: "back.out(2.6)" }, 0.16)
          .to(part.armLeft, { rotation: 20, duration: 0.4, ease: "back.out(2)" }, 0.1);
      }
      return tl.add(sparkle, 0.4).add(
        gsap
          .timeline({ repeat: -1, yoyo: true, defaults: { ease: "sine.inOut" } })
          .to(part.sign, { rotation: 5, duration: 1.2 })
          .to(part.armLeft, { rotation: 25, duration: 1.2 }, 0),
        0.7,
      );
    },
  };

  let posing = null;
  let poseName = null;
  function setPose(name) {
    posing?.kill();
    posing = null;
    const leavingSign = poseName === "sign" && name !== "sign";
    poseName = name && POSES[name] ? name : null;
    gsap.to(limbs, { rotation: 0, duration: 0.45, ease: "power3.out", overwrite: "auto" });
    gsap.to(part.world, { rotation: 0, duration: 0.45, ease: "power3.out", overwrite: "auto" });
    gsap.to(part.upper, { rotation: 0, scale: 1, duration: 0.45, ease: "power3.out", overwrite: "auto" });
    gsap.set(part.ink, { strokeDashoffset: 100 });
    gsap.set(part.inkGroup, { opacity: 1 });
    if (leavingSign || name !== "sign") {
      gsap.to(part.sign, { scale: 0, rotation: -30, duration: 0.2, ease: "power2.in", overwrite: "auto" });
      gsap.to(part.pencil, { scale: 1, rotation: 0, duration: 0.35, delay: leavingSign ? 0.15 : 0, ease: "back.out(2)", overwrite: "auto" });
    }
    if (!poseName) return;
    posing = keep(POSES[poseName]());
    posing.delay(0.3);
  }
  // Stops the pose loop but keeps what the hands hold, for a jump between two sign spots.
  const holdPose = () => {
    posing?.kill();
    posing = null;
  };
  // The sign shows a logo. A one-colour logo is drawn in the sign's ink so it reads on the
  // plate in either theme; the rim takes the colour of the card the logo came from.
  let sign = null;
  const setSign = (href, { mono = false, tint = "" } = {}) => {
    if (href) sign = { href, mono, tint };
  };
  const applySign = () => {
    if (!part.signLogo || !sign) return;
    part.signLogo.setAttribute("href", sign.href);
    if (sign.mono && part.signMono) part.signLogo.setAttribute("filter", `url(#${part.signMono.id})`);
    else part.signLogo.removeAttribute("filter");
    if (sign.tint) svg.style.setProperty("--mascot-sign-rim", sign.tint);
    else svg.style.removeProperty("--mascot-sign-rim");
  };

  /* A jump from one spot to the next. The guide moves the box along a real arc (steady sideways
     speed, gravity on the way up and down); the body does the rest:
     crouch → spring off → tuck in the air → legs out → land. spin is 0 for a plain hop, or 1 / -1
     for a full turn one way or the other: a wind-up the other way first, a tighter tuck, and the
     turn spread over most of the flight so it reads as one motion. The steam goes out as it
     crouches and only comes back once it has landed (see land). */
  function jump({ direction = 1, duration = 0.8, spin = 0, small = false } = {}) {
    const crouch = small ? 0.12 : 0.2;
    const tl = gsap.timeline();
    const windUp = spin ? -12 * spin : -7 * direction;
    tl.to(part.framing, { scaleY: small ? 0.84 : 0.72, scaleX: small ? 1.1 : 1.2, duration: crouch, ease: "power2.inOut" }, 0)
      .to(part.armLeft, { rotation: -24, duration: crouch, ease: "power2.inOut" }, 0)
      .to(part.armRight, { rotation: 20, duration: crouch, ease: "power2.inOut" }, 0)
      .to(part.world, { rotation: windUp, duration: crouch, ease: "power2.inOut" }, 0)
      .to(part.plumes, { opacity: 0, scaleY: 0.2, scaleX: 0.7, duration: crouch * 0.9, ease: "power2.in" }, 0);
    // Spring off: a sharp stretch, arms thrown up.
    tl.to(part.framing, { scaleY: 1.3, scaleX: 0.8, duration: 0.11, ease: "power4.out" }, crouch)
      .to(part.armLeft, { rotation: 38, duration: 0.3, ease: "back.out(2.6)" }, crouch)
      .to(part.armRight, { rotation: -85, duration: 0.3, ease: "back.out(2.6)" }, crouch)
      .to(part.shadow, { opacity: 0, scale: 0.4, duration: 0.15 }, crouch)
      .add(dust(small ? 0.35 : 0.7, -direction), crouch);
    // In the air: the stretch eases off near the top, legs tuck, arms paddle (or hug in to spin).
    tl.to(part.framing, { scaleY: 0.96, scaleX: spin ? 0.98 : 1.04, duration: duration * 0.4, ease: "sine.inOut" }, crouch + 0.11)
      .to(part.legLeft, { rotation: spin ? 46 : 32, duration: duration * 0.3, ease: "power2.out" }, crouch + 0.05)
      .to(part.legRight, { rotation: spin ? -46 : -32, duration: duration * 0.3, ease: "power2.out" }, crouch + 0.05);
    if (spin) {
      tl.to(part.armLeft, { rotation: 70, duration: duration * 0.25, ease: "power2.out" }, crouch + 0.12)
        .to(part.armRight, { rotation: -70, duration: duration * 0.25, ease: "power2.out" }, crouch + 0.12)
        .to(part.world, { rotation: 360 * spin, duration: duration * 0.7, ease: "power1.inOut" }, crouch + 0.04);
    } else {
      tl.to(part.world, { rotation: 14 * direction, duration: 0.2, ease: "power2.out" }, crouch)
        .to(part.armLeft, { rotation: 58, duration: duration * 0.22, ease: "sine.inOut", yoyo: true, repeat: 1 }, crouch + 0.2)
        .to(part.world, { rotation: -9 * direction, duration: duration * 0.55, ease: "sine.inOut" }, crouch + 0.2);
    }
    // Falling: legs and arms reach out for the ground.
    const fall = crouch + duration * 0.74;
    tl.to(legs, { rotation: 0, duration: duration * 0.22, ease: "power2.in" }, fall)
      .to(part.framing, { scaleY: 1.12, scaleX: 0.92, duration: duration * 0.24, ease: "power2.in" }, fall);
    if (spin) tl.to(arms, { rotation: 0, duration: duration * 0.22, ease: "power2.out" }, fall);
    else tl.to(part.world, { rotation: 0, duration: duration * 0.24, ease: "power2.out" }, fall);
    return tl;
  }
  function land(strength = 1, direction = 1) {
    const s = clamp(0.35, 1.1, strength);
    return gsap
      .timeline()
      .set(part.world, { rotation: 0 })
      .to(part.framing, { scaleY: 1 - 0.27 * s, scaleX: 1 + 0.22 * s, duration: 0.07, ease: "power2.out" }, 0)
      .add(ring(), 0)
      .add(dust(s, direction), 0)
      .to(part.shadow, { opacity: 1, scale: 1, duration: 0.18 }, 0)
      .to(part.framing, { scaleY: 1, scaleX: 1, duration: 0.75, ease: "elastic.out(1.15, 0.35)" }, 0.07)
      .to(part.world, { rotation: 6 * direction * s, duration: 0.12, ease: "power2.out" }, 0.03)
      .to(part.world, { rotation: 0, duration: 0.85, ease: "elastic.out(1, 0.3)" }, 0.15)
      .to(arms, { rotation: 0, duration: 0.75, ease: "elastic.out(1, 0.4)" }, 0.04)
      .to(legs, { rotation: 0, duration: 0.3, ease: "power2.out" }, 0)
      // Steam comes back only now: it puffs up from the rim once the feet are down.
      .fromTo(
        part.plumes,
        { opacity: 0, scaleY: 0.2, scaleX: 0.7, skewX: 0 },
        { opacity: 1, scaleY: 1, scaleX: 1, duration: 0.95, ease: "elastic.out(1, 0.45)", stagger: 0.16, immediateRender: false },
        0.3,
      );
  }
  const showSteam = () => gsap.to(part.plumes, { opacity: 1, scaleY: 1, scaleX: 1, skewX: 0, duration: 0.4, overwrite: "auto" });

  return {
    setMood,
    setPose,
    holdPose,
    setSign,
    look,
    aim: (angle) => (aimAngle = angle),
    wobble,
    perk,
    pop,
    fidget,
    sparkle,
    jump,
    land,
    showSteam,
    get mood() {
      return mood;
    },
    get pose() {
      return poseName;
    },
  };
}

/* ---------- Mascot guide: the hero drawing follows the reader from panel to panel ---------- */
const BASE = 200;
const RATIO = 812 / 1048;
// On phones the mascot stands smaller, so it does not push the section's content down.
const PHONE_SCALE = 0.56;
// A section marks where the mascot stands with data-mascot-spot (fill, top-start, top-end,
// top-center, bottom-end, under-start, start, end) plus optional size, mood, pose and look target.
// Elements with data-mascot-hop call the mascot over while the pointer is on them.
function startGuide() {
  const home = document.querySelector(".hero-mascot[data-mascot-spot]");
  const svg = home?.querySelector("svg");
  if (!motion || !svg || !panels.length) return;
  const spots = [...document.querySelectorAll("[data-mascot-spot]")].filter((spot) => panelOf(spot));
  const spotFor = (panel) => spots.find((spot) => panelOf(spot) === panel) ?? panel;
  const describe = (el, overrides = {}) => ({
    el,
    placement: el.dataset?.mascotSpot || el.dataset?.mascotHop || "corner",
    size: Number(el.dataset?.mascotSize || 110),
    mood: el.dataset?.mascotMood || "happy",
    pose: el.dataset?.mascotPose || "idle",
    look: el.dataset?.mascotLook || "",
    logo: el.dataset?.mascotLogo || "",
    logoMono: el.dataset?.mascotLogoMono != null,
    tint: el.dataset?.mascotTint || "",
    ...overrides,
  });

  const guide = document.createElement("div");
  guide.className = "mascot-guide";
  guide.setAttribute("aria-hidden", "true");
  // Same colour source as the header mascot: [data-mascot] maps --wb-accent to the page accent.
  guide.setAttribute("data-mascot", "guide");
  const body = document.createElement("div");
  body.className = "mascot-guide__body";
  body.append(svg);
  guide.append(body);
  document.body.append(guide);
  home.classList.add("is-empty");
  root.classList.add("has-mascot-guide");
  const reserve = () => {
    for (const spot of spots) {
      if (spot === home) continue;
      const size = Number(spot.dataset.mascotSize || 110) * (compact.matches ? PHONE_SCALE : 1);
      spot.style.setProperty("--mascot-room", `${Math.round(size * RATIO)}px`);
    }
  };
  reserve();

  const confetti = (color) => {
    const accent = color || getComputedStyle(root).getPropertyValue("--accent").trim() || "#8b6cff";
    const box = body.getBoundingClientRect();
    const colors = [accent, "#c6f33a", "#fff7e9", accent];
    for (let i = 0; i < 18; i += 1) {
      const bit = document.createElement("span");
      bit.className = "mascot-confetti";
      bit.style.left = `${box.left + box.width * 0.5}px`;
      bit.style.top = `${box.top + box.height * 0.15}px`;
      bit.style.background = colors[i % colors.length];
      document.body.append(bit);
      const angle = (gsap.utils.random(-160, -20) * Math.PI) / 180;
      const speed = gsap.utils.random(110, 250);
      gsap
        .timeline({ onComplete: () => bit.remove() })
        .to(bit, { x: Math.cos(angle) * speed, duration: 1.25, ease: "power1.out" }, 0)
        .to(bit, { y: Math.sin(angle) * speed, duration: 0.45, ease: "power2.out" }, 0)
        .to(bit, { y: `+=${gsap.utils.random(200, 320)}`, duration: 0.8, ease: "power1.in" }, 0.45)
        .to(bit, { rotation: gsap.utils.random(-540, 540), duration: 1.25, ease: "none" }, 0)
        .to(bit, { opacity: 0, duration: 0.3 }, 0.95);
    }
  };
  const rig = mascotRig(svg, { onCheer: confetti });

  const FEET = 0.97;
  let spot = null;
  let flight = null;
  let lookAt = null;
  let glance = null;

  // Where a spot puts the guide: box position and scale. Panels at rest sit under the header,
  // so a spot in a panel still sliding in is measured where it will stop.
  function frame(target) {
    const anchor = target.el;
    const page = !stacked();
    guide.classList.toggle("is-page", page);
    const rect = anchor.getBoundingClientRect();
    const panel = panelOf(anchor) ?? (anchor.matches?.("main > .stack-panel") ? anchor : null);
    let top = rect.top;
    if (!page && panel) top = rect.top - panel.getBoundingClientRect().top + (parseFloat(getComputedStyle(panel).top) || 0);
    let placement = target.placement;
    if (page && (placement === "end" || placement === "start")) placement = "top-end";
    const size = placement === "fill" ? rect.width : target.size * (compact.matches ? PHONE_SCALE : 1);
    const height = size * RATIO;
    let x;
    let y;
    switch (placement) {
      case "fill":
        x = rect.left;
        y = top;
        break;
      case "top-start":
        x = rect.left + size * 0.15;
        y = top - height * FEET;
        break;
      case "top-center":
        x = rect.left + (rect.width - size) / 2;
        y = top - height * FEET;
        break;
      case "top-end":
        x = rect.right - size * 1.15;
        y = top - height * FEET;
        break;
      case "bottom-end":
        x = rect.right - size * 1.1;
        y = top + rect.height - height * FEET;
        break;
      case "under-start":
        x = rect.left - size * 0.04;
        y = top + rect.height - height * FEET - 4;
        break;
      case "start":
        x = rect.left - size - 18;
        y = top + rect.height - height * FEET;
        break;
      case "end":
        x = rect.right + 18;
        y = top + rect.height - height * FEET;
        break;
      default:
        x = rect.right - size - 24;
        y = top + rect.height - height - 24;
    }
    x = clamp(8, window.innerWidth - size - 8, x);
    return { x, y: y + (page ? window.scrollY : 0), scale: size / BASE };
  }

  function arrive() {
    if (spot.logo) rig.setSign(spot.logo, { mono: spot.logoMono, tint: spot.tint });
    rig.setMood(spot.mood);
    rig.setPose(spot.pose);
    lookAt = spot.look ? panelOf(spot.el)?.querySelector(spot.look) ?? document.querySelector(spot.look) : null;
  }

  let jumps = 0;
  let spinSide = -1;
  function goTo(next, { instant = false } = {}) {
    spot = next;
    const target = frame(next);
    flight?.kill();
    if (instant) {
      gsap.set(guide, target);
      rig.showSteam();
      arrive();
      return;
    }
    const from = { x: gsap.getProperty(guide, "x"), y: gsap.getProperty(guide, "y"), scale: gsap.getProperty(guide, "scale") };
    const dx = target.x - from.x;
    const dy = target.y - from.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 4 && Math.abs(target.scale - from.scale) < 0.02) {
      arrive();
      return;
    }
    const direction = dx < 0 ? -1 : 1;
    const small = distance < 150;
    // Jumps take turns: a plain hop, a spin one way, a plain hop, a spin the other way.
    // Short hops stay plain; a spin needs air time to read.
    let spin = 0;
    if (!small) {
      jumps += 1;
      if (jumps % 2 === 0) {
        spinSide = -spinSide;
        spin = spinSide;
      }
    }
    const duration = small ? 0.42 : clamp(spin ? 0.76 : 0.62, 1.06, 0.45 + distance / 1500);
    const lift = small ? clamp(36, 80, distance * 0.5) : clamp(120, 320, (distance * 0.34 + 70) * (spin ? 1.15 : 1));
    // The top of the arc stays on screen, steam included: a jump that starts near the top of
    // the view becomes a short hop and a longer fall instead of flying out of sight.
    const viewTop = (stacked() ? 0 : window.scrollY) + (document.querySelector(".site-head")?.offsetHeight ?? 48) + 8;
    const steamRoom = Math.max(from.scale, target.scale) * BASE * RATIO * 0.42;
    const higher = Math.min(from.y, target.y);
    const apexY = Math.min(higher - 16, Math.max(viewTop + steamRoom, higher - lift));
    // Control point for a quadratic arc whose top sits at apexY.
    const controlY = 2 * apexY - (from.y + target.y) / 2;
    const crouch = small ? 0.12 : 0.2;
    // The height of the fall decides how hard it lands.
    const strength = clamp(0.35, 1.1, Math.sqrt(Math.max(0, target.y - apexY) / 260));
    const travel = { t: 0 };
    if (rig.pose === "sign" && next.pose === "sign") rig.holdPose();
    else rig.setPose(null);
    rig.setMood(small ? "happy" : "surprised");
    glanceAt(next.el, crouch + duration + 0.3);
    flight = gsap
      .timeline({ onComplete: arrive })
      .add(rig.jump({ direction, duration, spin, small }), 0)
      .add(() => emit("jump"), crouch)
      .to(
        travel,
        {
          t: 1,
          duration,
          ease: "none",
          onUpdate: () => {
            const t = travel.t;
            const r = 1 - t;
            gsap.set(guide, {
              x: from.x + dx * t,
              y: r * r * from.y + 2 * r * t * controlY + t * t * target.y,
              scale: from.scale + (target.scale - from.scale) * t,
            });
          },
        },
        crouch,
      )
      .add(() => {
        rig.land(strength, direction);
        emit("land", { strength });
      }, crouch + duration);
  }

  // The eyes follow a glance target, the spot's look target, or the pointer.
  let pointer = null;
  window.addEventListener("pointermove", (event) => (pointer = { x: event.clientX, y: event.clientY }), { passive: true });
  const pointOf = (el) => {
    if (!el?.getBoundingClientRect) return el;
    const rect = el.getBoundingClientRect();
    if (el.hasAttribute("data-spot")) {
      const style = getComputedStyle(el);
      const sx = parseFloat(style.getPropertyValue("--sx")) || 50;
      const sy = parseFloat(style.getPropertyValue("--sy")) || 50;
      return { x: rect.left + (rect.width * sx) / 100, y: rect.top + (rect.height * sy) / 100 };
    }
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  };
  let frameCount = 0;
  gsap.ticker.add(() => {
    frameCount += 1;
    if (frameCount % 3) return;
    const box = body.getBoundingClientRect();
    const eye = { x: box.left + box.width * 0.49, y: box.top + box.height * 0.37 };
    const target = glance?.el ? pointOf(glance.el) : lookAt ? pointOf(lookAt) : pointer;
    if (!target) return;
    const dx = target.x - eye.x;
    const dy = target.y - eye.y;
    const distance = Math.hypot(dx, dy) || 1;
    const reach = Math.min(1, distance / 220);
    rig.look((dx / distance) * reach, (dy / distance) * reach);
    rig.aim((Math.atan2(dy, dx) * 180) / Math.PI);
  });
  function glanceAt(el, seconds = 1.4) {
    glance?.timer?.kill();
    glance = { el, timer: gsap.delayedCall(seconds, () => (glance = null)) };
  }
  const react = (mood, { perk = 0, seconds = 1.2 } = {}) => {
    if (flight?.isActive()) return;
    rig.setMood(mood);
    if (perk) rig.perk(perk);
    gsap.delayedCall(seconds, () => {
      if (!flight?.isActive()) rig.setMood(spot?.mood || "happy");
    });
  };

  // A resting mascot does something small now and then: looks around, stretches, taps a foot.
  const FIDGETS_BY_MOOD = {
    sleepy: ["stretch", "sway", "puff"],
    focused: ["puff", "glance"],
    default: ["glance", "puff", "sway", "stretch"],
  };
  const fidgetLoop = () => {
    gsap.delayedCall(gsap.utils.random(4.5, 9), () => {
      const resting = !flight?.isActive() && !document.hidden && !stilled() && spot && rig.pose !== "sign";
      if (resting) {
        const list = FIDGETS_BY_MOOD[rig.mood] ?? FIDGETS_BY_MOOD.default;
        const name = gsap.utils.random(list);
        if (name === "glance") {
          const box = body.getBoundingClientRect();
          const side = Math.random() < 0.5 ? -1 : 1;
          glanceAt({ x: box.left + box.width / 2 + side * 400, y: box.top + gsap.utils.random(-80, 160) }, 1.1);
        } else {
          rig.fidget(name);
        }
      }
      fidgetLoop();
    });
  };
  fidgetLoop();

  on("panel", ({ panel }) => {
    const next = spotFor(panel);
    if (next !== spot?.el) goTo(describe(next));
  });
  on("deck", ({ stage, user }) => {
    if (!isActive(home)) return;
    glanceAt(stage, 1.2);
    if (!user) return;
    rig.sparkle();
    react("surprised", { perk: 0.6, seconds: 0.9 });
  });
  on("step", ({ spot: light }) => {
    if (!isActive(light)) return;
    glanceAt(light, 1.4);
    react("surprised", { seconds: 0.8 });
  });
  on("look", ({ el }) => glanceAt(el));
  on("cheer", () => {
    react("laugh", { perk: 1, seconds: 1.4 });
    confetti();
  });
  body.addEventListener("pointerenter", () => {
    if (!flight?.isActive()) rig.wobble();
  });
  // A click asks the page for the next accent colour when brand.accentCycle is on; the mascot
  // answers the change like the app logo does. Without the cycle it just laughs.
  const cycles = root.hasAttribute("data-accent-cycle");
  body.addEventListener("click", () => {
    if (cycles) document.dispatchEvent(new CustomEvent("accent:next"));
    else {
      react("laugh", { perk: 1, seconds: 1.6 });
      rig.sparkle();
      confetti();
    }
  });
  document.addEventListener("accent:change", (event) => {
    if (flight?.isActive()) return;
    rig.pop();
    rig.sparkle();
    react("laugh", { seconds: 1.4 });
    confetti(event.detail?.hex);
  });

  // Hovering a hop target calls the mascot onto it; leaving the group sends it back.
  for (const group of new Set([...document.querySelectorAll("[data-mascot-hop]")].map((el) => el.parentElement))) {
    let back = null;
    for (const el of group.querySelectorAll(":scope > [data-mascot-hop]")) {
      el.addEventListener("pointerenter", () => {
        back?.kill();
        if (!isActive(el) || spot?.el === el) return;
        goTo(describe(el));
      });
    }
    group.addEventListener("pointerleave", () => {
      back?.kill();
      back = gsap.delayedCall(0.7, () => {
        if (spot?.el && group.contains(spot.el) && spot.el !== group && isActive(group)) goTo(describe(spotFor(panelOf(group))));
      });
    });
  }

  let resizing = null;
  const replace = () => {
    resizing?.kill();
    resizing = gsap.delayedCall(0.15, () => {
      reserve();
      if (spot && !flight?.isActive()) goTo(spot, { instant: true });
    });
  };
  window.addEventListener("resize", replace);
  compact.addEventListener?.("change", replace);
  // Late images and fonts move blocks around; keep the mascot on its spot.
  const main = document.querySelector("main");
  if (main && typeof ResizeObserver === "function") new ResizeObserver(replace).observe(main);

  // Start on the panel in view; say hello from the lockup.
  const first = describe(spotFor(panels[Math.max(0, currentPanel())]));
  goTo(first, { instant: true });
  if (first.el === home) {
    gsap.delayedCall(1.1, () => {
      rig.setMood("wink");
      rig.setPose("wave");
      gsap.delayedCall(2.6, () => {
        if (spot?.el === home && !flight?.isActive()) {
          rig.setMood("happy");
          rig.setPose("idle");
        }
      });
    });
  }
}

/* ---------- Hero card track ---------- */
// The front card sits in the middle; neighbours shrink and dim to both sides and run past
// the column. Centres are spaced by half of each card plus a fixed gap, and positions and
// sizes blend linearly between steps, so the gap holds at every frame and cards never overlap.
const TRACK_SCALES = [1, 0.74, 0.56, 0.42, 0.32];

for (const deck of document.querySelectorAll("[data-deck]")) {
  const stage = deck.querySelector("[data-deck-stack]");
  const cards = [...deck.querySelectorAll("[data-deck-card]")];
  const images = cards.map((card) => card.querySelector("img"));
  const fileLine = deck.querySelector("[data-deck-file]");
  const count = cards.length;
  if (count < 2 || !stage) continue;
  deck.classList.add("is-live");

  const state = { pos: 0, spread: 1 };
  let target = 0;
  let typing = 0;
  const wrap = (d) => {
    let x = ((d % count) + count) % count;
    if (x > count / 2) x -= count;
    return x;
  };
  const gap = () => (compact.matches ? 16 : 30);
  let offsets = [];
  const measure = () => {
    const width = stage.clientWidth;
    offsets = [0];
    for (let k = 1; k < TRACK_SCALES.length; k += 1) {
      offsets.push(offsets[k - 1] + (width * (TRACK_SCALES[k - 1] + TRACK_SCALES[k])) / 2 + gap());
    }
  };
  const along = (list, t) => {
    const k = Math.min(Math.floor(t), list.length - 2);
    return list[k] + (list[k + 1] - list[k]) * (t - k);
  };
  const render = () => {
    cards.forEach((card, index) => {
      const d = wrap(index - state.pos) * state.spread;
      const a = Math.min(Math.abs(d), TRACK_SCALES.length - 1);
      const x = Math.sign(d) * along(offsets, a);
      const scale = along(TRACK_SCALES, a);
      card.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0) rotateY(${(-clamp(-1, 1, d) * 8).toFixed(2)}deg) scale(${scale.toFixed(4)})`;
      card.style.zIndex = String(100 - Math.round(Math.abs(wrap(index - state.pos)) * 10));
      card.style.setProperty("--dim", (Math.min(a, 2) * 0.3).toFixed(3));
      // Past the neighbours a card fades while it keeps moving out, so wide screens show three cards.
      const opacity = a <= 1 ? 1 : clamp(0, 1, 1 - (a - 1) / 0.75);
      card.style.opacity = opacity.toFixed(3);
      card.style.visibility = opacity > 0.01 ? "visible" : "hidden";
      if (images[index]) images[index].style.transform = `translate3d(${(-d * 6).toFixed(2)}%, 0, 0) scale(1.14)`;
      card.setAttribute("aria-hidden", a < 0.5 ? "false" : "true");
    });
  };
  const front = () => ((Math.round(target) % count) + count) % count;

  // Without file names the line under the track shows one dot per card instead.
  const dots =
    fileLine && cards.every((card) => !card.dataset.file)
      ? cards.map((card, index) => {
          const dot = document.createElement("button");
          dot.type = "button";
          dot.className = "deck__dot";
          dot.setAttribute("aria-label", `Show ${card.dataset.caption || index + 1}`);
          dot.addEventListener("click", () => move(wrap(index - front())));
          fileLine.append(dot);
          return dot;
        })
      : [];
  if (dots.length) {
    fileLine.classList.add("deck__file--dots");
    fileLine.removeAttribute("aria-live");
  }

  const writeFile = (animate) => {
    window.clearInterval(typing);
    if (dots.length) {
      dots.forEach((dot, index) => dot.classList.toggle("is-on", index === front()));
      return;
    }
    if (!fileLine) return;
    const text = cards[front()].dataset.file || "";
    if (!animate || !text) {
      fileLine.textContent = text;
      return;
    }
    const shared = [...text].findIndex((char, i) => fileLine.textContent[i] !== char);
    let shown = fileLine.textContent.slice(0, Math.max(0, shared));
    typing = window.setInterval(() => {
      shown = text.slice(0, shown.length + 3);
      fileLine.textContent = shown;
      if (shown.length >= text.length) window.clearInterval(typing);
    }, 16);
  };

  const settleTo = (next, { duration = 0.95, ease = "power3.inOut", user = true } = {}) => {
    const changed = Math.round(next) !== Math.round(target);
    target = Math.round(next);
    if (changed) {
      writeFile(motion);
      emit("deck", { stage, index: front(), user });
    }
    if (!motion) {
      state.pos = target;
      render();
      return;
    }
    gsap.to(state, { pos: target, duration, ease, overwrite: true, onUpdate: render });
  };
  const move = (steps, user = true) => settleTo(target + steps, { user });

  measure();
  render();
  writeFile(false);
  deck.querySelector("[data-deck-next]")?.addEventListener("click", () => move(1));
  deck.querySelector("[data-deck-prev]")?.addEventListener("click", () => move(-1));
  stage.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") move(1);
    if (event.key === "ArrowLeft") move(-1);
  });
  window.addEventListener("resize", () => {
    measure();
    render();
  });

  // Drag with a fling, or tap a side card to bring it forward.
  let drag = null;
  stage.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    gsap.killTweensOf(state);
    drag = { x: event.clientX, pos: state.pos, lastX: event.clientX, lastT: performance.now(), velocity: 0, moved: false };
    stage.setPointerCapture(event.pointerId);
  });
  stage.addEventListener("pointermove", (event) => {
    if (!drag) return;
    const now = performance.now();
    const dx = event.clientX - drag.x;
    if (Math.abs(dx) > 5) drag.moved = true;
    drag.velocity = (event.clientX - drag.lastX) / Math.max(1, now - drag.lastT);
    drag.lastX = event.clientX;
    drag.lastT = now;
    state.pos = drag.pos - dx / offsets[1];
    render();
  });
  const release = (event) => {
    if (!drag) return;
    const { moved, velocity } = drag;
    drag = null;
    if (!moved) {
      const card = document.elementsFromPoint(event.clientX, event.clientY).find((el) => cards.includes(el));
      const d = card ? wrap(cards.indexOf(card) - state.pos) : 0;
      settleTo(state.pos + d);
      return;
    }
    settleTo(state.pos - (velocity * 260) / offsets[1], { duration: 0.7, ease: "power3.out" });
  };
  stage.addEventListener("pointerup", release);
  stage.addEventListener("pointercancel", release);

  // A sideways trackpad swipe turns the track; vertical wheel stays with the page.
  let wheelHeld = false;
  stage.addEventListener(
    "wheel",
    (event) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY) || Math.abs(event.deltaX) < 12) return;
      event.preventDefault();
      if (wheelHeld) return;
      wheelHeld = true;
      move(Math.sign(event.deltaX));
      window.setTimeout(() => (wheelHeld = false), 550);
    },
    { passive: false },
  );

  if (motion) {
    // The cards deal out from one pile the first time the hero shows.
    gsap.from(stage, { y: 60, opacity: 0, duration: 1.1, ease: "expo.out", delay: 0.2 });
    gsap.fromTo(state, { spread: 0 }, { spread: 1, duration: 1.5, ease: "expo.out", delay: 0.45, onUpdate: render });

    // Turn on its own while the hero is on screen and untouched.
    let paused = false;
    deck.addEventListener("pointerenter", () => (paused = true));
    deck.addEventListener("pointerleave", () => (paused = false));
    deck.addEventListener("focusin", () => (paused = true));
    deck.addEventListener("focusout", () => (paused = false));
    const tick = () => {
      if (!paused && !stilled() && !drag && !document.hidden && (activePanel < 0 || isActive(deck))) move(1, false);
      gsap.delayedCall(4.2, tick);
    };
    gsap.delayedCall(5, tick);
  }
}

/* ---------- Style marquee: endless rows that react to scroll speed ---------- */
for (const marquee of document.querySelectorAll("[data-marquee]")) {
  const rows = [...marquee.querySelectorAll(".marquee__row")];
  if (!motion) {
    marquee.classList.add("is-static");
    continue;
  }
  const originals = rows.map((row) => [...row.children]);
  let loops = [];

  // Each row repeats its set until one set can slide out while the rest still fills the screen.
  const build = () => {
    loops.forEach((loop) => loop.kill());
    loops = rows.map((row, index) => {
      row.replaceChildren(...originals[index]);
      gsap.set(row, { xPercent: 0 });
      const gapPx = parseFloat(getComputedStyle(row).columnGap) || 0;
      const period = row.offsetWidth + gapPx;
      const copies = Math.max(2, Math.ceil(window.innerWidth / period) + 1);
      for (let c = 1; c < copies; c += 1) {
        originals[index].forEach((item) => {
          const copy = item.cloneNode(true);
          copy.setAttribute("aria-hidden", "true");
          row.appendChild(copy);
        });
      }
      const shift = (period / row.offsetWidth) * 100;
      const direction = Number(row.dataset.direction) || -1;
      const duration = Number(row.dataset.duration) || 46;
      return keep(
        gsap.fromTo(
          row,
          { xPercent: direction < 0 ? 0 : -shift },
          { xPercent: direction < 0 ? -shift : 0, duration, ease: "none", repeat: -1 },
        ),
      );
    });
  };
  build();
  let rebuild = null;
  window.addEventListener("resize", () => {
    rebuild?.kill();
    rebuild = gsap.delayedCall(0.2, build);
  });

  // Hovering a row slows it to a crawl; the card under the pointer lifts, and the mascot looks.
  rows.forEach((row, index) => {
    row.addEventListener("pointerenter", () => gsap.to(loops[index], { timeScale: 0.12, duration: 0.6, overwrite: true }));
    row.addEventListener("pointerleave", () => gsap.to(loops[index], { timeScale: 1, duration: 0.9, overwrite: true }));
  });
  marquee.addEventListener("pointerover", (event) => {
    const card = event.target.closest?.(".marquee__card");
    if (!card || card.contains(event.relatedTarget)) return;
    gsap.to(card, { y: -10, scale: 1.08, rotation: gsap.utils.random(-3, 3), duration: 0.4, ease: "back.out(2)", overwrite: "auto" });
    emit("look", { el: card });
  });
  marquee.addEventListener("pointerout", (event) => {
    const card = event.target.closest?.(".marquee__card");
    if (!card || card.contains(event.relatedTarget)) return;
    gsap.to(card, { y: 0, scale: 1, rotation: 0, duration: 0.5, ease: "power3", overwrite: "auto" });
  });

  const skew = gsap.quickTo(rows, "skewX", { duration: 0.6, ease: "power3" });
  let settle = null;
  ScrollTrigger.create({
    trigger: marquee,
    start: "top bottom",
    end: "bottom top",
    onUpdate: (self) => {
      const velocity = self.getVelocity();
      const boost = 1 + Math.min(Math.abs(velocity) / 350, 6);
      loops.forEach((loop) => gsap.to(loop, { timeScale: boost, duration: 0.2, overwrite: true }));
      skew(gsap.utils.clamp(-8, 8, velocity / -220));
      settle?.kill();
      settle = gsap.delayedCall(0.25, () => {
        loops.forEach((loop) => gsap.to(loop, { timeScale: 1, duration: 1.2, overwrite: true }));
        skew(0);
      });
    },
  });

  // Rows slide in from alternating sides each time the panel comes up.
  on("panel", ({ panel }) => {
    if (!panel?.contains(marquee)) return;
    gsap.fromTo(
      rows,
      { x: (index) => (index % 2 ? -220 : 220), opacity: 0 },
      { x: 0, opacity: 1, duration: 1.3, ease: "expo.out", stagger: 0.08, overwrite: "auto" },
    );
  });
}

/* ---------- Provider cards: a light and a tilt that follow the pointer ---------- */
for (const group of document.querySelectorAll(".about-capabilities--logo-cards")) {
  const cards = [...group.querySelectorAll("[data-card]")];
  if (!motion) continue;
  on("panel", ({ panel }) => {
    if (!panel?.contains(group)) return;
    gsap.fromTo(cards, { y: 44, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: "expo.out", stagger: 0.08, overwrite: "auto" });
    gsap.fromTo(
      group.querySelectorAll(".about-capability__logo"),
      { scale: 0.6, rotation: -12 },
      { scale: 1, rotation: 0, duration: 0.9, ease: "back.out(2.2)", stagger: 0.08, delay: 0.1, overwrite: "auto" },
    );
  });
  if (!finePointer) continue;
  for (const card of cards) {
    gsap.set(card, { transformPerspective: 900 });
    const tiltX = gsap.quickTo(card, "rotationX", { duration: 0.5, ease: "power3" });
    const tiltY = gsap.quickTo(card, "rotationY", { duration: 0.5, ease: "power3" });
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      card.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
      card.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
      tiltY((px - 0.5) * 10);
      tiltX((0.5 - py) * 8);
    });
    card.addEventListener("pointerenter", () => emit("look", { el: card }));
    card.addEventListener("pointerleave", () => {
      tiltX(0);
      tiltY(0);
    });
  }
}

/* ---------- Card shaders: each provider card runs its own shader behind its content ---------- */
// The kit's shade runtime (hero-shade.js) is loaded by runtime-loader.js when a card asks for it.
// Hovering a card stirs its shader; leaving lets it settle.
{
  const hosts = [...document.querySelectorAll("[data-card-shade]")];
  const shadeApi = window.__gvasteHeroShade;
  if (hosts.length && shadeApi && !window.matchMedia("(forced-colors: active)").matches) {
    Promise.resolve(shadeApi).then(async (mod) => {
      if (!mod?.mountHeroShade) return;
      for (const host of hosts) {
        host.setAttribute("data-shade-speed", "0.7");
        try {
          await mod.mountHeroShade(host, { variant: host.dataset.cardShade, reduced, theme: root.dataset.theme || "dark" });
        } catch (error) {
          console.error("[stage-motion] card shade", error);
        }
        const card = host.closest("[data-card]") ?? host.parentElement;
        card?.addEventListener("pointerenter", () => {
          host.setAttribute("data-shade-speed", "2.2");
          host.setAttribute("data-shade-warp", "0.85");
        });
        card?.addEventListener("pointerleave", () => {
          host.setAttribute("data-shade-speed", "0.7");
          host.setAttribute("data-shade-warp", "0");
        });
      }
    });
  }
}

/* ---------- Walkthrough: a spotlight walks the screen, step by step ---------- */
// The page already stacks its panels while scrolling, so the walkthrough does not pin.
// Steps advance on their own while their panel is up; a click, tap or arrow key picks one.
for (const walk of document.querySelectorAll("[data-walkthrough]")) {
  const steps = [...walk.querySelectorAll("[data-step]")];
  const spot = walk.querySelector("[data-spot]");
  if (!steps.length || !spot) continue;
  let current = 0;
  const spotFor = (step) => ({
    "--sx": `${step.dataset.x}%`,
    "--sy": `${step.dataset.y}%`,
    "--sr": `${step.dataset.radius}%`,
  });
  // The next step waits WAIT seconds; the active step's bar fills over the same time.
  const WAIT = 3.2;
  walk.style.setProperty("--step-wait", `${WAIT}s`);
  let paused = false;
  let timer = null;
  const schedule = () => {
    timer?.kill();
    timer = gsap.delayedCall(WAIT, () => {
      if (isActive(walk) && !document.hidden && !stilled()) show(current + 1);
      else schedule();
    });
    if (paused) timer.pause();
  };
  const shots = [...walk.querySelectorAll("[data-shot]")];
  const show = (index, animate = motion) => {
    current = (index + steps.length) % steps.length;
    steps.forEach((step, i) => {
      step.classList.toggle("is-active", i === current);
      step.setAttribute("aria-current", i === current ? "step" : "false");
    });
    shots.forEach((shot) => shot.classList.toggle("is-shown", Number(shot.dataset.shot) === current));
    if (animate) {
      gsap.to(spot, { ...spotFor(steps[current]), duration: 0.9, ease: "expo.inOut" });
      emit("step", { spot, index: current });
      schedule();
    } else Object.entries(spotFor(steps[current])).forEach(([key, value]) => spot.style.setProperty(key, value));
  };
  steps.forEach((step, index) => {
    step.tabIndex = 0;
    step.setAttribute("role", "button");
    step.addEventListener("click", () => show(index));
    step.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        show(index);
      }
      if (event.key === "ArrowDown" || event.key === "ArrowRight") steps[(index + 1) % steps.length].focus();
      if (event.key === "ArrowUp" || event.key === "ArrowLeft") steps[(index - 1 + steps.length) % steps.length].focus();
    });
  });
  show(0, false);
  if (!motion) continue;
  const screen = walk.querySelector(".walkthrough__screen");
  const hold = (value) => {
    paused = value;
    walk.classList.toggle("is-held", value);
    if (value) timer?.pause();
    else timer?.resume();
  };
  walk.addEventListener("pointerenter", () => hold(true));
  walk.addEventListener("pointerleave", () => hold(false));
  walk.addEventListener("focusin", () => hold(true));
  walk.addEventListener("focusout", () => hold(false));
  on("panel", ({ panel }) => {
    if (!panel?.contains(walk)) return;
    gsap.fromTo(screen, { scale: 0.94, rotationX: 8, transformPerspective: 1200, opacity: 0.5 }, { scale: 1, rotationX: 0, opacity: 1, duration: 1.1, ease: "expo.out" });
    show(0);
  });
  schedule();
}

/* ---------- Closing wall: pictures drift slowly behind the last words ---------- */
for (const plane of document.querySelectorAll("[data-closing-wall]")) {
  if (!motion) continue;
  keep(gsap.to(plane, { yPercent: -12, duration: 34, ease: "sine.inOut", yoyo: true, repeat: -1 }));
  on("panel", ({ panel }) => {
    if (!panel?.contains(plane)) return;
    gsap.fromTo(
      plane.children,
      { opacity: 0, scale: 0.86 },
      { opacity: 0.55, scale: 1, duration: 1.2, ease: "expo.out", stagger: { each: 0.025, from: "center", grid: "auto" }, overwrite: "auto" },
    );
  });
}

/* ---------- Agent handoff: the agent works through its list while its panel is up ---------- */
// The prompt types itself, each step spins then ticks, the reader's own step waits a little
// longer, and the picture lands with a cheer. Leaving the panel stops the run; coming back
// plays it again.
for (const run of document.querySelectorAll("[data-handoff]")) {
  const steps = [...run.querySelectorAll("[data-handoff-step]")];
  const typed = run.querySelector("[data-handoff-type]");
  if (!steps.length || !motion) continue;
  const text = typed?.textContent ?? "";
  run.classList.add("is-live");
  let tl = null;
  const play = () => {
    tl?.kill();
    steps.forEach((step) => step.classList.remove("is-running", "is-done"));
    if (typed) typed.textContent = "";
    tl = gsap.timeline({ delay: 0.4 });
    if (typed) {
      const shown = { n: 0 };
      tl.to(shown, {
        n: text.length,
        duration: Math.min(1.6, text.length * 0.014),
        ease: "none",
        onUpdate: () => (typed.textContent = text.slice(0, Math.round(shown.n))),
      });
    }
    steps.forEach((step, index) => {
      if (step.classList.contains("handoff__result")) {
        tl.add(() => {
          step.classList.add("is-done");
          emit("cheer");
        }, "+=0.3");
        return;
      }
      const yours = step.classList.contains("handoff__step--you");
      tl.add(() => {
        step.classList.add("is-running");
        if (yours) emit("look", { el: step });
      }, "+=0.14");
      tl.add(() => {
        step.classList.remove("is-running");
        step.classList.add("is-done");
      }, `+=${yours ? 1.6 : 0.5 + (index % 3) * 0.18}`);
    });
  };
  on("panel", ({ panel }) => {
    if (panel?.contains(run)) play();
    else tl?.pause();
  });
}

/* ---------- Setup terminal: the commands type themselves ---------- */
// Each command types in behind a block caret; a command with output fills a thin bar, then its
// output rises in; the terminal ends on an idle prompt and the "open ... and sign in" dot pulses.
// Leaving the panel stops the run; coming back plays it again.
for (const term of document.querySelectorAll("[data-terminal]")) {
  const rows = [...term.querySelectorAll("[data-term-row]")];
  const idle = term.querySelector("[data-term-idle]");
  const box = term.closest(".setup__script");
  if (!rows.length || !motion) continue;
  const cmds = rows.map((row) => row.querySelector("[data-term-cmd]"));
  const full = cmds.map((cmd) => cmd.textContent);
  // A tooltip goes beside its command when both fit on the line, above it otherwise.
  for (const line of term.querySelectorAll(".setup__line[tabindex]")) {
    const place = () => {
      const tip = line.querySelector(".setup__tip");
      const cmd = line.querySelector(".setup__cmd");
      if (!tip || !cmd) return;
      line.classList.toggle("tip-side", cmd.scrollWidth + tip.offsetWidth + 56 < line.clientWidth);
    };
    line.addEventListener("pointerenter", place);
    line.addEventListener("focus", place);
  }
  term.classList.add("is-live");
  let tl = null;
  const play = () => {
    tl?.kill();
    rows.forEach((row) => row.classList.remove("is-on", "is-typing", "is-working", "is-done"));
    idle?.classList.remove("is-on");
    box?.classList.remove("is-ready");
    cmds.forEach((cmd) => (cmd.textContent = ""));
    tl = gsap.timeline({ delay: 0.45 });
    rows.forEach((row, index) => {
      const text = full[index];
      const typed = { n: 0 };
      const hasOut = Boolean(row.querySelector("[data-term-out]"));
      const work = gsap.utils.clamp(0.45, 1.1, text.length * 0.03);
      tl.add(() => row.classList.add("is-on", "is-typing"), index ? "+=0.16" : 0)
        .to(typed, {
          n: text.length,
          duration: 0.14 + text.length * 0.026,
          ease: "power1.in",
          onUpdate: () => (cmds[index].textContent = text.slice(0, Math.round(typed.n))),
        })
        .add(() => {
          row.classList.remove("is-typing");
          if (hasOut) {
            row.style.setProperty("--setup-work", `${work}s`);
            row.classList.add("is-working");
          } else row.classList.add("is-done");
        }, "+=0.12");
      if (hasOut)
        tl.add(() => {
          row.classList.remove("is-working");
          row.classList.add("is-done");
        }, `+=${work}`);
    });
    tl.add(() => {
      idle?.classList.add("is-on");
      box?.classList.add("is-ready");
      emit("cheer");
    }, "+=0.3");
  };
  on("panel", ({ panel }) => {
    if (panel?.contains(term)) play();
    else tl?.pause();
  });
}

/* ---------- FAQ: questions come in; the mascot looks at the one that opens ---------- */
for (const list of document.querySelectorAll("[data-faq]")) {
  const items = [...list.querySelectorAll("[data-faq-item]")];
  if (!items.length || !motion) continue;
  on("panel", ({ panel }) => {
    if (!panel?.contains(list)) return;
    gsap.fromTo(items, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "expo.out", stagger: 0.06, overwrite: "auto" });
  });
  items.forEach((item) =>
    item.addEventListener("toggle", () => {
      if (item.open) emit("look", { el: item });
    }),
  );
}

/* ---------- Closing: pictures step out of the wall ---------- */
// Slots keep the floating cards off the words and away from the mascot above them.
const POP_SLOTS = [
  [4, 8],
  [9, 40],
  [3, 60],
  [85, 48],
  [77, 64],
];
for (const plane of document.querySelectorAll("[data-closing-wall]")) {
  const section = plane.closest(".closing");
  const pictures = [...plane.querySelectorAll("img")].map((img) => img.getAttribute("src"));
  if (!section || pictures.length < 2 || !motion) continue;
  const layer = document.createElement("div");
  layer.className = "closing__pops";
  layer.setAttribute("aria-hidden", "true");
  section.prepend(layer);
  const busy = new Set();
  let timer = null;
  let live = false;
  const pop = () => {
    const free = POP_SLOTS.map((_, i) => i).filter((i) => !busy.has(i));
    if (!free.length || document.hidden) return;
    const slot = gsap.utils.random(free);
    busy.add(slot);
    const [x, y] = POP_SLOTS[slot];
    const card = document.createElement("figure");
    card.className = "closing__pop";
    card.style.left = `${x + gsap.utils.random(-2, 2)}%`;
    card.style.top = `${y + gsap.utils.random(-3, 3)}%`;
    const img = document.createElement("img");
    img.src = gsap.utils.random(pictures);
    img.alt = "";
    card.append(img);
    layer.append(card);
    const tilt = gsap.utils.random(-9, 9);
    gsap
      .timeline({
        onComplete: () => {
          card.remove();
          busy.delete(slot);
        },
      })
      .fromTo(
        card,
        { opacity: 0, scale: 0.55, y: 34, rotation: tilt * 1.6, rotationX: 28, transformPerspective: 900, filter: "blur(8px)" },
        { opacity: 1, scale: 1, y: 0, rotation: tilt, rotationX: 0, filter: "blur(0px)", duration: 1.1, ease: "expo.out" },
      )
      .to(card, { y: -10, rotation: tilt * 0.6, duration: gsap.utils.random(2.2, 3.2), ease: "sine.inOut" })
      .to(card, { opacity: 0, scale: 0.9, y: -34, filter: "blur(5px)", duration: 0.85, ease: "power2.in" });
  };
  const schedule = () => {
    timer?.kill();
    timer = gsap.delayedCall(gsap.utils.random(1.4, 2.4), () => {
      if (live) pop();
      schedule();
    });
  };
  on("panel", ({ panel }) => {
    live = Boolean(panel?.contains(plane));
    if (live) {
      gsap.delayedCall(0.9, pop);
      gsap.delayedCall(1.6, pop);
      schedule();
    } else timer?.kill();
  });
}

/* ---------- A copied install command or agent prompt earns a cheer ---------- */
for (const button of document.querySelectorAll(".setup__script [data-copy], .handoff__copy")) {
  button.addEventListener("click", () => emit("cheer"));
}

startGuide();
window.addEventListener("scroll", syncPanel, { passive: true });
window.addEventListener("resize", syncPanel);
if (typeof ResizeObserver === "function" && panels.length) new ResizeObserver(syncPanel).observe(panels[0].parentElement);
syncPanel();
if (motion) window.addEventListener("load", () => ScrollTrigger.refresh());
