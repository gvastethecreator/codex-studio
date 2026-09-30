@group(0) @binding(0) var<uniform> params: Params;

fn sparkle(frag: vec2f, size: f32, t: f32, seed: f32, density: f32, rate: f32) -> f32 {
  let cell = floor(frag / size);
  let h = hash21(cell + seed);
  let h2 = hash21(cell.yx + seed * 1.7);
  let cycle = fract(t * mix(rate, rate * 1.28, h) + h);
  let fade = smoothstep(0.0, 0.22, cycle) * smoothstep(1.0, 0.68, cycle);
  return step(density, h) * fade * mix(0.55, 1.0, h2);
}

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let res = params.resolution;
  let frag = shadeFrag(uv, res);
  var st = shadeSpace(shadeCoord(uv, res), params.spread, params.detail);
  let t = params.time;
  let k = clamp(params.warp, 0.0, 1.0);
  let sep = mix(4.2, 13.0, clamp(params.spread, 0.0, 1.0));
  let fine = sparkle(frag, mix(sep, sep * 0.72, k), t, params.seed, 0.72, 0.32);
  let coarse = sparkle(frag, mix(sep * 2.0, sep * 1.5, k), t, params.seed * 2.1, 0.82, 0.2);
  let drift = fbm(st * 2.2 + vec2f(t * 0.22, -t * 0.16));
  var col = mix(params.surface, params.paper, drift * 0.18);
  let spark = clamp(fine * 0.85 + coarse * 1.15, 0.0, 1.0);
  col = mix(col, mix(params.ink, params.accent, 0.55), spark * mix(0.55, 0.32, params.light));
  col = mix(col, params.accent, clamp(params.tint, 0.0, 1.0) * 0.38);
  col = shadeMix(params.surface, col, params.contrast);
  return shadeOut(col, params.alpha);
}
