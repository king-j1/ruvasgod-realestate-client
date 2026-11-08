import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await forgotPassword(email.trim());
      setMessage(response.message);
    } catch (requestError) {
      setError(requestError.message || "Unable to request a password reset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-[65vh] items-center justify-center bg-[#fffdf8] px-5 py-12">
      <form className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-7 shadow-sm sm:p-9" onSubmit={submit}>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-900">Ruvasgod Real Estate</p>
        <h1 className="mt-3 text-2xl font-semibold text-stone-900">Forgot password?</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">Enter your email and we will send reset instructions if an account exists.</p>
        {message && <p className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900" role="status">{message}</p>}
        {error && <p className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">{error}</p>}
        <label className="mt-5 block text-sm font-semibold text-stone-700" htmlFor="reset-email">{t("email")}
          <input className="mt-1.5 min-h-12 w-full rounded-lg border border-stone-300 px-4 text-sm outline-none focus:border-amber-800" id="reset-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <button className="button-primary mt-5 min-h-12 w-full rounded-lg px-4 py-3 text-sm font-semibold disabled:opacity-50" disabled={loading} type="submit">{loading ? "Sending…" : "Send reset instructions"}</button>
        <Link className="mt-5 block text-center text-sm font-semibold text-amber-900 underline underline-offset-4" to="/login">Back to sign in</Link>
      </form>
    </main>
  );
}

export default ForgotPassword;
