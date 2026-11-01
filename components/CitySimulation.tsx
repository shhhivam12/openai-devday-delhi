"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Home, Radio, Users, Wifi, MousePointer2, Move, Plus, Minus, Droplets, RotateCcw, Server, Send, Check, Bell, Cable } from "lucide-react";
import "./city-area.css";

const NODES = [
  { id: "node-0", name: "School hub", short: "School", x: -29, z: -14 },
  { id: "node-1", name: "Riverside hub", short: "Riverside", x: 29, z: -14 },
  { id: "node-2", name: "Health post", short: "Health post", x: -28, z: 17 },
  { id: "node-3", name: "Hill centre", short: "Hill centre", x: 29, z: 17 },
];
const SERVER = { id: "server", x: -20, z: -32 };
const coords = [
  [-17,-11,-.3],[-11,-12,.2],[-15,-6,-.2],[-8,-7,.3],[-20,-3,-.15],[-11,-2,.2],
  [10,-12,.2],[17,-10,-.3],[21,-5,.3],[9,-6,-.2],[16,-2,.25],[10,1,-.3],
  [-19,5,-.3],[-12,6,.3],[-17,11,.1],[-9,13,-.2],[-7,8,.3],[-22,11,-.1],
  [9,6,.2],[16,5,-.3],[21,10,.2],[13,11,-.25],[8,16,.1],[18,16,.3],
];
const surnames = ["Shrestha","Tamang","Gurung","Karki","Rai","Maharjan","Lama","Thapa","Joshi","Sherpa","Adhikari","Basnet","Poudel","KC","Limbu","Pandey","Pradhan","Magar","Khadka","Bhandari","Bista","Acharya","Tuladhar","Regmi"];
const firstNames = ["Maya","Nima","Sita","Arun","Pema","Rina","Tashi","Bina","Suman","Lhakpa","Anita","Milan","Saraswati","Bikash","Dipa","Raj","Sunita","Kiran","Gita","Manish","Sabina","Hari","Anil","Rupa"];
const homes = surnames.map((name,i)=>({ id:`home-${i}`, name:`${name} family`, contact:`${firstNames[i]} ${name}`, members:2+i%5, children:i%3, need:["Water","Check-in","Shelter","All safe","Supplies","Check-in"][i%6], x:coords[i][0],z:coords[i][1],rotation:coords[i][2],node:Math.floor(i/6) }));
const ALERTS = [
  { id:"preparedness", name:"Preparedness update", text:"Exercise update: the saved information pack has been refreshed. Ask your community coordinator for verified instructions." },
  { id:"community", name:"Community notice", text:"Exercise notice: a new community check-in bulletin is available at your nodal centre." },
  { id:"warning", name:"Exercise warning", text:"EXERCISE ONLY: a flood information bulletin is ready. Follow verified instructions from local authorities." },
];
type Phase = "idle"|"server"|"village"|"done"|"paused";
const riverX = (z:number)=>Math.sin(z*.13)*2.2+Math.sin(z*.28)*.65;

