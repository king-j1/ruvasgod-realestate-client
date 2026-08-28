
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero */}
      <section className="relative min-h-[calc(100vh-64px)] overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2200&q=90')",
          }}
        />

        {/* Dark futuristic overlay */}
        <div className="absolute inset-0 bg-slate-950/75" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-slate-950/30" />

        {/* Glow */}
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

        {/* Content */}
        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-64px)] max-w-7xl items-center px-6 py-20 lg:px-8">
          <div className="max-w-4xl">
            {/* Small label */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.9)]" />

              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-300">
                Premium Mobility
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl lg:text-8xl">
              Drive the
              <span className="block bg-gradient-to-r from-white via-slate-200 to-cyan-300 bg-clip-text text-transparent">
                exceptional.
              </span>
            </h1>

            {/* Description */}
            <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              Discover premium vehicles for rental and purchase, backed by a
              modern automotive experience built around trust, convenience,
              and exceptional service.
            </p>

            {/* Buttons */}
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/vehicles"
                className="rounded-xl bg-white px-7 py-3.5 text-center text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
              >
                Explore Vehicles
              </Link>

              <Link
                to="/register"
                className="rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 text-center text-sm font-bold text-white backdrop-blur-md transition hover:border-cyan-400/50 hover:bg-white/10"
              >
                Create Account
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-14 grid max-w-2xl grid-cols-2 gap-6 border-t border-white/10 pt-8 sm:grid-cols-4">
              <div>
                <p className="text-2xl font-black">01</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-slate-400">
                  Premium Fleet
                </p>
              </div>

              <div>
                <p className="text-2xl font-black">24/7</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-slate-400">
                  Support
                </p>
              </div>

              <div>
                <p className="text-2xl font-black">100%</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-slate-400">
                  Secure
                </p>
              </div>

              <div>
                <p className="text-2xl font-black">GHA</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-slate-400">
                  Ghana
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent" />
      </section>

      {/* Premium intro section */}
      <section className="border-t border-white/5 bg-slate-950 px-6 py-24 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-400">
              RUVASGOD AUTO
            </p>

            <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
              More than a car.
              <span className="block text-slate-400">
                It is your next journey.
              </span>
            </h2>
          </div>

          <div>
            <p className="text-lg leading-8 text-slate-400">
              From everyday mobility to premium vehicles, Ruvasgod Auto brings
              vehicle rental and sales together in one simple digital
              experience.
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
    </div>
  );
}

export default Home;

