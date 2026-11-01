"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Cpu, Radio, Cable, Wifi, Smartphone, BatteryCharging, Move, ArrowUpRight, Check, Power, Send, Plus, Minus, RotateCcw, Focus, Hand, Info } from "lucide-react";
import "./hardware-bench.css";

const WIRES = [
  { id: "sck", signal: "SCK", pin: "GPIO 18", color: "#f6c52b", description: "The illustrative SPI clock connection. The controller provides a clock for communication with the radio.", role: "SPI clock", voltage: "Digital signal · simulated" },
  { id: "miso", signal: "MISO", pin: "GPIO 19", color: "#2795ff", description: "The illustrative SPI data connection from the LoRa transceiver back to the ESP32.", role: "Radio → controller", voltage: "Digital signal · simulated" },
  { id: "mosi", signal: "MOSI", pin: "GPIO 23", color: "#12bc78", description: "The illustrative SPI data connection from the ESP32 to the separate LoRa transceiver.", role: "Controller → radio", voltage: "Digital signal · simulated" },
  { id: "nss", signal: "NSS / CS", pin: "GPIO 5", color: "#b26cfa", description: "The chip-select connection tells the radio when the controller is addressing it.", role: "Radio chip select", voltage: "Digital signal · simulated" },
  { id: "reset", signal: "RESET", pin: "GPIO 14", color: "#ff8b20", description: "A conceptual reset control for the SX127x radio module. The actual wiring depends on the exact module.", role: "Radio reset", voltage: "Digital signal · simulated" },
  { id: "dio", signal: "DIO0", pin: "GPIO 26", color: "#f74f97", description: "An illustrative interrupt connection for radio events, such as a transmit or receive event.", role: "Radio event interrupt", voltage: "Digital signal · simulated" },
  { id: "power", signal: "3V3", pin: "3.3 V", color: "#f53e39", description: "Represents a compatible, regulated 3.3 V supply to the radio. It is a design label, not a voltage measurement.", role: "Regulated radio supply", voltage: "Nominal 3.3 V label · simulated" },
  { id: "ground", signal: "GND", pin: "GND", color: "#20252d", description: "The conceptual shared ground reference between the controller and the radio module.", role: "Shared ground", voltage: "Ground reference · simulated" },
];
const PARTS: Record<string, { title: string; label: string; body: string; tag: string }> = {
  pi: { title: "Raspberry Pi community hub", label: "Raspberry Pi", body: "The community server hosts the local app, downloaded information and a message queue. USB serial links it to the ESP32 radio controller. AI in this MVP is provided through cloud APIs.", tag: "LOCAL SERVER · WI-FI" },
  esp: { title: "ESP32 radio controller", label: "ESP32", body: "The microcontroller connects the local hub to a separate LoRa transceiver. It handles radio control and short messages; it does not run the large language model.", tag: "CONTROLLER · USB SERIAL" },
  radio: { title: "SX127x LoRa transceiver", label: "LoRa radio", body: "A separate radio module represents the long-range link between equipped relief points. Short requests can travel over radio; full knowledge pages and AI conversations stay on the local network.", tag: "SHORT MESSAGES · LONG RANGE" },
  breadboard: { title: "Prototype breadboard", label: "Breadboard", body: "The white breadboard makes the conceptual connections easy to inspect. Colored jumpers illustrate SPI, control and power connections. Real field equipment would use an engineered, protected assembly.", tag: "PROTOTYPE CONNECTIONS" },
  phone: { title: "A familiar app on a phone", label: "Phone", body: "A phone joins the hub’s nearby Wi-Fi. People can read saved information and submit community requests. New AI answers need internet connectivity in this API-backed MVP.", tag: "LOCAL WI-FI · COMMUNITY APP" },
  power: { title: "Battery power reserve", label: "Battery", body: "The battery represents a suitable power reserve for the hub and controller. Actual regulation, wiring and runtime must be designed and measured for the selected equipment.", tag: "POWER CONTINUITY" },
  antenna: { title: "LoRa antenna", label: "Antenna", body: "The radio connects to a matching antenna. Range depends on terrain, placement, radio configuration and regional requirements; this visual does not simulate electromagnetic propagation.", tag: "RADIO FRONT END" },
};
type CameraCommand = { type: "zoomIn" | "zoomOut" | "reset" | "focus"; seq: number };

