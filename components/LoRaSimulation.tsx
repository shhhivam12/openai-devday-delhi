"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  Radio, Wifi, Send, Check, Mountain, ArrowRight, Smartphone,
  Move, Plus, Minus, RotateCcw, Server, Activity, Cable, Bell,
  Eye, FileText, ImageOff,
} from "lucide-react";
import "./lora-simulation.css";

type Mode = "mesh" | "lorawan";
type Scenario = "request" | "bulletin";
type Part = { id: string; name: string; short: string; x: number; z: number; description: string; detail: string };
type JourneyStep = { title: string; description: string; duration: number; links: string[]; parts: string[]; ack?: boolean };
const MESH_PARTS: Part[] = [
  { id: "phone", name: "Resident phone", short: "Phone", x: -19, z: 7, description: "An ordinary phone joins nearby community Wi-Fi.", detail: "The PWA can save a map, guides and drafts. A phone needs a nearby Wi-Fi access point or an external radio bridge to send beyond itself; it has no built-in LoRa radio." },
  { id: "village", name: "Village radio hub", short: "Village hub", x: -12, z: 1, description: "Local Wi-Fi and a dedicated radio bridge meet here.", detail: "A proposed Raspberry Pi serves local content. An ESP32 plus SX127x transceiver carries compact messages over LoRa. Rich maps and guides stay on the phone or local hub." },
  { id: "relay", name: "Ridge relay", short: "Ridge relay", x: 0, z: -7, description: "A dedicated radio forwards a short message across the valley.", detail: "This is the proposed Together mesh: forwarding, addressing, encryption, retries and congestion rules still need firmware and field testing. It is not a conventional LoRaWAN gateway mesh." },
  { id: "relief", name: "Relief centre", short: "Relief centre", x: 14, z: 2, description: "A human coordinator receives the request and acknowledges it.", detail: "The returning acknowledgement means the exercise record was received. It does not confirm a rescue, resource availability or emergency dispatch." },
  { id: "government", name: "Government information server", short: "Government desk", x: 15, z: -14, description: "A proposed publishing desk sends reviewed bulletins when backhaul exists.", detail: "The government example uses an available IP backhaul to the relief centre, then local radio and Wi-Fi. It is a simulated bulletin, not an official feed or a deployed government integration." },
];
const WAN_PARTS: Part[] = [
  { id: "sensor", name: "IoT sensor devices", short: "Sensors", x: -12, z: 8, description: "Independent end devices send small telemetry samples.", detail: "Water-level and weather devices each use a single radio hop to a reachable gateway. The readings and devices shown here are fictional; they do not measure this river or predict flooding." },
  { id: "gateway", name: "LoRaWAN gateway", short: "Gateway", x: 0, z: -4, description: "A multi-channel gateway bridges received radio frames to IP.", detail: "This gateway/concentrator role is different from the simple SX127x bridge in the community mesh. Conventional LoRaWAN uses a star-of-stars architecture, not gateway-to-gateway radio relaying." },
  { id: "network", name: "LoRaWAN network server", short: "Network server", x: 15, z: -10, description: "The network service handles the LoRaWAN network layer.", detail: "Gateways need an IP path to a network server. It handles network duties such as deduplication and MAC control; join/security services depend on the deployment. This is a proposed telemetry option." },
  { id: "application", name: "Telemetry application", short: "Application", x: 20, z: 7, description: "An authorized application receives the sensor data.", detail: "An application can display measurements for a coordinator to review. A sample is not an official warning. Alert approval, trusted sensors and a real service would need separate implementation." },
];
const REQUEST_JOURNEY: JourneyStep[] = [
  { title: "Nearby Wi-Fi", description: "The phone sends a small exercise request to its nearby Pi access point.", duration: 1400, links: ["wifi"], parts: ["phone", "village"] },
  { title: "First LoRa hop", description: "The ESP32 / SX127x bridge sends the compact request to the ridge radio.", duration: 1700, links: ["radio-a"], parts: ["village", "relay"] },
  { title: "Across the valley", description: "The dedicated relay forwards it to the relief centre.", duration: 1700, links: ["radio-b"], parts: ["relay", "relief"] },
  { title: "Human acknowledgement", description: "A coordinator acknowledges receipt of the exercise request.", duration: 1000, links: [], parts: ["relief"] },
  { title: "Acknowledgement returns", description: "A short acknowledgement travels back over the two radio hops.", duration: 2200, links: ["radio-b", "radio-a"], parts: ["relief", "relay", "village"], ack: true },
  { title: "Received on the phone", description: "The local hub shares the acknowledgement over nearby Wi-Fi.", duration: 1100, links: ["wifi"], parts: ["village", "phone"], ack: true },
];
const BULLETIN_JOURNEY: JourneyStep[] = [
  { title: "Reviewed at the desk", description: "A fictional reviewed bulletin crosses available IP backhaul to the relief centre.", duration: 1700, links: ["government"], parts: ["government", "relief"] },
  { title: "Radio to the ridge", description: "The relief centre sends the short bulletin over dedicated LoRa hardware.", duration: 1700, links: ["radio-b"], parts: ["relief", "relay"], ack: true },
  { title: "Saved at the village hub", description: "The ridge forwards the bulletin to the Pi / radio hub for local storage.", duration: 1700, links: ["radio-a"], parts: ["relay", "village"], ack: true },
  { title: "Shared nearby", description: "The hub shares the saved bulletin with a phone over local Wi-Fi.", duration: 1400, links: ["wifi"], parts: ["village", "phone"], ack: true },
];
const WAN_JOURNEY: JourneyStep[] = [
  { title: "Single-hop radio", description: "Independent end devices send their fictional telemetry directly to the gateway.", duration: 2000, links: ["sensor-a", "sensor-b", "sensor-c"], parts: ["sensor", "gateway"] },
  { title: "IP backhaul", description: "The gateway forwards received radio frames to a LoRaWAN network server over IP.", duration: 1800, links: ["wan-ip"], parts: ["gateway", "network"] },
  { title: "Application data", description: "The network service passes the sample to the authorized application.", duration: 1700, links: ["wan-app"], parts: ["network", "application"] },
];
const SENSOR_POSITIONS = [{ x: -15, z: 9 }, { x: -8, z: 12 }, { x: 5, z: 10 }];
const riverX = (z: number) => Math.sin(z * .16) * 1.7 + 1;

