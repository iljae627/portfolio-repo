import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {brushedMetal,phoneDisplay} from './studio-surfaces.js';
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
  const stem=mesh(group,new T.CylinderGeometry(.028,.028,.12,12),metal(0xbcc2c9),[0,0,-.07]); stem.rotation.x=Math.PI/2;
  return group;
}

export function buildForensics() {
  const root=new T.Group(), device=new T.Group(); root.add(device);
  root.userData.study='forensics-files';
  device.rotation.x=-Math.PI/2; device.rotation.z=-.12; device.position.y=.4;
  const silver=metal(0xd4d9df), edge=metal(0x8b98a7), dark=ceramic(0x263442);
  panel(device,3.85,2.6,.24,silver,[0,0,0],.22);
  panel(device,3.64,2.39,.04,dark,[0,0,.13],.17);
  const shell=roundedShape(3.85,2.6,.22);shell.holes.push(roundedShape(3.49,2.2,.12,T.Path));
  const shellGeometry=new T.ExtrudeGeometry(shell,{depth:.25,bevelEnabled:true,bevelSegments:5,bevelSize:.015,bevelThickness:.012,curveSegments:20});
  mesh(device,shellGeometry,silver,[0,0,.12]);
  for(let i=0;i<9;i++)panel(device,.32,.018,.012,edge,[-1.4+i*.35,.78,.14],.008);
  const circuit=board(device,3.42,2.16,.18);
  const chips=[chip(circuit,.88,.68,.13,-.85,.35),chip(circuit,.88,.68,.13,.4,.35),chip(circuit,.65,.46,.13,-.7,-.55)];
  chips[0].userData.study='forensics-logs';
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
  panel(device,.55,.12,.025,dark,[.85,-1.305,-.02],.04).rotation.x=Math.PI/2;
  panel(device,.42,.035,.025,ceramic(0x2872e8),[.85,-1.325,-.02],.015).rotation.x=Math.PI/2;
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
  const scan=mesh(circuit,new T.PlaneGeometry(2.9,.065),new T.MeshBasicMaterial({color:0x72d9ff,transparent:true,opacity:0,side:T.DoubleSide,depthWrite:false}),[0,-.85,.27]);
  const nodes=[];
  for(let i=0;i<9;i++) nodes.push(mesh(circuit,new T.SphereGeometry(.035,12,12),new T.MeshBasicMaterial({color:0x44bbef}),[-1.15+i*.28,.82,.23]));
  return {root,hotspots:{'forensics-files':circuit,'forensics-logs':chips[0],'forensics-cloud':lens},parts:{lid,lidPlate,screws,lens,circuit,chips},update(p,compact){
    const layout=forensicLayout(p);
    root.rotation.y=-.24+p.turn;
    lid.rotation.x=-p.open*1.65;
    lid.position.z=.44+p.open*.18;
    circuit.position.z=.18+p.lift*.7;
    chips.forEach((c,i)=>{c.position.z=.13+p.spread*(.38+i*.22);c.rotation.z=p.spread*(i-1)*.12;});
    screws.forEach((s,i)=>{s.position.set(layout.screws[i].x,layout.screws[i].y,layout.screws[i].z);s.rotation.z=p.unscrew*Math.PI*4;});
    lens.visible=layout.lens.visible;
    lens.position.set(layout.lens.x,layout.lens.y,layout.lens.z);
    lens.scale.setScalar(.82);lens.rotation.z=-.24+(1-p.lens)*.6;
    scan.position.y=-.85+p.scan*1.7; scan.material.opacity=p.scan>0?.35:0;
    nodes.forEach((n,i)=>{n.scale.setScalar(1+p.scan*Math.sin(i*.8+p.scan*4)*.6);});
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
export function buildAndroid() {
  const root=new T.Group(), phone=new T.Group(); root.add(phone);phone.position.set(-.6,1.94,.1);phone.rotation.y=-.16;
  root.userData.study='android-track';
  const silver=metal(0xc8d2d5), graphite=ceramic(0x1e2c32);
  panel(phone,1.8,3.45,.2,silver,[0,0,0],.23);
  panel(phone,1.73,3.38,.035,metal(0x76848b),[0,0,.112],.21);
  for(const y of [.55,.95])bevel(phone,.05,.28,.08,silver,[.92,y,0],.02);
  bevel(phone,.05,.46,.08,silver,[-.92,.65,0],.02);
  for(let i=0;i<7;i++)bevel(phone,.045,.02,.05,graphite,[-.48+i*.16,-1.737,0],.008);
  bevel(phone,.24,.025,.09,graphite,[0,-1.737,0],.012);
  const frameShape=roundedShape(1.8,3.45,.23);frameShape.holes.push(roundedShape(1.58,3.15,.16,T.Path));
  const frameGeometry=new T.ExtrudeGeometry(frameShape,{depth:.25,bevelEnabled:true,bevelSize:.008,bevelThickness:.008,bevelSegments:5,curveSegments:32});
  const frame=mesh(phone,frameGeometry,silver,[0,0,.08]);
  const circuit=board(phone,1.58,3.15,.12,0x254f45);
  const core=chip(circuit,.76,.66,.13,0,.5);
  circuit.userData.study='android-runtime';
  panel(circuit,.78,1.35,.11,ceramic(0x35494d),[0,-.58,.09],.06);
  const screen=new T.Group();phone.add(screen);
  screen.userData.study='android-static';
  panel(screen,1.7,3.34,.07,graphite,[0,0,0],.2);
  const display=mesh(screen,new T.PlaneGeometry(1.55,3.15),new T.MeshBasicMaterial({map:phoneDisplay(),color:0xffffff,transparent:true,alphaTest:.02}),[0,0,.055]);
  display.castShadow=false;display.receiveShadow=false;
  mesh(screen,new T.CircleGeometry(.036,32),graphite,[0,1.39,.058]);
  mesh(screen,new T.CircleGeometry(.018,32),jewel(0x174363),[0,1.39,.06]);
  for(let i=0;i<9;i++)box(screen,.018,.008,.006,metal(0x74828a),[-.12+i*.03,1.51,.058]);
  const robot=androidRobot(root);robot.root.position.set(1.25,0,.35);robot.root.rotation.y=-.15;
  return {root,hotspots:{'android-track':robot.root,'android-static':screen,'android-runtime':core},parts:{screen,frame,core,circuit,display},update(p,compact){
    const layout=androidLayout(p);
    root.rotation.y=.05+p.turn;
    screen.position.set(layout.screen.x,0,layout.screen.z);
    screen.rotation.y=-p.open*.12;
    core.position.z=layout.coreZ;
    robot.head.rotation.z=-p.scan*.14;
    robot.head.position.y=1.28+p.scan*.15;
    robot.arms[1].rotation.z=p.open*.45;
    robot.arms[0].rotation.z=-p.scan*.3;
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
