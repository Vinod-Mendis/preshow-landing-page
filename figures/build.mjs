#!/usr/bin/env node
/**
 * Builds the landing page's figures into public/figures/.
 *
 * Each figure, with kit.js (and for the "How it works" steps, booth.js) in
 * front of it, is assembled on the Hairline bench by the hairline-create
 * skill's own build (kernel and bench unchanged), then given one extra
 * stylesheet for embedding: transparent page, controls and labels hidden, the
 * light palette pinned with the plate colour of the card it sits on, and the
 * orange accent as the bright stroke.
 *
 *   node figures/build.mjs [--sources <dir>]
 *
 * --sources also writes each figure as the skill's tools read it, shared code
 * included, for look.mjs and validate.mjs.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { assemble } from "../.agents/skills/hairline-create/build.mjs";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));

/*
 * Plates are opaque, so each set's plate is the colour its card renders, measured in the browser:
 * steps sit on bg-zinc-200/60 over bg-zinc-100, use cases on bg-zinc-200/70 over the white page.
 * fill: "width" fills the card's width and crops top and bottom (the steps' 1.7:1 cards);
 * "contain" fits the whole 5:4 stage inside the card (the use-case panel, 5:4 to 4:3).
 */
const SETS = [
  {
    shared: ["kit.js", "booth.js"], plate: "#ebebed", fill: "width",
    figures: [
      ["upload.js", "step-1.html", "Upload your model"],
      ["screens.js", "step-2.html", "Place your screens"],
      ["walk.js", "step-3.html", "Walk through it"],
    ],
  },
  {
    shared: ["kit.js"], plate: "#ececee", fill: "contain",
    figures: [
      ["tradeshow.js", "use-case-1.html", "Trade show booths"],
      ["retail.js", "use-case-2.html", "Retail stores"],
      ["stage.js", "use-case-3.html", "Event stages"],
      ["gallery.js", "use-case-4.html", "Showrooms and galleries"],
    ],
  },
];

const embed = ({ plate, fill }) => `<style id="preshow-embed">
  :root, :root[data-theme] { color-scheme: light !important; }
  html, body { background: transparent !important; }
  body { display: block; min-height: 0; height: 100vh; padding: 0; overflow: hidden; }
  main { max-width: none !important; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; overflow: hidden; }
  .plate { flex: none; width: ${fill === "contain" ? "min(100vw, 125vh)" : "100%"}; border: 0; border-radius: 0; overflow: visible; }
  .tag, .controls, #means, #rules, #error { display: none !important; }
  #stage {
    --hairline-plate: ${plate}; --hairline-hi: #f97316;
    --hairline-edge: #9f9fa9; --hairline-mid: #c4c4ca; --hairline-lo: #d6d6db;
  }
</style>${fill === "contain" ? `
<script>
  /* Fill the frame: scale the drawing up about its own middle until its box is 94% of the stage, the
     figures being drawn with margin to spare for their lifts. The box is the same in every pose. */
  addEventListener("load", () => requestAnimationFrame(() => {
    const svg = document.querySelector("#stage svg"), g = svg && svg.querySelector("g");
    if (!g) return;
    const b = g.getBBox(), k = Math.min(1.35, (400 * 0.94) / b.width, (320 * 0.94) / b.height);
    const tx = (k * (200 - (b.x + b.width / 2))) / 400 * 100, ty = (k * (160 - (b.y + b.height / 2))) / 320 * 100;
    svg.style.transform = "translate(" + tx + "%," + ty + "%) scale(" + k + ")";
  }));
</script>` : ""}
</head>`;

const at = process.argv.indexOf("--sources"), sources = at > 0 ? process.argv[at + 1] : null;
mkdirSync(here("../public/figures/"), { recursive: true });
for (const set of SETS) {
  const shared = set.shared.map((f) => readFileSync(here(`./${f}`), "utf8")).join("\n");
  for (const [src, out, title] of set.figures) {
    const figure = shared + "\n" + readFileSync(here(`./${src}`), "utf8");
    if (sources) { mkdirSync(sources, { recursive: true }); writeFileSync(`${sources}/${src}`, figure); }
    const page = assemble(figure)
      .replace("<title>Hairline figure</title>", `<title>${title}</title>`)
      .replace("</head>", () => embed(set));
    writeFileSync(here(`../public/figures/${out}`), page);
    console.log(`public/figures/${out}`);
  }
}
