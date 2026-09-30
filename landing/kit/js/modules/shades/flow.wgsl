@group(0) @binding(0) var<uniform> params: Params;

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let res = params.resolution;
  var st = shadeSpace(shadeCoord(uv, res), params.spread, params.detail);
  let t = params.time * 0.38;
  let k = clamp(params.warp, 0.0, 1.0);
  st += vec2f(fbm(st + t * 0.7) - 0.5, fbm(st.yx - t * 0.55) - 0.5) * (0.12 + k * 0.2);
  let a = fbm(st * 2.6 + vec2f(t * 1.15, t * 0.38));
  let b = fbm(st * 3.4 + vec2f(-t * 0.92, t * 1.05) + 2.7);
  let c = fbm(st * 1.9 - vec2f(t * 0.55, -t * 0.72));
  let caustic = pow(max(0.0, 1.0 - abs(a - b) * 2.4), 5.5);
  let caustic2 = pow(max(0.0, sin((a * 0.85 + b) * 6.28318)), 6.0);
  let stream = smoothstep(0.34, 0.7, c) * (1.0 - smoothstep(0.68, 0.94, a));
  var col = mix(params.surface, params.paper, c * 0.28);
  col = mix(col, params.muted, stream * 0.14);
  col += params.accent * (caustic * mix(0.38, 0.2, params.light) + caustic2 * mix(0.16, 0.08, params.light) + stream * 0.08);
  col = mix(col, params.accent, clamp(params.tint, 0.0, 1.0) * 0.4);
  col = shadeMix(params.surface, col, params.contrast);
  return shadeOut(col, params.alpha);
}
