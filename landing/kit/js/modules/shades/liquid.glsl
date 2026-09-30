void main() {
  vec2 st = shadeSpace(shadeCoord(), uSpread, uDetail);
  float t = uTime * 0.28;
  float k = clamp(uWarp, 0.0, 1.0);
  vec2 p = st * 1.55;
  p += curl2(p * 0.82 + vec2(t * 0.52, -t * 0.3)) * (0.46 + k * 0.32);
  p += curl2(p * 1.55 + vec2(-t * 0.38, t * 0.46) + 3.1) * (0.24 + k * 0.14);
  p += curl2(p * 2.4 - vec2(t * 0.22, t * 0.18) + 7.4) * 0.1;
  float field = fbm(p + t * 0.1);
  float depth = fbm(p * 1.65 - t * 0.08 + 2.2);
  float gx = fbm(p + vec2(0.05, 0.0)) - fbm(p - vec2(0.05, 0.0));
  float gy = fbm(p + vec2(0.0, 0.05)) - fbm(p - vec2(0.0, 0.05));
  float spec = pow(max(0.0, gx * 0.35 - gy * 0.75 + 0.12), 2.8);
  float ridge = smoothstep(0.26, 0.54, field) - smoothstep(0.5, 0.88, field);
  float swell = smoothstep(0.14, 0.78, depth);
  vec3 col = mix(uSurface, uPaper, swell * 0.48);
  col = mix(col, uMuted, (1.0 - field) * 0.12);
  col = mix(col, mix(uMuted, uAccent, 0.72), ridge * mix(0.4, 0.22, uLight));
  col += uAccent * spec * mix(0.32, 0.16, uLight);
  col += uAccent * pow(max(0.0, ridge), 1.45) * 0.14;
  col = mix(col, uAccent, clamp(uTint, 0.0, 1.0) * 0.4);
  col = shadeMix(uSurface, col, uContrast);
  fragColor = vec4(col * uAlpha, uAlpha);
}
