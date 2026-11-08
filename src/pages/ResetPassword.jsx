import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

function ResetPassword() {
  const { resetPassword } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const token = searchParams.get("token");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!token) {
      setError("This password reset link is invalid or incomplete.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, password);
      navigate("/login", { state: { message: "Password reset successfully." } });
    } catch (requestError) {
      setError(requestError.message || "Unable to reset your password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-[65vh] items-center justify-center bg-[#fffdf8] px-5 py-12">
      <form className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-7 shadow-sm sm:p-9" onSubmit={submit}>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-900">Ruvasgod Real Estate</p>
        <h1 className="mt-3 text-2xl font-semibold text-stone-900">Reset password</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">Choose a new password with at least 12 characters.</p>
        {error && <p className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">{error}</p>}
        <label className="mt-5 block text-sm font-semibold text-stone-700" htmlFor="new-password">{t("password")}
          <input className="mt-1.5 min-h-12 w-full rounded-lg border border-stone-300 px-4 text-sm outline-none focus:border-amber-800" id="new-password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={12} required />
        </label>
        <label className="mt-4 block text-sm font-semibold text-stone-700" htmlFor="confirm-new-password">Confirm password
          <input className="mt-1.5 min-h-12 w-full rounded-lg border border-stone-300 px-4 text-sm outline-none focus:border-amber-800" id="confirm-new-password" type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={12} required />
        </label>
        <button className="button-primary mt-5 min-h-12 w-full rounded-lg px-4 py-3 text-sm font-semibold disabled:opacity-50" disabled={loading || !token} type="submit">{loading ? "Resetting…" : "Reset password"}</button>
        <Link className="mt-5 block text-center text-sm font-semibold text-amber-900 underline underline-offset-4" to="/login">Back to sign in</Link>
      </form>
    </main>
  );
}

export default ResetPassword;
