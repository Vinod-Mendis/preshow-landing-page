/*
 * kit.js: shared by every Pre-show figure, and put in front of each one by
 * build.mjs. The kernel's calls, plus what the figures draw again and again:
 * rounded boxes, screens and what they play, framed works, and people.
 */
const {
  Cam, clamp, facing, fit, flatDot, hull, lerp, mk, open, place, pointer, poly, prism, proj, put,
  register, rings, ringAt, rrect, r2, run, seg, solid, disposer, spring, stepS, tween, tset, tval,
  tdone, unproj,
} = HL;

/** A camera at scale s, fitted to the points so their box sits on (200, cy). */
function cam(s, pts, cy = 166) {
  const C = Cam(45, 0.5, s);
  fit(C, pts, 200, cy);
  return { C, P: proj(C), front: facing(C), s };
}

/** A rounded box's paths: [x0, y0, x1, y1, corner, crease, z0, z1], moved by (dx, dy, dz). */
function boxPaths(P, front, [x0, y0, x1, y1, r, b, z0, z1], dx = 0, dy = 0, dz = 0) {
  const [ring, inner] = rings(x0 + dx, y0 + dy, x1 + dx, y1 + dy, r, b);
  return prism(P, front, ring, inner, z0 + dz, z1 + dz);
}
/** A rounded box drawn into parent, as a solid. */
function box(P, front, parent, spec) {
  const s = solid(parent);
  put(s, boxPaths(P, front, spec));
  return s;
}
/** A round column of radius r at (x, y), from z0 to z1. */
const col = (x, y, r, z0, z1) => [x - r, y - r, x + r, y + r, r, Math.min(0.8, r * 0.4), z0, z1];

/** Flat things on a face: one facing +y at y, or +x at x. u runs along the face, v up it, o off it. */
const faceY = (y) => (u, v, o = 0) => [u, y + o, v];
const faceX = (x) => (u, v, o = 0) => [x + o, u, v];

/** What a screen plays, in its glass's own 0..1 square: q(a, b) gives the screen point. */
const PLAYS = {
  // a page: a nav bar with its links, a headline, and a row of three cards
  web: (q, box) => seg(q(0, 0.86), q(1, 0.86)) + seg(q(0.62, 0.93), q(0.7, 0.93)) + seg(q(0.76, 0.93), q(0.84, 0.93)) +
    seg(q(0.9, 0.93), q(1, 0.93)) + seg(q(0, 0.68), q(0.56, 0.68)) + seg(q(0, 0.57), q(0.36, 0.57)) +
    box(0, 0.06, 0.3, 0.42) + box(0.35, 0.06, 0.65, 0.42) + box(0.7, 0.06, 1, 0.42),
  // a frame of film: hills under a sun, and the progress bar with its playhead
  video: (q, _box, aspect) => {
    const sun = [];
    for (let k = 0; k < 10; k++) sun.push(q(0.76 + Math.cos(k * 0.628) * 0.07, 0.74 + Math.sin(k * 0.628) * 0.07 * aspect));
    return "M" + [[0, 0.3], [0.24, 0.6], [0.42, 0.42], [0.64, 0.74], [1, 0.34]].map(([a, b]) => q(a, b).join(",")).join("L") +
      poly(sun) + seg(q(0, 0.08), q(1, 0.08)) + seg(q(0.38, 0.03), q(0.38, 0.13));
  },
  // an offer: a big line, a smaller one, and a price tag
  promo: (q, box) => seg(q(0, 0.72), q(0.6, 0.72)) + seg(q(0, 0.5), q(0.42, 0.5)) + seg(q(0, 0.3), q(0.3, 0.3)) + box(0.7, 0.2, 1, 0.8),
};

/**
 * A screen: { at, u0, u1, v0, v1, kind, grid? }. Its bezel's back edge, face, glass, and what
 * it plays, at offset o off its mount. grid [cols, rows] draws an LED wall's cabinet seams.
 */
