import * as T from 'three';
import {brushedMetal,phoneDisplay} from './studio-surfaces.js';
import {forensicLayout,androidLayout,segment} from '../lib/scene-motion.mjs';

const metal = brushedMetal;
const ceramic = color => new T.MeshPhysicalMaterial({color, roughness: .36, metalness: .04, clearcoat: .35});
const glass = color => new T.MeshPhysicalMaterial({color, metalness: .02, roughness: .08, transmission: .96, thickness: .06, transparent: true, opacity: .32, side: T.DoubleSide, depthWrite: false});
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
  const m = mesh(parent,new T.CylinderGeometry(r,r,delta.length(),12),material,a.clone().add(b).multiplyScalar(.5).toArray());
  m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize()); return m;
}
function trace(parent,points,color=0xd6b873) {
  const geometry = new T.BufferGeometry().setFromPoints(points.map(p=>new T.Vector3(...p)));
  const line = new T.Line(geometry,new T.LineBasicMaterial({color,transparent:true,opacity:.65}));
  parent.add(line); return line;
}
function board(parent,w,h,z,color=0x163c38) {
  const root = new T.Group(); parent.add(root); root.position.z = z;
  panel(root,w,h,.08,ceramic(color),[0,0,0],.1);
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
  const circuit=board(device,3.42,2.16,.18);
  const chips=[chip(circuit,.88,.68,.13,-.85,.35),chip(circuit,.88,.68,.13,.4,.35),chip(circuit,.65,.46,.13,-.7,-.55)];
  chips[0].userData.study='forensics-logs';
  const lid=new T.Group(); device.add(lid); lid.position.set(0,1.25,.44);
  panel(lid,3.85,2.6,.10,silver,[0,-1.25,0],.22);
  // A small etched line is a physical detail; no simulated code or evidence text.
  panel(lid,.9,.06,.012,edge,[0,-1.28,.065],.025);
  const screws=[[-1.65,-1.04],[1.65,-1.04],[-1.65,1.04],[1.65,1.04]].map(([x,y])=>screw(device,x,y,.51));
  panel(device,.55,.12,.025,dark,[.85,-1.305,-.02],.04).rotation.x=Math.PI/2;
  panel(device,.42,.035,.025,ceramic(0x2872e8),[.85,-1.325,-.02],.015).rotation.x=Math.PI/2;
  const lens=new T.Group(); root.add(lens); lens.rotation.x=-.42; lens.rotation.y=.1;
  lens.userData.study='forensics-cloud';
  mesh(lens,new T.TorusGeometry(.61,.045,24,96),silver);
  mesh(lens,new T.TorusGeometry(.565,.012,12,96),edge);
  const disk=mesh(lens,new T.SphereGeometry(.565,64,32),glass(0xeaf4fa)); disk.scale.z=.08;disk.castShadow=false;
  rod(lens,[.42,-.4,0],[.99,-1.03,0],.055,silver);
  const scan=mesh(circuit,new T.PlaneGeometry(2.9,.065),new T.MeshBasicMaterial({color:0x72d9ff,transparent:true,opacity:0,side:T.DoubleSide,depthWrite:false}),[0,-.85,.27]);
  const nodes=[];
  for(let i=0;i<9;i++) nodes.push(mesh(circuit,new T.SphereGeometry(.035,12,12),new T.MeshBasicMaterial({color:0x44bbef}),[-1.15+i*.28,.82,.23]));
  return {root,hotspots:{'forensics-files':circuit,'forensics-logs':chips[0],'forensics-cloud':lens},parts:{lid,screws,lens,circuit,chips},update(p,compact){
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
  const green=ceramic(0x4caa75), white=ceramic(0xf5fff8);
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
  const circuit=board(phone,1.58,3.15,.12,0x254f45);
  const core=chip(circuit,.76,.66,.13,0,.5);
  circuit.userData.study='android-runtime';
  panel(circuit,.78,1.35,.11,ceramic(0x35494d),[0,-.58,.09],.06);
  const layers=[];
  const screen=new T.Group();phone.add(screen);
  screen.userData.study='android-static';
  panel(screen,1.7,3.34,.07,graphite,[0,0,0],.2);
  const display=mesh(screen,new T.PlaneGeometry(1.55,3.15),new T.MeshBasicMaterial({map:phoneDisplay(),color:0xffffff,transparent:true,alphaTest:.02}),[0,0,.055]);
  display.castShadow=false;display.receiveShadow=false;
  mesh(screen,new T.CircleGeometry(.036,24),graphite,[0,1.39,.058]);
  for(let i=0;i<3;i++) layers.push(panel(phone,1.48,2.96,.006,glass(i===1?0xbcdcd0:0xe7f9ee),[0,0,.315+i*.012],.16));
  const robot=androidRobot(root);robot.root.position.set(1.25,0,.35);robot.root.rotation.y=-.15;
  return {root,hotspots:{'android-track':robot.root,'android-static':screen,'android-runtime':core},parts:{screen,layers,core,circuit,display},update(p,compact){
    const layout=androidLayout(p);
    root.rotation.y=.05+p.turn;
    screen.position.set(layout.screen.x,0,layout.screen.z);
    screen.rotation.y=-p.open*.12;
    layers.forEach((layer,i)=>{
      layer.position.set(layout.layers[i].x,layout.layers[i].y,layout.layers[i].z);layer.rotation.y=p.lift*(.18+i*.08);
      // Reveal the film only after it has cleared the chipset in screen space.
      layer.visible=p.lift>.9;layer.castShadow=false;layer.material.opacity=.32*segment(p.lift,.9,1);
    });
    core.position.z=layout.coreZ;
    robot.head.rotation.z=-p.scan*.14;
    robot.head.position.y=1.28+p.scan*.15;
    robot.arms[1].rotation.z=p.open*.45;
    robot.arms[0].rotation.z=-p.scan*.3;
    robot.root.position.set(compact?.4:4.5,0,compact?1.4:.4);robot.root.scale.setScalar(compact?.6:.78);
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
    optical.material.opacity=.4+p.scan*.25;
  }};
}

export function makeModel(kind) {
  return kind==='android'?buildAndroid():kind==='reversing'?buildReversing():buildForensics();
}
