import test from 'node:test';
import assert from 'node:assert/strict';
import {Box3,Raycaster,Vector3} from 'three';
import {buildAndroid,buildForensics,buildWeb3,buildFuzzing,makeModel} from '../components/interest-models.js';
import {sampleMotion,SCENE_FRAMES} from '../lib/scene-motion.mjs';

test('phone contains no transmissive film and retains a flat display',()=>{
  const model=buildAndroid();
  assert.equal(model.parts.display.geometry.type,'PlaneGeometry');
  model.root.traverse(object=>{if(object.isMesh)assert.ok(!(object.material.transmission>0),'Unexpected glass film');});
  for(let i=0;i<=SCENE_FRAMES;i++){
    const pose=sampleMotion('android',i/SCENE_FRAMES);model.update(pose,false);
    model.root.rotation.set(0,0,0);model.parts.circuit.parent.rotation.set(0,0,0);model.root.updateMatrixWorld(true);
    if(pose.open>.9) assert.ok(!new Box3().setFromObject(model.parts.core).intersectsBox(new Box3().setFromObject(model.parts.screen)),`screen frame ${i}`);
  }
});

test('opened lid clears parked screws, and the incoming lens clears the board and chips',()=>{
  const model=buildForensics();
  for(let i=0;i<=SCENE_FRAMES;i++){
    const pose=sampleMotion('forensics',i/SCENE_FRAMES);model.update(pose,false);
    model.root.rotation.set(0,0,0);model.root.updateMatrixWorld(true);
    if(pose.open>.01){
      const lid=new Box3().setFromObject(model.parts.lid);
      for(const screw of model.parts.screws)assert.ok(!lid.intersectsBox(new Box3().setFromObject(screw)),`screw frame ${i}`);
    }
    if(model.parts.lens.visible){
      const lens=new Box3().setFromObject(model.parts.lens);
      assert.ok(!lens.intersectsBox(new Box3().setFromObject(model.parts.circuit)),`lens frame ${i}`);
    }
  }
});

test('Web3 lid clears the contract throughout opening and unfolding',()=>{
 const m=buildWeb3();
 for(let i=0;i<=SCENE_FRAMES;i++){
  m.update(sampleMotion('web3',i/SCENE_FRAMES));m.root.rotation.set(0,0,0);m.root.updateMatrixWorld(true);
  assert.ok(!new Box3().setFromObject(m.parts.lid).intersectsBox(new Box3().setFromObject(m.parts.contract)),`contract frame ${i}`);
 }
});
test('fuzzing crash clears both end caps throughout the sequence',()=>{
 const m=buildFuzzing();
 for(let i=0;i<=SCENE_FRAMES;i++){
  m.update(sampleMotion('fuzzing',i/SCENE_FRAMES));m.root.rotation.set(0,0,0);m.root.updateMatrixWorld(true);
  for(const cap of m.parts.caps)assert.ok(!new Box3().setFromObject(m.parts.crash).intersectsBox(new Box3().setFromObject(cap)),`cap frame ${i}`);
 }
});
test('new models reconstruct identical mesh transforms when reversing',()=>{
 for(const [kind,build] of [['web3',buildWeb3],['fuzzing',buildFuzzing]]){
  const m=build();const snapshot=()=>{const result=[];m.root.traverse(o=>{if(o.isMesh)result.push([...o.position.toArray(),...o.rotation.toArray().slice(0,3)]);});return result;};
  m.update(sampleMotion(kind,.6));const expected=snapshot();m.update(sampleMotion(kind,1));m.update(sampleMotion(kind,.6));assert.deepEqual(snapshot(),expected);
 }
});

test('optical housings use physical transmission without alpha fading',()=>{
 for(const kind of ['forensics','reversing','web3','fuzzing']){
  let optical=0;makeModel(kind).root.traverse(o=>{if(o.isMesh&&o.material.transmission>0){optical++;assert.equal(o.material.opacity,1);assert.equal(o.material.transparent,false);assert.ok(o.material.thickness>0);}});assert.ok(optical>0,kind);
 }
});
test('every detailed model has finite bounded geometry when assembled and exploded',()=>{
 for(const kind of ['forensics','android','reversing','web3','fuzzing']){
  const m=makeModel(kind);
  for(const p of [0,.3,.6,1]){
   m.update(sampleMotion(kind,p),false);m.root.updateMatrixWorld(true);const bounds=new Box3().setFromObject(m.root);
   for(const point of [bounds.min,bounds.max])for(const value of point.toArray())assert.ok(Number.isFinite(value)&&Math.abs(value)<12,kind);
  }
 }
});

