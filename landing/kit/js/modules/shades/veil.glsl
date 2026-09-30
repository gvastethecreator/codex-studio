void main() {
  vec2 st = shadeSpace(shadeCoord(), uSpread, uDetail);
  float t = uTime * 0.4;
  float k = clamp(uWarp, 0.0, 1.0);
  float breath = 0.5 + 0.5 * sin(t * 1.55 + uSeed);
  st += vec2(fbm(st + t * 0.85) - 0.5, fbm(st.yx - t * 0.7) - 0.5) * (0.14 + k * 0.28);
  float r = length(st);
  float wash = smoothstep(0.0, 1.05, r + (breath - 0.5) * 0.22);
  float fog = fbm(st * 2.05 + vec2(t * 1.05, -t * 0.78));
  float fog2 = fbm(st * 3.4 - vec2(t * 0.62, t * 0.9) + 5.1);
  float crease = smoothstep(0.32, 0.55, fog) - smoothstep(0.58, 0.88, fog);
  float spin = t * 1.05 + uSeed;
  vec2 blob = vec2(cos(spin), sin(spin * 0.92)) * (0.32 + k * 0.16);
  vec2 blob2 = vec2(cos(-spin * 0.78 + 1.7), sin(-spin * 0.7)) * 0.24;
  vec2 blob3 = vec2(sin(spin * 0.55 + 2.4), cos(spin * 0.48)) * 0.42;
  float sheen = pow(max(0.0, 1.0 - length(st - blob) * 1.25), 2.4);
  float sheen2 = pow(max(0.0, 1.0 - length(st - blob2) * 1.55), 3.0);
  float sheen3 = pow(max(0.0, 1.0 - length(st - blob3) * 1.15), 2.2);
  vec3 col = mix(uSurface, uPaper, wash * 0.42 + fog * 0.16 + fog2 * 0.08);
  col = mix(col, uMuted, wash * 0.12 + crease * 0.14);
  float glow = (sheen * 0.38 + sheen2 * 0.22 + sheen3 * 0.12) * mix(1.0, 0.58, uLight);
  col = mix(col, mix(uMuted, uAccent, 0.62), glow);
  col = mix(col, uAccent, clamp(uTint, 0.0, 1.0) * 0.4 + sheen * 0.08);
  col = shadeMix(uSurface, col, uContrast);
  fragColor = vec4(col * uAlpha, uAlpha);
}
