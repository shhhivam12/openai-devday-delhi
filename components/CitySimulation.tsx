"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  Home,
  Radio,
  Users,
  MapPin,
  Wifi,
  MousePointer2,
  Move,
  Plus,
  Minus,
  Droplets,
} from "lucide-react";
import "./city-simulation.css";

const NODES = [
  { id: "node-0", name: "School hub", short: "School", x: -10, z: -9 },
  { id: "node-1", name: "Riverside hub", short: "Riverside hub", x: 10, z: -9 },
  { id: "node-2", name: "Health post", short: "Health post", x: -10, z: 8 },
  { id: "node-3", name: "Hill centre", short: "Hill centre", x: 10, z: 8 },
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
const homes = surnames.map((surname, i) => {
  const x = [-11.3, -7.2, -3.6, 3.6, 7.2, 11.3][i % 6],
    z = [-6.3, -1.8, 2.7, 6.8][Math.floor(i / 6)];
  const node = x < 0 ? (z < 0 ? 0 : 2) : z < 0 ? 1 : 3;
  return {
    id: "home-" + i,
    name: surname + " family",
    contact: firstNames[i] + " " + surname,
    members: 2 + (i % 5),
    children: i % 3,
    need: ["Water", "Check-in", "Shelter", "All safe", "Supplies", "Check-in"][
      i % 6
    ],
    x,
    z,
    node,
  };
});
export default function CitySimulation() {
  const host = useRef<HTMLDivElement>(null),
    markerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [selected, setSelected] = useState("home-0"),
    [flood, setFlood] = useState(38),
    [active, setActive] = useState(true),
    [fallback, setFallback] = useState(false);
  const state = useRef({ selected, flood, active, zoom: 0 });
  state.current.selected = selected;
  state.current.flood = flood;
  state.current.active = active;
  const family = homes.find((h) => h.id === selected),
    node = family
      ? NODES[family.node]
      : NODES.find((n) => n.id === selected) || NODES[0];
  const nodeHomes = homes.filter(
    (h) => h.node === NODES.findIndex((n) => n.id === node.id),
  );
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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
    renderer.setClearColor(0x081225, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.setAttribute(
      "aria-label",
      "Illustrated Kathmandu city. Hover or tap a home to see its fictional family and animated connection to a relief node.",
    );
    renderer.domElement.setAttribute("role", "img");
    mount.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x081225, 45, 100);
    const camera = new THREE.PerspectiveCamera(37, 1, 0.1, 150);
    camera.position.set(29, 30, 34);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.2, 0);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 24;
    controls.maxDistance = 65;
    controls.maxPolarAngle = Math.PI / 2.45;
    controls.minPolarAngle = 0.25;
    controls.update();
    scene.add(new THREE.HemisphereLight(0xd8ecff, 0x234059, 2.25));
    const light = new THREE.DirectionalLight(0xe5f4ff, 3);
    light.position.set(-15, 25, 12);
    light.castShadow = true;
    light.shadow.mapSize.set(1024, 1024);
    Object.assign(light.shadow.camera, {
      left: -22,
      right: 22,
      top: 22,
      bottom: -22,
    });
    light.shadow.normalBias = 0.04;
    scene.add(light);
    const materials: THREE.Material[] = [],
      geometries: THREE.BufferGeometry[] = [],
      textures: THREE.Texture[] = [],
      pickables: THREE.Object3D[] = [];
    const mat = (
      color: THREE.ColorRepresentation,
      extra: THREE.MeshStandardMaterialParameters = {},
    ) => {
      const m = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.8,
        flatShading: true,
        ...extra,
      });
      materials.push(m);
      return m;
    };
    const mesh = (
      geo: THREE.BufferGeometry,
      m: THREE.Material,
      x = 0,
      y = 0,
      z = 0,
      parent: THREE.Object3D = scene,
    ) => {
      geometries.push(geo);
      const o = new THREE.Mesh(geo, m);
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
      x = 0,
      y = 0,
      z = 0,
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
      mesh(new THREE.CylinderGeometry(r, rb, h, 12), mat(c), x, y, z, parent);
    const label = (
      text: string,
      x: number,
      y: number,
      z: number,
      color = "#c1e8ff",
    ) => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 96;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#101f38";
      ctx.fillRect(0, 0, 512, 96);
      ctx.strokeStyle = "#4e759e";
      ctx.lineWidth = 3;
      ctx.strokeRect(1, 1, 510, 94);
      ctx.fillStyle = color;
      ctx.font = "600 31px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, 256, 49);
      const texture = new THREE.CanvasTexture(canvas);
      textures.push(texture);
      const m = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false,
      });
      materials.push(m);
      const sprite = new THREE.Sprite(m);
      sprite.position.set(x, y, z);
      sprite.scale.set(4.5, 0.85, 1);
      sprite.renderOrder = 9;
      scene.add(sprite);
      return sprite;
    };
    const clickable = (o: THREE.Object3D, id: string) => {
      o.traverse((child) => {
        child.userData.key = id;
        if (child instanceof THREE.Mesh) pickables.push(child);
      });
    };
    // Raised city base, streets, river and four bridges.
    box(31, 0.8, 23, 0x1b3047, 0, -0.5, 0);
    box(30.7, 0.12, 22.7, 0x556b78, 0, -0.04, 0);
    for (const x of [-9.25, -5.3, 5.3, 9.25])
      box(0.72, 0.035, 20.8, 0x9baab0, x, 0.045, 0);
    for (const z of [-4.1, 0.4, 4.9]) {
      box(29, 0.04, 0.72, 0xa2afb4, 0, 0.05, z);
      for (let i = -13; i < 14; i += 2)
        box(0.6, 0.045, 0.07, 0xdce8ed, i, 0.078, z);
    }
    const river = mesh(
      new THREE.BoxGeometry(3.2, 0.15, 23.2),
      mat(0x2e9ac4, {
        transparent: true,
        opacity: 0.76,
        metalness: 0.2,
        roughness: 0.2,
      }),
      0,
      0.11,
      0,
    );
    const riverGlow = mesh(
      new THREE.PlaneGeometry(3.1, 23),
      mat(0x53d2e0, { transparent: true, opacity: 0.2 }),
      0,
      0.2,
      0,
    );
    riverGlow.rotation.x = -Math.PI / 2;
    for (const z of [-4.1, 4.9]) {
      box(4.6, 0.15, 1.0, 0xd8e0e4, 0, 0.42, z);
      for (const zz of [z - 0.5, z + 0.5]) {
        box(4.6, 0.07, 0.06, 0x253b55, 0, 1.05, zz);
        for (let x = -2.1; x < 2.2; x += 0.6)
          cylinder(0.025, 0.025, 0.58, 0x314b65, x, 0.75, zz);
      }
    }
    // Architectural silhouettes: Kathmandu-inspired red-brick homes, flat roofs, terraces.
    const homeGroups: Record<string, THREE.Group> = {},
      homeRings: Record<string, THREE.Mesh> = {};
    homes.forEach((home, i) => {
      const group = new THREE.Group();
      group.position.set(home.x, 0, home.z);
      scene.add(group);
      homeGroups[home.id] = group;
      const floors = 2 + (i % 3),
        height = floors * 0.59;
      const brick = [0x7a4b60, 0x8b5864, 0x6c5877, 0x62758a, 0x997780][i % 5];
      box(1.8, 0.16, 2.1, 0xc5c9c9, 0, 0.12, 0, group);
      box(1.5, height, 1.75, brick, 0, 0.24 + height / 2, 0, group);
      for (let floor = 0; floor < floors; floor++) {
        const yy = 0.48 + floor * 0.59;
        for (const xx of [-0.43, 0.43]) {
          box(0.3, 0.36, 0.035, 0x9bd9ec, xx, yy, 0.89, group);
          box(0.32, 0.045, 0.05, 0x273a52, xx, yy + 0.2, 0.91, group);
        }
        box(1.56, 0.05, 1.8, 0xb4bcc6, 0, 0.25 + (floor + 1) * 0.59, 0, group);
      }
      box(0.32, 0.55, 0.045, 0x243c59, 0, 0.43, 0.9, group);
      box(1.72, 0.12, 1.94, 0x263b57, 0, height + 0.32, 0, group);
      if (i % 3 === 0) {
        const roof = mesh(
          new THREE.ConeGeometry(1.38, 0.5, 4),
          mat(0x27384f),
          0,
          height + 0.59,
          0,
          group,
        );
        roof.rotation.y = Math.PI / 4;
      } else {
        box(0.12, 0.23, 1.88, 0xbdc8d3, -0.8, height + 0.46, 0, group);
        box(0.12, 0.23, 1.88, 0xbdc8d3, 0.8, height + 0.46, 0, group);
        cylinder(0.22, 0.22, 0.45, 0x2a415b, 0.35, height + 0.62, -0.4, group);
      }
      if (i % 4 === 0) {
        const cloth = box(
          0.5,
          0.04,
          0.45,
          0x277be7,
          -0.3,
          height + 0.42,
          0.2,
          group,
        );
        cloth.rotation.y = 0.12;
      }
      clickable(group, home.id);
      const ring = mesh(
        new THREE.RingGeometry(1.18, 1.26, 40),
        new THREE.MeshBasicMaterial({
          color: 0x6ee7f9,
          transparent: true,
          opacity: 0,
          side: THREE.DoubleSide,
        }),
        home.x,
        0.27,
        home.z,
      );
      materials.push(ring.material as THREE.Material);
      ring.rotation.x = -Math.PI / 2;
      homeRings[home.id] = ring;
      // Tiny resident characters beside select homes.
      if (i % 3 === 0) {
        for (let p = 0; p < 2; p++) {
          const px = 0.95 + p * 0.28;
          const person = new THREE.Group();
          person.position.set(px, 0.1, 0.5);
          group.add(person);
          cylinder(
            0.065,
            0.09,
            0.27,
            p ? 0x8b9df2 : 0x35c9de,
            0,
            0.24,
            0,
            person,
          );
          mesh(
            new THREE.SphereGeometry(0.075, 8, 8),
            mat(0xe8c4ae),
            0,
            0.44,
            0,
            person,
          );
        }
      }
    });
    // Pagoda-like temple, stepped plinth and layered roofs.
    const temple = new THREE.Group();
    temple.position.set(5.1, 0, -10);
    scene.add(temple);
    box(2.5, 0.2, 2.5, 0xa8a8b4, 0, 0.16, 0, temple);
    box(1.8, 1.05, 1.8, 0x765064, 0, 0.78, 0, temple);
    for (let i = 0; i < 3; i++) {
      const roof = mesh(
        new THREE.ConeGeometry(1.8 - i * 0.43, 0.65, 4),
        mat(0x263b56),
        0,
        1.55 + i * 0.67,
        0,
        temple,
      );
      roof.rotation.y = Math.PI / 4;
      if (i < 2)
        box(
          0.85 - i * 0.18,
          0.6,
          0.85 - i * 0.18,
          0x896172,
          0,
          1.8 + i * 0.67,
          0,
          temple,
        );
    }
    cylinder(0.055, 0.1, 0.7, 0xc4d5e7, 5.1, 3.63, -10);
    // Hills give city context without presenting a geographic model.
    for (let i = 0; i < 10; i++) {
      const hill = mesh(
        new THREE.ConeGeometry(3.5 + (i % 3), 6 + (i % 4), 5),
        mat(i % 2 ? 0x263e58 : 0x1e334c),
        -21 + i * 4.6,
        1.8,
        -17 - (i % 2) * 2,
      );
      hill.rotation.y = i * 0.4;
    }
    const nodeRings: THREE.Mesh[][] = [],
      nodeLeds: THREE.Mesh[] = [];
    NODES.forEach((n, i) => {
      const group = new THREE.Group();
      group.position.set(n.x, 0, n.z);
      scene.add(group);
      box(2.4, 0.3, 2.2, 0x213a62, 0, 0.3, 0, group);
      box(1.9, 1.1, 1.7, 0xe7f0f6, 0, 1, 0, group);
      box(2.2, 0.18, 2.0, 0x277be7, 0, 1.65, 0, group);
      box(0.7, 0.8, 0.04, 0x2c7ac7, 0, 0.9, 0.87, group);
      cylinder(0.07, 0.09, 2.3, 0x17365d, 0.6, 2.8, 0, group);
      const led = mesh(
        new THREE.SphereGeometry(0.14, 12, 12),
        mat(0x42e5ef, { emissive: 0x42e5ef, emissiveIntensity: 1.8 }),
        0.6,
        4,
        0,
        group,
      );
      nodeLeds.push(led);
      clickable(group, n.id);
      const rings = [];
      for (let r = 0; r < 3; r++) {
        const m = new THREE.MeshBasicMaterial({
          color: 0x29bce2,
          transparent: true,
          opacity: 0.45 - r * 0.1,
          side: THREE.DoubleSide,
        });
        materials.push(m);
        const ring = mesh(
          new THREE.RingGeometry(1.1 + r * 0.6, 1.13 + r * 0.6, 56),
          m,
          n.x,
          0.29,
          n.z,
        );
        ring.rotation.x = -Math.PI / 2;
        rings.push(ring);
      }
      nodeRings.push(rings);
      label(n.short, n.x, 4.8, n.z);
    });
    // Connections are visual explanations, not simulated RF measurements.
    const paths = homes.map((home) => {
      const n = NODES[home.node];
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(home.x, 0.9, home.z),
        new THREE.Vector3((home.x + n.x) / 2, 3.8, (home.z + n.z) / 2),
        new THREE.Vector3(n.x, 2.7, n.z),
      );
      const lineMat = new THREE.MeshBasicMaterial({
        color: 0x46d9f2,
        transparent: true,
        opacity: 0.08,
      });
      materials.push(lineMat);
      const line = mesh(
        new THREE.TubeGeometry(curve, 30, 0.028, 5, false),
        lineMat,
      );
      const dots = Array.from({ length: 3 }, () =>
        mesh(
          new THREE.SphereGeometry(0.09, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0xb8f9ff }),
        ),
      );
      dots.forEach((d) => materials.push(d.material as THREE.Material));
      return { home, curve, line, lineMat, dots };
    });
    const stars = [];
    for (let i = 0; i < 18; i++) {
      const star = mesh(
        new THREE.PlaneGeometry(0.08, 0.5),
        mat(0x83d6e6, { transparent: true, opacity: 0.3 }),
        Math.sin(i * 2.4) * 1.2,
        0.25,
        -10 + i * 1.2,
      );
      star.rotation.x = -Math.PI / 2;
      stars.push(star);
    }
    const ray = new THREE.Raycaster(),
      pointer = new THREE.Vector2();
    let moving = false;
    const pick = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        (-(event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      ray.setFromCamera(pointer, camera);
      const hit = ray.intersectObjects(pickables, false)[0];
      const id = hit?.object.userData.key;
      renderer.domElement.style.cursor = id ? "pointer" : "grab";
      if (id && !moving) setSelected(id);
    };
    const down = () => {
      moving = false;
    };
    let lastX = 0,
      lastY = 0;
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
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();
    let sceneVisible = true;
    const visibility = new IntersectionObserver(
      ([entry]) => {
        sceneVisible = entry.isIntersecting;
      },
      { rootMargin: "150px" },
    );
    visibility.observe(mount);
    let frame = 0;
    const start = performance.now();
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      if (!sceneVisible || document.hidden) return;
      const t = (performance.now() - start) / 1000,
        s = state.current;
      controls.update();
      river.scale.x = 1 + (s.flood / 100) * 1.3;
      river.position.y = 0.11 + (s.flood / 100) * 0.55;
      riverGlow.scale.x = river.scale.x;
      riverGlow.position.y = river.position.y + 0.09;
      paths.forEach((p) => {
        const isSelected =
          s.selected === p.home.id || s.selected === NODES[p.home.node].id;
        p.line.visible = s.active && isSelected;
        p.lineMat.opacity = isSelected ? 0.82 : 0;
        p.dots.forEach((dot, i) => {
          dot.visible = s.active && isSelected;
          dot.position.copy(
            p.curve.getPoint(reduced ? 0.4 : (t * 0.19 + i / 3) % 1),
          );
        });
      });
      Object.entries(homeRings).forEach(([id, ring]) => {
        (ring.material as THREE.MeshBasicMaterial).opacity =
          s.selected === id ? 0.9 : 0;
      });
      nodeRings.forEach((rings, i) =>
        rings.forEach((ring, r) => {
          ring.visible = s.active;
          (ring.material as THREE.MeshBasicMaterial).opacity = s.active
            ? (0.3 - r * 0.05) *
              (reduced ? 1 : 0.7 + 0.3 * Math.sin(t * 1.5 - r))
            : 0;
        }),
      );
      nodeLeds.forEach((led) => {
        (led.material as THREE.MeshStandardMaterial).emissiveIntensity =
          s.active ? 1.8 : 0.05;
      });
      if (s.zoom) {
        camera.position
          .sub(controls.target)
          .multiplyScalar(s.zoom > 0 ? 0.9 : 1.1)
          .add(controls.target);
        s.zoom = 0;
      }
      renderer.render(scene, camera);
    };
    animate();
    return () => {
      cancelAnimationFrame(frame);
      visibility.disconnect();
      observer.disconnect();
      renderer.domElement.removeEventListener("pointerdown", down);
      renderer.domElement.removeEventListener("pointermove", pointMove);
      renderer.domElement.removeEventListener("pointerup", up);
      controls.dispose();
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);
  return (
    <section
      className="tg-city"
      aria-label="Interactive Kathmandu city and community node illustration"
    >
      <div className="tg-city-stage">
        <div ref={host} className="tg-city-canvas" />
        {fallback && (
          <div className="tg-scene-fallback">
            <Home size={44} />
            <p>Explore the homes using the selector below.</p>
          </div>
        )}
        <div className="tg-city-badge">
          <span /> KATHMANDU · ILLUSTRATED CITY
        </div>
        <div className="tg-city-legend">
          <span>
            <Home size={13} />
            24 homes
          </span>
          <span>
            <Radio size={13} />4 hubs
          </span>
        </div>
        <div className="tg-city-zoom">
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
        </div>
        <div className="tg-city-hint">
          <MousePointer2 size={14} /> Hover or tap a home <span>·</span>
          <Move size={13} /> Drag to rotate
        </div>
        <aside className="tg-family-card" aria-live="polite">
          <div className="tg-family-avatar">
            {family ? <Users size={24} /> : <Radio size={24} />}
          </div>
          <span className="tg-detail-kicker">
            {family
              ? "HOME " + String(homes.indexOf(family) + 1).padStart(2, "0")
              : "COMMUNITY HUB"}
          </span>
          <h3>{family ? family.name : node.name}</h3>
          {family ? (
            <>
              <p>{family.contact}</p>
              <div className="tg-family-facts">
                <span>
                  <Users size={14} />
                  {family.members} people
                </span>
                <span>{family.children} children</span>
              </div>
              <div className="tg-family-need">
                <span className={family.need === "All safe" ? "safe" : ""} />
                {family.need}
              </div>
            </>
          ) : (
            <p>
              {nodeHomes.length} homes ·{" "}
              {nodeHomes.reduce((n, h) => n + h.members, 0)} residents
            </p>
          )}
          <div className="tg-connected">
            <Wifi size={15} />
            {active ? "Connected to " + node.short : "Connections paused"}
          </div>
          <span className="tg-fictional">
            {family
              ? "Fictional family · demonstration"
              : "Illustrative hub · demonstration"}
          </span>
        </aside>
      </div>
      <div className="tg-city-bottom">
        <label className="tg-flood-slider">
          <Droplets size={18} />
          <span>Water level</span>
          <input
            aria-label="City flood water level"
            type="range"
            min="0"
            max="100"
            value={flood}
            onChange={(e) => setFlood(Number(e.target.value))}
          />
        </label>
        <button
          className={"tg-network-toggle " + (active ? "active" : "")}
          onClick={() => setActive(!active)}
          aria-pressed={active}
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
      <p className="tg-scene-caption">
        Kathmandu-inspired illustration. Families, connections and water levels
        are simulated; this is not a flood forecast or radio-coverage map.
      </p>
    </section>
  );
}
