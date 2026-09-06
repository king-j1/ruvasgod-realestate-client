import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ResetPassword() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await resetPassword(searchParams.get("token"), password);
      navigate("/login", { state: { message: "Password reset successfully." } });
    } catch (requestError) {
      setError(requestError.message || "Unable to reset your password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl"
      >
        <h1 className="mb-2 text-3xl font-bold text-slate-900">Reset Password</h1>
        <p className="mb-6 text-slate-500">Choose a new password with at least 12 characters.</p>

        {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="New password"
          minLength={12}
          required
          className="mb-4 w-full rounded-lg border border-slate-300 px-4 py-3"
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Confirm new password"
          minLength={12}
          required
          className="mb-6 w-full rounded-lg border border-slate-300 px-4 py-3"
        />

        <button
          type="submit"
          disabled={loading || !searchParams.get("token")}
          className="w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        <Link to="/login" className="mt-5 block text-center text-sm font-semibold text-slate-700 underline">
          Back to Sign In
        </Link>
      </form>
    </div>
  );
}

export default ResetPassword;
