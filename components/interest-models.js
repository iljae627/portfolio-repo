import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {brushedMetal,phoneDisplay,batteryMark} from './studio-surfaces.js';
import {forensicLayout,androidLayout,fuzzingCandidateLayout} from '../lib/scene-motion.mjs';

const metal = brushedMetal;
const ceramic = color => new T.MeshPhysicalMaterial({color, roughness: .22, metalness: .13, clearcoat: .65, clearcoatRoughness:.15});
const glass = (color=0xf2f8ff,thickness=.12) => new T.MeshPhysicalMaterial({color,metalness:0,roughness:.035,transmission:1,ior:1.46,thickness,opacity:1,transparent:false,clearcoat:1,clearcoatRoughness:.035,attenuationColor:0xb9d8ed,attenuationDistance:6,envMapIntensity:1.3});
const jewel = color => new T.MeshPhysicalMaterial({color,metalness:.42,roughness:.09,clearcoat:1,clearcoatRoughness:.035,ior:1.65});
function mesh(parent, geometry, material, position = [0,0,0]) {
  const item = new T.Mesh(geometry, material);
  item.position.set(...position); item.castShadow = true; item.receiveShadow = true;
  parent.add(item); return item;
}
function roundedShape(w,h,r=.15,Path=T.Shape) {
  const s = new Path(), x = -w/2, y = -h/2;
  s.moveTo(x+r,y); s.lineTo(x+w-r,y); s.quadraticCurveTo(x+w,y,x+w,y+r);
  s.lineTo(x+w,y+h-r); s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  s.lineTo(x+r,y+h); s.quadraticCurveTo(x,y+h,x,y+h-r);
  s.lineTo(x,y+r); s.quadraticCurveTo(x,y,x+r,y);
  return s;
}
function panelGeometry(w,h,d,r=.15) {
  const s=roundedShape(w,h,r);
  const g = new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSegments:5,steps:1,bevelSize:.022,bevelThickness:Math.min(.014,d*.35),curveSegments:20});
  g.translate(0,0,-d/2); return g;
}
const panel = (parent,w,h,d,material,position,r) => mesh(parent,panelGeometry(w,h,d,r),material,position);
const box = (parent,w,h,d,material,position) => mesh(parent,new T.BoxGeometry(w,h,d),material,position);
function rod(parent,from,to,r,material) {
  const a = new T.Vector3(...from), b = new T.Vector3(...to), delta = b.clone().sub(a);
  const m = mesh(parent,new T.CylinderGeometry(r,r,delta.length(),32),material,a.clone().add(b).multiplyScalar(.5).toArray());
  m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize()); return m;
}
function trace(parent,points,color=0xd6b873) {
  const geometry = new T.BufferGeometry().setFromPoints(points.map(p=>new T.Vector3(...p)));
  const line = new T.Line(geometry,new T.LineBasicMaterial({color,transparent:true,opacity:.65}));
  parent.add(line); return line;
}
// Bevels catch the studio light on every axis instead of flat box silhouettes.
function bevel(parent,w,h,d,material,position=[0,0,0],radius=.05){
  return mesh(parent,new RoundedBoxGeometry(w,h,d,4,Math.min(radius,w*.22,h*.22,d*.22)),material,position);
}
function fastener(parent,position,axis='z',radius=.042){
  const group=new T.Group();parent.add(group);group.position.set(...position);
  const chrome=new T.MeshPhysicalMaterial({color:0xdbe1e8,metalness:1,roughness:.14});
  const head=mesh(group,new T.CylinderGeometry(radius,radius,.022,32),chrome);head.rotation.x=Math.PI/2;
  const socket=mesh(group,new T.CylinderGeometry(radius*.48,radius*.48,.005,6),ceramic(0x263039),[0,0,.014]);socket.rotation.x=Math.PI/2;
  if(axis==='x')group.rotation.y=Math.PI/2;
  return group;
}
function glassCase(parent,w,h,d,{top=true,bottom=true}={}){
  const shell=new T.Group();parent.add(shell);
  const material=glass(0xf5faff,.10),edge=glass(0xb9d8ef,.35),t=.10;
  edge.transmission=.82;edge.metalness=.12;edge.attenuationDistance=1.6;
  // Actual hollow walls leave the contents in air, rather than inside one solid block.
  for(const z of [-d/2,d/2])bevel(shell,w,h,t,material,[0,0,z],.035).castShadow=false;
  for(const x of [-w/2,w/2])bevel(shell,t,h,d,material,[x,0,0],.035).castShadow=false;
  for(const y of [-h/2,h/2])if(y<0?bottom:top)bevel(shell,w,t,d,edge,[0,y,0],.035).castShadow=false;
  // Thick polished edges create a distinct optical rim.
  for(const x of [-w/2,w/2])for(const z of [-d/2,d/2])bevel(shell,.14,h,.14,edge,[x,0,z],.03).castShadow=false;
  return shell;
}
function microParts(parent,w,h){
  const geometry=new RoundedBoxGeometry(.075,.035,.045,2,.008),material=ceramic(0x242b2f);
  const parts=new T.InstancedMesh(geometry,material,48),matrix=new T.Matrix4();
  for(let i=0;i<48;i++){
    const side=i%2?-1:1,x=side*w*(.34+(i%3)*.025),y=-h*.35+Math.floor(i/2)*h*.7/23;
    matrix.makeTranslation(x,y,.10);parts.setMatrixAt(i,matrix);
  }
  parts.castShadow=true;parts.receiveShadow=true;parent.add(parts);
  return parts;
}
function board(parent,w,h,z,color=0x163c38) {
  const root = new T.Group(); parent.add(root); root.position.z = z;
  panel(root,w,h,.08,ceramic(color),[0,0,0],.1);
  microParts(root,w,h);
  const pins = metal(0xd6b873);
  for(let i=0;i<13;i++) {
    const x = -w*.4 + i*w*.8/12;
    trace(root,[[x,-h*.43,.06],[x,-h*.18,.06],[x*.35,.08,.06],[x*.35,h*.42,.06]]);
    box(root,.055,.11,.025,pins,[x,-h*.43,.064]);
  }
  for(let i=0;i<5;i++) trace(root,[[-w*.43,-h*.3+i*h*.14,.06],[-w*.2,-h*.3+i*h*.14,.06],[0,i*.11,.06],[w*.44,i*.11,.06]]);
  return root;
}
function chip(parent,w,h,z,x=0,y=0,color=0x202934) {
  const root = new T.Group(); parent.add(root); root.position.set(x,y,z);
  panel(root,w,h,.1,ceramic(color),[0,0,0],.035);
  const pin = metal(0xd7c18e);
  for(let i=0;i<8;i++) {
    const offset=-h*.4+i*h*.8/7;
    box(root,.13,.035,.035,pin,[-w/2-.055,offset,0]);
    box(root,.13,.035,.035,pin,[w/2+.055,offset,0]);
  }
  panel(root,w*.72,h*.65,.012,metal(0x5c6976),[0,0,.063],.025);
  for(let i=0;i<4;i++)box(root,w*(.45-i*.06),.009,.003,ceramic(0xa5b0bd),[-w*.05,h*.19-i*.06,.073]);
  return root;
}
function screw(parent,x,y,z) {
  const group=new T.Group(); parent.add(group); group.position.set(x,y,z);
  const top=mesh(group,new T.CylinderGeometry(.075,.075,.035,20),metal(0x9da6b3)); top.rotation.x=Math.PI/2;
  box(group,.075,.014,.004,ceramic(0x475366),[0,0,.02]);
  const stem=mesh(group,new T.CylinderGeometry(.028,.028,.20,16),metal(0xbcc2c9),[0,0,-.10]); stem.rotation.x=Math.PI/2;
  return group;
}

