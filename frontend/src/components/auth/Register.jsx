import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    const { confirmPassword, ...userData } = formData;
    const result = await register(userData);
    
    if (result.success) {
      navigate('/chat');
    } else {
      setErrors({ general: result.error });
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: 'var(--brand-primary)' }}
          >
            <span className="text-2xl font-bold text-white">K</span>
          </div>
          <h1
            className="text-2xl font-semibold"
            style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
          >
            Create Account
          </h1>
          <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
            Join Kailash AI today
          </p>
        </div>

        {/* Register Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            backgroundColor: 'var(--bg-card)',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-light)',
          }}
        >
          {errors.general && (
            <div
              className="mb-6 p-4 rounded-xl text-sm flex items-center gap-2"
              style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', color: '#dc2626' }}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                autoComplete="name"
                className="input-field"
                placeholder="John Doe"
                data-testid="name-input"
              />
              {errors.name && (
                <p className="mt-1 text-sm" style={{ color: '#dc2626' }}>{errors.name}</p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className="input-field"
                placeholder="you@example.com"
                data-testid="email-input"
              />
              {errors.email && (
                <p className="mt-1 text-sm" style={{ color: '#dc2626' }}>{errors.email}</p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                className="input-field"
                placeholder="••••••••"
                data-testid="password-input"
              />
              {errors.password && (
                <p className="mt-1 text-sm" style={{ color: '#dc2626' }}>{errors.password}</p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
                className="input-field"
                placeholder="••••••••"
                data-testid="confirm-password-input"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm" style={{ color: '#dc2626' }}>{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base"
              data-testid="register-btn"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Account...
                </span>
              ) : (
                'Sign Up'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p style={{ color: 'var(--text-secondary)' }}>
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium hover:underline"
                style={{ color: 'var(--brand-primary)' }}
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs" style={{ color: 'var(--text-tertiary)' }}>
          Powered by Go4Garage • Kailash AI Assistant
        </p>
      </div>
    </div>
  );
};
