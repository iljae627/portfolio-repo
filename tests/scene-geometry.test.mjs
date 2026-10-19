import test from 'node:test';
import assert from 'node:assert/strict';
import {Box3} from 'three';
import {buildAndroid,buildForensics,buildWeb3,buildFuzzing} from '../components/interest-models.js';
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
