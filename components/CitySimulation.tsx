"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  Home,
  Radio,
  Users,
  Wifi,
  MousePointer2,
  Move,
  Plus,
  Minus,
  Droplets,
  RotateCcw,
} from "lucide-react";
import "./city-area.css";
const NODES = [
  { id: "node-0", name: "School hub", short: "School", x: -18.6, z: -11.2 },
  {
    id: "node-1",
    name: "Riverside hub",
    short: "Riverside hub",
    x: 18.1,
    z: -12.2,
  },
  { id: "node-2", name: "Health post", short: "Health post", x: -18.5, z: 6.4 },
  { id: "node-3", name: "Hill centre", short: "Hill centre", x: 18.4, z: 12.1 },
];
const coords = [
  [-14.8, -12.2, -0.18],
  [-10.4, -13.5, 0.23],
  [-7.8, -10.4, -0.34],
  [-13.7, -7.1, 0.3],
  [-17.5, -2.8, -0.22],
  [-10.2, -4.4, 0.17],
  [9.7, -12.3, 0.18],
  [14.1, -14.5, -0.24],
  [17.3, -8.7, 0.32],
  [8.2, -7.2, -0.16],
  [15.8, -3.8, 0.23],
  [10.8, -0.7, -0.36],
  [-14.3, 3.7, -0.25],
  [-8.2, 5.9, 0.28],
  [-15.9, 9.1, 0.17],
  [-11.7, 12.2, -0.22],
  [-6.9, 10.5, 0.3],
  [-17.2, 13.6, -0.12],
  [7.6, 3.4, 0.25],
  [13.1, 4.2, -0.32],
  [17.3, 7.5, 0.18],
  [10.3, 9.4, -0.26],
  [7.5, 13.7, 0.13],
  [14.9, 14.1, 0.31],
];
const surnames = [
  "Shrestha",
  "Tamang",
  "Gurung",
  "Karki",
  "Rai",
  "Maharjan",
  "Lama",
  "Thapa",
  "Joshi",
  "Sherpa",
  "Adhikari",
  "Basnet",
  "Poudel",
  "KC",
  "Limbu",
  "Pandey",
  "Pradhan",
  "Magar",
  "Khadka",
  "Bhandari",
  "Bista",
  "Acharya",
  "Tuladhar",
  "Regmi",
];
const firstNames = [
  "Maya",
  "Nima",
  "Sita",
  "Arun",
  "Pema",
  "Rina",
  "Tashi",
  "Bina",
  "Suman",
  "Lhakpa",
  "Anita",
  "Milan",
  "Saraswati",
  "Bikash",
  "Dipa",
  "Raj",
  "Sunita",
  "Kiran",
  "Gita",
  "Manish",
  "Sabina",
  "Hari",
  "Anil",
  "Rupa",
];
const homes = surnames.map((name, i) => {
  const [x, z, rotation] = coords[i];
  let node = 0;
  NODES.forEach((n, j) => {
    if (
      Math.hypot(x - n.x, z - n.z) <
      Math.hypot(x - NODES[node].x, z - NODES[node].z)
    )
      node = j;
  });
  return {
    id: "home-" + i,
    name: name + " family",
    contact: firstNames[i] + " " + name,
    members: 2 + (i % 5),
    children: i % 3,
    need: ["Water", "Check-in", "Shelter", "All safe", "Supplies", "Check-in"][
      i % 6
    ],
    x,
    z,
    rotation,
    node,
  };
});
const riverX = (z: number) =>
  Math.sin(z * 0.18) * 2.45 + Math.sin(z * 0.37) * 0.65;
