/* main.js — TypePop HD-2D tech demo: "Pip's cozy corner".
 *
 * Technique: 2D pixel-art sprites (nearest-filtered billboards) placed in a
 * real 3D diorama, narrow-FOV camera tilted down, tilt-shift depth of field,
 * bloom, warm/cool cinematic lighting, dust + fireflies, film grade.
 * Inspired by the HD-2D look; every asset here is original.
 */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import {
  TiltShiftShader, GradeShader, makeShaftMaterial, makeFireflyMaterial,
  makeRadialTexture, makeShadowTexture,
  makeWoodTexture, makeWallpaperTexture, makePaintingTexture,
} from './fx.js';

const ASSETS = './assets/';
const lerp = (a, b, k) => a + (b - a) * k;

/* ================================================================ boot */
const host = document.getElementById('app');
const loaderEl = document.getElementById('loader');
const uiEl = document.getElementById('ui');

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
} catch (e) {
  document.getElementById('fallback').style.display = 'flex';
  loaderEl.classList.add('done');
  throw e;
}
const PIXEL_RATIO = Math.min(window.devicePixelRatio || 1, 1.75);
renderer.setPixelRatio(PIXEL_RATIO);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
host.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x2b1e15);

const camera = new THREE.PerspectiveCamera(26, window.innerWidth / window.innerHeight, 0.1, 100);
const CAM_BASE = new THREE.Vector3(0.8, 9.0, 15.0);
const LOOK_BASE = new THREE.Vector3(0.2, 1.5, -1.6);
camera.position.copy(CAM_BASE);
camera.lookAt(LOOK_BASE);

/* ================================================================ textures */
const manager = new THREE.LoadingManager();
const texLoader = new THREE.TextureLoader(manager);
function loadSprite(name) {
  const t = texLoader.load(ASSETS + name);
  t.colorSpace = THREE.SRGBColorSpace;
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.anisotropy = 4;
  return t;
}
const texIdle  = loadSprite('pip_idle.png');
const texBlink = loadSprite('pip_blink.png');
const texHappy = loadSprite('pip_happy.png');
const texChair = loadSprite('armchair.png');
const texPlant = loadSprite('plant.png');
const texLamp  = loadSprite('floor_lamp.png');
const texRug   = loadSprite('rug.png');

const woodTex = makeWoodTexture();  woodTex.repeat.set(2.2, 1.8);
const wallTex = makeWallpaperTexture(); wallTex.repeat.set(3, 1.6);
const paintTex = makePaintingTexture();
const radialTex = makeRadialTexture();
const shadowTex = makeShadowTexture();

/* ================================================================ room shell */
const ROOM = { w: 12, d: 10, h: 6.5 };

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(ROOM.w, ROOM.d),
  new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.5, metalness: 0.08 })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const wallMat = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.95 });
const backWall = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.w, ROOM.h), wallMat);
backWall.position.set(0, ROOM.h / 2, -ROOM.d / 2);
backWall.receiveShadow = true;
scene.add(backWall);

const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.d, ROOM.h), wallMat);
leftWall.rotation.y = Math.PI / 2;
leftWall.position.set(-ROOM.w / 2, ROOM.h / 2, 0);
leftWall.receiveShadow = true;
scene.add(leftWall);

// baseboards
const bbMat = new THREE.MeshStandardMaterial({ color: 0x6e4a2e, roughness: 0.7 });
const bb1 = new THREE.Mesh(new THREE.BoxGeometry(ROOM.w, 0.35, 0.12), bbMat);
bb1.position.set(0, 0.175, -ROOM.d / 2 + 0.06);
const bb2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.35, ROOM.d), bbMat);
bb2.position.set(-ROOM.w / 2 + 0.06, 0.175, 0);
scene.add(bb1, bb2);

