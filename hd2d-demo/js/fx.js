/* fx.js — shaders + procedural pixel-art textures for the HD-2D diorama.
   All GLSL is written for WebGL2 via three.js ShaderPass/ShaderMaterial. */
import * as THREE from 'three';

/* ------------------------------------------------------------------ */
/* Tilt-shift depth of field. Sharp horizontal band at `focus` (0..1   */
/* in screen Y); everything above/below melts into blur. This is the   */
/* signature miniature-diorama cue of the HD-2D look.                 */
/* ------------------------------------------------------------------ */
export const TiltShiftShader = {
  uniforms: {
    tDiffuse: { value: null },
    focus:   { value: 0.30 },   // vertical centre of the sharp band (sits on Pip)
    range:   { value: 0.16 },   // half-width of the sharp band
    maxBlur: { value: 0.0060 }, // blur radius in UV at full defocus
  },
  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse;
    uniform float focus, range, maxBlur;
    varying vec2 vUv;

    void main() {
      float d = abs(vUv.y - focus);
      // circle of confusion: 0 inside the band, ramps up outside it
      float coc = smoothstep(range, range * 2.4, d) * maxBlur;

      // 9-tap gaussian, offsets scaled by the CoC
      vec3 c = texture2D(tDiffuse, vUv).rgb * 0.227027027;
      vec2 o1 = vec2(1.3843 * coc, 0.0);
      vec2 o2 = vec2(3.2308 * coc, 0.0);
      vec2 o3 = vec2(0.0, 1.3843 * coc);
      vec2 o4 = vec2(0.0, 3.2308 * coc);
      c += texture2D(tDiffuse, vUv + o1.xy).rgb * 0.100000000;
      c += texture2D(tDiffuse, vUv - o1.xy).rgb * 0.100000000;
      c += texture2D(tDiffuse, vUv + o2.xy).rgb * 0.070270270;
      c += texture2D(tDiffuse, vUv - o2.xy).rgb * 0.070270270;
      c += texture2D(tDiffuse, vUv + o3.yx).rgb * 0.100000000;
      c += texture2D(tDiffuse, vUv - o3.yx).rgb * 0.100000000;
      c += texture2D(tDiffuse, vUv + o4.yx).rgb * 0.070270270;
      c += texture2D(tDiffuse, vUv - o4.yx).rgb * 0.070270270;
      gl_FragColor = vec4(c, 1.0);
    }
  `,
};

/* ------------------------------------------------------------------ */
/* Final grade: vignette + warm-highlights/teal-shadows color grade +  */
/* gentle saturation lift + animated film grain. Runs after OutputPass */
/* so it works in display (sRGB) space.                                */
/* ------------------------------------------------------------------ */
export const GradeShader = {
  uniforms: {
    tDiffuse:   { value: null },
    time:       { value: 0 },
    vignette:   { value: 0.42 },
    grain:      { value: 0.028 },
    saturation: { value: 1.10 },
  },
  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse;
    uniform float time, vignette, grain, saturation;
    varying vec2 vUv;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7)) + time * 13.0) * 43758.5453);
    }

    void main() {
      vec3 c = texture2D(tDiffuse, vUv).rgb;
      float lum = dot(c, vec3(0.299, 0.587, 0.114));

      // warm highlights, teal shadows
      c += vec3(0.055, 0.018, -0.030) * smoothstep(0.45, 1.0, lum);
      c += vec3(-0.020, 0.020, 0.055) * (1.0 - smoothstep(0.0, 0.55, lum));

      // saturation lift
      c = mix(vec3(lum), c, saturation);

      // vignette
      vec2 q = vUv - 0.5;
      float vig = 1.0 - vignette * smoothstep(0.18, 0.72, length(q) * 1.35);
      c *= vig;

      // film grain
      c += (hash(vUv * vec2(1920.0, 1080.0)) - 0.5) * grain;

      gl_FragColor = vec4(c, 1.0);
    }
  `,
};

