import * as T from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {makeModel} from './interest-models';
import {sampleMotion} from '../lib/scene-motion.mjs';
import {marbleSurface,foliageShadow} from './studio-surfaces.js';

export function mountScene(host, kind, control, ready, onStudy = ()=>{}) {
  const renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,window.innerWidth<700?1.5:2));
  renderer.outputColorSpace=T.SRGBColorSpace;
  renderer.toneMapping=T.ACESFilmicToneMapping;
  renderer.toneMappingExposure=.86;
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=T.PCFShadowMap;
  const canvas=renderer.domElement;canvas.setAttribute('aria-hidden','true');host.appendChild(canvas);
  const scene=new T.Scene();
  const color=kind==='android'?0xe4ebe3:kind==='reversing'?0xe1e5ed:0xe8e1d5;
  scene.background=new T.Color(color);scene.fog=new T.Fog(color,19,44);
  const room=new RoomEnvironment();
  const pmrem=new T.PMREMGenerator(renderer);
  const environment=pmrem.fromScene(room,.04);
  scene.environment=environment.texture;scene.environmentIntensity=.95;
  room.dispose();pmrem.dispose();
  scene.add(new T.HemisphereLight(0xfffbf3,0x777063,.7));
  const key=new T.DirectionalLight(0xffeed6,3.1);key.position.set(-4,8,4);key.castShadow=true;
  key.shadow.mapSize.set(window.innerWidth<700?1024:2048,window.innerWidth<700?1024:2048);key.shadow.camera.left=-7;key.shadow.camera.right=7;
  key.shadow.camera.top=7;key.shadow.camera.bottom=-7;key.shadow.normalBias=.04;key.shadow.bias=-.0001;
  key.shadow.radius=4;scene.add(key);
  const rim=new T.DirectionalLight(0xd3e6ff,1.5);rim.position.set(5,5,-4);scene.add(rim);
  const floorMap=marbleSurface();
  const floor=new T.Mesh(new T.PlaneGeometry(100,100),new T.MeshPhysicalMaterial({color:kind==='forensics'?0xffffff:color,map:floorMap,roughness:.38,metalness:.02,clearcoat:.25}));
  floor.rotation.x=-Math.PI/2;floor.position.y=-.035;floor.receiveShadow=true;scene.add(floor);
  const leavesTexture=foliageShadow();
  const leaves=new T.Mesh(new T.PlaneGeometry(11,7),new T.MeshBasicMaterial({map:leavesTexture,transparent:true,depthWrite:false,opacity:.7}));
  leaves.rotation.x=-Math.PI/2;leaves.rotation.z=-.45;leaves.position.set(1,-.028,-3.7);scene.add(leaves);
  const shadowCanvas=document.createElement('canvas');shadowCanvas.width=128;shadowCanvas.height=128;
  const ctx=shadowCanvas.getContext('2d');const gradient=ctx.createRadialGradient(64,64,3,64,64,62);
  gradient.addColorStop(0,'rgba(43,49,58,.24)');gradient.addColorStop(.5,'rgba(43,49,58,.1)');gradient.addColorStop(1,'rgba(43,49,58,0)');
  ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);
  const shadowTexture=new T.CanvasTexture(shadowCanvas);
  const contact=new T.Mesh(new T.PlaneGeometry(7,5),new T.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false}));
  contact.rotation.x=-Math.PI/2;contact.position.y=-.025;scene.add(contact);
  const pivot=new T.Group();scene.add(pivot);
  const model=makeModel(kind);pivot.add(model.root);
  let meshes=0;model.root.traverse(object=>{if(object.isMesh){meshes++;object.name=`part-${meshes}`;}});host.dataset.parts=String(meshes);
  const raycaster=new T.Raycaster(),mouse=new T.Vector2();
  let selected='';
  const studyBox=new T.Box3(),corner=new T.Vector3();
  const overlay=host.querySelector('.study-overlay'),outline=host.querySelector('[data-study-box]'),connector=host.querySelector('[data-study-line]');
  const camera=new T.PerspectiveCamera(32,1,.1,80);
  const target=new T.Vector3(0,.9,0),direction=new T.Vector3(4.4,3.4,6.8).normalize();
  let distance=10, compact=false, width=1,height=1,progress=control.progress,px=0,py=0,raf=0,disposed=false,first=true,lastKey='',lastTime=performance.now();
  function resize(){
    width=host.clientWidth;height=host.clientHeight;if(!width||!height)return;
    compact=width<700;renderer.setPixelRatio(Math.min(window.devicePixelRatio,compact?1.5:2));renderer.setSize(width,height,false);camera.aspect=width/height;
    const viewHeight=Math.max(kind==='android'?7.6:6.4,(kind==='android'?7.3:7.1)/camera.aspect);
    distance=viewHeight/(2*Math.tan(T.MathUtils.degToRad(camera.fov/2)));
    camera.position.copy(direction).multiplyScalar(distance).add(target);
    camera.lookAt(target);camera.setViewOffset(width,height,0,-height*.035,width,height);camera.updateProjectionMatrix();
    lastKey='';
    overlay?.setAttribute('viewBox',`0 0 ${width} ${height}`);
  }
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);resize();
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  function render(){
    if(disposed)return;
    raf=requestAnimationFrame(render);
    const now=performance.now(),dt=Math.min(64,now-lastTime);lastTime=now;
    if(!control.visible&&!first)return;
    if(document.visibilityState==='hidden')return;
    const reduced=motion.matches;
    const requested=reduced ? 0 : control.progress;
    progress=reduced?0:progress+(requested-progress)*(1-Math.exp(-dt/75));
    if(Math.abs(requested-progress)<.00001)progress=requested;
    px+=(reduced?0:control.pointerX-px)*.1;
    py+=(reduced?0:control.pointerY-py)*.1;
    if(reduced){px=0;py=0;}
    const pose=sampleMotion(kind,progress);
    const stateKey=`${pose.frame}:${px.toFixed(3)}:${py.toFixed(3)}:${control.pointerActive}:${control.studyManual}:${control.studyPinned}:${width}:${height}`;
    if(stateKey===lastKey&&!first)return;
    lastKey=stateKey;
    model.update(pose,compact);
    target.set(kind==='android'?.8:kind==='forensics'?.45:0,(kind==='android'?1.8:.9)+pose.open*(kind==='android'?.1:.5),0);
    camera.position.copy(direction).multiplyScalar(distance*(1+pose.open*.045)).add(target);
    camera.lookAt(target);camera.updateMatrixWorld();
    pivot.rotation.y=px*.07;pivot.rotation.x=py*.03;
    pivot.position.x=px*.04;
    scene.updateMatrixWorld(true);
    let hovered=null,nextStudy=control.studyManual?Object.keys(model.hotspots)[0]:control.studyPinned?selected:'';
    if(control.pointerActive&&!control.studyPinned&&!control.studyManual){
      mouse.set(control.pointerX,-control.pointerY);raycaster.setFromCamera(mouse,camera);
      hovered=raycaster.intersectObject(model.root,true).find(hit=>hit.object.isMesh)?.object;
      let part=hovered;while(part&&!part.userData.study)part=part.parent;
      nextStudy=part?.userData.study||'';
    }
    if(nextStudy&&model.hotspots[nextStudy]){
      studyBox.setFromObject(model.hotspots[nextStudy]);
      let minX=width,minY=height,maxX=0,maxY=0;
      for(const x of [studyBox.min.x,studyBox.max.x])for(const y of [studyBox.min.y,studyBox.max.y])for(const z of [studyBox.min.z,studyBox.max.z]){
        corner.set(x,y,z).project(camera);const sx=(corner.x+1)*width/2,sy=(1-corner.y)*height/2;
        minX=Math.min(minX,sx);minY=Math.min(minY,sy);maxX=Math.max(maxX,sx);maxY=Math.max(maxY,sy);
      }
      minX=Math.max(12,minX-8);minY=Math.max(12,minY-8);maxX=Math.min(width-12,maxX+8);maxY=Math.min(height-12,maxY+8);
      outline?.setAttribute('x',minX);outline?.setAttribute('y',minY);outline?.setAttribute('width',Math.max(8,maxX-minX));outline?.setAttribute('height',Math.max(8,maxY-minY));
      const endX=compact?width/2:width-150,endY=compact?height-142:height*.26+40;
      connector?.setAttribute('d',`M ${(minX+maxX)/2} ${minY} L ${(minX+maxX)/2} ${endY} L ${endX} ${endY}`);
    }
    if(nextStudy!==selected){selected=nextStudy;onStudy(selected);}
    renderer.render(scene,camera);
    host.dataset.frame=String(pose.frame);host.dataset.progress=pose.progress.toFixed(4);
    host.dataset.pointer=`${px.toFixed(3)},${py.toFixed(3)}`;
    host.dataset.hovered=hovered?.name||'';
    host.dataset.study=selected;
    if(first){first=false;ready();}
  }
  render();
  return ()=>{
    disposed=true;cancelAnimationFrame(raf);resizeObserver.disconnect();
    const geometries=new Set(),materials=new Set(),textures=new Set();
    scene.traverse(object=>{if(object.geometry)geometries.add(object.geometry);if(object.material)for(const m of [].concat(object.material))materials.add(m);});
    for(const g of geometries)g.dispose();for(const m of materials){for(const value of Object.values(m))if(value?.isTexture)textures.add(value);m.dispose();}
    for(const texture of textures)texture.dispose();
    shadowTexture.dispose();environment.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove();
  };
}
