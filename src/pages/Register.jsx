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
        form.password
      );

      navigate("/login");
    } catch (error) {
      setError(error.message || "Registration failed. Please try again.");
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
      setError(googleError.message || "Unable to continue with Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl"
      >
        <h1 className="mb-2 text-3xl font-bold text-slate-900">
          Create Account
        </h1>

        <p className="mb-6 text-slate-500">
          Join Ruvasgod Auto
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
          minLength={3}
          maxLength={20}
          pattern="[A-Za-z0-9_]+"
          title="Use 3 to 20 letters, numbers, or underscores"
          className="mb-4 w-full rounded-lg border border-slate-300 px-4 py-3"
        />

        <GoogleSignInButton
          onCredential={handleGoogleCredential}
          onError={() => setError("Unable to load Google sign-in.")}
        />

        <div className="my-5 flex items-center gap-3 text-sm text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />
          or
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <input
          name="name"
          placeholder="Full name"
          value={form.name}
          onChange={handleChange}
          required
          className="mb-4 w-full rounded-lg border border-slate-300 px-4 py-3"
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="mb-4 w-full rounded-lg border border-slate-300 px-4 py-3"
        />

        <input
          name="phone"
          placeholder="Phone number"
          value={form.phone}
          onChange={handleChange}
          required
          className="mb-4 w-full rounded-lg border border-slate-300 px-4 py-3"
        />

        <input
          name="password"
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          minLength={12}
          className="mb-6 w-full rounded-lg border border-slate-300 px-4 py-3"
        />

        <button
          type="button"
          onClick={() => setShowPassword((visible) => !visible)}
          className="-mt-4 mb-4 text-sm font-medium text-slate-600 underline"
        >
          {showPassword ? "Hide password" : "Show password"}
        </button>

        <input
          name="confirmPassword"
          type={showPassword ? "text" : "password"}
          placeholder="Confirm password"
          value={form.confirmPassword}
          onChange={handleChange}
          required
          minLength={12}
          className="mb-6 w-full rounded-lg border border-slate-300 px-4 py-3"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-slate-900 underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Register;