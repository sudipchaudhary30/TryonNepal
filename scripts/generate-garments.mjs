/**
 * generate-garments.mjs
 * Generates simple but realistic-looking 3D garment GLB files for the AR try-on project.
 * Run with: node generate-garments.mjs
 *
 * Models produced (all CC0 - original work):
 *   oxford_shirt.glb    - Blue oxford t-shirt
 *   himalayan_kurta.glb - Red kurta (longer body)
 *   field_jacket.glb    - Olive hoodie/jacket with long sleeves
 *   daura_suruwal.glb   - Traditional white outfit
 *   sherwani.glb        - Dark formal sherwani
 *   dhaka_set.glb       - Colourful full-body dress set
 *
 * Coordinate system:
 *   Origin (0,0,0) = shoulder/neckline centre (matches Garment3DOverlay anchoring)
 *   Y goes DOWN from there (body extends from y=0 to y=-1)
 */

import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, '../frontend/public/clothes/models');

mkdirSync(OUT_DIR, { recursive: true });

// ─── Helpers ──────────────────────────────────────────────────────────────────
function mat(hex, rough = 0.82, metal = 0.0) {
  return new THREE.MeshStandardMaterial({ color: hex, roughness: rough, metalness: metal });
}

function box(w, h, d, material, px = 0, py = 0, pz = 0, rx = 0, ry = 0, rz = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.position.set(px, py, pz);
  m.rotation.set(rx, ry, rz);
  return m;
}

function cyl(rTop, rBot, h, material, px = 0, py = 0, pz = 0, rx = 0, ry = 0, rz = 0, segs = 10) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, segs), material);
  m.position.set(px, py, pz);
  m.rotation.set(rx, ry, rz);
  return m;
}

function sphere(r, material, px = 0, py = 0, pz = 0, phiStart = 0, phiLen = Math.PI * 2, thetaStart = 0, thetaLen = Math.PI) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10, phiStart, phiLen, thetaStart, thetaLen), material);
  m.position.set(px, py, pz);
  return m;
}

// ─── T-shirt / Oxford Shirt ───────────────────────────────────────────────────
function makeTShirt(bodyColor, collarColor, sleeveLengthFactor = 1.0) {
  const scene = new THREE.Scene();
  const primary = mat(bodyColor);
  const collar  = mat(collarColor, 0.7);

  const bodyH   = 0.65;
  const bodyW   = 0.54;
  const bodyD   = 0.18;
  const bodyY   = -bodyH / 2;

  // Torso
  scene.add(box(bodyW, bodyH, bodyD, primary, 0, bodyY));

  // Shoulder caps (smooths connection to sleeves)
  scene.add(box(0.14, 0.08, bodyD + 0.02, primary, -bodyW / 2 - 0.04, -0.06));
  scene.add(box(0.14, 0.08, bodyD + 0.02, primary,  bodyW / 2 + 0.04, -0.06));

  // Sleeves
  const slW = 0.175 * sleeveLengthFactor;
  const slH = 0.14;
  scene.add(box(slW, slH, bodyD - 0.02, primary, -(bodyW / 2 + 0.04 + slW / 2), -0.05, 0, 0, 0,  0.25));
  scene.add(box(slW, slH, bodyD - 0.02, primary,  (bodyW / 2 + 0.04 + slW / 2), -0.05, 0, 0, 0, -0.25));

  // Collar ring
  const collarGeo = new THREE.TorusGeometry(0.075, 0.018, 8, 22);
  const collarMesh = new THREE.Mesh(collarGeo, collar);
  collarMesh.rotation.x = Math.PI / 2;
  scene.add(collarMesh);

  // Bottom hem detail
  scene.add(box(bodyW + 0.01, 0.02, bodyD + 0.01, collar, 0, -bodyH + 0.01));

  return scene;
}