export default function CitySimulation() {
  const host = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState("home-0"),
    [flood, setFlood] = useState(46),
    [active, setActive] = useState(true),
    [fallback, setFallback] = useState(false);
  const state = useRef({ selected, flood, active, zoom: 0, reset: false });
  Object.assign(state.current, { selected, flood, active });
  const family = homes.find((h) => h.id === selected),
    node = family
      ? NODES[family.node]
      : NODES.find((n) => n.id === selected) || NODES[0],
    nodeHomes = homes.filter((h) => NODES[h.node].id === node.id);
  useEffect(() => {
    if (!host.current) return;
    const mount = host.current;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "low-power",
      });
    } catch {
      setFallback(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0xf3f4f6, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.domElement.setAttribute("role", "img");
    renderer.domElement.setAttribute(
      "aria-label",
      "Dense Kathmandu-inspired riverside neighbourhood with winding roads, clustered buildings, trees, a curved flood river, and four community hubs. Hover or tap a family home to make it shine and show its connection.",
    );
    mount.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xf3f4f6, 75, 140);
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 180);
    const initial = new THREE.Vector3(36, 38, 43);
    camera.position.copy(initial);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.1, 0.3);
    controls.enableDamping = true;
    controls.enablePan = true;
    controls.screenSpacePanning = false;
    controls.minDistance = 21;
    controls.maxDistance = 88;
    controls.minPolarAngle = 0.22;
    controls.maxPolarAngle = Math.PI / 2.35;
    controls.update();
    scene.add(new THREE.HemisphereLight(0xffffff, 0x9b9da0, 1.25));
    const sun = new THREE.DirectionalLight(0xffffff, 2.15);
    sun.position.set(-18, 32, 20);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, {
      left: -31,
      right: 31,
      top: 25,
      bottom: -25,
    });
    sun.shadow.normalBias = 0.04;
    scene.add(sun);
    const geos: THREE.BufferGeometry[] = [],
      mats: THREE.Material[] = [],
      textures: THREE.Texture[] = [],
      pickables: THREE.Object3D[] = [];
    const mat = (
      color: THREE.ColorRepresentation,
      extra: THREE.MeshStandardMaterialParameters = {},
    ) => {
      const m = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.83,
        flatShading: true,
        ...extra,
      });
      mats.push(m);
      return m;
    };
    const mesh = (
      g: THREE.BufferGeometry,
      m: THREE.Material,
      x = 0,
      y = 0,
      z = 0,
      parent: THREE.Object3D = scene,
    ) => {
      geos.push(g);
      const o = new THREE.Mesh(g, m);
      o.position.set(x, y, z);
      o.castShadow = true;
      o.receiveShadow = true;
      parent.add(o);
      return o;
    };
    const box = (
      w: number,
      h: number,
      d: number,
      c: THREE.ColorRepresentation,
      x: number,
      y: number,
      z: number,
      parent: THREE.Object3D = scene,
    ) => mesh(new THREE.BoxGeometry(w, h, d), mat(c), x, y, z, parent);
    const cylinder = (
      r: number,
      rb: number,
      h: number,
      c: THREE.ColorRepresentation,
      x: number,
      y: number,
      z: number,
      parent: THREE.Object3D = scene,
    ) =>
      mesh(new THREE.CylinderGeometry(r, rb, h, 10), mat(c), x, y, z, parent);
    const label = (text: string, x: number, y: number, z: number) => {
      const c = document.createElement("canvas");
      c.width = 512;
      c.height = 92;
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "#fffef8";
      ctx.fillRect(0, 0, 512, 92);
      ctx.strokeStyle = "#77896b";
      ctx.lineWidth = 3;
      ctx.strokeRect(1, 1, 510, 90);
      ctx.font = "600 29px Arial";
      ctx.fillStyle = "#263322";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, 256, 47);
      const t = new THREE.CanvasTexture(c);
      textures.push(t);
      const m = new THREE.SpriteMaterial({
        map: t,
        transparent: true,
        depthTest: false,
      });
      mats.push(m);
      const sp = new THREE.Sprite(m);
      sp.position.set(x, y, z);
      sp.scale.set(5, 0.9, 1);
      sp.renderOrder = 9;
      scene.add(sp);
    };
    const clickable = (object: THREE.Object3D, id: string) =>
      object.traverse((child) => {
        child.userData.key = id;
        if (child instanceof THREE.Mesh) pickables.push(child);
      });
    // The model is an original neighbourhood illustration, with an irregular edge.
    const edge = new THREE.Shape();
    edge.moveTo(-24, -17);
    edge.lineTo(-18, -19);
    edge.lineTo(14, -18);
    edge.lineTo(24, -14);
    edge.lineTo(24, 12);
    edge.lineTo(19, 18);
    edge.lineTo(-17, 18.5);
    edge.lineTo(-24, 14);
    edge.closePath();
    const base = mesh(
      new THREE.ExtrudeGeometry(edge, { depth: 0.65, bevelEnabled: false }),
      mat(0xaeb1b4),
      0,
      -0.4,
      0,
    );
    base.rotation.x = -Math.PI / 2;
    const surface = mesh(
      new THREE.ShapeGeometry(edge),
      mat(0xcacac4),
      0,
      0.27,
      0,
    );
    surface.rotation.x = -Math.PI / 2;
    // Shared ribbon builder: winding streets and a sinuous river, rather than a grid.
    function ribbon(
      points: THREE.Vector3[],
      width: number,
      color: number,
      y: number,
    ) {
      const curve = new THREE.CatmullRomCurve3(points),
        count = 100,
        positions: number[] = [],
        indices: number[] = [];
      for (let i = 0; i <= count; i++) {
        const p = curve.getPoint(i / count),
          t = curve.getTangent(i / count),
          nx = -t.z,
          nz = t.x;
        positions.push(
          p.x + (nx * width) / 2,
          y,
          p.z + (nz * width) / 2,
          p.x - (nx * width) / 2,
          y,
          p.z - (nz * width) / 2,
        );
        if (i < count) {
          const k = i * 2;
          indices.push(k, k + 2, k + 1, k + 1, k + 2, k + 3);
        }
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3),
      );
      geometry.setIndex(indices);
      geometry.computeVertexNormals();
      const road = mesh(geometry, mat(color, { side: THREE.DoubleSide }));
      return { curve, road };
    }
    const lanePaths = [
      [
        [-22, -15],
        [-18, -8],
        [-19, -2],
        [-14, 3],
        [-13, 9],
        [-18, 16],
      ],
      [
        [-17, -17],
        [-12, -11],
        [-9, -6],
        [-11, 0],
        [-7, 7],
        [-9, 16],
      ],
      [
        [21, -16],
        [16, -9],
        [18, -3],
        [14, 2],
        [15, 9],
        [20, 15],
      ],
      [
        [12, -17],
        [8, -10],
        [10, -3],
        [7, 3],
        [11, 11],
        [9, 17],
      ],
      [
        [-23, -5],
        [-15, -5.5],
        [-8, -6.2],
        [riverX(-6), -6],
        [9, -5.8],
        [16, -6],
        [23, -4],
      ],
      [
        [-23, 10],
        [-15, 7.2],
        [-8, 7.3],
        [riverX(7), 7],
        [8, 7.2],
        [15, 10.5],
        [23, 10],
      ],
      [
        [-23, -13],
        [-16, -15.5],
        [-9, -16],
        [0, -16.7],
        [10, -16.1],
        [18, -15],
        [23, -12],
      ],
    ];
    const roadCurves = lanePaths.map((points, i) => {
      const pts = points.map(([x, z]) => new THREE.Vector3(x, 0, z));
      ribbon(pts, i < 4 ? 1.5 : 2.0, 0xdeded8, 0.295);
      const r = ribbon(pts, i < 4 ? 0.88 : 1.35, 0x8a8f93, 0.31);
      if (i > 3) {
        const lineGeo = new THREE.BufferGeometry().setFromPoints(
          r.curve.getPoints(100).map((p) => p.setY(0.33)),
        );
        geos.push(lineGeo);
        const lm = new THREE.LineDashedMaterial({
          color: 0xe6e6df,
          dashSize: 0.5,
          gapSize: 0.45,
          transparent: true,
          opacity: 0.8,
        });
        mats.push(lm);
        const line = new THREE.Line(lineGeo, lm);
        line.computeLineDistances();
        scene.add(line);
      }
      return r.curve;
    });
    // Curved water and broad floodplain have a bounded, animated ribbon buffer.
    const waterCount = 100,
      waterPositions = new Float32Array((waterCount + 1) * 6),
      waterIndices: number[] = [];
    for (let i = 0; i < waterCount; i++) {
      const k = i * 2;
      waterIndices.push(k, k + 2, k + 1, k + 1, k + 2, k + 3);
    }
    const waterGeo = new THREE.BufferGeometry();
    waterGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(waterPositions, 3),
    );
    waterGeo.setIndex(waterIndices);
    const waterMat = mat(0x3c9ac6, {
      transparent: true,
      opacity: 0.82,
      roughness: 0.28,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });
    const water = mesh(waterGeo, waterMat);
    water.castShadow = false;
    water.renderOrder = 2;
    for (const side of [-1, 1]) {
      const pts = Array.from({ length: 60 }, (_, i) => {
        const z = -19 + (i / 59) * 38;
        return new THREE.Vector3(riverX(z) + side * 1.85, 0.38, z);
      });
      const curve = new THREE.CatmullRomCurve3(pts);
      mesh(new THREE.TubeGeometry(curve, 70, 0.12, 6, false), mat(0x969fa2));
    }
    for (const z of [-6, 7]) {
      const x = riverX(z);
      box(8.2, 0.2, 1.75, 0xd2d2c9, x, 0.8, z);
      for (const zz of [z - 0.84, z + 0.84]) {
        box(8.1, 0.07, 0.07, 0x646c72, x, 1.42, zz);
        for (let xx = -3.9; xx <= 3.9; xx += 0.65)
          cylinder(0.025, 0.025, 0.64, 0x70787e, x + xx, 1.1, zz);
      }
      for (const xx of [-2.7, 2.7])
        box(0.4, 0.7, 1.3, 0x939b9f, x + xx, 0.42, z);
    }
    // Green pockets and footpaths break the city into small neighbourhoods.
    const parkPlaces = [
      [-20.1, 1.3, 3.2, 2.2],
      [-5.6, -14.2, 2.2, 2.4],
      [19.3, 1.4, 3, 2.6],
      [-4.8, 14.8, 2.1, 2],
      [5.6, -12.1, 1.6, 2.8],
    ];
    parkPlaces.forEach(([x, z, rx, rz]) => {
      const p = mesh(new THREE.CircleGeometry(1, 28), mat(0x8eb273), x, 0.3, z);
      p.rotation.x = -Math.PI / 2;
      p.scale.set(rx, rz, 1);
    });
    const roofColors = [
      0xa84f3c, 0x344c66, 0x466c50, 0x9e8549, 0x79534d, 0x64717f,
    ];
    const wallColors = [0xd5c8b2, 0xdadad2, 0xc2b59d, 0xd4bbac, 0xc8d0c9];
    // Context buildings are instanced in irregular clusters; 24 foreground homes remain selectable.
    let seed = 1753;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    const context: {
      x: number;
      z: number;
      w: number;
      d: number;
      h: number;
      rot: number;
      color: number;
    }[] = [];
    let tries = 0;
    while (context.length < 125 && tries++ < 1300) {
      const x = -22 + rand() * 44,
        z = -16 + rand() * 32;
      if (Math.abs(x - riverX(z)) < 3.6) continue;
      if (
        homes.some((h) => Math.hypot(x - h.x, z - h.z) < 2.25) ||
        NODES.some((n) => Math.hypot(x - n.x, z - n.z) < 2.45)
      )
        continue;
      if (
        parkPlaces.some(
          ([px, pz, rx, rz]) => Math.abs(x - px) < rx && Math.abs(z - pz) < rz,
        )
      )
        continue;
      if (
        roadCurves.some((c) =>
          c.getPoints(25).some((p) => Math.hypot(x - p.x, z - p.z) < 1.05),
        )
      )
        continue;
      context.push({
        x,
        z,
        w: 0.7 + rand() * 1.15,
        d: 0.7 + rand() * 1.2,
        h: 0.7 + rand() * 2.3,
        rot: (rand() - 0.5) * 0.7,
        color: Math.floor(rand() * roofColors.length),
      });
    }
    const contextGeo = new THREE.BoxGeometry(1, 1, 1);
    geos.push(contextGeo);
    const contextWalls = new THREE.InstancedMesh(
      contextGeo,
      mat(0xd5d5ce),
      context.length,
    );
    contextWalls.castShadow = true;
    contextWalls.receiveShadow = true;
    scene.add(contextWalls);
    const matrix = new THREE.Matrix4(),
      q = new THREE.Quaternion(),
      scale = new THREE.Vector3();
    context.forEach((b, i) => {
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), b.rot);
      matrix.compose(
        new THREE.Vector3(b.x, 0.36 + b.h / 2, b.z),
        q,
        scale.set(b.w, b.h, b.d),
      );
      contextWalls.setMatrixAt(i, matrix);
    });
    roofColors.forEach((color, j) => {
      const set = context.filter((b) => b.color === j),
        inst = new THREE.InstancedMesh(contextGeo, mat(color), set.length);
      inst.castShadow = true;
      inst.receiveShadow = true;
      scene.add(inst);
      set.forEach((b, i) => {
        q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), b.rot);
        matrix.compose(
          new THREE.Vector3(b.x, 0.39 + b.h, b.z),
          q,
          scale.set(b.w + 0.13, 0.12, b.d + 0.13),
        );
        inst.setMatrixAt(i, matrix);
      });
    });
    const homeRings: Record<string, THREE.Mesh> = {},
      homeMaterials: Record<string, THREE.MeshStandardMaterial[]> = {},
      homeRims: Record<string, THREE.LineSegments[]> = {};
    homes.forEach((home, i) => {
      const group = new THREE.Group();
      group.position.set(home.x, 0.3, home.z);
      group.rotation.y = home.rotation;
      scene.add(group);
      const floors = 2 + (i % 4),
        height = 0.58 * floors,
        width = 1.55 + (i % 3) * 0.2,
        depth = 1.6 + (i % 2) * 0.3;
      box(width + 0.3, 0.15, depth + 0.3, 0xe9e4d4, 0, 0.1, 0, group);
      const bodyMat = mat(wallColors[i % wallColors.length], {
        emissive: 0x5ad3ff,
        emissiveIntensity: 0,
      });
      const body = mesh(
        new THREE.BoxGeometry(width, height, depth),
        bodyMat,
        0,
        0.22 + height / 2,
        0,
        group,
      );
      homeMaterials[home.id] = [bodyMat];
      homeRims[home.id] = [];
      const outlineGeo = new THREE.EdgesGeometry(body.geometry, 25);
      geos.push(outlineGeo);
      const outlineMat = new THREE.LineBasicMaterial({
        color: 0x2caad5,
        transparent: true,
        opacity: 0,
      });
      mats.push(outlineMat);
      const outline = new THREE.LineSegments(outlineGeo, outlineMat);
      outline.position.copy(body.position);
      outline.scale.setScalar(1.035);
      group.add(outline);
      homeRims[home.id].push(outline);
      for (let floor = 0; floor < floors; floor++) {
        const yy = 0.49 + floor * 0.58;
        for (const xx of [-width * 0.27, width * 0.27]) {
          box(0.28, 0.32, 0.035, 0x54776f, xx, yy, depth / 2 + 0.02, group);
          box(
            0.3,
            0.04,
            0.05,
            0xddd6c2,
            xx,
            yy + 0.18,
            depth / 2 + 0.045,
            group,
          );
        }
        box(
          width + 0.06,
          0.055,
          depth + 0.05,
          0xeae3d1,
          0,
          0.24 + (floor + 1) * 0.58,
          0,
          group,
        );
      }
      box(0.34, 0.57, 0.045, 0x5b7266, 0, 0.47, depth / 2 + 0.025, group);
      const roofMat = mat(roofColors[i % roofColors.length], {
        emissive: 0x56c5f3,
        emissiveIntensity: 0,
      });
      homeMaterials[home.id].push(roofMat);
      mesh(
        new THREE.BoxGeometry(width + 0.22, 0.13, depth + 0.22),
        roofMat,
        0,
        height + 0.3,
        0,
        group,
      );
      if (i % 4 === 0) {
        const pitched = mesh(
          new THREE.ConeGeometry((width + depth) * 0.41, 0.58, 4),
          roofMat,
          0,
          height + 0.63,
          0,
          group,
        );
        pitched.rotation.y = Math.PI / 4;
      } else {
        box(
          0.1,
          0.22,
          depth + 0.12,
          0xdcd6c5,
          -width / 2 - 0.05,
          height + 0.46,
          0,
          group,
        );
        box(
          0.1,
          0.22,
          depth + 0.12,
          0xdcd6c5,
          width / 2 + 0.05,
          height + 0.46,
          0,
          group,
        );
        cylinder(
          0.2,
          0.2,
          0.42,
          0x546655,
          width * 0.25,
          height + 0.58,
          -depth * 0.2,
          group,
        );
      }
      if (i % 3 === 1) {
        box(
          width * 0.6,
          0.13,
          0.65,
          wallColors[(i + 2) % wallColors.length],
          0,
          height + 0.42,
          -depth * 0.1,
          group,
        );
        box(0.45, 0.04, 0.45, 0x45686a, -0.2, height + 0.52, 0.25, group);
      }
      clickable(group, home.id);
      const ring = mesh(
        new THREE.RingGeometry(1.35, 1.48, 48),
        new THREE.MeshBasicMaterial({
          color: 0x42c5ed,
          transparent: true,
          opacity: 0,
          side: THREE.DoubleSide,
        }),
        home.x,
        0.4,
        home.z,
      );
      mats.push(ring.material as THREE.Material);
      ring.rotation.x = -Math.PI / 2;
      homeRings[home.id] = ring;
    });
    // A recognisable neighbourhood temple and courtyard, not a geographic landmark claim.
    const temple = new THREE.Group();
    temple.position.set(5.4, 0.3, 1);
    temple.rotation.y = -0.2;
    scene.add(temple);
    box(3, 0.2, 3, 0xe3d8c0, 0, 0.1, 0, temple);
    box(1.8, 1.2, 1.8, 0xb78f73, 0, 0.8, 0, temple);
    for (let i = 0; i < 3; i++) {
      const r = mesh(
        new THREE.ConeGeometry(1.9 - i * 0.43, 0.7, 4),
        mat(0x8f5148),
        0,
        1.65 + i * 0.66,
        0,
        temple,
      );
      r.rotation.y = Math.PI / 4;
      if (i < 2)
        box(
          0.85 - i * 0.15,
          0.54,
          0.85 - i * 0.15,
          0xcfb59b,
          0,
          1.9 + i * 0.66,
          0,
          temple,
        );
    }
    cylinder(0.05, 0.09, 0.62, 0xbdac75, 5.4, 3.95, 1);
    // Trees are instanced in parks and along the river; limited draw calls keep the scene light.
    const treePoints: { x: number; z: number; size: number }[] = [];
    for (let i = 0; i < 70; i++) {
      const z = -17 + rand() * 34,
        side = i % 2 ? 1 : -1;
      const x = riverX(z) + side * (3.1 + rand() * 1.1);
      if (homes.some((h) => Math.hypot(x - h.x, z - h.z) < 1.7)) continue;
      treePoints.push({ x, z, size: 0.65 + rand() * 0.6 });
    }
    parkPlaces.forEach(([px, pz, rx, rz]) => {
      for (let i = 0; i < 8; i++)
        treePoints.push({
          x: px + (rand() - 0.5) * rx * 1.3,
          z: pz + (rand() - 0.5) * rz * 1.3,
          size: 0.7 + rand() * 0.65,
        });
    });
    const trunkGeo = new THREE.CylinderGeometry(0.055, 0.085, 0.7, 6),
      crownGeo = new THREE.IcosahedronGeometry(0.46, 0);
    geos.push(trunkGeo, crownGeo);
    const trunks = new THREE.InstancedMesh(
        trunkGeo,
        mat(0x8a795f),
        treePoints.length,
      ),
      crowns = new THREE.InstancedMesh(
        crownGeo,
        mat(0x5f984a),
        treePoints.length,
      );
    trunks.castShadow = true;
    crowns.castShadow = true;
    scene.add(trunks, crowns);
    treePoints.forEach((tree, i) => {
      matrix.compose(
        new THREE.Vector3(tree.x, 0.6, tree.z),
        new THREE.Quaternion(),
        scale.set(1, tree.size, 1),
      );
      trunks.setMatrixAt(i, matrix);
      matrix.compose(
        new THREE.Vector3(tree.x, 1 + tree.size * 0.25, tree.z),
        new THREE.Quaternion(),
        scale.set(tree.size, tree.size * 1.35, tree.size),
      );
      crowns.setMatrixAt(i, matrix);
    });
    const nodeRings: THREE.Mesh[][] = [],
      nodeLeds: THREE.Mesh[] = [];
    NODES.forEach((n, i) => {
      const group = new THREE.Group();
      group.position.set(n.x, 0.3, n.z);
      group.rotation.y = i % 2 ? 0.17 : -0.19;
      scene.add(group);
      box(2.6, 0.18, 2.5, 0xc1c5c5, 0, 0.1, 0, group);
      box(2.15, 1.25, 1.95, 0xebe7dd, 0, 0.82, 0, group);
      box(2.5, 0.16, 2.3, 0x315c7c, 0, 1.53, 0, group);
      box(0.7, 0.85, 0.04, 0x344e62, 0, 0.65, 0.99, group);
      box(1.8, 0.26, 0.3, 0xb4d8e7, 0, 1.2, 1.0, group);
      cylinder(0.065, 0.09, 2.4, 0x4d5964, 0.7, 2.7, 0, group);
      const led = mesh(
        new THREE.SphereGeometry(0.13, 10, 10),
        mat(0x53bce6, { emissive: 0x53bce6, emissiveIntensity: 1 }),
        0.7,
        3.95,
        0,
        group,
      );
      nodeLeds.push(led);
      clickable(group, n.id);
      const rings = [];
      for (let r = 0; r < 3; r++) {
        const m = new THREE.MeshBasicMaterial({
          color: 0x2c9bb1,
          transparent: true,
          opacity: 0.25 - r * 0.04,
          side: THREE.DoubleSide,
        });
        mats.push(m);
        const ring = mesh(
          new THREE.RingGeometry(1.5 + r * 0.6, 1.54 + r * 0.6, 56),
          m,
          n.x,
          0.39,
          n.z,
        );
        ring.rotation.x = -Math.PI / 2;
        rings.push(ring);
      }
      nodeRings.push(rings);
      label(n.short, n.x, 5.3, n.z);
    });
    const paths = homes.map((home) => {
      const n = NODES[home.node];
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(home.x, 1.6, home.z),
        new THREE.Vector3((home.x + n.x) / 2, 5.5, (home.z + n.z) / 2),
        new THREE.Vector3(n.x, 3.1, n.z),
      );
      const lineMat = new THREE.MeshBasicMaterial({
        color: 0x2b99bf,
        transparent: true,
        opacity: 0,
      });
      mats.push(lineMat);
      const line = mesh(
        new THREE.TubeGeometry(curve, 30, 0.045, 5, false),
        lineMat,
      );
      line.castShadow = false;
      const dots = Array.from({ length: 4 }, () =>
        mesh(
          new THREE.SphereGeometry(0.12, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0x125779 }),
        ),
      );
      dots.forEach((dot) => {
        mats.push(dot.material as THREE.Material);
        dot.castShadow = false;
      });
      return { home, curve, line, lineMat, dots };
    });
    const ray = new THREE.Raycaster(),
      pointer = new THREE.Vector2();
    let moving = false,
      lastX = 0,
      lastY = 0;
    const pick = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        (-(event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      ray.setFromCamera(pointer, camera);
      const id = ray.intersectObjects(pickables, false)[0]?.object.userData.key;
      renderer.domElement.style.cursor = id ? "pointer" : "grab";
      if (id && !moving) setSelected(id);
    };
    const down = (e: PointerEvent) => {
      moving = false;
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const pointMove = (e: PointerEvent) => {
      if (
        e.buttons &&
        Math.abs(e.clientX - lastX) + Math.abs(e.clientY - lastY) > 3
      )
        moving = true;
      lastX = e.clientX;
      lastY = e.clientY;
      if (!e.buttons) pick(e);
    };
    const up = (e: PointerEvent) => {
      if (!moving) pick(e);
      moving = false;
    };
    renderer.domElement.addEventListener("pointerdown", down);
    renderer.domElement.addEventListener("pointermove", pointMove);
    renderer.domElement.addEventListener("pointerup", up);
    const resize = () => {
      const w = mount.clientWidth,
        h = mount.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(mount);
    resize();
    let visible = true;
    const io = new IntersectionObserver(
      ([entry]) => (visible = entry.isIntersecting),
      { rootMargin: "150px" },
    );
    io.observe(mount);
    let frame = 0;
    const start = performance.now(),
      reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      if (!visible || document.hidden) return;
      const t = (performance.now() - start) / 1000,
        s = state.current,
        pulse = reduced ? 1 : 0.75 + 0.25 * Math.sin(t * 3.5);
      controls.update();
      const width = 3.4 + s.flood * 0.057,
        y = 0.43 + s.flood * 0.0075;
      const positions = waterGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i <= waterCount; i++) {
        const z = -19 + (i / waterCount) * 38,
          c = riverX(z),
          variation = 1 + 0.09 * Math.sin(z * 0.42);
        positions.setXYZ(i * 2, c - (width / 2) * variation, y, z);
        positions.setXYZ(i * 2 + 1, c + (width / 2) * variation, y, z);
      }
      positions.needsUpdate = true;
      waterGeo.computeVertexNormals();
      paths.forEach((p) => {
        const selected =
          s.selected === p.home.id || s.selected === NODES[p.home.node].id;
        p.line.visible = s.active && selected;
        p.lineMat.opacity = selected ? 0.9 : 0;
        p.dots.forEach((d, i) => {
          d.visible = s.active && selected;
          d.position.copy(
            p.curve.getPoint(reduced ? 0.4 : (t * 0.17 + i / 4) % 1),
          );
        });
      });
      homes.forEach((h) => {
        const chosen = s.selected === h.id;
        homeMaterials[h.id].forEach(
          (m) => (m.emissiveIntensity = chosen ? 0.26 + pulse * 0.22 : 0),
        );
        homeRims[h.id].forEach(
          (rim) =>
            ((rim.material as THREE.LineBasicMaterial).opacity = chosen
              ? 0.65 + pulse * 0.35
              : 0),
        );
        const ring = homeRings[h.id];
        ring.position.y = y + 0.025;
        (ring.material as THREE.MeshBasicMaterial).opacity = chosen
          ? 0.55 + pulse * 0.4
          : 0;
        ring.scale.setScalar(chosen ? 1 + pulse * 0.09 : 1);
      });
      nodeRings.forEach((rings, i) =>
        rings.forEach((ring, r) => {
          ring.visible = s.active;
          ring.position.y = y + 0.015;
          (ring.material as THREE.MeshBasicMaterial).opacity = s.active
            ? (0.25 - r * 0.04) *
              (reduced ? 1 : 0.7 + 0.3 * Math.sin(t * 1.4 - r))
            : 0;
        }),
      );
      nodeLeds.forEach(
        (led) =>
          ((led.material as THREE.MeshStandardMaterial).emissiveIntensity =
            s.active ? 1.15 : 0.05),
      );
      if (s.zoom) {
        camera.position
          .sub(controls.target)
          .multiplyScalar(s.zoom > 0 ? 0.88 : 1.12)
          .add(controls.target);
        s.zoom = 0;
      }
      if (s.reset) {
        camera.position.copy(initial);
        controls.target.set(0, 1.1, 0.3);
        controls.update();
        s.reset = false;
      }
      renderer.render(scene, camera);
    };
    animate();
    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
      ro.disconnect();
      renderer.domElement.removeEventListener("pointerdown", down);
      renderer.domElement.removeEventListener("pointermove", pointMove);
      renderer.domElement.removeEventListener("pointerup", up);
      controls.dispose();
      geos.forEach((g) => g.dispose());
      mats.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);
  return (
    <section
      className="tg-city-area"
      aria-label="Interactive Kathmandu-inspired riverside neighbourhood"
    >
      <div className="tg-city-area-stage">
        <div className="tg-city-area-canvas" ref={host} />
        {fallback && (
          <div className="tg-area-fallback">
            <Home size={42} />
            <p>Select a family below to explore their community connection.</p>
          </div>
        )}
        <div className="tg-area-badge">
          <span />
          KATHMANDU · ILLUSTRATED NEIGHBOURHOOD
        </div>
        <div className="tg-area-legend">
          <span>
            <Home size={13} />
            24 households
          </span>
          <span>
            <Radio size={13} />4 hubs
          </span>
        </div>
        <div className="tg-area-camera">
          <button
            aria-label="Zoom in on city"
            onClick={() => (state.current.zoom = 1)}
          >
            <Plus size={16} />
          </button>
          <button
            aria-label="Zoom out from city"
            onClick={() => (state.current.zoom = -1)}
          >
            <Minus size={16} />
          </button>
          <button
            aria-label="Reset city view"
            onClick={() => (state.current.reset = true)}
          >
            <RotateCcw size={15} />
          </button>
        </div>
        <div className="tg-area-hint">
          <MousePointer2 size={13} />
          Hover or tap a home<span>·</span>
          <Move size={13} />
          Drag to explore
        </div>
        <aside className="tg-area-family" aria-live="polite">
          <div className="tg-area-avatar">
            {family ? <Users size={23} /> : <Radio size={23} />}
          </div>
          <span className="tg-area-kicker">
            {family
              ? "HOME " + String(homes.indexOf(family) + 1).padStart(2, "0")
              : "COMMUNITY HUB"}
          </span>
          <h3>{family ? family.name : node.name}</h3>
          <p>
            {family
              ? family.contact
              : nodeHomes.length +
                " homes · " +
                nodeHomes.reduce((n, h) => n + h.members, 0) +
                " residents"}
          </p>
          {family && (
            <>
              <div className="tg-area-facts">
                <span>
                  <Users size={13} />
                  {family.members} people
                </span>
                <span>{family.children} children</span>
              </div>
              <div className="tg-area-need">
                <span className={family.need === "All safe" ? "safe" : ""} />
                {family.need}
              </div>
            </>
          )}
          <div className="tg-area-connected">
            <Wifi size={14} />
            {active ? "Connected to " + node.short : "Connections paused"}
          </div>
          <small>
            {family
              ? "Fictional family · demonstration"
              : "Illustrative hub · demonstration"}
          </small>
        </aside>
      </div>
      <div className="tg-area-controls">
        <label>
          <Droplets size={17} />
          <span>Flood level</span>
          <input
            aria-label="City flood water level"
            type="range"
            min="0"
            max="100"
            value={flood}
            onChange={(e) => setFlood(Number(e.target.value))}
          />
          <b>{flood < 30 ? "River" : flood < 65 ? "Rising" : "Flooded"}</b>
        </label>
        <button
          className={"tg-area-network " + (active ? "active" : "")}
          aria-pressed={active}
          onClick={() => setActive(!active)}
        >
          <span />
          {active ? "Nodes active" : "Activate nodes"}
        </button>
        <select
          aria-label="Select a home or node"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          <optgroup label="Community hubs">
            {NODES.map((n) => (
              <option value={n.id} key={n.id}>
                {n.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="Homes">
            {homes.map((h, i) => (
              <option value={h.id} key={h.id}>
                Home {i + 1} · {h.name}
              </option>
            ))}
          </optgroup>
        </select>
      </div>
      <p className="tg-area-caption">
        Original Kathmandu-inspired area model. Buildings, families, flooding
        and radio links are illustrative, not geographically accurate or a
        forecast.
      </p>
    </section>
  );
}
