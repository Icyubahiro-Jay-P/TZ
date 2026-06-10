import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ UserName: "", Password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.UserName, form.Password);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200 p-4">
      <div className="w-full max-w-md bg-white p-6 border border-gray-300">
        <div className="text-center mb-5">
          <h1 className="text-[22px] font-bold text-gray-800 m-0">Sign In</h1>
          <p className="text-gray-500 mt-1 text-sm">DAB Enterprise EPMS</p>
        </div>

        {error && (
          <div className="p-2.5 bg-red-50 border border-red-300 text-red-700 mb-3 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block mb-1 font-semibold text-gray-800 text-sm" htmlFor="UserName">Username</label>
            <input
              id="UserName"
              name="UserName"
              type="text"
              autoComplete="username"
              required
              value={form.UserName}
              onChange={handleChange}
              placeholder="Enter your username"
              className="w-full px-3 py-2 border border-gray-400 text-sm box-border"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-semibold text-gray-800 text-sm" htmlFor="Password">Password</label>
            <input
              id="Password"
              name="Password"
              type="password"
              autoComplete="current-password"
              required
              value={form.Password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full px-3 py-2 border border-gray-400 text-sm box-border"
            />
          </div>

          <button
            type="submit"
            id="login-btn"
            disabled={loading}
            className={`w-full py-2.5 text-white border-none text-[15px] font-semibold ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 cursor-pointer'
            }`}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-4 text-center text-[13px] text-gray-600">
          No account?{" "}
          <Link to="/register" className="text-blue-600">Create one here</Link>
        </p>

        <p className="text-center text-[11px] text-gray-400 mt-4">
          &copy; 2026 DAB Enterprise LTD &ndash; Kigali, Rwanda
        </p>
      </div>
    </div>
  );
};

export default Login;
