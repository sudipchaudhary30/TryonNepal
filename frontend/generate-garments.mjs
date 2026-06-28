/**
 * generate-garments.mjs
 * Run from inside frontend/: node generate-garments.mjs
 *
 * Writes 6 .glb files to public/clothes/models/.
 * Uses Three.js only for geometry building; GLB is written manually
 * so no browser APIs (FileReader, Blob, URL) are needed.
 */

import * as THREE from 'three';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const OUT_DIR = resolve('./public/clothes/models');
mkdirSync(OUT_DIR, { recursive: true });

// ── Low-level GLB writer ──────────────────────────────────────────────────────
function writeGLB(primitiveList, outPath) {
  /*
   * primitiveList: Array of { positions: Float32Array, normals: Float32Array,
   *                            indices: Array<number>, color: [r,g,b],
   *                            roughness?: number, metalness?: number }
   */
  const accessors   = [];
  const bufferViews = [];
  const materials   = [];
  const meshPrims   = [];
  const binParts    = [];
  let boff = 0;

  function pad4(n) { return (4 - (n % 4)) % 4; }

  function pushView(buf, target) {
    const idx = bufferViews.length;
    binParts.push(buf);
    bufferViews.push({ buffer: 0, byteOffset: boff, byteLength: buf.length, target });
    boff += buf.length;
    const p = pad4(buf.length);
    if (p) { binParts.push(Buffer.alloc(p)); boff += p; }
    return idx;
  }

  function pushAccessor(viewIdx, componentType, count, type, extras = {}) {
    const idx = accessors.length;
    accessors.push({ bufferView: viewIdx, byteOffset: 0, componentType, count, type, ...extras });
    return idx;
  }

  for (const prim of primitiveList) {
    const { positions, normals, indices, color,
            roughness = 0.82, metalness = 0.0 } = prim;

    const vertCount = positions.length / 3;
    const idxCount  = indices.length;

    // ── bounds for POSITION ────────────────────────────────────────────────
    let mnX = Infinity, mnY = Infinity, mnZ = Infinity;
    let mxX = -Infinity, mxY = -Infinity, mxZ = -Infinity;
    for (let j = 0; j < positions.length; j += 3) {
      mnX = Math.min(mnX, positions[j]);   mxX = Math.max(mxX, positions[j]);
      mnY = Math.min(mnY, positions[j+1]); mxY = Math.max(mxY, positions[j+1]);
      mnZ = Math.min(mnZ, positions[j+2]); mxZ = Math.max(mxZ, positions[j+2]);
    }

    // ── position ──────────────────────────────────────────────────────────
    const posBuf = Buffer.from(positions.buffer, positions.byteOffset, positions.byteLength);
    const posAcc = pushAccessor(pushView(posBuf, 34962), 5126, vertCount, 'VEC3',
      { min: [mnX, mnY, mnZ], max: [mxX, mxY, mxZ] });

    // ── normals ───────────────────────────────────────────────────────────
    const normBuf = Buffer.from(normals.buffer, normals.byteOffset, normals.byteLength);
    const normAcc = pushAccessor(pushView(normBuf, 34962), 5126, vertCount, 'VEC3');

    // ── indices ───────────────────────────────────────────────────────────
    const use32  = idxCount > 65535;
    const idxArr = use32 ? new Uint32Array(indices) : new Uint16Array(indices);
    const idxBuf = Buffer.from(idxArr.buffer);
    const idxAcc = pushAccessor(pushView(idxBuf, 34963), use32 ? 5125 : 5123, idxCount, 'SCALAR');

    // ── material ──────────────────────────────────────────────────────────
    const matIdx = materials.length;
    materials.push({
      pbrMetallicRoughness: {
        baseColorFactor: [...color, 1.0],
        metallicFactor: metalness,
        roughnessFactor: roughness,
      },
      doubleSided: true,
    });

    meshPrims.push({ attributes: { POSITION: posAcc, NORMAL: normAcc }, indices: idxAcc, material: matIdx, mode: 4 });
  }

  const binBuf = Buffer.concat(binParts);

  const gltf = {
    asset: { version: '2.0', generator: 'DressMesh Nepal AR' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0 }],
    meshes: [{ primitives: meshPrims }],
    materials,
    accessors,
    bufferViews,
    buffers: [{ byteLength: binBuf.length }],
  };

  const jsonStr  = JSON.stringify(gltf);
  const jsonPad  = pad4(jsonStr.length);
  const jsonBuf  = Buffer.from(jsonStr + ' '.repeat(jsonPad), 'utf-8');
  const binPad   = pad4(binBuf.length);
  const binFinal = binPad ? Buffer.concat([binBuf, Buffer.alloc(binPad)]) : binBuf;

  const totalLen = 12 + 8 + jsonBuf.length + 8 + binFinal.length;
  const glb = Buffer.alloc(totalLen);
  let o = 0;

  glb.writeUInt32LE(0x46546C67, o); o += 4; // magic "glTF"
  glb.writeUInt32LE(2,          o); o += 4; // version
  glb.writeUInt32LE(totalLen,   o); o += 4;
  glb.writeUInt32LE(jsonBuf.length, o); o += 4;
  glb.writeUInt32LE(0x4E4F534A,    o); o += 4; // JSON
  jsonBuf.copy(glb, o); o += jsonBuf.length;
  glb.writeUInt32LE(binFinal.length, o); o += 4;
  glb.writeUInt32LE(0x004E4942,     o); o += 4; // BIN\0
  binFinal.copy(glb, o);

  writeFileSync(outPath, glb);
  console.log(`  ✅  ${outPath.split(/[\\/]/).pop().padEnd(28)} ${(totalLen / 1024).toFixed(1)} KB`);
}

