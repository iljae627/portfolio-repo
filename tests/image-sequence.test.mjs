import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import sharp from 'sharp';
import {frameIndex,frameURL,sequencePose,compactPose,imageFit,partRegion,sceneKinds,SEQUENCE_FRAMES,SEQUENCE_VERSION,HDD_SCREW_HOLES} from '../lib/image-sequence.mjs';

test('scroll positions select bounded frames and reconstruct the same pose on reverse',()=>{
 assert.equal(frameIndex(NaN),0);assert.equal(frameIndex(-1),0);assert.equal(frameIndex(2),239);
 for(const kind of sceneKinds)for(let frame=0;frame<SEQUENCE_FRAMES;frame++){
  const pose=sequencePose(kind,frame);sequencePose(kind,239-frame);
  assert.deepEqual(sequencePose(kind,frame),pose);
  for(const part of pose.parts)for(const key of ['x','y','w','h','alpha','angle'])assert.ok(Number.isFinite(part[key]));
 }
});
test('parts move continuously between adjacent frames, including the amber candidate',()=>{
 for(const kind of sceneKinds)for(let frame=1;frame<SEQUENCE_FRAMES;frame++){
  const previous=sequencePose(kind,frame-1),next=sequencePose(kind,frame);
  for(let i=0;i<next.parts.length;i++){
   const a=previous.parts[i],b=next.parts[i];
   assert.equal(a.cell,b.cell);assert.equal(a.key,b.key);
   assert.ok(Math.hypot(b.x-a.x,b.y-a.y)<20,`${kind}/${frame}/${b.key} jumped`);
   assert.ok(Math.abs(a.alpha-b.alpha)<.05);
  }
 }
 const initial=sequencePose('fuzzing',0).parts.find(p=>p.key==='candidate');
 assert.equal(initial.alpha,1);
});
test('mobile poses and fit map interactive hit regions into the same raster coordinates',()=>{
 const pose=compactPose(sequencePose('android',239)),fit=imageFit(375,778,true);
 for(const part of pose.parts){const region=partRegion(part,fit);assert.ok(region.width>0&&region.height>0);assert.ok(Number.isFinite(region.x+region.y));}
 assert.ok(fit.x>=0&&fit.y>=0);
 assert.ok(frameURL('forensics',5,true).endsWith('/small/005.webp'));
});
test('all three raster scenes have 240 decodable desktop and mobile frames, without missing ends',async()=>{
 const root=`public/sequences/${SEQUENCE_VERSION,HDD_SCREW_HOLES}`;
 for(const kind of sceneKinds){
  for(const small of [false,true]){
   const dir='public'+frameURL(kind,0,small).slice(0,-'000.webp'.length);
   const files=(await fs.readdir(dir)).filter(f=>f.endsWith('.webp'));
   assert.equal(files.length,SEQUENCE_FRAMES);
   for(let frame=0;frame<SEQUENCE_FRAMES;frame++){
    const path='public'+frameURL(kind,frame,small),m=await sharp(path).metadata();
    assert.equal(m.width,small?640:1280);assert.equal(m.height,832);assert.equal(m.format,'webp');
   }
  }
 }
});

test('six screw heads start on the actual cover holes and clear before the lid moves',()=>{
 const initial=sequencePose('forensics',0),heads=initial.parts.filter(p=>p.key.startsWith('screw-head'));
 assert.equal(heads.length,6);
 for(let i=0;i<heads.length;i++)assert.deepEqual([heads[i].x,heads[i].y],HDD_SCREW_HOLES[i]);
 const removed=sequencePose('forensics',Math.floor(.4*239));
 assert.ok(removed.parts.filter(p=>p.key.startsWith('screw-head')).every(p=>p.alpha===0));
 assert.ok(removed.parts.find(p=>p.key==='cover').angle===0);
});
test('Android frames have no separate floating shield',()=>{
 for(let i=0;i<240;i++)assert.ok(sequencePose('android',i).parts.every(p=>p.key!=='shield'));
});