// ─── Hoodie / Jacket ──────────────────────────────────────────────────────────
function makeHoodie(bodyColor, accentColor, hasHood = true) {
  const scene = new THREE.Scene();
  const primary = mat(bodyColor, 0.92);
  const accent  = mat(accentColor, 0.88);

  const bodyH = 0.72;
  const bodyW = 0.58;
  const bodyD = 0.22;

  // Torso
  scene.add(box(bodyW, bodyH, bodyD, primary, 0, -bodyH / 2));

  // Long sleeves
  const slH  = 0.6;
  const slW  = 0.23;
  const slD  = 0.19;
  const slY  = -0.34;

  scene.add(box(slW, slH, slD, primary, -(bodyW / 2 + slW / 2), slY));
  scene.add(box(slW, slH, slD, primary,  (bodyW / 2 + slW / 2), slY));

  // Cuffs
  scene.add(box(slW + 0.01, 0.04, slD + 0.01, accent, -(bodyW / 2 + slW / 2), slY - slH / 2));
  scene.add(box(slW + 0.01, 0.04, slD + 0.01, accent,  (bodyW / 2 + slW / 2), slY - slH / 2));

  // Zipper stripe
  scene.add(box(0.025, bodyH, bodyD + 0.005, accent, 0, -bodyH / 2));

  // Front pocket
  scene.add(box(0.26, 0.13, 0.015, accent, 0, -0.52, bodyD / 2 + 0.002));

  // Hood
  if (hasHood) {
    const hoodMat = mat(bodyColor, 0.92);
    // Back of hood (half-sphere)
    scene.add(sphere(0.22, hoodMat, 0, 0.13, -bodyD / 2 + 0.02, 0, Math.PI * 2, 0, Math.PI / 2 + 0.3));
    // Hood brim
    scene.add(box(0.3, 0.04, 0.06, accent, 0, 0.02, bodyD / 2 + 0.01));
  } else {
    // Round collar
    const colGeo = new THREE.TorusGeometry(0.09, 0.022, 8, 20);
    const col = new THREE.Mesh(colGeo, accent);
    col.rotation.x = Math.PI / 2;
    scene.add(col);
  }

  // Bottom rib band
  scene.add(box(bodyW + 0.01, 0.04, bodyD + 0.01, accent, 0, -bodyH + 0.02));

  return scene;
}

// ─── Kurta (long tunic) ───────────────────────────────────────────────────────
function makeKurta(bodyColor, embroideryColor) {
  const scene = new THREE.Scene();
  const primary   = mat(bodyColor, 0.85);
  const embroidery = mat(embroideryColor, 0.6, 0.2);

  const bodyH = 0.95;
  const bodyW = 0.54;
  const bodyD = 0.2;

  // Long torso
  scene.add(box(bodyW, bodyH, bodyD, primary, 0, -bodyH / 2));

  // 3/4 length sleeves
  const slH = 0.42;
  const slW = 0.2;
  scene.add(box(slW, slH, bodyD - 0.02, primary, -(bodyW / 2 + slW / 2 - 0.02), -0.22, 0, 0, 0,  0.15));
  scene.add(box(slW, slH, bodyD - 0.02, primary,  (bodyW / 2 + slW / 2 - 0.02), -0.22, 0, 0, 0, -0.15));

  // Collar (v-neck / mandarin style)
  const colGeo = new THREE.CylinderGeometry(0.075, 0.09, 0.06, 14, 1, true);
  const col = new THREE.Mesh(colGeo, embroidery);
  col.position.y = -0.03;
  scene.add(col);

  // Embroidery strip down front
  scene.add(box(0.04, bodyH * 0.6, bodyD + 0.005, embroidery, 0, -bodyH * 0.3, bodyD / 2 + 0.001));

  // Bottom embroidery border
  scene.add(box(bodyW, 0.05, bodyD + 0.005, embroidery, 0, -bodyH + 0.025));

  // Cuff embroidery
  scene.add(box(slW + 0.01, 0.04, bodyD - 0.015, embroidery, -(bodyW / 2 + slW / 2 - 0.02), -0.42, 0, 0, 0,  0.15));
  scene.add(box(slW + 0.01, 0.04, bodyD - 0.015, embroidery,  (bodyW / 2 + slW / 2 - 0.02), -0.42, 0, 0, 0, -0.15));

  return scene;
}

