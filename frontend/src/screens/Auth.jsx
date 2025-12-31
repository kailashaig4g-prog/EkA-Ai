import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shield, Zap, Car, Users, GraduationCap, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { authAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import { toast } from 'sonner';

const offerings = [
  { icon: Zap, title: 'EV Charging', desc: 'Smart station management' },
  { icon: Car, title: 'Workshop Ops', desc: 'GST compliant job cards' },
  { icon: Users, title: 'Customer Intel', desc: 'Churn prediction & insights' },
  { icon: GraduationCap, title: 'Training', desc: 'Certifications & courses' },
  { icon: Shield, title: 'Compliance', desc: 'Legal & regulatory tools' },
  { icon: Sparkles, title: 'AI Powered', desc: 'KAILASH intelligence engine' },
];

const promoSlides = [
  { title: '50% OFF on URGAA Plans', desc: 'Get premium EV charging analytics at half price', badge: 'LIMITED TIME' },
  { title: 'Free Training Modules', desc: 'Complete 3 courses and get certified for free', badge: 'NEW' },
  { title: 'GST Filing Support', desc: 'Automated GST compliance for workshops', badge: 'POPULAR' },
];

export default function Auth() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    department: 'DEPT_TECHNOLOGY',
  });

  // Auto-rotate slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promoSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

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

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % promoSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + promoSlides.length) % promoSlides.length);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex" data-testid="auth-page">
      {/* Left Side - Marketing & Promotions */}
      <div className="hidden lg:flex lg:w-[55%] flex-col p-8 relative">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <img 
            src="https://customer-assets.emergentagent.com/job_b9cc3aae-509a-4338-a133-5fb13a3b9f93/artifacts/oksiful9_Logo%20for%20website.png"
            alt="Go4Garage"
            className="h-10 w-auto"
            data-testid="logo"
          />
        </div>

        {/* Hero Text */}
        <div className="mb-10">
          <h1 className="font-poppins text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
            Enterprise Intelligence<br />
            <span className="text-[#FF6B35]">Made Simple</span>
          </h1>
          <p className="text-white/60 text-lg max-w-md">
            Unified platform for EV charging, workshop operations, customer analytics & employee training.
          </p>
        </div>

        {/* Our Offerings - 6 Boxes */}
        <div className="mb-8">
          <h2 className="text-white/50 text-sm font-medium uppercase tracking-wider mb-4">Our Offerings</h2>
          <div className="grid grid-cols-3 gap-3">
            {offerings.map((item, index) => (
              <div 
                key={index}
                className="bg-[#FF6B35]/10 border border-[#FF6B35]/20 rounded-xl p-4 hover:bg-[#FF6B35]/20 transition-all cursor-pointer group"
                data-testid={`offering-${index}`}
              >
                <item.icon className="w-6 h-6 text-[#FF6B35] mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="text-white font-medium text-sm mb-0.5">{item.title}</h3>
                <p className="text-white/50 text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Promo Slider */}
        <div className="mt-auto">
          <div className="relative bg-gradient-to-r from-[#1a1a1a] to-[#0a0a0a] border border-white/10 rounded-2xl p-6 overflow-hidden">
            {/* Slide Content */}
            <div className="relative z-10">
              <span className="inline-block px-2 py-1 bg-[#FF6B35] text-white text-xs font-medium rounded mb-3">
                {promoSlides[currentSlide].badge}
              </span>
              <h3 className="text-white text-xl font-semibold mb-2">{promoSlides[currentSlide].title}</h3>
              <p className="text-white/60 text-sm">{promoSlides[currentSlide].desc}</p>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex gap-1.5">
                {promoSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentSlide ? 'bg-[#FF6B35] w-6' : 'bg-white/30'
                    }`}
                    data-testid={`slide-dot-${idx}`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={prevSlide}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  data-testid="prev-slide"
                >
                  <ChevronLeft className="w-4 h-4 text-white" />
                </button>
                <button 
                  onClick={nextSlide}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  data-testid="next-slide"
                >
                  <ChevronRight className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Decorative gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B35]/20 rounded-full blur-3xl" />
          </div>

          {/* Footer Links */}
          <div className="flex items-center gap-6 mt-6 text-white/40 text-sm">
            <a href="#" className="hover:text-white transition-colors">Contact</a>
            <a href="#" className="hover:text-white transition-colors">Social</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form with Video Background */}
      <div className="w-full lg:w-[45%] relative flex items-center justify-center p-6">
        {/* Video Background */}
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

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/60 to-black/40" />

        {/* Mobile Logo */}
        <div className="lg:hidden absolute top-4 left-4 z-20">
          <img 
            src="https://customer-assets.emergentagent.com/job_b9cc3aae-509a-4338-a133-5fb13a3b9f93/artifacts/oksiful9_Logo%20for%20website.png"
            alt="Go4Garage"
            className="h-8 w-auto"
          />
        </div>

        {/* Login Form Card */}
        <div 
          className="w-full max-w-sm bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative z-10"
          data-testid="auth-card"
        >
          {/* EKA-Ai Branding */}
          <div className="text-center mb-6">
            <h1 className="font-poppins text-3xl font-bold text-white">
              EKA-<span className="text-[#FF6B35]">Ai</span>
            </h1>
            <p className="text-white/50 text-xs mt-1">Go4Garage Intelligence</p>
          </div>

          <div className="mb-5">
            <h2 className="font-poppins text-lg font-semibold text-white">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-white/50 text-xs">
              {isLogin ? 'Sign in to your dashboard' : 'Register to get started'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {!isLogin && (
              <div className="space-y-1">
                <Label htmlFor="name" className="text-white/60 text-xs">Full Name</Label>
                <Input
                  id="name"
                  data-testid="name-input"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required={!isLogin}
                  className="h-10 bg-white/5 border-white/10 text-sm"
                />
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="email" className="text-white/60 text-xs">Email</Label>
              <Input
                id="email"
                type="email"
                data-testid="email-input"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="h-10 bg-white/5 border-white/10 text-sm"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="password" className="text-white/60 text-xs">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  data-testid="password-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="h-10 bg-white/5 border-white/10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                  data-testid="toggle-password"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-1">
                <Label htmlFor="department" className="text-white/60 text-xs">Department</Label>
                <select
                  id="department"
                  data-testid="department-select"
                  className="flex h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[#FF6B35]/50 outline-none"
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
              className="w-full h-10 mt-2" 
              disabled={loading}
              data-testid="submit-btn"
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-white/50 text-xs">
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

          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-center gap-1.5 text-white/30 text-[10px]">
            <Shield className="w-3 h-3 text-teal-400/60" />
            <span>Powered by <span className="text-teal-400/80">KAILASH</span> • Secured by <span className="text-[#FF6B35]/80">GANESHA</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
