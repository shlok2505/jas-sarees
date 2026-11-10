/** Morphing almond clip paths for Durga’s eyes. t=0 closed, t=1 open. */

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function smooth(t: number) {
  return t * t * (3 - 2 * t);
}

/**
 * Centre of each lid opens first; corners lag, so the fissure
 * grows from the middle of the eye outwards.
 */
export function leftEyeClip(t: number) {
  const o = smooth(t);
  const mid = smooth(Math.min(1, t * 1.25));

  const ox = lerp(128, 108, o * 0.4);
  const oy = lerp(222, 198, o * 0.45);
  const ix = lerp(268, 274, o * 0.2);
  const iy = lerp(246, 238, o * 0.3);

  const upperX = 186;
  const upperY = lerp(232, 170, mid);
  const lowerX = 188;
  const lowerY = lerp(238, 252, o * 0.7);

  return `M ${ox.toFixed(1)} ${oy.toFixed(1)} Q ${upperX} ${upperY.toFixed(1)} ${ix.toFixed(1)} ${iy.toFixed(1)} Q ${lowerX} ${lowerY.toFixed(1)} ${ox.toFixed(1)} ${oy.toFixed(1)} Z`;
}

export function rightEyeClip(t: number) {
  const o = smooth(t);
  const mid = smooth(Math.min(1, t * 1.25));

  const ox = lerp(472, 492, o * 0.4);
  const oy = lerp(222, 198, o * 0.45);
  const ix = lerp(332, 326, o * 0.2);
  const iy = lerp(246, 238, o * 0.3);

  const upperX = 414;
  const upperY = lerp(232, 170, mid);
  const lowerX = 412;
  const lowerY = lerp(238, 252, o * 0.7);

  return `M ${ox.toFixed(1)} ${oy.toFixed(1)} Q ${upperX} ${upperY.toFixed(1)} ${ix.toFixed(1)} ${iy.toFixed(1)} Q ${lowerX} ${lowerY.toFixed(1)} ${ox.toFixed(1)} ${oy.toFixed(1)} Z`;
}

export function leftClosedSeam() {
  return "M 128 222 Q 186 238 268 246";
}

export function rightClosedSeam() {
  return "M 472 222 Q 414 238 332 246";
}

export function leftUpperLid(t: number) {
  const o = smooth(t);
  const mid = smooth(Math.min(1, t * 1.25));
  const ox = lerp(128, 108, o * 0.4);
  const oy = lerp(222, 198, o * 0.45);
  const ix = lerp(268, 274, o * 0.2);
  const iy = lerp(246, 238, o * 0.3);
  const upperY = lerp(232, 170, mid);
  return `M ${ox.toFixed(1)} ${oy.toFixed(1)} Q 186 ${upperY.toFixed(1)} ${ix.toFixed(1)} ${iy.toFixed(1)}`;
}

export function rightUpperLid(t: number) {
  const o = smooth(t);
  const mid = smooth(Math.min(1, t * 1.25));
  const ox = lerp(472, 492, o * 0.4);
  const oy = lerp(222, 198, o * 0.45);
  const ix = lerp(332, 326, o * 0.2);
  const iy = lerp(246, 238, o * 0.3);
  const upperY = lerp(232, 170, mid);
  return `M ${ox.toFixed(1)} ${oy.toFixed(1)} Q 414 ${upperY.toFixed(1)} ${ix.toFixed(1)} ${iy.toFixed(1)}`;
}
