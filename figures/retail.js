/**
 * Retail: a store's corner. A display wall of four shelf bays, stocked with
 * boxes and bottles, a header screen over each bay, a portrait video wall on
 * the side wall, a display table set with stock, and a shopper. The bay
 * nearest the pointer slides off the wall, its shelves and header screen take
 * the bright edge; the others settle back, staggered outwards from it. The
 * slider is how far a bay comes forward.
 *
 * The pattern: one of many. Tweens, a stagger by distance, and a hit test on
 * the bays' resting centres, which never move.
 */
const BAYS = 4, BX = 12, BW = 26, STEP = 45, RESTMARK = 2, RESTPULL = 0.4;
const LEVELS = [4, 16.5, 29], SHELF = [15, 27.5]; // what each level stands on, and the shelves' bottoms
/** What stands on a level: widths, heights, and b for a bottle. Four patterns, turned by bay and level. */
const STOCK = [
  [[6, 8], [6, 8], [6, 8]],
  [[4.4, 8.5, "b"], [4.4, 8.5, "b"], [4.4, 8.5, "b"], [4.4, 8.5, "b"]],
  [[9, 6], [5, 9], [5, 9]],
  [[4, 7], [4, 5], [4, 7], [4, 5]],
];
const FIT = [[0, 0, -3], [128, 0, -3], [0, 96, -3], [128, 96, -3], [0, 0, 54], [128, 0, 54], [0, 90, 54]];

/** Bay i's fixture: the kick, then each level's stock and the shelf over it, back to front; [spec, isShelf] pairs. */
function fixture(i) {
  const x0 = BX + i * (BW + 2), x1 = x0 + BW, out = [[[x0, 5, x1, 15, 1.2, 0.5, 0, 4], true]];
  LEVELS.forEach((z, lv) => {
    let x = x0 + 1.6;
    for (const [w, h, kind] of STOCK[(i + lv) % 4]) {
      out.push([kind ? col(x + w / 2, 10, w / 2, z, z + h) : [x, 7, x + w, 13, 0.8, 0.4, z, z + h], false]);
      x += w + 1.2;
    }
    if (lv < 2) out.push([[x0, 5, x1, 15, 1.2, 0.5, SHELF[lv], SHELF[lv] + 1.5], true]);
  });
  return { x0, x1, parts: out };
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let pull = value;
  const { P, front, s } = cam(2.05, FIT);
  const g = mk("g", {}, svg);
  const b = (spec) => box(P, front, g, spec);

  b([0, 0, 128, 96, 5, 1.6, -3, 0]); // floor
  b([0, 0, 128, 4, 2, 0.9, 0, 54]); // back wall
  b([0, 4, 4, 90, 1.5, 0.7, 0, 54]); // side wall, and its video wall
  screenEls(P, { at: faceX(4), u0: 24, u1: 58, v0: 8, v1: 50, kind: "video", grid: [2, 3] }, g).set(0);

  const bays = [];
  for (let i = 0; i < BAYS; i++) {
    const f = fixture(i);
    b([f.x0, 4, f.x1, 5.2, 0.6, 0.25, 2, 40]); // the slatwall the bay hangs on
    const head = screenEls(P, { at: faceY(4), u0: f.x0 + 1, u1: f.x1 - 1, v0: 42, v1: 51, kind: i % 2 ? "promo" : "video" }, g);
    head.set(0);
    const els = f.parts.map(([spec, shelf]) => ({ spec, shelf, el: solid(g) }));
    bays.push({ f, head, els, tw: tween(0), drawn: NaN });
  }

  // the display table, set with stock, and a shopper beside it
  b([44, 59, 56, 73, 1.5, 0.7, 0, 13]); b([76, 59, 88, 73, 1.5, 0.7, 0, 13]); b([40, 56, 92, 76, 3, 1.2, 13, 15.5]);
  b([48, 61, 58, 69, 1, 0.4, 15.5, 19.5]); b([49, 62, 57, 68, 1, 0.4, 19.5, 23]);
  b(col(70, 64, 2.2, 15.5, 24)); b(col(76, 69, 2.2, 15.5, 22)); b([80, 60, 88, 66, 1, 0.4, 15.5, 17]);
  person(P, front, g, s).set(106, 84);

  function draw(bay, o) {
    if (o === bay.drawn) return;
    bay.drawn = o;
    for (const p of bay.els) put(p.el, boxPaths(P, front, p.spec, 0, o));
  }
  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const bay of bays) { draw(bay, tval(bay.tw, now)); if (!tdone(bay.tw, now)) moving = true; }
    return moving;
  });
  bag.add(B.unregister);

  // the bays' resting centres on screen: the hit test reads these and nothing that moves
  const centre = bays.map((bay) => P((bay.f.x0 + bay.f.x1) / 2, 10, 22));
  function hit([x, y]) {
    let best = -1, d = 34;
    centre.forEach((c, i) => { const e = Math.abs(x - c[0]); if (e < d && Math.abs(y - c[1]) < 80) { d = e; best = i; } });
    return best;
  }

  let act = null;
  /** Brings bay a forward (-1 puts them back to rest), staggered outwards from the one chosen or let go. */
  function choose(a, force) {
    if (a === act && !force) return;
    const now = performance.now(), from = a >= 0 ? a : act >= 0 ? act : RESTMARK, lit = a < 0 ? RESTMARK : a;
    act = a;
    bays.forEach((bay, i) => {
      tset(bay.tw, a < 0 ? (i === RESTMARK ? RESTPULL * pull : 0) : i === a ? pull : 0, now, Math.abs(i - from) * STEP);
      bay.head.lit(i === lit);
      for (const p of bay.els) if (p.shelf) p.el.sil.classList.toggle("hi", i === lit);
    });
    read.textContent = a < 0 ? "rest" : "bay " + (a + 1) + " · " + (BW / 16).toFixed(1) + " m";
    B.wake();
  }
  choose(-1);

  bag.add(pointer(stage, { move: (p) => choose(hit(p)), leave: () => choose(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { pull = clamp(v, 0, 14); choose(act, true); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "retail",
  means: "A store's display wall: the bay under the pointer slides off the wall with its header screen lit, the rest settle in turn.",
  rules: [1, 2, 4, 8],
  range: [5, 9, 13],
  tour: [[199, 116], [280, 157], [321, 177], [239, 137], null],
  mount,
});
