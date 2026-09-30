@group(0) @binding(0) var<uniform> params: Params;

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let res = params.resolution;
  var st = shadeSpace(shadeCoord(uv, res), params.spread, params.detail);
  let t = params.time * 0.28;
  let k = clamp(params.warp, 0.0, 1.0);
  var p = st * 1.55;
  p += curl2(p * 0.82 + vec2f(t * 0.52, -t * 0.3)) * (0.46 + k * 0.32);
  p += curl2(p * 1.55 + vec2f(-t * 0.38, t * 0.46) + 3.1) * (0.24 + k * 0.14);
  p += curl2(p * 2.4 - vec2f(t * 0.22, t * 0.18) + 7.4) * 0.1;
  let field = fbm(p + t * 0.1);
  let depth = fbm(p * 1.65 - t * 0.08 + 2.2);
  let gx = fbm(p + vec2f(0.05, 0.0)) - fbm(p - vec2f(0.05, 0.0));
  let gy = fbm(p + vec2f(0.0, 0.05)) - fbm(p - vec2f(0.0, 0.05));
  let spec = pow(max(0.0, gx * 0.35 - gy * 0.75 + 0.12), 2.8);
  let ridge = smoothstep(0.26, 0.54, field) - smoothstep(0.5, 0.88, field);
  let swell = smoothstep(0.14, 0.78, depth);
  var col = mix(params.surface, params.paper, swell * 0.48);
  col = mix(col, params.muted, (1.0 - field) * 0.12);
  col = mix(col, mix(params.muted, params.accent, 0.72), ridge * mix(0.4, 0.22, params.light));
  col += params.accent * spec * mix(0.32, 0.16, params.light);
  col += params.accent * pow(max(0.0, ridge), 1.45) * 0.14;
  col = mix(col, params.accent, clamp(params.tint, 0.0, 1.0) * 0.4);
  col = shadeMix(params.surface, col, params.contrast);
  return shadeOut(col, params.alpha);
}
