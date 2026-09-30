/* Card effects (about capabilities with `fx`): a small WebGL scene behind a card's words.
 *   rosette — six rounded links woven into a knot inside a faint larger echo; light runs
 *             along the links, and the knot turns faster and opens a little on hover
 *   horizon — a black hole: bent starlight, a tilted disc of hot dust that is brighter on the
 *             side turning toward you, the far side of the disc bent over the top, a photon ring
 *   lift    — motes at three depths rise with short trails and brighten as they cross an arch
 *   prompt  — a grid of dots where lines of code type themselves in behind a blinking
 *             cursor, and a ring of light spreads out from the prompt
 * Colours come from the card: --cap-tint for the light and --surface for the ground. On a dark
 * ground a scene glows; on a light ground it is drawn as coloured ink. The words keep a calm
 * corner (bottom left). Hovering the card speeds a scene up. Scenes draw only while on screen,
 * follow the theme toggle, and without WebGL the card keeps its plain background. */

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const VERTEX = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";

const HEAD = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 r;
uniform float t;
uniform float h;
uniform float dark;
uniform vec3 tint;
uniform vec3 ground;
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
float sq(float x){return x*x;}
float fall(float from,float to,float x){return 1.-smoothstep(to,from,x);}
// e is the light a scene gives off, shade how much of the ground a dark body hides, and over
// the light that passes in front of that body. On a light ground the same scene is drawn in ink:
// light becomes coloured lines, the body a solid dark shape, and what passes in front of it paper.
vec3 hue(vec3 e){return e/max(max(e.r,max(e.g,e.b)),.001);}
float amount(vec3 e){return clamp(max(e.r,max(e.g,e.b))*1.6,0.,1.);}
vec3 finish(vec3 e,float shade,vec3 over){
  vec2 f=gl_FragCoord.xy/r;
  float keep=clamp(smoothstep(.08,.72,f.x)+smoothstep(.5,.86,f.y),.18,1.);
  e*=keep;
  over*=keep;
  vec3 glow=ground*(1.-shade)+e+over;
  vec3 ink=mix(ground,hue(e)*.5,amount(e)*.9);
  ink=mix(ink,vec3(.08,.07,.11),shade);
  ink=mix(ink,mix(hue(over)*.5,ground,shade),amount(over)*.9);
  return mix(ink,glow,dark)+(hash(gl_FragCoord.xy+fract(t*7.))-.5)/150.;
}
`;

const SCENES = {
  rosette: `
float box(vec2 p,vec2 b,float k){vec2 q=abs(p)-b+k;return length(max(q,0.))+min(max(q.x,q.y),0.)-k;}
void main(){
  vec2 uv=(gl_FragCoord.xy-vec2(r.x*.7,r.y*.66))/r.y;
  float s=(.4+.05*h+.012*sin(t*.6))*min(1.,r.x/r.y);
  float spin=t*(.07+.3*h);
  float d0=length(uv);
  vec3 e=vec3(0.);
  for(int i=0;i<6;i++){
    vec2 q=rot(float(i)*1.0472-spin*.6+.5)*uv;
    q.y-=s*.55;
    float d=box(q,vec2(s*.2,s*.46),s*.2);
    e+=tint*.012/(abs(d)+.012)*.1;
  }
  for(int i=0;i<6;i++){
    float fi=float(i);
    vec2 q=rot(fi*1.0472+spin)*uv;
    q.y-=s*.3;
    float ad=abs(box(q,vec2(s*.15,s*.34),s*.15));
    e*=1.-(1.-smoothstep(.006,.017,ad))*.85;
    float band=1.-smoothstep(.0035,.0085,ad);
    float sheen=.45+.55*sin(q.y/s*7.-t*(1.1+2.2*h)+fi*1.1);
    e+=mix(tint,vec3(1.),.35*sheen)*band*(.55+.6*sheen)*(.8+.4*h);
    e+=tint*.01/(ad+.01)*.07;
  }
  e+=tint*exp(-d0*d0*14.)*(.12+.12*h);
  e*=fall(1.2,.2,d0);
  gl_FragColor=vec4(finish(e,0.,vec3(0.)),1.);
}`,
  horizon: `