/* ================================================================ window */
const WIN = { x: 2.3, y: 3.7, w: 3.1, h: 3.7, bar: 0.28 };
const winG = new THREE.Group();
winG.position.set(WIN.x, WIN.y, -ROOM.d / 2 + 0.03);
const frameMat = new THREE.MeshStandardMaterial({ color: 0x5d3f27, roughness: 0.6 });
function frameBox(w, h, d, x, y, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), frameMat);
  m.position.set(x, y, z);
  m.castShadow = true;
  winG.add(m);
  return m;
}
frameBox(WIN.w, WIN.bar, 0.22, 0,  WIN.h / 2 - WIN.bar / 2);
frameBox(WIN.w, WIN.bar, 0.22, 0, -WIN.h / 2 + WIN.bar / 2);
frameBox(WIN.bar, WIN.h - 2 * WIN.bar, 0.22, -WIN.w / 2 + WIN.bar / 2, 0);
frameBox(WIN.bar, WIN.h - 2 * WIN.bar, 0.22,  WIN.w / 2 - WIN.bar / 2, 0);
frameBox(0.12, WIN.h - 2 * WIN.bar, 0.1, 0, 0);
frameBox(WIN.w - 2 * WIN.bar, 0.12, 0.1, 0, 0.15);
frameBox(WIN.w + 0.5, 0.16, 0.55, 0, -WIN.h / 2 - 0.08, 0.16); // sill

const DAY_PANE = new THREE.Color(0xffe9bd), NIGHT_PANE = new THREE.Color(0xa9c4f5);
const paneMat = new THREE.MeshBasicMaterial({ color: DAY_PANE.clone() });
const panes = new THREE.Mesh(new THREE.PlaneGeometry(WIN.w - 2 * WIN.bar, WIN.h - 2 * WIN.bar), paneMat);
panes.position.z = -0.06;
winG.add(panes);
scene.add(winG);

// halo glow behind the window (feeds the bloom pass)
const windowGlow = new THREE.Sprite(new THREE.SpriteMaterial({
  map: radialTex, color: DAY_PANE.clone(), transparent: true,
  opacity: 0.32, blending: THREE.AdditiveBlending, depthWrite: false,
}));
windowGlow.position.set(WIN.x, WIN.y, -ROOM.d / 2 + 0.4);
windowGlow.scale.set(7.5, 7.5, 1);
windowGlow.renderOrder = 4;
scene.add(windowGlow);

/* ================================================================ light shaft */
const shaftMat = makeShaftMaterial();
const shaftOrigin = new THREE.Vector3(WIN.x, WIN.y - 0.3, -ROOM.d / 2 + 0.1);
const shaftTarget = new THREE.Vector3(0.5, 0, 0.6);
const shaftDir = shaftOrigin.clone().sub(shaftTarget); // points back up to window
const shaftLen = shaftDir.length() + 1.2;
const shaftMid = shaftOrigin.clone().add(shaftTarget).multiplyScalar(0.5);
const shaftQuat = new THREE.Quaternion().setFromUnitVectors(
  new THREE.Vector3(0, 1, 0), shaftDir.clone().normalize());
for (const roll of [0, Math.PI / 2]) {
  const geo = new THREE.PlaneGeometry(3.0, shaftLen);
  const m = new THREE.Mesh(geo, shaftMat);
  m.position.copy(shaftMid);
  m.quaternion.copy(shaftQuat);
  m.rotateY(roll); // second plane crosses the first for volume
  m.renderOrder = 5;
  scene.add(m);
}

// warm pool where the shaft lands
const patchMat = new THREE.MeshBasicMaterial({
  map: radialTex, color: new THREE.Color(0xffc98a), transparent: true,
  opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false,
});
const patchGeo = new THREE.PlaneGeometry(3.8, 5.4);
patchGeo.rotateX(-Math.PI / 2);
const patch = new THREE.Mesh(patchGeo, patchMat);
patch.position.set(0.7, 0.025, 0.1);
patch.rotation.y = -0.31;
patch.renderOrder = 3;
scene.add(patch);