// ─── Sherwani (formal long coat) ──────────────────────────────────────────────
function makeSherwani(bodyColor, accentColor) {
  const scene = new THREE.Scene();
  const primary = mat(bodyColor, 0.75, 0.1);
  const accent  = mat(accentColor, 0.6, 0.2);

  const bodyH = 1.05;
  const bodyW = 0.56;
  const bodyD = 0.22;

  // Long body (below knees)
  scene.add(box(bodyW, bodyH, bodyD, primary, 0, -bodyH / 2));

  // Flared hem
  scene.add(box(bodyW + 0.06, 0.08, bodyD + 0.04, primary, 0, -bodyH + 0.04));

  // Full-length sleeves
  const slH = 0.62;
  const slW = 0.22;
  scene.add(box(slW, slH, bodyD - 0.02, primary, -(bodyW / 2 + slW / 2), -0.32));
  scene.add(box(slW, slH, bodyD - 0.02, primary,  (bodyW / 2 + slW / 2), -0.32));

  // Cuff gold
  scene.add(box(slW + 0.015, 0.055, bodyD + 0.005, accent, -(bodyW / 2 + slW / 2), -0.625));
  scene.add(box(slW + 0.015, 0.055, bodyD + 0.005, accent,  (bodyW / 2 + slW / 2), -0.625));

  // Stand collar
  const colGeo = new THREE.CylinderGeometry(0.09, 0.1, 0.08, 16, 1, true);
  const col = new THREE.Mesh(colGeo, accent);
  col.position.y = -0.04;
  scene.add(col);

  // Gold button strip
  scene.add(box(0.03, bodyH * 0.7, bodyD + 0.01, accent, 0, -bodyH * 0.35));
  for (let i = 0; i < 7; i++) {
    const btnGeo = new THREE.SphereGeometry(0.02, 8, 8);
    const btn = new THREE.Mesh(btnGeo, accent);
    btn.position.set(0, -0.1 - i * 0.12, bodyD / 2 + 0.02);
    scene.add(btn);
  }

  // Side border embroidery
  scene.add(box(0.035, bodyH, bodyD + 0.01, accent, -(bodyW / 2 - 0.015), -bodyH / 2));
  scene.add(box(0.035, bodyH, bodyD + 0.01, accent,  (bodyW / 2 - 0.015), -bodyH / 2));

  return scene;
}

// ─── Daura Suruwal (traditional Nepali) ───────────────────────────────────────
function makeDauraSuruwal(topColor, bottomColor, accentColor) {
  const scene = new THREE.Scene();
  const topMat    = mat(topColor, 0.85);
  const bottomMat = mat(bottomColor, 0.85);
  const accent    = mat(accentColor, 0.6, 0.15);

  // Daura (upper garment) - wrap style
  scene.add(box(0.56, 0.55, 0.2, topMat, 0, -0.275));

  // Wrap flap
  scene.add(box(0.22, 0.5, 0.21, topMat, -0.1, -0.25, 0.005));

  // Collar
  const colGeo = new THREE.CylinderGeometry(0.085, 0.1, 0.07, 14, 1, true);
  const col = new THREE.Mesh(colGeo, accent);
  col.position.y = -0.035;
  scene.add(col);

  // Sleeves
  const slH = 0.55;
  const slW = 0.2;
  scene.add(box(slW, slH, 0.17, topMat, -0.38, -0.275));
  scene.add(box(slW, slH, 0.17, topMat,  0.38, -0.275));

  // Suruwal (trousers) - baggy style
  const troH = 0.65;
  scene.add(box(0.38, troH, 0.28, bottomMat, 0, -0.55 - troH / 2)); // waist band
  scene.add(box(0.16, troH * 0.7, 0.22, bottomMat, -0.11, -0.55 - troH / 2 - 0.1)); // left leg
  scene.add(box(0.16, troH * 0.7, 0.22, bottomMat,  0.11, -0.55 - troH / 2 - 0.1)); // right leg

  // Dhago ties (strings)
  scene.add(box(0.008, 0.14, 0.008, accent, -0.08, -0.52));
  scene.add(box(0.008, 0.14, 0.008, accent,  0.08, -0.52));

  // Border
  scene.add(box(0.56, 0.03, 0.21, accent, 0, -0.54));

  return scene;
}

