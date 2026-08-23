
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
  return (
    <footer className="bg-slate-950 text-white">
      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link
              to="/"
              className="text-2xl font-bold tracking-tight"
            >
              RUVASGOD AUTO
            </Link>

            <p className="mt-5 max-w-md leading-7 text-slate-400">
              Premium vehicle sales and rentals designed around quality,
              trust, convenience, and a modern driving experience.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-800 text-slate-300 transition hover:bg-white hover:text-slate-950"
              >
                <FaFacebookF />
              </a>

              <a
                href="#"
                aria-label="Instagram"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-800 text-slate-300 transition hover:bg-white hover:text-slate-950"
              >
                <FaInstagram />
              </a>

              <a
                href="#"
                aria-label="X"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-800 text-slate-300 transition hover:bg-white hover:text-slate-950"
              >
                <FaXTwitter />
              </a>

              <a
                href="#"
                aria-label="LinkedIn"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-800 text-slate-300 transition hover:bg-white hover:text-slate-950"
              >
                <FaLinkedinIn />
              </a>

              <a
                href="#"
                aria-label="YouTube"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-800 text-slate-300 transition hover:bg-white hover:text-slate-950"
              >
                <FaYoutube />
              </a>

              <a
                href="#"
                aria-label="TikTok"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-800 text-slate-300 transition hover:bg-white hover:text-slate-950"
              >
                <FaTiktok />
              </a>

              <a
                href="#"
                aria-label="WhatsApp"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-green-600 text-white transition hover:bg-green-500"
              >
                <FaWhatsapp />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Explore
            </h3>

            <div className="mt-5 flex flex-col gap-3 text-sm text-slate-400">
              <Link to="/" className="hover:text-white">
                Home
              </Link>

              <Link to="/vehicles" className="hover:text-white">
                Browse Vehicles
              </Link>

              <Link to="/register" className="hover:text-white">
                Create Account
              </Link>

              <Link to="/login" className="hover:text-white">
                Customer Login
              </Link>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Services
            </h3>

            <div className="mt-5 flex flex-col gap-3 text-sm text-slate-400">
              <span>Vehicle Rentals</span>
              <span>Vehicle Sales</span>
              <span>Long-Term Rentals</span>
              <span>Corporate Rentals</span>
              <span>Premium Vehicles</span>
            </div>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Support
            </h3>

            <div className="mt-5 flex flex-col gap-3 text-sm text-slate-400">
              <a href="tel:+233000000000" className="hover:text-white">
                +233 00 000 0000
              </a>

              <a
                href="mailto:info@ruvasgodauto.com"
                className="hover:text-white"
              >
                info@ruvasgodauto.com
              </a>

              <span>Accra, Ghana</span>
              <span>Mon – Sat: 8AM – 6PM</span>
            </div>
          </div>
        </div>

        {/* Rental Requirements */}
        <div className="mt-16 rounded-3xl border border-slate-800 bg-slate-900 p-8 md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_2fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">
                Before You Rent
              </p>

              <h2 className="mt-3 text-2xl font-bold">
                Rental Requirements
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Our verification process helps us provide a safer and more
                trusted rental experience for every customer.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-800 p-5">
                <h4 className="font-semibold">Valid Driver's Licence</h4>
                <p className="mt-2 text-sm text-slate-400">
                  Required for every vehicle rental.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-800 p-5">
                <h4 className="font-semibold">Valid Identification</h4>
                <p className="mt-2 text-sm text-slate-400">
                  Ghana Card, passport, or other accepted government ID.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-800 p-5">
                <h4 className="font-semibold">Contact & Address</h4>
                <p className="mt-2 text-sm text-slate-400">
                  A valid phone number and residential address.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-800 p-5">
                <h4 className="font-semibold">Additional Verification</h4>
                <p className="mt-2 text-sm text-slate-400">
                  Extra documents may be required for premium or high-value
                  vehicles.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} Ruvasgod Auto. All rights reserved.
          </p>

          <div className="flex flex-wrap gap-5">
            <a href="#" className="hover:text-white">
              Privacy Policy
            </a>

            <a href="#" className="hover:text-white">
              Terms & Conditions
            </a>

            <a href="#" className="hover:text-white">
              Rental Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