// Cylinders are aligned with the device's depth axis (local Z).
function axialCylinder(parent,radius,depth,material,position){
  const item=mesh(parent,new T.CylinderGeometry(radius,radius,depth,96),material,position);item.rotation.x=Math.PI/2;return item;
}
function annulus(parent,outer,inner,depth,material,position){
  const shape=new T.Shape();shape.absarc(0,0,outer,0,Math.PI*2,false);
  const hole=new T.Path();hole.absarc(0,0,inner,0,Math.PI*2,true);shape.holes.push(hole);
  const geometry=new T.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:64});geometry.translate(0,0,-depth/2);
  return mesh(parent,geometry,material,position);
}
export function buildForensics(){
  const root=new T.Group(),device=new T.Group();root.add(device);root.userData.study='forensics-files';
  device.rotation.x=-Math.PI/2;device.rotation.z=-.12;device.position.y=.4;
  const silver=metal(0xc8cfd6),edge=metal(0x727d88),dark=ceramic(0x222a31);
  const base=panel(device,3.85,2.6,.24,silver,[0,0,0],.22);
  panel(device,3.58,2.34,.025,dark,[0,0,.13],.16);
  const shell=roundedShape(3.85,2.6,.22);shell.holes.push(roundedShape(3.49,2.2,.12,T.Path));
  const shellGeometry=new T.ExtrudeGeometry(shell,{depth:.25,bevelEnabled:true,bevelSegments:5,bevelSize:.012,bevelThickness:.01,curveSegments:32});
  mesh(device,shellGeometry,silver,[0,0,.12]);
  // Threaded bosses align with the lid bores; their smaller holes remain after removal.
  const baseBores=[];
  for(const [x,y] of [[-1.65,-1.04],[1.65,-1.04],[-1.65,1.04],[1.65,1.04]]){
    const boss=new T.Group();device.add(boss);boss.position.set(x,y,.235);
    annulus(boss,.105,.034,.27,silver,[0,0,0]);
    annulus(boss,.059,.034,.008,edge,[0,0,.139]);
    const points=[];for(let i=0;i<=120;i++){const t=i/120;points.push(new T.Vector3(Math.cos(t*Math.PI*12)*.035,Math.sin(t*Math.PI*12)*.035,-.095+t*.21));}
    mesh(boss,new T.TubeGeometry(new T.CatmullRomCurve3(points),120,.0018,5,false),dark);
    baseBores.push(boss);
  }
  const mechanism=new T.Group();device.add(mechanism);
  mechanism.userData.study='forensics-files';
  const platterMaterial=new T.MeshPhysicalMaterial({color:0xc7ccd2,metalness:1,roughness:.13,clearcoat:.35,anisotropy:.65});
  const platters=[];
  for(const z of [.215,.285]){
    const disc=new T.Group();mechanism.add(disc);disc.position.set(-.52,.08,z);
    annulus(disc,.935,.145,.026,platterMaterial,[0,0,0]);

    platters.push(disc);
  }
  const spindle=new T.Group();mechanism.add(spindle);spindle.position.set(-.52,.08,.30);
  axialCylinder(spindle,.145,.22,edge,[0,0,-.085]);
  annulus(spindle,.225,.065,.030,silver,[0,0,.018]);
  axialCylinder(spindle,.061,.025,edge,[0,0,.035]);
  for(let i=0;i<6;i++){const a=i*Math.PI/3;fastener(spindle,[Math.cos(a)*.175,Math.sin(a)*.175,.04],'z',.022);}
  const actuator=new T.Group();mechanism.add(actuator);actuator.position.set(1.03,-.58,.335);actuator.userData.study='forensics-logs';
  axialCylinder(actuator,.19,.09,edge,[0,0,-.035]);axialCylinder(actuator,.11,.035,silver,[0,0,.020]);fastener(actuator,[0,0,.04],'z',.044);
  const armShape=new T.Shape();armShape.moveTo(.1,-.08);armShape.lineTo(-.12,-.16);armShape.lineTo(-1.44,.84);armShape.lineTo(-1.40,.95);armShape.lineTo(-.05,.18);armShape.lineTo(.10,.08);armShape.closePath();
  const armHole=new T.Path();armHole.moveTo(-.28,.18);armHole.lineTo(-1.12,.78);armHole.lineTo(-.30,.36);armHole.closePath();armShape.holes.push(armHole);
  const armGeometry=new T.ExtrudeGeometry(armShape,{depth:.025,bevelEnabled:true,bevelSize:.005,bevelThickness:.004,bevelSegments:3});
  const headArm=mesh(actuator,armGeometry,silver,[0,0,-.01]);
  bevel(actuator,.09,.035,.015,dark,[-1.42,.91,-.025],.007);
  rod(actuator,[-1.18,.72,.019],[-1.42,.91,.019],.006,metal(0xe6c78e));
  for(let i=0;i<12;i++){const coil=mesh(actuator,new T.TorusGeometry(.17+i*.003,.0022,4,64),metal(0xb77435),[.29,-.18,.006]);coil.scale.set(1.15,.75,1);}
  bevel(mechanism,.64,.43,.065,edge,[1.31,-.76,.235],.07);
  // Recirculation filter and the flexible head-stack connection.
  bevel(mechanism,.61,.15,.07,ceramic(0xdde0dc),[1.03,.88,.215],.025);
  for(let i=0;i<15;i++)box(mechanism,.015,.10,.007,ceramic(0xb6bcb9),[.78+i*.033,.88,.257]);
  const flex=new T.Shape();flex.moveTo(1.13,-.45);flex.bezierCurveTo(1.53,-.22,1.49,.36,1.33,.59);flex.lineTo(1.43,.62);flex.bezierCurveTo(1.62,.3,1.62,-.24,1.20,-.52);flex.closePath();
  mesh(mechanism,new T.ExtrudeGeometry(flex,{depth:.006,bevelEnabled:false,curveSegments:24}),ceramic(0xaa6930),[0,0,.21]);
  const underside=board(device,2.85,1.65,-.16,0x183d35);underside.rotation.x=Math.PI;
  const lid=new T.Group(); device.add(lid); lid.position.set(0,1.25,.44);
  const screwCenters=[[-1.65,-1.04],[1.65,-1.04],[-1.65,1.04],[1.65,1.04]];
  const lidShape=roundedShape(3.85,2.6,.22);
  for(const [x,y] of screwCenters){const hole=new T.Path();hole.absarc(x,y,.064,0,Math.PI*2,true);lidShape.holes.push(hole);}
  const lidGeometry=new T.ExtrudeGeometry(lidShape,{depth:.10,bevelEnabled:true,bevelSegments:5,steps:1,bevelSize:.006,bevelThickness:.006,curveSegments:32});lidGeometry.translate(0,0,-.05);
  const lidPlate=mesh(lid,lidGeometry,silver,[0,-1.25,0]);
  // Countersinks taper to a bore larger than the .028 screw stem.
  for(const [x,y] of screwCenters){
    const seat=mesh(lid,new T.LatheGeometry([new T.Vector2(.064,.056),new T.Vector2(.034,.018),new T.Vector2(.034,-.056)],48),new T.MeshPhysicalMaterial({color:0x46515d,metalness:.6,roughness:.45,side:T.DoubleSide}),[x,y-1.25,0]);seat.rotation.x=Math.PI/2;
  }
  // A small etched line is a physical detail; no simulated code or evidence text.
  panel(lid,.9,.06,.012,edge,[0,-1.28,.065],.025);
  for(let i=0;i<14;i++)panel(lid,.55,.012,.004,edge,[.75,-.95-i*.033,.057],.005);
  for(const x of [-1.45,1.45])panel(lid,.08,.08,.008,edge,[x,-1.25,.06],.02);
  const screws=[[-1.65,-1.04],[1.65,-1.04],[-1.65,1.04],[1.65,1.04]].map(([x,y])=>screw(device,x,y,.51));
  // Stamped cover contour and separate SATA data/power contacts.
  mesh(lid,new T.TorusGeometry(.96,.006,6,128),edge,[-.52,.08-1.25,.057]);
  const sata=bevel(device,1.36,.09,.13,dark,[.58,-1.31,-.025],.018);
  for(let i=0;i<22;i++)box(device,.026,.014,.055,metal(0xc4a05b),[-.03+i*.054,-1.362,-.01]);
  const lens=new T.Group(); root.add(lens); lens.rotation.x=-.42; lens.rotation.y=.1;
  lens.userData.study='forensics-cloud';
  mesh(lens,new T.TorusGeometry(.61,.045,24,96),silver);
  mesh(lens,new T.TorusGeometry(.565,.012,12,96),edge);
  const disk=mesh(lens,new T.SphereGeometry(.565,64,32),glass(0xeaf4fa)); disk.scale.z=.08;disk.castShadow=false;
  rod(lens,[.42,-.4,0],[.99,-1.03,0],.055,silver);
  mesh(lens,new T.TorusGeometry(.615,.012,16,128),metal(0xeff5fa),[0,0,.035]);
  for(let i=0;i<15;i++){
    const t=i/20;rod(lens,[.66+t*.27,-.66-t*.30,-.006],[.71+t*.27,-.62-t*.30,-.006],.009,edge);
  }
  return {root,hotspots:{'forensics-files':platters[1],'forensics-logs':actuator,'forensics-cloud':lens},parts:{lid,lidPlate,screws,lens,circuit:mechanism,chips:[],platters,spindle,actuator,headArm,baseBores,base,device,underside,sata},update(p){
    const layout=forensicLayout(p);root.rotation.y=-.24+p.turn;
    lid.rotation.x=-p.open*1.65;lid.position.z=.44+p.open*.18;
    mechanism.position.z=p.lift*.055;
    platters.forEach((disc,i)=>{disc.rotation.z=p.scan*(1.4+i*.2);});
    actuator.rotation.z=-p.scan*.23;
    screws.forEach((item,i)=>{item.position.set(layout.screws[i].x,layout.screws[i].y,layout.screws[i].z);item.rotation.z=p.unscrew*Math.PI*4;});
    lens.visible=layout.lens.visible;lens.position.set(layout.lens.x,layout.lens.y,layout.lens.z);lens.scale.setScalar(.82);lens.rotation.z=-.24+(1-p.lens)*.6;
  }};
}