export default function CitySimulation(){
  const host=useRef<HTMLDivElement>(null);
  const [selected,setSelected]=useState("home-0"),[flood,setFlood]=useState(38),[active,setActive]=useState(true),[backhaul,setBackhaul]=useState(true),[fallback,setFallback]=useState(false);
  const [alertId,setAlertId]=useState("preparedness"),[phase,setPhase]=useState<Phase>("idle"),[saved,setSaved]=useState<(typeof ALERTS)[number]|null>(null);
  const [received,setReceived]=useState<(typeof ALERTS)[number]|null>(null),[published,setPublished]=useState<(typeof ALERTS)[number]|null>(null);
  const [deliveredNodes,setDeliveredNodes]=useState(0),[deliveredHomes,setDeliveredHomes]=useState(0);
  const timers=useRef<ReturnType<typeof setTimeout>[]>([]);
  const state=useRef({selected,flood,active,backhaul,phase,started:0,zoom:0,reset:false});
  Object.assign(state.current,{selected,flood,active,backhaul,phase});
  const family=homes.find(h=>h.id===selected),isServer=selected==="server",node=family?NODES[family.node]:NODES.find(n=>n.id===selected)||NODES[0];
  const nodeHomes=homes.filter(h=>NODES[h.node].id===node.id),sending=phase==="server"||phase==="village",inbox=isServer?published:family?received:saved;
  const stopBroadcast=()=>{timers.current.forEach(clearTimeout);timers.current=[];if(sending)setPhase("paused");};
  useEffect(()=>()=>timers.current.forEach(clearTimeout),[]);
  const sendAlert=()=>{
    if(!active||!backhaul||sending)return;
    host.current?.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"center"});
    timers.current.forEach(clearTimeout);state.current.started=performance.now();setPhase("server");
    const bulletin=ALERTS.find(a=>a.id===alertId)!;
    setPublished(bulletin);setDeliveredNodes(0);setDeliveredHomes(0);
    timers.current=[setTimeout(()=>{setSaved(bulletin);setDeliveredNodes(4);setPhase("village");},2400),setTimeout(()=>{setReceived(bulletin);setDeliveredHomes(24);setPhase("done");},5600)];
  };
  useEffect(()=>{
    if(!host.current)return;
    const mount=host.current;let renderer:THREE.WebGLRenderer;
    try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:"low-power"});}catch{setFallback(true);return;}
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setClearColor(0xf3f5f7);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute("role","img");renderer.domElement.setAttribute("aria-label","Forested Nepal-inspired village with small scattered cottages, wooded hills, terraced fields, winding river, four distant community nodes, and a government head server. Blue links show the conceptual head-server backhaul. Select a home or send a simulated bulletin to watch it reach nodes and households.");mount.appendChild(renderer.domElement);
    const scene=new THREE.Scene();scene.fog=new THREE.Fog(0xf3f5f7,260,400);
    const camera=new THREE.PerspectiveCamera(37,1,.1,320),initial=new THREE.Vector3(60,60,75);camera.position.copy(initial);
    const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,1,-4);controls.enableDamping=true;controls.enablePan=true;controls.screenSpacePanning=false;controls.minDistance=30;controls.maxDistance=225;controls.minPolarAngle=.2;controls.maxPolarAngle=Math.PI/2.3;controls.update();
    scene.add(new THREE.HemisphereLight(0xffffff,0x9a9e9f,1.5));
    const sun=new THREE.DirectionalLight(0xffffff,2.4);sun.position.set(-35,65,38);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-55,right:55,top:50,bottom:-50});sun.shadow.normalBias=.07;scene.add(sun);
    const geos:THREE.BufferGeometry[]=[],mats:THREE.Material[]=[],textures:THREE.Texture[]=[],pickables:THREE.Object3D[]=[];
    const material=(color:THREE.ColorRepresentation,extra:THREE.MeshStandardMaterialParameters={})=>{const m=new THREE.MeshStandardMaterial({color,roughness:.86,flatShading:true,...extra});mats.push(m);return m;};
    const basic=(color:number,opacity=1)=>{const m=new THREE.MeshBasicMaterial({color,transparent:opacity<1,opacity,side:THREE.DoubleSide});mats.push(m);return m;};
    const add=(geo:THREE.BufferGeometry,mat:THREE.Material,x=0,y=0,z=0,parent:THREE.Object3D=scene)=>{geos.push(geo);const mesh=new THREE.Mesh(geo,mat);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;};
    const box=(w:number,h:number,d:number,c:number,x:number,y:number,z:number,parent:THREE.Object3D=scene)=>add(new THREE.BoxGeometry(w,h,d),material(c),x,y,z,parent);
    const cyl=(r:number,rb:number,h:number,c:number,x:number,y:number,z:number,parent:THREE.Object3D=scene)=>add(new THREE.CylinderGeometry(r,rb,h,8),material(c),x,y,z,parent);
    const clickable=(o:THREE.Object3D,id:string)=>o.traverse(c=>{c.userData.key=id;if(c instanceof THREE.Mesh)pickables.push(c);});
    const label=(text:string,x:number,y:number,z:number,width=5.4)=>{
      const canvas=document.createElement("canvas");canvas.width=640;canvas.height=100;const ctx=canvas.getContext("2d")!;
      ctx.fillStyle="#ffffff";ctx.beginPath();ctx.roundRect(2,2,636,96,24);ctx.fill();ctx.strokeStyle="#c9d2dd";ctx.lineWidth=3;ctx.stroke();ctx.fillStyle="#13181f";ctx.font=text.length>16?"600 54px Arial":"600 68px Arial";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(text,320,52);
      const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;textures.push(texture);const mat=new THREE.SpriteMaterial({map:texture,depthTest:false});mats.push(mat);const sp=new THREE.Sprite(mat);sp.position.set(x,y,z);sp.scale.set(width,width/6.4,1);sp.renderOrder=12;scene.add(sp);
    };
    let seed=9831;const rand=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
    // One broad valley with a distant raised government campus; no geographic scale is implied.
    // Shape uses x/y; rotate into x/z, reversing its second coordinate.
    const groundShape=new THREE.Shape();groundShape.moveTo(-37,-24);groundShape.quadraticCurveTo(-40,-20,-37,19);groundShape.quadraticCurveTo(-35,26,-23,26);groundShape.lineTo(27,26);groundShape.quadraticCurveTo(39,24,38,15);groundShape.lineTo(38,-18);groundShape.quadraticCurveTo(35,-26,25,-26);groundShape.lineTo(-10,-26);groundShape.lineTo(-10,-35);groundShape.quadraticCurveTo(-12,-41,-22,-41);groundShape.lineTo(-29,-41);groundShape.quadraticCurveTo(-36,-39,-34,-30);groundShape.lineTo(-34,-24);groundShape.closePath();
    // Transform the shape coordinates so map positions match the model's z coordinates.
    const baseGeo=new THREE.ExtrudeGeometry(groundShape,{depth:1.1,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.35,bevelThickness:.2});baseGeo.rotateX(Math.PI/2);
    add(baseGeo,material(0xb8a88b),0,.27,0);
    const topGeo=new THREE.ShapeGeometry(groundShape,28);topGeo.rotateX(Math.PI/2);const ground=add(topGeo,material(0x83a865,{side:THREE.DoubleSide}),0,.27,0);ground.receiveShadow=true;
    const oval=(x:number,z:number,rx:number,rz:number,color:number,y=.3)=>{const o=add(new THREE.CircleGeometry(1,40),material(color),x,y,z);o.rotation.x=-Math.PI/2;o.scale.set(rx,rz,1);return o;};
    // Natural soil clearings and terraced fields keep the small homes legible within the forest.
    homes.forEach(h=>oval(h.x,h.z,2.05,1.75,0xb5b68d));
    const fields=[[-24,-7,4,2.3],[-6,-13,2.4,3.6],[23,1,3.2,2],[-20,18,3.7,2.2],[14,20,4,1.7],[7,-18,3.8,2.3]];
    fields.forEach(([x,z,rx,rz],i)=>{for(let r=0;r<3;r++)oval(x,z,rx-r*.45,rz-r*.27,[0xb3b26a,0x9dba70,0xc2ba7d][(i+r)%3],.31+r*.035);for(let row=0;row<4;row++)box(rx*1.1,.035,.055,0x7e9860,x,.46,z-rz*.5+row*rz*.33);});
    const hillLocations=[[-30,-20,7,4,4],[-18,-21,7,3,3.7],[11,-22,10,3.8,4],[31,3,5,3,6],[-33,3,4,3.2,8],[-5,22,8,2.6,4],[30,22,7,3.8,4]];
    const hillHeight=(x:number,z:number)=>hillLocations.reduce((max,[hx,hz,rx,h,rz])=>{const d=((x-hx)/rx)**2+((z-hz)/rz)**2;return Math.max(max,d<1?Math.sqrt(1-d)*h:0);},0);
    hillLocations.forEach(([x,z,rx,h,rz],i)=>{const mound=add(new THREE.SphereGeometry(1,16,9),material([0x658e55,0x789c5a,0x6b9255][i%3]),x,.25,z);mound.scale.set(rx,h,rz);});
    const ribbon=(points:THREE.Vector3[],width:number,color:number,y:number)=>{
      const curve=new THREE.CatmullRomCurve3(points),positions:number[]=[],indices:number[]=[];
      for(let i=0;i<=100;i++){const p=curve.getPoint(i/100),t=curve.getTangent(i/100);positions.push(p.x-t.z*width/2,y,p.z+t.x*width/2,p.x+t.z*width/2,y,p.z-t.x*width/2);if(i<100){const k=i*2;indices.push(k,k+2,k+1,k+1,k+2,k+3);}}
      const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();const road=add(g,material(color,{side:THREE.DoubleSide}));return{curve,road};
    };
    const lanePaths=[
      [[-31,-14],[-25,-12],[-20,-8],[-15,-6],[-10,-3],[-9,4],[-14,9],[-21,13],[-28,17]],
      [[29,-14],[23,-11],[17,-7],[12,-3],[12,4],[17,9],[22,14],[29,17]],
      [[-29,17],[-22,19],[-10,19],[-2,19],[10,20],[22,20],[29,17]],
      [[-29,-14],[-24,-18],[-12,-18],[0,-18],[15,-18],[29,-14]],
      [[-16,7],[-8,3],[0,2],[9,2],[18,5]],
    ];
    const curves=lanePaths.map((pts,i)=>ribbon(pts.map(([x,z])=>new THREE.Vector3(x,0,z)),i===2?1.2:.9,i===2?0xb9ad91:0xc9ba98,.35).curve);
    homes.forEach(h=>{const lane=curves[h.node<2?h.node:h.node-2];let nearest=lane.getPoint(0);lane.getPoints(70).forEach(p=>{if(p.distanceToSquared(new THREE.Vector3(h.x,0,h.z))<nearest.distanceToSquared(new THREE.Vector3(h.x,0,h.z)))nearest=p;});ribbon([new THREE.Vector3(h.x,0,h.z+1.2),new THREE.Vector3((h.x+nearest.x)/2,0,(h.z+nearest.z)/2),nearest],.36,0xcbb997,.36);});
    // Water follows a winding channel. Widening is a demonstration, not flood physics.
    const waterPositions=new Float32Array(101*6),waterIndices:number[]=[];for(let i=0;i<100;i++){let k=i*2;waterIndices.push(k,k+2,k+1,k+1,k+2,k+3);}
    const waterGeo=new THREE.BufferGeometry();waterGeo.setAttribute("position",new THREE.BufferAttribute(waterPositions,3));waterGeo.setIndex(waterIndices);const water=add(waterGeo,material(0x238bb5,{roughness:.25,metalness:.08,transparent:true,opacity:.88,side:THREE.DoubleSide}));water.castShadow=false;water.renderOrder=2;
    for(const side of[-1,1])ribbon(Array.from({length:25},(_,i)=>{const z=-25+i*50/24;return new THREE.Vector3(riverX(z)+side*1.9,0,z);}),.6,0xa5a58b,.34);
    for(const z of[2,19]){const x=riverX(z);box(7.1,.17,1.15,0xb8a486,x,.95,z);for(const zz of[z-.57,z+.57]){box(7.1,.055,.055,0x6e6557,x,1.62,zz);for(let i=-3.4;i<3.5;i+=.65)cyl(.025,.025,.7,0x777166,x+i,1.28,zz);}for(const xx of[-2.3,2.3])box(.3,.8,.8,0x92918b,x+xx,.51,z);}
    const roofColors=[0xa6523c,0x384e63,0x72524b,0x536778,0x9b6f4e,0x59645b],wallColors=[0xe6d5b9,0xe0d9c7,0xc7b59c,0xdfbda7,0xd6d2bd];
    const gable=(w:number,d:number,h:number,mat:THREE.Material,y:number,parent:THREE.Object3D)=>{
      const shape=new THREE.Shape();shape.moveTo(-w/2,0);shape.lineTo(0,h);shape.lineTo(w/2,0);shape.closePath();const g=new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:false});return add(g,mat,0,y,-d/2,parent);
    };
    const rings:Record<string,THREE.Mesh>={},glows:Record<string,THREE.MeshStandardMaterial[]>={};
    homes.forEach((h,i)=>{
      const group=new THREE.Group();group.position.set(h.x,.32,h.z);group.rotation.y=h.rotation;scene.add(group);
      const width=1.45+(i%3)*.17,depth=1.55+(i%2)*.2,height=i%5===0?1.4:1.03;
      box(width+.28,.16,depth+.27,0xa99f8a,0,.08,0,group);
      const bodyMat=material(wallColors[i%5],{emissive:0x4acaff,emissiveIntensity:0}),roofMat=material(roofColors[i%6],{emissive:0x4acaff,emissiveIntensity:0});glows[h.id]=[bodyMat,roofMat];
      add(new THREE.BoxGeometry(width,height,depth),bodyMat,0,.19+height/2,0,group);gable(width+.3,depth+.32,.65,roofMat,height+.2,group);
      box(width+.25,.06,depth+.3,0x715b48,0,height+.2,0,group);
      for(const x of[-width*.28,width*.28]){box(.34,.4,.055,0xece3cf,x,height*.57,depth/2+.035,group);box(.23,.28,.064,0x365a64,x,height*.57,depth/2+.065,group);box(.026,.28,.074,0xd7c9a6,x,height*.57,depth/2+.09,group);}
      box(.35,.69,.065,0x654b38,0,.52,depth/2+.04,group);box(.44,.08,.32,0xa8997f,0,.2,depth/2+.15,group);
      if(i%3===0){box(.21,.52,.25,0x8b8275,width*.29,height+.6,-depth*.2,group);box(.31,.07,.34,0x5a5754,width*.29,height+.89,-depth*.2,group);}
      if(i%4===1){const panel=box(.6,.04,.6,0x233d5b,-width*.27,height+.45,.05,group);panel.rotation.z=.45;}
      // Courtyard fence and a small wood store feel domestic, not urban.
      for(let p=0;p<5;p++)box(.055,.42,.06,0x9a7d54,-1.2+p*.6,.42,-1.38,group);box(2.45,.055,.055,0xac9067,0,.52,-1.38,group);
      if(i%2===0){box(.62,.42,.65,0xb19c77,1.28,.35,-.65,group);const shedRoof=gable(.76,.8,.3,material(0x72634e),.58,group);shedRoof.position.x=1.28;shedRoof.position.z=-1.05;for(let j=0;j<3;j++)cyl(.075,.075,.48,0x705c43,1.28,.65,-.8+j*.17,group);}
      clickable(group,h.id);
      const ring=add(new THREE.RingGeometry(1.3,1.43,40),basic(0x49c9fa,0),h.x,.43,h.z);ring.rotation.x=-Math.PI/2;rings[h.id]=ring;
      // Two small people beside every fourth cottage, fictional and decorative.
      if(i%4===0)for(let person=0;person<2;person++){const x=h.x+1.1+person*.3,z=h.z+1.3;cyl(.07,.09,.27,person?0xad4848:0x285e90,x,.57,z);add(new THREE.SphereGeometry(.1,7,6),material(0xba8b63),x,.82,z);}
    });
    // A modest village temple and bell courtyard sit among homes.
    const temple=new THREE.Group();temple.position.set(-5.8,.3,-1);scene.add(temple);box(2.4,.12,2.4,0xc9b994,0,.09,0,temple);box(1.4,.9,1.4,0xc49975,0,.59,0,temple);for(let i=0;i<2;i++){const r=add(new THREE.ConeGeometry(1.3-i*.35,.62,4),material(0x86493d),0,1.3+i*.6,0,temple);r.rotation.y=Math.PI/4;}cyl(.035,.07,.4,0xb89b59,-5.8,2.4,-1);
    // Hundreds of mixed trees use just five instanced draw calls.
    const treePoints:{x:number;z:number;size:number;y:number;pine:boolean}[]=[];
    let attempts=0;
    while(treePoints.length<620&&attempts++<9000){const x=-35+rand()*70,z=-23+rand()*46;if(Math.abs(x-riverX(z))<3.5)continue;if(homes.some(h=>Math.hypot(x-h.x,z-h.z)<2.5)||NODES.some(n=>Math.hypot(x-n.x,z-n.z)<3.8))continue;if(fields.some(([fx,fz,rx,rz])=>((x-fx)/rx)**2+((z-fz)/rz)**2<1.2))continue;if(curves.some(c=>c.getPoints(22).some(p=>Math.hypot(x-p.x,z-p.z)<.95)))continue;if(Math.hypot(x+5.8,z+1)<2)continue;treePoints.push({x,z,size:.9+rand()*1.0,y:.3+hillHeight(x,z),pine:rand()>.38});}
    const treeGeo=new THREE.CylinderGeometry(.07,.12,.9,6),pineGeo=new THREE.ConeGeometry(.75,2.2,7),leafGeo=new THREE.IcosahedronGeometry(.8,0);geos.push(treeGeo,pineGeo,leafGeo);
    const trunks=new THREE.InstancedMesh(treeGeo,material(0x725b3e),treePoints.length);scene.add(trunks);trunks.castShadow=true;
    const m=new THREE.Matrix4(),q=new THREE.Quaternion(),s=new THREE.Vector3();
    treePoints.forEach((p,i)=>{m.compose(new THREE.Vector3(p.x,p.y+p.size*.45,p.z),q,s.set(1,p.size,1));trunks.setMatrixAt(i,m);});
    for(let kind=0;kind<4;kind++){const points=treePoints.filter((p,i)=>(p.pine?i%2:i%2+2)===kind);const inst=new THREE.InstancedMesh(kind<2?pineGeo:leafGeo,material([0x215c3f,0x397646,0x4d8747,0x67974d][kind]),points.length);scene.add(inst);inst.castShadow=true;inst.receiveShadow=true;points.forEach((p,i)=>{m.compose(new THREE.Vector3(p.x,p.y+p.size*(kind<2?1.5:1.4),p.z),q,s.set(p.size,p.size*(kind<2?1:1.1),p.size));inst.setMatrixAt(i,m);});}
    // Rocks, orchard trees, and river stones provide detail without urban density.
    const rockGeo=new THREE.IcosahedronGeometry(1,0);geos.push(rockGeo);const rocks=new THREE.InstancedMesh(rockGeo,material(0x99988b),65);scene.add(rocks);for(let i=0;i<65;i++){const z=-23+rand()*46,x=riverX(z)+(i%2?1:-1)*(2.2+rand()*1.1);m.compose(new THREE.Vector3(x,.47,z),q,s.set(.14+rand()*.27,.12+rand()*.18,.17+rand()*.3));rocks.setMatrixAt(i,m);}
    const nodeLeds:THREE.Mesh[]=[],nodeRings:THREE.Mesh[]=[];
    NODES.forEach((n,i)=>{
      oval(n.x,n.z,3.8,3.3,0xc7c4af,.31);const group=new THREE.Group();group.position.set(n.x,.32,n.z);scene.add(group);
      box(3.3,.15,3,0xbab8af,0,.09,0,group);box(2.65,1.6,2.4,0xe9e8dc,0,.95,0,group);gable(3.05,2.75,.55,material(0x34566e),1.77,group);
      box(.6,1,.08,0x405b68,0,.84,1.24,group);for(const x of[-.8,.8])box(.55,.45,.08,0x77a8b9,x,1.1,1.24,group);
      box(1.7,.25,.09,0x006aff,0,1.55,1.29,group);for(let j=0;j<3;j++)box(.5,.04,.7,0x294456,-.7+j*.6,2.03,-.15,group);
      cyl(.055,.08,4.2,0x777f81,1.8,2.3,-.8,group);box(.5,.08,.08,0xb3babc,1.8,4.35,-.8,group);box(.08,.08,.5,0xb3babc,1.8,4.35,-.8,group);
      const led=add(new THREE.SphereGeometry(.14,9,8),material(0x44bdec,{emissive:0x39b5e7,emissiveIntensity:1.5}),1.8,4.6,-.8,group);nodeLeds.push(led);
      box(.65,.8,.55,0x53636a,-2,.7,.4,group);box(.4,.18,.28,0x2c3e44,-2,1.2,.4,group);clickable(group,n.id);
      const ring=add(new THREE.RingGeometry(3.3,3.4,56),basic(0x27a7d2,.5),n.x,.4,n.z);ring.rotation.x=-Math.PI/2;nodeRings.push(ring);label(n.short,n.x,6.1,n.z,10);
    });
    // Government head server is visually separate from the remote village.
    oval(SERVER.x,SERVER.z,9,6.4,0xb9c0c0,.32);const campus=new THREE.Group();campus.position.set(SERVER.x,.35,SERVER.z);scene.add(campus);
    box(9,.2,6,0xd9dfe2,0,.1,0,campus);box(5.8,2.6,3.4,0xe7e8e7,-.9,1.5,0,campus);box(6.2,.2,3.8,0x35495c,-.9,2.9,0,campus);box(2.5,.7,3.5,0xd6dce0,3.2,.55,0,campus);
    // Exposed server racks on the glazed front make the head-server role readable.
    for(let rack=0;rack<3;rack++){box(.93,1.9,.65,0x263440,-2.6+rack*1.15,1.38,1.8,campus);for(let unit=0;unit<5;unit++){box(.8,.22,.07,0x51616d,-2.6+rack*1.15,.65+unit*.3,2.16,campus);box(.065,.045,.025,unit%2?0x48b7dd:0x82b9aa,-2.32+rack*1.15,.66+unit*.3,2.205,campus);}}
    const door=box(1,1.9,.08,0x456471,1.1,1.3,1.75,campus);door.material=material(0x456471,{transparent:true,opacity:.7});cyl(.07,.1,5,0x78808a,3.2,3.1,-1.2,campus);const dish=add(new THREE.SphereGeometry(.65,14,8,0,Math.PI*2,0,Math.PI*.48),material(0xe3e9ec,{side:THREE.DoubleSide}),3.2,4.7,-1.2,campus);dish.rotation.z=.6;
    const serverBeacon=add(new THREE.SphereGeometry(.22,10,8),material(0x006aff,{emissive:0x006aff,emissiveIntensity:1.7}),3.2,5.8,-1.2,campus);clickable(campus,SERVER.id);label("Government head server",SERVER.x,7.9,SERVER.z,15);
    // Backbone is a conceptual internet/backhaul link, separate from local radio access.
    const makePath=(a:THREE.Vector3,b:THREE.Vector3,height:number,color:number,radius=.055)=>{
      const curve=new THREE.QuadraticBezierCurve3(a,new THREE.Vector3((a.x+b.x)/2,height,(a.z+b.z)/2),b);
      const line=add(new THREE.TubeGeometry(curve,44,radius,5,false),basic(color,.64));line.castShadow=false;
      const dots=Array.from({length:3},()=>{const dot=add(new THREE.SphereGeometry(.19,8,7),basic(color));dot.castShadow=false;return dot;});return{curve,line,dots};
    };
    const backbone=NODES.map(n=>makePath(new THREE.Vector3(SERVER.x,4.2,SERVER.z),new THREE.Vector3(n.x,4.8,n.z),14,0x3377d8,.085));
    const homePaths=homes.map(h=>{const n=NODES[h.node];return{home:h,...makePath(new THREE.Vector3(n.x,4.5,n.z),new THREE.Vector3(h.x,1.6,h.z),7.7,0x14a6cc,.045)};});
    const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let dragging=false,lastX=0,lastY=0;
    const pick=(e:PointerEvent)=>{const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(pointer,camera);const id=ray.intersectObjects(pickables,false)[0]?.object.userData.key;renderer.domElement.style.cursor=id?"pointer":"grab";if(id&&!dragging)setSelected(id);};
    const down=(e:PointerEvent)=>{dragging=false;lastX=e.clientX;lastY=e.clientY;};const move=(e:PointerEvent)=>{if(e.buttons&&Math.abs(e.clientX-lastX)+Math.abs(e.clientY-lastY)>3)dragging=true;lastX=e.clientX;lastY=e.clientY;if(!e.buttons)pick(e);};const up=(e:PointerEvent)=>{if(!dragging)pick(e);dragging=false;};
    renderer.domElement.addEventListener("pointerdown",down);renderer.domElement.addEventListener("pointermove",move);renderer.domElement.addEventListener("pointerup",up);
    let previousWidth=0;const resize=()=>{const w=mount.clientWidth,h=mount.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();if(!previousWidth){if(w<650){camera.position.copy(initial).multiplyScalar(1.7);}controls.update();}previousWidth=w;};const ro=new ResizeObserver(resize);ro.observe(mount);resize();
    let visible=true;const io=new IntersectionObserver(([e])=>visible=e.isIntersecting,{rootMargin:"150px"});io.observe(mount);
    let frame=0;const start=performance.now(),reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animate=()=>{frame=requestAnimationFrame(animate);if(!visible||document.hidden)return;const t=(performance.now()-start)/1000,st=state.current,pulse=reduced?1:.7+.3*Math.sin(t*3);controls.update();
      const width=3.2+st.flood*.045,y=.42+st.flood*.007;const pos=waterGeo.attributes.position as THREE.BufferAttribute;for(let i=0;i<=100;i++){const z=-25+i*.5,c=riverX(z),variation=1+.08*Math.sin(z*.3);pos.setXYZ(i*2,c-width*.5*variation,y,z);pos.setXYZ(i*2+1,c+width*.5*variation,y,z);}pos.needsUpdate=true;waterGeo.computeVertexNormals();
      homePaths.forEach(p=>{const chosen=st.selected===p.home.id||st.selected===NODES[p.home.node].id,alert=st.phase==="village";p.line.visible=st.active&&(chosen||alert);(p.line.material as THREE.MeshBasicMaterial).opacity=alert?.78:.8;p.dots.forEach((dot,j)=>{dot.visible=p.line.visible;dot.position.copy(p.curve.getPoint(reduced?.55:(t*.13+j/3)%1));});});
      backbone.forEach((p,i)=>{p.line.visible=st.backhaul;(p.line.material as THREE.MeshBasicMaterial).opacity=st.phase==="server"?.95:.65;p.dots.forEach((dot,j)=>{dot.visible=st.active&&st.backhaul;dot.scale.setScalar(st.phase==="server"?1.5:1);dot.position.copy(p.curve.getPoint(reduced?.5:(t*.1+j/3+i*.1)%1));});});
      homes.forEach(h=>{const chosen=st.selected===h.id;glows[h.id].forEach(mat=>mat.emissiveIntensity=chosen?.3+pulse*.25:st.phase==="village"?.1:0);rings[h.id].position.y=y+.025;(rings[h.id].material as THREE.MeshBasicMaterial).opacity=chosen?.75:st.phase==="village"?.45:0;rings[h.id].scale.setScalar(chosen?1+pulse*.1:1);});
      nodeLeds.forEach(led=>(led.material as THREE.MeshStandardMaterial).emissiveIntensity=st.active?(st.phase==="village"?2.5:1.3):.04);nodeRings.forEach(r=>{r.visible=st.active;r.position.y=y+.02;(r.material as THREE.MeshBasicMaterial).opacity=.3+pulse*.18;});(serverBeacon.material as THREE.MeshStandardMaterial).emissiveIntensity=st.backhaul?1+pulse:0;
      if(st.zoom){camera.position.sub(controls.target).multiplyScalar(st.zoom>0?.87:1.13).add(controls.target);st.zoom=0;}if(st.reset){camera.position.copy(initial);if(mount.clientWidth<650)camera.position.multiplyScalar(1.7);controls.target.set(0,1,-4);controls.update();st.reset=false;}renderer.render(scene,camera);
    };animate();
    return()=>{cancelAnimationFrame(frame);io.disconnect();ro.disconnect();renderer.domElement.removeEventListener("pointerdown",down);renderer.domElement.removeEventListener("pointermove",move);renderer.domElement.removeEventListener("pointerup",up);controls.dispose();scene.traverse(o=>{if(o instanceof THREE.InstancedMesh)o.dispose();});geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());renderer.dispose();renderer.domElement.remove();};
  },[]);
  return <section className="tg-city-area" aria-label="Interactive forest village and government alert network">
    <div className="tg-city-area-stage">
      <div className="tg-city-area-canvas" ref={host}/>
      {fallback&&<div className="tg-area-fallback"><Home size={42}/><p>Select a family or government server below to explore the network.</p></div>}
      <div className="tg-area-badge"><span/>NEPAL · FOREST VILLAGE</div>
      <div className="tg-area-legend"><span><Home size={14}/>24 homes</span><span><Radio size={14}/>4 distant hubs</span><span><Server size={14}/>1 head server</span></div>
      <div className="tg-area-link-key"><span/>Head server → nodal centres<span/>Local community link</div>
      <div className="tg-area-camera">
        <button aria-label="Zoom in on city" onClick={()=>state.current.zoom=1}><Plus size={17}/></button>
        <button aria-label="Zoom out from city" onClick={()=>state.current.zoom=-1}><Minus size={17}/></button>
        <button aria-label="Reset city view" onClick={()=>state.current.reset=true}><RotateCcw size={17}/></button>
      </div>
      <div className="tg-area-hint"><MousePointer2 size={13}/>Hover or tap<span>·</span><Move size={13}/>Drag to explore</div>
    </div>
    <div className="tg-village-panels">
      <aside className="tg-area-family" aria-live="polite">
        <div className="tg-area-family-header"><div className="tg-area-avatar">{isServer?<Server size={23}/>:family?<Users size={23}/>:<Radio size={23}/>}</div><div><span className="tg-area-kicker">{isServer?"GOVERNMENT DESK · CONCEPT":family?`HOME ${String(homes.indexOf(family)+1).padStart(2,"0")}`:"COMMUNITY HUB"}</span><h3>{isServer?"Head server":family?family.name:node.name}</h3></div></div>
        <p>{isServer?"A coordinator approves an information bulletin, then publishes it to connected nodal centres.":family?family.contact:`${nodeHomes.length} homes · ${nodeHomes.reduce((n,h)=>n+h.members,0)} residents`}</p>
        {family&&<div className="tg-area-facts"><span><Users size={14}/>{family.members} people</span><span>{family.children} children</span><span className="tg-area-need"><span/>{family.need}</span></div>}
        <div className="tg-area-connected">{isServer?<Cable size={15}/>:<Wifi size={15}/>}<span>{isServer?(backhaul?"Backhaul available · four nodal centres":"Backhaul paused · hubs retain saved information"):active?`Community link to ${node.short}`:"Local node links paused"}</span></div>
        {inbox&&<div className="tg-village-inbox"><Bell size={14}/><div><strong>{isServer?"Last published demo bulletin":"Saved community bulletin"}</strong><p>{inbox.text}</p></div></div>}
        <small>{isServer?"Simulated government publishing · no official feed":family?"Fictional household · distance is illustrative":"Phones use nearby Wi-Fi or a radio bridge; ordinary phones do not transmit LoRa."}</small>
      </aside>
      <div className="tg-village-broadcast">
        <div className="tg-village-broadcast-heading"><div><span className="tg-area-kicker">HEAD SERVER → NODES → COMMUNITY</span><h3><Bell size={18}/>Push an information bulletin</h3></div><span className="tg-village-demo">SIMULATED</span></div>
        <div className="tg-village-broadcast-actions"><select aria-label="Choose demo bulletin" value={alertId} disabled={sending} onChange={e=>setAlertId(e.target.value)}>{ALERTS.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select><button onClick={sendAlert} disabled={!backhaul||!active||sending}><Send size={16}/>{sending?"Sending…":"Send demo alert"}</button></div>
        <div className="tg-village-progress" role="status" aria-live="polite"><span className={phase!=="idle"&&phase!=="paused"?"reached":""}><Server size={14}/>Head server</span><i/><span className={deliveredNodes===4?"reached":""}><Radio size={14}/>{deliveredNodes}/4 nodes</span><i/><span className={deliveredHomes===24?"reached":""}><Home size={14}/>{deliveredHomes}/24 homes</span></div>
        <p className="tg-village-status">{!backhaul?"Head-server link paused. Saved information stays at the nodal centres.":!active?"Activate the nodal centres to demonstrate local delivery.":phase==="server"?"Publishing the bulletin to the four nodal centres…":phase==="village"?"Saved at all four nodes. Sharing the bulletin with the village…":phase==="done"?"Demonstration complete. All 24 homes received the bulletin.":phase==="paused"?"Demonstration paused. The last saved bulletin remains available.":"Send a sample bulletin and follow the moving lights through the valley."}</p>
        {saved&&<div className="tg-village-saved"><Check size={16}/><div><strong>Saved at nodes · {saved.name}</strong><p>{saved.text}</p></div></div>}
      </div>
    </div>
    <div className="tg-area-controls">
      <label><Droplets size={17}/><span>Flood level</span><input aria-label="City flood water level" type="range" min="0" max="100" value={flood} onChange={e=>setFlood(Number(e.target.value))}/><b>{flood<30?"River":flood<65?"Rising":"Flooded"}</b></label>
      <button className={"tg-area-network "+(active?"active":"")} aria-pressed={active} onClick={()=>{stopBroadcast();setActive(!active);}}><Radio size={15}/>{active?"Nodes active":"Activate nodes"}</button>
      <button className={"tg-area-network "+(backhaul?"active":"")} aria-pressed={backhaul} onClick={()=>{stopBroadcast();setBackhaul(!backhaul);}}><Cable size={15}/>{backhaul?"Head-server link on":"Head-server link off"}</button>
      <select aria-label="Select a home or node" value={selected} onChange={e=>setSelected(e.target.value)}><option value="server">Government head server</option><optgroup label="Community hubs">{NODES.map(n=><option key={n.id} value={n.id}>{n.name}</option>)}</optgroup><optgroup label="Homes">{homes.map((h,i)=><option key={h.id} value={h.id}>Home {i+1} · {h.name}</option>)}</optgroup></select>
    </div>
    <p className="tg-area-caption">Original Nepal-inspired village. Homes, distances, floodwater and alert delivery are illustrative. Head-server publishing needs available backhaul; saved bulletins remain at nodes. Bulletins stay in this scene until you leave or reload. No official alerts or real radio transmission.</p>
  </section>;
}
