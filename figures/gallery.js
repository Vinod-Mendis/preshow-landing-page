/**
 * Gallery: a showroom's corner. Framed works on two walls and a video work on
 * the back wall, three plinths with their sculptures (a sphere, a stacked
 * cube, a vase), a bench, and a team of three walking the space. The exhibit
 * under the pointer is taken up to be placed: a plinth lifts off its dashed
 * mark on the floor, the video work comes off its wall; it takes the bright
 * edge and the team's gazes turn to it. The slider is how far it lifts.
 *
 * The pattern: one of many. Tweens, a hit test on the exhibits' resting
 * centres, and gazes that follow the chosen exhibit where it is drawn.
 */
const RESTMARK = 1, RESTLIFT = 0.35, STEP = 45;
const VIDEO = { at: faceY(4), u0: 52, u1: 92, v0: 18, v1: 40.5, kind: "video" };
/** The exhibits, left to right: each a plinth with what stands on it, or the video work; how it moves when taken up. */
const EXHIBITS = [
  { foot: [34, 44, 48, 58], h: 20, parts: [], ball: [41, 51, 26.5, 6.2], move: [0, 0, 1] },
  { screen: VIDEO, move: [0, 0.8, 0] },
  { foot: [72, 36, 84, 48], h: 24, parts: [[74, 38, 82, 46, 1, 0.4, 24, 31], [75.5, 39.5, 80.5, 44.5, 0.8, 0.3, 31, 37]], move: [0, 0, 1] },
  { foot: [100, 64, 114, 78], h: 14, parts: [col(107, 71, 4, 14, 29), col(107, 71, 1.8, 29, 34)], move: [0, 0, 1] },
];
const TEAM = [[22, 86], [126, 48], [94, 100]];
const FIT = [[0, 0, -2], [144, 0, -2], [0, 112, -2], [144, 112, -2], [0, 0, 58], [144, 0, 58], [0, 104, 58]];

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let lift = value;
  const { P, front, s } = cam(1.83, FIT);
  const g = mk("g", {}, svg);
  const b = (spec, parent = g) => box(P, front, parent, spec);

  b([0, 0, 144, 112, 5, 1.6, -2, 0]); // floor
  // each plinth's mark on the floor, where it is to stand
  for (const e of EXHIBITS) if (e.foot) mk("path", { d: poly(ringAt(P, rrect(...e.foot.map((v, i) => v + (i < 2 ? -2 : 2)), 2, 4), 0)), class: "nf dash" }, g);
  b([0, 0, 144, 4, 2, 0.9, 0, 58]); b([0, 4, 4, 104, 1.5, 0.7, 0, 58]); // the walls
  frame(P, g, faceY(4), 14, 20, 38, 46, "sun"); frame(P, g, faceY(4), 104, 22, 130, 42, "bars");
  frame(P, g, faceX(4), 18, 22, 40, 44, "wave"); frame(P, g, faceX(4), 54, 16, 82, 46, "sun");

  // the exhibits, built in paint order with the team and the bench between them
  const groups = EXHIBITS.map(() => mk("g", {}, g));
  const team = TEAM.map(() => person(P, front, g, s));
  const bench = mk("g", {}, g);
  b([46, 81, 49, 87, 0.8, 0.4, 0, 8], bench); b([79, 81, 82, 87, 0.8, 0.4, 0, 8], bench); b([44, 80, 84, 88, 1.5, 0.6, 8, 10], bench);
  [groups[1], groups[0], groups[2], team[0].g, bench, groups[3], team[1].g, team[2].g].forEach((el) => g.append(el));
  const eyes = team.map((t, i) => t.set(...TEAM[i]));

  const items = EXHIBITS.map((e, i) => {
    const gg = groups[i], it = { e, tw: tween(0), drawn: NaN };
    if (e.screen) { it.scr = screenEls(P, e.screen, gg); return it; }
    it.drop = mk("path", { class: "nf dash" }, gg);
    it.solids = [e.foot.concat(1.5, 0.7, 0, e.h), ...e.parts].map((spec) => ({ spec, el: solid(gg) }));
    if (e.ball) it.ball = mk("ellipse", { rx: r2(e.ball[3] * s), ry: r2(e.ball[3] * s), class: "sil" }, gg);
    return it;
  });
  const gaze = mk("path", { class: "nf dash" }, g);

  /** Where exhibit it's top is drawn, lifted by o. */
  const top = (it, o) => {
    const [dx, dy, dz] = it.e.move.map((m) => m * o);
    if (it.scr) { const sc = it.e.screen; return P(...sc.at((sc.u0 + sc.u1) / 2, (sc.v0 + sc.v1) / 2, dy)); }
    const [x0, y0, x1, y1] = it.e.foot;
    return P((x0 + x1) / 2 + dx, (y0 + y1) / 2 + dy, (it.e.ball ? it.e.ball[2] + it.e.ball[3] : it.e.parts.at(-1)[7]) + dz);
  };
  let lit = RESTMARK;
  function draw(it, o) {
    if (o === it.drawn) return false;
    it.drawn = o;
    if (it.scr) { it.scr.set(o * it.e.move[1]); return true; }
    for (const p of it.solids) put(p.el, boxPaths(P, front, p.spec, 0, 0, o));
    const [x0, y0, x1, y1] = it.e.foot;
    it.drop.setAttribute("d", o < 0.5 ? "" : [[x0, y1], [x1, y1], [x1, y0]].map(([x, y]) => seg(P(x, y, o), P(x, y, 0))).join(""));
    if (it.ball) { const c = P(it.e.ball[0], it.e.ball[1], it.e.ball[2] + o); it.ball.setAttribute("cx", c[0]); it.ball.setAttribute("cy", c[1]); }
    return true;
  }

  const B = register(stage, (_dt, now) => {
    let moving = false, changed = false;
    items.forEach((it) => { if (draw(it, tval(it.tw, now))) changed = true; if (!tdone(it.tw, now)) moving = true; });
    if (changed) { const t = top(items[lit], tval(items[lit].tw, now)); gaze.setAttribute("d", eyes.map((e) => seg(e, t)).join("")); }
    return moving;
  });
  bag.add(B.unregister);

  // the exhibits' resting tops on screen: the hit test reads these and nothing that moves
  const centre = items.map((it) => top(it, 0));
  function hit([x, y]) {
    let best = -1, d = 46;
    centre.forEach((c, i) => { const e = Math.hypot(x - c[0], (y - c[1]) * 0.7); if (e < d) { d = e; best = i; } });
    return best;
  }

  let act = null;
  /** Takes up exhibit a (-1 sets them all down), staggered outwards from the one chosen or let go. */
  function choose(a, force) {
    if (a === act && !force) return;
    const now = performance.now(), from = a >= 0 ? a : act >= 0 ? act : RESTMARK;
    act = a;
    lit = a < 0 ? RESTMARK : a;
    items.forEach((it, i) => {
      tset(it.tw, i === lit ? (a < 0 ? RESTLIFT : 1) * lift : 0, now, Math.abs(i - from) * STEP);
      it.drawn = NaN;
      if (it.scr) it.scr.lit(i === lit);
      else { for (const p of it.solids) p.el.sil.classList.toggle("hi", i === lit); it.ball?.classList.toggle("hi", i === lit); }
    });
    read.textContent = a < 0 ? "rest" : EXHIBITS[a].screen ? "video work" : "plinth " + "ABC"[a === 0 ? 0 : a - 1];
    B.wake();
  }
  choose(-1);

  bag.add(pointer(stage, { move: (p) => choose(hit(p)), leave: () => choose(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { lift = v; choose(act, true); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "gallery",
  means: "A gallery walked by its team: the exhibit under the pointer is taken up to be placed, and every gaze turns to it.",
  rules: [1, 2, 4, 6],
  range: [6, 10, 14],
  tour: [[167, 136], [268, 130], [226, 189], [226, 146], null],
  mount,
});