// ── Geometry extractor ────────────────────────────────────────────────────────
function extractPrimitives(scene) {
  scene.updateMatrixWorld(true);
  const prims = [];

  scene.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;

    const geo = obj.geometry.clone();
    geo.applyMatrix4(obj.matrixWorld);
    if (!geo.getAttribute('normal')) geo.computeVertexNormals();

    const posAttr  = geo.getAttribute('position');
    const normAttr = geo.getAttribute('normal');
    const idxAttr  = geo.getIndex();

    const positions = new Float32Array(posAttr.array);
    const normals   = new Float32Array(normAttr.array);
    const indices   = idxAttr ? Array.from(idxAttr.array) : Array.from({ length: posAttr.count }, (_, i) => i);

    const c = obj.material.color ?? new THREE.Color(0.5, 0.5, 0.5);
    prims.push({
      positions,
      normals,
      indices,
      color:     [c.r, c.g, c.b],
      roughness: obj.material.roughness ?? 0.82,
      metalness: obj.material.metalness ?? 0.0,
    });
  });

  return prims;
}

// ── Scene builders ────────────────────────────────────────────────────────────
function m(hex, rough = 0.82, metal = 0.0) {
  return new THREE.MeshStandardMaterial({ color: hex, roughness: rough, metalness: metal });
}
function addBox(scene, w, h, d, mat, px=0, py=0, pz=0, rx=0, ry=0, rz=0) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.position.set(px, py, pz);
  mesh.rotation.set(rx, ry, rz);
  scene.add(mesh);
  return mesh;
}
function addCyl(scene, rT, rB, h, mat, px=0, py=0, pz=0, rx=0, ry=0, rz=0, seg=12) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rT, rB, h, seg, 1, true), mat);
  mesh.position.set(px, py, pz); mesh.rotation.set(rx, ry, rz);
  scene.add(mesh); return mesh;
}
function addTorus(scene, R, r, mat, px=0, py=0, pz=0, rx=0, ry=0, rz=0) {
  const mesh = new THREE.Mesh(new THREE.TorusGeometry(R, r, 8, 22), mat);
  mesh.position.set(px, py, pz); mesh.rotation.set(rx, ry, rz);
  scene.add(mesh); return mesh;
}
function addSphere(scene, r, mat, px=0, py=0, pz=0, pS=0, pL=Math.PI*2, tS=0, tL=Math.PI) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10, pS, pL, tS, tL), mat);
  mesh.position.set(px, py, pz); scene.add(mesh); return mesh;
}

// ─── Oxford Shirt (navy blue t-shirt) ────────────────────────────────────────
function makeOxfordShirt() {
  const s = new THREE.Scene();
  const body   = m(0x1e4d8c);
  const collar = m(0x163d70, 0.65);
  const bW=0.54, bH=0.65, bD=0.18;
  addBox(s, bW, bH, bD,         body,   0,  -bH/2);
  addBox(s, 0.13, 0.08, bD+0.01, body, -(bW/2+0.045), -0.06);
  addBox(s, 0.13, 0.08, bD+0.01, body,  (bW/2+0.045), -0.06);
  addBox(s, 0.20, 0.13, bD-0.02, body, -(bW/2+0.14), -0.045, 0, 0,0,  0.28);
  addBox(s, 0.20, 0.13, bD-0.02, body,  (bW/2+0.14), -0.045, 0, 0,0, -0.28);
  addTorus(s, 0.075, 0.018, collar, 0, 0, 0, Math.PI/2);
  addBox(s, bW+0.01, 0.022, bD+0.01, collar, 0, -bH+0.012);
  return s;
}

