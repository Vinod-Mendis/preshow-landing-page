import Image from "next/image";
import HeroBackground from "@/components/HeroBackground";
import Footer from "@/components/sections/Footer";
import UseCases from "@/components/sections/UseCases";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Use cases", href: "#use-cases" },
];

// Placeholder until the real clips exist (public/media/details-N.mp4): one stock video,
// resized by Cloudinary to 1080px wide so four cards don't pull the 16 MB 4K original.
const PLACEHOLDER_VIDEO =
  "https://res.cloudinary.com/vccpsacloud/video/upload/q_auto,w_1080/v1774428895/9329508-uhd_2160_4096_25fps_nitgxj.mp4";

const details = [
  { title: "Orbit and Walk Navigation", video: PLACEHOLDER_VIDEO },
  { title: "Real-Scale Custom Screens", video: PLACEHOLDER_VIDEO },
  { title: "Persistent Video Playback", video: PLACEHOLDER_VIDEO },
  { title: "Live Web Pages in 3D", video: PLACEHOLDER_VIDEO },
];

const steps = [
  {
    title: "Upload your model",
    description:
      "Drop a .glb or .gltf file and set its units to real-world scale.",
    figure: "/figures/step-1.html?play=1",
  },
  {
    title: "Place your screens",
    description:
      "Add screens at true size, then load a video or a live web page on each.",
    figure: "/figures/step-2.html?play=1",
  },
  {
    title: "Walk through it",
    description:
      "Orbit the booth or walk it at eye level, and share the layout with your team.",
    figure: "/figures/step-3.html?play=1",
  },
];

export default function Home() {
  return (
    <main>
      <section
        id="home"
        className="relative isolate overflow-hidden text-black"
      >
        <HeroBackground />

        <header className="relative z-10 flex items-center justify-center gap-6 px-4 pt-5 sm:gap-10">
          <a href="#home" aria-label="Pre-show home" className="group shrink-0">
            <Image
              src="/images/logo.svg"
              alt="Pre-show logo"
              width={44}
              height={20}
              priority
              className="transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:rotate-360 group-focus-visible:rotate-360 motion-reduce:transition-none"
            />
          </a>
          <nav aria-label="Primary">
            <ul className="flex items-center gap-4 text-[15px] sm:gap-7 sm:text-base">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="transition-opacity hover:opacity-60"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        <div className="relative z-10 flex flex-col items-center px-4 pt-[clamp(2.5rem,7vw,7rem)]">
          <h1 className="text-[clamp(3.5rem,9.5vw,8rem)] font-bold leading-none tracking-[-0.05em]">
            Pre–show.
          </h1>
          <a
            href="#demo"
            className="mt-[clamp(1.5rem,3vw,3rem)] rounded-md bg-black px-3 py-2.5 text-base text-white transition-colors hover:bg-zinc-800"
          >
            Try Demo
          </a>
        </div>

        <div className="relative z-10 mx-auto mt-[clamp(1.5rem,4vw,4rem)] w-[88%] max-w-[1420px]">
          <Image
            src="/images/hero-mockup.png"
            alt="Pre-show BoothViewer showing a 3D exhibition booth with screen placement controls"
            width={1240}
            height={1022}
            sizes="(min-width: 1614px) 1420px, 88vw"
            className="h-auto w-full"
            priority
          />
        </div>
      </section>

      <section className="flex flex-col items-center bg-white px-4 pb-32 pt-12 text-center sm:pt-16">
        <Image src="/images/logo.svg" alt="" width={28} height={13} />
        <p className="mt-5 max-w-[34rem] text-[clamp(1.5rem,2.6vw,1.75rem)] font-medium leading-[1.15] tracking-[-0.02em]">
          Walk through your booth before it&rsquo;s built. Place real-scale screens,
          play videos, and run live websites right inside the 3D space.
        </p>
      </section>

      <section
        id="features"
        className="mx-auto w-full max-w-[1200px] px-5 pb-24 pt-8 sm:px-8 sm:pb-32 sm:pt-16"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-5xl font-medium leading-none tracking-[-0.04em] sm:text-6xl">
            The Details.
          </h2>
          <p className="text-sm text-zinc-400 sm:pb-2">
            Everything you need, nothing you don&rsquo;t.
          </p>
        </div>

        <ul className="mt-12 grid gap-x-8 gap-y-8 sm:mt-16 sm:grid-cols-2">
          {details.map((item) => (
            <li key={item.title}>
              <div className="rounded-lg bg-zinc-100 p-[4.5%]">
                <div className="relative aspect-[1.43] overflow-hidden rounded-[3px] bg-zinc-900">
                  <video
                    src={item.video}
                    aria-label={item.title}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              </div>
              <p className="mt-4 text-[15px] text-zinc-400">{item.title}</p>
            </li>
          ))}
        </ul>
      </section>

      <section
        id="how-it-works"
        className="mx-auto w-full max-w-[1200px] px-5 pb-24 pt-8 sm:px-8 sm:pb-32 sm:pt-16"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-4xl font-medium leading-[1.15] tracking-[-0.03em] sm:text-5xl">
            Three steps
            <br />
            to a walkable review.
          </h2>
          <p className="text-sm text-zinc-400 sm:pb-1">How it works</p>
        </div>

        <ol className="mt-12 grid gap-6 sm:mt-16 md:grid-cols-3 md:gap-8">
          {steps.map((step) => (
            <li
              key={step.title}
              className="overflow-hidden rounded-md bg-zinc-50"
            >
              <div className="h-[18px] bg-zinc-50" />
              <div className="relative aspect-[1.7] bg-zinc-50">
                <iframe
                  src={step.figure}
                  title={`${step.title}: interactive illustration`}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full border-0 bg-transparent"
                />
              </div>
              <div className="bg-zinc-50 px-5 pb-5 pt-3">
                <h3 className="text-[13px] font-medium">{step.title}</h3>
                <p className="mt-2 text-[13px] leading-snug text-zinc-400">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <UseCases />
      <Footer />
    </main>
  );
}
