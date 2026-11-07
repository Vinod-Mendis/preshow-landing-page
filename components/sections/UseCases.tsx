"use client";

import { useState } from "react";

const useCases = [
  {
    title: "Trade show booths",
    description:
      "Check aisle sightlines, counter placement, and screen sizes before the build crew arrives.",
    figure: "/figures/use-case-1.html?play=1",
  },
  {
    title: "Retail stores",
    description:
      "Test display walls and in-store screens at real scale before a single fixture is ordered.",
    figure: "/figures/use-case-2.html?play=1",
  },
  {
    title: "Event stages",
    description:
      "Preview LED walls and confidence monitors from the audience's point of view.",
    figure: "/figures/use-case-3.html?play=1",
  },
  {
    title: "Showrooms and galleries",
    description:
      "Walk a space with your team and agree on where every screen and exhibit goes.",
    figure: "/figures/use-case-4.html?play=1",
  },
];

export default function UseCases() {
  const [active, setActive] = useState(0);
  const current = useCases[active];

  return (
    <section
      id="use-cases"
      className="mx-auto w-full max-w-[1200px] px-5 pb-24 pt-8 sm:px-8 sm:pb-32 sm:pt-16"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="text-4xl font-medium leading-[1.15] tracking-[-0.03em] sm:text-5xl">
          For anything people
          <br />
          walk into.
        </h2>
        <p className="text-sm text-zinc-400 sm:pb-1">Use Cases</p>
      </div>

      <div className="mt-12 sm:mt-16">
        <div role="tablist" aria-label="Use cases" className="flex gap-[3px]">
          {useCases.map((item, i) => {
            const selected = i === active;
            return (
              <button
                key={item.title}
                type="button"
                role="tab"
                id={`use-case-tab-${i}`}
                aria-selected={selected}
                aria-controls="use-case-panel"
                onClick={() => setActive(i)}
                className={`h-8 w-24 rounded-t-md text-xs transition-colors ${
                  selected
                    ? "bg-zinc-50 text-zinc-500"
                    : "bg-zinc-100/70 text-zinc-400 hover:bg-zinc-100"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id="use-case-panel"
          aria-labelledby={`use-case-tab-${active}`}
          className="grid overflow-hidden rounded-b-md rounded-tr-md bg-zinc-50 md:min-h-[400px] md:grid-cols-[46fr_54fr]"
        >
          <div className="relative aspect-[4/3] md:aspect-auto">
            {/* All four stay mounted so switching tabs never reloads one; hidden ones sleep. */}
            {useCases.map((item, i) => (
              <iframe
                key={item.title}
                src={item.figure}
                title={`${item.title}: interactive illustration`}
                loading="lazy"
                className={`absolute inset-0 h-full w-full border-0 bg-transparent ${
                  i === active ? "" : "hidden"
                }`}
              />
            ))}
          </div>
          <div className="flex flex-col justify-end p-6 md:p-6 md:pb-8">
            <h3 className="text-4xl font-medium tracking-[-0.03em] sm:text-5xl">
              {current.title}
            </h3>
            <p className="mt-4 max-w-sm text-sm leading-snug text-zinc-400">
              {current.description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
