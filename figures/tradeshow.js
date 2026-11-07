/**
 * Trade show: an inline booth on a hall aisle. A back wall under a fascia
 * with a wall graphic and the main screen, a side wall with its own screen, a
 * totem, a plant, a counter with a screen in its front, brochures and two
 * stools, a member of staff behind it, and a goalpost truss with spots over
 * the front. A visitor walks the aisle with the pointer; the screen that faces
 * them best takes the bright edge, with a dashed sightline from their eye to
 * it. The slider is how far a screen can be seen from, in metres.
 *
 * The pattern: a field. Springs for where, a hit test on the hall floor, and
 * the choice read from the springs' targets.
 */
const HF = -3, AISLE = [-14, 126, 86, 104], REST = [18, 96];
const SCREENS = [
  { at: faceY(5), u0: 46, u1: 100, v0: 14, v1: 44.4, kind: "web", n: [0, 1] },
  { at: faceX(5), u0: 14, u1: 42, v0: 14, v1: 29.8, kind: "video", n: [1, 0] },
  { at: faceX(24), u0: 54, u1: 64, v0: 6, v1: 23.8, kind: "video", n: [1, 0] },
  { at: faceY(58.2), u0: 74, u1: 100, v0: 3, v1: 14, kind: "promo", n: [0, 1] },
];
const FIT = [[-24, 0, HF], [136, 0, HF], [-24, 112, HF], [136, 112, HF], [0, 0, 74], [112, 0, 74]];

/** A screen's middle, in the world. */
const mid = (sc) => sc.at((sc.u0 + sc.u1) / 2, (sc.v0 + sc.v1) / 2);

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let reach = value * 16;
  const { C, P, front, s } = cam(1.78, FIT);
  const g = mk("g", {}, svg);
  const b = (spec) => box(P, front, g, spec);

  // the aisle: its two edges dashed on the hall floor
  for (const y of [80, 110]) mk("path", { d: seg(P(-24, y, HF), P(136, y, HF)), class: "nf dash" }, g);

  b([0, 0, 112, 72, 5, 1.6, HF, 0]); // the booth's raised floor
  b([0, 0, 112, 5, 2, 0.9, 0, 48]); // back wall
  mk("path", { d: seg(P(2, 5.4, 0), P(110, 5.4, 0)), class: "nf lo" }, g);
  b([0, 0, 112, 10, 2, 0.9, 48, 54]); // fascia
  frame(P, g, faceY(5), 12, 18, 38, 40, "wave"); // the wall graphic
  const scr = [];
  scr[0] = screenEls(P, SCREENS[0], g);
  b([0, 5, 5, 50, 1.5, 0.7, 0, 40]); // side wall
  scr[1] = screenEls(P, SCREENS[1], g);
  b(col(104, 15, 4.5, 0, 8)); // the plant
  const bush = P(104, 15, 14.5);
  mk("ellipse", { cx: bush[0], cy: bush[1], rx: r2(6 * s), ry: r2(5.2 * s), class: "sil" }, g);
  person(P, front, g, s).set(87, 34); // staff, behind the counter
  b([18, 50, 26, 68, 1.5, 0.7, 0, 1.4]); b([20, 52, 24, 66, 1.5, 0.7, 1.4, 34]); // totem on its foot
  scr[2] = screenEls(P, SCREENS[2], g);
  // the counter: body, top, brochures, the screen in its front, two stools
  b([70, 44, 104, 58, 2.5, 1, 0, 17]); b([67, 42, 107, 60, 3, 1.2, 17, 19.5]);
  b([74, 46, 84, 53, 1, 0.4, 19.5, 20.7]); b([75, 47, 83, 52, 1, 0.4, 20.7, 21.9]);
  scr[3] = screenEls(P, SCREENS[3], g);
  for (const x of [80, 96]) { b(col(x, 65, 1.2, 0, 11)); b(col(x, 65, 3.6, 11, 12.6)); }
  // the goalpost truss over the front, with its lacing and three spots
  b([1, 62, 5, 66, 1, 0.5, 0, 70]); b([107, 62, 111, 66, 1, 0.5, 0, 70]);
  b([1, 62, 111, 66, 1, 0.5, 70, 75]);
  const lace = [];
  for (let k = 0; k <= 22; k++) lace.push(P(3 + k * 5, 66, k % 2 ? 70.6 : 74.4));
  mk("path", { d: open(lace), class: "nf lo" }, g);
  for (const x of [28, 56, 84]) b(col(x, 64, 1.7, 63, 70));
  scr.forEach((sc) => sc.set(0));

  // the visitor, and the sightline from their eye
  const sight = mk("path", { class: "nf dash" }, g);
  const visitor = person(P, front, g, s);
  const vx = spring(REST[0]), vy = spring(REST[1]);
  let best = -1, drawn = "";

  function draw() {
    const key = r2(vx.x) + "," + r2(vy.x) + "," + best;
    if (key === drawn) return;
    drawn = key;
    const eye = visitor.set(vx.x, vy.x, HF);
    if (best < 0) { sight.setAttribute("d", ""); return; }
    const sc = SCREENS[best], v = (sc.v0 + sc.v1) / 2;
    sight.setAttribute("d", seg(eye, P(...sc.at(sc.u0 + 1.5, v))) + seg(eye, P(...sc.at(sc.u1 - 1.5, v))));
  }

  const B = register(stage, (dt) => { const m = stepS(vx, dt) | stepS(vy, dt); draw(); return !!m; });
  bag.add(B.unregister);

  /** Which screen faces the visitor best, from where they are going: facing them, within reach, the most squarely. */
  function retarget(over) {
    const [x, y] = over ? [clamp(over[0], AISLE[0], AISLE[1]), clamp(over[1], AISLE[2], AISLE[3])] : REST;
    vx.t = x; vy.t = y;
    let top = 0;
    best = -1;
    SCREENS.forEach((sc, i) => {
      const m = mid(sc), dx = x - m[0], dy = y - m[1], d = Math.hypot(dx, dy);
      const score = (sc.n[0] * dx + sc.n[1] * dy) / d - d / (reach * 4);
      if (d < reach && score > top) { top = score; best = i; }
    });
    scr.forEach((sc, i) => sc.lit(i === best));
    read.textContent = over ? "aisle " + ((x - AISLE[0]) / 16).toFixed(1) + " m" + (best < 0 ? "" : " · screen " + (best + 1)) : "rest";
    drawn = "";
    B.wake();
  }
  retarget(null);

  let over = null;
  bag.add(pointer(stage, {
    move: (p) => { over = unproj(C, p[0], p[1], HF); retarget(over); },
    leave: () => { over = null; retarget(null); },
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { reach = v * 16; retarget(over); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "tradeshow",
  means: "A visitor walks the aisle past a booth: the screen that faces them best lights, with the sightline to it.",
  rules: [1, 3, 4, 5],
  range: [6, 8, 11],
  tour: [[73, 204], [156, 244], [234, 284], null],
  mount,
});
