/**
 * Aurelle logo geometry (120 x 120 viewBox): a mirror-shaped arch holding a monogram "A"
 * whose crossbar is a flowing strand of hair, with a small spark.
 * Lengths are computed so the logo can "draw itself" with stroke animation.
 */
type P = [number, number];

const bezier = (p0: P, p1: P, p2: P, p3: P, t: number): P => {
  const u = 1 - t;
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ];
};
const bezierLength = (p0: P, p1: P, p2: P, p3: P) => {
  let len = 0;
  let prev = p0;
  for (let i = 1; i <= 80; i++) {
    const cur = bezier(p0, p1, p2, p3, i / 80);
    len += Math.hypot(cur[0] - prev[0], cur[1] - prev[1]);
    prev = cur;
  }
  return len;
};

const WAVE: [P, P, P, P] = [[49.5, 76], [56, 63], [62, 89], [70.5, 76]];

/** 4-point spark centred on (cx, cy) with outer radius r. */
const star = (cx: number, cy: number, r: number) => {
  const a = r * 0.26;
  return `M${cx} ${cy - r} L${cx + a} ${cy - a} L${cx + r} ${cy} L${cx + a} ${cy + a} L${cx} ${cy + r} L${cx - a} ${cy + a} L${cx - r} ${cy} L${cx - a} ${cy - a} Z`;
};
const LEG = Math.hypot(16, 54);

export const LOGO = {
  viewBox: 120,
  arch: { d: 'M20 98 V52 A40 40 0 0 1 100 52 V98', length: 46 + Math.PI * 40 + 46 },
  inner: { d: 'M28 98 V54 A32 32 0 0 1 92 54 V98', length: 44 + Math.PI * 32 + 44 },
  legs: { d: 'M44 94 L60 40 L76 94', length: LEG * 2 },
  wave: { d: `M${WAVE[0]} C${WAVE[1]} ${WAVE[2]} ${WAVE[3]}`, length: bezierLength(...WAVE) },
  base: { d: 'M12 104 H108', length: 96 },
  spark: star(104, 16, 8),
  sparkCenter: [104, 16] as P,
};