export default function HardwareSimulation() {
  const host = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState("esp");
  const [wire, setWire] = useState<string | null>(null);
  const [powered, setPowered] = useState(true);
  const [transmitting, setTransmitting] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [command, setCommand] = useState<CameraCommand>({ type: "reset", seq: 0 });
  const [hint, setHint] = useState("Click a board, a jumper wire or a pin to inspect it.");
  const state = useRef({ selected, wire, powered, transmitting, command });
  state.current = { selected, wire, powered, transmitting, command };
  const activeWire = WIRES.find(item => item.id === wire);
  const part = PARTS[selected] || PARTS.esp;
  const selectPart = (id: string) => { setSelected(id); setWire(null); };
  const cameraAction = (type: CameraCommand["type"]) => setCommand(previous => ({ type, seq: previous.seq + 1 }));
  const pulse = () => {
    if (!powered || transmitting) return;
    setTransmitting(true);
    setHint("SOS visualization: controller → LoRa radio. The LED blink is simulated.");
  };
  useEffect(() => {
    if (!transmitting) return;
    const timer = window.setTimeout(() => { setTransmitting(false); setHint("SOS visualization complete. No radio message or rescue dispatch was sent."); }, 5200);
    return () => window.clearTimeout(timer);
  }, [transmitting]);

  useEffect(() => {
    if (!host.current) return;
    const mount = host.current;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "low-power" }); }
    catch { setFallback(true); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setClearColor(0xf3f4f6, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute("role", "img");
    renderer.domElement.setAttribute("aria-label", "Interactive electronics bench with Raspberry Pi, ESP32, separate LoRa radio, white breadboard, colorful jumper wires and battery. Drag to orbit, scroll or use buttons to zoom. Equivalent component and wire controls are below.");
    mount.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf3f4f6);
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 120);
    const initialCamera = new THREE.Vector3(14, 19, 23).multiplyScalar(mount.clientWidth / Math.max(mount.clientHeight, 1) > 1.45 ? 0.76 : 1);
    const initialTarget = new THREE.Vector3(-0.3, 0.5, 0.2);
    camera.position.copy(initialCamera);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(initialTarget);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = true;
    controls.minDistance = 8;
    controls.maxDistance = 43;
    controls.maxPolarAngle = Math.PI / 2.12;
    controls.minPolarAngle = 0.15;
    controls.update();
    scene.add(new THREE.HemisphereLight(0xffffff, 0x717983, 1.5));
    const sun = new THREE.DirectionalLight(0xffffff, 2.8);
    sun.position.set(-10, 20, 8); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 14, bottom: -14 });
    sun.shadow.normalBias = 0.02;
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0xe9f3ff, 0.8); fill.position.set(10, 8, -12); scene.add(fill);
    const geometries: THREE.BufferGeometry[] = [], materials: THREE.Material[] = [], textures: THREE.Texture[] = [], pickables: THREE.Object3D[] = [];
    const centers: Record<string, THREE.Vector3> = {};
    const mat = (color: THREE.ColorRepresentation, options: THREE.MeshStandardMaterialParameters = {}) => {
      const result = new THREE.MeshStandardMaterial({ color, roughness: 0.62, metalness: 0.05, ...options }); materials.push(result); return result;
    };
    const metal = mat(0xbcc5cc, { roughness: 0.3, metalness: 0.78 });
    const dark = mat(0x171c23, { roughness: 0.6 });
    const gold = mat(0xe2ba66, { roughness: 0.32, metalness: 0.65 });
    const plastic = mat(0xecefee, { roughness: 0.83 });
    const mesh = (geometry: THREE.BufferGeometry, material: THREE.Material, x = 0, y = 0, z = 0, parent: THREE.Object3D = scene) => {
      geometries.push(geometry); const result = new THREE.Mesh(geometry, material); result.position.set(x,y,z); result.castShadow=true; result.receiveShadow=true; parent.add(result); return result;
    };
    const box = (w:number,h:number,d:number,material:THREE.Material,x:number,y:number,z:number,parent:THREE.Object3D=scene) => mesh(new THREE.BoxGeometry(w,h,d),material,x,y,z,parent);
    const cyl = (r:number,rb:number,h:number,material:THREE.Material,x:number,y:number,z:number,parent:THREE.Object3D=scene) => mesh(new THREE.CylinderGeometry(r,rb,h,16),material,x,y,z,parent);
    const clickable = (object:THREE.Object3D, id:string) => object.traverse(child=>{ child.userData.part=id;if(child instanceof THREE.Mesh)pickables.push(child); });
    const colorTexture = (width:number,height:number,paint:(ctx:CanvasRenderingContext2D)=>void) => {
      const canvas=document.createElement("canvas");canvas.width=width;canvas.height=height;const ctx=canvas.getContext("2d")!;paint(ctx);
      const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8);textures.push(texture);return texture;
    };
    const surface = (width:number,depth:number,texture:THREE.Texture,x:number,y:number,z:number,parent:THREE.Object3D=scene) => {
      const object=mesh(new THREE.PlaneGeometry(width,depth),mat(0xffffff,{map:texture,transparent:true,roughness:0.7,polygonOffset:true,polygonOffsetFactor:-1}),x,y,z,parent);object.rotation.x=-Math.PI/2;object.castShadow=false;return object;
    };
    const lettering = (text:string,width:number,depth:number,x:number,y:number,z:number,parent:THREE.Object3D=scene,color="#e3ebe6",background="transparent") => {
      const texture=colorTexture(1024,256,ctx=>{if(background!=="transparent"){ctx.fillStyle=background;ctx.fillRect(0,0,1024,256);}ctx.fillStyle=color;ctx.textAlign="center";ctx.textBaseline="middle";ctx.font="600 84px Arial";ctx.fillText(text,512,128);});return surface(width,depth,texture,x,y,z,parent);
    };
    const pcbTexture = (title:string, subtitle:string, green:string, seed:number) => colorTexture(1400,900,ctx=>{
      ctx.fillStyle=green;ctx.fillRect(0,0,1400,900);
      ctx.strokeStyle="rgba(99,222,157,.26)";ctx.lineWidth=3;
      for(let i=0;i<28;i++){const x=60+(i*83+seed*43)%1250;const z=50+(i*71+seed*37)%780;ctx.beginPath();ctx.moveTo(x,z);ctx.lineTo(x+70,z);ctx.lineTo(x+105,z+35);ctx.lineTo(Math.min(1370,x+180),z+35);ctx.stroke();}
      ctx.fillStyle="#d8e5d7";ctx.font="700 45px Arial";ctx.fillText(title,55,125);ctx.font="24px monospace";ctx.fillText(subtitle,55,170);
      ctx.strokeStyle="#d2e6d5";ctx.lineWidth=2;ctx.strokeRect(25,25,1350,850);
      for(let i=0;i<16;i++){ctx.fillStyle=i%3===0?"#cda55b":"#a8c49a";ctx.fillRect(70+i*76,790,25,15);ctx.fillStyle="#dceadb";ctx.font="16px monospace";ctx.fillText(`R${i+1}`,68+i*76,778);}
      ctx.fillStyle="#dceadb";ctx.font="19px monospace";ctx.fillText("TOGETHER • CONCEPT PROTOTYPE",55,715);
    });
    // Matte electronics worktop; the vivid boards are deliberately not tinted by UI styling.
    box(25,0.28,16,mat(0xe3e7e5,{roughness:1}),0,-0.3,0);
    const worktop = colorTexture(1600,1000,ctx=>{ctx.fillStyle="#edf0ee";ctx.fillRect(0,0,1600,1000);ctx.strokeStyle="#dae0dc";ctx.lineWidth=1;for(let x=0;x<1600;x+=50){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,1000);ctx.stroke();}for(let y=0;y<1000;y+=50){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(1600,y);ctx.stroke();}});
    surface(24.8,15.8,worktop,0,-0.145,0);
    // Raspberry Pi: through-hole corners, processor, RAM, GPIO, USB and ethernet sockets.
    const pi=new THREE.Group();pi.position.set(-5.7,0.46,-1.55);scene.add(pi);centers.pi=new THREE.Vector3(-5.7,0.8,-1.55);
    box(5.4,0.14,3.8,mat(0x197c4b),0,0,0,pi);surface(5.37,3.77,pcbTexture("RASPBERRY PI HUB","LOCAL APP · KNOWLEDGE · MESSAGE QUEUE","#18764a",2),0,0.073,0,pi);
    for(const x of[-2.42,2.42])for(const z of[-1.61,1.61]){cyl(0.17,0.17,0.024,gold,x,0.09,z,pi);cyl(0.075,0.075,0.026,dark,x,0.105,z,pi);cyl(0.09,0.09,0.34,metal,x,-0.23,z,pi);}
    box(1.25,0.22,1.12,dark,-0.3,0.19,-0.1,pi);lettering("BCM / CPU",1.0,0.27,-0.3,0.31,-0.1,pi,"#a4acb4");
    box(0.8,0.14,0.7,dark,-1.7,0.15,0.33,pi);lettering("RAM",0.6,0.2,-1.7,0.23,0.33,pi,"#9aa7a8");
    box(0.69,0.16,0.64,metal,0.92,0.16,-0.16,pi);box(0.25,0.12,0.48,dark,1.1,0.14,0.75,pi);
    const header=box(4.1,0.23,0.44,dark,-0.1,0.17,-1.5,pi);
    for(let i=0;i<20;i++)for(const z of[-1.61,-1.39])cyl(0.027,0.027,0.31,gold,-1.95+i*0.195,0.34,z,pi);
    lettering("GPIO · 40 PIN",2.65,0.18,-0.1,0.082,-1.08,pi);
    const usbSocket=(x:number,z:number)=>{box(0.96,0.85,0.83,metal,x,0.43,z,pi);box(0.035,0.32,0.65,dark,x+0.49,0.27,z,pi);box(0.035,0.32,0.65,dark,x+0.49,0.65,z,pi);box(0.04,0.065,0.49,mat(0x177db8),x+0.512,0.27,z,pi);box(0.04,0.065,0.49,mat(0x177db8),x+0.512,0.65,z,pi);};
    usbSocket(2.3,-0.85);usbSocket(2.3,0.25);
    box(1.06,1.0,0.95,metal,2.28,0.5,1.38,pi);box(0.035,0.68,0.72,dark,2.82,0.45,1.38,pi);
    for(let i=0;i<8;i++)box(0.05,0.025,0.025,gold,2.85,0.79,1.1+i*0.08,pi);
    box(0.58,0.2,0.25,metal,-2.25,0.14,1.87,pi);box(0.4,0.1,0.025,dark,-2.25,0.15,2.01,pi);
    for(const x of[-0.95,0.05]){box(0.6,0.24,0.35,metal,x,0.17,1.78,pi);box(0.43,0.12,0.02,dark,x,0.17,1.97,pi);}
    for(let i=0;i<12;i++){box(0.13,0.08,0.08,i%3===0?gold:dark,-2.15+(i%6)*0.39,0.12,0.93+Math.floor(i/6)*0.28,pi);}
    clickable(pi,"pi");
    // White solderless breadboard with a central trench and recessed pin holes.
    const breadboard=new THREE.Group();breadboard.position.set(2.1,0.15,1.0);scene.add(breadboard);centers.breadboard=new THREE.Vector3(2.1,0.35,1.0);
    box(10.3,0.38,6.0,plastic,0,0,0,breadboard);box(10.1,0.055,5.82,mat(0xfafbf8),0,0.215,0,breadboard);
    box(10.03,0.025,0.22,mat(0xc7ceca),0,0.245,0,breadboard);
    const breadTexture=colorTexture(1800,1100,ctx=>{ctx.fillStyle="#f5f6f3";ctx.fillRect(0,0,1800,1100);ctx.strokeStyle="#e24442";ctx.lineWidth=3;for(const y of[60,965]){ctx.beginPath();ctx.moveTo(30,y);ctx.lineTo(1770,y);ctx.stroke();}ctx.strokeStyle="#3b80dc";for(const y of[130,1035]){ctx.beginPath();ctx.moveTo(30,y);ctx.lineTo(1770,y);ctx.stroke();}ctx.font="25px monospace";for(let i=0;i<30;i++){ctx.fillStyle="#7a837e";if(i%5===0)ctx.fillText(String(i+1),88+i*55,180);}ctx.font="bold 34px monospace";ctx.fillStyle="#d8423e";ctx.fillText("+",17,51);ctx.fillText("+",17,954);ctx.fillStyle="#2778da";ctx.fillText("−",17,121);ctx.fillText("−",17,1025);ctx.fillStyle="#929a94";ctx.font="20px monospace";["a","b","c","d","e","f","g","h","i","j"].forEach((letter,i)=>ctx.fillText(letter,25,250+(i<5?i*60:125+i*60)));});
    surface(10.04,5.76,breadTexture,0,0.249,0,breadboard);
    const holeGeometry=new THREE.BoxGeometry(0.063,0.014,0.063);geometries.push(holeGeometry);const holeMat=mat(0x68716e,{roughness:1});
    const holePositions:THREE.Vector3[]=[];
    for(let col=0;col<30;col++)for(const row of[-2.57,-2.24,-1.75,-1.43,-1.11,-0.79,-0.47,0.47,0.79,1.11,1.43,1.75,2.24,2.57])holePositions.push(new THREE.Vector3(-4.55+col*0.31,0.26,row));
    const holes=new THREE.InstancedMesh(holeGeometry,holeMat,holePositions.length);const transform=new THREE.Object3D();holePositions.forEach((p,i)=>{transform.position.copy(p);transform.updateMatrix();holes.setMatrixAt(i,transform.matrix);});breadboard.add(holes);clickable(breadboard,"breadboard");
    // ESP32 dev board sits over the breadboard centre channel.
    const esp=new THREE.Group();esp.position.set(-0.65,0.69,0.95);scene.add(esp);centers.esp=new THREE.Vector3(-0.65,1,0.95);
    box(2.05,0.12,3.55,mat(0x126d69),0,0,0,esp);surface(2.02,3.52,pcbTexture("ESP32","WROOM · RADIO BRIDGE","#0d6d68",5),0,0.063,0,esp);
    const espCan=box(1.42,0.18,1.7,metal,0,0.2,-0.48,esp);lettering("ESP32",1.12,0.31,0,0.297,-0.57,esp,"#3e464c");lettering("WROOM-32",1.05,0.2,0,0.298,-0.2,esp,"#59636b");
    box(1.4,0.08,0.47,dark,0,0.12,-1.48,esp);
    for(let i=0;i<6;i++){box(0.065,0.012,0.3,gold,-0.55+i*0.21,0.169,-1.48,esp);}
    box(0.72,0.14,0.65,dark,0,0.15,0.77,esp);lettering("CP2102",0.62,0.19,0,0.226,0.77,esp,"#7b8992");
    box(0.61,0.22,0.37,metal,0,0.14,1.7,esp);box(0.42,0.12,0.025,dark,0,0.14,1.895,esp);
    for(const x of[-0.9,0.9]){box(0.19,0.2,3.2,dark,x,0.08,0,esp);for(let i=0;i<15;i++){cyl(0.026,0.026,0.38,metal,x,-0.08,-1.45+i*0.205,esp);box(0.06,0.012,0.06,gold,x,0.19,-1.45+i*0.205,esp);}}
    for(const x of[-0.65,0.65]){box(0.24,0.14,0.26,metal,x,0.13,1.22,esp);box(0.12,0.1,0.13,dark,x,0.25,1.22,esp);}
    clickable(esp,"esp");
    // Separate SX127x module: blue PCB, black RF chip, oscillator and RF connector.
    const radio=new THREE.Group();radio.position.set(4.13,0.71,0.35);scene.add(radio);centers.radio=new THREE.Vector3(4.13,1.1,0.35);
    box(2.65,0.13,2.8,mat(0x1b6797),0,0,0,radio);surface(2.62,2.77,pcbTexture("SX127x","LoRa TRANSCEIVER","#196796",4),0,0.069,0,radio);
    box(0.98,0.16,0.98,dark,0.15,0.18,0,radio);lettering("SX127x",0.87,0.22,0.15,0.267,0,radio,"#a9b4ba");
    box(0.6,0.18,0.35,metal,0.3,0.17,-0.8,radio);lettering("32 MHz",0.5,0.14,0.3,0.267,-0.8,radio,"#5f6b72");
    for(let i=0;i<8;i++){box(0.23,0.11,0.24,dark,-1.13,0.13,-1.05+i*0.3,radio);cyl(0.035,0.035,0.2,gold,-1.13,0.28,-1.05+i*0.3,radio);}
    const connector=cyl(0.14,0.14,0.28,gold,0.9,0.2,-1.2,radio);connector.rotation.x=Math.PI/2;
    for(let i=0;i<7;i++){box(0.12,0.07,0.07,i%2?gold:dark,-0.63+i*0.22,0.12,0.85,radio);}
    clickable(radio,"radio");
    // Leads and connector ends are separate pick targets, including the illustrated pins.
    const wireObjects:Record<string,{curve:THREE.CatmullRomCurve3;material:THREE.MeshStandardMaterial;mesh:THREE.Mesh;dot:THREE.Mesh}>= {};
    WIRES.forEach((item,i)=>{
      const start=new THREE.Vector3(0.29,1.0,-0.55+i*0.28);const end=new THREE.Vector3(2.99,1.05,-0.7+i*0.3);
      const curve=new THREE.CatmullRomCurve3([start,new THREE.Vector3(0.65+i*0.08,2.45+i*0.13,-0.75+i*0.29),new THREE.Vector3(2.1+i*0.04,2.55+i*0.13,-0.9+i*0.33),end]);
      const material=mat(item.color,{roughness:0.3,metalness:0.02,emissive:item.color,emissiveIntensity:0.02});const tube=mesh(new THREE.TubeGeometry(curve,48,0.047,9,false),material);tube.userData.wire=item.id;pickables.push(tube);
      for(const point of[start,end]){const plug=box(0.13,0.3,0.13,dark,point.x,point.y-0.04,point.z);plug.userData.wire=item.id;pickables.push(plug);const pin=cyl(0.023,0.023,0.2,metal,point.x,point.y-0.27,point.z);pin.userData.wire=item.id;pickables.push(pin);}
      const dotMaterial=new THREE.MeshBasicMaterial({color:item.color});materials.push(dotMaterial);const dot=mesh(new THREE.SphereGeometry(0.07,8,8),dotMaterial);dot.visible=false;wireObjects[item.id]={curve,material,mesh:tube,dot};
    });
    const cable=(points:number[][],color:number,radius=0.075)=>{const curve=new THREE.CatmullRomCurve3(points.map(point=>new THREE.Vector3(point[0],point[1],point[2])));return mesh(new THREE.TubeGeometry(curve,48,radius,10,false),mat(color,{roughness:0.5}));};
    const serial=cable([[-2.9,0.8,-1.3],[-2.2,0.5,-1.2],[-2.0,0.3,3.5],[-0.65,0.35,3.7],[-0.65,0.83,2.84]],0x222830,0.1);serial.userData.part="esp";pickables.push(serial);
    // Visible LED circuit on the open breadboard area. This is an animation, not an electrical solver.
    const redLedMaterial=mat(0xeb262b,{roughness:0.22,transparent:true,opacity:0.93,emissive:0xff122c,emissiveIntensity:0});
    const redLed=new THREE.Group();redLed.position.set(4.75,0.42,2.8);scene.add(redLed);
    for(const x of[-0.12,0.12])cyl(0.019,0.019,0.44,metal,x,0.22,0,redLed);
    cyl(0.22,0.24,0.3,redLedMaterial,0,0.56,0,redLed);const dome=mesh(new THREE.SphereGeometry(0.22,20,12,0,Math.PI*2,0,Math.PI/2),redLedMaterial,0,0.71,0,redLed);dome.castShadow=false;cyl(0.25,0.25,0.06,redLedMaterial,0,0.43,0,redLed);
    const resistor=new THREE.Group();resistor.position.set(3.45,0.7,2.7);resistor.rotation.z=Math.PI/2;scene.add(resistor);cyl(0.115,0.115,0.65,mat(0xd6bb80),0,0,0,resistor);cyl(0.018,0.018,1.15,metal,0,0,0,resistor);for(const [offset,color] of [[-0.22,0x7b4b28],[-0.09,0x22252b],[0.08,0xce3930],[0.23,0xbe9b42]] as [number,number][])cyl(0.117,0.117,0.055,mat(color),0,offset,0,resistor);
    cable([[4.85,0.65,2.8],[5.2,1.15,2.95],[5.55,0.65,3.25]],0xf13c34,0.04);cable([[4.6,0.65,2.8],[4.6,1.1,3.3],[4.25,0.65,3.55]],0x222830,0.04);
    clickable(redLed,"radio");
    const greenLedMaterial=mat(0x51d96b,{roughness:0.2,emissive:0x29f85c,emissiveIntensity:0.8});
    const piLed=mesh(new THREE.SphereGeometry(0.065,12,10),greenLedMaterial,-7.85,0.63,-0.1);
    const espLed=mesh(new THREE.SphereGeometry(0.055,12,10),greenLedMaterial,-1.16,0.87,1.58);
    const txLight=new THREE.PointLight(0xff2640,0,2.2);txLight.position.set(4.75,1.4,2.8);scene.add(txLight);
    // RF coax, antenna and a battery reserve.
    const antenna=new THREE.Group();antenna.position.set(7.6,0.15,-3);scene.add(antenna);centers.antenna=new THREE.Vector3(7.6,1.8,-3);
    cyl(0.42,0.55,0.2,dark,0,0.12,0,antenna);cyl(0.12,0.12,0.4,gold,0,0.37,0,antenna);cyl(0.075,0.12,3.3,dark,0,2.1,0,antenna);cyl(0.09,0.075,0.25,dark,0,3.87,0,antenna);clickable(antenna,"antenna");
    cable([[5.0,1.0,-0.85],[6.2,0.48,-1.2],[7.5,0.2,-2.3],[7.6,0.4,-3]],0x24282b,0.048);
    const power=new THREE.Group();power.position.set(-5.4,0.35,4.15);scene.add(power);centers.power=new THREE.Vector3(-5.4,0.6,4.15);
    box(4.2,0.72,1.85,mat(0x28343e,{roughness:0.4}),0,0,0,power);box(0.06,0.63,1.66,mat(0x34434d),2.13,0,0,power);lettering("POWER RESERVE",2.8,0.36,-0.2,0.37,-0.3,power,"#e0e7e9");
    for(let i=0;i<4;i++)box(0.22,0.02,0.12,greenLedMaterial,-0.72+i*0.42,0.37,0.32,power);box(0.03,0.24,0.53,dark,2.17,0,0.3,power);clickable(power,"power");
    cable([[-7.1,0.65,3.9],[-8.2,0.25,3.5],[-8.7,0.25,1.4],[-7.9,0.6,0.35]],0x262b2e,0.085);
    const phone=new THREE.Group();phone.position.set(-9.1,0.4,0.8);phone.rotation.x=-0.15;phone.rotation.y=0.08;scene.add(phone);centers.phone=new THREE.Vector3(-9.1,0.7,0.8);
    box(1.55,0.2,3.1,dark,0,0,0,phone);box(1.39,0.025,2.85,mat(0xf5f3e8),0,0.117,0,phone);
    const phoneTexture=colorTexture(500,1000,ctx=>{ctx.fillStyle="#fbfaf3";ctx.fillRect(0,0,500,1000);ctx.fillStyle="#1e4b3c";ctx.font="bold 58px Arial";ctx.fillText("together",45,150);ctx.font="24px Arial";ctx.fillStyle="#718176";ctx.fillText("LOCAL COMMUNITY",45,205);ctx.fillStyle="#e66540";ctx.fillRect(35,300,430,170);ctx.fillStyle="#fff";ctx.font="bold 36px Arial";ctx.fillText("I need help",75,395);ctx.fillStyle="#e1ebdf";ctx.fillRect(35,520,430,150);ctx.fillStyle="#375c45";ctx.fillText("I’m safe",75,610);ctx.fillStyle="#b7c3b5";ctx.fillRect(40,755,380,10);ctx.fillRect(40,800,300,10);});surface(1.35,2.73,phoneTexture,0,0.135,0,phone);clickable(phone,"phone");
    // Small legible part labels sit on the mat, leaving the electronics unobscured.
    const benchLabel=(text:string,x:number,z:number,width:number)=>lettering(text,width,0.38,x,0.02,z,scene,"#53645c");
    benchLabel("RASPBERRY PI / LOCAL HUB",-5.7,-4.15,5.4);benchLabel("ESP32 + SX127x / RADIO BRIDGE",2.1,4.7,7.5);benchLabel("POWER RESERVE",-5.4,5.75,3.5);
    const selectionBox=new THREE.Box3Helper(new THREE.Box3(new THREE.Vector3(-1,-1,-1),new THREE.Vector3(1,1,1)),0xf29a37);selectionBox.visible=false;scene.add(selectionBox);
    materials.push(selectionBox.material as THREE.Material);geometries.push(selectionBox.geometry);
    const partGroups:Record<string,THREE.Object3D>={pi,esp,radio,breadboard,phone,power,antenna};
    const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let startX=0,startY=0;
    const onDown=(event:PointerEvent)=>{startX=event.clientX;startY=event.clientY;};
    const onUp=(event:PointerEvent)=>{if(Math.hypot(event.clientX-startX,event.clientY-startY)>7)return;const rect=renderer.domElement.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(pickables,false)[0]?.object;if(hit?.userData.wire){setWire(hit.userData.wire);setSelected("radio");}else if(hit?.userData.part){setSelected(hit.userData.part);setWire(null);}};
    renderer.domElement.addEventListener("pointerdown",onDown);renderer.domElement.addEventListener("pointerup",onUp);
    const resize=()=>{const width=mount.clientWidth,height=mount.clientHeight;if(!width||!height)return;renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();};const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(mount);resize();
    let visible=true;const intersection=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;},{rootMargin:"100px"});intersection.observe(mount);
    let frame=0,lastCommand=0,previousSelection="",txStart=0;const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;const began=performance.now();
    const animate=()=>{frame=requestAnimationFrame(animate);if(!visible||document.hidden)return;const now=performance.now(),time=(now-began)/1000,s=state.current;
      if(s.command.seq!==lastCommand){lastCommand=s.command.seq;if(s.command.type==="reset"){camera.position.copy(initialCamera);controls.target.copy(initialTarget);}else if(s.command.type==="focus"){const point=centers[s.selected]||centers.radio;const direction=camera.position.clone().sub(controls.target).normalize();controls.target.copy(point);camera.position.copy(point).addScaledVector(direction,s.selected==="breadboard"?16:10.5);}else{const direction=camera.position.clone().sub(controls.target);direction.multiplyScalar(s.command.type==="zoomIn"?0.8:1.25);direction.clampLength(8,43);camera.position.copy(controls.target).add(direction);}controls.update();}
      const selection=s.wire?`wire-${s.wire}`:s.selected;if(selection!==previousSelection){previousSelection=selection;if(s.wire){selectionBox.visible=false;}else if(partGroups[s.selected]){selectionBox.box.setFromObject(partGroups[s.selected]);selectionBox.box.expandByScalar(0.07);selectionBox.visible=true;}}
      controls.update();
      if(s.transmitting&&!txStart)txStart=now;if(!s.transmitting)txStart=0;const blink=s.powered&&s.transmitting&&(reduced||Math.sin((now-txStart)/120)>0);
      redLedMaterial.emissiveIntensity=blink?2.8:0;txLight.intensity=blink?0.65:0;greenLedMaterial.emissiveIntensity=s.powered?0.7:0;greenLedMaterial.color.set(s.powered?0x48d268:0x315537);
      Object.entries(wireObjects).forEach(([id,object])=>{const active=id===s.wire;object.material.emissiveIntensity=active?0.32:0.015;object.mesh.scale.setScalar(active?1.018:1);object.dot.visible=active||(s.transmitting&&s.powered&&id==="mosi");if(object.dot.visible)object.dot.position.copy(object.curve.getPoint(reduced?0.5:(time*0.55)%1));});
      piLed.visible=true;espLed.visible=true;renderer.render(scene,camera);
    };animate();
    return()=>{cancelAnimationFrame(frame);intersection.disconnect();resizeObserver.disconnect();renderer.domElement.removeEventListener("pointerdown",onDown);renderer.domElement.removeEventListener("pointerup",onUp);controls.dispose();geometries.forEach(item=>item.dispose());materials.forEach(item=>item.dispose());textures.forEach(item=>item.dispose());renderer.dispose();renderer.domElement.remove();};
  },[]);

  return <section className="hwbench" aria-label="Interactive Together IoT electronics workbench">
    <div className="hwbench-stage">
      <div className="hwbench-canvas" ref={host}/>
      {fallback&&<div className="hwbench-fallback"><Cpu size={46}/><strong>Explore the electronics below</strong><p>3D is unavailable on this device. Every component and connection has a selectable explanation.</p></div>}
      <div className="hwbench-badge"><span/>TOGETHER / HARDWARE LAB<span className="hwbench-concept">CONCEPT</span></div>
      <div className="hwbench-state"><span className={powered?"on":""}/>{powered?(transmitting?"Simulated TX pulse":"Concept power on"):"Concept power off"}</div>
      <div className="hwbench-view-controls" aria-label="3D camera controls"><button onClick={()=>cameraAction("zoomIn")} aria-label="Zoom in"><Plus size={17}/></button><button onClick={()=>cameraAction("zoomOut")} aria-label="Zoom out"><Minus size={17}/></button><button onClick={()=>cameraAction("focus")} aria-label="Focus selected component"><Focus size={17}/></button><button onClick={()=>cameraAction("reset")} aria-label="Reset camera"><RotateCcw size={16}/></button></div>
      <div className="hwbench-instruction"><Hand size={14}/><span>Drag to orbit <i/>Scroll to zoom <i/>Click to inspect</span></div>
      <div className="hwbench-experiment"><button className={powered?"hwbench-power active":"hwbench-power"} aria-pressed={powered} onClick={()=>{setPowered(!powered);setTransmitting(false);}}><Power size={15}/>{powered?"Power on":"Power off"}</button><button className="hwbench-sos" disabled={!powered||transmitting} onClick={pulse}><Send size={14}/>{transmitting?"Blinking TX LED…":"Send demo SOS"}</button></div>
    </div>
    <div className="hwbench-parts" data-scene-controls aria-label="Select a hardware component">{Object.entries(PARTS).map(([id,item])=><button key={id} aria-pressed={selected===id&&!wire} className={selected===id&&!wire?"selected":""} onClick={()=>selectPart(id)}>{id==="pi"||id==="esp"?<Cpu size={15}/>:id==="radio"||id==="antenna"?<Radio size={15}/>:id==="phone"?<Smartphone size={15}/>:id==="power"?<BatteryCharging size={15}/>:<Cable size={15}/>}<span>{item.label}</span></button>)}</div>
    <div className="hwbench-inspector" aria-live="polite"><div className="hwbench-component-copy"><span className="hwbench-kicker">{activeWire?"SELECTED CONNECTION":part.tag}</span><h3>{activeWire?`${activeWire.signal} jumper wire`:part.title}</h3><p>{activeWire?activeWire.description:part.body}</p><button onClick={()=>cameraAction("focus")} className="hwbench-focus"><Focus size={13}/>Focus {activeWire?"radio assembly":"component"}<ArrowUpRight size={13}/></button></div><div className="hwbench-inspector-metrics"><div><span>{activeWire?"Illustrative pin label":"Architecture"}</span><strong>{activeWire?`${activeWire.pin} → SX127x`:<><Wifi size={14}/>Pi local server → ESP32 → LoRa</>}</strong></div><div><span>{activeWire?"Signal role":"Current visualization"}</span><strong>{activeWire?activeWire.role:powered?(transmitting?"Controller / radio LED pulse":"Power indicator enabled"):"Power indicator disabled"}</strong></div><p><Info size={13}/>{activeWire?activeWire.voltage:"All power and radio activity is simulated."}</p></div></div>
    <div className="hwbench-wiring-title"><Cable size={14}/><span>Explore a connection</span><small>Illustrative ESP32 / SX127x pin mapping</small></div>
    <div className="hwbench-wires" aria-label="Select an illustrative jumper wire">{WIRES.map(item=><button key={item.id} aria-pressed={wire===item.id} className={wire===item.id?"selected":""} onClick={()=>{setWire(item.id);setSelected("radio");}}><span className="hwbench-wire-color" style={{background:item.color}}/><b>{item.signal}</b><small>{item.pin}</small>{wire===item.id&&<Check size={12}/>}</button>)}</div>
    <p className="hwbench-status" role="status">{hint}</p>
    <div className="hwbench-disclosure"><Info size={15}/><p><strong>Concept visualization, not a wiring guide.</strong> Board layouts and pin assignments are illustrative and must be checked against the exact device documentation. Voltages, power indicators and radio pulses are simulated; there is no electrical solver or physical hardware connection. This MVP uses cloud APIs for AI.</p></div>
  </section>;
}
