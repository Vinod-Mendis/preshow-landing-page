import Image from "next/image";

export default function Footer() {
  return (
    <footer className="relative isolate overflow-hidden bg-white">
      {/* Soft rainbow ribbon behind the device */}
      <div
        aria-hidden
        className="absolute inset-x-[-10%] top-[22%] -z-10 h-[16%] -rotate-3 opacity-80 blur-2xl"
        style={{
          backgroundImage:
            "linear-gradient(90deg, #8db9ff 0%, #b9d4ff 22%, #ffd9a8 42%, #ff9d6e 55%, #f4b0ff 72%, #a9cbff 100%)",
        }}
      />
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
        <Image src="/images/logo.png" alt="" width={28} height={13} />
        <span className="text-xs text-zinc-300">Pre-show.</span>
      </div>
    </footer>
  );
}
