import * as T from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {makeModel} from './interest-models';
import {sampleMotion} from '../lib/scene-motion.mjs';

export function mountScene(host, kind, control, ready) {
  const renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));
  renderer.outputColorSpace=T.SRGBColorSpace;
  renderer.toneMapping=T.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.15;
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=T.PCFShadowMap;
  const canvas=renderer.domElement;canvas.setAttribute('aria-hidden','true');host.appendChild(canvas);
  const scene=new T.Scene();
  const color=kind==='android'?0xeaf3ed:kind==='reversing'?0xe9edf7:0xf2ede5;
  scene.background=new T.Color(color);scene.fog=new T.Fog(color,19,44);
  const room=new RoomEnvironment();
  const pmrem=new T.PMREMGenerator(renderer);
  const environment=pmrem.fromScene(room,.04);
  scene.environment=environment.texture;scene.environmentIntensity=.8;
  room.dispose();pmrem.dispose();
  scene.add(new T.HemisphereLight(0xffffff,0xb7bfc8,1.8));
  const key=new T.DirectionalLight(0xfffaf2,3.6);key.position.set(-4,8,5);key.castShadow=true;
  key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-7;key.shadow.camera.right=7;
  key.shadow.camera.top=7;key.shadow.camera.bottom=-7;key.shadow.normalBias=.04;key.shadow.bias=-.0001;
  key.shadow.radius=4;scene.add(key);
  const rim=new T.DirectionalLight(0xd3e6ff,2);rim.position.set(5,5,-4);scene.add(rim);
  const floor=new T.Mesh(new T.PlaneGeometry(100,100),new T.MeshStandardMaterial({color,roughness:.82}));
  floor.rotation.x=-Math.PI/2;floor.position.y=-.035;floor.receiveShadow=true;scene.add(floor);
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
  let hovered=null,hoveredScale=new T.Vector3();
  const camera=new T.PerspectiveCamera(32,1,.1,80);
  const target=new T.Vector3(0,.9,0),direction=new T.Vector3(4.4,3.4,6.8).normalize();
  let distance=10, compact=false, width=1,height=1,progress=control.progress,px=0,py=0,raf=0,disposed=false,first=true,lastKey='';
  function resize(){
    width=host.clientWidth;height=host.clientHeight;if(!width||!height)return;
    compact=width<700;renderer.setSize(width,height,false);camera.aspect=width/height;
    const viewHeight=Math.max(kind==='android'?7.2:5.9,(kind==='android'?5.3:5.5)/camera.aspect);
    distance=viewHeight/(2*Math.tan(T.MathUtils.degToRad(camera.fov/2)));
    camera.position.copy(direction).multiplyScalar(distance).add(target);
    camera.lookAt(target);camera.setViewOffset(width,height,0,-height*.035,width,height);camera.updateProjectionMatrix();
    lastKey='';
  }
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);resize();
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  function render(){
    if(disposed)return;
    raf=requestAnimationFrame(render);
    if(!control.visible&&!first)return;
    if(document.visibilityState==='hidden')return;
    const reduced=motion.matches;
    const requested=reduced ? 0 : control.progress;
    progress+= (requested-progress)*.17;
    if(Math.abs(requested-progress)<.00015)progress=requested;
    px+=(reduced?0:control.pointerX-px)*.1;
    py+=(reduced?0:control.pointerY-py)*.1;
    if(reduced){px=0;py=0;}
    const pose=sampleMotion(kind,progress);
    const stateKey=`${pose.frame}:${px.toFixed(3)}:${py.toFixed(3)}:${control.pointerActive}:${width}:${height}`;
    if(stateKey===lastKey&&!first)return;
    lastKey=stateKey;
    if(hovered)hovered.scale.copy(hoveredScale);
    model.update(pose,compact);
    target.y=(kind==='android'?1.9:.9)+pose.open*.5;
    camera.position.copy(direction).multiplyScalar(distance*(1+pose.open*.045)).add(target);
    camera.lookAt(target);camera.updateMatrixWorld();
    pivot.rotation.y=px*.14;pivot.rotation.x=py*.065;
    pivot.position.x=px*.09;
    scene.updateMatrixWorld(true);
    hovered=null;
    if(control.pointerActive&&!reduced){
      mouse.set(control.pointerX,-control.pointerY);raycaster.setFromCamera(mouse,camera);
      hovered=raycaster.intersectObject(model.root,true).find(hit=>hit.object.isMesh)?.object;
      if(hovered){hoveredScale.copy(hovered.scale);hovered.scale.multiplyScalar(1.025);}
    }
    renderer.render(scene,camera);
    host.dataset.frame=String(pose.frame);host.dataset.progress=pose.progress.toFixed(4);
    host.dataset.pointer=`${px.toFixed(3)},${py.toFixed(3)}`;
    host.dataset.hovered=hovered?.name||'';
    if(first){first=false;ready();}
  }
  render();
  return ()=>{
    disposed=true;cancelAnimationFrame(raf);resizeObserver.disconnect();
    const geometries=new Set(),materials=new Set();
    scene.traverse(object=>{if(object.geometry)geometries.add(object.geometry);if(object.material)for(const m of [].concat(object.material))materials.add(m);});
    for(const g of geometries)g.dispose();for(const m of materials)m.dispose();
    shadowTexture.dispose();environment.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove();
  };
}
