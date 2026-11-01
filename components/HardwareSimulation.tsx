"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  Cpu,
  Radio,
  Cable,
  Wifi,
  Smartphone,
  BatteryCharging,
  Move,
  Layers,
  ArrowRight,
  Check,
} from "lucide-react";
import "./city-simulation.css";
const WIRES = [
  {
    id: "sck",
    signal: "SCK",
    pin: "GPIO 18",
    color: "#357650",
    description: "SPI clock synchronizes transfers.",
  },
  {
    id: "miso",
    signal: "MISO",
    pin: "GPIO 19",
    color: "#8d7155",
    description: "Radio data returns to the ESP32.",
  },
  {
    id: "mosi",
    signal: "MOSI",
    pin: "GPIO 23",
    color: "#a55b68",
    description: "ESP32 data goes to the radio.",
  },
  {
    id: "nss",
    signal: "NSS / CS",
    pin: "GPIO 5",
    color: "#9c8f45",
    description: "Chip-select chooses the radio.",
  },
  {
    id: "reset",
    signal: "RESET",
    pin: "GPIO 14",
    color: "#7e9b6d",
    description: "Resets the illustrative radio module.",
  },
  {
    id: "dio",
    signal: "DIO0",
    pin: "GPIO 26",
    color: "#254c35",
    description: "Radio interrupt signals a received or sent event.",
  },
  {
    id: "power",
    signal: "3V3",
    pin: "3.3 V",
    color: "#b85656",
    description: "A compatible regulated 3.3 V radio supply.",
  },
  {
    id: "ground",
    signal: "GND",
    pin: "GND",
    color: "#536054",
    description: "Shared electrical ground.",
  },
];
const PARTS: Record<string, { title: string; body: string; icon: string }> = {
  pi: {
    title: "Raspberry Pi hub",
    body: "Serves the local app, saved information and the message queue. This demo uses cloud APIs for AI.",
    icon: "cpu",
  },
  esp: {
    title: "ESP32 controller",
    body: "Controls the separate LoRa transceiver. USB serial links this controller to the Pi.",
    icon: "cpu",
  },
  radio: {
    title: "SX127x LoRa module",
    body: "A separate radio chip moves short messages. Eight jumper connections illustrate its SPI, control and power interface.",
    icon: "radio",
  },
  phone: {
    title: "Your phone",
    body: "Joins nearby node Wi-Fi to use Together. Cached reading works without internet; community communication still needs a local link.",
    icon: "phone",
  },
  power: {
    title: "Battery reserve",
    body: "Supplies the hub and controller. A field installation needs a measured power budget and suitable regulation.",
    icon: "power",
  },
  antenna: {
    title: "LoRa antenna",
    body: "Carries radio signals between equipped points. Actual range depends on the site, radio settings and regional rules.",
    icon: "radio",
  },
};
export default function HardwareSimulation() {
  const host = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState("radio"),
    [wire, setWire] = useState("sck"),
    [lift, setLift] = useState(false),
    [fallback, setFallback] = useState(false);
  const state = useRef({ selected, wire, lift });
  state.current = { selected, wire, lift };
  const part = PARTS[selected] || PARTS.radio,
    wiring = WIRES.find((w) => w.id === wire) || WIRES[0];
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
    renderer.setClearColor(0xf6f6ef, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.setAttribute("role", "img");
    renderer.domElement.setAttribute(
      "aria-label",
      "Conceptual Raspberry Pi hub, ESP32 controller, separate SX127x LoRa module, breadboard and colored jumper wires. Select a connection in the list.",
    );
    mount.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(14, 18, 21);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1, 0);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 17;
    controls.maxDistance = 36;
    controls.maxPolarAngle = Math.PI / 2.5;
    controls.minPolarAngle = 0.25;
    controls.update();
    scene.add(new THREE.HemisphereLight(0xffffff, 0xb8c3ad, 2.5));
    const sun = new THREE.DirectionalLight(0xfffdf5, 3.4);
    sun.position.set(-9, 15, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, {
      left: -14,
      right: 14,
      top: 14,
      bottom: -14,
    });
    sun.shadow.normalBias = 0.025;
    scene.add(sun);
    const materials: THREE.Material[] = [],
      geometries: THREE.BufferGeometry[] = [],
      textures: THREE.Texture[] = [],
      pickables: THREE.Object3D[] = [];
    const material = (
      color: THREE.ColorRepresentation,
      extra: THREE.MeshStandardMaterialParameters = {},
    ) => {
      const m = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.65,
        ...extra,
      });
      materials.push(m);
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
      geometries.push(g);
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
    ) => mesh(new THREE.BoxGeometry(w, h, d), material(c), x, y, z, parent);
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
      mesh(
        new THREE.CylinderGeometry(r, rb, h, 14),
        material(c),
        x,
        y,
        z,
        parent,
      );
    const label = (
      text: string,
      x: number,
      y: number,
      z: number,
      width = 3.2,
    ) => {
      const c = document.createElement("canvas");
      c.width = 512;
      c.height = 96;
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "#fffef7";
      ctx.fillRect(0, 0, 512, 96);
      ctx.strokeStyle = "#b9c7ae";
      ctx.lineWidth = 3;
      ctx.strokeRect(1, 1, 510, 94);
      ctx.font = "600 44px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#294a35";
      ctx.fillText(text, 256, 48);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      textures.push(t);
      const m = new THREE.SpriteMaterial({
        map: t,
        toneMapped: false,
        transparent: true,
        depthTest: false,
      });
      materials.push(m);
      const s = new THREE.Sprite(m);
      s.position.set(x, y, z);
      s.scale.set(width, width * 0.1875, 1);
      s.renderOrder = 10;
      scene.add(s);
      return s;
    };
    const clickable = (object: THREE.Object3D, key: string) =>
      object.traverse((c) => {
        c.userData.part = key;
        if (c instanceof THREE.Mesh) pickables.push(c);
      });
    box(19, 0.32, 13, 0x3c5740, 0, -0.3, 0);
    box(18.8, 0.07, 12.8, 0x3c5740, 0, -0.1, 0);
    // Full breadboard and its visible pin holes, power rails and central channel.
    box(8.9, 0.24, 5.2, 0xf2f4e8, 2.2, 0.2, 0.5);
    box(8.65, 0.025, 0.17, 0xc1cbb6, 2.2, 0.34, 0.5);
    for (const z of [-1.65, 2.65]) {
      box(8.6, 0.015, 0.035, 0xc1cbb6, 2.2, 0.34, z);
      box(8.6, 0.015, 0.035, 0x99ab8f, 2.2, 0.34, z + 0.22);
    }
    for (let x = -1.7; x < 6.35; x += 0.31) {
      for (const z of [
        -1.3, -0.99, -0.68, -0.37, 0.02, 0.97, 1.28, 1.59, 1.9, 2.21,
      ]) {
        const hole = mesh(
          new THREE.CylinderGeometry(0.035, 0.035, 0.012, 6),
          material(0x99ab8f),
          x,
          0.338,
          z,
        );
        hole.castShadow = false;
      }
    }
    // Pi board with processor, GPIO header and silver ports.
    const pi = new THREE.Group();
    pi.position.set(-5, 0.4, -0.6);
    scene.add(pi);
    box(4.2, 0.14, 3.0, 0x6d8765, 0, 0, 0, pi);
    box(1, 0.17, 1.0, 0x26392b, -0.1, 0.19, 0, pi);
    box(0.8, 0.13, 0.62, 0xdce2d1, -1.2, 0.18, 0.7, pi);
    for (let i = 0; i < 2; i++)
      box(0.75, 0.6, 0.65, 0xdce2d1, 1.75, 0.3, -0.65 + i * 1.4, pi);
    box(1.2, 0.4, 0.48, 0xdce2d1, 0, 0.24, 1.42, pi);
    for (let i = 0; i < 20; i++) {
      box(0.07, 0.22, 0.07, 0xc1cbb6, -1.8 + i * 0.17, 0.17, -1.2, pi);
      box(0.07, 0.22, 0.07, 0xc1cbb6, -1.8 + i * 0.17, 0.17, -0.98, pi);
    }
    for (const x of [-1.9, 1.9])
      for (const z of [-1.3, 1.3])
        cylinder(0.08, 0.08, 0.03, 0xdce2d1, x, 0.1, z, pi);
    clickable(pi, "pi");
    // ESP32 sits independently to the left of its radio transceiver.
    const esp = new THREE.Group();
    esp.position.set(0.1, 0.52, -0.15);
    scene.add(esp);
    box(2.15, 0.13, 3.55, 0x3c5740, 0, 0, 0, esp);
    box(1.45, 0.2, 1.55, 0xdce2d1, 0, 0.18, -0.65, esp);
    box(0.74, 0.14, 0.82, 0x3c5740, 0, 0.17, 0.75, esp);
    box(0.5, 0.28, 0.4, 0xdce2d1, 0, 0.15, 1.73, esp);
    for (let i = 0; i < 12; i++) {
      box(0.09, 0.24, 0.09, 0xdce2d1, -1.0, -0.02, -1.45 + i * 0.27, esp);
      box(0.09, 0.24, 0.09, 0xdce2d1, 1.0, -0.02, -1.45 + i * 0.27, esp);
    }
    clickable(esp, "esp");
    const radio = new THREE.Group();
    radio.position.set(4.55, 0.57, 0.1);
    scene.add(radio);
    box(2.7, 0.14, 2.8, 0x6d8765, 0, 0, 0, radio);
    box(1.85, 0.35, 1.7, 0xdce2d1, 0, 0.25, -0.25, radio);
    box(1.25, 0.09, 0.6, 0x6d8765, 0, 0.48, -0.25, radio);
    for (let i = 0; i < 8; i++)
      box(0.09, 0.23, 0.09, 0xdce2d1, -1.2, -0.04, -1.05 + i * 0.3, radio);
    const antPort = cylinder(
      0.15,
      0.15,
      0.3,
      0xc1cbb6,
      0.75,
      0.26,
      -1.2,
      radio,
    );
    clickable(radio, "radio");
    // Wire endpoint colors align with the table, not with any unverified board layout.
    const wireObjects: Record<
      string,
      {
        curve: THREE.CatmullRomCurve3;
        mesh: THREE.Mesh;
        material: THREE.MeshStandardMaterial;
        dot: THREE.Mesh;
        start: THREE.Vector3;
        end: THREE.Vector3;
      }
    > = {};
    WIRES.forEach((w, i) => {
      const start = new THREE.Vector3(1.12, 0.78, -1.5 + i * 0.36),
        end = new THREE.Vector3(3.34, 0.81, -0.95 + i * 0.3);
      const curve = new THREE.CatmullRomCurve3([
        start,
        new THREE.Vector3(1.5 + i * 0.07, 2.0 + i * 0.14, -1.1 + i * 0.29),
        new THREE.Vector3(2.85 - i * 0.04, 2.2 + i * 0.11, -0.8 + i * 0.27),
        end,
      ]);
      const m = material(w.color, {
        roughness: 0.35,
        emissive: w.color,
        emissiveIntensity: 0.1,
      });
      const tube = mesh(new THREE.TubeGeometry(curve, 36, 0.035, 7, false), m);
      tube.userData.wire = w.id;
      pickables.push(tube);
      for (const p of [start, end]) {
        box(0.11, 0.15, 0.15, 0x26392b, p.x, p.y, p.z);
        cylinder(0.035, 0.035, 0.18, 0xc1cbb6, p.x, p.y - 0.12, p.z);
      }
      const dm = new THREE.MeshBasicMaterial({ color: w.color });
      materials.push(dm);
      const dot = mesh(new THREE.SphereGeometry(0.065, 8, 8), dm);
      wireObjects[w.id] = { curve, mesh: tube, material: m, dot, start, end };
    });
    const cable = (points: number[][], color: number, r = 0.07) => {
      const curve = new THREE.CatmullRomCurve3(
        points.map(
          (p) => new THREE.Vector3(...(p as [number, number, number])),
        ),
      );
      return mesh(
        new THREE.TubeGeometry(curve, 36, r, 9, false),
        material(color, { roughness: 0.45 }),
      );
    };
    cable(
      [
        [-3.2, 0.8, 0.2],
        [-2.8, 0.25, 2.6],
        [-1.2, 0.25, 3],
        [0.1, 0.72, 1.6],
      ],
      0x37483a,
      0.095,
    );
    label("USB serial", -2, 1.35, 3.2, 2.5);
    const antenna = new THREE.Group();
    antenna.position.set(7.1, 0.25, -2.8);
    scene.add(antenna);
    cylinder(0.5, 0.6, 0.17, 0x26392b, 0, 0.15, 0, antenna);
    cylinder(0.055, 0.08, 4.0, 0x26392b, 0, 2.2, 0, antenna);
    mesh(
      new THREE.SphereGeometry(0.09, 10, 10),
      material(0xc1cbb6, { emissive: 0xc1cbb6, emissiveIntensity: 1.3 }),
      0,
      4.25,
      0,
      antenna,
    );
    clickable(antenna, "antenna");
    cable(
      [
        [5.3, 0.9, -1.1],
        [6.4, 0.4, -1.4],
        [7.1, 0.4, -2.8],
      ],
      0x3c5740,
      0.045,
    );
    const power = new THREE.Group();
    power.position.set(-4.4, 0.3, 4.2);
    scene.add(power);
    box(3.7, 0.65, 1.7, 0xf2f4e8, 0, 0, 0, power);
    box(2.2, 0.03, 0.3, 0x6d8765, 0, 0.35, 0, power);
    for (let i = 0; i < 4; i++)
      box(0.24, 0.04, 0.12, 0x99ab8f, -0.7 + i * 0.45, 0.38, 0, power);
    clickable(power, "power");
    cable(
      [
        [-5.8, 0.7, 3.7],
        [-6.9, 0.2, 2.8],
        [-6.9, 0.4, 0.8],
      ],
      0x3c5740,
      0.08,
    );
    const phone = new THREE.Group();
    phone.position.set(-8, 0.7, 0.3);
    phone.rotation.x = -0.45;
    phone.rotation.z = 0.1;
    scene.add(phone);
    box(1.25, 0.22, 2.5, 0x26392b, 0, 0, 0, phone);
    box(1.06, 0.025, 2.2, 0x2f6145, 0, 0.13, 0, phone);
    box(0.55, 0.026, 0.18, 0xdce2d1, 0, 0.15, -0.63, phone);
    for (let i = 0; i < 3; i++)
      box(
        0.7,
        0.026,
        0.28,
        i === 0 ? 0xc1cbb6 : 0x6d8765,
        0,
        0.15,
        -0.15 + i * 0.52,
        phone,
      );
    clickable(phone, "phone");
    const labels = [
      label("Raspberry Pi", -5, 2.2, -1.5),
      label("ESP32", -0.3, 2.6, -2.6, 2.3),
      label("SX127x radio", 4.6, 2.5, 1.1, 3.0),
      label("LoRa antenna", 7, 5.2, -2.8, 3.1),
      label("Phone · Wi-Fi", -8, 2.0, 0.2, 3.0),
      label("Battery reserve", -4.4, 1.3, 4.4, 3.2),
    ];
    const partGroups: Record<string, THREE.Group> = {
      pi,
      esp,
      radio,
      phone,
      power,
      antenna,
    };
    const bases = Object.fromEntries(
      Object.entries(partGroups).map(([k, g]) => [k, g.position.clone()]),
    );
    const ray = new THREE.Raycaster(),
      pointer = new THREE.Vector2();
    let dragged = false,
      startX = 0,
      startY = 0;
    const down = (e: PointerEvent) => {
      dragged = false;
      startX = e.clientX;
      startY = e.clientY;
    };
    const move = (e: PointerEvent) => {
      if (
        e.buttons &&
        Math.abs(e.clientX - startX) + Math.abs(e.clientY - startY) > 5
      )
        dragged = true;
    };
    const up = (e: PointerEvent) => {
      if (dragged) return;
      const r = renderer.domElement.getBoundingClientRect();
      pointer.set(
        ((e.clientX - r.left) / r.width) * 2 - 1,
        (-(e.clientY - r.top) / r.height) * 2 + 1,
      );
      ray.setFromCamera(pointer, camera);
      const hit = ray.intersectObjects(pickables, false)[0]?.object;
      if (hit?.userData.wire) {
        setWire(hit.userData.wire);
        setSelected("radio");
      } else if (hit?.userData.part) setSelected(hit.userData.part);
    };
    renderer.domElement.addEventListener("pointerdown", down);
    renderer.domElement.addEventListener("pointermove", move);
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
    let sceneVisible = true;
    const visibility = new IntersectionObserver(
      ([entry]) => {
        sceneVisible = entry.isIntersecting;
      },
      { rootMargin: "150px" },
    );
    visibility.observe(mount);
    let frame = 0;
    const start = performance.now(),
      reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      if (!sceneVisible || document.hidden) return;
      const t = (performance.now() - start) / 1000,
        s = state.current;
      controls.update();
      Object.entries(wireObjects).forEach(([id, w]) => {
        const selected = id === s.wire;
        w.material.emissiveIntensity = selected ? 0.6 : 0.04;
        w.material.opacity = selected ? 1 : 0.4;
        w.material.transparent = true;
        w.dot.visible = selected;
        w.dot.position.copy(w.curve.getPoint(reduced ? 0.5 : (t * 0.23) % 1));
      });
      Object.entries(partGroups).forEach(([id, g]) => {
        const y = bases[id].y + (s.lift && s.selected === id ? 1.0 : 0);
        g.position.y = THREE.MathUtils.lerp(g.position.y, y, 0.1);
      });
      renderer.render(scene, camera);
    };
    animate();
    return () => {
      cancelAnimationFrame(frame);
      visibility.disconnect();
      ro.disconnect();
      renderer.domElement.removeEventListener("pointerdown", down);
      renderer.domElement.removeEventListener("pointermove", move);
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
      className="tg-hardware"
      aria-label="Interactive conceptual Together hardware and jumper wiring"
    >
      <div className="tg-hardware-stage">
        <div ref={host} className="tg-hardware-canvas" />
        {fallback && (
          <div className="tg-scene-fallback">
            <Cpu size={44} />
            <p>Explore the same components and connections below.</p>
          </div>
        )}
        <span className="tg-city-badge">
          <span /> INSIDE A TOGETHER NODE
        </span>
        <div className="tg-hardware-caption">
          <Move size={14} /> Drag to rotate · tap a component
        </div>
        <button
          className={"tg-hardware-lift " + (lift ? "active" : "")}
          aria-pressed={lift}
          onClick={() => setLift(!lift)}
        >
          <Layers size={15} />
          {lift ? "Set down" : "Lift selected part"}
        </button>
      </div>
      <div className="tg-hardware-parts" aria-label="Choose a component">
        {Object.entries(PARTS).map(([id, p]) => (
          <button
            key={id}
            className={selected === id ? "selected" : ""}
            onClick={() => setSelected(id)}
          >
            {id === "radio" || id === "antenna" ? (
              <Radio size={16} />
            ) : id === "phone" ? (
              <Smartphone size={16} />
            ) : id === "power" ? (
              <BatteryCharging size={16} />
            ) : (
              <Cpu size={16} />
            )}
            <span>
              {id === "pi"
                ? "Raspberry Pi"
                : id === "esp"
                  ? "ESP32"
                  : id === "radio"
                    ? "LoRa radio"
                    : id === "power"
                      ? "Power"
                      : id === "antenna"
                        ? "Antenna"
                        : "Phone"}
            </span>
          </button>
        ))}
      </div>
      <div className="tg-hardware-info">
        <div>
          <span className="tg-detail-kicker">
            {selected === "radio"
              ? "SEPARATE SPI RADIO CHIP"
              : "SELECTED COMPONENT"}
          </span>
          <h3>{part.title}</h3>
          <p>{part.body}</p>
        </div>
        <div className="tg-wiring-selection">
          <Cable size={23} style={{ color: wiring.color }} />
          <div>
            <strong style={{ color: wiring.color }}>
              {wiring.pin} <ArrowRight size={13} /> {wiring.signal}
            </strong>
            <p>{wiring.description}</p>
          </div>
        </div>
      </div>
      <div
        className="tg-wire-grid"
        aria-label="Illustrative ESP32 to SX127x jumper connections"
      >
        {WIRES.map((w) => (
          <button
            key={w.id}
            aria-pressed={wire === w.id}
            className={wire === w.id ? "selected" : ""}
            onClick={() => {
              setWire(w.id);
              setSelected("radio");
            }}
          >
            <span style={{ background: w.color }} />
            <b>{w.signal}</b>
            <small>{w.pin}</small>
            {wire === w.id && <Check size={12} />}
          </button>
        ))}
      </div>
      <p className="tg-scene-caption">
        Concept assembly, not a validated wiring guide. Illustrative ESP32 GPIO
        mapping: confirm your board and radio datasheets before wiring. Use a
        compatible 3.3 V supply; never connect 5 V to a 3.3 V radio pin.
        Physical equipment and radio links are simulated.
      </p>
      <a
        className="tg-hardware-source"
        href="https://docs.espressif.com/projects/arduino-esp32/en/latest/api/spi.html"
        target="_blank"
        rel="noreferrer"
      >
        ESP32 SPI reference ↗
      </a>
    </section>
  );
}
