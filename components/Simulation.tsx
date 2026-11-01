"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import "./simulation.css";

type Mode = "flood" | "hardware";
type Props = { mode?: Mode; onRequestHelp?: () => void };
type Detail = { eyebrow: string; title: string; description: string; facts: string[] };
type SceneMarker = { key: string; label: string; position: THREE.Vector3; color: string };

const details: Record<string, Detail> = {
  resident: { eyebrow: "A resident’s view", title: "A small connection. A way forward.", description: "Maya and her family are waiting above the floodwater. At a nearby Together point, they can share a short help request and read saved guidance.", facts: ["4 people · illustrated scenario", "Connect a phone to nearby node Wi-Fi", "Ask for water, shelter or assistance"] },
  node: { eyebrow: "Community connection", title: "The Together relief node", description: "A small local hub brings phones, saved information and community messages together. A LoRa radio can link short messages between relief points.", facts: ["Wi-Fi connects nearby phones", "LoRa carries short text between nodes", "Physical radios are simulated in this demo"] },
  shelter: { eyebrow: "The coordinator’s view", title: "A school becomes a relief hub", description: "A volunteer sees incoming needs and coordinates shelter and supplies. Every assignment is confirmed by a person.", facts: ["Published shelter information", "Requests and acknowledgements", "Illustrative locations, not navigation advice"] },
  pi: { eyebrow: "Local service hub", title: "Raspberry Pi edge hub", description: "The Raspberry Pi represents the community server: local Wi-Fi, saved guides, a message queue and a connection to a LoRa radio. A capable future edge computer can also host a model.", facts: ["Serves the community app over local Wi-Fi", "Stores downloaded information and outgoing requests", "This MVP’s AI uses cloud APIs"] },
  esp: { eyebrow: "Long-range radio bridge", title: "ESP32 + LoRa module", description: "An ESP32 can connect a local application or sensor to a LoRa transceiver. It sends compact messages; it does not run a large language model.", facts: ["ESP32: device control and Wi-Fi/Bluetooth", "LoRa transceiver: long-range short messages", "This is a conceptual hardware assembly"] },
  antenna: { eyebrow: "Beyond the nearby hotspot", title: "LoRa antenna", description: "A raised antenna helps short messages travel between relief points. Terrain, placement, radio settings and local regulations determine real coverage.", facts: ["For short SOS and coordination messages", "Phones use the node’s Wi-Fi, not LoRa directly", "No measured radio range is claimed"] },
  solar: { eyebrow: "Readiness before a disaster", title: "Solar + power reserve", description: "A pre-positioned node needs a dependable power plan. The solar panel and battery show one possible installation; sizing depends on the equipment and site.", facts: ["Charge a battery while sunlight is available", "Keep information available during outages", "Illustrative design; power budget needs validation"] },
  battery: { eyebrow: "Power continuity", title: "Battery backup", description: "A battery supplies the hub and radio when mains electricity is unavailable. A real deployment would monitor charge, temperature and expected operating time.", facts: ["Powers the hub and the radio", "Operator can monitor remaining charge", "No runtime claim without a hardware test"] },
  phone: { eyebrow: "No special phone required", title: "A familiar app on your phone", description: "People connect to nearby node Wi-Fi and open Together in a browser. Preloaded information can be read without internet; API-generated answers need connectivity in this MVP.", facts: ["Mobile-first community interface", "Cached information and an outgoing queue", "Cloud AI clearly identified in the demo"] },
};

const colors = { land: 0xaebba0, edge: 0x89987d, cream: 0xf8ecd7, roof: 0xbc7659, dark: 0x263b33, orange: 0xef643d, blue: 0x76c3c7, light: 0xe9f4e8, sage: 0x63816d };