// ─── Field Jacket (olive green hoodie) ───────────────────────────────────────
function makeFieldJacket() {
  const s = new THREE.Scene();
  const body   = m(0x3d5a3e, 0.92);
  const accent = m(0x2a3e2b, 0.88);
  const bW=0.58, bH=0.72, bD=0.22;
  addBox(s, bW, bH, bD,         body,   0, -bH/2);
  const sH=0.60, sW=0.23, sD=0.19;
  addBox(s, sW, sH, sD, body, -(bW/2+sW/2), -0.34);
  addBox(s, sW, sH, sD, body,  (bW/2+sW/2), -0.34);
  addBox(s, sW+0.01, 0.04, sD+0.01, accent, -(bW/2+sW/2), -0.64);
  addBox(s, sW+0.01, 0.04, sD+0.01, accent,  (bW/2+sW/2), -0.64);
  addBox(s, 0.025, bH, bD+0.005, accent, 0, -bH/2);  // zipper
  addBox(s, 0.28, 0.13, 0.016, accent, 0, -0.52, bD/2+0.002); // pocket
  addSphere(s, 0.22, body, 0, 0.10, -(bD/2-0.03), 0, Math.PI*2, 0, Math.PI/2+0.3); // hood
  addBox(s, 0.32, 0.04, 0.06, accent, 0, 0.02, bD/2+0.01); // hood brim
  addBox(s, bW+0.01, 0.04, bD+0.01, accent, 0, -bH+0.022); // rib hem
  return s;
}

// ─── Himalayan Kurta (red + gold) ────────────────────────────────────────────
function makeHimalayanKurta() {
  const s = new THREE.Scene();
  const body = m(0x8b2020, 0.85);
  const emb  = m(0xd4a847, 0.60, 0.20);
  const bW=0.54, bH=0.95, bD=0.20;
  addBox(s, bW, bH, bD, body, 0, -bH/2);
  const sH=0.42, sW=0.20;
  addBox(s, sW, sH, bD-0.02, body, -(bW/2+sW/2-0.02), -0.22, 0,0,0,  0.15);
  addBox(s, sW, sH, bD-0.02, body,  (bW/2+sW/2-0.02), -0.22, 0,0,0, -0.15);
  addCyl(s, 0.075, 0.09, 0.06, emb, 0, -0.03);
  addBox(s, 0.04, bH*0.6, bD+0.005, emb, 0, -bH*0.30, bD/2+0.001); // front strip
  addBox(s, bW, 0.05, bD+0.005, emb, 0, -bH+0.026);
  addBox(s, sW+0.01, 0.04, bD-0.015, emb, -(bW/2+sW/2-0.02), -0.42, 0,0,0,  0.15);
  addBox(s, sW+0.01, 0.04, bD-0.015, emb,  (bW/2+sW/2-0.02), -0.42, 0,0,0, -0.15);
  return s;
}

// ─── Kathmandu Sherwani (dark navy + gold) ────────────────────────────────────
function makeSherwani() {
  const s = new THREE.Scene();
  const body   = m(0x1a1a2e, 0.75, 0.10);
  const accent = m(0xc8a84b, 0.60, 0.20);
  const bW=0.56, bH=1.05, bD=0.22;
  addBox(s, bW, bH, bD, body, 0, -bH/2);
  addBox(s, bW+0.07, 0.08, bD+0.05, body, 0, -bH+0.04); // flared hem
  const sH=0.62, sW=0.22;
  addBox(s, sW, sH, bD-0.02, body, -(bW/2+sW/2), -0.32);
  addBox(s, sW, sH, bD-0.02, body,  (bW/2+sW/2), -0.32);
  addBox(s, sW+0.015, 0.055, bD+0.005, accent, -(bW/2+sW/2), -0.625);
  addBox(s, sW+0.015, 0.055, bD+0.005, accent,  (bW/2+sW/2), -0.625);
  addCyl(s, 0.09, 0.10, 0.08, accent, 0, -0.04);
  addBox(s, 0.030, bH*0.72, bD+0.01, accent, 0, -bH*0.36); // button strip
  for (let i = 0; i < 7; i++) {
    const btn = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), accent);
    btn.position.set(0, -0.10 - i * 0.12, bD/2 + 0.02);
    s.add(btn);
  }
  addBox(s, 0.035, bH, bD+0.01, accent, -(bW/2-0.015), -bH/2);
  addBox(s, 0.035, bH, bD+0.01, accent,  (bW/2-0.015), -bH/2);
  return s;
}