/* ================================================================ furniture */
const billboards = [];
function addBillboard(tex, height, x, z, opts = {}) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({
    map: tex, transparent: true, depthWrite: false, color: 0xffffff,
  }));
  s.position.set(x, height / 2 + (opts.lift || 0), z);
  s.renderOrder = 2;
  scene.add(s);
  billboards.push({ sprite: s, height });
  return s;
}
function contactShadow(x, z, w, opacity = 0.5) {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(w, w * 0.55),
    new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity, depthWrite: false })
  );
  m.rotation.x = -Math.PI / 2;
  m.position.set(x, 0.015, z);
  m.renderOrder = 1;
  scene.add(m);
  return m;
}

addBillboard(texChair, 2.15, -3.2, -2.3);
contactShadow(-3.2, -2.3, 3.0);
addBillboard(texPlant, 2.6, 4.25, -3.1);
contactShadow(4.25, -3.1, 1.9);
const lampSprite = addBillboard(texLamp, 3.1, -4.55, -0.9);
contactShadow(-4.55, -0.9, 1.5);

// lamp halo, only visible at night
const lampGlow = new THREE.Sprite(new THREE.SpriteMaterial({
  map: radialTex, color: new THREE.Color(0xffc06a), transparent: true,
  opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false,
}));
lampGlow.position.set(-4.55, 2.72, -0.9);
lampGlow.scale.set(2.6, 2.6, 1);
lampGlow.renderOrder = 4;
scene.add(lampGlow);

// rug (flat decal)
const rug = new THREE.Mesh(
  new THREE.CircleGeometry(1.9, 48),
  new THREE.MeshStandardMaterial({ map: texRug, transparent: true, roughness: 0.95 })
);
rug.rotation.x = -Math.PI / 2;
rug.position.set(-0.5, 0.012, 1.2);
rug.receiveShadow = true;
scene.add(rug);

// framed pixel painting on the back wall
const paintFrame = new THREE.Mesh(
  new THREE.BoxGeometry(1.7, 1.3, 0.1),
  new THREE.MeshStandardMaterial({ color: 0x4a3320, roughness: 0.6 })
);
paintFrame.position.set(-2.7, 3.9, -ROOM.d / 2 + 0.06);
scene.add(paintFrame);
const painting = new THREE.Mesh(
  new THREE.PlaneGeometry(1.5, 1.1),
  new THREE.MeshBasicMaterial({ map: paintTex })
);
painting.position.set(-2.7, 3.9, -ROOM.d / 2 + 0.12);
scene.add(painting);

/* ================================================================ Pip */
const PIP = { x: 0.75, z: 1.35, baseY: 0.78, h: 1.5 };
const pip = new THREE.Sprite(new THREE.SpriteMaterial({
  map: texIdle, transparent: true, depthWrite: false, color: 0xffffff,
}));
pip.position.set(PIP.x, PIP.baseY, PIP.z);
pip.renderOrder = 3;
scene.add(pip);

// fake mirror image under the floor (cheap, pretty)
const pipRefl = new THREE.Sprite(new THREE.SpriteMaterial({
  map: texIdle, transparent: true, depthWrite: false, opacity: 0.15, color: 0xcfd8ee,
}));
pipRefl.renderOrder = 1;
scene.add(pipRefl);

// blob shadow that breathes with the hop
const pipShadow = new THREE.Mesh(
  new THREE.PlaneGeometry(1.5, 0.8),
  new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0.42, depthWrite: false })
);
pipShadow.rotation.x = -Math.PI / 2;
pipShadow.position.set(PIP.x, 0.03, PIP.z);
pipShadow.renderOrder = 1;
scene.add(pipShadow);

/* ================================================================ lights */
const hemi = new THREE.HemisphereLight(0xfff0d8, 0x8a6f52, 0.6);
scene.add(hemi);

