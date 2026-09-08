
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import GoogleSignInButton from "../components/GoogleSignInButton";

function Register() {
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);

      if (form.password !== form.confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      await register(
        form.username,
        form.name,
        form.email,
        form.phone,
        form.password,
      );

      navigate("/login");
    } catch (error) {
      setError(
        error.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCredential = async (credential) => {
    try {
      setError("");
      setLoading(true);

      const data = await googleLogin(credential);

      navigate(
        data.user.role === "admin" ? "/admin" : "/vehicles",
      );
    } catch (googleError) {
      setError(
        googleError.message || "Unable to continue with Google.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07090c] text-white">
      {/* Background atmosphere */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-cyan-400/[0.06] blur-3xl" />

        <div className="absolute -bottom-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-blue-500/[0.05] blur-3xl" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.025),_transparent_55%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#0b0e12] shadow-2xl shadow-black/40 lg:grid-cols-[0.85fr_1fr]">
          {/* Registration form */}
          <section className="order-2 flex items-center justify-center px-6 py-12 sm:px-10 lg:order-1 lg:px-12 xl:px-16">
            <div className="w-full max-w-md">
              {/* Heading */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-300/70">
                  RUVASGOD AUTO
                </p>

                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white">
                  Create your account.
                </h1>

                <p className="mt-3 text-sm leading-6 text-white/40">
                  Join Ruvasgod Auto and start your journey.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="mt-7 rounded-2xl border border-red-400/20 bg-red-400/[0.07] p-4 text-sm leading-6 text-red-300">
                  {error}
                </div>
              )}

              {/* Google */}
              <div className={error ? "mt-5" : "mt-8"}>
                <GoogleSignInButton
                  onCredential={handleGoogleCredential}
                  onError={() =>
                    setError("Unable to load Google sign-in.")
                  }
                />
              </div>

              {/* Divider */}
              <div className="my-7 flex items-center gap-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/20">
                <span className="h-px flex-1 bg-white/[0.08]" />
                or create with email
                <span className="h-px flex-1 bg-white/[0.08]" />
              </div>

              <form onSubmit={handleSubmit}>
                {/* Username */}
                <div>
                  <label
                    htmlFor="username"
                    className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40"
                  >
                    Username
                  </label>

                  <input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Choose a username"
                    value={form.username}
                    onChange={handleChange}
                    required
                    minLength={3}
                    maxLength={20}
                    pattern="[A-Za-z0-9_]+"
                    title="Use 3 to 20 letters, numbers, or underscores"
                    autoComplete="username"
                    className="w-full rounded-xl border border-white/[0.09] bg-white/[0.035] px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/20 transition focus:border-cyan-300/40 focus:bg-white/[0.05] focus:ring-2 focus:ring-cyan-300/10"
                  />

                  <p className="mt-2 text-[11px] text-white/25">
                    3–20 characters • letters, numbers, underscores
                  </p>
                </div>

                {/* Full name */}
                <div className="mt-5">
                  <label
                    htmlFor="name"
                    className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40"
                  >
                    Full Name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                    className="w-full rounded-xl border border-white/[0.09] bg-white/[0.035] px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/20 transition focus:border-cyan-300/40 focus:bg-white/[0.05] focus:ring-2 focus:ring-cyan-300/10"
                  />
                </div>

                {/* Email */}
                <div className="mt-5">
                  <label
                    htmlFor="email"
                    className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40"
                  >
                    Email Address
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    className="w-full rounded-xl border border-white/[0.09] bg-white/[0.035] px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/20 transition focus:border-cyan-300/40 focus:bg-white/[0.05] focus:ring-2 focus:ring-cyan-300/10"
                  />
                </div>

                {/* Phone */}
                <div className="mt-5">
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40"
                  >
                    Phone Number
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Phone number"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    autoComplete="tel"
                    className="w-full rounded-xl border border-white/[0.09] bg-white/[0.035] px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/20 transition focus:border-cyan-300/40 focus:bg-white/[0.05] focus:ring-2 focus:ring-cyan-300/10"
                  />
                </div>

                {/* Password */}
                <div className="mt-5">
                  <label
                    htmlFor="password"
                    className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      minLength={12}
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-white/[0.09] bg-white/[0.035] px-4 py-3.5 pr-20 text-sm text-white outline-none placeholder:text-white/20 transition focus:border-cyan-300/40 focus:bg-white/[0.05] focus:ring-2 focus:ring-cyan-300/10"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((visible) => !visible)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1.5 text-xs font-medium text-white/35 transition hover:bg-white/[0.05] hover:text-white/70"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>

                  <p className="mt-2 text-[11px] text-white/25">
                    Minimum 12 characters
                  </p>
                </div>

                {/* Confirm password */}
                <div className="mt-5">
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40"
                  >
                    Confirm Password
                  </label>

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength={12}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-white/[0.09] bg-white/[0.035] px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/20 transition focus:border-cyan-300/40 focus:bg-white/[0.05] focus:ring-2 focus:ring-cyan-300/10"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-7 flex w-full items-center justify-center rounded-xl bg-white px-4 py-3.5 text-sm font-semibold text-black transition duration-300 hover:bg-cyan-300 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                      Creating account...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>

              {/* Login */}
              <p className="mt-8 text-center text-sm text-white/35">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-white transition hover:text-cyan-300"
                >
                  Sign in
                </Link>
              </p>

              <p className="mt-6 text-center text-[10px] uppercase tracking-[0.16em] text-white/15">
                Secure registration • Ruvasgod Auto
              </p>
            </div>
          </section>

          {/* Brand panel */}
          <section className="order-1 relative hidden min-h-[760px] overflow-hidden lg:order-2 lg:block">
            <img
              src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1600&q=85"
              alt="Premium vehicle"
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-black/55" />
            <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/30 to-cyan-950/40" />

            <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
                  RUVASGOD AUTO
                </p>

                <div className="mt-10 max-w-lg">
                  <p className="text-sm font-medium uppercase tracking-[0.22em] text-white/45">
                    Your Journey
                  </p>

                  <h2 className="mt-4 text-5xl font-semibold leading-[1.02] tracking-[-0.05em] text-white xl:text-6xl">
                    Your vehicle.
                    <span className="block text-cyan-300">
                      Your freedom.
                    </span>
                  </h2>

                  <p className="mt-6 max-w-md text-base leading-7 text-white/55">
                    Create your account and unlock a smarter way to rent,
                    explore, and own quality vehicles in Ghana.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-8 text-xs uppercase tracking-[0.18em] text-white/35">
                <span>Rent</span>
                <span className="h-1 w-1 rounded-full bg-cyan-300/60" />
                <span>Buy</span>
                <span className="h-1 w-1 rounded-full bg-cyan-300/60" />
                <span>Own</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default Register;