// ─── Daura Suruwal (white + gold) ────────────────────────────────────────────
function makeDauraSuruwal() {
  const s = new THREE.Scene();
  const top    = m(0xfaf0e6, 0.85);
  const bottom = m(0xf5f0e8, 0.85);
  const accent = m(0xc8a84b, 0.60, 0.15);
  addBox(s, 0.56, 0.55, 0.20, top, 0, -0.275);
  addBox(s, 0.22, 0.50, 0.21, top, -0.10, -0.25, 0.005); // wrap flap
  addCyl(s, 0.085, 0.10, 0.07, accent, 0, -0.035);
  addBox(s, 0.20, 0.55, 0.17, top, -0.38, -0.275);
  addBox(s, 0.20, 0.55, 0.17, top,  0.38, -0.275);
  const tH=0.65;
  addBox(s, 0.38, tH, 0.28, bottom, 0, -0.55-tH/2);
  addBox(s, 0.16, tH*0.7, 0.22, bottom, -0.11, -0.55-tH/2-0.10);
  addBox(s, 0.16, tH*0.7, 0.22, bottom,  0.11, -0.55-tH/2-0.10);
  addBox(s, 0.008, 0.14, 0.008, accent, -0.08, -0.52);
  addBox(s, 0.008, 0.14, 0.008, accent,  0.08, -0.52);
  addBox(s, 0.57, 0.030, 0.21, accent, 0, -0.54);
  return s;
}

// ─── Dhaka Festival Set (red + gold + green) ──────────────────────────────────
function makeDhakaSet() {
  const s = new THREE.Scene();
  const primary = m(0x8b0000, 0.80, 0.05);
  const gold    = m(0xffd700, 0.70, 0.10);
  const green   = m(0x006400, 0.70, 0.10);
  const bH=0.52, bW=0.54;
  addBox(s, bW, bH, 0.19, primary, 0, -bH/2);
  addBox(s, 0.18, 0.10, 0.15, primary, -(bW/2+0.07), -0.07, 0, 0,0,  0.20);
  addBox(s, 0.18, 0.10, 0.15, primary,  (bW/2+0.07), -0.07, 0, 0,0, -0.20);
  const sw=0.04;
  for (let i=0; i<5; i++) addBox(s, bW+0.01, sw, 0.20, i%2===0?gold:green, 0, -0.08-i*sw*1.3);
  addCyl(s, 0.07, 0.09, 0.06, gold, 0, -0.03);
  // flared skirt
  const skH=0.85, skTop=bW-0.02, skBot=bW+0.38;
  const segs=5;
  for (let i=0; i<segs; i++) {
    const t=i/segs;
    const w=skTop+(skBot-skTop)*t;
    const y=-bH-(skH/segs)*i-skH/segs/2;
    addBox(s, w, skH/segs, 0.12, i%2===0?primary:gold, 0, y);
  }
  addBox(s, skBot+0.05, 0.06, 0.13, green, 0, -bH-skH+0.03);
  return s;
}

// ── Main ──────────────────────────────────────────────────────────────────────
console.log('\n🎽  Generating 3D garment GLB files…\n');

const garments = [
  { file: 'oxford_shirt.glb',    build: makeOxfordShirt   },
  { file: 'field_jacket.glb',    build: makeFieldJacket   },
  { file: 'himalayan_kurta.glb', build: makeHimalayanKurta },
  { file: 'sherwani.glb',        build: makeSherwani      },
  { file: 'daura_suruwal.glb',   build: makeDauraSuruwal  },
  { file: 'dhaka_set.glb',       build: makeDhakaSet      },
];

for (const { file, build } of garments) {
  const scene = build();
  const prims = extractPrimitives(scene);
  writeGLB(prims, `${OUT_DIR}/${file}`);
}

console.log('\n✨  Done — models written to public/clothes/models/\n');