/* ------------------------------------------------------------------ */
/* Volumetric-feel light shaft: additive gradient with slow drifting   */
/* noise so the beam feels alive. uv.y = 1 at the window end.          */
/* ------------------------------------------------------------------ */
export function makeShaftMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {
      time:      { value: 0 },
      color:     { value: new THREE.Color(0xffdca8) },
      intensity: { value: 0.22 },
    },
    vertexShader: /* glsl */`
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */`
      uniform float time, intensity;
      uniform vec3 color;
      varying vec2 vUv;

      float n(vec2 p) {
        return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453);
      }
      float noise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(n(i), n(i + vec2(1,0)), u.x),
                   mix(n(i + vec2(0,1)), n(i + vec2(1,1)), u.x), u.y);
      }

      void main() {
        // fade along the beam (bright at window, dissolving toward floor)
        float along = pow(vUv.y, 1.6);
        // soft edges across the beam
        float across = pow(1.0 - abs(vUv.x - 0.5) * 2.0, 1.8);
        // drifting wisps
        float w = noise(vec2(vUv.x * 5.0, vUv.y * 9.0 - time * 0.22)) * 0.55 + 0.45;
        float a = along * across * w * intensity;
        gl_FragColor = vec4(color, a);
      }
    `,
  });
}

/* ------------------------------------------------------------------ */
/* Fireflies: warm drifting points that blink individually, faded in   */
/* by the `night` uniform.                                             */
/* ------------------------------------------------------------------ */
export function makeFireflyMaterial() {
  const geo = new THREE.BufferGeometry();
  const COUNT = 42;
  const pos = new Float32Array(COUNT * 3);
  const phase = new Float32Array(COUNT);
  const speed = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    pos[i * 3]     = -5.5 + Math.random() * 11;
    pos[i * 3 + 1] = 0.4 + Math.random() * 3.6;
    pos[i * 3 + 2] = -4.5 + Math.random() * 8.5;
    phase[i] = Math.random() * Math.PI * 2;
    speed[i] = 1.2 + Math.random() * 2.2;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
  geo.setAttribute('aSpeed', new THREE.BufferAttribute(speed, 1));

  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      time:  { value: 0 },
      night: { value: 0 },
      color: { value: new THREE.Color(0xffe28a) },
    },
    vertexShader: /* glsl */`
      attribute float aPhase;
      attribute float aSpeed;
      uniform float time;
      varying float vTwinkle;
      void main() {
        vec3 p = position;
        p.x += sin(time * 0.35 + aPhase * 2.0) * 0.35;
        p.y += sin(time * 0.5 + aPhase) * 0.28;
        p.z += cos(time * 0.3 + aPhase * 1.7) * 0.35;
        vTwinkle = 0.35 + 0.65 * pow(0.5 + 0.5 * sin(time * aSpeed + aPhase * 3.0), 2.0);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = 90.0 * vTwinkle / -mv.z;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */`
      uniform vec3 color;
      uniform float night;
      varying float vTwinkle;
      void main() {
        vec2 q = gl_PointCoord - 0.5;
        float d = length(q);
        float a = smoothstep(0.5, 0.05, d) * vTwinkle * night;
        gl_FragColor = vec4(color, a);
      }
    `,
  });
  return { geo, mat };
}

/* Soft radial sprite texture (dust, sparkles, glows) */
export function makeRadialTexture(inner = 'rgba(255,255,255,1)', size = 64) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  grad.addColorStop(0, inner);
  grad.addColorStop(0.4, inner.replace(/[\d.]+\)$/, '0.5)'));
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* Elliptical contact shadow texture */
export function makeShadowTexture(size = 128) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  grad.addColorStop(0, 'rgba(0,0,0,0.55)');
  grad.addColorStop(0.6, 'rgba(0,0,0,0.28)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grad;
  g.save();
  g.translate(size/2, size/2);
  g.scale(1, 0.55);
  g.translate(-size/2, -size/2);
  g.fillRect(0, 0, size, size);
  g.restore();
  return new THREE.CanvasTexture(c);
}

/* ------------------------------------------------------------------ */
/* Procedural pixel-art textures, drawn on a tiny grid then upscaled   */
/* with nearest-neighbour so every pixel stays crisp.                 */
/* ------------------------------------------------------------------ */
function pixelCanvas(grid) {
  const c = document.createElement('canvas');
  c.width = c.height = grid;
  const g = c.getContext('2d');
  const img = g.createImageData(grid, grid);
  const px = (x, y, r, gg, b, a = 255) => {
    if (x < 0 || y < 0 || x >= grid || y >= grid) return;
    const i = (y * grid + x) * 4;
    img.data[i] = r; img.data[i+1] = gg; img.data[i+2] = b; img.data[i+3] = a;
  };
  return { px, commit() {
    g.putImageData(img, 0, 0);
    const out = document.createElement('canvas');
    out.width = out.height = 512;
    const og = out.getContext('2d');
    og.imageSmoothingEnabled = false;
    og.drawImage(c, 0, 0, 512, 512);
    const t = new THREE.CanvasTexture(out);
    t.colorSpace = THREE.SRGBColorSpace;
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.anisotropy = 4;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  }};
}

