import Image from "next/image";
import FooterWayglimBackground from "@/components/FooterWayglimBackground";

// The animated wave: full width, this slice of the footer, faded top and bottom.
const WAVE_TOP = 12; // % of the footer height
const WAVE_HEIGHT = 55; // % of the footer height
const waveMask =
  "linear-gradient(to bottom, transparent, black 25%, black 65%, transparent)";

export default function Footer() {
  return (
    <footer className="relative isolate overflow-hidden bg-white">
      {/* Animated wave behind the device (not CSS-scaled; cheap via the
          half-resolution maxPixelRatio in FooterWayglimBackground.jsx) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -z-10 overflow-hidden"
        style={{
          top: `${WAVE_TOP}%`,
          height: `${WAVE_HEIGHT}%`,
          maskImage: waveMask,
          WebkitMaskImage: waveMask,
        }}
      >
        <FooterWayglimBackground />
      </div>
      {/* Gray arch with a white arch cut into it */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-10 h-[34%] rounded-t-[20vw] bg-zinc-200/70"
      />
      <div
        aria-hidden
        className="absolute bottom-0 left-[9%] right-[7%] -z-10 h-[16%] rounded-t-[16vw] bg-white"
      />

      <h2 className="px-4 pt-[14%] text-center text-2xl font-medium tracking-[-0.02em] sm:pt-[13%] sm:text-3xl">
        Mobile friendly too.
      </h2>

      <div className="relative mx-auto -mt-[4%] w-[84%] max-w-[1100px]">
        <Image
          src="/images/footer-mockup.png"
          alt="Pre-show BoothViewer running on a foldable tablet held in both hands"
          width={1440}
          height={1080}
          sizes="(min-width: 1310px) 1100px, 84vw"
          className="h-auto w-full"
        />
      </div>

      <div className="absolute inset-x-0 bottom-[3%] flex flex-col items-center gap-1">
        <Image src="/images/logo.svg" alt="" width={28} height={13} />
        <span className="text-xs text-zinc-300">Pre-show.</span>
      </div>
    </footer>
  );
}
