#!/usr/bin/env node
/**
 * Builds the "How it works" figures into public/figures/step-N.html.
 *
 * Each figure, with booth.js (the booth all three share) in front of it, is
 * assembled on the Hairline bench by the hairline-create skill's own build
 * (kernel and bench unchanged), then given one extra stylesheet for
 * embedding in a card: transparent page, controls and labels hidden, the light
 * palette pinned, the orange accent as the bright stroke, and the 5:4 stage
 * filling the card's width, cropped top and bottom to the card's 1.7:1.
 *
 *   node figures/build.mjs
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { assemble } from "../.agents/skills/hairline-create/build.mjs";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));

const FIGURES = [
  ["upload.js", "step-1.html", "Upload your model"],
  ["screens.js", "step-2.html", "Place your screens"],
  ["walk.js", "step-3.html", "Walk through it"],
];

const EMBED = `<style id="preshow-embed">
  :root, :root[data-theme] { color-scheme: light !important; }
  html, body { background: transparent !important; }
  body { display: block; min-height: 0; height: 100vh; padding: 0; overflow: hidden; }
  main { max-width: none !important; width: 100%; height: 100%; display: flex; align-items: center; overflow: hidden; }
  .plate { flex: none; width: 100%; border: 0; border-radius: 0; overflow: visible; }
  .tag, .controls, #means, #rules, #error { display: none !important; }
  #stage {
    /* plate = the card's bg-zinc-200/60 over bg-zinc-100, as rendered: plates are opaque, so it must match */
    --hairline-plate: #ebebed; --hairline-hi: #f97316;
    --hairline-edge: #9f9fa9; --hairline-mid: #c4c4ca; --hairline-lo: #d6d6db;
  }
</style>
</head>`;

// --sources <dir> also writes each figure as the skill's tools read it, booth.js included, for look.mjs
const at = process.argv.indexOf("--sources"), sources = at > 0 ? process.argv[at + 1] : null;
const shared = readFileSync(here("./booth.js"), "utf8");

mkdirSync(here("../public/figures/"), { recursive: true });
for (const [src, out, title] of FIGURES) {
  const figure = shared + "\n" + readFileSync(here(`./${src}`), "utf8");
  if (sources) { mkdirSync(sources, { recursive: true }); writeFileSync(`${sources}/${src}`, figure); }
  const page = assemble(figure)
    .replace("<title>Hairline figure</title>", `<title>${title}</title>`)
    .replace("</head>", () => EMBED);
  writeFileSync(here(`../public/figures/${out}`), page);
  console.log(`public/figures/${out}`);
}
