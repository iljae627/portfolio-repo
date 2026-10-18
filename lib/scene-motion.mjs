export const SCENE_FRAMES = 240;
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
    open: segment(p, .08, .42),
    lift: segment(p, .28, .66),
    spread: segment(p, .48, .9),
    scan: segment(p, .66, 1),
    turn: segment(p, 0, 1) * (kind === 'android' ? -.22 : .24),
  };
}
