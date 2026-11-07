/**
 * Walk: step 3 of Pre-show. The booth from step 2, screens in place, with a
 * person-high post walking it at eye level and footsteps left behind it. The
 * pointer sets where the post stands on the floor, on a spring, kept clear of
 * the desk. A dashed ring on the floor is the reach for using a screen:
 * screens inside it are live and play, the rest hold a blank placeholder, and
 * the nearest takes the bright edge, with a dashed view cone from the eye to
 * it. The slider is the reach, in metres.
 *
 * The pattern: a field. Springs for where, a hit test on the floor plane, and
 * every choice read from the springs' targets, never from where they are.
 */
const BODY = 21, EYE = 25, REST = [62, 36], STEPS = 7, STRIDE = 9;
const WALK = [18, BW - 8, 16, BD - 8], DESK = [94, 45, 136, 69];

/** Where the post may stand: inside the booth, clear of the totem and the wall, pushed off the desk. */
function walkable([x, y]) {
  x = clamp(x, WALK[0], WALK[1]); y = clamp(y, WALK[2], WALK[3]);
  if (x > DESK[0] && x < DESK[2] && y > DESK[1] && y < DESK[3]) {
    const e = [x - DESK[0], DESK[2] - x, y - DESK[1], DESK[3] - y], m = Math.min(...e);
    if (m === e[0]) x = DESK[0]; else if (m === e[1]) x = DESK[2]; else if (m === e[2]) y = DESK[1]; else y = DESK[3];
  }
  return [x, y];
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let R = value * M;
  const { C, P, front } = camera();
  const g = mk("g", {}, svg);

  let ring, steps;
  const scr = [];
  const desk = booth(P, front, g, {
    // on the floor, before anything that stands: the reach and the footsteps
    floor: (gg) => {
      ring = mk("path", { class: "nf lo dash" }, gg);
      steps = Array.from({ length: STEPS }, () => flatDot(gg, C, 0.9, "dot off"));
    },
    wall: (gg) => { scr[1] = screenEls(P, SCREENS[1], gg); scr[2] = screenEls(P, SCREENS[2], gg); },
    totem: (gg) => { scr[0] = screenEls(P, SCREENS[0], gg); },
  });
  scr.forEach((s) => s.set(0));

  // the post: a person at eye level, and the cone of what it is looking at
  const pg = mk("g", {}, g);
  const cone = mk("path", { class: "nf dash" }, pg), post = solid(pg), foot = flatDot(pg, C, 1.1, "dot m");
  const hr = r2(3.1 * S), head = mk("ellipse", { rx: hr, ry: hr, class: "sil" }, pg);

  const sx = spring(REST[0]), sy = spring(REST[1]);
  const trail = [];
  let focus = -1, drawn = "", ahead = null;

  function draw() {
    const x = sx.x, y = sy.x, key = r2(x) + "," + r2(y) + "," + R + "," + focus;
    if (key === drawn) return;
    drawn = key;
    // in front of the desk or behind it, by which side of it the post is on
    const inFront = x >= DESK[2] - 3 || y >= DESK[3] - 3;
    if (inFront !== ahead) { ahead = inFront; if (inFront) desk.after(pg); else desk.before(pg); }
    const [pr, pi] = rings(x - 2, y - 2, x + 2, y + 2, 2, 0.6);
    put(post, prism(P, front, pr, pi, 0, BODY));
    place(foot, P(x, y, 0));
    const h = P(x, y, EYE);
    head.setAttribute("cx", h[0]); head.setAttribute("cy", h[1]);
    if (focus < 0) cone.setAttribute("d", "");
    else {
      const sc = SCREENS[focus], v = (sc.v0 + sc.v1) / 2;
      cone.setAttribute("d", seg(h, P(...sc.at(sc.u0 + 2, v))) + seg(h, P(...sc.at(sc.u1 - 2, v))));
    }
    // a footstep each stride, the newest darkest
    const last = trail[trail.length - 1];
    if (!last || Math.hypot(x - last[0], y - last[1]) > STRIDE) { trail.push([x, y]); if (trail.length > STEPS) trail.shift(); }
    steps.forEach((el, i) => {
      const p = trail[trail.length - 2 - i];
      el.setAttribute("class", p ? (i < 3 ? "dot m" : "dot off") : "dot off");
      place(el, P(...(p || [x, y]), 0)); // an unused step hides under the post's own foot
    });
    // the reach, its points held to the floor so it never leaves the booth
    const pts = [];
    for (let k = 0; k < 56; k++) {
      const a = (k / 56) * Math.PI * 2;
      pts.push(P(clamp(x + Math.cos(a) * R, 1.5, BW - 1.5), clamp(y + Math.sin(a) * R, WT + 1, BD - 1.5), 0));
    }
    ring.setAttribute("d", poly(pts));
  }

  const B = register(stage, (dt) => { const m = stepS(sx, dt) | stepS(sy, dt); draw(); return !!m; });
  bag.add(B.unregister);

  /** Which screens are live, from where the post is going, not where it is now; the nearest takes the bright edge. */
  function retarget(over) {
    const [tx, ty] = over ? walkable(over) : REST;
    sx.t = tx; sy.t = ty;
    const d = SCREENS.map((sc) => Math.hypot(sc.foot[0] - tx, sc.foot[1] - ty));
    focus = d.indexOf(Math.min(...d));
    let live = 0;
    scr.forEach((s, i) => {
      const on = d[i] <= R || i === focus;
      if (on) live++;
      if (on) s.set(0); else s.el.play.setAttribute("d", "");
      s.el.play.classList.toggle("lo", i !== focus);
      s.el.face.classList.toggle("hi", i === focus);
      s.el.face.classList.toggle("sil", i !== focus);
    });
    read.textContent = over ? "walk · " + live + " live" : "rest";
    drawn = "";
    B.wake();
  }
  retarget(null);

  let over = null;
  bag.add(pointer(stage, {
    move: (p) => { over = unproj(C, p[0], p[1], 0); retarget(over); },
    leave: () => { over = null; retarget(null); },
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { R = v * M; retarget(over); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "walk",
  means: "A person walks the booth at eye level: screens within reach go live, and the nearest one holds the eye.",
  rules: [1, 3, 4, 5],
  range: [2, 3, 4.5],
  tour: [[130, 190], [205, 175], [262, 196], [214, 252], null],
  mount,
});