void main(){
  vec2 uv=(gl_FragCoord.xy-vec2(r.x*.7,r.y*.62))/r.y;
  float R=.15*min(1.,r.x/r.y);
  float d=length(uv);
  vec3 e=vec3(0.);
  vec2 lens=uv*(1.+(.045+.03*h)/(d*d+.012));
  for(int l=0;l<3;l++){
    float z=float(l)+1.;
    vec2 g=lens*(7.*z)+vec2(t*(.02+.25*h)*z,0.);
    vec2 id=floor(g);
    vec2 f=fract(g)-.5-(vec2(hash(id*1.3),hash(id*1.7))-.5)*.7;
    float on=step(.82,hash(id+z));
    e+=mix(vec3(1.),tint,.5)*fall(.06,0.,length(f))*on*(.5+.5*sin(t*2.+hash(id)*30.))*(.7/z);
  }
  vec2 q=rot(-.26)*uv;
  vec2 p=vec2(q.x,q.y*4.);
  float rr=length(p);
  float ang=atan(p.y,p.x);
  float band=smoothstep(R*1.25,R*1.6,rr)*fall(R*3.6,R*1.9,rr);
  float grain=noise(vec2(ang*5.+t*(.6+1.8*h),rr*38.))*.6+noise(vec2(ang*11.-t*(.9+2.2*h),rr*80.))*.4;
  float beam=1.+.8*cos(ang+.3);
  vec3 hotc=mix(tint,vec3(1.,.97,.92),1.-smoothstep(R*1.4,R*2.6,rr));
  vec3 disc=hotc*band*(.35+.95*grain)*beam*(.55+.45*h);
  float front=1.-smoothstep(-.01,.01,q.y);
  float arc=exp(-sq((d-R*1.3)/(.03+.008*h)))*(.3+.7*smoothstep(-.05,.12,q.y));
  e+=hotc*arc*(.6+.4*noise(vec2(atan(uv.y,uv.x)*8.+t*.8,3.)))*(.7+.35*h);
  e+=vec3(1.)*exp(-sq((d-R*1.06)/.0045))*.85;
  e+=disc*(1.-front);
  float hole=1.-smoothstep(R*.96,R*1.03,d);
  e*=1.-hole;
  vec2 s=rot(.72)*uv;
  e+=vec3(1.)*exp(-sq(s.x/.004))*fall(.9,0.,abs(s.y))*.2*(.6+.8*h);
  gl_FragColor=vec4(finish(e,hole,disc*front),1.);
}`,
  prompt: `
void main(){
  float aspect=r.x/r.y;
  vec2 uv=gl_FragCoord.xy/r.y;
  float g=.04;
  vec2 cell=floor(uv/g);
  vec2 f=fract(uv/g)-.5;
  vec2 c=(cell+.5)*g;
  float dotm=fall(.25,.12,length(f));
  float X0=floor(aspect*.34/g);
  float Y0=floor(.88/g);
  vec2 o=(vec2(X0,Y0)+.5)*g;
  float w=fract(t*(.1+.22*h))*1.9;
  float ring=exp(-sq((length(c-o)-w)/.08))*(1.-w/1.9);
  float cycle=mod(t*(1.+1.8*h),15.);
  float row=(Y0-cell.y)*.5;
  float code=0.;
  float head=0.;
  float mark=0.;
  if(row>=0.&&row<5.&&fract(row)<.1&&cell.x<aspect/g-1.){
    float k=floor(row);
    float first=1.-step(.5,k);
    float indent=floor(hash(vec2(k,3.))*3.)*2.*(1.-first);
    float len=4.+floor(hash(vec2(k,7.))*8.);
    float typed=clamp((cycle-k*2.1)*5.,0.,len);
    float x=cell.x-X0-indent-2.*first;
    code=step(0.,x)*step(x,typed-1.);
    float blink=step(.5,fract(t*1.6));
    head=(1.-step(.5,abs(x-typed)))*step(typed,len-.5)*step(.01,typed)*blink;
    mark=first*(1.-step(.5,abs(cell.x-X0)));
  }
  float b=.2+ring*.8+code*.9+mark+head*1.1;
  vec3 e=tint*b*dotm;
  e+=vec3(1.)*(mark+head)*dotm*.35;
  e+=tint*exp(-sq(length(uv-o-vec2(.25,-.2))/.45))*(.16+.08*h);
  gl_FragColor=vec4(finish(e,0.,vec3(0.)),1.);
}`,
  lift: `