const sun = new THREE.DirectionalLight(0xffd9a4, 2.6);
sun.position.set(5.5, 8.5, 3.5);
sun.target.position.set(-0.5, 0, -1.5);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.left = -8; sun.shadow.camera.right = 8;
sun.shadow.camera.top = 8; sun.shadow.camera.bottom = -8;
sun.shadow.camera.near = 1; sun.shadow.camera.far = 25;
sun.shadow.bias = -0.0004;
scene.add(sun, sun.target);

const lampLight = new THREE.PointLight(0xffb45e, 0, 13, 2);
lampLight.position.set(-4.55, 2.7, -0.9);
scene.add(lampLight);

/* ================================================================ particles */
// dust motes drifting inside the shaft
const DUST_N = 240;
const dustGeo = new THREE.BufferGeometry();
const dustPos = new Float32Array(DUST_N * 3);
const dustSpd = new Float32Array(DUST_N);
const dustPh = new Float32Array(DUST_N);
for (let i = 0; i < DUST_N; i++) {
  dustPos[i*3]   = -0.2 + Math.random() * 2.8;
  dustPos[i*3+1] = 0.15 + Math.random() * 4.4;
  dustPos[i*3+2] = -4.6 + Math.random() * 5.4;
  dustSpd[i] = 0.05 + Math.random() * 0.14;
  dustPh[i] = Math.random() * Math.PI * 2;
}
dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
const dustMat = new THREE.PointsMaterial({
  size: 0.055, map: radialTex, transparent: true, opacity: 0.55,
  color: 0xffe6b8, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
});
const dust = new THREE.Points(dustGeo, dustMat);
dust.renderOrder = 6;
scene.add(dust);

// fireflies (night)
const { geo: flyGeo, mat: flyMat } = makeFireflyMaterial();
const flies = new THREE.Points(flyGeo, flyMat);
flies.renderOrder = 6;
scene.add(flies);

// tap sparkles (pooled burst system, additive => fade by dimming color)
const SPARK_N = 90;
const sparkGeo = new THREE.BufferGeometry();
const sparkPos = new Float32Array(SPARK_N * 3);
const sparkCol = new Float32Array(SPARK_N * 3);
const sparkVel = new Float32Array(SPARK_N * 3);
const sparkLife = new Float32Array(SPARK_N);
const sparkMax = new Float32Array(SPARK_N);
sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
sparkGeo.setAttribute('color', new THREE.BufferAttribute(sparkCol, 3));
const sparkMat = new THREE.PointsMaterial({
  size: 0.13, map: radialTex, vertexColors: true, transparent: true,
  depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
});
const sparks = new THREE.Points(sparkGeo, sparkMat);
sparks.renderOrder = 7;
sparks.frustumCulled = false;
scene.add(sparks);
let sparkCursor = 0;
const SPARK_BASE = new THREE.Color(0xffe9a8);
function burst(x, y, z, n, spread = 1.7, up = 2.4) {
  for (let k = 0; k < n; k++) {
    const i = sparkCursor; sparkCursor = (sparkCursor + 1) % SPARK_N;
    sparkPos[i*3]   = x + (Math.random() - 0.5) * 0.6;
    sparkPos[i*3+1] = y + Math.random() * 0.3;
    sparkPos[i*3+2] = z + (Math.random() - 0.5) * 0.6;
    const a = Math.random() * Math.PI * 2, r = (0.4 + Math.random() * 0.9) * spread;
    sparkVel[i*3]   = Math.cos(a) * r;
    sparkVel[i*3+1] = up * (0.5 + Math.random() * 0.9);
    sparkVel[i*3+2] = Math.sin(a) * r;
    sparkLife[i] = sparkMax[i] = 0.6 + Math.random() * 0.5;
  }
}

