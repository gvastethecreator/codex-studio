import React, { useEffect, useRef } from 'react';
import { BackgroundConfig } from '../types';
import { MODELS } from '../constants';
import { runtimeLogger } from '../utils/runtimeLogger';

// --- CONFIGURACIÓN DEL FONDO LÍQUIDO (MATRIX) ---
// Modifica estos valores para cambiar la apariencia del fondo
const LIQUID_CONFIG = {
  // Configuración por estado (reposo vs generando)
  state: {
    idle: {
      speedMultiplier: 1.0,
      opacity: 0.5,
      transition: 'opacity 1s ease',
    },
    generating: {
      speedMultiplier: 15.0,
      opacity: 0.8,
      transition: 'opacity 1s ease',
    },
  },
  // Configuración específica por modelo (Colores RGB normalizados 0.0 - 1.0)
  // Este color se añade como un brillo extra cuando el modelo está generando
  models: {
    [MODELS.CODEX_IMAGEGEN]: { tint: [0.1, 0.5, 0.45] },
    default: { tint: [0.1, 0.3, 0.5] }, // Azul (por defecto)
  },
  // Colores base (en formato código GLSL vec3)
  colors: {
    darkest: 'vec3(0.01, 0.01, 0.015)', // Color más oscuro (fondo profundo)
    midTone: 'vec3(0.15, 0.15, 0.18)', // Tono medio del fluido
    highlight: 'vec3(0.40, 0.40, 0.45)', // Brillos del fluido
  },
  // Caracteres estilo Matrix
  matrix: {
    scaleX: '3.0', // Escala X de los píxeles del caracter
    scaleY: '5.0', // Escala Y de los píxeles del caracter
    charWidth: '0.3', // Ancho del caracter en su celda
    charHeight: '0.5', // Alto del caracter en su celda
    intensityBase: '0.3', // Intensidad base de brillo
    intensityVariance: '0.7', // Varianza de brillo
  },
  // Comportamiento del fluido
  fluid: {
    mouseDistortion: '0.1', // Cuánto distorsiona el ratón el fluido
    charDistortion: '0.4', // Cuánto distorsionan los caracteres el fluido
    mouseRadius: '0.5', // Radio de efecto del ratón
  },
};

const DEFAULT_BACKGROUND_CONFIG = {
  density: 0.1,
  speed: 0.0005,
};

interface LiquidBackgroundProps {
  isGenerating?: boolean;
  activeModel?: string;
  config?: BackgroundConfig;
}

