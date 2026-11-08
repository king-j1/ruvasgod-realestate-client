import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import GoogleSignInButton from "../components/GoogleSignInButton";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const staffRoles = ["admin", "manager", "sales", "rental", "finance"];

function Register() {
  const { register, googleLogin } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      setLoading(true);
      await register(form.username.trim(), form.name.trim(), form.email.trim(), form.phone.trim(), form.password);
      navigate("/login", { state: { message: "Account created. Sign in to continue." } });
    } catch (requestError) {
      setError(requestError.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const signInWithGoogle = async (credential) => {
    try {
      setLoading(true);
      const session = await googleLogin(credential);
      navigate(staffRoles.includes(session.user?.role) ? "/staff/dashboard" : "/properties", { replace: true });
    } catch (requestError) {
      setError(requestError.message || "Unable to continue with Google.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "mt-1.5 min-h-11 w-full rounded-xl border border-stone-300 bg-white px-3.5 text-sm text-stone-900 outline-none focus:border-amber-800";
  const labelClass = "block text-sm font-semibold text-stone-700";

  return (
    <main className="min-h-[65vh] bg-[#fffdf8] px-5 py-12 sm:px-8">
      <div className="mx-auto max-w-2xl rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-900">Ruvasgod Real Estate</p>
        <h1 className="mt-3 text-3xl font-semibold text-stone-900">{t("createAccount")}</h1>
        <p className="mt-2 text-sm text-stone-600">Create an account to use the available customer features.</p>
        {error && <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">{error}</p>}
        <div className="mt-5"><GoogleSignInButton onCredential={signInWithGoogle} onError={() => setError("Unable to load Google sign-in.")} /></div>
        <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={submit}>
          <label className={labelClass}>Username<input className={inputClass} name="username" value={form.username} onChange={update} required minLength={3} maxLength={20} pattern="[A-Za-z0-9_]+" autoComplete="username" /></label>
          <label className={labelClass}>Full name<input className={inputClass} name="name" value={form.name} onChange={update} required autoComplete="name" /></label>
          <label className={labelClass}>{t("email")}<input className={inputClass} name="email" type="email" value={form.email} onChange={update} required autoComplete="email" /></label>
          <label className={labelClass}>Phone number<input className={inputClass} name="phone" type="tel" value={form.phone} onChange={update} required autoComplete="tel" /></label>
          <label className={labelClass}>{t("password")}<input className={inputClass} name="password" type="password" value={form.password} onChange={update} required minLength={12} autoComplete="new-password" /></label>
          <label className={labelClass}>Confirm password<input className={inputClass} name="confirmPassword" type="password" value={form.confirmPassword} onChange={update} required minLength={12} autoComplete="new-password" /></label>
          <p className="text-xs leading-5 text-stone-500 sm:col-span-2">Use at least 12 characters. Username must be 3–20 letters, numbers, or underscores.</p>
          <button className="button-primary min-h-12 rounded-xl px-4 py-3 text-sm font-bold disabled:opacity-50 sm:col-span-2" disabled={loading} type="submit">{loading ? "Creating account…" : t("createAccount")}</button>
        </form>
        <p className="mt-6 text-center text-sm text-stone-600">Already have an account? <Link className="font-bold text-amber-900 hover:underline" to="/login">{t("signIn")}</Link></p>
      </div>
    </main>
  );
}

export default Register;
