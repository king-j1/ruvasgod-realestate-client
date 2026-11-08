import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PropertySearch from "../components/PropertySearch";
import { useLanguage } from "../context/LanguageContext";

const heroImages = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2200&q=85",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2200&q=85",
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2200&q=85",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2200&q=85",
];

function Home() {
  const [activeSlide, setActiveSlide] = useState(0);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroImages.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, []);

  const search = (filters) => {
    const query = new URLSearchParams(
      Object.entries(filters).filter(([, value]) => value !== ""),
    );
    navigate(`/properties${query.size ? `?${query}` : ""}`);
  };

  return (
    <main>
      <section className="home-hero relative isolate min-h-[680px] overflow-hidden">
        {heroImages.map((image, index) => (
          <img
            aria-hidden="true"
            className={`absolute inset-0 -z-20 h-full w-full object-cover transition-opacity duration-700 ${activeSlide === index ? "opacity-100" : "opacity-0"}`}
            key={image}
            src={image}
            alt=""
          />
        ))}
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-stone-950/75 via-stone-950/45 to-stone-950/15" />
        <div className="mx-auto flex min-h-[680px] max-w-7xl flex-col justify-center px-5 py-20 sm:px-8 lg:px-10">
          <div className="max-w-3xl text-white">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-200">Ruvasgod Real Estate</p>
            <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
              {t("heroTitle")}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/85 sm:text-lg">
              {t("heroDescription")}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link className="button-primary rounded-xl px-5 py-3 text-sm font-bold" to="/properties">
                {t("explore")}
              </Link>
              <Link className="rounded-xl border border-white/70 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20" to="/login">
                {t("listProperty")}
              </Link>
            </div>
          </div>

          <div className="mt-12 w-full max-w-5xl rounded-2xl bg-[#fffdf8] p-4 shadow-2xl sm:p-6">
            <PropertySearch compact onSearch={search} />
          </div>
          <p className="mt-3 text-xs text-white/85">{t("staffListingNote")}</p>

          <div className="mt-7 flex items-center gap-2" aria-label="Hero image selection">
            {heroImages.map((image, index) => (
              <button
                key={image}
                aria-label={`Show property image ${index + 1}`}
                aria-pressed={activeSlide === index}
                className={`h-2.5 rounded-full transition-all ${activeSlide === index ? "w-9 bg-amber-200" : "w-2.5 bg-white/65 hover:bg-white"}`}
                onClick={() => setActiveSlide(index)}
                type="button"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-900">Ruvasgod Real Estate</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">{t("featuredTitle")}</h2>
            <p className="mt-4 leading-7 text-stone-600">{t("featuredDescription")}</p>
          </div>
          <Link className="text-sm font-bold text-amber-900 hover:text-amber-700" to="/properties">
            {t("explore")} <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {heroImages.slice(1).map((image, index) => (
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-100" key={image}>
              <img className="aspect-[4/3] w-full object-cover" src={image} alt="" loading="lazy" />
              <p className="px-5 py-4 text-sm font-semibold text-stone-800">
                {[t("house"), t("land"), t("properties")][index]}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Home;