function androidRobot(parent) {
  const root=new T.Group(); parent.add(root);
  const green=new T.MeshPhysicalMaterial({color:0x49936d,metalness:.28,roughness:.18,clearcoat:1,clearcoatRoughness:.09}), white=ceramic(0x183a31);
  mesh(root,new T.CylinderGeometry(.43,.43,.8,40),green,[0,.82,0]);
  const head=new T.Group(); root.add(head); head.position.y=1.28;
  mesh(head,new T.SphereGeometry(.45,40,24,0,Math.PI*2,0,Math.PI/2),green);
  mesh(head,new T.CircleGeometry(.45,40),green).rotation.x=Math.PI/2;
  for(const x of [-.18,.18]) mesh(head,new T.SphereGeometry(.045,16,16),white,[x,.21,.36]);
  rod(head,[-.22,.28,0],[-.35,.59,0],.025,green);
  rod(head,[.22,.28,0],[.35,.59,0],.025,green);
  const arms=[];
  for(const x of [-.59,.59]) {
    const arm=new T.Group();root.add(arm);arm.position.set(x,1.08,0);
    mesh(arm,new T.CapsuleGeometry(.105,.47,8,16),green,[0,-.23,0]); arms.push(arm);
  }
  for(const x of [-.23,.23]) mesh(root,new T.CapsuleGeometry(.115,.33,8,16),green,[x,.26,0]);
  return {root,head,arms};
}
function mobileBGA(parent,w,h,position){
  const root=new T.Group();parent.add(root);root.position.set(...position);
  bevel(root,w,h,.024,ceramic(0x171c23),[0,0,0],.015);
  const balls=new T.InstancedMesh(new T.SphereGeometry(.0065,8,6),metal(0xbfc4c9),36),matrix=new T.Matrix4();
  for(let i=0;i<36;i++){matrix.makeTranslation(-w*.36+(i%6)*w*.72/5,-h*.36+Math.floor(i/6)*h*.72/5,-.017);balls.setMatrixAt(i,matrix);}root.add(balls);
  for(let i=0;i<3;i++)box(root,w*.52-i*.025,.005,.002,ceramic(0x88929b),[-w*.04,h*.20-i*.035,.014]);
  return root;
}
export function buildAndroid(){
  const root=new T.Group(),phone=new T.Group();root.add(phone);phone.position.set(-.6,1.94,.1);phone.rotation.y=-.16;root.userData.study='android-track';
  const silver=metal(0xbfc8ce),graphite=ceramic(0x1b242b),pcb=ceramic(0x133d3a),gold=metal(0xc5a35d);
  const cameraSpecs=[[-.52,1.24,.115],[-.52,.85,.105],[-.16,1.40,.075]];
  const backShape=roundedShape(1.8,3.45,.23);
  for(const [x,y,r] of cameraSpecs){const aperture=new T.Path();aperture.absarc(x,y,r+.008,0,Math.PI*2,true);backShape.holes.push(aperture);}
  const backGeometry=new T.ExtrudeGeometry(backShape,{depth:.035,bevelEnabled:true,bevelSize:.003,bevelThickness:.003,bevelSegments:3,curveSegments:32});backGeometry.translate(0,0,-.0175);
  const back=mesh(phone,backGeometry,silver);
  const frameShape=roundedShape(1.8,3.45,.23);frameShape.holes.push(roundedShape(1.61,3.20,.17,T.Path));
  const frameGeometry=new T.ExtrudeGeometry(frameShape,{depth:.10,bevelEnabled:true,bevelSize:.004,bevelThickness:.004,bevelSegments:4,curveSegments:32});
  const frame=mesh(phone,frameGeometry,silver,[0,0,.022]);
  for(const y of [.55,.95])bevel(phone,.035,.26,.045,silver,[.907,y,.075],.007);
  bevel(phone,.035,.43,.045,silver,[-.907,.65,.075],.007);
  for(let i=0;i<6;i++)bevel(phone,.034,.016,.025,graphite,[-.52+i*.105,-1.732,.073],.004);
  const circuit=new T.Group();phone.add(circuit);circuit.userData.study='android-runtime';
  const mainboard=bevel(circuit,.94,.89,.018,pcb,[.29,1.075,.043],.012);
  bevel(circuit,.15,2.15,.018,pcb,[-.725,-.18,.043],.008);
  const chargingBoard=bevel(circuit,1.48,.27,.018,pcb,[0,-1.435,.043],.012);
  const core=mobileBGA(circuit,.46,.41,[.29,1.105,.077]);
  const memory=mobileBGA(circuit,.31,.20,[.44,.775,.075]);
  const shield=new T.Group();circuit.add(shield);shield.position.set(.29,1.105,.103);
  bevel(shield,.53,.47,.012,silver,[0,0,0],.016);
  for(let i=0;i<8;i++)box(shield,.23,.003,.002,metal(0x74818c),[-.05,.12-i*.024,.009]);
  // Surface-mount passives and short parallel buses, rather than large DIP pins.
  const passives=new T.InstancedMesh(new RoundedBoxGeometry(.028,.044,.013,2,.003),ceramic(0x343f44),54),matrix=new T.Matrix4();
  for(let i=0;i<54;i++){
    const row=Math.floor(i/9),x=-.09+(i%9)*.075,y=row<3?1.38-row*.065:.70+(row-3)*.055;
    matrix.makeTranslation(x,y,.072);passives.setMatrixAt(i,matrix);
  }circuit.add(passives);
  for(let i=0;i<9;i++)trace(circuit,[[.02+i*.037,.87,.058],[.02+i*.037,.93,.058],[.05+i*.037,.97,.058]],0x8f9875);
  const battery=bevel(circuit,1.25,1.80,.052,ceramic(0x32383a),[0,-.32,.061],.012);
  bevel(battery,1.18,1.70,.002,metal(0x707775),[0,0,.028],.001);
  const batteryLabel=mesh(battery,new T.PlaneGeometry(.80,1.18),new T.MeshBasicMaterial({map:batteryMark(),transparent:true,alphaTest:.02,depthWrite:false}),[0,0,.033]);batteryLabel.castShadow=false;
  // Pouch seams and adhesive pull tabs.
  for(const x of [-.57,.57])box(battery,.008,1.60,.003,ceramic(0xa4aeaa),[x,0,.030]);
  for(let i=0;i<5;i++)box(battery,.45-i*.035,.007,.002,ceramic(0x30383a),[-.18,.46-i*.045,.032]);
  for(const x of [-.38,.38])bevel(circuit,.11,.20,.005,ceramic(0xb5bbad),[x,-1.17,.092],.002);
  const cameras=[];
  for(const [x,y,r] of cameraSpecs){
    const camera=new T.Group();circuit.add(camera);camera.position.set(x,y,.059);
    bevel(camera,r*2.5,r*2.5,.035,graphite,[0,0,0],.012);
    bevel(camera,r*2.15,r*2.15,.006,silver,[0,0,.022],.002);
    // Rear-facing lens barrels project through the rear, not through the display.
    axialCylinder(camera,r,.065,graphite,[0,0,-.050]);
    mesh(camera,new T.TorusGeometry(r*.85,.009,12,48),silver,[0,0,-.086]);
    const lens=mesh(camera,new T.CircleGeometry(r*.72,48),jewel(0x163b56),[0,0,-.087]);lens.rotation.y=Math.PI;
    cameras.push(camera);
  }
  const flex=bevel(circuit,.092,1.75,.006,ceramic(0x96602e),[.655,-.30,.089],.002);
  for(let i=0;i<4;i++)box(flex,.004,1.60,.002,gold,[-.03+i*.02,0,.004]);
  for(const y of [.64,-1.22]){bevel(circuit,.28,.075,.028,graphite,[.56,y,.073],.004);for(let i=0;i<9;i++)box(circuit,.012,.05,.006,gold,[.45+i*.028,y,.090]);}
  bevel(circuit,.44,.16,.05,metal(0x7d898b),[-.46,-1.44,.077],.008);
  bevel(circuit,.42,.19,.052,graphite,[.47,-1.44,.078],.012);
  bevel(phone,.24,.043,.07,silver,[0,-1.729,.071],.008);bevel(phone,.19,.020,.053,graphite,[0,-1.755,.071],.004);
  const screen=new T.Group();phone.add(screen);screen.userData.study='android-static';
  bevel(screen,1.74,3.39,.022,graphite,[0,0,0],.004);
  const display=mesh(screen,new T.PlaneGeometry(1.61,3.23),new T.MeshBasicMaterial({map:phoneDisplay(),color:0xffffff,transparent:true,alphaTest:.02}),[0,0,.022]);display.castShadow=false;display.receiveShadow=false;
  mesh(screen,new T.CircleGeometry(.028,32),graphite,[0,1.47,.024]);
  for(let i=0;i<7;i++)box(screen,.015,.005,.003,metal(0x74828a),[-.09+i*.03,1.59,.024]);
  const robot=androidRobot(root);robot.root.rotation.y=-.15;
  return {root,hotspots:{'android-track':robot.root,'android-static':screen,'android-runtime':core},parts:{phone,back,screen,frame,core,circuit,display,battery,mainboard,chargingBoard,memory,cameras,shield,flex},update(p,compact){
    const layout=androidLayout(p);root.rotation.y=.05+p.turn;
    screen.position.set(layout.screen.x,0,layout.screen.z);screen.rotation.y=-p.open*.12;
    core.position.z=layout.coreZ;
    shield.position.z=.103+p.lift*.25;shield.position.x=.29+p.lift*.80;
    robot.head.rotation.z=-p.scan*.14;robot.head.position.y=1.28+p.scan*.15;
    robot.arms[1].rotation.z=p.open*.45;robot.arms[0].rotation.z=-p.scan*.3;
    robot.root.position.set(compact?1.15:3.35,0,compact?.7:.15);robot.root.scale.setScalar(compact?.6:.78);
  }};
}

