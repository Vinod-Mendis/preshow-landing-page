import WayglimBackground from "@/components/WayglimBackground";

/**
 * Animated hero background (first viewport only).
 *
 * The shader is not CSS-scaled (the engine measures its container with
 * getBoundingClientRect, which a transform would distort); it is made cheap by
 * the half-resolution `maxPixelRatio` in WayglimBackground.jsx.
 *
 * It fills the full width and the top `AREA_HEIGHT`% of the viewport. The engine
 * scales the wave to cover that box, so a wide, short box shows a full-width wave
 * cropped vertically. The bottom fades to white.
 */
const AREA_HEIGHT = 60; // % of the viewport height
const FADE_BOTTOM_START = 65; // % of the area where the bottom fade begins

const mask = `linear-gradient(to bottom, black ${FADE_BOTTOM_START}%, transparent)`;

export default function HeroBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-0 top-0 -z-10 w-full overflow-hidden"
      style={{
        height: `${AREA_HEIGHT}svh`,
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
    >
      <WayglimBackground />
    </div>
  );
}
