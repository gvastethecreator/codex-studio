#version 300 es
precision highp float;
uniform float uTime;
uniform float uLight;
uniform float uSeed;
uniform float uAlpha;
uniform float uWarp;
uniform float uTint;
uniform float uSpread;
uniform float uContrast;
uniform float uDetail;
uniform vec2 uRes;
uniform vec3 uPaper;
uniform vec3 uSurface;
uniform vec3 uInk;
uniform vec3 uMuted;
uniform vec3 uAccent;
out vec4 fragColor;

float hash21(vec2 p_in) {
  vec3 p3 = fract(vec3(p_in.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f *= f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p_in) {
  vec2 p = p_in;
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * vnoise(p);
    p = p * 2.07 + vec2(17.1, 9.3);
    a *= 0.5;
  }
  return v;
}

vec2 shadeCoord() {
  return (gl_FragCoord.xy - 0.5 * uRes) / max(uRes.y, 1.0);
}

float filmGrain(vec2 frag, float time, float seed) {
  float t = time * 2.4;
  float i = floor(t);
  float w = fract(t);
  float ease = w * w * (3.0 - 2.0 * w);
  float g0 = hash21(frag + vec2(i * 19.17, i * 47.31) + seed);
  float g1 = hash21(frag + vec2((i + 1.0) * 19.17, (i + 1.0) * 47.31) + seed);
  return mix(g0, g1, ease) - 0.5;
}

vec2 shadeSpace(vec2 st, float spread, float detail) {
  float sep = mix(2.15, 0.58, clamp(spread, 0.0, 1.0));
  float det = mix(0.7, 1.65, clamp(detail, 0.0, 1.0));
  return st * sep * det;
}

vec3 shadeMix(vec3 base, vec3 col, float contrast) {
  return mix(base, col, clamp(contrast, 0.0, 1.0));
}

vec2 curl2(vec2 p) {
  float e = 0.12;
  float nL = fbm(p - vec2(e, 0.0));
  float nR = fbm(p + vec2(e, 0.0));
  float nD = fbm(p - vec2(0.0, e));
  float nU = fbm(p + vec2(0.0, e));
  return vec2(nU - nD, nL - nR);
}
