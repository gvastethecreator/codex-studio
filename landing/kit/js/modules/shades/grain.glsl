void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 st = shadeSpace(shadeCoord(), uSpread, uDetail);
  float t = uTime * 0.14;
  float k = clamp(uWarp, 0.0, 1.0);
  float fiber = fbm(st * 8.2 + vec2(t * 0.9, -t * 0.7) + uSeed);
  float fiber2 = fbm(st * 3.4 - vec2(t * 0.45, t * 0.55) + 4.8);
  float g1 = filmGrain(frag, uTime, uSeed);
  float g2 = filmGrain(frag.yx + 3.7, uTime * 1.07 + 0.13, uSeed * 1.9);
  vec3 col = mix(uSurface, uPaper, 0.08 + 0.22 * fiber);
  col = mix(col, uMuted, fiber2 * 0.12);
  float n = (g1 * 0.72 + g2 * 0.28) * mix(0.16, 0.1, uLight) * (1.0 + k * 0.7);
  col += (uInk - uSurface) * n;
  col = mix(col, uAccent, clamp(uTint, 0.0, 1.0) * 0.38 + fiber * 0.05);
  col = shadeMix(uSurface, col, uContrast);
  fragColor = vec4(col * uAlpha, uAlpha);
}
