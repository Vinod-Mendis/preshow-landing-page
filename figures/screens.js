/**
 * Screens: step 2 of Pre-show. The booth from step 1, now holding its screens
 * at true size: a 21:9 banner and a 16:9 main screen on the back wall, and a
 * 9:16 totem on the floor. The banner and the totem play film, the main screen
 * a live web page. The screen nearest the pointer comes off its mount, takes
 * the bright edge and plays, and dashed guides drop from its corners to the
 * floor with its width measured between them; the others settle back,
 * staggered outwards from it. The slider is how far a screen comes forward.
 *
 * The pattern: one of many. Tweens, a stagger by distance, and a hit test on
 * the screens' resting centres, which never move.
 */
const STEP = 45, RESTMARK = 2, RESTPULL = [0, 0, 0.45];

/** The true-size guides for a screen at offset o: drops from its lower corners to the floor, and its width between them. */
function guides(P, sc, o) {
  const w = (u, v) => P(...sc.at(u, v, o));
  const v = 1.4, end = (u) => seg(w(u, v - 1.4), w(u, v + 1.4));
  return {
    drop: seg(w(sc.u0, sc.v0), w(sc.u0, 0)) + seg(w(sc.u1, sc.v0), w(sc.u1, 0)),
    width: seg(w(sc.u0, v), w(sc.u1, v)) + end(sc.u0) + end(sc.u1),
  };
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let pull = value;
  const { P, front } = camera();
  const g = mk("g", {}, svg);

  const scr = [];
  const make = (i) => (gg) => {
    const drop = mk("path", { class: "nf dash" }, gg), width = mk("path", { class: "nf" }, gg);
    scr[i] = { ...screenEls(P, SCREENS[i], gg), drop, width, tw: tween(0), drawn: NaN, lit: false };
  };
  booth(P, front, g, { wall: (gg) => { make(1)(gg); make(2)(gg); }, totem: make(0) });

  function draw(s, o) {
    if (o === s.drawn) return;
    s.drawn = o;
    s.set(o);
    const q = guides(P, s.sc, o);
    s.drop.setAttribute("d", s.lit ? q.drop : "");
    s.width.setAttribute("d", s.lit ? q.width : "");
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const s of scr) { draw(s, tval(s.tw, now)); if (!tdone(s.tw, now)) moving = true; }
    return moving;
  });
  bag.add(B.unregister);

  // the resting centres on screen: the hit test reads these and nothing that moves
  const centre = scr.map((s) => P(...s.sc.at((s.sc.u0 + s.sc.u1) / 2, (s.sc.v0 + s.sc.v1) / 2)));
  function hit([x, y]) {
    let best = -1, d = 60;
    centre.forEach((c, i) => { const e = Math.abs(x - c[0]); if (e < d && Math.abs(y - c[1]) < 95) { d = e; best = i; } });
    return best;
  }

  let act = null;
  /** Brings screen a forward (-1 puts them back to rest), staggered outwards from the one chosen or let go. */
  function choose(a, force) {
    if (a === act && !force) return;
    const now = performance.now(), from = a >= 0 ? a : act >= 0 ? act : RESTMARK;
    act = a;
    const lit = a < 0 ? RESTMARK : a;
    scr.forEach((s, i) => {
      tset(s.tw, a < 0 ? RESTPULL[i] * pull : i === a ? pull : 0, now, Math.abs(i - from) * STEP);
      s.lit = i === lit;
      s.drawn = NaN;
      s.el.face.classList.toggle("hi", s.lit);
      s.el.face.classList.toggle("sil", !s.lit);
      s.el.play.classList.toggle("lo", !s.lit);
    });
    read.textContent = a < 0 ? "rest" : "screen " + (a + 1) + " · " + SCREENS[a].name;
    B.wake();
  }
  choose(-1);

  bag.add(pointer(stage, { move: (p) => choose(hit(p)), leave: () => choose(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { pull = clamp(v, 0, 12); choose(act, true); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "screens",
  means: "A booth's screens at true size: the one under the pointer comes off its mount and plays, measured down to the floor.",
  rules: [1, 2, 4, 8],
  range: [3, 6, 10],
  tour: [[96, 150], [186, 96], [262, 140], null],
  mount,
});
