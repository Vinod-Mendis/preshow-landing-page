"use client";

import Image from "next/image";
import { useState } from "react";

const useCases = [
  {
    title: "Trade show booths",
    description:
      "Check aisle sightlines, counter placement, and screen sizes before the build crew arrives.",
    image: "/images/use-case-1.png",
  },
  {
    title: "Retail stores",
    description:
      "Test display walls and in-store screens at real scale before a single fixture is ordered.",
    image: "/images/use-case-2.png",
  },
  {
    title: "Event stages",
    description:
      "Preview LED walls and confidence monitors from the audience's point of view.",
    image: "/images/use-case-3.png",
  },
  {
    title: "Showrooms and galleries",
    description:
      "Walk a space with your team and agree on where every screen and exhibit goes.",
    image: "/images/use-case-4.png",
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
                    ? "bg-zinc-200/70 text-zinc-500"
                    : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200/50"
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
          className="grid overflow-hidden rounded-b-md rounded-tr-md bg-zinc-200/70 md:min-h-[360px] md:grid-cols-[39fr_61fr]"
        >
          <div className="relative aspect-[4/3] bg-zinc-50 md:aspect-auto">
            <Image
              key={current.image}
              src={current.image}
              alt=""
              fill
              sizes="(min-width: 1200px) 450px, (min-width: 768px) 40vw, 90vw"
              className="object-contain"
            />
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