/* ================================================================ post chain */
const rt = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
  samples: 4, type: THREE.HalfFloatType,
});
const composer = new EffectComposer(renderer, rt);
composer.setPixelRatio(PIXEL_RATIO);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight), 0.45, 0.55, 0.78);
composer.addPass(bloom);
const tiltPass = new ShaderPass(TiltShiftShader);
composer.addPass(tiltPass);
composer.addPass(new OutputPass());
const gradePass = new ShaderPass(GradeShader);
composer.addPass(gradePass);

/* ================================================================ day / night */
const C = (h) => new THREE.Color(h);
const ENV = {
  dayBg: C(0x2b1e15), nightBg: C(0x04060d),
  daySky: C(0xfff0d8), nightSky: C(0x33477a),
  dayGnd: C(0x8a6f52), nightGnd: C(0x0d0f16),
  daySun: C(0xffd9a4), nightSun: C(0x8fb4ff),
  dayShaft: C(0xffdca8), nightShaft: C(0x9db9ff),
  dayPatch: C(0xffc98a), nightPatch: C(0x7d94c9),
  dayTint: C(0xffffff), nightTint: C(0x9db1dd),
};
let dayTarget = 1, dayMix = 1; // 1 = full day, 0 = full night
const _c = new THREE.Color();
function applyEnv(m) {
  hemi.intensity = lerp(0.34, 0.6, m);
  hemi.color.lerpColors(ENV.nightSky, ENV.daySky, m);
  hemi.groundColor.lerpColors(ENV.nightGnd, ENV.dayGnd, m);
  sun.intensity = lerp(0.55, 2.6, m);
  sun.color.lerpColors(ENV.nightSun, ENV.daySun, m);
  lampLight.intensity = lerp(26, 0, m);
  paneMat.color.lerpColors(NIGHT_PANE, DAY_PANE, m);
  windowGlow.material.color.lerpColors(ENV.nightShaft, ENV.dayShaft, m);
  windowGlow.material.opacity = lerp(0.5, 0.32, m);
  shaftMat.uniforms.intensity.value = lerp(0.10, 0.22, m);
  shaftMat.uniforms.color.value.lerpColors(ENV.nightShaft, ENV.dayShaft, m);
  patchMat.color.lerpColors(ENV.nightPatch, ENV.dayPatch, m);
  patchMat.opacity = lerp(0.30, 0.5, m);
  bloom.strength = lerp(0.85, 0.45, m);
  scene.background.lerpColors(ENV.nightBg, ENV.dayBg, m);
  _c.lerpColors(ENV.nightTint, ENV.dayTint, m);
  pip.material.color.copy(_c);
  lampSprite.material.color.copy(_c);
  pipRefl.material.color.copy(_c).multiplyScalar(0.6);
  dustMat.opacity = lerp(0.30, 0.55, m);
  flyMat.uniforms.night.value = 1 - m;
  lampGlow.material.opacity = (1 - m) * 0.6;
  renderer.toneMappingExposure = lerp(1.04, 1.14, m);
}

const dnToggle = document.getElementById('dnToggle');
const optDay = dnToggle.querySelector('.opt.day');
const optNight = dnToggle.querySelector('.opt.night');
dnToggle.addEventListener('click', () => {
  dayTarget = dayTarget > 0.5 ? 0 : 1;
  optDay.classList.toggle('active', dayTarget > 0.5);
  optNight.classList.toggle('active', dayTarget < 0.5);
});

/* ================================================================ camera feel */
const pointer = { x: 0, y: 0 };
const parallax = new THREE.Vector3();
const parallaxGoal = new THREE.Vector3();
const lookCur = LOOK_BASE.clone();
window.addEventListener('pointermove', (e) => {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  parallaxGoal.set(pointer.x * 0.9, -pointer.y * 0.55, 0);
});
function updateCamera(dt, t) {
  parallax.lerp(parallaxGoal, 1 - Math.exp(-dt * 3));
  camera.position.set(
    CAM_BASE.x + Math.sin(t * 0.11) * 0.35 + parallax.x,
    CAM_BASE.y + Math.sin(t * 0.147 + 1.3) * 0.22 + parallax.y,
    CAM_BASE.z + Math.sin(t * 0.09 + 0.6) * 0.15
  );
  lookCur.copy(LOOK_BASE).addScaledVector(parallax, 0.35);
  camera.lookAt(lookCur);
}

