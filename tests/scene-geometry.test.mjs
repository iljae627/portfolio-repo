import test from 'node:test';
import assert from 'node:assert/strict';
import {Box3} from 'three';
import {buildAndroid,buildForensics} from '../components/interest-models.js';
import {sampleMotion,SCENE_FRAMES} from '../lib/scene-motion.mjs';

test('phone glass does not intersect the physical chipset through the full sequence',()=>{
  const model=buildAndroid();
  assert.equal(model.parts.display.geometry.type,'PlaneGeometry');
  for(let i=0;i<=SCENE_FRAMES;i++){
    model.update(sampleMotion('android',i/SCENE_FRAMES),false);
    // Test in the phone frame: a rotated world AABB can enclose empty space.
    model.root.rotation.set(0,0,0);model.parts.circuit.parent.rotation.set(0,0,0);
    model.root.updateMatrixWorld(true);
    const chip=new Box3().setFromObject(model.parts.core);
    for(const layer of model.parts.layers)assert.ok(!chip.intersectsBox(new Box3().setFromObject(layer)),`frame ${i}`);
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
