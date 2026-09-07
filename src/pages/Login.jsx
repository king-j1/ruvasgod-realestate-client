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
      navigate(data.user.role === "admin" ? "/admin" : "/vehicles");
    } catch (googleError) {
      setError(googleError.message || "Unable to sign in with Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl"
      >
        <h1 className="mb-2 text-3xl font-bold text-slate-900">
          Welcome Back
        </h1>

        <p className="mb-6 text-slate-500">
          Sign in to Ruvasgod Auto
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {location.state?.message && !error && (
          <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
            {location.state.message}
          </div>
        )}

        <GoogleSignInButton
          onCredential={handleGoogleCredential}
          onError={() => setError("Unable to load Google sign-in.")}
        />

        <div className="my-5 flex items-center gap-3 text-sm text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />
          or
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium">
            Username or Email
          </label>

          <input
            type="text"
            name="identifier"
            value={form.identifier}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
          />
        </div>

        <div className="mb-6">
          <label className="mb-1 block text-sm font-medium">
            Password
          </label>

          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
          />

          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            className="mt-2 text-sm font-medium text-slate-600 underline"
          >
            {showPassword ? "Hide password" : "Show password"}
          </button>
        </div>

        <Link to="/forgot-password" className="mb-5 block text-sm font-semibold text-slate-700 underline">
          Forgot Password?
        </Link>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-semibold text-slate-900 underline">
            Create account
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;