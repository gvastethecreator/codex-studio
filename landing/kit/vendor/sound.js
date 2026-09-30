/* Page sounds (html[data-sound]): very quiet cues synthesized with Web Audio, no files.
 * The browser only allows audio after the reader has clicked or pressed a key, so nothing plays
 * before that. The loudest cue peaks at -33 dBFS; the rest sit below it.
 *
 * Cues: click (buttons and links, low and muffled), toggle (disclosures, theme), swipe (the card
 * track, when the reader moves it), jump and land (the mascot; faint, the landing almost silent).
 * Things that happen on their own (typing, finishing, cards appearing) stay silent. */

// Cue peaks below are written on a scale where the loudest is FULL; the output gain maps FULL to LEVEL_DB.
const FULL = 0.03;
const LEVEL_DB = -33;

let ctx = null;
let out = null;
let noise = null;

function start() {
  if (ctx) {
    if (ctx.state === "suspended") ctx.resume();
    return;
  }
  const Context = window.AudioContext || window.webkitAudioContext;
  if (!Context) return;
  ctx = new Context();
  out = ctx.createGain();
  out.gain.value = 10 ** (LEVEL_DB / 20) / FULL;
  out.connect(ctx.destination);
  const length = ctx.sampleRate;
  noise = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
}
for (const type of ["pointerdown", "keydown"]) window.addEventListener(type, start, { capture: true, passive: true });

const ready = () => ctx && ctx.state === "running" && !document.hidden;

// A short envelope: rise in `attack`, fall to silence over `decay`.
function envelope(gain, at, peak, attack, decay) {
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(peak, at + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + attack + decay);
}

function tone({ freq, to = freq, type = "sine", peak = 0.03, attack = 0.004, decay = 0.08, delay = 0 }) {
  const at = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, at);
  if (to !== freq) osc.frequency.exponentialRampToValueAtTime(to, at + attack + decay);
  envelope(gain, at, peak, attack, decay);
  osc.connect(gain).connect(out);
  osc.start(at);
  osc.stop(at + attack + decay + 0.02);
}

function hiss({ from = 2000, to = from, q = 1.2, peak = 0.02, attack = 0.003, decay = 0.05, type = "bandpass", delay = 0 }) {
  const at = ctx.currentTime + delay;
  const src = ctx.createBufferSource();
  src.buffer = noise;
  const filter = ctx.createBiquadFilter();
  filter.type = type;
  filter.Q.value = q;
  filter.frequency.setValueAtTime(from, at);
  if (to !== from) filter.frequency.exponentialRampToValueAtTime(to, at + attack + decay);
  const gain = ctx.createGain();
  envelope(gain, at, peak, attack, decay);
  src.connect(filter).connect(gain).connect(out);
  src.start(at, Math.random() * 0.5);
  src.stop(at + attack + decay + 0.02);
}

const vary = (value, spread) => value * (1 + (Math.random() * 2 - 1) * spread);

const CUES = {
  // A soft, low tap: filtered noise with a short falling tone under it.
  click: () => {
    hiss({ from: vary(700, 0.1), q: 0.7, peak: 0.016, decay: 0.035, type: "lowpass" });
    tone({ freq: vary(320, 0.05), to: 190, peak: 0.02, attack: 0.003, decay: 0.05 });
  },
  toggle: () => tone({ freq: vary(280, 0.04), to: 360, peak: 0.016, attack: 0.004, decay: 0.07 }),
  swipe: () => hiss({ from: 900, to: 350, q: 0.7, peak: 0.01, attack: 0.03, decay: 0.2, type: "lowpass" }),
  jump: () => hiss({ from: 300, to: 900, q: 0.7, peak: 0.004, attack: 0.06, decay: 0.22 }),
  land: (strength = 1) => tone({ freq: 110, to: 55, peak: 0.004 * Math.min(1, strength), attack: 0.006, decay: 0.12 }),
};

const last = {};
const GAP = { click: 0.04, swipe: 0.12, jump: 0.2, land: 0.2 };
export function play(name, arg) {
  if (!ready() || !CUES[name]) return;
  const now = ctx.currentTime;
  if (last[name] != null && now - last[name] < (GAP[name] ?? 0)) return;
  last[name] = now;
  CUES[name](arg);
}

/* ---------- What makes a sound ---------- */
document.addEventListener(
  "click",
  (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const hit = target?.closest("button, a, summary, [role=button], [data-step]");
    if (!hit) return;
    if (hit.matches("summary, [data-theme-toggle]")) play("toggle");
    else play("click");
  },
  true,
);
const stage = (type, handler) => document.addEventListener(`stage:${type}`, (event) => handler(event.detail || {}));
stage("deck", ({ user }) => user && play("swipe"));
stage("jump", () => play("jump"));
stage("land", ({ strength }) => play("land", strength));