export function buildReversing() {
  const root=new T.Group(), device=new T.Group();root.add(device);device.rotation.x=-Math.PI/2;device.rotation.z=.18;device.position.y=.3;
  root.userData.study='reversing-vm';
  const silver=metal(0xd4dbe4), gold=metal(0xdcc88b), blue=ceramic(0x243f72);
  const circuit=board(device,3.9,3.2,0,0x24354f);
  for(let i=0;i<14;i++) for(const y of [-1.3,1.3]) box(circuit,.1,.16,.035,gold,[-1.65+i*.25,y,.08]);
  const packageLayer=new T.Group();device.add(packageLayer);
  panel(packageLayer,2.65,2.25,.13,blue,[0,0,.15],.1);
  for(let i=0;i<14;i++) for(const side of [-1,1]) box(packageLayer,.11,.05,.08,gold,[side*1.4,-.9+i*.14,.13]);
  const die=new T.Group();device.add(die);
  panel(die,1.85,1.65,.1,metal(0x7b95b4),[0,0,.31],.055);
  const tiles=[];
  for(let x=0;x<4;x++) for(let y=0;y<4;y++) {
    const tile=panel(die,.35,.30,.035,ceramic((x+y)%2?0x4174ad:0x294c7c),[-.61+x*.41,-.51+y*.35,.38],.025);
    tiles.push(tile);
    for(let j=0;j<3;j++) trace(tile,[[-.12,-.08+j*.055,.026],[.11,-.08+j*.055,.026]],0x8bb5da);
  }
  const optical=panel(device,2.62,2.25,.055,glass(0x86b9ff),[0,0,.46],.1);
  const cover=panel(device,2.7,2.32,.11,silver,[0,0,.58],.13);
  cover.userData.study='reversing-debugger';
  for(let i=0;i<12;i++)box(cover,.85-i*.035,.012,.004,metal(0x7f8b9b),[-.2,.5-i*.055,.063]);
  for(const x of [-1.16,1.16])for(const y of [-.94,.94])fastener(cover,[x,y,.064]);
  for(let i=0;i<20;i++)for(const side of [-1,1])rod(die,[side*.9,-.72+i*.075,.34],[side*1.23,-.72+i*.075,.16],.009,gold);
  const connectors=new T.Group();device.add(connectors);
  for(const x of [-1.18,1.18]) for(const y of [-.95,.95]) {
    const line=trace(connectors,[[x,y,.12],[x,y,2.9]],0x7a9dd4);line.material.opacity=0;
  }
  return {root,hotspots:{'reversing-vm':die,'reversing-debugger':cover},parts:{cover,optical,die},update(p,compact){
    root.rotation.y=-.18+p.turn;
    cover.position.z=.58+p.open*2.2;
    cover.rotation.y=p.spread*.14;
    cover.position.x=p.spread*(compact?.15:.4);
    optical.position.z=.46+p.lift*1.65;
    optical.rotation.z=p.spread*.12;
    die.position.z=p.lift*.9;
    packageLayer.position.z=p.lift*.28;
    tiles.forEach((tile,i)=>{tile.position.z=.38+p.spread*(.12+(i%4)*.06);});
    connectors.children.forEach(line=>{line.material.opacity=p.spread*.22;});
    optical.material.opacity=1;
  }};
}

