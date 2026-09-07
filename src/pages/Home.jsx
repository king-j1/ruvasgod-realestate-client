import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const slides = [
  {
    eyebrow: "Premium Mobility",
    title: "Drive Beyond Ordinary.",
    description:
      "Premium vehicles. Seamless rentals. A smarter way to move through Ghana.",
    primary: "Rent a Vehicle",
    primaryLink: "/vehicles",
    secondary: "Explore Fleet",
    secondaryLink: "/vehicles",
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2200&q=90",
  },
  {
    eyebrow: "The Ruvasgod Experience",
    title: "Your Journey. Your Vehicle.",
    description:
      "Built for business, travel, everyday mobility, and every road between.",
    primary: "View Vehicles",
    primaryLink: "/vehicles",
    secondary: "Create Account",
    secondaryLink: "/register",
    image:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=2200&q=90",
  },
  {
    eyebrow: "Vehicle Sales",
    title: "Find Your Next Vehicle.",
    description:
      "Explore quality vehicles available for purchase through the Ruvasgod Auto platform.",
    primary: "Explore Vehicles",
    primaryLink: "/vehicles",
    secondary: "Create Account",
    secondaryLink: "/register",
    image:
      "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=2200&q=90",
  },
];

function Home() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isVideoReady, setIsVideoReady] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 7000);

    return () => clearInterval(timer);
  }, []);

  const slide = slides[activeSlide];

  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* =====================================================
          HERO
      ===================================================== */}
      <section className="relative min-h-[calc(100vh-64px)] overflow-hidden">
        {/* Image fallback */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[7000ms] ease-out"
          style={{
            backgroundImage: `url("${slide.image}")`,
            transform: "scale(1.05)",
          }}
        />

        {/* Optional future video layer */}
        {isVideoReady && (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          >
            <source
              src="YOUR_RUVASGOD_HERO_VIDEO_URL"
              type="video/mp4"
            />
          </video>
        )}

        {/* Cinematic overlays */}
        <div className="absolute inset-0 bg-slate-950/55" />

        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/75 to-slate-950/20" />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/20" />

        {/* Ambient glow */}
        <div className="absolute -left-40 top-1/4 h-[32rem] w-[32rem] rounded-full bg-cyan-500/10 blur-[120px]" />

        <div className="absolute -right-40 bottom-0 h-[30rem] w-[30rem] rounded-full bg-blue-500/10 blur-[120px]" />

        {/* Hero content */}
        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-64px)] max-w-7xl items-center px-6 py-20 lg:px-8">
          <div className="max-w-5xl">
            {/* Eyebrow */}
            <div
              key={`${activeSlide}-eyebrow`}
              className="animate-[fadeIn_0.8s_ease-out]"
            >
              <div className="mb-7 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-2 backdrop-blur-xl">
                <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_16px_rgba(34,211,238,0.9)]" />

                <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-300">
                  {slide.eyebrow}
                </span>
              </div>
            </div>

            {/* Heading */}
            <div
              key={`${activeSlide}-title`}
              className="animate-[fadeInUp_0.8s_ease-out]"
            >
              <h1 className="max-w-5xl text-5xl font-black leading-[0.9] tracking-[-0.04em] sm:text-7xl lg:text-[7.5rem]">
                {slide.title.split(" ").map((word, index) => (
                  <span
                    key={`${word}-${index}`}
                    className={
                      index === slide.title.split(" ").length - 1
                        ? "block bg-gradient-to-r from-white via-white to-cyan-300 bg-clip-text text-transparent"
                        : ""
                    }
                  >
                    {word}{" "}
                  </span>
                ))}
              </h1>
            </div>

            {/* Description */}
            <div
              key={`${activeSlide}-description`}
              className="animate-[fadeIn_1s_ease-out]"
            >
              <p className="mt-8 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
                {slide.description}
              </p>
            </div>

            {/* Actions */}
            <div
              key={`${activeSlide}-actions`}
              className="mt-9 flex flex-col gap-3 animate-[fadeInUp_1s_ease-out] sm:flex-row"
            >
              <Link
                to={slide.primaryLink}
                className="group inline-flex items-center justify-center gap-3 rounded-xl bg-white px-7 py-4 text-sm font-bold text-slate-950 shadow-2xl shadow-black/20 transition duration-300 hover:-translate-y-0.5 hover:bg-cyan-300"
              >
                {slide.primary}

                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>

              <Link
                to={slide.secondaryLink}
                className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-7 py-4 text-sm font-bold text-white backdrop-blur-xl transition duration-300 hover:border-white/40 hover:bg-white/10"
              >
                {slide.secondary}
              </Link>
            </div>

            {/* Bottom information */}
            <div className="mt-14 flex flex-col gap-8 border-t border-white/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
              <div className="grid grid-cols-3 gap-8">
                <div>
                  <p className="text-xl font-black sm:text-2xl">01</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Premium Fleet
                  </p>
                </div>

                <div>
                  <p className="text-xl font-black sm:text-2xl">24/7</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Support
                  </p>
                </div>

                <div>
                  <p className="text-xl font-black sm:text-2xl">GHA</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Ghana
                  </p>
                </div>
              </div>

              {/* Slide controls */}
              <div className="flex items-center gap-3">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      index === activeSlide
                        ? "w-12 bg-cyan-400"
                        : "w-5 bg-white/25 hover:bg-white/50"
                    }`}
                  />
                ))}

                <span className="ml-2 text-xs font-semibold tracking-[0.2em] text-slate-500">
                  0{activeSlide + 1}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 right-8 z-20 hidden items-center gap-3 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500 lg:flex">
          <span>Scroll</span>
          <span className="h-px w-10 bg-white/20" />
        </div>
      </section>

      {/* =====================================================
          BRAND INTRO
      ===================================================== */}
      <section className="border-t border-white/5 bg-slate-950 px-6 py-24 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-400">
              RUVASGOD AUTO
            </p>

            <h2 className="mt-4 max-w-xl text-4xl font-black tracking-tight sm:text-5xl">
              More than a car.
              <span className="block text-slate-500">
                It is your next journey.
              </span>
            </h2>
          </div>

          <div>
            <p className="max-w-xl text-lg leading-8 text-slate-400">
              From everyday mobility to premium vehicles, Ruvasgod Auto brings
              vehicle rental and sales together in one digital experience.
            </p>

            <Link
              to="/vehicles"
              className="mt-6 inline-flex text-sm font-bold text-white transition hover:text-cyan-400"
            >
              View our vehicles →
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          BUSINESS PILLARS
      ===================================================== */}
      <section className="border-t border-white/5 bg-white px-6 py-24 text-slate-950 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-600">
              The Ruvasgod Standard
            </p>

            <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
              Built around the way you move.
            </h2>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
              <span className="text-xs font-black tracking-[0.2em] text-slate-400">
                01
              </span>

              <h3 className="mt-8 text-2xl font-black">Rent</h3>

              <p className="mt-4 leading-7 text-slate-500">
                Flexible vehicle rentals designed around your dates,
                destination, and journey.
              </p>

              <Link
                to="/vehicles"
                className="mt-7 inline-flex text-sm font-bold text-slate-950 hover:text-cyan-600"
              >
                Explore rentals →
              </Link>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
              <span className="text-xs font-black tracking-[0.2em] text-slate-400">
                02
              </span>

              <h3 className="mt-8 text-2xl font-black">Own</h3>

              <p className="mt-4 leading-7 text-slate-500">
                Discover quality vehicles available for purchase through our
                growing automotive platform.
              </p>

              <Link
                to="/vehicles"
                className="mt-7 inline-flex text-sm font-bold text-slate-950 hover:text-cyan-600"
              >
                Explore vehicles →
              </Link>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
              <span className="text-xs font-black tracking-[0.2em] text-slate-400">
                03
              </span>

              <h3 className="mt-8 text-2xl font-black">Experience</h3>

              <p className="mt-4 leading-7 text-slate-500">
                A modern digital experience connecting customers, vehicles,
                payments, and service.
              </p>

              <Link
                to="/register"
                className="mt-7 inline-flex text-sm font-bold text-slate-950 hover:text-cyan-600"
              >
                Join Ruvasgod →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          SMALL FOOTER CTA
      ===================================================== */}
      <section className="bg-slate-950 px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-8 sm:p-12 lg:p-16">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-400">
              Start Moving
            </p>

            <h2 className="mt-5 text-4xl font-black tracking-tight sm:text-6xl">
              Your next road starts here.
            </h2>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
              Explore the Ruvasgod Auto fleet and find the vehicle that fits
              your next journey.
            </p>

            <Link
              to="/vehicles"
              className="mt-8 inline-flex rounded-xl bg-white px-7 py-4 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
            >
              Explore Vehicles →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;