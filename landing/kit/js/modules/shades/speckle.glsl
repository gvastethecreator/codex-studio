float sparkle(vec2 frag, float size, float t, float seed, float density, float rate) {
  vec2 cell = floor(frag / size);
  float h = hash21(cell + seed);
  float h2 = hash21(cell.yx + seed * 1.7);
  float cycle = fract(t * mix(rate, rate * 1.28, h) + h);
  float fade = smoothstep(0.0, 0.22, cycle) * smoothstep(1.0, 0.68, cycle);
  return step(density, h) * fade * mix(0.55, 1.0, h2);
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 st = shadeSpace(shadeCoord(), uSpread, uDetail);
  float t = uTime;
  float k = clamp(uWarp, 0.0, 1.0);
  float sep = mix(4.2, 13.0, clamp(uSpread, 0.0, 1.0));
  float fine = sparkle(frag, mix(sep, sep * 0.72, k), t, uSeed, 0.72, 0.32);
  float coarse = sparkle(frag, mix(sep * 2.0, sep * 1.5, k), t, uSeed * 2.1, 0.82, 0.2);
  float drift = fbm(st * 2.2 + vec2(t * 0.22, -t * 0.16));
  vec3 col = mix(uSurface, uPaper, drift * 0.18);
  float spark = clamp(fine * 0.85 + coarse * 1.15, 0.0, 1.0);
  col = mix(col, mix(uInk, uAccent, 0.55), spark * mix(0.55, 0.32, uLight));
  col = mix(col, uAccent, clamp(uTint, 0.0, 1.0) * 0.38);
  col = shadeMix(uSurface, col, uContrast);
  fragColor = vec4(col * uAlpha, uAlpha);
}