// Hollow optical housings, machined collars and discrete contract/storage modules.
export function buildWeb3() {
  const root=new T.Group(),silver=metal(0xcbd2dc),chrome=metal(0xe5ecf5),blue=jewel(0x1267c4);
  root.userData.study='web3-contract';
  for(const x of [-2.35,0,2.35]){
    const block=new T.Group();root.add(block);block.position.set(x,.99,0);
    glassCase(block,1.58,1.48,1.38,{top:x!==0});
    block.userData.study=x===0?'web3-contract':'web3-storage';
    for(const y of [-.76,.76])if(x!==0||y<0){
      for(const z of [-.66,.66])bevel(block,1.49,.024,.024,chrome,[0,y,z],.006);
      for(const xx of [-.75,.75])bevel(block,.024,.024,1.30,chrome,[xx,y,0],.006);
    }
    if(x!==0){
      const backing=bevel(block,.75,1.06,.10,silver,[0,0,-.22],.04);
      for(let i=0;i<3;i++)bevel(backing,.56,.16,.28,chrome,[0,-.25+i*.25,.20],.025);
    }
  }
  for(const x of [-1.17,1.17]){
    rod(root,[x-.40,.99,0],[x+.40,.99,0],.105,chrome);
    for(const side of [-1,1]){
      const collar=mesh(root,new T.CylinderGeometry(.18,.18,.12,48),silver,[x+side*.36,.99,0]);collar.rotation.z=Math.PI/2;
      const ring=mesh(root,new T.TorusGeometry(.13,.022,16,48),chrome,[x+side*.43,.99,0]);ring.rotation.y=Math.PI/2;
    }
  }
  const lid=new T.Group();root.add(lid);
  glassCase(lid,1.58,.42,1.38,{bottom:false});
  const contract=new T.Group();root.add(contract);contract.userData.study='web3-contract';
  bevel(contract,1.10,.15,.95,silver,[0,0,0],.035);
  // Raised traces are integrated on the contract's top face.
  for(let i=0;i<5;i++)bevel(contract,.66-i*.06,.012,.045,chrome,[-.06,.083,-.28+i*.13],.004);
  for(const x of [-.45,.45])for(const z of [-.37,.37]){const f=fastener(contract,[x,.085,z]);f.rotation.x=-Math.PI/2;}
  const slots=[],slotGroup=new T.Group();root.add(slotGroup);slotGroup.userData.study='web3-storage';
  for(let i=0;i<6;i++)slots.push(bevel(slotGroup,.31,.28,.31,i%3===0?chrome:blue,[0,0,0],.035));
  return {root,hotspots:{'web3-contract':contract,'web3-storage':slotGroup},parts:{lid,contract,slots},update(p){
    root.rotation.y=-.25+p.turn;
    lid.position.set(0,1.99+p.open*1.43,0);lid.rotation.z=p.spread*.06;
    contract.position.set(0,1.43+p.lift*.95,0);contract.rotation.y=-p.spread*.12;
    slots.forEach((slot,i)=>{slot.position.set(-.43+(i%3)*.43+(i%3-1)*p.spread*.1,.60+p.lift*.78+Math.floor(i/3)*p.spread*.32,Math.floor(i/3)*.46-.23+p.spread*.30);slot.rotation.y=p.spread*(i%2?.12:-.12);});
  }};
}

