void main() {
  vec2 st = shadeSpace(shadeCoord(), uSpread, uDetail);
  float t = uTime * 0.38;
  float k = clamp(uWarp, 0.0, 1.0);
  st += vec2(fbm(st + t * 0.7) - 0.5, fbm(st.yx - t * 0.55) - 0.5) * (0.12 + k * 0.2);
  float a = fbm(st * 2.6 + vec2(t * 1.15, t * 0.38));
  float b = fbm(st * 3.4 + vec2(-t * 0.92, t * 1.05) + 2.7);
  float c = fbm(st * 1.9 - vec2(t * 0.55, -t * 0.72));
  float caustic = pow(max(0.0, 1.0 - abs(a - b) * 2.4), 5.5);
  float caustic2 = pow(max(0.0, sin((a * 0.85 + b) * 6.28318)), 6.0);
  float stream = smoothstep(0.34, 0.7, c) * (1.0 - smoothstep(0.68, 0.94, a));
  vec3 col = mix(uSurface, uPaper, c * 0.28);
  col = mix(col, uMuted, stream * 0.14);
  col += uAccent * (caustic * mix(0.38, 0.2, uLight) + caustic2 * mix(0.16, 0.08, uLight) + stream * 0.08);
  col = mix(col, uAccent, clamp(uTint, 0.0, 1.0) * 0.4);
  col = shadeMix(uSurface, col, uContrast);
  fragColor = vec4(col * uAlpha, uAlpha);
}
