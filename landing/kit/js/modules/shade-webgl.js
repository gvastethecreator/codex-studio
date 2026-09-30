const VERT = `#version 300 es
precision highp float;
layout(location = 0) in vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const UNIFORMS = [
  "uTime",
  "uLight",
  "uSeed",
  "uAlpha",
  "uWarp",
  "uTint",
  "uSpread",
  "uContrast",
  "uDetail",
  "uRes",
  "uPaper",
  "uSurface",
  "uInk",
  "uMuted",
  "uAccent",
];

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("WebGL shader alloc failed");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) || "compile failed";
    gl.deleteShader(shader);
    throw new Error(log);
  }
  return shader;
}

function link(gl, fragSource) {
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, fragSource);
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.bindAttribLocation(program, 0, "aPos");
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program) || "link failed";
    gl.deleteProgram(program);
    throw new Error(log);
  }
  const locations = {};
  for (const name of UNIFORMS) locations[name] = gl.getUniformLocation(program, name);
  return { program, locations };
}

function vec3(value, fallback) {
  if (Array.isArray(value) && value.length >= 3) return [Number(value[0]), Number(value[1]), Number(value[2])];
  return fallback;
}

export function createGlBackend(canvas, options = {}) {
  const gl = canvas.getContext("webgl2", {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
  });
  if (!gl) throw new Error("WebGL2 unavailable");

  const state = {
    time: 0,
    light: 0,
    seed: 0,
    alpha: 1,
    warp: 0,
    tint: 0,
    spread: 0.5,
    contrast: 1,
    detail: 0.5,
    resolution: [1, 1],
    paper: [0.02, 0.02, 0.02],
    surface: [0.07, 0.07, 0.07],
    ink: [0.8, 0.8, 0.8],
    muted: [0.5, 0.5, 0.5],
    accent: [0.8, 0.8, 0.8],
    ...(options.params || {}),
  };

  let packed = link(gl, options.source);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.disable(gl.DEPTH_TEST);
  gl.disable(gl.BLEND);

  function resize() {
    const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
    const width = Math.max(1, Math.round((canvas.clientWidth || 1) * dpr));
    const height = Math.max(1, Math.round((canvas.clientHeight || 1) * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    gl.viewport(0, 0, width, height);
    state.resolution = [width, height];
    return state.resolution;
  }

  function set(params = {}) {
    Object.assign(state, params);
  }

  function setVariant(source) {
    const next = link(gl, source);
    gl.deleteProgram(packed.program);
    packed = next;
  }

  function draw() {
    if (gl.isContextLost()) return;
    resize();
    gl.useProgram(packed.program);
    const loc = packed.locations;
    gl.uniform1f(loc.uTime, state.time);
    gl.uniform1f(loc.uLight, state.light);
    gl.uniform1f(loc.uSeed, state.seed);
    gl.uniform1f(loc.uAlpha, state.alpha);
    gl.uniform1f(loc.uWarp, state.warp);
    gl.uniform1f(loc.uTint, state.tint);
    gl.uniform1f(loc.uSpread, state.spread ?? 0.5);
    gl.uniform1f(loc.uContrast, state.contrast ?? 1);
    gl.uniform1f(loc.uDetail, state.detail ?? 0.5);
    gl.uniform2f(loc.uRes, state.resolution[0], state.resolution[1]);
    gl.uniform3fv(loc.uPaper, vec3(state.paper, [0.02, 0.02, 0.02]));
    gl.uniform3fv(loc.uSurface, vec3(state.surface, [0.07, 0.07, 0.07]));
    gl.uniform3fv(loc.uInk, vec3(state.ink, [0.8, 0.8, 0.8]));
    gl.uniform3fv(loc.uMuted, vec3(state.muted, [0.5, 0.5, 0.5]));
    gl.uniform3fv(loc.uAccent, vec3(state.accent, [0.8, 0.8, 0.8]));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function dispose() {
    gl.deleteBuffer(buffer);
    gl.deleteProgram(packed.program);
    const lose = gl.getExtension("WEBGL_lose_context");
    if (lose) lose.loseContext();
  }

  resize();
  return {
    kind: "webgl",
    set,
    setVariant,
    draw,
    dispose,
    size() {
      return state.resolution;
    },
  };
}
