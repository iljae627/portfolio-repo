import test from 'node:test';
import assert from 'node:assert/strict';
import {sampleMotion, SCENE_FRAMES} from '../lib/scene-motion.mjs';

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
