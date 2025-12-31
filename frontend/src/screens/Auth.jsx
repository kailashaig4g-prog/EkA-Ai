import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { authAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import { toast } from 'sonner';

export default function Auth() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    department: 'DEPT_TECHNOLOGY',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      if (isLogin) {
        response = await authAPI.login(formData.email, formData.password);
      } else {
        response = await authAPI.register(formData);
      }
      
      login(response.data.access_token, response.data.user);
      toast.success(`Welcome${isLogin ? ' back' : ''}, ${response.data.user.name}!`);
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex relative overflow-hidden" data-testid="auth-page">
      {/* Logo - Top Right */}
      <div className="absolute top-6 right-6 z-50">
        <img 
          src="https://customer-assets.emergentagent.com/job_b9cc3aae-509a-4338-a133-5fb13a3b9f93/artifacts/oksiful9_Logo%20for%20website.png"
          alt="Go4Garage Logo"
          className="h-12 w-auto"
          data-testid="logo"
        />
      </div>

      {/* Left Side - Login Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 lg:p-12 relative z-10">
        <div 
          className="w-full max-w-md bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl"
          data-testid="auth-card"
        >
          {/* EKA-Ai Branding */}
          <div className="text-center mb-8">
            <h1 className="font-poppins text-4xl font-bold text-white mb-1">
              EKA-<span className="text-[#FF6B35]">Ai</span>
            </h1>
            <p className="text-white/50 text-sm">Go4Garage Intelligence Platform</p>
          </div>

          <div className="mb-6">
            <h2 className="font-poppins text-xl font-semibold text-white mb-1">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-white/50 text-sm">
              {isLogin ? 'Sign in to access your dashboard' : 'Register to get started'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-white/70 text-sm">Full Name</Label>
                <Input
                  id="name"
                  data-testid="name-input"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required={!isLogin}
                  className="bg-white/5 border-white/10 focus:border-[#FF6B35]/50"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-white/70 text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                data-testid="email-input"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="bg-white/5 border-white/10 focus:border-[#FF6B35]/50"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-white/70 text-sm">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  data-testid="password-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="bg-white/5 border-white/10 focus:border-[#FF6B35]/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                  data-testid="toggle-password"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-1.5">
                <Label htmlFor="department" className="text-white/70 text-sm">Department</Label>
                <select
                  id="department"
                  data-testid="department-select"
                  className="flex h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-[#FF6B35]/50 focus:ring-1 focus:ring-[#FF6B35]/50 transition-all outline-none"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                >
                  <option value="DEPT_TECHNOLOGY">IT & Technology</option>
                  <option value="DEPT_MARKETING">Marketing & Growth</option>
                  <option value="DEPT_FINANCE">Finance & Accounts</option>
                  <option value="DEPT_SALES">Sales & Partnerships</option>
                  <option value="DEPT_SUPPORT">Customer Support</option>
                  <option value="DEPT_OPERATIONS_PRODUCTION">Operations</option>
                </select>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full mt-2" 
              disabled={loading}
              data-testid="submit-btn"
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-white/50 text-sm">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-[#FF6B35] hover:text-[#ff8559] font-medium transition-colors"
                data-testid="toggle-auth-mode"
              >
                {isLogin ? 'Register' : 'Sign In'}
              </button>
            </p>
          </div>

          <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-center gap-2 text-white/30 text-xs">
            <Shield className="w-3.5 h-3.5 text-teal-400/60" />
            <span>Powered by <span className="text-teal-400/80">Kailash-Ai</span> • Secured by <span className="text-[#FF6B35]/80">GANESHA</span></span>
          </div>
        </div>
      </div>

      {/* Right Side - Video Background */}
      <div className="hidden lg:block lg:w-[55%] relative">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          data-testid="background-video"
        >
          <source 
            src="https://customer-assets.emergentagent.com/job_b9cc3aae-509a-4338-a133-5fb13a3b9f93/artifacts/8uyja87z_Futuristic_EV_Render_Loop.mp4" 
            type="video/mp4" 
          />
        </video>
        {/* Gradient overlay for seamless blend */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
      </div>
    </div>
  );
}