/* ================================================================ Pip behaviour */
const pipSt = {
  hopT: -1, lastHt: 0, landed: false,
  happyUntil: -1, nextBlink: 2.5, blinkUntil: -1,
};
function keyTrack(t, keys) {
  if (t <= keys[0][0]) return [keys[0][1], keys[0][2]];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const a = keys[i - 1], b = keys[i];
      let k = (t - a[0]) / (b[0] - a[0]);
      k = k * k * (3 - 2 * k);
      return [a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
    }
  }
  const l = keys[keys.length - 1];
  return [l[1], l[2]];
}
// [time, scaleY, scaleX]
const HOP_KEYS = [
  [0.00, 1.00, 1.00], [0.10, 0.66, 1.26], [0.30, 1.10, 0.94],
  [0.55, 1.16, 0.90], [0.85, 1.12, 0.92], [1.00, 0.72, 1.22], [1.28, 1.00, 1.00],
];
function triggerHop(now) {
  if (pipSt.hopT >= 0) return;
  pipSt.hopT = 0; pipSt.lastHt = 0; pipSt.landed = false;
  pipSt.happyUntil = now + 2.2;
  burst(PIP.x, PIP.baseY + 0.4, PIP.z, 22, 1.4, 2.0);
}
function updatePip(dt, t) {
  let y = PIP.baseY + Math.sin(t * 2.1) * 0.035;
  let sy = 1 - Math.sin(t * 2.1) * 0.014;
  let sx = 1 + Math.sin(t * 2.1) * 0.014;

  if (pipSt.hopT >= 0) {
    pipSt.hopT += dt / 0.9;
    const ht = pipSt.hopT;
    if (ht >= 1.28) {
      pipSt.hopT = -1;
    } else {
      if (pipSt.lastHt < 0.10 && ht >= 0.10) burst(PIP.x, 0.25, PIP.z, 18, 1.8, 1.6);
      if (pipSt.lastHt < 1.00 && ht >= 1.00) burst(PIP.x, 0.25, PIP.z, 26, 2.0, 2.2);
      pipSt.lastHt = ht;
      if (ht <= 1) y = PIP.baseY + 1.55 * 4 * ht * (1 - ht);
      [sy, sx] = keyTrack(Math.min(ht, 1.28), HOP_KEYS);
    }
  }

  let tex = texIdle;
  if (t < pipSt.happyUntil) tex = texHappy;
  else if (pipSt.hopT < 0) {
    if (t > pipSt.nextBlink) { pipSt.blinkUntil = t + 0.13; pipSt.nextBlink = t + 2.4 + Math.random() * 3.4; }
    if (t < pipSt.blinkUntil) tex = texBlink;
  }
  if (pip.material.map !== tex) { pip.material.map = tex; pipRefl.material.map = tex; }

  pip.position.set(PIP.x, y, PIP.z);
  pip.scale.set(PIP.h * pipAspect * sx, PIP.h * sy, 1);

  // reflection mirrors the pose
  pipRefl.position.set(PIP.x, -y - 0.02, PIP.z);
  pipRefl.scale.set(PIP.h * pipAspect * sx, -PIP.h * sy, 1);

  // blob shadow shrinks as Pip rises
  const airK = Math.min(1, Math.max(0, (y - PIP.baseY) / 1.55));
  pipShadow.material.opacity = 0.42 * (1 - airK * 0.55);
  const ss = 1 - airK * 0.35;
  pipShadow.scale.set(ss, ss, 1);
}
let pipAspect = 1;

