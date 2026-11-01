"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  Radio,
  Wifi,
  FileText,
  Image as ImageIcon,
  Send,
  Check,
  Mountain,
  ArrowRight,
  Smartphone,
  Move,
  Signal,
} from "lucide-react";
import "./lora-simulation.css";
const HUBS = [
  { name: "Neighbourhood", x: -10, z: -1 },
  { name: "School hub", x: -3.3, z: 0 },
  { name: "Hill relay", x: 3.3, z: -0.2 },
  { name: "Relief centre", x: 10, z: -1 },
];
const stages = [
  "Ready to send",
  "Nearby Wi-Fi",
  "Across the valley",
  "At the relief centre",
  "Acknowledgement returned",
];
export default function LoRaSimulation() {
  const host = useRef<HTMLDivElement>(null);
  const [reach, setReach] = useState(80),
    [terrain, setTerrain] = useState(false),
    [payload, setPayload] = useState<"text" | "image">("text"),
    [status, setStatus] = useState("idle"),
    [step, setStep] = useState(0),
    [fallback, setFallback] = useState(false);
  const state = useRef({ reach, terrain, status, step, started: 0 });
  state.current.reach = reach;
  state.current.terrain = terrain;
  state.current.status = status;
  state.current.step = step;
  const radioDistance = 3 + reach * 0.06;
  const connected = HUBS.every(
    (hub, i) =>
      i === 0 ||
      Math.hypot(hub.x - HUBS[i - 1].x, hub.z - HUBS[i - 1].z) +
        (terrain && i === 2 ? 2 : 0) <=
        radioDistance,
  );
  function send() {
    if (payload === "image") {
      setStatus("unsupported");
      setStep(0);
      return;
    }
    if (!connected) {
      setStatus("queued");
      setStep(0);
      return;
    }
    state.current.started = performance.now();
    setStatus("sending");
    setStep(1);
  }
  useEffect(() => {
    if (status !== "sending") return;
    const timers = [
      setTimeout(() => setStep(2), 1700),
      setTimeout(() => setStep(3), 5700),
      setTimeout(() => {
        setStep(4);
        setStatus("acknowledged");
      }, 9000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [status]);
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
    renderer.domElement.setAttribute("role", "img");
    renderer.domElement.setAttribute(
      "aria-label",
      "Four illustrated LoRa hubs across a valley. Small blue rings show local Wi-Fi; wide cyan rings show qualitative radio reach. Use the reach, terrain and send controls below.",
    );
    mount.appendChild(renderer.domElement);
    const scene = new THREE.Scene(),
      camera = new THREE.PerspectiveCamera(36, 1, 0.1, 150);
    camera.position.set(8, 23, 31);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.9, 0);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 22;
    controls.maxDistance = 48;
    controls.maxPolarAngle = Math.PI / 2.4;
    controls.minPolarAngle = 0.25;
    controls.update();
    scene.add(new THREE.HemisphereLight(0xd9f0ff, 0x213e59, 2.3));
    const light = new THREE.DirectionalLight(0xe4f2ff, 3.2);
    light.position.set(-8, 20, 10);
    light.castShadow = true;
    light.shadow.mapSize.set(1024, 1024);
    Object.assign(light.shadow.camera, {
      left: -22,
      right: 22,
      top: 16,
      bottom: -16,
    });
    light.shadow.normalBias = 0.035;
    scene.add(light);
    const geos: THREE.BufferGeometry[] = [],
      mats: THREE.Material[] = [],
      textures: THREE.Texture[] = [];
    const mat = (
      color: THREE.ColorRepresentation,
      extra: THREE.MeshStandardMaterialParameters = {},
    ) => {
      const m = new THREE.MeshStandardMaterial({
        color,
        flatShading: true,
        roughness: 0.8,
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
      mesh(new THREE.CylinderGeometry(r, rb, h, 12), mat(c), x, y, z, parent);
    const label = (
      text: string,
      x: number,
      y: number,
      z: number,
      color = "#c9e9ff",
    ) => {
      const c = document.createElement("canvas");
      c.width = 512;
      c.height = 100;
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "#112744";
      ctx.fillRect(0, 0, 512, 100);
      ctx.strokeStyle = "#3a638b";
      ctx.lineWidth = 3;
      ctx.strokeRect(1, 1, 510, 98);
      ctx.fillStyle = color;
      ctx.font = "600 29px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, 256, 50);
      const t = new THREE.CanvasTexture(c);
      textures.push(t);
      const m = new THREE.SpriteMaterial({
        map: t,
        depthTest: false,
        transparent: true,
      });
      mats.push(m);
      const s = new THREE.Sprite(m);
      s.position.set(x, y, z);
      s.scale.set(4.2, 0.82, 1);
      s.renderOrder = 9;
      scene.add(s);
      return s;
    };
    box(30, 0.7, 14, 0x1b344d, 0, -0.45, 0);
    box(29.7, 0.08, 13.7, 0x446b76, 0, -0.04, 0);
    const river = mesh(
      new THREE.BoxGeometry(30, 0.1, 2),
      mat(0x2d8fbd, { transparent: true, opacity: 0.8, roughness: 0.2 }),
      0,
      0.04,
      4.3,
    );
    for (let x = -14; x < 15; x += 2) {
      const m = mesh(
        new THREE.PlaneGeometry(0.75, 0.045),
        mat(0x84d6e6, { transparent: true, opacity: 0.5 }),
        x,
        0.105,
        4.3 + Math.sin(x) * 0.4,
      );
      m.rotation.x = -Math.PI / 2;
    }
    for (let i = 0; i < 8; i++) {
      const h = mesh(
        new THREE.ConeGeometry(2.8 + (i % 2), 4 + (i % 3), 5),
        mat(i % 2 ? 0x24435d : 0x1e344f),
        -16 + i * 4.4,
        1.0,
        -8 - (i % 2),
      );
      h.rotation.y = i * 0.8;
    }
    const ridge = new THREE.Group();
    scene.add(ridge);
    for (let i = 0; i < 3; i++) {
      const h = mesh(
        new THREE.ConeGeometry(1.8, 3.5 + i * 0.5, 5),
        mat(0x42667d),
        -0.4 + i * 0.35,
        1.2,
        -1.6 + i * 1.7,
        ridge,
      );
      h.rotation.y = i * 0.6;
    }
    ridge.visible = false;
    function house(x: number, z: number, i: number) {
      const g = new THREE.Group();
      g.position.set(x, 0, z);
      scene.add(g);
      box(
        1.2,
        0.95 + (i % 2) * 0.45,
        1.15,
        [0x7585a6, 0x8e6f8a, 0x658caa][i % 3],
        0,
        0.55 + (i % 2) * 0.2,
        0,
        g,
      );
      box(1.45, 0.14, 1.4, 0x1b3559, 0, 1.13 + (i % 2) * 0.4, 0, g);
      box(0.25, 0.37, 0.025, 0x93d9ec, -0.28, 0.7, 0.59, g);
      box(0.25, 0.37, 0.025, 0x93d9ec, 0.28, 0.7, 0.59, g);
      return g;
    }
    for (let i = 0; i < 6; i++) {
      house(-12.6 + (i % 2) * 2.1, -3.9 + Math.floor(i / 2) * 2.1, i);
      house(11.9 + (i % 2) * 1.6, -3.8 + Math.floor(i / 2) * 2.1, i + 2);
    }
    // Four physical radio points. Wi-Fi stays close to a hub; LoRa spans the valley.
    const loraRings: THREE.Mesh[][] = [],
      wifiRings: THREE.Mesh[][] = [],
      hubLeds: THREE.Mesh[] = [];
    HUBS.forEach((hub, i) => {
      const g = new THREE.Group();
      g.position.set(hub.x, 0, hub.z);
      scene.add(g);
      box(1.85, 0.25, 1.75, 0x142f50, 0, 0.15, 0, g);
      box(1.45, 0.85, 1.35, 0xd9eaf6, 0, 0.68, 0, g);
      box(1.7, 0.13, 1.62, 0x2c7fea, 0, 1.17, 0, g);
      box(0.6, 0.62, 0.03, 0x244d78, 0, 0.62, 0.69, g);
      cylinder(0.06, 0.09, 2.7, 0x172f4a, 0.45, 2.6, -0.1, g);
      const led = mesh(
        new THREE.SphereGeometry(0.13, 10, 10),
        mat(0x57e1e8, { emissive: 0x57e1e8, emissiveIntensity: 2 }),
        0.45,
        4,
        -0.1,
        g,
      );
      hubLeds.push(led);
      label(hub.name, hub.x, 4.9, hub.z);
      const big = [],
        small = [];
      for (let r = 0; r < 3; r++) {
        const m = new THREE.MeshBasicMaterial({
          color: 0x49dce9,
          transparent: true,
          opacity: 0.22 - r * 0.04,
          side: THREE.DoubleSide,
        });
        mats.push(m);
        const ring = mesh(
          new THREE.RingGeometry(1, 1.015, 80),
          m,
          hub.x,
          0.2,
          hub.z,
        );
        ring.rotation.x = -Math.PI / 2;
        big.push(ring);
        const wm = new THREE.MeshBasicMaterial({
          color: 0x3d8bff,
          transparent: true,
          opacity: 0.45 - r * 0.1,
          side: THREE.DoubleSide,
        });
        mats.push(wm);
        const wifi = mesh(
          new THREE.RingGeometry(1.6 + r * 0.42, 1.64 + r * 0.42, 45),
          wm,
          hub.x,
          0.25,
          hub.z,
        );
        wifi.rotation.x = -Math.PI / 2;
        small.push(wifi);
      }
      loraRings.push(big);
      wifiRings.push(small);
    });
    const phone = new THREE.Group();
    phone.position.set(-11.3, 0.45, 0.8);
    phone.rotation.x = -0.65;
    scene.add(phone);
    box(0.8, 0.13, 1.5, 0x09182c, 0, 0, 0, phone);
    box(0.68, 0.015, 1.23, 0x347fe4, 0, 0.08, 0, phone);
    box(0.44, 0.02, 0.35, 0x8aebf4, 0, 0.1, 0.15, phone);
    label("Resident’s phone", -12, 2.7, 1.8, "#94c9ff");
    const shelter = new THREE.Group();
    shelter.position.set(12, 0.2, 2.5);
    scene.add(shelter);
    box(2.3, 1.05, 1.5, 0xc2d5e8, 0, 0.5, 0, shelter);
    const roof = mesh(
      new THREE.ConeGeometry(1.8, 0.6, 4),
      mat(0x2a7fd1),
      0,
      1.3,
      0,
      shelter,
    );
    roof.rotation.y = Math.PI / 4;
    label("Relief team", 12, 2.8, 2.5);
    const pathPoints = [
      new THREE.Vector3(-11.3, 0.7, 0.8),
      new THREE.Vector3(-10, 2, -1),
      new THREE.Vector3(-3.3, 2, 0),
      new THREE.Vector3(3.3, 2, -0.2),
      new THREE.Vector3(10, 2, -1),
      new THREE.Vector3(12, 0.9, 2.5),
    ];
    const curves = pathPoints.slice(0, -1).map((p, i) => {
      const next = pathPoints[i + 1];
      return new THREE.QuadraticBezierCurve3(
        p,
        new THREE.Vector3((p.x + next.x) / 2, 4.5, (p.z + next.z) / 2),
        next,
      );
    });
    const connectionMats: THREE.MeshBasicMaterial[] = [];
    curves.forEach((curve, i) => {
      const m = new THREE.MeshBasicMaterial({
        color: i === 0 || i === 4 ? 0x3f8cff : 0x65e3eb,
        transparent: true,
        opacity: 0.55,
      });
      mats.push(m);
      connectionMats.push(m);
      mesh(new THREE.TubeGeometry(curve, 30, 0.025, 6, false), m);
    });
    const dotMat = new THREE.MeshBasicMaterial({ color: 0xf2ffff });
    mats.push(dotMat);
    const dot = mesh(new THREE.SphereGeometry(0.17, 12, 12), dotMat);
    dot.visible = false;
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x5fdfed,
      transparent: true,
      opacity: 0.2,
    });
    mats.push(glowMat);
    const glow = mesh(new THREE.SphereGeometry(0.34, 12, 12), glowMat);
    glow.visible = false;
    const arrowLabels = [
      label("Wi-Fi", -11.7, 3, 1.0, "#83b9ff"),
      label("LoRa · short messages", 0, 6.1, 0.2, "#87eced"),
    ];
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
        s = state.current;
      controls.update();
      const range = 3 + s.reach * 0.06;
      ridge.visible = s.terrain;
      loraRings.forEach((rings, i) =>
        rings.forEach((ring, r) => {
          const progress = reduced ? 0.65 : (t * 0.23 + r / 3) % 1,
            scale = 1.8 + progress * range;
          ring.scale.set(scale, scale, 1);
          (ring.material as THREE.MeshBasicMaterial).opacity =
            (1 - progress) * 0.28;
        }),
      );
      wifiRings.forEach((rings) =>
        rings.forEach((r, i) => {
          r.scale.setScalar(reduced ? 1 : 1 + 0.06 * Math.sin(t * 2 - i));
        }),
      );
      connectionMats.forEach((m, i) => {
        const radioEdge = i > 0 && i < 4;
        const index = i;
        const gap = radioEdge
          ? Math.hypot(
              HUBS[index].x - HUBS[index - 1].x,
              HUBS[index].z - HUBS[index - 1].z,
            ) + (s.terrain && i === 2 ? 2 : 0)
          : 0;
        const okay = !radioEdge || gap <= range;
        m.color.setHex(okay ? (radioEdge ? 0x65e3eb : 0x3f8cff) : 0x40516e);
        m.opacity = okay ? 0.55 : 0.15;
      });
      const elapsed = (performance.now() - s.started) / 1000;
      if (s.status === "sending") {
        let travel: number;
        if (elapsed < 5.7) travel = Math.min(4.999, (elapsed / 5.7) * 5);
        else travel = Math.max(0, 5 - ((elapsed - 5.7) / 3.3) * 5);
        const i = Math.min(4, Math.floor(travel)),
          p = travel - i;
        dot.position.copy(curves[i].getPoint(p));
        glow.position.copy(dot.position);
        dot.visible = true;
        glow.visible = true;
        dotMat.color.setHex(elapsed < 5.7 ? 0xecfeff : 0x73efca);
      } else if (s.status === "acknowledged") {
        dot.visible = true;
        dot.position.copy(pathPoints[0]);
        glow.position.copy(dot.position);
        glow.visible = true;
        dotMat.color.setHex(0x73efca);
      } else {
        dot.visible = false;
        glow.visible = false;
      }
      renderer.render(scene, camera);
    };
    animate();
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      io.disconnect();
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
      className="tg-lora"
      aria-label="Interactive explanation of local Wi-Fi and long-range LoRa"
    >
      <div className="tg-lora-stage">
        <div className="tg-lora-canvas" ref={host} />
        {fallback && (
          <div className="tg-lora-fallback">
            <Radio size={48} />
            <p>Use the controls below to explore radio reach.</p>
          </div>
        )}
        <div className="tg-lora-badge">
          <span /> SMALL MESSAGES. A LONGER REACH.
        </div>
        <div className="tg-lora-scale">
          <span>
            <i />
            Local Wi-Fi
          </span>
          <span>
            <i />
            LoRa radio
          </span>
        </div>
        <div className="tg-lora-hint">
          <Move size={13} /> Drag to explore
        </div>
        <div
          className={
            "tg-lora-status " + (status === "acknowledged" ? "success" : "")
          }
          role="status"
          aria-live="polite"
        >
          {status === "idle" ? (
            <>
              <Radio size={19} />
              <span>Send a short request across the valley.</span>
            </>
          ) : status === "unsupported" ? (
            <>
              <ImageIcon size={19} />
              <span>
                Photos stay local. Use a short text message over LoRa.
              </span>
            </>
          ) : status === "queued" ? (
            <>
              <Signal size={19} />
              <span>Request saved. Increase reach or compare terrain.</span>
            </>
          ) : status === "acknowledged" ? (
            <>
              <Check size={20} />
              <span>Relief hub acknowledged the demo request.</span>
            </>
          ) : (
            <>
              <Send size={18} />
              <span>{stages[step]}</span>
            </>
          )}
        </div>
      </div>
      <div className="tg-lora-controls">
        <label className="tg-lora-reach">
          <Radio size={17} />
          <span>Illustrative reach</span>
          <input
            type="range"
            disabled={status === "sending"}
            min="10"
            max="100"
            value={reach}
            onChange={(e) => {
              setReach(Number(e.target.value));
              if (status !== "sending") setStatus("idle");
            }}
            aria-label="Illustrative LoRa reach"
          />
          <b>
            {reach < 40
              ? "Nearby"
              : reach < 75
                ? "Across town"
                : "Across valley"}
          </b>
        </label>
        <button
          className={terrain ? "selected" : ""}
          aria-pressed={terrain}
          disabled={status === "sending"}
          onClick={() => {
            setTerrain(!terrain);
            if (status !== "sending") setStatus("idle");
          }}
        >
          <Mountain size={16} /> {terrain ? "Ridge on" : "Add a ridge"}
        </button>
      </div>
      <div className="tg-lora-send">
        <div className="tg-lora-payload">
          <button
            className={payload === "text" ? "selected" : ""}
            aria-pressed={payload === "text"}
            disabled={status === "sending"}
            onClick={() => setPayload("text")}
          >
            <FileText size={17} />
            Short SOS
          </button>
          <button
            className={payload === "image" ? "selected" : ""}
            aria-pressed={payload === "image"}
            disabled={status === "sending"}
            onClick={() => setPayload("image")}
          >
            <ImageIcon size={17} />
            Photo
          </button>
        </div>
        <div className="tg-lora-message">
          <span>DEMO MESSAGE</span>
          <p>
            {payload === "text"
              ? "4 people · water needed · home 12"
              : "A photo is too large for this radio demonstration."}
          </p>
        </div>
        <button
          className="tg-lora-send-button"
          onClick={send}
          disabled={status === "sending"}
        >
          {status === "sending" ? "Sending…" : "Send help request"}
          <ArrowRight size={17} />
        </button>
      </div>
      <div className="tg-lora-journey">
        <span className={step >= 1 ? "active" : ""}>
          <Smartphone size={17} />
          Phone
        </span>
        <ArrowRight size={13} />
        <span className={step >= 1 ? "active" : ""}>
          <Wifi size={17} />
          Nearby Wi-Fi
        </span>
        <ArrowRight size={13} />
        <span className={step >= 2 ? "active" : ""}>
          <Radio size={17} />
          LoRa hubs
        </span>
        <ArrowRight size={13} />
        <span className={step >= 3 ? "active" : ""}>
          <Check size={17} />
          Relief team
        </span>
      </div>
      <p className="tg-lora-caption">
        Illustrative reach, not a measured distance or RF prediction. Terrain
        can reduce radio links. Physical LoRa hubs can exchange short messages
        without internet; phones still need nearby Wi-Fi or a radio bridge. This
        hosted MVP uses internet for cloud AI.
      </p>
    </section>
  );
}
