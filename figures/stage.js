/**
 * Stage: an event stage and its audience. A raised stage with steps, an LED
 * wall drawn with its cabinet seams, a lectern with a speaker at it, two
 * confidence monitors at the lip, speaker stacks and side screens on poles,
 * and four rows of chairs in two blocks, some taken. The pointer picks a
 * seat: it takes the bright edge, and a dashed view frustum runs from that
 * seat's eye to the LED wall's corners. The slider is the seated eye height.
 *
 * The pattern: one of many, on the floor. A hit test on the chairs' places on
 * the floor plane, which never move; the frustum follows on springs.
 */
const ROWS = 4, PER = 6, LED = { at: faceY(8), u0: 38, u1: 122, v0: 13, v1: 60.25, kind: "video", grid: [8, 4] };
const REST = 14, TAKEN = new Set([0, 3, 4, 7, 9, 11, 13, 16, 18, 19, 22]);
const FIT = [[0, 0, -2], [160, 0, -2], [0, 132, -2], [160, 132, -2], [36, 4, 64], [124, 4, 64]];

/** Chair k's place on the floor: rows from the stage back, two blocks of three either side of the aisle. */
const seat = (k) => {
  const r = Math.floor(k / PER), c = k % PER;
  return [c < 3 ? 34 + c * 13 : 92 + (c - 3) * 13, 66 + r * 15];
};

/** A floor monitor: a wedge whose screen slopes up towards the audience, facing the speaker. */
function wedge(P, parent, x0, x1) {
  const y0 = 35, y1 = 42, z = 10, base = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map(([x, y]) => P(x, y, z));
  const back = [P(x0, y0, z + 4), P(x1, y0, z + 4)], lip = [P(x1, y1, z + 9), P(x0, y1, z + 9)];
  const el = solid(parent);
  put(el, { sil: poly(hull(base.concat(back, lip))), crease: poly(back.concat(lip)) });
  const g = (a, b) => P(lerp(x0 + 1.5, x1 - 1.5, a), lerp(y0 + 1.2, y1 - 1.2, b), lerp(z + 4.4, z + 8.6, b));
  mk("path", { d: poly([g(0, 0), g(1, 0), g(1, 1), g(0, 1)]), class: "nf lo" }, parent);
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let eyeZ = value;
  const { C, P, front, s } = cam(1.64, FIT);
  const g = mk("g", {}, svg);
  const b = (spec, parent = g) => box(P, front, parent, spec);

  b([0, 0, 160, 132, 5, 1.6, -2, 0]); // the hall floor
  // the left side screen on its pole, and its speaker stack, behind the stage's left end
  b(col(10, 21.5, 1.4, 0, 28)); b([0, 20, 20, 23, 1, 0.5, 28, 41]);
  screenEls(P, { at: faceY(23), u0: 1.5, u1: 18.5, v0: 29, v1: 40, kind: "video" }, g).set(0);
  b([6, 30, 18, 40, 1, 0.5, 0, 24]);
  b([24, 0, 136, 44, 3, 1.2, 0, 10]); // the stage
  b([36, 4, 124, 8, 1, 0.5, 10, 62]); // the LED wall's frame
  const led = screenEls(P, LED, g);
  led.set(0); led.el.play.setAttribute("class", "nf");
  person(P, front, g, s).set(48, 22, 10); // the speaker, at the lectern
  b([44, 26, 52, 32, 1, 0.5, 10, 26]); b([43, 25, 53, 33, 1.2, 0.5, 26, 27.5]);
  wedge(P, g, 60, 72); wedge(P, g, 88, 100);
  b([110, 44, 126, 52, 1, 0.5, 0, 4.5]); b([110, 44, 126, 48, 1, 0.5, 4.5, 9]); // steps up
  // the right side screen and its speaker stack, in front of the stage's right end
  b(col(150, 21.5, 1.4, 0, 28)); b([140, 20, 160, 23, 1, 0.5, 28, 41]);
  screenEls(P, { at: faceY(23), u0: 141.5, u1: 158.5, v0: 29, v1: 40, kind: "video" }, g).set(0);
  b([142, 30, 154, 40, 1, 0.5, 0, 24]);

  // the chairs, row by row from the stage: a stem, a seat, whoever sits there, the back
  const chairs = [];
  for (let k = 0; k < ROWS * PER; k++) {
    const [x, y] = seat(k);
    b(col(x, y, 0.9, 0, 6));
    const parts = [b([x - 4, y - 4, x + 4, y + 3, 1, 0.4, 6, 7.5])];
    if (TAKEN.has(k)) {
      const h = P(x, y, 18.5);
      mk("ellipse", { cx: h[0], cy: h[1], rx: r2(2.8 * s), ry: r2(2.8 * s), class: "sil" }, g);
    }
    parts.push(b([x - 4, y + 3, x + 4, y + 4.6, 0.6, 0.3, 6, 15.5]));
    chairs.push({ x, y, parts });
  }

  // the frustum, from the chosen seat's eye to the LED wall's four corners
  const frustum = mk("path", { class: "nf dash" }, g);
  const corners = [[LED.u0, LED.v0], [LED.u1, LED.v0], [LED.u0, LED.v1], [LED.u1, LED.v1]].map(([u, v]) => P(...LED.at(u, v)));
  const ex = spring(seat(REST)[0]), ey = spring(seat(REST)[1]);
  let drawn = "";
  function draw() {
    const key = r2(ex.x) + "," + r2(ey.x) + "," + eyeZ;
    if (key === drawn) return;
    drawn = key;
    const e = P(ex.x, ey.x, eyeZ);
    frustum.setAttribute("d", corners.map((c) => seg(e, c)).join(""));
  }
  const B = register(stage, (dt) => { const m = stepS(ex, dt) | stepS(ey, dt); draw(); return !!m; });
  bag.add(B.unregister);

  let act = null;
  /** Sits the eye in chair k (-1 goes back to the rest seat); the chair takes the bright edge. */
  function choose(k, force) {
    if (k === act && !force) return;
    act = k;
    const lit = k < 0 ? REST : k;
    chairs.forEach((c, i) => c.parts.forEach((p) => p.sil.classList.toggle("hi", i === lit)));
    [ex.t, ey.t] = [chairs[lit].x, chairs[lit].y];
    read.textContent = k < 0 ? "rest" : "row " + "ABCD"[Math.floor(k / PER)] + " · " + ((k % PER) + 1);
    drawn = "";
    B.wake();
  }
  choose(-1);

  /** The chair whose place on the floor is nearest the pointer's point on the floor, within reach of it. */
  function hit(p) {
    const [x, y] = unproj(C, p[0], p[1], 7.5); // on the seats' own height, so a seat is picked where it is drawn at rest
    let best = -1, d = 10;
    chairs.forEach((c, i) => { const e = Math.hypot(c.x - x, c.y - y); if (e < d) { d = e; best = i; } });
    return best;
  }

  bag.add(pointer(stage, { move: (p) => choose(hit(p)), leave: () => choose(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { eyeZ = v; drawn = ""; B.wake(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "stage",
  means: "A stage and its audience: the seat under the pointer lights, with the view from it to the LED wall.",
  rules: [1, 4, 5, 10],
  range: [16, 19, 22],
  tour: [[147, 162], [227, 218], [125, 203], [244, 210], null],
  mount,
});