function screenPaths(P, sc, o = 0) {
  const w = (u, v, d = 0) => P(...sc.at(u, v, o + d));
  const bez = rrect(sc.u0, sc.v0, sc.u1, sc.v1, 1.2, 3);
  const gl = rrect(sc.u0 + 1.5, sc.v0 + 1.5, sc.u1 - 1.5, sc.v1 - 1.5, 0.5, 2);
  const W = sc.u1 - sc.u0 - 5, H = sc.v1 - sc.v0 - 5;
  const q = (a, b) => w(sc.u0 + 2.5 + a * W, sc.v0 + 2.5 + b * H);
  const bx = (a0, b0, a1, b1) => poly([q(a0, b0), q(a1, b0), q(a1, b1), q(a0, b1)]);
  let play = PLAYS[sc.kind](q, bx, W / H);
  if (sc.grid) {
    const [c, r] = sc.grid, g = (u, v) => w(sc.u0 + 1.5 + u * (W + 2), sc.v0 + 1.5 + v * (H + 2));
    let seams = "";
    for (let i = 1; i < c; i++) seams += seg(g(i / c, 0), g(i / c, 1));
    for (let j = 1; j < r; j++) seams += seg(g(0, j / r), g(1, j / r));
    play += seams;
  }
  return {
    back: poly(bez.map((p) => w(p.u, p.v, -1.4))),
    face: poly(bez.map((p) => w(p.u, p.v))),
    glass: poly(gl.map((p) => w(p.u, p.v))),
    play,
  };
}

/** Elements for one screen, appended into g; set(o) redraws them at offset o, lit(on) gives it the bright edge. */
function screenEls(P, sc, g) {
  const el = {
    back: mk("path", { class: "lo" }, g), face: mk("path", { class: "sil" }, g),
    glass: mk("path", { class: "nf lo" }, g), play: mk("path", { class: "nf lo" }, g),
  };
  return {
    sc, el,
    set: (o) => { const q = screenPaths(P, sc, o); for (const k in q) el[k].setAttribute("d", q[k]); },
    lit: (on) => { el.face.classList.toggle("hi", on); el.face.classList.toggle("sil", !on); el.play.classList.toggle("lo", !on); },
  };
}

/** A framed work on a face: the frame, its mat, and the work, one of a few quiet abstracts. */
function frame(P, parent, at, u0, v0, u1, v1, art) {
  const w = (u, v) => P(...at(u, v));
  const ring = (a0, b0, a1, b1, r) => poly(rrect(a0, b0, a1, b1, r, 2).map((p) => w(p.u, p.v)));
  mk("path", { d: ring(u0, v0, u1, v1, 0.8), class: "sil" }, parent);
  const m = Math.min(u1 - u0, v1 - v0) * 0.16, a0 = u0 + m, b0 = v0 + m, a1 = u1 - m, b1 = v1 - m;
  mk("path", { d: ring(a0, b0, a1, b1, 0.3), class: "nf lo" }, parent);
  const q = (a, b) => w(lerp(a0, a1, a), lerp(b0, b1, b));
  let d = "";
  if (art === "sun") {
    const c = [];
    for (let k = 0; k < 14; k++) c.push(q(0.5 + Math.cos(k * 0.449) * 0.24, 0.58 + Math.sin(k * 0.449) * 0.24 * (a1 - a0) / (b1 - b0)));
    d = poly(c) + seg(q(0.08, 0.24), q(0.92, 0.24));
  } else if (art === "bars") {
    [[0.18, 0.7], [0.4, 0.45], [0.62, 0.82], [0.82, 0.3]].forEach(([a, h]) => { d += seg(q(a, 0.12), q(a, h)); });
  } else {
    d = "M" + [0, 0.2, 0.4, 0.6, 0.8, 1].map((a, i) => q(0.06 + a * 0.88, 0.5 + (i % 2 ? 0.2 : -0.16)).join(",")).join("L");
  }
  mk("path", { d, class: "nf" }, parent);
}

/** A person: a slim body and a head at eye height. set(x, y, z0) stands them there and gives the eye's screen point. */
function person(P, front, parent, s, body = 20, eye = 23.5) {
  const g = mk("g", {}, parent), b = solid(g), hr = r2(3.1 * s);
  const head = mk("ellipse", { rx: hr, ry: hr, class: "sil" }, g);
  return {
    g, head,
    set(x, y, z0 = 0) {
      const [pr, pi] = rings(x - 2, y - 2, x + 2, y + 2, 2, 0.6);
      put(b, prism(P, front, pr, pi, z0, z0 + body));
      const h = P(x, y, z0 + eye);
      head.setAttribute("cx", h[0]); head.setAttribute("cy", h[1]);
      return h;
    },
  };
}