// tap-to-boop
const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();
let downAt = 0, downX = 0, downY = 0;
window.addEventListener('pointerdown', (e) => {
  downAt = performance.now(); downX = e.clientX; downY = e.clientY;
});
window.addEventListener('pointerup', (e) => {
  const moved = Math.hypot(e.clientX - downX, e.clientY - downY);
  if (moved > 10 || performance.now() - downAt > 450) return;
  ndc.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  if (ray.intersectObject(pip).length) triggerHop(clock.elapsedTime);
});

/* ================================================================ loop */
const clock = new THREE.Clock();
function updateDust(dt, t) {
  const p = dustGeo.attributes.position.array;
  for (let i = 0; i < DUST_N; i++) {
    let y = p[i*3+1] + dustSpd[i] * dt;
    p[i*3] += Math.sin(t * 0.7 + dustPh[i]) * 0.10 * dt;
    if (y > 4.6) {
      y = 0.15;
      p[i*3] = -0.2 + Math.random() * 2.8;
      p[i*3+2] = -4.6 + Math.random() * 5.4;
    }
    p[i*3+1] = y;
  }
  dustGeo.attributes.position.needsUpdate = true;
}
function updateSparks(dt) {
  const p = sparkGeo.attributes.position.array;
  const c = sparkGeo.attributes.color.array;
  let any = false;
  for (let i = 0; i < SPARK_N; i++) {
    if (sparkLife[i] <= 0) continue;
    any = true;
    sparkLife[i] -= dt;
    const k = Math.max(0, sparkLife[i] / sparkMax[i]);
    sparkVel[i*3+1] -= 4.5 * dt;
    p[i*3]   += sparkVel[i*3] * dt;
    p[i*3+1] += sparkVel[i*3+1] * dt;
    p[i*3+2] += sparkVel[i*3+2] * dt;
    c[i*3] = SPARK_BASE.r * k; c[i*3+1] = SPARK_BASE.g * k; c[i*3+2] = SPARK_BASE.b * k;
  }
  if (any) {
    sparkGeo.attributes.position.needsUpdate = true;
    sparkGeo.attributes.color.needsUpdate = true;
  }
}

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  dayMix += (dayTarget - dayMix) * (1 - Math.exp(-dt * 2.0));
  applyEnv(dayMix);

  shaftMat.uniforms.time.value = t;
  flyMat.uniforms.time.value = t;
  gradePass.uniforms.time.value = t;

  updateCamera(dt, t);
  updatePip(dt, t);
  updateDust(dt, t);
  updateSparks(dt);

  composer.render();
}

/* ================================================================ resize */
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  // widen the lens on portrait phones so the diorama doesn't crop to nothing
  camera.fov = camera.aspect < 0.8 ? 34 : 26;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});
// apply the responsive fov once at boot
camera.fov = camera.aspect < 0.8 ? 34 : 26;
camera.updateProjectionMatrix();

/* ================================================================ go */
manager.onLoad = () => {
  // fix billboard aspects now that images are decoded
  for (const b of billboards) {
    const img = b.sprite.material.map.image;
    if (img && img.width) {
      const a = img.width / img.height;
      b.sprite.scale.set(b.height * a, b.height, 1);
    }
  }
  const img = texIdle.image;
  if (img && img.width) pipAspect = img.width / img.height;

  applyEnv(1);
  composer.render(); // warm up
  loaderEl.classList.add('done');
  uiEl.classList.add('on');
  animate();
};
manager.onError = (url) => console.warn('[hd2d] texture failed:', url);

// safety: never leave the loader up forever (e.g. CDN hiccup)
setTimeout(() => {
  if (!loaderEl.classList.contains('done')) {
    console.warn('[hd2d] load timeout — starting anyway');
    loaderEl.classList.add('done');
    uiEl.classList.add('on');
    animate();
  }
}, 15000);
