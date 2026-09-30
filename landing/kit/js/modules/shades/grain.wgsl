@group(0) @binding(0) var<uniform> params: Params;

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let res = params.resolution;
  let frag = shadeFrag(uv, res);
  var st = shadeSpace(shadeCoord(uv, res), params.spread, params.detail);
  let t = params.time * 0.14;
  let k = clamp(params.warp, 0.0, 1.0);
  let fiber = fbm(st * 8.2 + vec2f(t * 0.9, -t * 0.7) + params.seed);
  let fiber2 = fbm(st * 3.4 - vec2f(t * 0.45, t * 0.55) + 4.8);
  let g1 = filmGrain(frag, params.time, params.seed);
  let g2 = filmGrain(frag.yx + 3.7, params.time * 1.07 + 0.13, params.seed * 1.9);
  var col = mix(params.surface, params.paper, 0.08 + 0.22 * fiber);
  col = mix(col, params.muted, fiber2 * 0.12);
  let n = (g1 * 0.72 + g2 * 0.28) * mix(0.16, 0.1, params.light) * (1.0 + k * 0.7);
  col += (params.ink - params.surface) * n;
  col = mix(col, params.accent, clamp(params.tint, 0.0, 1.0) * 0.38 + fiber * 0.05);
  col = shadeMix(params.surface, col, params.contrast);
  return shadeOut(col, params.alpha);
}
