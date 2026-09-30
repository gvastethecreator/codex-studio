struct Params {
  time: f32,
  light: f32,
  seed: f32,
  alpha: f32,
  warp: f32,
  tint: f32,
  spread: f32,
  contrast: f32,
  detail: f32,
  pad0: f32,
  resolution: vec2f,
  paper: vec3f,
  surface: vec3f,
  ink: vec3f,
  muted: vec3f,
  accent: vec3f,
}

fn hash21(p_in: vec2f) -> f32 {
  var p3 = fract(vec3f(p_in.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

fn vnoise(p: vec2f) -> f32 {
  let i = floor(p);
  var f = fract(p);
  f *= f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i), hash21(i + vec2f(1.0, 0.0)), f.x),
    mix(hash21(i + vec2f(0.0, 1.0)), hash21(i + vec2f(1.0, 1.0)), f.x),
    f.y
  );
}

fn fbm(p_in: vec2f) -> f32 {
  var p = p_in;
  var v = 0.0;
  var a = 0.5;
  for (var i = 0; i < 5; i++) {
    v += a * vnoise(p);
    p = p * 2.07 + vec2f(17.1, 9.3);
    a *= 0.5;
  }
  return v;
}

fn shadeCoord(uv: vec2f, res: vec2f) -> vec2f {
  let frag = vec2f(uv.x * res.x, (1.0 - uv.y) * res.y);
  return (frag - 0.5 * res) / max(res.y, 1.0);
}

fn shadeFrag(uv: vec2f, res: vec2f) -> vec2f {
  return vec2f(uv.x * res.x, (1.0 - uv.y) * res.y);
}

fn shadeOut(col: vec3f, alpha: f32) -> vec4f {
  return vec4f(col * alpha, alpha);
}

fn filmGrain(frag: vec2f, time: f32, seed: f32) -> f32 {
  let t = time * 2.4;
  let i = floor(t);
  let w = fract(t);
  let ease = w * w * (3.0 - 2.0 * w);
  let g0 = hash21(frag + vec2f(i * 19.17, i * 47.31) + seed);
  let g1 = hash21(frag + vec2f((i + 1.0) * 19.17, (i + 1.0) * 47.31) + seed);
  return mix(g0, g1, ease) - 0.5;
}

fn shadeSpace(st: vec2f, spread: f32, detail: f32) -> vec2f {
  let sep = mix(2.15, 0.58, clamp(spread, 0.0, 1.0));
  let det = mix(0.7, 1.65, clamp(detail, 0.0, 1.0));
  return st * sep * det;
}

fn shadeMix(base: vec3f, col: vec3f, contrast: f32) -> vec3f {
  return mix(base, col, clamp(contrast, 0.0, 1.0));
}

fn curl2(p: vec2f) -> vec2f {
  let e = 0.12;
  let nL = fbm(p - vec2f(e, 0.0));
  let nR = fbm(p + vec2f(e, 0.0));
  let nD = fbm(p - vec2f(0.0, e));
  let nU = fbm(p + vec2f(0.0, e));
  return vec2f(nU - nD, nL - nR);
}