export default function LoRaSimulation() {
  const host = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("mesh");
  const [scenario, setScenario] = useState<Scenario>("request");
  const [selected, setSelected] = useState("village");
  const [planning, setPlanning] = useState(false);
  const [running, setRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(-1);
  const [fallback, setFallback] = useState(false);
  const [shortTextOpen, setShortTextOpen] = useState(false);
  const journey = mode === "lorawan" ? WAN_JOURNEY : scenario === "request" ? REQUEST_JOURNEY : BULLETIN_JOURNEY;
  const parts = mode === "mesh" ? MESH_PARTS : WAN_PARTS;
  const part = parts.find(p => p.id === selected) || parts[0];
  const complete = stepIndex >= journey.length;
  const step = running ? journey[stepIndex] : undefined;
  const live = useRef({ mode, scenario, selected, planning, running, stepIndex, started: 0, zoom: 0, reset: false });
  Object.assign(live.current, { mode, scenario, selected, planning, running, stepIndex });
  const changeMode = (next: Mode) => {
    setRunning(false); setStepIndex(-1); setMode(next);
    setSelected(next === "mesh" ? "village" : "gateway");
  };
  const sendDemo = () => {
    if (running) return;
    host.current?.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"center"});
    live.current.started = performance.now(); setStepIndex(0); setRunning(true);
  };
  useEffect(() => {
    if (!running) return;
    let elapsed = 0;
    const timers = journey.map((item, index) => {
      elapsed += item.duration;
      return setTimeout(() => {
        if (index + 1 === journey.length) { setStepIndex(journey.length); setRunning(false); }
        else setStepIndex(index + 1);
      }, elapsed);
    });
    return () => timers.forEach(clearTimeout);
  }, [running, journey]);

  useEffect(() => {
    if (!host.current) return;
    const mount = host.current;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "low-power" }); }
    catch { setFallback(true); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0xf3f5f7, 1); renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute("role", "img");
    renderer.domElement.setAttribute("aria-label", "Detailed forested Himalayan valley. Community mesh shows an ordinary phone connected by local Wi-Fi to a Pi and dedicated LoRa bridge, a ridge relay, a relief centre and optional government backhaul. The separate LoRaWAN mode shows sensor devices sending directly to a gateway, then IP backhaul, network server and application. Equivalent selection and send controls are below.");
    mount.appendChild(renderer.domElement);
    const scene = new THREE.Scene(); scene.fog = new THREE.Fog(0xf3f5f7, 170, 300);
    const camera = new THREE.PerspectiveCamera(38, 1, .1, 250);
    const initial = new THREE.Vector3(31, 35, 44);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1, -1); controls.enableDamping = true; controls.enablePan = true;
    controls.screenSpacePanning = false; controls.minDistance = 24; controls.maxDistance = 135;
    controls.minPolarAngle = .2; controls.maxPolarAngle = Math.PI / 2.3;
    camera.position.copy(initial); controls.update();
    scene.add(new THREE.HemisphereLight(0xffffff, 0x999da1, 1.55));
    const sun = new THREE.DirectionalLight(0xffffff, 2.4); sun.position.set(-28, 45, 27); sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -35, right: 35, top: 30, bottom: -30 }); sun.shadow.normalBias = .06; scene.add(sun);
    const geos = new Set<THREE.BufferGeometry>(), mats = new Set<THREE.Material>(), textures = new Set<THREE.Texture>();
    const pickables: THREE.Mesh[] = [], highlights: Record<string, THREE.MeshStandardMaterial[]> = {};
    const meshGroup = new THREE.Group(), wanGroup = new THREE.Group(); scene.add(meshGroup, wanGroup);
    const standard = (color: THREE.ColorRepresentation, extra: THREE.MeshStandardMaterialParameters = {}) => {
      const material = new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: .85, ...extra }); mats.add(material); return material;
    };
    const unlit = (color: number, opacity = 1) => { const material = new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity, side: THREE.DoubleSide }); mats.add(material); return material; };
    const add = (geo: THREE.BufferGeometry, material: THREE.Material, x = 0, y = 0, z = 0, parent: THREE.Object3D = scene) => {
      geos.add(geo); const object = new THREE.Mesh(geo, material); object.position.set(x, y, z); object.castShadow = true; object.receiveShadow = true; parent.add(object); return object;
    };
    const box = (w: number, h: number, d: number, color: number, x: number, y: number, z: number, parent: THREE.Object3D = scene) => add(new THREE.BoxGeometry(w, h, d), standard(color), x, y, z, parent);
    const cylinder = (top: number, bottom: number, h: number, color: number, x: number, y: number, z: number, parent: THREE.Object3D = scene) => add(new THREE.CylinderGeometry(top, bottom, h, 9), standard(color), x, y, z, parent);
    const markPart = (group: THREE.Object3D, id: string) => {
      highlights[id] ||= [];
      group.traverse(child => {
        if (!(child instanceof THREE.Mesh)) return;
        child.userData.part = id; pickables.push(child);
        if (child.material instanceof THREE.MeshStandardMaterial) { child.material.emissive.setHex(0x29a7e5); highlights[id].push(child.material); }
      });
    };
    const label = (text: string, x: number, y: number, z: number, parent: THREE.Object3D, width = 6) => {
      const canvas = document.createElement("canvas"); canvas.width = 768; canvas.height = 128;
      const ctx = canvas.getContext("2d")!; ctx.fillStyle = "#ffffff"; ctx.strokeStyle = "#c9d4df"; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.roundRect(3, 3, 762, 122, 27); ctx.fill(); ctx.stroke(); ctx.font = "600 68px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = "#15202d"; ctx.fillText(text, 384, 65);
      const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; textures.add(texture);
      const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false, toneMapped: false }); mats.add(material);
      const sprite = new THREE.Sprite(material); sprite.position.set(x, y, z); sprite.scale.set(width * 1.25, width * 1.25 / 6, 1); sprite.renderOrder = 15; parent.add(sprite); return sprite;
    };
    const oval = (x: number, z: number, rx: number, rz: number, color: number, y = .27) => {
      const o = add(new THREE.CircleGeometry(1, 32), standard(color), x, y, z); o.rotation.x = -Math.PI / 2; o.scale.set(rx, rz, 1); return o;
    };
    const gable = (w: number, d: number, height: number, color: number, x: number, y: number, z: number, parent: THREE.Object3D) => {
      const shape = new THREE.Shape(); shape.moveTo(-w / 2, 0); shape.lineTo(0, height); shape.lineTo(w / 2, 0); shape.closePath();
      return add(new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false }), standard(color), x, y, z - d / 2, parent);
    };
    // The illustrated valley is deliberately not a map or a link-budget model.
    const groundShape = new THREE.Shape(); groundShape.moveTo(-25, -17); groundShape.quadraticCurveTo(-28, -12, -26, 13); groundShape.quadraticCurveTo(-24, 19, -17, 19); groundShape.lineTo(22, 19); groundShape.quadraticCurveTo(29, 16, 28, 10); groundShape.lineTo(28, -14); groundShape.quadraticCurveTo(26, -19, 18, -19); groundShape.lineTo(-17, -19); groundShape.quadraticCurveTo(-24, -19, -25, -17);
    const baseGeo = new THREE.ExtrudeGeometry(groundShape, { depth: .9, bevelEnabled: true, bevelSegments: 2, bevelSize: .35, bevelThickness: .2 }); baseGeo.rotateX(Math.PI / 2); add(baseGeo, standard(0xb5a58a), 0, .18, 0);
    const surfaceGeo = new THREE.ShapeGeometry(groundShape, 24); surfaceGeo.rotateX(Math.PI / 2); add(surfaceGeo, standard(0x87aa6c, { side: THREE.DoubleSide }), 0, .24, 0);
    const hills = [[-20,-12,6,3.7,5],[-8,-14,7,3.1,4],[1,-9,5,3.8,4],[23,-12,5,3,4],[-24,7,3,2.5,5],[8,15,7,2.6,3]];
    hills.forEach(([x,z,rx,h,rz],i) => { const hill = add(new THREE.SphereGeometry(1, 17, 10), standard([0x5b8850,0x729b5e,0x688e55][i%3]), x, .2, z); hill.scale.set(rx,h,rz); });
    const hillHeight = (x:number,z:number) => hills.reduce((y,[hx,hz,rx,h,rz]) => { const d=((x-hx)/rx)**2+((z-hz)/rz)**2; return Math.max(y,d<1?Math.sqrt(1-d)*h:0); },0);
    const ribbon = (points: THREE.Vector3[], width: number, color: number, y: number) => {
      const curve = new THREE.CatmullRomCurve3(points), positions: number[] = [], indices: number[] = [];
      for (let i=0;i<=80;i++) { const p=curve.getPoint(i/80),t=curve.getTangent(i/80); positions.push(p.x-t.z*width/2,y,p.z+t.x*width/2,p.x+t.z*width/2,y,p.z-t.x*width/2); if(i<80){const k=i*2;indices.push(k,k+2,k+1,k+1,k+2,k+3);} }
      const geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();const object=add(geo,standard(color,{side:THREE.DoubleSide}));return {curve,object};
    };
    ribbon(Array.from({length:30},(_,i)=>{const z=-19+i*38/29;return new THREE.Vector3(riverX(z),0,z);}),3.2,0x2089b4,.4);
    for(const side of[-1,1])ribbon(Array.from({length:30},(_,i)=>{const z=-19+i*38/29;return new THREE.Vector3(riverX(z)+side*1.85,0,z);}),.4,0xa7ab90,.3);
    const track = ribbon([[-23,10],[-17,9],[-12,4],[-8,2],[-3,4],[4,5],[11,4],[19,8],[25,12]].map(([x,z])=>new THREE.Vector3(x,0,z)),.8,0xc6b695,.29).curve;
    for(const z of[4,13]){const x=riverX(z);box(6.8,.15,1.1,0xb69f7b,x,.8,z);for(const zz of[z-.53,z+.53]){box(6.8,.06,.05,0x746955,x,1.4,zz);for(let i=-3.2;i<3.3;i+=.8)cylinder(.027,.027,.65,0x7c725f,x+i,1.1,zz);}}
    const cottages=[[-21,1],[-17,-3],[-19,5],[-14,8],[-12,11],[-8,7],[-8,-3],[10,8],[15,10],[21,12],[23,3],[9,-3]];
    const roofColors=[0x9d523c,0x44576a,0x80614b,0x6f5450];
    cottages.forEach(([x,z],i)=>{const group=new THREE.Group();group.position.set(x,.26,z);group.rotation.y=(i%3-.8)*.24;scene.add(group);oval(x,z,1.8,1.6,0xb8b68d);box(1.6,.9,1.7,0xd9cbb0,0,.54,0,group);gable(1.9,2,.57,roofColors[i%4],0,1.02,0,group);box(.32,.64,.05,0x6c523b,0,.4,.88,group);for(const xx of[-.52,.52]){box(.3,.29,.05,0xe8dec7,xx,.65,.88,group);box(.21,.2,.055,0x3b6571,xx,.65,.91,group);}for(let f=0;f<4;f++)box(.05,.4,.06,0x9e815b,-.9+f*.6,.24,-1.2,group);box(1.85,.05,.05,0xb39b73,0,.39,-1.2,group);});
    // Small terraced plots and river stones add everyday village detail.
    for(const [x,z] of [[-17,13],[-10,-8],[19,14],[22,-3]])for(let i=0;i<3;i++)oval(x,z,2.9-i*.45,1.8-i*.22,[0xbaa96e,0xa6b976,0xc2ba84][i],.29+i*.03);
    let seed=5827;const rand=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646;};
    const trees:{x:number;z:number;y:number;size:number;pine:boolean}[]=[];let tries=0;
    while(trees.length<300&&tries++<5000){const x=-25+rand()*51,z=-17+rand()*34;if(Math.abs(x-riverX(z))<2.7)continue;if([...MESH_PARTS,...WAN_PARTS].some(p=>Math.hypot(x-p.x,z-p.z)<3.4))continue;if(cottages.some(([hx,hz])=>Math.hypot(x-hx,z-hz)<2.0))continue;if(track.getPoints(35).some(p=>Math.hypot(x-p.x,z-p.z)<.8))continue;trees.push({x,z,y:.24+hillHeight(x,z),size:.7+rand()*.85,pine:rand()>.3});}
    const trunkGeo=new THREE.CylinderGeometry(.06,.1,.8,6),pineGeo=new THREE.ConeGeometry(.65,1.9,7),leafGeo=new THREE.IcosahedronGeometry(.7,0);[trunkGeo,pineGeo,leafGeo].forEach(g=>geos.add(g));
    const trunks=new THREE.InstancedMesh(trunkGeo,standard(0x745a3d),trees.length);scene.add(trunks);trunks.castShadow=true;
    const matrix=new THREE.Matrix4(),quaternion=new THREE.Quaternion(),scale=new THREE.Vector3();
    trees.forEach((p,i)=>{matrix.compose(new THREE.Vector3(p.x,p.y+p.size*.4,p.z),quaternion,scale.set(1,p.size,1));trunks.setMatrixAt(i,matrix);});
    for(let kind=0;kind<4;kind++){const points=trees.filter((p,i)=>(p.pine?i%2:i%2+2)===kind);const crowns=new THREE.InstancedMesh(kind<2?pineGeo:leafGeo,standard([0x285f42,0x397648,0x55874c,0x719c55][kind]),points.length);scene.add(crowns);crowns.castShadow=true;crowns.receiveShadow=true;points.forEach((p,i)=>{matrix.compose(new THREE.Vector3(p.x,p.y+p.size*1.35,p.z),quaternion,scale.set(p.size,p.size,p.size));crowns.setMatrixAt(i,matrix);});}
    const rockGeo=new THREE.IcosahedronGeometry(1,0);geos.add(rockGeo);const rocks=new THREE.InstancedMesh(rockGeo,standard(0x999a8d),48);scene.add(rocks);for(let i=0;i<48;i++){const z=-17+rand()*34,x=riverX(z)+(i%2?1:-1)*(1.9+rand()*.5);matrix.compose(new THREE.Vector3(x,.43,z),quaternion,scale.set(.15+rand()*.2,.1+rand()*.13,.17+rand()*.22));rocks.setMatrixAt(i,matrix);}
    const clearPlatform=(x:number,z:number,w:number,d:number,parent:THREE.Object3D)=>box(w,.15,d,0xc5c5b7,x,.34,z,parent);
    const antenna=(x:number,y:number,z:number,parent:THREE.Object3D, tall=4.0)=>{
      cylinder(.035,.075,tall,0x747c80,x,y+tall/2,z,parent);box(.7,.055,.055,0xc2c9ca,x,y+tall-.3,z,parent);box(.055,.055,.65,0xc2c9ca,x,y+tall-.3,z,parent);
      add(new THREE.SphereGeometry(.11,8,7),standard(0x44b8e6,{emissive:0x44b8e6,emissiveIntensity:1.3}),x,y+tall+.03,z,parent);
    };
    const radioHub=(part:Part,parent:THREE.Object3D,isRelief=false)=>{
      const group=new THREE.Group();group.position.set(part.x,.3,part.z);parent.add(group);clearPlatform(0,0,4.5,3.9,group);
      box(3.0,1.35,2.4,0xe4e3d5,0,1.1,0,group);gable(3.4,2.75,.65,0x3e5e74,0,1.8,0,group);box(.65,.9,.08,0x3d5f6c,0,.87,1.25,group);for(const xx of[-1,1])box(.55,.43,.07,0x80b1bf,xx,1.27,1.24,group);
      box(1.6,.19,.08,0x006aff,0,1.66,1.28,group);antenna(1.7,.5,-.6,group,4.6);
      // An open bench makes the local Pi / ESP32 / separate radio bridge visible.
      box(2.1,.14,1.2,0x9d9a87,-1.0,.88,2.0,group);box(.82,.07,.59,0x207b57,-1.53,1.01,2.0,group);box(.2,.18,.24,0xb9bec0,-1.8,1.09,2.0,group);box(.22,.03,.22,0x172d2b,-1.42,1.07,2.0,group);
      box(.51,.07,.37,0x328b91,-.8,1.01,2.0,group);box(.2,.04,.2,0x293d42,-.8,1.08,2.0,group);box(.4,.07,.37,0x286baf,-.23,1.01,2.0,group);box(.19,.04,.2,0x263543,-.23,1.08,2.0,group);
      for(let j=0;j<3;j++){const wire=new THREE.CatmullRomCurve3([new THREE.Vector3(-.9+j*.08,1.09,2.0),new THREE.Vector3(-.6,1.38+j*.08,2.04),new THREE.Vector3(-.3+j*.05,1.1,2.0)]);add(new THREE.TubeGeometry(wire,12,.017,4,false),standard([0xe0454b,0xe4bc43,0x2379d0][j]),0,0,0,group);}
      if(isRelief){box(1,.8,.16,0x253743,.8,1.3,2,group);box(.86,.61,.035,0x7ba8c6,.8,1.3,2.1,group);box(1.1,.04,.65,0x333e47,.8,.91,2.3,group);}
      markPart(group,part.id);label(part.short,part.x,6.2,part.z,parent,6.0);
    };
    radioHub(MESH_PARTS[1],meshGroup);radioHub(MESH_PARTS[3],meshGroup,true);
    const ridge=new THREE.Group();ridge.position.set(0,4.0,-7);meshGroup.add(ridge);box(1.7,.15,1.5,0xb8b7a7,0,.05,0,ridge);box(.7,1.15,.7,0xd3d8d7,0,.69,0,ridge);box(.53,.3,.11,0x264c67,0,1.0,.4,ridge);antenna(0,1.3,0,ridge,3.9);const solar=box(1.15,.08,.9,0x294760,-1.0,1.2,0,ridge);solar.rotation.z=.35;markPart(ridge,"relay");label("Ridge relay",0,9.7,-7,meshGroup,5.7);
    const phone=new THREE.Group();phone.position.set(-19,.34,7);phone.rotation.y=-.3;meshGroup.add(phone);box(1.28,.16,2.2,0xc3bda9,0,0,0,phone);box(.82,1.65,.14,0x1d2831,0,.95,0,phone);box(.68,1.37,.03,0xdcebf3,0,1.0,.09,phone);box(.53,.16,.034,0x006aff,0,1.29,.115,phone);box(.48,.06,.034,0x8ca2b5,0,1.04,.115,phone);box(.48,.06,.034,0x8ca2b5,0,.85,.115,phone);box(.35,.18,.034,0x263c51,0,.55,.115,phone);markPart(phone,"phone");label("Resident phone",-19,3.8,7,meshGroup,5.9);
    const serverBuilding=(x:number,z:number,id:string,parent:THREE.Object3D,title:string)=>{
      const group=new THREE.Group();group.position.set(x,.28,z);parent.add(group);clearPlatform(0,0,5.2,4.5,group);box(3.4,2.0,2.6,0xe3e7e8,0,1.4,0,group);box(3.7,.16,2.9,0x405569,0,2.49,0,group);
      for(let rack=0;rack<3;rack++){const xx=-1.12+rack*1.1;box(.8,1.55,.54,0x293b49,xx,1.2,1.5,group);for(let u=0;u<4;u++){box(.68,.23,.06,0x526779,xx,.65+u*.33,1.81,group);box(.05,.05,.03,0x49c3db,xx+.22,.65+u*.33,1.86,group);}}
      antenna(2,.5,-1,group,3.7);markPart(group,id);label(title,x,5.9,z,parent,title.length>15?7.3:6.1);return group;
    };
    serverBuilding(15,-14,"government",meshGroup,"Government desk");
    // LoRaWAN devices do not relay through one another; all three radio spokes terminate at the gateway.
    SENSOR_POSITIONS.forEach((p,i)=>{const group=new THREE.Group();group.position.set(p.x,.3,p.z);wanGroup.add(group);box(.85,.18,.8,0xaeb0a3,0,.1,0,group);cylinder(.04,.06,2.2,0x737c81,0,1.3,0,group);box(.52,.72,.35,0xe4eceb,0,1.8,0,group);box(.33,.19,.05,0x3a748a,0,1.9,.2,group);cylinder(.018,.025,.9,0x394d59,.18,2.4,0,group);if(i===0){box(.14,1.1,.13,0xd1a052,.5,.8,.1,group);for(let t=0;t<5;t++)box(.13,.04,.05,0x4d575b,.5,.5+t*.17,.19,group);}markPart(group,"sensor");label(["Water sensor","Weather sensor","Field sensor"][i],p.x,3.8,p.z,wanGroup,5.7);});
    const gateway=new THREE.Group();gateway.position.set(0,.4,-4);wanGroup.add(gateway);clearPlatform(0,0,3.7,3.1,gateway);box(1.05,1.7,.75,0xe2e8e9,-.7,1.25,0,gateway);box(.8,.55,.05,0x285c7a,-.7,1.6,.41,gateway);box(.65,.09,.06,0x56b9cd,-.7,1.22,.42,gateway);antenna(.6,.5,0,gateway,6.0);antenna(.9,.5,.5,gateway,5.4);for(let k=0;k<3;k++)box(.46,.08,.15,0xa5afb5,.6,4.3+k*.5,0,gateway);markPart(gateway,"gateway");label("LoRaWAN gateway",0,8.1,-4,wanGroup,6.5);
    serverBuilding(15,-10,"network",wanGroup,"Network server");
    const app=new THREE.Group();app.position.set(20,.3,7);wanGroup.add(app);clearPlatform(0,0,4.8,3.8,app);box(3.2,.14,2.2,0x8d9399,0,.65,0,app);box(2.5,1.7,.17,0x253849,0,1.6,0,app);box(2.27,1.43,.04,0xe1edf2,0,1.6,.12,app);for(let j=0;j<4;j++)box(.3,.2+j*.2,.035,0x2578b9,-.78+j*.52,1.2+j*.1,.15,app);box(.7,.14,.04,0x213e59,0,2.0,.15,app);box(2.6,.05,1.0,0x384a58,0,.83,.65,app);markPart(app,"application");label("Telemetry application",20,4.0,7,wanGroup,7.3);
    // Fine rings illustrate local Wi-Fi; they are not a measured coverage result.
    for(const radius of[2.2,2.7]){const ring=add(new THREE.RingGeometry(radius,radius+.045,64),unlit(0x006aff,.48),-12,.34,1,meshGroup);ring.rotation.x=-Math.PI/2;}
    const planningGroup=new THREE.Group();scene.add(planningGroup);const planningLabels:THREE.Sprite[]=[];
    for(const km of[1,3,5]){const points=Array.from({length:81},(_,i)=>{const a=i/80*Math.PI*2;return new THREE.Vector3(Math.cos(a)*km*1.45,.31,Math.sin(a)*km*1.45);});const geo=new THREE.BufferGeometry().setFromPoints(points);geos.add(geo);const mat=new THREE.LineDashedMaterial({color:0x248fb7,transparent:true,opacity:.48,dashSize:.35,gapSize:.28});mats.add(mat);const ring=new THREE.Line(geo,mat);ring.computeLineDistances();planningGroup.add(ring);planningLabels.push(label(`${km} km`,km*1.45,.4,0,planningGroup,2.8));}
    type VisualLink = { id:string; parent:THREE.Object3D; curve:THREE.QuadraticBezierCurve3; line:THREE.Mesh; material:THREE.MeshBasicMaterial; dots:THREE.Mesh[]; color:number };
    const links:VisualLink[]=[];
    const link=(id:string,a:THREE.Vector3,b:THREE.Vector3,height:number,color:number,parent:THREE.Object3D)=>{
      const curve=new THREE.QuadraticBezierCurve3(a,new THREE.Vector3((a.x+b.x)/2,height,(a.z+b.z)/2),b),material=unlit(color,.3);const line=add(new THREE.TubeGeometry(curve,45,.035,5,false),material,0,0,0,parent);line.castShadow=false;line.renderOrder=3;
      const dots=Array.from({length:3},()=>{const dot=add(new THREE.SphereGeometry(.14,9,7),unlit(color),0,0,0,parent);dot.castShadow=false;dot.visible=false;return dot;});links.push({id,parent,curve,line,material,dots,color});
    };
    link("wifi",new THREE.Vector3(-19,1.8,7),new THREE.Vector3(-12,2.5,1),4.8,0x006aff,meshGroup);
    link("radio-a",new THREE.Vector3(-12,5.5,1),new THREE.Vector3(0,8.5,-7),12.5,0x169bbb,meshGroup);
    link("radio-b",new THREE.Vector3(0,8.5,-7),new THREE.Vector3(14,5.5,2),13.0,0x169bbb,meshGroup);
    link("government",new THREE.Vector3(15,4.5,-14),new THREE.Vector3(14,4.7,2),9.5,0x65758a,meshGroup);
    SENSOR_POSITIONS.forEach((p,i)=>link(`sensor-${["a","b","c"][i]}`,new THREE.Vector3(p.x,2.8,p.z),new THREE.Vector3(0,6.5,-4),9,0x169bbb,wanGroup));
    link("wan-ip",new THREE.Vector3(0,5.5,-4),new THREE.Vector3(15,4.2,-10),10.5,0x65758a,wanGroup);
    link("wan-app",new THREE.Vector3(15,4.2,-10),new THREE.Vector3(20,2.3,7),9,0x65758a,wanGroup);
    const selectedRing=add(new THREE.RingGeometry(2.6,2.7,60),unlit(0x006aff,.75),-12,.35,1);selectedRing.rotation.x=-Math.PI/2;
    const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let dragging=false,lastX=0,lastY=0;
    const pick=(event:PointerEvent)=>{
      const rect=renderer.domElement.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(pointer,camera);
      const hit=ray.intersectObjects(pickables,false).find(item=>{let p:THREE.Object3D|null=item.object;while(p){if(!p.visible)return false;p=p.parent;}return true;});const id=hit?.object.userData.part;
      renderer.domElement.style.cursor=id?"pointer":"grab";if(id&&!dragging)setSelected(id);
    };
    const down=(e:PointerEvent)=>{dragging=false;lastX=e.clientX;lastY=e.clientY;};
    const move=(e:PointerEvent)=>{if(e.buttons&&Math.abs(e.clientX-lastX)+Math.abs(e.clientY-lastY)>3)dragging=true;lastX=e.clientX;lastY=e.clientY;if(!e.buttons)pick(e);};
    const up=(e:PointerEvent)=>{if(!dragging)pick(e);dragging=false;};
    renderer.domElement.addEventListener("pointerdown",down);renderer.domElement.addEventListener("pointermove",move);renderer.domElement.addEventListener("pointerup",up);
    let sized=false;
    const fit=()=>{const w=mount.clientWidth,h=mount.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();if(!sized){camera.position.copy(initial);if(w/h<1.1)camera.position.multiplyScalar(1.9);controls.update();sized=true;}};
    const resize=new ResizeObserver(fit);resize.observe(mount);fit();
    let visible=true;const observer=new IntersectionObserver(([entry])=>visible=entry.isIntersecting,{rootMargin:"150px"});observer.observe(mount);
    const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;const started=performance.now();let frame=0;
    const animate=()=>{
      frame=requestAnimationFrame(animate);if(!visible||document.hidden)return;const state=live.current,t=(performance.now()-started)/1000;
      meshGroup.visible=state.mode==="mesh";wanGroup.visible=state.mode==="lorawan";
      const currentJourney=state.mode==="lorawan"?WAN_JOURNEY:state.scenario==="request"?REQUEST_JOURNEY:BULLETIN_JOURNEY;
      const current=state.running?currentJourney[state.stepIndex]:undefined;
      const elapsed=performance.now()-state.started;
      const before=currentJourney.slice(0,Math.max(0,state.stepIndex)).reduce((sum,item)=>sum+item.duration,0);
      const progress=current?Math.min(1,Math.max(0,(elapsed-before)/current.duration)):0;
      links.forEach(path=>{
        const active=current?.links.includes(path.id)||false;
        path.material.opacity=active?.95:path.id==="government"?.18:.27;
        path.material.color.setHex(active&&current?.ack?0x2a9875:path.color);
        path.dots.forEach((dot,index)=>{
          dot.visible=active&&path.parent.visible;
          let fraction=reduced?.52:(progress*1.15+index*.12)%1;
          if(current?.ack)fraction=1-fraction;
          // The two returning radio hops light sequentially rather than suggesting a new route.
          if(active&&current?.links.length===2){const first=path.id===current.links[0];dot.visible=dot.visible&&(first?progress<.53:progress>=.47);fraction=reduced?.5:((progress-(first?0:.5))*2+index*.1)%1;if(fraction<0)fraction+=1;if(current.ack)fraction=1-fraction;}
          dot.position.copy(path.curve.getPoint(fraction));(dot.material as THREE.MeshBasicMaterial).color.setHex(current?.ack?0x2a9875:path.color);dot.scale.setScalar(reduced?1:1.1+.18*Math.sin(t*7));
        });
      });
      Object.entries(highlights).forEach(([id,materials])=>materials.forEach(material=>material.emissiveIntensity=current?.parts.includes(id)?.4:state.selected===id?.16:0));
      const selectedPart=(state.mode==="mesh"?MESH_PARTS:WAN_PARTS).find(p=>p.id===state.selected);
      selectedRing.visible=!!selectedPart;if(selectedPart)selectedRing.position.set(selectedPart.x,.39,selectedPart.z);
      selectedRing.scale.setScalar(reduced?1:1+.025*Math.sin(t*3));planningGroup.visible=state.planning;
      planningGroup.position.set(state.mode==="mesh"?0:0,state.mode==="mesh"?4.05:.1,state.mode==="mesh"?-7:-4);
      // These 1:3:5 concentric rings are a planning illustration only; they never decide delivery.
      if(state.zoom){camera.position.sub(controls.target).multiplyScalar(state.zoom>0?.88:1.12).add(controls.target);state.zoom=0;}
      if(state.reset){camera.position.copy(initial);if(mount.clientWidth/mount.clientHeight<1.1)camera.position.multiplyScalar(1.9);controls.target.set(0,1,-1);controls.update();state.reset=false;}
      controls.update();renderer.render(scene,camera);
    };
    animate();
    return()=>{
      cancelAnimationFrame(frame);resize.disconnect();observer.disconnect();renderer.domElement.removeEventListener("pointerdown",down);renderer.domElement.removeEventListener("pointermove",move);renderer.domElement.removeEventListener("pointerup",up);controls.dispose();scene.traverse(object=>{if(object instanceof THREE.InstancedMesh)object.dispose();});geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());textures.forEach(texture=>texture.dispose());renderer.dispose();renderer.domElement.remove();
    };
  }, []);

  const statusTitle = running ? step?.title : complete ? (mode === "lorawan" ? "Sample reached the application" : scenario === "request" ? "Acknowledgement received" : "Demo bulletin shared nearby") : "Follow a small message";
  const statusDescription = running ? step?.description : complete ? (mode === "lorawan" ? "The gateway used IP backhaul. This was a fictional reading, not a warning." : scenario === "request" ? "The exercise record was received. No responder was dispatched." : "The local hub can retain a bulletin for nearby residents; persistence is conceptual in this animation.") : mode === "mesh" ? "Watch a phone reach a human coordinator through local Wi-Fi and dedicated radios." : "Watch independent sensors reach a gateway, network server and application.";
  return (
    <section className="tg-lora" aria-label="Interactive radio network demonstration">
      <div className="tg-lora-toolbar">
        <div className="tg-lora-modes" aria-label="Radio architecture">
          <button aria-pressed={mode === "mesh"} onClick={() => changeMode("mesh")}><Radio size={17}/>Community mesh</button>
          <button aria-pressed={mode === "lorawan"} onClick={() => changeMode("lorawan")}><Activity size={17}/>LoRaWAN sensors</button>
        </div>
        <span className="tg-lora-simulation-tag">SIMULATED</span>
      </div>
      <div className="tg-lora-stage">
        <div className="tg-lora-canvas" ref={host}/>
        {fallback && <div className="tg-lora-fallback"><Mountain size={44}/><p>Explore the same network with the controls below.</p></div>}
        <div className="tg-lora-scene-title"><span/>{mode === "mesh" ? "A COMMUNITY ACROSS THE VALLEY" : "A SEPARATE SENSOR NETWORK"}</div>
        <div className="tg-lora-legend"><span><i className="wifi"/>Local Wi-Fi</span><span><i className="radio"/>{mode === "mesh" ? "LoRa mesh" : "LoRaWAN radio"}</span><span><i className="ip"/>IP backhaul</span></div>
        <div className="tg-lora-camera">
          <button aria-label="Zoom in on radio network" onClick={() => live.current.zoom = 1}><Plus size={17}/></button>
          <button aria-label="Zoom out from radio network" onClick={() => live.current.zoom = -1}><Minus size={17}/></button>
          <button aria-label="Reset radio view" onClick={() => live.current.reset = true}><RotateCcw size={17}/></button>
        </div>
        <div className="tg-lora-scene-hint"><Move size={13}/>Drag to explore<span>·</span>Tap a device</div>
        {(running || complete) && <div className="tg-lora-now"><Radio size={14}/>{statusTitle}</div>}
        {planning && <div className="tg-lora-planning-badge">1 / 3 / 5 km · illustrative rings only</div>}
      </div>
      <div className="tg-lora-journey" aria-label="Demonstration steps">
        {journey.map((item,index)=><div key={item.title} className={(running && index === stepIndex ? "current " : "") + (index < stepIndex || complete ? "done" : "")}><span>{index < stepIndex || complete ? <Check size={13}/> : index+1}</span><p>{item.title}</p>{index<journey.length-1&&<ArrowRight size={13}/>}</div>)}
      </div>
      <div className="tg-lora-panels" data-scene-controls>
        <div className="tg-lora-demo-panel">
          <div className="tg-lora-panel-heading"><span className="tg-lora-eyebrow">{mode === "mesh" ? "SHORT MESSAGES. HUMAN FOLLOW-UP." : "STAR-OF-STARS. NOT A MESH."}</span><h3>{mode === "mesh" ? "See the connection work." : "Follow a sensor sample."}</h3></div>
          {mode === "mesh" && <div className="tg-lora-scenario"><button disabled={running} aria-pressed={scenario === "request"} onClick={() => { setScenario("request"); setStepIndex(-1); }}><FileText size={15}/>Help request</button><button disabled={running} aria-pressed={scenario === "bulletin"} onClick={() => { setScenario("bulletin"); setStepIndex(-1); }}><Bell size={15}/>Government bulletin</button></div>}
          <div className="tg-lora-message"><span>{mode === "lorawan" ? "FICTIONAL TELEMETRY" : scenario === "request" ? "FICTIONAL HOUSEHOLD · H-12" : "EXERCISE BULLETIN"}</span><p>{mode === "lorawan" ? "R-03 · level 0.8 m · sample 018" : scenario === "request" ? "Drinking water needed · 4 people · request 018" : "Information pack refreshed. Ask your coordinator for verified instructions."}</p></div>
          <button className="tg-lora-send" disabled={running} onClick={sendDemo}><Send size={17}/>{running ? "Following the message…" : complete ? "Replay demonstration" : mode === "lorawan" ? "Send demo sensor sample" : scenario === "request" ? "Send demo request" : "Push demo bulletin"}</button>
          <div className={"tg-lora-status " + (complete ? "complete" : "")} role="status" aria-live="polite"><span>{complete ? <Check size={18}/> : running ? <Radio size={18}/> : <Eye size={18}/>}</span><div><strong>{statusTitle}</strong><p>{statusDescription}</p></div></div>
        </div>
        <aside className="tg-lora-inspector">
          <span className="tg-lora-eyebrow">INSPECT THE ARCHITECTURE</span>
          <div className="tg-lora-part-buttons" aria-label="Select radio component">{parts.map(p=><button key={p.id} aria-pressed={selected===p.id} onClick={()=>setSelected(p.id)}>{p.id === "phone" ? <Smartphone size={15}/> : p.id === "government" || p.id === "network" || p.id === "application" ? <Server size={15}/> : p.id === "sensor" ? <Activity size={15}/> : <Radio size={15}/>}<span>{p.short}</span></button>)}</div>
          <h3>{part.name}</h3><p>{part.description}</p><p className="tg-lora-detail">{part.detail}</p>
          <div className="tg-lora-architecture-note">{mode === "mesh" ? <><Wifi size={17}/><span>Phone → local Wi-Fi → Pi + ESP32 / LoRa → relay → relief centre</span></> : <><Cable size={17}/><span>End devices → gateway → IP backhaul → network server → application</span></>}</div>
        </aside>
      </div>
      <div className="tg-lora-range">
        <button aria-pressed={planning} onClick={() => setPlanning(!planning)}><Mountain size={17}/>{planning ? "Hide planning rings" : "Show planning rings"}</button>
        <div><strong>Long range depends on the place.</strong><p>1, 3 and 5 km rings are illustrative planning distances, not measured coverage. Terrain, foliage, antenna placement, radio settings, power and interference affect a real link. Ring size never decides delivery in this demo.</p></div>
      </div>
      <div className="tg-lora-text-note"><button aria-expanded={shortTextOpen} onClick={() => setShortTextOpen(!shortTextOpen)}><ImageOff size={17}/><span>Why short text?</span><Plus size={15}/></button>{shortTextOpen&&<p>LoRa is suited to compact requests, check-ins and acknowledgements. Photos, video, maps and a knowledge library need much more capacity; Together keeps rich content on a phone or local Wi-Fi hub. No data-rate or radio-range performance is measured here.</p>}</div>
      <p className="tg-lora-caption">Illustrated hardware and timed animations only. No physical radio, live sensor, emergency dispatch or official government feed. Community mesh and conventional LoRaWAN are separate proposed networks. New AI answers in this MVP use connected cloud APIs.</p>
    </section>
  );
}
