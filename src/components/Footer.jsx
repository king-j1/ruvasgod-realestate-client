
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
  FaYoutube,
  FaTiktok,
  FaWhatsapp,
} from "react-icons/fa6";
import { Link } from "react-router-dom";

function Footer() {
  const socialLinks = [
    { label: "Facebook", icon: <FaFacebookF />, href: "#" },
    { label: "Instagram", icon: <FaInstagram />, href: "#" },
    { label: "X", icon: <FaXTwitter />, href: "#" },
    { label: "LinkedIn", icon: <FaLinkedinIn />, href: "#" },
    { label: "YouTube", icon: <FaYoutube />, href: "#" },
    { label: "TikTok", icon: <FaTiktok />, href: "#" },
    { label: "WhatsApp", icon: <FaWhatsapp />, href: "#" },
  ];

  return (
    <footer className="relative overflow-hidden bg-[#05070a] text-white">

      {/* Ambient glow */}
      <div className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-cyan-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-blue-600/10 blur-[140px]" />

      {/* Main Footer */}
      <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8">

        <div className="grid gap-14 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">

          {/* BRAND */}
          <div>

            <Link
              to="/"
              className="group inline-flex items-center gap-3"
            >
              <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.06]">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 via-transparent to-blue-500/20" />

                <span className="relative text-sm font-black">
                  R
                </span>
              </div>

              <div className="leading-none">
                <p className="text-[18px] font-black tracking-[0.08em]">
                  RUVASGOD
                </p>

                <p className="mt-1 text-[9px] font-semibold tracking-[0.4em] text-cyan-400">
                  AUTO
                </p>
              </div>
            </Link>

            <p className="mt-7 max-w-md text-sm leading-7 text-slate-400">
              Premium vehicle sales and rentals designed around quality,
              trust, convenience, and a modern driving experience.
            </p>

            {/* Social */}
            <div className="mt-7 flex flex-wrap gap-2.5">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 transition duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white hover:text-slate-950 ${
                    social.label === "WhatsApp"
                      ? "hover:bg-cyan-300"
                      : ""
                  }`}
                >
                  {social.icon}
                </a>
              ))}
            </div>

            {/* Trust statement */}
            <div className="mt-8 flex items-center gap-3">
              <span className="h-px w-8 bg-cyan-400/60" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                Premium Mobility • Ghana
              </span>
            </div>
          </div>

          {/* EXPLORE */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-cyan-400">
              Explore
            </p>

            <div className="mt-6 flex flex-col gap-4 text-sm text-slate-400">

              <Link
                to="/"
                className="transition hover:translate-x-1 hover:text-white"
              >
                Home
              </Link>

              <Link
                to="/vehicles"
                className="transition hover:translate-x-1 hover:text-white"
              >
                Browse Vehicles
              </Link>

              <Link
                to="/register"
                className="transition hover:translate-x-1 hover:text-white"
              >
                Create Account
              </Link>

              <Link
                to="/login"
                className="transition hover:translate-x-1 hover:text-white"
              >
                Customer Login
              </Link>
            </div>
          </div>

          {/* SERVICES */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-cyan-400">
              Services
            </p>

            <div className="mt-6 flex flex-col gap-4 text-sm text-slate-400">
              <span>Vehicle Rentals</span>
              <span>Vehicle Sales</span>
              <span>Long-Term Rentals</span>
              <span>Corporate Rentals</span>
              <span>Premium Vehicles</span>
            </div>
          </div>

          {/* SUPPORT */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-cyan-400">
              Support
            </p>

            <div className="mt-6 flex flex-col gap-4 text-sm text-slate-400">

              <a
                href="tel:+233000000000"
                className="transition hover:text-white"
              >
                +233 00 000 0000
              </a>

              <a
                href="mailto:info@ruvasgodauto.com"
                className="break-all transition hover:text-white"
              >
                info@ruvasgodauto.com
              </a>

              <span>Accra, Ghana</span>

              <span>Mon – Sat: 8AM – 6PM</span>
            </div>

            <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Need assistance?
              </p>

              <p className="mt-2 text-sm font-semibold text-white">
                Our team is ready to help.
              </p>
            </div>
          </div>
        </div>

        {/* RENTAL REQUIREMENTS */}
        <div className="mt-20 overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02]">

          <div className="grid lg:grid-cols-[0.85fr_1.5fr]">

            {/* Intro */}
            <div className="relative border-b border-white/10 p-8 lg:border-b-0 lg:border-r lg:p-10">

              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl" />

              <p className="relative text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400">
                Before You Rent
              </p>

              <h2 className="relative mt-4 text-2xl font-black tracking-tight sm:text-3xl">
                Rental
                <br />
                Requirements
              </h2>

              <p className="relative mt-5 max-w-sm text-sm leading-7 text-slate-400">
                Our verification process helps us provide a safer and more
                trusted rental experience for every customer.
              </p>

              <div className="mt-7 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                <span className="text-xs text-slate-500">
                  Verification protects everyone.
                </span>
              </div>
            </div>

            {/* Requirements */}
            <div className="grid sm:grid-cols-2">

              <div className="border-b border-white/10 p-7 sm:border-r">
                <span className="text-xs font-bold text-cyan-400">
                  01
                </span>

                <h4 className="mt-4 font-semibold text-white">
                  Valid Driver's Licence
                </h4>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Required for every vehicle rental.
                </p>
              </div>

              <div className="border-b border-white/10 p-7">
                <span className="text-xs font-bold text-cyan-400">
                  02
                </span>

                <h4 className="mt-4 font-semibold text-white">
                  Valid Identification
                </h4>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Ghana Card, passport, or another accepted government ID.
                </p>
              </div>

              <div className="p-7 sm:border-r">
                <span className="text-xs font-bold text-cyan-400">
                  03
                </span>

                <h4 className="mt-4 font-semibold text-white">
                  Contact & Address
                </h4>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  A valid phone number and residential address.
                </p>
              </div>

              <div className="p-7">
                <span className="text-xs font-bold text-cyan-400">
                  04
                </span>

                <h4 className="mt-4 font-semibold text-white">
                  Additional Verification
                </h4>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Extra documents may be required for premium or high-value
                  vehicles.
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-7 text-xs text-slate-500 sm:px-8 md:flex-row md:items-center md:justify-between">

          <p>
            © {new Date().getFullYear()} Ruvasgod Auto. All rights reserved.
          </p>

          <div className="flex flex-wrap gap-x-6 gap-y-3">

            <a
              href="#"
              className="transition hover:text-white"
            >
              Privacy Policy
            </a>

            <a
              href="#"
              className="transition hover:text-white"
            >
              Terms & Conditions
            </a>

            <a
              href="#"
              className="transition hover:text-white"
            >
              Rental Policy
            </a>

          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