export default function Simulation({ mode = "flood", onRequestHelp }: Props) {
  const mount = useRef<HTMLDivElement>(null);
  const markerElements = useRef<Record<string, HTMLButtonElement | null>>({});
  const [selected, setSelected] = useState(mode === "hardware" ? "pi" : "resident");
  const [flood, setFlood] = useState(42);
  const [nodesActive, setNodesActive] = useState(true);
  const [exploded, setExploded] = useState(false);
  const [helpSent, setHelpSent] = useState(false);
  const [rescueArrived, setRescueArrived] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [markers, setMarkers] = useState<SceneMarker[]>([]);
  const sceneState = useRef({ flood, nodesActive, exploded, helpSent, rescueStarted: 0 });
  sceneState.current.flood = flood;
  sceneState.current.nodesActive = nodesActive;
  sceneState.current.exploded = exploded;
  sceneState.current.helpSent = helpSent;
  const detail = details[selected] || details[mode === "hardware" ? "pi" : "resident"];

  useEffect(() => {
    setSelected(mode === "hardware" ? "pi" : "resident");
    setHelpSent(false);
    setRescueArrived(false);
    sceneState.current.rescueStarted = 0;
  }, [mode]);

  useEffect(() => {
    if (!helpSent) return;
    const timer = window.setTimeout(() => setRescueArrived(true), 6500);
    return () => window.clearTimeout(timer);
  }, [helpSent]);

  useEffect(() => {
    if (!mount.current) return;
    const host = mount.current;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    } catch {
      setFallback(true);
      return;
    }
    setFallback(false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setClearColor(0xe8eee4, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.setAttribute("aria-label", mode === "flood" ? "Interactive 3D flood village. Drag to rotate. Use the labelled buttons to explore people and relief nodes." : "Interactive conceptual Raspberry Pi and ESP32 LoRa installation. Drag to rotate and use labelled buttons to inspect components.");
    renderer.domElement.setAttribute("role", "img");
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xe8eee4, 35, 70);
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(mode === "flood" ? 20 : 16, mode === "flood" ? 18 : 13, mode === "flood" ? 23 : 20);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, mode === "flood" ? 0.8 : 1.0, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.minDistance = 16;
    controls.maxDistance = 40;
    controls.minPolarAngle = 0.3;
    controls.maxPolarAngle = Math.PI / 2.25;
    controls.update();
    scene.add(new THREE.HemisphereLight(0xffffff, 0x819578, 2.5));
    const sun = new THREE.DirectionalLight(0xfff4dd, 3.2);
    sun.position.set(-10, 18, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -18; sun.shadow.camera.right = 18;
    sun.shadow.camera.top = 18; sun.shadow.camera.bottom = -18;
    sun.shadow.normalBias = 0.03;
    scene.add(sun);

    const materials: THREE.Material[] = [];
    const geometries: THREE.BufferGeometry[] = [];
    const pickables: THREE.Object3D[] = [];
    const rings: THREE.Mesh[] = [];
    const leds: THREE.Mesh[] = [];
    const pieces: { object: THREE.Object3D; base: THREE.Vector3; lift: THREE.Vector3 }[] = [];
    const sceneMarkers: SceneMarker[] = [];
    let water: THREE.Mesh | undefined;
    let boat: THREE.Group | undefined;
    let waterShimmer: THREE.Mesh[] = [];

    const material = (color: THREE.ColorRepresentation, extra: THREE.MeshStandardMaterialParameters = {}) => {
      const m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, flatShading: true, ...extra });
      materials.push(m); return m;
    };
    const mesh = (geometry: THREE.BufferGeometry, color: THREE.ColorRepresentation, parent: THREE.Object3D = scene, extra: THREE.MeshStandardMaterialParameters = {}) => {
      geometries.push(geometry);
      const object = new THREE.Mesh(geometry, material(color, extra));
      object.castShadow = true; object.receiveShadow = true; parent.add(object); return object;
    };
    const box = (w: number, h: number, d: number, color: THREE.ColorRepresentation, x: number, y: number, z: number, parent: THREE.Object3D = scene) => {
      const object = mesh(new THREE.BoxGeometry(w, h, d), color, parent); object.position.set(x, y, z); return object;
    };
    const cylinder = (top: number, bottom: number, height: number, color: THREE.ColorRepresentation, x: number, y: number, z: number, parent: THREE.Object3D = scene) => {
      const object = mesh(new THREE.CylinderGeometry(top, bottom, height, 12), color, parent); object.position.set(x, y, z); return object;
    };
    const clickable = (object: THREE.Object3D, key: string) => {
      object.traverse(child => { child.userData.selectKey = key; if ((child as THREE.Mesh).isMesh) pickables.push(child); });
    };
    const marker = (key: string, label: string, x: number, y: number, z: number, color = "green") => sceneMarkers.push({ key, label, position: new THREE.Vector3(x, y, z), color });
    const glowRing = (x: number, y: number, z: number, radius = 1.0) => {
      const ring = mesh(new THREE.RingGeometry(radius, radius + 0.035, 64), 0x4f9177, scene, { transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthWrite: false });
      ring.rotation.x = -Math.PI / 2; ring.position.set(x, y, z); rings.push(ring); return ring;
    };
    const tree = (x: number, z: number, height: number, y = 0.25) => {
      cylinder(0.09, 0.13, height * 0.6, 0x8a7761, x, y + height * 0.3, z);
      const leaves = mesh(new THREE.ConeGeometry(height * 0.42, height, 7), 0x5b7863); leaves.position.set(x, y + height * 0.9, z);
    };
    const house = (x: number, z: number, scale: number, y = 0.25, shelter = false) => {
      const group = new THREE.Group(); group.position.set(x, y, z); group.scale.setScalar(scale); scene.add(group);
      box(1.5, 1.15, 1.5, shelter ? 0xf5eed7 : colors.cream, 0, 0.57, 0, group);
      const roof = mesh(new THREE.ConeGeometry(1.28, 0.75, 4), shelter ? colors.sage : colors.roof, group); roof.rotation.y = Math.PI / 4; roof.position.y = 1.52;
      box(0.3, 0.58, 0.025, 0x806958, 0.3, 0.29, 0.765, group);
      box(0.32, 0.3, 0.03, 0x87afb0, -0.38, 0.72, 0.77, group);
      box(0.03, 0.3, 0.32, 0x87afb0, 0.765, 0.72, -0.28, group);
      if (shelter) { box(0.7, 0.14, 0.03, 0xf6f5ef, 0, 1.02, 0.78, group); clickable(group, "shelter"); }
      return group;
    };
    const person = (x: number, z: number, color: number, y = 0.3, key?: string) => {
      const group = new THREE.Group(); group.position.set(x, y, z); scene.add(group);
      cylinder(0.13, 0.18, 0.48, color, 0, 0.43, 0, group);
      const head = mesh(new THREE.SphereGeometry(0.14, 10, 8), 0xc99775, group); head.position.y = 0.83;
      box(0.08, 0.27, 0.09, colors.dark, -0.075, 0.12, 0, group); box(0.08, 0.27, 0.09, colors.dark, 0.075, 0.12, 0, group);
      if (key) clickable(group, key); return group;
    };
    const node = (x: number, z: number, y = 0.3) => {
      const group = new THREE.Group(); group.position.set(x, y, z); scene.add(group);
      box(0.55, 0.75, 0.42, 0xf3f0e8, 0, 0.4, 0, group);
      box(0.38, 0.35, 0.45, colors.orange, 0, 0.43, 0, group);
      cylinder(0.035, 0.035, 1.8, colors.dark, 0, 1.3, 0, group);
      const led = mesh(new THREE.SphereGeometry(0.09, 10, 8), 0x78bb82, group, { emissive: 0x4a9962, emissiveIntensity: 0.6 }); led.position.set(0.16, 0.68, 0.23); leds.push(led);
      const panel = box(0.8, 0.05, 0.55, 0x2c535c, 0, 0.91, -0.12, group); panel.rotation.x = 0.35;
      clickable(group, "node"); glowRing(x, y + 0.03, z, 1.3); glowRing(x, y + 0.04, z, 2.3); return group;
    };

    if (mode === "flood") {
      const base = box(19, 0.8, 14, colors.edge, 0, -0.4, 0); base.receiveShadow = true;
      box(19, 0.16, 14, colors.land, 0, 0.05, 0);
      box(5.5, 0.65, 8, 0xbac5a7, -6.7, 0.24, -0.8);
      box(3.8, 0.55, 6, 0xb5c29e, 7.5, 0.22, -2);
      for (let i = 0; i < 5; i++) {
        const mountain = mesh(new THREE.ConeGeometry(3 + (i % 2) * 0.7, 4 + (i % 3), 5), i % 2 ? 0x91a28c : 0xa5b29b);
        mountain.position.set(-8 + i * 4.0, 2.1, -6.2);
        const snow = mesh(new THREE.ConeGeometry(0.8, 1.3, 5), 0xe8ebdf); snow.position.copy(mountain.position).add(new THREE.Vector3(0, (4 + (i % 3)) / 2 - 0.6, 0));
      }
      const riverShape = new THREE.Shape();
      riverShape.moveTo(-2.9, -7); riverShape.bezierCurveTo(-4, -2, 3, -1, 0.2, 4); riverShape.lineTo(-0.2, 7); riverShape.lineTo(4.8, 7); riverShape.bezierCurveTo(6.3, 2, 0.8, 0, 1.8, -7); riverShape.closePath();
      water = mesh(new THREE.ShapeGeometry(riverShape, 28), colors.blue, scene, { transparent: true, opacity: 0.78, roughness: 0.25, metalness: 0.1, side: THREE.DoubleSide });
      water.rotation.x = -Math.PI / 2; water.position.y = 0.28; water.castShadow = false;
      for (let i = 0; i < 13; i++) {
        const wave = box(0.2 + (i % 3) * 0.15, 0.012, 0.04, 0xc0e7df, -1.3 + Math.sin(i * 0.9) * 1.15 + i * 0.21, 0.35, -5.6 + i * 0.9);
        wave.castShadow = false; waterShimmer.push(wave);
      }
      house(-5.9, -2.8, 1.3, 0.6, true);
      house(-7.5, 2.7, 0.85); house(-4.5, 4.0, 0.9); house(5.8, -1.5, 1.0, 0.52);
      house(7.5, 2.3, 0.8); house(4.8, 4.5, 0.7); house(-1.9, 2.0, 0.72, 0.2);
      box(3.2, 0.25, 0.75, 0xb8a087, -1.0, 0.85, -2.6);
      box(3.3, 0.08, 0.06, 0x706956, -1.0, 1.2, -2.95); box(3.3, 0.08, 0.06, 0x706956, -1.0, 1.2, -2.25);
      for (let i = 0; i < 7; i++) { cylinder(0.025, 0.025, 0.4, 0x706956, -2.5 + i * 0.5, 1.02, -2.95); cylinder(0.025, 0.025, 0.4, 0x706956, -2.5 + i * 0.5, 1.02, -2.25); }
      [[-8,-3],[-8,0],[-6,5],[-3,5.8],[8,-3],[8.2,4.6],[4.2,-4.3],[-4,-4.8],[6,-4.6]].forEach(([x,z], i) => tree(x,z,1.05+(i%3)*0.3, x < -4 && z < 1 ? 0.6 : 0.25));
      node(-4.2, -1.5, 0.6); node(5.4, -3.4, 0.58); node(-5.0, 4.5);
      person(-1.7, 2.9, colors.orange, 0.8, "resident"); person(-1.2, 2.7, 0xe4ba71, 0.8, "resident"); person(-1.6, 3.4, 0x7d928c, 0.8, "resident");
      box(1.2, 0.5, 1.4, 0xb29a80, -1.5, 0.6, 3.1);
      person(-5.5, -1.0, colors.sage, 0.6); person(-6.3, -1.1, 0xc4866e, 0.6);
      boat = new THREE.Group(); scene.add(boat); boat.position.set(1.1, 0.45, -2.0);
      const hull = mesh(new THREE.CylinderGeometry(0.65, 0.4, 0.3, 6), colors.orange, boat); hull.scale.set(0.7, 1, 1.55);
      box(0.55, 0.08, 0.95, 0xf3c09b, 0, 0.19, 0, boat);
      cylinder(0.1, 0.15, 0.32, 0xe3b660, 0, 0.38, -0.25, boat);
      const boatHead = mesh(new THREE.SphereGeometry(0.12, 8, 8), 0xc99775, boat); boatHead.position.set(0, 0.65, -0.25);
      marker("resident", "Family needs help", -1.5, 2.6, 3.1, "orange");
      marker("node", "Together node", -4.2, 3.3, -1.5);
      marker("shelter", "School relief hub", -5.9, 3.9, -2.8);
    } else {
      box(18, 0.5, 12, 0xc4ceb9, 0, -0.4, 0);
      const board = new THREE.Group(); board.position.set(-0.5, 0.5, 0); scene.add(board);
      const enclosure = box(5.1, 0.55, 3.5, 0xe8e7d9, 0, 0, 0, board);
      enclosure.castShadow = true;
      const piBoard = box(4.5, 0.15, 2.8, 0x42785c, 0, 0.4, 0, board);
      pieces.push({ object: piBoard, base: piBoard.position.clone(), lift: new THREE.Vector3(0, 1.2, 0) });
      const chip = box(1.05, 0.2, 1.0, colors.dark, -0.1, 0.58, 0.1, board);
      pieces.push({ object: chip, base: chip.position.clone(), lift: new THREE.Vector3(0, 2.2, 0) });
      for (let i = 0; i < 8; i++) { cylinder(0.045,0.045,0.22,0xc4ad65,-1.7+i*0.43,0.62,-1.08,board); }
      for (let i = 0; i < 3; i++) box(0.55,0.45,0.65,0xc5cec7,1.72,0.65,-0.85+i*0.8,board);
      box(0.5,0.25,0.18,colors.dark,-1.7,0.6,1.42,board);
      const led = mesh(new THREE.SphereGeometry(0.08,10,8),0x95ce7f,board,{emissive:0x95ce7f,emissiveIntensity:1}); led.position.set(-1.9,0.58,0.85); leds.push(led);
      clickable(board,"pi");
      const radio = new THREE.Group(); radio.position.set(5.4,0.5,-0.9); scene.add(radio);
      box(2.3,0.15,3.0,0x2f5261,0,0,0,radio);
      box(1.4,0.2,1.4,0xb6c5c3,0,0.18,-0.3,radio);
      const lora = box(1.2,0.25,0.85,0xd6b761,0,0.2,0.9,radio);
      pieces.push({object:lora,base:lora.position.clone(),lift:new THREE.Vector3(0,1.5,0)});
      for(let i=0;i<8;i++){box(0.05,0.23,0.08,0xd3bd76,-1.0,0.1,-1.1+i*0.3,radio);box(0.05,0.23,0.08,0xd3bd76,1,0.1,-1.1+i*0.3,radio);}
      clickable(radio,"esp");
      const antenna = new THREE.Group(); antenna.position.set(7.2,0,-3.5); scene.add(antenna);
      cylinder(0.32,0.48,0.25,colors.dark,0,0.2,0,antenna);
      cylinder(0.055,0.09,3.5,colors.dark,0,2,0,antenna);
      cylinder(0.09,0.09,0.2,colors.orange,0,3.75,0,antenna);
      clickable(antenna,"antenna"); glowRing(7.2,0.02,-3.5,0.8); glowRing(7.2,0.025,-3.5,1.6);
      const phone = new THREE.Group(); phone.position.set(-6,0.7,3);phone.rotation.x=-0.6;phone.rotation.y=0.3;scene.add(phone);
      box(1.7,0.18,3.1,colors.dark,0,0,0,phone);box(1.44,0.025,2.6,0xf5eee0,0,0.11,0,phone);
      box(1.08,0.03,0.4,colors.orange,0,0.13,-0.65,phone);box(1.08,0.03,0.4,0xb2c7b0,0,0.13,0,phone);box(0.8,0.03,0.12,0xc8c9b8,-0.1,0.13,0.55,phone);
      clickable(phone,"phone");
      const battery = new THREE.Group();battery.position.set(2,0.4,4);scene.add(battery);
      box(2.8,0.8,1.55,colors.dark,0,0,0,battery);box(0.7,0.83,1.58,colors.orange,-0.6,0,0,battery);
      box(0.32,0.06,0.4,0xc2b380,-0.9,0.45,0,battery);box(0.32,0.06,0.4,0xc2b380,0.9,0.45,0,battery);clickable(battery,"battery");
      const solar = new THREE.Group();solar.position.set(-5.5,1.4,-3.8);solar.rotation.x=0.35;scene.add(solar);
      box(4.4,0.18,3.1,0xc7d0c8,0,0,0,solar);box(4.1,0.04,2.85,0x2e5364,0,0.12,0,solar);
      for(let i=0;i<5;i++)box(0.025,0.02,2.85,0x9eb8b8,-1.7+i*0.85,0.15,0,solar);
      for(let i=0;i<3;i++)box(4.1,0.02,0.025,0x9eb8b8,0,0.15,-0.95+i*0.95,solar);
      clickable(solar,"solar");
      const wire = (points: THREE.Vector3[], color: number) => { const curve = new THREE.CatmullRomCurve3(points); mesh(new THREE.TubeGeometry(curve,30,0.035,6,false),color); };
      wire([new THREE.Vector3(1.7,0.7,0),new THREE.Vector3(2.7,0.7,0.5),new THREE.Vector3(3.5,0.7,-0.2),new THREE.Vector3(4.4,0.65,-0.8)],colors.orange);
      wire([new THREE.Vector3(2.3,0.8,3.8),new THREE.Vector3(2.8,0.6,2.1),new THREE.Vector3(1.1,0.5,1.5)],colors.dark);
      wire([new THREE.Vector3(6.4,0.6,-1.8),new THREE.Vector3(7.2,0.3,-2.0),new THREE.Vector3(7.2,0.3,-3.5)],colors.dark);
      marker("pi","Raspberry Pi hub",-0.5,2.7,0);
      marker("esp","ESP32 + LoRa",5.4,2.1,-0.9);
      marker("phone","Your phone",-6,1.7,3);
      marker("solar","Solar power",-5.5,2.7,-3.8);
      marker("battery","Battery reserve",2,1.4,4);
      marker("antenna","LoRa antenna",7.2,4.4,-3.5);
    }
    setMarkers(sceneMarkers);

    const raycaster = new THREE.Raycaster(); const pointer = new THREE.Vector2();
    let down = { x: 0, y: 0 };
    const pointerDown = (event: PointerEvent) => { down = {x:event.clientX,y:event.clientY}; };
    const pointerUp = (event: PointerEvent) => {
      if (Math.hypot(event.clientX-down.x,event.clientY-down.y)>7) return;
      const rect=renderer.domElement.getBoundingClientRect(); pointer.set(((event.clientX-rect.left)/rect.width)*2-1,-((event.clientY-rect.top)/rect.height)*2+1);
      raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(pickables,false)[0];if(hit?.object.userData.selectKey)setSelected(hit.object.userData.selectKey);
    };
    renderer.domElement.addEventListener("pointerdown",pointerDown);renderer.domElement.addEventListener("pointerup",pointerUp);
    const resize = () => { const width=host.clientWidth;const height=host.clientHeight;if(!width||!height)return;renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix(); };
    const observer = new ResizeObserver(resize); observer.observe(host); resize();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0; let animation = 0;
    const projected = new THREE.Vector3();
    const animate = (now: number) => {
      animation=requestAnimationFrame(animate);frame+=0.012;
      controls.update();
      const state=sceneState.current;
      if(water){water.position.y=THREE.MathUtils.lerp(water.position.y,0.18+state.flood/100*0.7,0.04);water.scale.x=0.77+state.flood/100*0.6;}
      waterShimmer.forEach((wave,i)=>{wave.position.y=(water?.position.y||0.3)+0.025;wave.position.z=-5.6+i*0.9+(reducedMotion?0:Math.sin(frame+i)*0.13);});
      rings.forEach((ring,i)=>{ring.visible=state.nodesActive;ring.scale.setScalar(reducedMotion?1:1+Math.sin(frame*1.5+i)*0.04);(ring.material as THREE.MeshStandardMaterial).opacity=0.35+(reducedMotion?0:Math.sin(frame*1.5+i)*0.12);});
      leds.forEach(led=>{const m=led.material as THREE.MeshStandardMaterial;m.color.set(state.nodesActive?0x95ce7f:0xb7b5a3);m.emissiveIntensity=state.nodesActive?0.7:0;});
      pieces.forEach(({object,base,lift})=>{const target=base.clone().addScaledVector(lift,state.exploded?1:0);object.position.lerp(target,0.06);});
      if(boat){
        if(state.helpSent){if(!state.rescueStarted)state.rescueStarted=now;const p=Math.min((now-state.rescueStarted)/6500,1);boat.position.x=1.1-2.3*p;boat.position.z=-2+4.5*p;boat.rotation.y=-0.4;}
        boat.position.y=(water?.position.y||0.3)+0.16+(reducedMotion?0:Math.sin(frame*2)*0.025);
      }
      sceneMarkers.forEach(item=>{const element=markerElements.current[item.key];if(!element)return;projected.copy(item.position);if(mode==="hardware"&&item.key==="pi"&&state.exploded)projected.y+=1.1;projected.project(camera);element.style.left=`${(projected.x*0.5+0.5)*host.clientWidth}px`;element.style.top=`${(-projected.y*0.5+0.5)*host.clientHeight}px`;element.style.visibility=projected.z>1?"hidden":"visible";});
      renderer.render(scene,camera);
    };
    animation=requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animation);observer.disconnect();controls.dispose();renderer.domElement.removeEventListener("pointerdown",pointerDown);renderer.domElement.removeEventListener("pointerup",pointerUp);
      geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());renderer.dispose();host.removeChild(renderer.domElement);
    };
  }, [mode]);

  const sendHelp = () => { if(helpSent)return;setHelpSent(true);setSelected("shelter");onRequestHelp?.(); };
  return (
    <section className="together-sim" aria-label={mode === "flood" ? "Explore the flood response scenario" : "Explore the conceptual IoT hardware"}>
      <div className="sim-stage">
        <div className="sim-canvas" ref={mount} />
        <div className="sim-scene-meta"><span className="sim-live-dot" />{mode === "flood" ? "KATHMANDU VALLEY · ILLUSTRATED SCENARIO" : "TOGETHER NODE · CONCEPT ASSEMBLY"}</div>
        <div className="sim-drag-hint"><span aria-hidden="true">↔</span> Drag to explore · pinch to zoom</div>
        {!fallback && <div className="sim-markers">{markers.map(item=><button key={item.key} ref={el=>{markerElements.current[item.key]=el;}} className={`sim-marker ${item.color === "orange" ? "sim-marker-orange" : ""} ${selected===item.key?"sim-marker-selected":""}`} onClick={()=>setSelected(item.key)} aria-pressed={selected===item.key}><span />{item.label}</button>)}</div>}
        {fallback && <div className="sim-fallback"><span aria-hidden="true">⌂ ≋ ⌂</span><strong>The community, connected.</strong><p>3D is unavailable on this device. Explore the same people and hardware with the controls below.</p></div>}
        <div className="sim-key">{mode==="flood"?<><span><i className="sim-key-person" />People</span><span><i className="sim-key-node" />Together nodes</span><span><i className="sim-key-water" />Floodwater</span></>:<><span><i className="sim-key-person" />Radio link</span><span><i className="sim-key-node" />Local hub</span><span><i className="sim-key-water" />Power system</span></>}</div>
      </div>
      <div className="sim-console">
        <div className="sim-controls">
          {mode === "flood" ? <>
            <label className="sim-flood-control" htmlFor="together-flood-level"><span>Explore the water level <strong>{flood < 35 ? "Rising" : flood < 70 ? "Flooded" : "High water"}</strong></span><input id="together-flood-level" type="range" min="0" max="100" value={flood} onChange={event=>setFlood(Number(event.target.value))} aria-valuetext={`${flood}% of the illustrative flood range`} /></label>
            <button className={`sim-toggle ${nodesActive ? "sim-toggle-active":""}`} onClick={()=>setNodesActive(!nodesActive)} aria-pressed={nodesActive}><span />{nodesActive ? "Nodes active" : "Activate nodes"}</button>
          </> : <>
            <p className="sim-hardware-instruction">A closer look inside a community connection point.</p>
            <button className={`sim-toggle ${exploded?"sim-toggle-active":""}`} onClick={()=>setExploded(!exploded)} aria-pressed={exploded}>{exploded?"Assemble components":"Lift the components"}<span aria-hidden="true">↗</span></button>
          </>}
        </div>
        <div className="sim-detail">
          <div className="sim-detail-copy"><p className="sim-eyebrow">{detail.eyebrow}</p><h3>{detail.title}</h3><p>{detail.description}</p></div>
          <div className="sim-detail-actions"><ul>{detail.facts.map(fact=><li key={fact}><span aria-hidden="true">✓</span>{fact}</li>)}</ul>{mode==="flood"&&<button className="sim-help" onClick={sendHelp} disabled={helpSent}>{rescueArrived?"Volunteer acknowledgement received":helpSent?"Scenario request received · volunteer on the way":"Show a help request"}<span aria-hidden="true">↗</span></button>}</div>
        </div>
        <div className="sim-accessible-tabs" aria-label="Explore scene details">{(mode==="hardware"?["pi","esp","antenna","solar","battery","phone"]:["resident","node","shelter"]).map(key=><button key={key} onClick={()=>setSelected(key)} aria-pressed={selected===key}>{mode==="hardware"?({pi:"Raspberry Pi",esp:"ESP32 + LoRa",antenna:"Antenna",solar:"Solar",battery:"Battery",phone:"Phone"} as Record<string,string>)[key]:({resident:"Resident",node:"Relief node",shelter:"School shelter"} as Record<string,string>)[key]}</button>)}</div>
        <p className="sim-disclosure">{mode==="hardware"?"Conceptual IoT architecture. Raspberry Pi, ESP32, LoRa radios and power equipment are simulated. This MVP uses cloud APIs for AI; future local inference needs capable hardware.":"Interactive illustration inspired by Nepal’s 2024 floods. People, locations, water levels and assistance are simulated. This is not a flood forecast or real rescue dispatch."}</p>
        <span className="sim-sr-only" role="status" aria-live="polite">{helpSent?(rescueArrived?"Illustrated volunteer has reached the family. No real rescue service was contacted.":"Illustrated request sent. A simulated volunteer is approaching."):""}</span>
      </div>
    </section>
  );
}
