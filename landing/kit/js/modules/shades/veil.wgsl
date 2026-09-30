@group(0) @binding(0) var<uniform> params: Params;

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let res = params.resolution;
  var st = shadeSpace(shadeCoord(uv, res), params.spread, params.detail);
  let t = params.time * 0.4;
  let k = clamp(params.warp, 0.0, 1.0);
  let breath = 0.5 + 0.5 * sin(t * 1.55 + params.seed);
  st += vec2f(fbm(st + t * 0.85) - 0.5, fbm(st.yx - t * 0.7) - 0.5) * (0.14 + k * 0.28);
  let r = length(st);
  let wash = smoothstep(0.0, 1.05, r + (breath - 0.5) * 0.22);
  let fog = fbm(st * 2.05 + vec2f(t * 1.05, -t * 0.78));
  let fog2 = fbm(st * 3.4 - vec2f(t * 0.62, t * 0.9) + 5.1);
  let crease = smoothstep(0.32, 0.55, fog) - smoothstep(0.58, 0.88, fog);
  let spin = t * 1.05 + params.seed;
  let blob = vec2f(cos(spin), sin(spin * 0.92)) * (0.32 + k * 0.16);
  let blob2 = vec2f(cos(-spin * 0.78 + 1.7), sin(-spin * 0.7)) * 0.24;
  let blob3 = vec2f(sin(spin * 0.55 + 2.4), cos(spin * 0.48)) * 0.42;
  let sheen = pow(max(0.0, 1.0 - length(st - blob) * 1.25), 2.4);
  let sheen2 = pow(max(0.0, 1.0 - length(st - blob2) * 1.55), 3.0);
  let sheen3 = pow(max(0.0, 1.0 - length(st - blob3) * 1.15), 2.2);
  var col = mix(params.surface, params.paper, wash * 0.42 + fog * 0.16 + fog2 * 0.08);
  col = mix(col, params.muted, wash * 0.12 + crease * 0.14);
  let glow = (sheen * 0.38 + sheen2 * 0.22 + sheen3 * 0.12) * mix(1.0, 0.58, params.light);
  col = mix(col, mix(params.muted, params.accent, 0.62), glow);
  col = mix(col, params.accent, clamp(params.tint, 0.0, 1.0) * 0.4 + sheen * 0.08);
  col = shadeMix(params.surface, col, params.contrast);
  return shadeOut(col, params.alpha);
}
