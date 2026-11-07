/**
 * Upload: step 1 of Pre-show. A model file, a sheet with a folded corner,
 * carries the booth in miniature. The pointer's x runs the import: the sheet
 * drops onto the dashed footprint, then the booth grows out of it to real
 * size while two dimension lines, ticked every metre, stretch along its front
 * edges. At 1:1 the booth fills its footprint and the measures take the bright
 * edge. A person-high post stands by for scale. The slider is the miniature's
 * size on the sheet.
 *
 * The pattern: a scrub. One spring on the import's progress, a hit test on
 * the viewBox's x alone, and a rest where the file hovers over the empty plot.
 */
const PX = -6, PY = 104, BODY = 20, EYE = 23.5;
const SH = [48, 20, 96, 62], DOG = 11, DROP = 0.4, REST = 0.1, HIGH = 46;

/** The sheet lying flat at height z, its back-right corner folded down, two lines of data along its front; while it falls, dashed drops from its corners to the plot. */
function sheet(P, z, falling) {
  const [x0, y0, x1, y1] = SH;
  const pts = [[x0, y0], [x1 - DOG, y0], [x1, y0 + DOG], [x1, y1], [x0, y1]];
  const drop = (x, y) => seg(P(x, y, z - 1.2), P(x, y, GZ));
  return {
    guide: falling ? drop(x0, y1) + drop(x1, y1) + drop(x1, y0 + DOG) + poly(pts.map(([x, y]) => P(x, y, GZ))) : "",
    back: poly(pts.map(([x, y]) => P(x, y, z - 1.2))),
    face: poly(pts.map(([x, y]) => P(x, y, z))),
    fold: poly([P(x1 - DOG, y0, z), P(x1 - DOG, y0 + DOG, z), P(x1, y0 + DOG, z)]) +
      seg(P(x0 + 5, y1 - 5, z), P(x1 - 5, y1 - 5, z)) + seg(P(x0 + 5, y1 - 9, z), P(x0 + 30, y1 - 9, z)),
  };
}

/** A dimension line from a to b on the floor, ticked across it at every metre of a booth at scale s. */
function measure(P, a, b, n, s, across) {
  let d = seg(P(...a, GZ), P(...b, GZ));
  for (let k = 0; k <= n; k++) {
    const t = k / n, x = lerp(a[0], b[0], t), y = lerp(a[1], b[1], t), h = k === 0 || k === n ? 3.2 : 1.6;
    d += seg(P(x - across[0] * h, y - across[1] * h, GZ), P(x + across[0] * h, y + across[1] * h, GZ));
  }
  return d;
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let mini = value;
  const { C, P, front } = camera();
  const g = mk("g", {}, svg);

  // the plot: a dot every metre, and the footprint the booth should fill, dashed
  for (let x = 8; x < BW; x += M) for (let y = 8; y < BD; y += M) place(flatDot(g, C, 0.55, "dot off"), P(x, y, GZ));
  mk("path", { d: poly(ringAt(P, rrect(0, 0, BW, BD, 6, 6), GZ)), class: "nf dash" }, g);

  const sh = { guide: mk("path", { class: "nf dash" }, g), back: mk("path", { class: "lo" }, g), face: mk("path", { class: "sil hi" }, g), fold: mk("path", { class: "nf" }, g) };
  const parts = ORDER.map(() => solid(g));
  const bush = mk("ellipse", { class: "sil" }, g);
  parts[ORDER.indexOf("pot")].g.after(bush);
  const dims = mk("path", { class: "nf" }, g);

  // the post, a person standing off the front corner
  const [pr, pi] = rings(PX - 2, PY - 2, PX + 2, PY + 2, 2, 0.6);
  put(solid(g), prism(P, front, pr, pi, GZ, BODY));
  const hc = P(PX, PY, EYE), hr = r2(3.1 * S);
  mk("ellipse", { cx: hc[0], cy: hc[1], rx: hr, ry: hr, class: "sil" }, g);

  const sp = spring(REST, { eps: 0.0008 });
  let drawn = NaN, full = null;

  /** The import at progress t: the sheet falls over [0, DROP], then the booth grows on the floor. */
  function draw(t) {
    if (t === drawn) return;
    drawn = t;
    const k = clamp((t - DROP) / (1 - DROP), 0, 1), fall = clamp(t / DROP, 0, 1);
    const z = lerp(HIGH, GZ + 1.2, fall * fall * (3 - 2 * fall));
    const s = lerp(mini, 1, k), base = k > 0 ? lerp(GZ + 1.2, GZ, k) : z;
    const q = sheet(P, z, t > 0.02 && fall < 1);
    for (const n in q) sh[n].setAttribute("d", q[n]);
    ORDER.forEach((n, i) => put(parts[i], partPaths(P, front, PARTS[n], s, base)));
    const X = (x) => BW / 2 + (x - BW / 2) * s, Y = (y) => BD / 2 + (y - BD / 2) * s, Z = (zz) => base + (zz - GZ) * s;
    const b = P(X(BUSH[0]), Y(BUSH[1]), Z(BUSH[2])), br = r2(BUSH[3] * S * s);
    bush.setAttribute("cx", b[0]); bush.setAttribute("cy", b[1]); bush.setAttribute("rx", br); bush.setAttribute("ry", r2(br * 0.86));
    // the measures, along the front-left and front-right edges, only once the booth is on the floor
    dims.setAttribute("d", k <= 0 ? "" :
      measure(P, [X(0), Y(BD) + 8], [X(BW), Y(BD) + 8], 9, s, [0, 1]) + measure(P, [X(BW) + 8, Y(0)], [X(BW) + 8, Y(BD)], 5, s, [1, 0]));
    const isFull = t > 0.985;
    if (isFull !== full) {
      full = isFull;
      dims.classList.toggle("hi", isFull);
      sh.face.classList.toggle("hi", !isFull);
    }
  }

  const B = register(stage, (dt) => { const m = stepS(sp, dt); draw(sp.x); return m; });
  bag.add(B.unregister);

  /** The pointer's x on the viewBox, never the drawing, sets where the import is. */
  function scrub(p) {
    sp.t = p ? clamp((p[0] - 96) / 210, 0, 1) : REST;
    const t = sp.t;
    read.textContent = !p ? "rest" : t < DROP ? "drop · .glb" : t > 0.985 ? "1:1 · m" : "scale · " + Math.round(lerp(mini, 1, (t - DROP) / (1 - DROP)) * 100) + "%";
    B.wake();
  }

  bag.add(pointer(stage, { move: (p) => scrub(p), leave: () => scrub(null) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { mini = v; drawn = NaN; B.wake(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "upload",
  means: "A model file drops onto its plot, and the booth on it grows to real size, measured metre by metre along its edges.",
  rules: [1, 3, 4, 5],
  range: [0.16, 0.22, 0.28],
  tour: [[118, 200], [170, 200], [250, 200], [330, 200], null],
  mount,
});
