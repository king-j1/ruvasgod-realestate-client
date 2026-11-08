import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTiktok,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import { FiMapPin, FiPhone, FiMail, FiMessageCircle } from "react-icons/fi";

const socialLinks = [
  ["Facebook", FaFacebookF],
  ["Instagram", FaInstagram],
  ["LinkedIn", FaLinkedinIn],
  ["X", FaXTwitter],
  ["YouTube", FaYoutube],
  ["TikTok", FaTiktok],
];

const contactItems = [
  ["Office address", "Contact details coming soon", FiMapPin],
  ["Telephone", "Coming soon", FiPhone],
  ["Email", "Coming soon", FiMail],
  ["WhatsApp", "Coming soon", FiMessageCircle],
];

function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-[#f7f3eb] text-stone-800">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-9 px-5 py-10 sm:grid-cols-2 sm:px-8 sm:py-12 lg:grid-cols-4 lg:gap-8 lg:px-10">
        <section aria-labelledby="footer-company-heading">
          <h2 className="sr-only" id="footer-company-heading">Company</h2>
          <Link className="inline-flex items-center gap-3" to="/">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-900 text-lg font-bold text-white" aria-hidden="true">R</span>
            <span className="leading-tight">
              <span className="block text-sm font-extrabold tracking-wide text-stone-900">RUVA GOD</span>
              <span className="block text-[10px] font-semibold tracking-[0.16em] text-amber-900">REAL ESTATE</span>
            </span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-stone-700">
            Your trusted partner for property discovery, sales and real estate services.
          </p>
          <p className="mt-3 max-w-sm text-xs leading-5 text-stone-600">
            Browse property listings verified and approved for publication, with customer service from the Ruvasgod team.
          </p>
        </section>

        <nav aria-label="Quick links">
          <h2 className="text-sm font-bold text-stone-900">Quick links</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li><Link className="text-stone-700 hover:text-amber-900 hover:underline" to="/">Home</Link></li>
            <li><Link className="text-stone-700 hover:text-amber-900 hover:underline" to="/properties">Properties</Link></li>
            <li><Link className="text-stone-700 hover:text-amber-900 hover:underline" to="/login">Sign in</Link></li>
            <li><Link className="text-stone-700 hover:text-amber-900 hover:underline" to="/register">Register</Link></li>
          </ul>
        </nav>

        <section aria-labelledby="footer-contact-heading">
          <h2 className="text-sm font-bold text-stone-900" id="footer-contact-heading">Contact information</h2>
          <ul className="mt-4 space-y-3">
            {contactItems.map(([label, value, Icon]) => (
              <li className="flex min-w-0 items-start gap-2.5 text-sm" key={label}>
                <Icon className="mt-0.5 shrink-0 text-amber-900" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block font-semibold text-stone-800">{label}</span>
                  <span className="block break-words text-stone-600">{value}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="footer-social-heading">
          <h2 className="text-sm font-bold text-stone-900" id="footer-social-heading">Follow us</h2>
          <p className="mt-2 text-xs leading-5 text-stone-600">Social links will be added when official profiles are provided.</p>
          <ul className="mt-4 grid grid-cols-2 gap-3">
            {socialLinks.map(([label, Icon]) => (
              <li className="flex min-h-10 items-center gap-2 rounded-lg border border-stone-200 bg-white/70 px-3 text-xs font-semibold text-stone-700" key={label}>
                <Icon className="shrink-0 text-amber-900" aria-hidden="true" />
                <span>{label}</span>
                <span className="sr-only">link coming soon</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="border-t border-stone-200 px-5 py-4 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl text-center text-xs text-stone-600 sm:text-start">
          © {new Date().getFullYear()} Ruvasgod Real Estate. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
