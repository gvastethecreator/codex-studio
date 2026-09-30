@group(0) @binding(0) var<uniform> params: Params;

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let res = params.resolution;
  let frag = shadeFrag(uv, res);
  var st = shadeSpace(shadeCoord(uv, res), params.spread, params.detail);
  let t = params.time * 0.42;
  let k = clamp(params.warp, 0.0, 1.0);
  st += vec2f(fbm(st + t * 1.15) - 0.5, fbm(st * 1.15 - t * 0.9 + 3.2) - 0.5) * (0.18 + k * 0.4);
  let drift = vec2f(sin(params.seed * 1.7 + t * 0.55), cos(params.seed * 1.13 - t * 0.42)) * 1.8;
  let p = st * 1.7 + drift;
  let warp = vec2f(fbm(p + t * 1.05), fbm(p + 6.8 - t * 0.82));
  var q = p + warp * (1.25 + k * 0.55);
  var mist = smoothstep(0.18, 0.82, fbm(q));
  let spark = fbm(st * 11.0 + vec2f(t * 3.2, -t * 2.4) + params.seed);
  mist = mix(mist, smoothstep(0.28, 0.84, spark), 0.38 + k * 0.35);
  let spin = t * 1.15 + params.seed;
  let blob = vec2f(cos(spin), sin(spin)) * (0.38 + k * 0.18);
  let blob2 = vec2f(cos(-spin * 0.72 + 1.4), sin(-spin * 0.68)) * 0.26;
  let sheen = pow(max(0.0, 1.0 - length(st - blob) * 1.35), 2.8);
  let sheen2 = pow(max(0.0, 1.0 - length(st - blob2) * 1.65), 3.4);
  let rim = smoothstep(0.1, 0.95, length(st) * 1.18);
  let grain = filmGrain(frag, params.time, params.seed);
  var col = mix(params.surface, params.paper, rim * 0.3 + mist * 0.18);
  col = mix(col, params.accent, clamp(params.tint, 0.0, 1.0) * 0.42);
  col = mix(col, mix(params.muted, params.accent, 0.45), 0.1 + 0.32 * mist);
  col += params.accent * (sheen * 0.34 + sheen2 * 0.18) * mix(1.0, 0.55, params.light);
  col = mix(col, col * mix(0.76, 0.9, params.light), rim * 0.5);
  col += grain * 0.018;
  col = shadeMix(params.surface, col, params.contrast);
  return shadeOut(col, params.alpha);
}
