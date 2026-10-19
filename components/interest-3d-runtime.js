import * as T from 'three';
import {HDRLoader} from 'three/addons/loaders/HDRLoader.js';
import {Reflector} from 'three/addons/objects/Reflector.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {makeModel} from './interest-models';
import {sampleMotion} from '../lib/scene-motion.mjs';
import {marbleSurface,foliageShadow} from './studio-surfaces.js';

export function mountScene(host, kind, control, ready, onStudy = ()=>{}) {
  const renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,window.innerWidth<700?1.5:2));
  renderer.outputColorSpace=T.SRGBColorSpace;
  renderer.toneMapping=T.AgXToneMapping;
  renderer.toneMappingExposure=1.05;
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=T.VSMShadowMap;
  const canvas=renderer.domElement;canvas.setAttribute('aria-hidden','true');host.appendChild(canvas);
  const scene=new T.Scene();
  const color=0xe8e0d1;
  scene.background=new T.Color(color);scene.fog=new T.Fog(color,27,60);
  const room=new RoomEnvironment();
  const pmrem=new T.PMREMGenerator(renderer);
  const environment=pmrem.fromScene(room,.04);
  scene.environment=environment.texture;scene.environmentIntensity=.85;
  room.dispose();pmrem.dispose();
  scene.add(new T.HemisphereLight(0xfffbf3,0x554737,.22));
  const key=new T.DirectionalLight(0xfff0db,3.8);key.position.set(-3,8,2);key.castShadow=true;
  key.shadow.mapSize.set(window.innerWidth<700?1024:2048,window.innerWidth<700?1024:2048);key.shadow.camera.left=-7;key.shadow.camera.right=7;
  key.shadow.camera.top=7;key.shadow.camera.bottom=-7;key.shadow.normalBias=.04;key.shadow.bias=-.0001;
  key.shadow.radius=5;key.shadow.blurSamples=8;scene.add(key);
  const rim=new T.DirectionalLight(0xdbeaff,.65);rim.position.set(5,5,-4);scene.add(rim);
  const floorMap=marbleSurface();
  const floor=new T.Mesh(new T.PlaneGeometry(100,100),new T.MeshPhysicalMaterial({color:new T.Color(1.55,1.48,1.33),map:floorMap,roughness:.23,metalness:.02,clearcoat:.45,clearcoatRoughness:.23,transparent:true,opacity:.88,depthWrite:false}));
  floor.rotation.x=-Math.PI/2;floor.position.y=-.035;floor.receiveShadow=true;scene.add(floor);
  // Low resolution planar reflection is blended through the marble finish.
  // Rendering stays scroll-driven; there is no continuous reflection update at rest.
  const reflection=new Reflector(new T.PlaneGeometry(100,100),{textureWidth:window.innerWidth<700?384:768,textureHeight:window.innerWidth<700?384:768,clipBias:.006,color:0xbdb8b0,multisample:0});
  reflection.rotation.x=-Math.PI/2;reflection.position.y=-.047;scene.add(reflection);
  // Continuous curved cyclorama removes the flat floor/wall horizon.
  const positions=[],indices=[];
  for(let i=0;i<=65;i++){
    const angle=Math.min(i,64)/64*Math.PI/2;
    const y=i===65?22:4*(1-Math.cos(angle));const z=-5-4*Math.sin(angle);
    positions.push(-35,y,z,35,y,z);
    if(i<65){const v=i*2;indices.push(v,v+1,v+2,v+1,v+3,v+2);}
  }
  const backdropGeometry=new T.BufferGeometry();backdropGeometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));backdropGeometry.setIndex(indices);backdropGeometry.computeVertexNormals();
  const wall=new T.Mesh(backdropGeometry,new T.MeshStandardMaterial({color:0xe4d7bf,roughness:.8}));wall.receiveShadow=true;scene.add(wall);
  const leavesTexture=foliageShadow();
  const leaves=new T.Mesh(new T.PlaneGeometry(11,7),new T.MeshBasicMaterial({map:leavesTexture,transparent:true,depthWrite:false,opacity:.7}));
  leaves.rotation.x=-Math.PI/2;leaves.rotation.z=-.45;leaves.position.set(1,-.028,-3.7);scene.add(leaves);
  const wallLeaves=new T.Mesh(new T.PlaneGeometry(13,10),leaves.material.clone());wallLeaves.position.set(-1,7,-8.98);wallLeaves.material.opacity=1;scene.add(wallLeaves);
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
  const loadedTextures=new Set();let hdrTarget=null;
  new HDRLoader().load('/textures/studio/studio.hdr',texture=>{
    if(disposed){texture.dispose();return;}
    const generator=new T.PMREMGenerator(renderer);hdrTarget=generator.fromEquirectangular(texture);generator.dispose();texture.dispose();
    scene.environment=hdrTarget.texture;scene.environmentRotation.y=.6;
    host.dataset.lighting='hdri';lastKey='';
  },undefined,()=>{host.dataset.lighting='studio-fallback';});
  const textureLoader=new T.TextureLoader();
  for(const [file,slot] of [['marble-color.jpg','map'],['marble-normal.jpg','normalMap'],['marble-rough.jpg','roughnessMap']]){
    textureLoader.load('/textures/studio/'+file,texture=>{
      if(disposed){texture.dispose();return;}
      loadedTextures.add(texture);texture.wrapS=texture.wrapT=T.ClampToEdgeWrapping;texture.repeat.set(.23,.19);texture.offset.set(.335,.475);texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
      if(slot==='map')texture.colorSpace=T.SRGBColorSpace;
      floor.material[slot]=texture;floor.material.normalScale.set(.13,.13);floor.material.needsUpdate=true;lastKey='';
    });
  }
  host.dataset.quality='optical-studio-v2';
  function resize(){
    width=host.clientWidth;height=host.clientHeight;if(!width||!height)return;
    compact=width<700;renderer.setPixelRatio(Math.min(window.devicePixelRatio,compact?1.5:2));renderer.setSize(width,height,false);camera.aspect=width/height;
    const viewHeight=Math.max(kind==='android'?6.8:5.8,(kind==='android'?6.1:6.8)/camera.aspect);
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
    const renderStart=performance.now();
    renderer.render(scene,camera);
    host.dataset.renderMs=(performance.now()-renderStart).toFixed(1);
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
    shadowTexture.dispose();environment.dispose();hdrTarget?.dispose();for(const texture of loadedTextures)texture.dispose();floorMap.dispose();reflection.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove();
  };
}
