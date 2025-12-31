import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shield, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { authAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import { toast } from 'sonner';

const brandImages = [
  { 
    image: 'https://images.unsplash.com/photo-1672542128827-ccbb7b8b8099?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMHZlaGljbGUlMjBjaGFyZ2luZyUyMHN0YXRpb258ZW58MHx8fHwxNzY3MjIzNTU0fDA&ixlib=rb-4.1.0&q=85',
    title: 'EV Charging',
    desc: 'Smart Stations'
  },
  { 
    image: 'https://images.pexels.com/photos/4488649/pexels-photo-4488649.jpeg',
    title: 'Workshop',
    desc: 'Auto Service'
  },
  { 
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwxfHxjdXN0b21lciUyMGFuYWx5dGljcyUyMGRhc2hib2FyZHxlbnwwfHx8fDE3NjcyMjM1NTl8MA&ixlib=rb-4.1.0&q=85',
    title: 'Analytics',
    desc: 'Data Insights'
  },
  { 
    image: 'https://images.pexels.com/photos/3861945/pexels-photo-3861945.jpeg',
    title: 'Training',
    desc: 'Skill Growth'
  },
  { 
    image: 'https://images.pexels.com/photos/7841841/pexels-photo-7841841.jpeg',
    title: 'Compliance',
    desc: 'Legal & GST'
  },
  { 
    image: 'https://images.unsplash.com/photo-1760629863094-5b1e8d1aae74?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwcm9ib3QlMjB0ZWNobm9sb2d5fGVufDB8fHx8MTc2NzIyMzU2OXww&ixlib=rb-4.1.0&q=85',
    title: 'AI Powered',
    desc: 'KAILASH Engine'
  },
];

const promoSlides = [
  { title: '50% OFF on URGAA Plans', desc: 'Premium EV charging analytics at half price', badge: 'LIMITED' },
  { title: 'Free Training Modules', desc: 'Complete 3 courses, get certified free', badge: 'NEW' },
  { title: 'GST Filing Support', desc: 'Automated compliance for workshops', badge: 'POPULAR' },
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
      {/* Hide watermark */}
      <style>{`
        [class*="watermark"], [class*="Watermark"], [id*="watermark"], [id*="Watermark"],
        [data-testid*="watermark"], [data-testid*="Watermark"],
        div[style*="position: fixed"][style*="bottom"], 
        div[style*="position: fixed"][style*="right"],
        .fixed.bottom-0, .fixed.right-0,
        a[href*="emergent"], div:has(> a[href*="emergent"]) {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
        }
      `}</style>

      {/* Left Side - Marketing & Promotions */}
      <div className="hidden lg:flex lg:w-[55%] flex-col p-6 relative">
        {/* Happy New Year Banner */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[#FF6B35] via-[#ff8559] to-[#FF6B35] py-2 px-4 flex items-center justify-center gap-2 z-20">
          <Sparkles className="w-4 h-4 text-white animate-pulse" />
          <span className="text-white font-semibold text-sm">🎉 Happy New Year 2025! 🎉</span>
          <Sparkles className="w-4 h-4 text-white animate-pulse" />
        </div>

        <div className="mt-12">
          {/* Hero Text */}
          <div className="mb-6">
            <h1 className="font-poppins text-3xl lg:text-4xl font-bold text-white leading-tight mb-2">
              Enterprise Intelligence<br />
              <span className="text-[#FF6B35]">Made Simple</span>
            </h1>
            <p className="text-white/50 text-sm max-w-md">
              Unified platform for EV charging, workshop operations & analytics.
            </p>
          </div>

          {/* Brands That Trust Us - 6 Image Boxes */}
          <div className="mb-6">
            <h2 className="text-white/40 text-xs font-medium uppercase tracking-wider mb-3">Brands That Trust Us</h2>
            <div className="grid grid-cols-3 gap-2">
              {brandImages.map((item, index) => (
                <div 
                  key={index}
                  className="relative rounded-lg overflow-hidden aspect-[4/3] group cursor-pointer"
                  data-testid={`brand-${index}`}
                >
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <h3 className="text-white font-medium text-xs">{item.title}</h3>
                    <p className="text-white/60 text-[10px]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Promo Slider */}
          <div className="relative bg-[#111] border border-white/10 rounded-xl p-4 overflow-hidden">
            <div className="relative z-10">
              <span className="inline-block px-2 py-0.5 bg-[#FF6B35] text-white text-[10px] font-medium rounded mb-2">
                {promoSlides[currentSlide].badge}
              </span>
              <h3 className="text-white text-base font-semibold mb-1">{promoSlides[currentSlide].title}</h3>
              <p className="text-white/50 text-xs">{promoSlides[currentSlide].desc}</p>
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="flex gap-1">
                {promoSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === currentSlide ? 'bg-[#FF6B35] w-4' : 'bg-white/30 w-1.5'
                    }`}
                    data-testid={`slide-dot-${idx}`}
                  />
                ))}
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={prevSlide}
                  className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  data-testid="prev-slide"
                >
                  <ChevronLeft className="w-3 h-3 text-white" />
                </button>
                <button 
                  onClick={nextSlide}
                  className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  data-testid="next-slide"
                >
                  <ChevronRight className="w-3 h-3 text-white" />
                </button>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#FF6B35]/20 rounded-full blur-2xl" />
          </div>

          {/* Footer Links */}
          <div className="flex items-center gap-4 mt-4 text-white/30 text-xs">
            <a href="#" className="hover:text-white transition-colors">Contact</a>
            <a href="#" className="hover:text-white transition-colors">Social</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form with Video Background */}
      <div className="w-full lg:w-[45%] relative flex items-center justify-center p-4">
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
        <div className="absolute inset-0 bg-gradient-to-l from-black/70 via-black/50 to-black/30" />

        {/* Logo - Top Right */}
        <div className="absolute top-4 right-4 z-20">
          <img 
            src="https://customer-assets.emergentagent.com/job_b9cc3aae-509a-4338-a133-5fb13a3b9f93/artifacts/oksiful9_Logo%20for%20website.png"
            alt="Go4Garage"
            className="h-8 w-auto"
            data-testid="logo"
          />
        </div>

        {/* Mobile: Happy New Year Banner */}
        <div className="lg:hidden absolute top-0 left-0 right-0 bg-gradient-to-r from-[#FF6B35] to-[#ff8559] py-1.5 px-3 flex items-center justify-center gap-1 z-20">
          <span className="text-white font-medium text-xs">🎉 Happy New Year 2025! 🎉</span>
        </div>

        {/* Login Form Card */}
        <div 
          className="w-full max-w-xs bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-5 relative z-10 mt-8 lg:mt-0"
          data-testid="auth-card"
        >
          {/* EKA-Ai Branding */}
          <div className="text-center mb-4">
            <h1 className="font-poppins text-2xl font-bold text-white">
              EKA-<span className="text-[#FF6B35]">Ai</span>
            </h1>
            <p className="text-white/40 text-[10px]">Go4Garage Intelligence</p>
          </div>

          <div className="mb-4">
            <h2 className="font-poppins text-sm font-semibold text-white">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-white/40 text-[10px]">
              {isLogin ? 'Sign in to your dashboard' : 'Register to get started'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-2.5">
            {!isLogin && (
              <div className="space-y-1">
                <Label htmlFor="name" className="text-white/50 text-[10px]">Full Name</Label>
                <Input
                  id="name"
                  data-testid="name-input"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required={!isLogin}
                  className="h-9 bg-white/5 border-white/10 text-xs"
                />
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="email" className="text-white/50 text-[10px]">Email</Label>
              <Input
                id="email"
                type="email"
                data-testid="email-input"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="h-9 bg-white/5 border-white/10 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="password" className="text-white/50 text-[10px]">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  data-testid="password-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="h-9 bg-white/5 border-white/10 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                  data-testid="toggle-password"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-1">
                <Label htmlFor="department" className="text-white/50 text-[10px]">Department</Label>
                <select
                  id="department"
                  data-testid="department-select"
                  className="flex h-9 w-full rounded-lg border border-white/10 bg-white/5 px-2.5 text-xs text-white focus:border-[#FF6B35]/50 outline-none"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                >
                  <option value="DEPT_TECHNOLOGY">IT & Technology</option>
                  <option value="DEPT_MARKETING">Marketing</option>
                  <option value="DEPT_FINANCE">Finance</option>
                  <option value="DEPT_SALES">Sales</option>
                  <option value="DEPT_SUPPORT">Support</option>
                  <option value="DEPT_OPERATIONS_PRODUCTION">Operations</option>
                </select>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-9 text-xs mt-1" 
              disabled={loading}
              data-testid="submit-btn"
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-3 text-center">
            <p className="text-white/40 text-[10px]">
              {isLogin ? "Don't have an account?" : 'Have an account?'}{' '}
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

          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-center gap-1 text-white/25 text-[9px]">
            <Shield className="w-2.5 h-2.5 text-teal-400/50" />
            <span>Powered by <span className="text-teal-400/70">KAILASH</span> • <span className="text-[#FF6B35]/70">GANESHA</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
