import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import GoogleSignInButton from "../components/GoogleSignInButton";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const staffRoles = ["admin", "manager", "sales", "rental", "finance"];

function Login() {
  const { login, googleLogin } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const destination = (user) => staffRoles.includes(user?.role) ? "/staff/dashboard" : "/properties";

  const submit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError("");
      const session = await login(identifier.trim(), password);
      navigate(destination(session.user), { replace: true });
    } catch (requestError) {
      setError(requestError.message || t("loginError"));
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async (credential) => {
    try {
      setLoading(true);
      setError("");
      const session = await googleLogin(credential);
      navigate(destination(session.user), { replace: true });
    } catch (requestError) {
      setError(requestError.message || t("loginError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[65vh] bg-[#fffdf8] px-5 py-12 sm:px-8">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm md:grid-cols-2">
        <section className="hidden bg-[#f3ede1] p-10 md:flex md:flex-col md:justify-between lg:p-14">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-900">Ruvasgod Real Estate</p>
          <div>
            <h1 className="text-4xl font-semibold leading-tight text-stone-900">{t("heroTitle")}</h1>
            <p className="mt-4 leading-7 text-stone-600">{t("heroDescription")}</p>
          </div>
          <Link className="text-sm font-bold text-amber-900 hover:underline" to="/properties">{t("explore")}</Link>
        </section>

        <section className="p-6 sm:p-10 lg:p-14">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-900">Ruvasgod Real Estate</p>
          <h2 className="mt-3 text-3xl font-semibold text-stone-900">{t("signInTitle")}</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">Sign in to access your account and authorized workspace.</p>

          {location.state?.message && <p className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900" role="status">{location.state.message}</p>}
          {error && <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">{error}</p>}

          <div className="mt-6"><GoogleSignInButton onCredential={signInWithGoogle} onError={() => setError("Unable to load Google sign-in.")} /></div>
          <div className="my-5 flex items-center gap-3 text-xs text-stone-500"><span className="h-px flex-1 bg-stone-200" />or use your account<span className="h-px flex-1 bg-stone-200" /></div>

          <form className="space-y-4" onSubmit={submit}>
            <label className="block text-sm font-semibold text-stone-700" htmlFor="identifier">
              {t("email")} or username
              <input className="mt-1.5 min-h-12 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm text-stone-900 outline-none focus:border-amber-800" id="identifier" type="text" autoComplete="username" required value={identifier} onChange={(event) => setIdentifier(event.target.value)} />
            </label>
            <label className="block text-sm font-semibold text-stone-700" htmlFor="password">
              {t("password")}
              <span className="relative mt-1.5 block">
                <input className="min-h-12 w-full rounded-xl border border-stone-300 bg-white px-4 pe-20 text-sm text-stone-900 outline-none focus:border-amber-800" id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
                <button className="absolute inset-y-0 end-2 rounded-md px-2 text-xs font-semibold text-stone-600 hover:bg-stone-100" onClick={() => setShowPassword((visible) => !visible)} type="button">{showPassword ? t("hide") : t("show")}</button>
              </span>
            </label>
            <div className="text-end"><Link className="text-sm font-semibold text-amber-900 hover:underline" to="/forgot-password">{t("forgotPassword")}</Link></div>
            <button className="button-primary min-h-12 w-full rounded-xl px-4 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50" disabled={loading} type="submit">{loading ? t("signingIn") : t("signIn")}</button>
          </form>

          <p className="mt-6 text-center text-sm text-stone-600">{t("register")}? <Link className="font-bold text-amber-900 hover:underline" to="/register">{t("createAccount")}</Link></p>
        </section>
      </div>
    </main>
  );
}

export default Login;
