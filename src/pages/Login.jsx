
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import GoogleSignInButton from "../components/GoogleSignInButton";

function Login() {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    identifier: "",
    password: "",
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

      const data = await login(form.identifier, form.password);

      if (data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/vehicles");
      }
    } catch (error) {
      setError(error.message || "Unable to sign in. Please try again.");
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
        googleError.message || "Unable to sign in with Google.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07090c] text-white">
      {/* Background atmosphere */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-cyan-400/[0.06] blur-3xl" />

        <div className="absolute -bottom-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-blue-500/[0.05] blur-3xl" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.025),_transparent_55%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#0b0e12] shadow-2xl shadow-black/40 lg:grid-cols-[1fr_0.85fr]">
          {/* Brand panel */}
          <section className="relative hidden min-h-[680px] overflow-hidden lg:block">
            <img
              src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85"
              alt="Premium vehicle"
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-black/55" />
            <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/35 to-cyan-950/40" />

            <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
                  RUVASGOD AUTO
                </p>

                <div className="mt-10 max-w-lg">
                  <p className="text-sm font-medium uppercase tracking-[0.22em] text-white/45">
                    Premium Mobility
                  </p>

                  <h2 className="mt-4 text-5xl font-semibold leading-[1.02] tracking-[-0.05em] text-white xl:text-6xl">
                    Drive beyond
                    <span className="block text-cyan-300">
                      ordinary.
                    </span>
                  </h2>

                  <p className="mt-6 max-w-md text-base leading-7 text-white/55">
                    Your gateway to premium vehicle rentals and quality
                    vehicles for sale across Ghana.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-8 text-xs uppercase tracking-[0.18em] text-white/35">
                <span>Rent</span>
                <span className="h-1 w-1 rounded-full bg-cyan-300/60" />
                <span>Buy</span>
                <span className="h-1 w-1 rounded-full bg-cyan-300/60" />
                <span>Move</span>
              </div>
            </div>
          </section>

          {/* Login panel */}
          <section className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-12 xl:px-16">
            <div className="w-full max-w-md">
              {/* Mobile brand */}
              <div className="mb-10 lg:hidden">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-300/70">
                  RUVASGOD AUTO
                </p>

                <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white">
                  Welcome back.
                </h1>

                <p className="mt-3 text-sm leading-6 text-white/40">
                  Sign in to manage your vehicles, rentals, and purchases.
                </p>
              </div>

              {/* Desktop heading */}
              <div className="hidden lg:block">
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-cyan-300/70">
                  Your account
                </p>

                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white">
                  Welcome back.
                </h1>

                <p className="mt-3 text-sm leading-6 text-white/40">
                  Sign in to continue your Ruvasgod Auto experience.
                </p>
              </div>

              {/* Messages */}
              {error && (
                <div className="mt-7 rounded-2xl border border-red-400/20 bg-red-400/[0.07] p-4 text-sm leading-6 text-red-300">
                  {error}
                </div>
              )}

              {location.state?.message && !error && (
                <div className="mt-7 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.07] p-4 text-sm leading-6 text-emerald-300">
                  {location.state.message}
                </div>
              )}

              {/* Google */}
              <div className={error || location.state?.message ? "mt-5" : "mt-8"}>
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
                or continue with
                <span className="h-px flex-1 bg-white/[0.08]" />
              </div>

              <form onSubmit={handleSubmit}>
                {/* Identifier */}
                <div>
                  <label
                    htmlFor="identifier"
                    className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40"
                  >
                    Username or Email
                  </label>

                  <input
                    id="identifier"
                    type="text"
                    name="identifier"
                    value={form.identifier}
                    onChange={handleChange}
                    required
                    autoComplete="username"
                    placeholder="Enter your username or email"
                    className="w-full rounded-xl border border-white/[0.09] bg-white/[0.035] px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/20 transition focus:border-cyan-300/40 focus:bg-white/[0.05] focus:ring-2 focus:ring-cyan-300/10"
                  />
                </div>

                {/* Password */}
                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40"
                    >
                      Password
                    </label>

                    <Link
                      to="/forgot-password"
                      className="text-xs font-medium text-cyan-300/70 transition hover:text-cyan-300"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      autoComplete="current-password"
                      placeholder="Enter your password"
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
                      Signing in...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              {/* Register */}
              <p className="mt-8 text-center text-sm text-white/35">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-white transition hover:text-cyan-300"
                >
                  Create account
                </Link>
              </p>

              <p className="mt-8 text-center text-[10px] uppercase tracking-[0.16em] text-white/15">
                Secure access • Ruvasgod Auto
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default Login;