// ─── Dhaka Festival Set (dress) ───────────────────────────────────────────────
function makeDhakaSet(primaryColor, accentColor, accent2Color) {
  const scene = new THREE.Scene();
  const primary = mat(primaryColor, 0.8, 0.05);
  const accent  = mat(accentColor, 0.7, 0.1);
  const accent2 = mat(accent2Color, 0.7, 0.1);

  const bodyH = 0.52;
  const bodyW = 0.54;

  // Blouse (fitted top)
  scene.add(box(bodyW, bodyH, 0.19, primary, 0, -bodyH / 2));

  // Short sleeves
  scene.add(box(0.18, 0.1, 0.15, primary, -(bodyW / 2 + 0.07), -0.07, 0, 0, 0,  0.2));
  scene.add(box(0.18, 0.1, 0.15, primary,  (bodyW / 2 + 0.07), -0.07, 0, 0, 0, -0.2));

  // Dhaka border strips (geometric pattern simulation)
  const stripeW = 0.04;
  for (let i = 0; i < 5; i++) {
    const c = i % 2 === 0 ? accent : accent2;
    scene.add(box(bodyW + 0.01, stripeW, 0.2, c, 0, -0.08 - i * stripeW * 1.3));
  }

  // Collar V-neck
  const colGeo = new THREE.CylinderGeometry(0.07, 0.09, 0.06, 14, 1, true);
  const col = new THREE.Mesh(colGeo, accent);
  col.position.y = -0.03;
  scene.add(col);

  // Skirt (flared)
  const skirtH = 0.85;
  const skirtTopW = bodyW - 0.02;
  const skirtBotW = bodyW + 0.38;

  // Simulate flare with multiple stacked boxes
  const segments = 5;
  for (let s = 0; s < segments; s++) {
    const t = s / segments;
    const w = skirtTopW + (skirtBotW - skirtTopW) * t;
    const y = -bodyH - (skirtH / segments) * s - skirtH / segments / 2;
    const c = s % 2 === 0 ? primary : accent;
    scene.add(box(w, skirtH / segments, 0.12, c, 0, y));
  }

  // Dhaka border at hem
  scene.add(box(skirtBotW + 0.05, 0.06, 0.13, accent2, 0, -bodyH - skirtH + 0.03));

  return scene;
}

// ─── Export helper ─────────────────────────────────────────────────────────────
async function exportGLB(scene, outPath) {
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();
    exporter.parse(
      scene,
      (result) => {
        writeFileSync(outPath, Buffer.from(result));
        console.log(`✅  ${outPath.split(/[\\/]/).pop()} — ${(result.byteLength / 1024).toFixed(1)} KB`);
        resolve();
      },
      (err) => reject(err),
      { binary: true },
    );
  });
}

// ─── Main ──────────────────────────────────────────────────────────────────────
console.log('\n🎽  Generating 3D garment GLB files…\n');

const garments = [
  {
    file: 'oxford_shirt.glb',
    scene: makeTShirt(0x1e4d8c, 0x163d70),           // navy blue shirt
  },
  {
    file: 'himalayan_kurta.glb',
    scene: makeKurta(0x8b2020, 0xd4a847),             // dark red + gold
  },
  {
    file: 'field_jacket.glb',
    scene: makeHoodie(0x3d5a3e, 0x2a3e2b, true),      // olive green hoodie
  },
  {
    file: 'daura_suruwal.glb',
    scene: makeDauraSuruwal(0xfaf0e6, 0xf5f0e8, 0xc8a84b), // white + gold
  },
  {
    file: 'sherwani.glb',
    scene: makeSherwani(0x1a1a2e, 0xc8a84b),           // dark navy + gold sherwani
  },
  {
    file: 'dhaka_set.glb',
    scene: makeDhakaSet(0x8b0000, 0xffd700, 0x006400), // red + gold + green
  },
];

for (const { file, scene } of garments) {
  await exportGLB(scene, `${OUT_DIR}/${file}`);
}

console.log('\n✨  All garment models written to frontend/public/clothes/models/\n');
