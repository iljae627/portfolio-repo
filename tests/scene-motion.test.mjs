import test from 'node:test';
import assert from 'node:assert/strict';
import {sampleMotion, SCENE_FRAMES,forensicLayout,androidLayout} from '../lib/scene-motion.mjs';

test('scroll poses reconstruct identically when scrubbing backwards or holding', () => {
  for (const kind of ['forensics', 'android', 'reversing']) {
    const forward = Array.from({length: SCENE_FRAMES + 1}, (_, i) => sampleMotion(kind, i / SCENE_FRAMES));
    for (let i = SCENE_FRAMES; i >= 0; i--) {
      assert.deepEqual(sampleMotion(kind, i / SCENE_FRAMES), forward[i]);
      assert.deepEqual(sampleMotion(kind, i / SCENE_FRAMES), forward[i]);
    }
  }
});

test('mechanical stages unfold in order and remain bounded', () => {
  let previous = sampleMotion('forensics', 0);
  assert.equal(previous.open, 0);
  assert.equal(sampleMotion('forensics', .2).lift, 0);
  assert.equal(sampleMotion('forensics', .4).spread, 0);
  assert.equal(sampleMotion('forensics', .6).scan, 0);
  for (let i = 1; i <= SCENE_FRAMES; i++) {
    const pose = sampleMotion('forensics', i / SCENE_FRAMES);
    for (const stage of ['open', 'lift', 'spread', 'scan']) {
      assert.ok(pose[stage] >= previous[stage] && pose[stage] <= 1);
    }
    previous = pose;
  }
  for (const stage of ['open', 'lift', 'spread', 'scan']) assert.equal(previous[stage], 1);
});

test('out-of-range and invalid scroll positions produce safe poses', () => {
  for (const value of [-4, NaN, undefined, Infinity]) assert.equal(sampleMotion('android', value).frame, 0);
  assert.equal(sampleMotion('android', 4).frame, SCENE_FRAMES);
  assert.equal(sampleMotion('android', 1).turn, -.22);
});

test('screws park before opening and the lens only enters after the lid is fully open', () => {
  for(let i=0;i<=SCENE_FRAMES;i++) {
    const p=sampleMotion('forensics',i/SCENE_FRAMES),layout=forensicLayout(p);
    if(p.open>0) {assert.equal(p.unscrew,1);assert.equal(p.park,1);}
    if(layout.lens.visible) {assert.equal(p.open,1);assert.ok(layout.lens.x>=3.15);}
  }
});

test('phone layers move to their own lane before the chipset lifts', () => {
  for(let i=0;i<=SCENE_FRAMES;i++) {
    const p=sampleMotion('android',i/SCENE_FRAMES),layout=androidLayout(p);
    assert.ok(layout.layers[0].z>.30);
    if(p.spread>0) assert.ok(layout.layers.every(layer=>layer.x>=2.75));
    assert.ok(layout.coreZ<=.23);
  }
});