const vertexShaderSource = `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  precision mediump float;
  varying vec2 vUv;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform float u_isGenerating;
  uniform float u_speed;
  uniform float u_density;
  uniform vec3 u_genTint;

  // Simple 2D noise function
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453123);
  }

  // Procedural Matrix-style characters
  float matrixChars(vec2 uv, float time) {
    float s = 0.0;
    for (int i = 0; i < 3; i++) {
      float fi = float(i);
      // Scale the grid for characters
      vec2 st = uv * (12.0 + fi * 6.0);
      // Falling movement
      st.y += time * (0.15 + fi * 0.08) * u_speed;
      // Subtle horizontal sway
      st.x += sin(time * 0.5 + fi) * 0.05;
      
      vec2 id = floor(st);
      vec2 f = fract(st);
      vec2 p = hash2(id); // Random position within cell
      
      // Sparsity: Adjusted by u_density
      float threshold = mix(0.995, 0.95, u_density);
      float show = step(threshold, p.x); 
      
      // Character bounding box (width, height relative to cell)
      vec2 charSize = vec2(${LIQUID_CONFIG.matrix.charWidth}, ${LIQUID_CONFIG.matrix.charHeight}); 
      vec2 charUv = (f - p + charSize * 0.5) / charSize;
      
      // Mask for inside the character box
      float inside = step(0.0, charUv.x) * step(charUv.x, 1.0) * step(0.0, charUv.y) * step(charUv.y, 1.0);
      
      // Pixel grid for the procedural character
      vec2 grid = floor(charUv * vec2(${LIQUID_CONFIG.matrix.scaleX}, ${LIQUID_CONFIG.matrix.scaleY}));
      
      // Randomize character pixels based on cell ID, grid position, and time (to make them flicker/change)
      float charHash = fract(sin(dot(id + grid, vec2(12.9898, 78.233)) + floor(time * 8.0)) * 43758.5453);
      float pixel = step(0.4, charHash); // 60% chance of a pixel being on
      
      // Different opacities/contrasts per character based on their random hash (p.y)
      float charIntensity = ${LIQUID_CONFIG.matrix.intensityBase} + ${LIQUID_CONFIG.matrix.intensityVariance} * p.y; 
      
      // Lifecycle: appear, fall for 6-10 seconds, disappear
      float cycleDuration = 6.0 + p.y * 4.0; // Active for 6 to 10 seconds
      float deadTime = 4.0 + p.x * 6.0; // Invisible for 4 to 10 seconds before repeating
      float localTime = mod(time + p.x * 100.0, cycleDuration + deadTime);
      
      // Fade in over 0.5s, fade out over 1.5s at the end of cycleDuration
      float lifeAlpha = smoothstep(0.0, 0.5, localTime) * smoothstep(cycleDuration, cycleDuration - 1.5, localTime);
      
      // Add to total with a slight pulsing opacity
      float pulse = 0.7 + 0.3 * sin(time * (2.0 + p.x * 2.0) + p.y * 20.0);
      
      s += show * inside * pixel * pulse * charIntensity * lifeAlpha;
    }
    return s;
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  // Fractal Brownian Motion
  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 0.0;
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);
      p *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }

  // 4x4 Bayer Dither Matrix
  float bayer4x4(vec2 p) {
    float x = floor(mod(p.x, 4.0));
    float y = floor(mod(p.y, 4.0));
    float m = 0.0;
    if (x < 0.5) {
      if (y < 0.5) m = 0.0; else if (y < 1.5) m = 12.0; else if (y < 2.5) m = 3.0; else m = 15.0;
    } else if (x < 1.5) {
      if (y < 0.5) m = 8.0; else if (y < 1.5) m = 4.0; else if (y < 2.5) m = 11.0; else m = 7.0;
    } else if (x < 2.5) {
      if (y < 0.5) m = 2.0; else if (y < 1.5) m = 14.0; else if (y < 2.5) m = 1.0; else m = 13.0;
    } else {
      if (y < 0.5) m = 10.0; else if (y < 1.5) m = 6.0; else if (y < 2.5) m = 9.0; else m = 5.0;
    }
    return m / 16.0;
  }

  void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;

    // Mouse interaction
    vec2 mouse = u_mouse / u_resolution.xy;
    mouse.x *= u_resolution.x / u_resolution.y;
    
    // Distance to mouse
    float dist = distance(st, mouse);
    float mouseEffect = smoothstep(${LIQUID_CONFIG.fluid.mouseRadius}, 0.0, dist);

    // Calculate matrix characters
    float charVal = matrixChars(st, u_time);

    // Distort coordinates with time and mouse
    vec2 pos = st * 3.0;
    
    // Liquid effect using fbm
    vec2 q = vec2(0.0);
    q.x = fbm(pos + 0.00 * u_time * u_speed);
    q.y = fbm(pos + vec2(1.0));

    vec2 r = vec2(0.0);
    r.x = fbm(pos + 1.0 * q + vec2(1.7, 9.2) + 0.15 * u_time * u_speed);
    r.y = fbm(pos + 1.0 * q + vec2(8.3, 2.8) + 0.126 * u_time * u_speed);

    // Add mouse and character effect to distortion
    r += mouseEffect * ${LIQUID_CONFIG.fluid.mouseDistortion}; 
    r += charVal * ${LIQUID_CONFIG.fluid.charDistortion}; 

    float f = fbm(pos + r);
    
    // Integrate characters into the base fluid value BEFORE dithering
    // This ensures they get the same 3-color retro treatment
    f += charVal * 0.9; // Boosted slightly so the high-intensity ones pop to the 3rd color

    // Apply dithering to the noise value
    float dither = bayer4x4(gl_FragCoord.xy);
    float levels = 3.0; // Number of color bands for the retro look
    float ditheredF = f + (dither - 0.5) * (1.0 / levels) * 1.5;
    ditheredF = floor(ditheredF * levels + 0.5) / levels;

    // Dark liquid aesthetic - High Contrast
    vec3 color1 = ${LIQUID_CONFIG.colors.darkest};
    vec3 color2 = ${LIQUID_CONFIG.colors.midTone};
    vec3 color3 = ${LIQUID_CONFIG.colors.highlight};
    
    // If generating, add a subtle tint based on activeModel
    vec3 genTint = u_genTint * u_isGenerating;
    color3 += genTint;

    vec3 finalColor = mix(color1, color2, ditheredF);
    finalColor = mix(finalColor, color3, smoothstep(0.6, 1.0, ditheredF) * (1.0 + mouseEffect * 0.3));

    // Add subtle vignette
    float vignette = distance(vUv, vec2(0.5));
    finalColor *= smoothstep(0.8, 0.2, vignette);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export default function LiquidBackground({
  isGenerating = false,
  activeModel,
  config = DEFAULT_BACKGROUND_CONFIG,
}: LiquidBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const speedRef = useRef(1.0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) return;

    // Compile shaders
    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        runtimeLogger.error('Shader compile error', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      runtimeLogger.error('Program link error', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Set up geometry
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = new Float32Array([
      -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Uniforms
    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const mouseLocation = gl.getUniformLocation(program, 'u_mouse');
    const isGeneratingLocation = gl.getUniformLocation(program, 'u_isGenerating');
    const speedLocation = gl.getUniformLocation(program, 'u_speed');
    const densityLocation = gl.getUniformLocation(program, 'u_density');
    const genTintLocation = gl.getUniformLocation(program, 'u_genTint');

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      // WebGL y is inverted
      targetMouseY = window.innerHeight - e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    };

    window.addEventListener('resize', resize);
    resize();

    let animationFrameId: number;
    const startTime = performance.now();

    const render = (time: number) => {
      // Smooth mouse movement with more delay (0.015 instead of 0.05)
      mouseX += (targetMouseX - mouseX) * 0.015;
      mouseY += (targetMouseY - mouseY) * 0.015;

      // State-based configuration
      const currentState = isGenerating ? LIQUID_CONFIG.state.generating : LIQUID_CONFIG.state.idle;
      const targetSpeed = currentState.speedMultiplier + config.speed * 100.0;
      speedRef.current += (targetSpeed - speedRef.current) * 0.05;

      // Model-based configuration
      const modelConfig =
        LIQUID_CONFIG.models[activeModel as keyof typeof LIQUID_CONFIG.models] ||
        LIQUID_CONFIG.models.default;

      gl.uniform1f(timeLocation, (time - startTime) * 0.001);
      gl.uniform2f(mouseLocation, mouseX, mouseY);
      gl.uniform1f(isGeneratingLocation, isGenerating ? 1.0 : 0.0);
      gl.uniform1f(speedLocation, speedRef.current);
      gl.uniform1f(densityLocation, config.density || 0.4);
      gl.uniform3f(genTintLocation, modelConfig.tint[0], modelConfig.tint[1], modelConfig.tint[2]);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
      gl.deleteProgram(program);
    };
  }, [isGenerating, activeModel, config.speed, config.density]);

  const currentState = isGenerating ? LIQUID_CONFIG.state.generating : LIQUID_CONFIG.state.idle;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none w-full h-full"
      style={{ opacity: currentState.opacity, transition: currentState.transition }}
    />
  );
}