export function buildFuzzing(){
  const root=new T.Group(),silver=metal(0xcbd2dc),chrome=metal(0xe4e9ee),dark=ceramic(0x17202b),blue=jewel(0x146cc7);
  root.userData.study='fuzzing-mutation';
  const chamber=new T.Group();root.add(chamber);chamber.position.y=1.02;
  glassCase(chamber,2.78,1.42,1.35,{top:true});
  bevel(chamber,2.86,.12,1.4,silver,[0,-.79,0],.025);
  // Black seals and perimeter bolts make the optical chamber an actual assembly.
  const caps=[-1,1].map(side=>{
    const cap=new T.Group();root.add(cap);
    bevel(cap,.30,1.69,1.58,silver,[0,0,0],.11);
    bevel(cap,.035,1.48,1.38,dark,[-side*.17,0,0],.012);
    bevel(cap,.045,1.36,1.26,chrome,[-side*.20,0,0],.016);
    for(const y of [-.64,.64])for(const z of [-.57,.57])fastener(cap,[side*.16,y,z],'x',.045);
    // Milled fins rather than a flat, featureless end plate.
    for(let i=0;i<15;i++)bevel(cap,.018,.98,.014,metal(0x7a8794),[side*.165,0,-.43+i*.06],.004);
    return cap;
  });
  const output=new T.Group();caps[1].add(output);output.position.x=.32;
  const tube=mesh(output,new T.CylinderGeometry(.48,.48,.45,64),chrome,[.1,0,0]);tube.rotation.z=Math.PI/2;
  const ring=mesh(output,new T.TorusGeometry(.41,.065,24,64),dark,[.34,0,0]);ring.rotation.y=Math.PI/2;
  const input=new T.Group();root.add(input);input.userData.study='fuzzing-input';
  bevel(input,.73,1.04,.045,new T.MeshPhysicalMaterial({color:0xfaf5e8,roughness:.42}),[0,0,0],.018);
  for(let i=0;i<5;i++)bevel(input,.45-i%2*.09,.022,.006,metal(0xa1a6aa),[0,.28-i*.12,.028],.003);
  const tokens=[];
  for(let i=0;i<18;i++)if(i!==16){const token=bevel(chamber,.25,.25,.25,i%4===0?chrome:blue,[0,0,0],.024);token.userData.corpusIndex=i;tokens.push(token);}
  // A coated solid keeps its silhouette stable over refractive glass and metal.
  const candidateMaterial=jewel(0x146cc7),seedColor=new T.Color(0x146cc7),amberColor=new T.Color(0xe7a21d);
  const crash=bevel(root,.25,.25,.25,candidateMaterial,[0,0,0],.024);crash.userData.study='fuzzing-crash';
  return {root,hotspots:{'fuzzing-mutation':chamber,'fuzzing-input':input,'fuzzing-crash':crash},parts:{caps,chamber,input,crash,tokens},update(p){
    root.rotation.y=-.2+p.turn;
    caps.forEach((cap,i)=>{cap.position.set((i?1:-1)*(1.60+p.open*.44),1.02,0);});
    input.position.set(-3.10+p.lift*.57,1.12+p.open*.12,.9);input.rotation.y=-.2+p.spread*.2;
    tokens.forEach(token=>{
      const i=token.userData.corpusIndex;
      const wave=Math.sin(i*2.1+p.scan*5)*p.spread;
      token.position.set(-.95+(i%6)*.38,-.30+Math.floor(i/12)*.49+wave*.16,-.31+Math.floor(i/6)%2*.62);
      token.rotation.set(p.spread*(i%3)*.25,p.scan*(i%4)*.35,p.spread*wave*.3);
    });
    const candidate=fuzzingCandidateLayout(p);
    crash.position.set(candidate.x,candidate.y,candidate.z);crash.scale.setScalar(candidate.scale);
    candidateMaterial.color.copy(seedColor).lerp(amberColor,p.lift);
    crash.rotation.set(p.spread*.18,p.scan*.5,p.spread*.15);
  }};
}

export function makeModel(kind) {
  const builders={forensics:buildForensics,android:buildAndroid,reversing:buildReversing,web3:buildWeb3,fuzzing:buildFuzzing};
  if(!builders[kind])throw new Error(`Unknown interest scene: ${kind}`);
  return builders[kind]();
}
