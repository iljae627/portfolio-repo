export const SCENE_FRAMES = 1440;
export const clamp = value => Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
export function segment(progress, start, end) {
  const value = clamp((progress - start) / (end - start));
  return value * value * (3 - 2 * value);
}
// Pure poses: identical scroll positions always reconstruct identical geometry.
export function sampleMotion(kind, value) {
  const frame = Math.round(clamp(value) * SCENE_FRAMES);
  const p = frame / SCENE_FRAMES;
  return {frame, progress: p,
    unscrew: segment(p, .01, .08),
    park: segment(p, .08, .15),
    open: segment(p, .16, .42),
    lens: segment(p, .44, .64),
    lift: segment(p, .44, .68),
    spread: segment(p, .68, .92),
    scan: segment(p, .78, 1),
    turn: segment(p, 0, 1) * (kind === 'android' ? -.22 : .24),
  };
}

export function forensicLayout(p) {
  return {
    lens: {visible: p.lens > .001, x: 6 - p.lens * 2.85, y: .45 + p.lens * 1.25, z: 2.4 - p.lens * 2.4},
    screws: [[-1.65,-1.04],[1.65,-1.04],[-1.65,1.04],[1.65,1.04]].map(([x,y],i) => ({
      x: x + ((-2.8-(i%2)*.32)-x) * p.park, y: y + ((-.5+Math.floor(i/2)*.6)-y) * p.park,
      z: .51 + p.unscrew * (1.1+Math.floor(i/2)*.3),
    })),
  };
}

export function androidLayout(p) {
  return {
    screen: {x: -p.open * 1.15, z: .43 + p.open * .8},
    coreZ: .13 + p.spread * .10,
  };
}
