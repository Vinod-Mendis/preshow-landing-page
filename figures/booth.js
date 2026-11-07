/*
 * booth.js: shared by the three "How it works" figures, and put between kit.js
 * and each of them by build.mjs. The booth and its screens, in world units of
 * 16 to the metre. Every figure draws the same booth with the same camera, so
 * the three read as one sequence.
 */
const M = 16, BW = 144, BD = 80, WT = 5, WH = 42, GZ = -4, TX = 9, S = 1.72;
/** The booth's solids at full size: x0, y0, x1, y1, corner, crease, z0, z1. ORDER paints them back to front. */
const PARTS = {
  plinth: [0, 0, BW, BD, 6, 1.8, GZ, 0],
  wall: [0, 0, BW, WT, 2, 0.9, 0, WH],
  fascia: [0, 0, BW, 11, 2, 0.9, WH, WH + 6],
  pot: [129, 11, 139, 21, 5, 0.9, 0, 9],
  foot: [2, 35, 16, 61, 2, 0.8, 0, 1.6],
  totem: [4, 38, TX, 58, 1.5, 0.7, 1.6, 36],
  desk: [100, 51, 130, 63, 2.5, 1, 0, 17],
  top: [97, 48, 133, 66, 3, 1.2, 17, 19.5],
};
const ORDER = ["plinth", "wall", "fascia", "pot", "foot", "totem", "desk", "top"];
const BUSH = [134, 16, 15.5, 6.2]; // the plant over its pot: x, y, z, radius
const FIT = [[0, 0, GZ], [BW, 0, GZ], [0, BD, GZ], [BW, BD, GZ], [0, 0, WH + 6], [BW, 0, WH + 6], [20, 100, GZ], [20, 100, 26.5]];

/** Part p's paths at scale s about the footprint's middle, standing on z = base. */
function partPaths(P, front, [x0, y0, x1, y1, r, b, z0, z1], s = 1, base = GZ) {
  const X = (x) => BW / 2 + (x - BW / 2) * s, Y = (y) => BD / 2 + (y - BD / 2) * s, Z = (z) => base + (z - GZ) * s;
  const [ring, inner] = rings(X(x0), Y(y0), X(x1), Y(y1), r * s, b * s);
  return prism(P, front, ring, inner, Z(z0), Z(z1));
}

/** The camera every figure uses. */
function camera() {
  const C = Cam(45, 0.5, S);
  fit(C, FIT, 200, 166);
  return { C, P: proj(C), front: facing(C) };
}

/**
 * The booth at full size, painted into g. hooks.floor draws on the floor, hooks.wall the wall's
 * screens, hooks.totem the totem's screen, each at its place in the paint order. Returns the
 * desk's group, so a figure can paint something in front of it or behind it.
 */
function booth(P, front, g, hooks = {}) {
  const part = (k, parent = g) => put(solid(parent), partPaths(P, front, PARTS[k]));
  part("plinth"); hooks.floor?.(g);
  part("wall");
  mk("path", { d: seg(P(2, WT + 0.4, 0), P(BW - 2, WT + 0.4, 0)), class: "nf lo" }, g);
  part("fascia"); hooks.wall?.(g);
  part("pot");
  const b = P(BUSH[0], BUSH[1], BUSH[2]);
  mk("ellipse", { cx: b[0], cy: b[1], rx: r2(BUSH[3] * S), ry: r2(BUSH[3] * S * 0.86), class: "sil" }, g);
  part("foot"); part("totem"); hooks.totem?.(g);
  const desk = mk("g", {}, g);
  part("desk", desk); part("top", desk);
  return desk;
}

const onWall = (u, v, o = 0) => [u, WT + o, v], onTotem = (u, v, o = 0) => [TX + o, u, v];
/** Left to right on screen: the totem, the banner, the main screen. u runs along the face, v up it. */
const SCREENS = [
  { at: onTotem, u0: 40, u1: 56, v0: 5, v1: 33.4, kind: "video", name: "9:16", foot: [TX, 48] },
  { at: onWall, u0: 14, u1: 52, v0: 22, v1: 37.6, kind: "video", name: "21:9", foot: [33, WT] },
  { at: onWall, u0: 64, u1: 106, v0: 11, v1: 34.6, kind: "web", name: "16:9", foot: [85, WT] },
];
