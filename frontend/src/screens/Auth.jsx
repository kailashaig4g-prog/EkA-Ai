import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Zap, Shield } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
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
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Left side - Hero Image */}
      <div 
        className="hidden lg:flex lg:w-[60%] relative bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1762279388956-1c098163a2a8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwyfHxhYnN0cmFjdCUyMGRhdGElMjB2aXN1YWxpemF0aW9uJTIwdGVjaG5vbG9neSUyMGRhcmt8ZW58MHx8fHwxNzY3MjIwODE1fDA&ixlib=rb-4.1.0&q=85')`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/70 to-transparent" />
        <div className="relative z-10 flex flex-col justify-center px-12 max-w-xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-[#FF6B35] flex items-center justify-center">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-poppins text-3xl font-bold text-white">EKA-AI</h1>
              <p className="text-white/60 text-sm">Go4Garage Intelligence</p>
            </div>
          </div>
          <h2 className="font-poppins text-4xl font-semibold text-white mb-4 leading-tight">
            Enterprise Intelligence <br />
            <span className="text-[#FF6B35]">Powered by AI</span>
          </h2>
          <p className="text-white/70 text-lg leading-relaxed mb-8">
            Unified platform for EV charging, workshop operations, customer intelligence, and employee training.
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-white/60">
              <Shield className="w-5 h-5 text-teal-400" />
              <span className="text-sm">Secured by GANESHA</span>
            </div>
            <div className="flex items-center gap-2 text-white/60">
              <Zap className="w-5 h-5 text-[#FF6B35]" />
              <span className="text-sm">Powered by KAILASH</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-[40%] flex items-center justify-center p-8">
        <Card className="w-full max-w-md bg-white/[0.03] backdrop-blur-2xl border-white/10 p-8" data-testid="auth-card">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-[#FF6B35] flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-poppins text-2xl font-bold text-white">EKA-AI</h1>
          </div>

          <div className="text-center mb-8">
            <h2 className="font-poppins text-2xl font-semibold text-white mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-white/60">
              {isLogin ? 'Sign in to access your dashboard' : 'Register to get started'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  data-testid="name-input"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required={!isLogin}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                data-testid="email-input"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  data-testid="password-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
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
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <select
                  id="department"
                  data-testid="department-select"
                  className="flex h-11 w-full rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-base text-white focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] transition-all outline-none backdrop-blur-sm"
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
              className="w-full" 
              disabled={loading}
              data-testid="submit-btn"
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/60">
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

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-white/40 text-sm">
              Powered by <span className="text-teal-400">Kailash-Ai.in</span> • Secured by <span className="text-[#FF6B35]">GANESHA</span>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
