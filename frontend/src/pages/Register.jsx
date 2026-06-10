import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ UserName: '', Password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.Password !== form.confirm) {
      return setError('Passwords do not match');
    }
    if (form.Password.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    setLoading(true);
    try {
      await register(form.UserName, form.Password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200 p-4">
      <div className="w-full max-w-sm bg-white p-6 border border-gray-300">
        <div className="text-center mb-5">
          <h1 className="text-[22px] font-bold text-gray-800 m-0">Create Account</h1>
          <p className="text-gray-500 mt-1 text-sm">Register for DAB Enterprise EPMS</p>
        </div>

        {error && (
          <div className="p-2.5 bg-red-50 border border-red-300 text-red-700 mb-3 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block mb-1 font-semibold text-gray-800 text-sm">Username</label>
            <input
              name="UserName"
              type="text"
              required
              value={form.UserName}
              onChange={handleChange}
              placeholder="Choose a username"
              className="w-full px-3 py-2 border border-gray-400 text-sm box-border"
            />
          </div>
          <div className="mb-3">
            <label className="block mb-1 font-semibold text-gray-800 text-sm">Password</label>
            <input
              name="Password"
              type="password"
              required
              value={form.Password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              className="w-full px-3 py-2 border border-gray-400 text-sm box-border"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold text-gray-800 text-sm">Confirm Password</label>
            <input
              name="confirm"
              type="password"
              required
              value={form.confirm}
              onChange={handleChange}
              placeholder="Re-enter password"
              className="w-full px-3 py-2 border border-gray-400 text-sm box-border"
            />
          </div>

          <button
            type="submit"
            id="register-btn"
            disabled={loading}
            className={`w-full py-2.5 text-white border-none text-[15px] font-semibold ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 cursor-pointer'
            }`}
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-4 text-center text-[13px] text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