function hex(h) {
  return [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
}
function shade([r,g,b], f) { return [r*f|0, g*f|0, b*f|0]; }
function vary([r,g,b], amt, rnd) {
  const d = (rnd() - 0.5) * 2 * amt;
  return [Math.max(0,Math.min(255,r+d|0)), Math.max(0,Math.min(255,g+d|0)), Math.max(0,Math.min(255,b+d|0))];
}
/* deterministic PRNG so the room looks the same every load */
function mulberry(seed) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/* Warm wooden plank floor, 128px grid */
export function makeWoodTexture() {
  const G = 128, { px, commit } = pixelCanvas(G);
  const rnd = mulberry(1337);
  const PLANKS = 8, PH = G / PLANKS;
  const base = hex('#9a6a3c'), dark = hex('#5f3c20'), gap = hex('#3d2716');

  for (let p = 0; p < PLANKS; p++) {
    const y0 = p * PH;
    const tint = 0.92 + rnd() * 0.16;
    const bc = shade(base, tint);
    for (let y = 0; y < PH; y++) {
      for (let x = 0; x < G; x++) {
        let c = vary(bc, 9, rnd);
        // grain streaks
        if (rnd() < 0.16) c = vary(shade(bc, 0.82), 6, rnd);
        // occasional knot
        const kx = (p * 53 + 31) % G, ky = y0 + 4 + (p * 29 % (PH - 8));
        const kd = Math.hypot(x - kx, (y0 + y) - ky);
        if (kd < 2.4) c = vary(dark, 8, rnd);
        else if (kd < 3.6) c = vary(shade(bc, 0.9), 6, rnd);
        px(x, y0 + y, ...c);
      }
    }
    // staggered butt joints between plank segments
    const joints = 1 + (p % 2);
    for (let j = 0; j < joints; j++) {
      const jx = (p * 47 + j * 61 + 17) % G;
      for (let y = 0; y < PH; y++) px(jx, y0 + y, ...gap);
    }
    // plank gap + highlight lip
    for (let x = 0; x < G; x++) {
      px(x, y0 + PH - 1, ...gap);
      px(x, y0 + PH - 2, ...shade(gap, 1.5));
      if (y0 > 0) px(x, y0, ...vary(shade(bc, 1.18), 5, rnd));
    }
  }
  return commit();
}

/* Cosy cream wallpaper with a faint diamond motif, 128px grid */
export function makeWallpaperTexture() {
  const G = 128, { px, commit } = pixelCanvas(G);
  const rnd = mulberry(777);
  const base = hex('#e6d3ae'), motif = hex('#d9bf92'), stripe = hex('#ecd9b6');
  for (let y = 0; y < G; y++) {
    for (let x = 0; x < G; x++) {
      let c = vary(base, 4, rnd);
      if ((x >> 4) % 2 === 0) c = vary(stripe, 3, rnd); // soft vertical stripes
      // diamond motif on a 32px lattice
      const lx = x % 32, ly = y % 32;
      const dd = Math.abs(lx - 16) + Math.abs(ly - 16);
      if (dd === 7 || (dd === 3 && ((lx + ly) % 2 === 0))) c = vary(motif, 4, rnd);
      if (lx === 16 && ly === 16) c = vary(shade(motif, 0.92), 3, rnd);
      px(x, y, ...c);
    }
  }
  return commit();
}

/* Tiny framed painting: pixel sunset over mountains, 64x48 grid */
export function makePaintingTexture() {
  const W = 64, H = 48;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  const img = g.createImageData(W, H);
  const rnd = mulberry(42);
  const sky = [hex('#f7b267'), hex('#f4845f'), hex('#c86b6b'), hex('#7d5a7d')];
  for (let y = 0; y < H; y++) {
    const band = Math.min(3, (y / H * 4) | 0);
    for (let x = 0; x < W; x++) {
      let [r,gg,b] = sky[band];
      const d = (rnd() - 0.5) * 10;
      img.data[(y*W+x)*4]   = r + d;
      img.data[(y*W+x)*4+1] = gg + d;
      img.data[(y*W+x)*4+2] = b + d;
      img.data[(y*W+x)*4+3] = 255;
    }
  }
  const dot = (x, y, col) => {
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const xx = x+dx, yy = y+dy;
      if (xx<0||yy<0||xx>=W||yy>=H) continue;
      const i = (yy*W+xx)*4;
      img.data[i]=col[0]; img.data[i+1]=col[1]; img.data[i+2]=col[2];
    }
  };
  // sun
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (Math.hypot(x - 44, y - 20) < 5) dot(x, y, hex('#ffe9a8'));
  }
  // mountains
  const m1 = hex('#4a3d5e'), m2 = hex('#5e4a6e');
  for (let x = 0; x < W; x++) {
    const h1 = 30 - Math.abs(x - 18) * 0.55;
    const h2 = 34 - Math.abs(x - 46) * 0.7;
    for (let y = 0; y < H; y++) {
      if (y > h1) dot(x, y, m1);
      if (y > h2) dot(x, y, m2);
    }
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  return t;
}
