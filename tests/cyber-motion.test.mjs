import test from 'node:test';
import assert from 'node:assert/strict';
import {cyberPose,rainHead,rainGlyph,CYBER_FRAMES} from '../lib/cyber-motion.mjs';
test('code rain and browser changes follow scroll and reverse to the identical state',()=>{
 for(const kind of ['reversing','web','fuzzing'])for(let f=0;f<=CYBER_FRAMES;f++){
  const p=f/CYBER_FRAMES,pose=cyberPose(kind,p);cyberPose(kind,1-p);assert.deepEqual(cyberPose(kind,p),pose);
  assert.ok(pose.slices.every(Number.isFinite));
 }
 assert.notEqual(rainHead(3,.3,700),rainHead(3,.4,700));
 assert.equal(rainHead(3,.3,700),rainHead(3,.3,700));assert.equal(rainGlyph(3,2),rainGlyph(3,2));
});
test('web starts intact and becomes modified only as the user scrolls',()=>{
 const first=cyberPose('web',0),last=cyberPose('web',1);
 assert.equal(first.attack,0);assert.equal(first.modified,0);assert.equal(first.status,'200 OK');
 assert.ok(first.slices.every(x=>x===0));assert.equal(last.attack,1);assert.equal(last.modified,1);assert.equal(last.status,'PAGE MODIFIED');
});
test('reduced motion keeps normal content and disables falling code or distortion',()=>{
 for(const kind of ['reversing','web','fuzzing'])assert.deepEqual(cyberPose(kind,.9,true),cyberPose(kind,0));
});
test('fuzzing mutates input before coverage changes and reveals the crash last',()=>{
 const first=cyberPose('fuzzing',0),middle=cyberPose('fuzzing',.5),last=cyberPose('fuzzing',1);
 assert.equal(first.input,0);assert.equal(first.coverage,0);assert.equal(first.crash,0);
 assert.notDeepEqual(first.bytes,middle.bytes);assert.ok(middle.coverage>0);assert.equal(middle.crash,0);
 assert.equal(last.crash,1);assert.equal(last.coverage,1);assert.deepEqual(cyberPose('fuzzing',0),first);
});