test('four screw positions are genuine through bores with intact surrounding metal',()=>{
 const m=buildForensics();m.update(sampleMotion('forensics',0));m.root.updateMatrixWorld(true);
 const axis=new Vector3(0,0,1).transformDirection(m.parts.lidPlate.matrixWorld),ray=new Raycaster();
 for(const screw of m.parts.screws){
  const center=screw.getWorldPosition(new Vector3()),origin=center.clone().addScaledVector(axis,1);
  ray.set(origin,axis.clone().negate());assert.equal(ray.intersectObject(m.parts.lid,true).length,0,'screw bore must pass through the lid');
  const offset=new Vector3(.095,0,0).transformDirection(m.parts.lidPlate.matrixWorld).multiplyScalar(.095);
  ray.set(origin.clone().add(offset),axis.clone().negate());assert.ok(ray.intersectObject(m.parts.lidPlate).length>0,'metal must remain outside the screw head');
 }
});
test('closed phone screen contacts the surrounding chassis while clearing the chip',()=>{
 const m=buildAndroid();m.update(sampleMotion('android',0),false);m.root.rotation.set(0,0,0);m.parts.frame.parent.rotation.set(0,0,0);m.root.updateMatrixWorld(true);
 const screen=new Box3().setFromObject(m.parts.screen),frame=new Box3().setFromObject(m.parts.frame),chip=new Box3().setFromObject(m.parts.core);
 assert.ok(screen.min.z<=frame.max.z+.002,'no initial air gap at the screen rim');
 assert.ok(screen.min.z>chip.max.z,'chip remains behind the display');
});
test('fuzzing candidate is a visible corpus cube and moves continuously without refraction artifacts',()=>{
 const m=buildFuzzing();let previous;
 assert.equal(m.parts.tokens.length+1,18);assert.equal(m.parts.crash.material.transmission,0);
 for(let i=0;i<=SCENE_FRAMES;i++){
  const pose=sampleMotion('fuzzing',i/SCENE_FRAMES);m.update(pose);
  if(previous)assert.ok(m.parts.crash.position.distanceTo(previous)<.02,`jump at frame ${i}`);
  previous=m.parts.crash.position.clone();assert.equal(m.parts.crash.visible,true);
  if(pose.open===0)assert.equal(m.parts.crash.scale.x,1);
 }
});

test('HDD lower threaded bosses align with the lid screws and have smaller deep bores',()=>{
 const m=buildForensics();m.update(sampleMotion('forensics',0));m.root.updateMatrixWorld(true);
 assert.equal(m.parts.baseBores.length,4);
 for(let i=0;i<4;i++){
  const boss=m.parts.baseBores[i];assert.equal(boss.position.x,m.parts.screws[i].position.x);assert.equal(boss.position.y,m.parts.screws[i].position.y);
  const axis=new Vector3(0,0,1).transformDirection(boss.matrixWorld),origin=boss.getWorldPosition(new Vector3()).addScaledVector(axis,.5),ray=new Raycaster(origin,axis.clone().negate());
  assert.equal(ray.intersectObject(boss,true).length,0,'threaded bore is open along its axis');
  const stem=m.parts.screws[i].children.find(o=>o.geometry?.parameters?.radiusTop===.028);
  const tip=boss.worldToLocal(new Vector3(0,-stem.geometry.parameters.height/2,0).applyMatrix4(stem.matrixWorld));
  assert.ok(tip.z<.135&&tip.z>-.135,'tightened screw enters the boss without reaching its bottom');
  const offset=new Vector3(1,0,0).transformDirection(boss.matrixWorld).multiplyScalar(.06);ray.set(origin.add(offset),axis.clone().negate());assert.ok(ray.intersectObject(boss,true).length>0,'boss metal surrounds the opening');
 }
});
test('phone main body has a contemporary thin profile with an assembled display',()=>{
 const m=buildAndroid();m.update(sampleMotion('android',0),false);m.root.rotation.set(0,0,0);m.parts.phone.rotation.set(0,0,0);m.root.updateMatrixWorld(true);
 const bounds=new Box3().setFromObject(m.parts.frame);bounds.union(new Box3().setFromObject(m.parts.back));bounds.union(new Box3().setFromObject(m.parts.screen));
 const size=bounds.getSize(new Vector3());assert.ok(size.z/size.x<.105,`depth/width ${size.z/size.x}`);
 const battery=new Box3().setFromObject(m.parts.battery),mainboard=new Box3().setFromObject(m.parts.mainboard),charger=new Box3().setFromObject(m.parts.chargingBoard);
 assert.ok(battery.max.y<mainboard.min.y);assert.ok(battery.min.y>charger.max.y);
});

test('HDD actuator has a real opening in its tapered arm',()=>{
 const m=buildForensics();m.update(sampleMotion('forensics',0));m.root.updateMatrixWorld(true);
 const arm=m.parts.headArm,axis=new Vector3(0,0,1).transformDirection(arm.matrixWorld);
 const origin=arm.localToWorld(new Vector3(-.58,.3666667,1));const ray=new Raycaster(origin,axis.clone().negate());
 assert.equal(ray.intersectObject(arm).length,0);
 ray.set(arm.localToWorld(new Vector3(-.15,.03,1)),axis.clone().negate());assert.ok(ray.intersectObject(arm).length>0);
});