vec3 google(float i){
  if(i<.5)return vec3(.26,.52,.96);
  if(i<1.5)return vec3(.92,.26,.21);
  if(i<2.5)return vec3(.98,.74,.02);
  return vec3(.2,.66,.33);
}
vec3 arch(float x){
  float g=clamp(x,0.,1.)*3.;
  vec3 c=mix(google(0.),google(1.),clamp(g,0.,1.));
  c=mix(c,google(2.),clamp(g-1.,0.,1.));
  return mix(c,google(3.),clamp(g-2.,0.,1.));
}
void main(){
  float aspect=r.x/r.y;
  vec2 uv=gl_FragCoord.xy/r.y;
  vec2 o=vec2(aspect*.7,-.42);
  vec2 a=uv-o;
  float ra=length(a);
  float along=atan(a.y,a.x)/3.1416;
  float up=smoothstep(0.,.35,a.y);
  vec3 ac=arch(along);
  vec3 e=ac*exp(-sq((ra-1.-.02*sin(along*9.+t*.8))/(.05+.03*h)))*up*(.38+.3*h);
  e+=mix(tint,ac,.5)*exp(-sq((ra-.8)/.25))*up*.06;
  for(int i=0;i<36;i++){
    float fi=float(i);
    float seed=fract(sin(fi*91.7)*437.5);
    float depth=mod(fi,3.);
    float speed=(.03+.035*depth)*(1.+2.2*h);
    float x=fract(seed*7.13)*aspect+sin(t*.5+fi)*.03*(1.+depth);
    float y=fract(seed*3.7+t*speed*(.6+seed))*1.4-.2;
    float size=.005+.006*depth+.01*fract(seed*5.3);
    vec2 dp=uv-vec2(x,y);
    float tl=(.04+.05*depth)*(.4+h);
    float ty=clamp(-dp.y,0.,tl);
    float td=length(vec2(dp.x,dp.y+ty));
    float trail=exp(-td*td/(size*size*1.2))*(1.-ty/tl)*.35;
    float dd=length(dp);
    float core=fall(size,size*.35,dd);
    float halo=exp(-dd*dd/(size*size*8.))*.3;
    float boost=1.+1.2*exp(-sq((length(vec2(x,y)-o)-1.)/.12));
    e+=google(mod(fi,4.))*(core*.8+halo+trail)*(.35+.3*depth)*(.8+.5*h)*boost;
  }
  gl_FragColor=vec4(finish(e,0.,vec3(0.)),1.);
}`,
};

function toRgb(value, fallback) {
  const hex = String(value || "").trim();
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex);
  if (!match) return fallback;
  let h = match[1];
  if (h.length === 3) h = [...h].map((ch) => ch + ch).join("");
  return [0, 2, 4].map((at) => parseInt(h.slice(at, at + 2), 16) / 255);
}

function mount(canvas) {
  const source = SCENES[canvas.dataset.cardFx];
  const gl = source && canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false });
  if (!gl) return;
  const compile = (type, text) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, text);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) || "shader");
    return shader;
  };
  const program = gl.createProgram();
  gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, HEAD + source));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || "link");
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const at = gl.getAttribLocation(program, "p");
  gl.enableVertexAttribArray(at);
  gl.vertexAttribPointer(at, 2, gl.FLOAT, false, 0, 0);
  const u = Object.fromEntries(["r", "t", "h", "dark", "tint", "ground"].map((name) => [name, gl.getUniformLocation(program, name)]));

  const card = canvas.closest("[data-card]") ?? canvas.parentElement;
  const paint = () => {
    const style = getComputedStyle(card);
    const ground = toRgb(style.getPropertyValue("--surface"), [0.06, 0.05, 0.08]);
    gl.uniform3fv(u.tint, toRgb(style.getPropertyValue("--cap-tint"), [0.8, 0.8, 0.8]));
    gl.uniform3fv(u.ground, ground);
    gl.uniform1f(u.dark, 0.2126 * ground[0] + 0.7152 * ground[1] + 0.0722 * ground[2] < 0.5 ? 1 : 0);
  };
  paint();

  let hover = 0;
  let target = 0;
  card.addEventListener("pointerenter", () => (target = 1));
  card.addEventListener("pointerleave", () => (target = 0));

  const size = () => {
    const ratio = Math.min(1.5, window.devicePixelRatio || 1);
    const width = Math.max(1, Math.round(canvas.clientWidth * ratio));
    const height = Math.max(1, Math.round(canvas.clientHeight * ratio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }
    gl.uniform2f(u.r, width, height);
  };
  const seed = Math.random() * 60;
  let visible = false;
  let raf = 0;
  let last = performance.now();
  let clock = seed;
  const draw = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    hover += (target - hover) * Math.min(1, dt * 5);
    clock += dt * (reduced ? 0 : 1);
    size();
    gl.uniform1f(u.t, clock);
    gl.uniform1f(u.h, hover);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (visible && !document.hidden && !reduced) raf = requestAnimationFrame(draw);
    else raf = 0;
  };
  const wake = () => {
    if (!raf && visible && !document.hidden) {
      last = performance.now();
      raf = requestAnimationFrame(draw);
    }
  };
  new IntersectionObserver((entries) => {
    visible = entries.some((entry) => entry.isIntersecting);
    if (visible) wake();
  }).observe(canvas);
  document.addEventListener("visibilitychange", wake);
  window.addEventListener("resize", () => requestAnimationFrame(draw));
  // The theme toggle swaps --surface: repaint with the new ground.
  new MutationObserver(() => requestAnimationFrame(() => {
    paint();
    draw(performance.now());
  })).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  requestAnimationFrame(draw);
}

for (const canvas of document.querySelectorAll("canvas[data-card-fx]")) {
  try {
    mount(canvas);
  } catch (error) {
    console.error("[card-fx]", canvas.dataset.cardFx, error);
  }
}
