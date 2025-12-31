import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shield, ChevronLeft, ChevronRight, Zap, Battery, Car } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { authAPI, promotionsAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Auth() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [promoSlides, setPromoSlides] = useState([]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    department: 'DEPT_TECHNOLOGY',
  });

  // Fetch promotions from backend
  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/promotions`);
        if (response.data && response.data.length > 0) {
          setPromoSlides(response.data);
        }
      } catch (error) {
        // Use default promos on error
        setPromoSlides([
          { id: '1', title: '50% OFF on URGAA Plans', description: 'Premium EV charging analytics', badge: 'LIMITED', discount_percent: 50 },
          { id: '2', title: 'Free Training Modules', description: 'Get certified free', badge: 'NEW', discount_percent: 100 },
          { id: '3', title: 'GST Filing Support', description: 'Automated compliance', badge: 'POPULAR', discount_percent: 30 },
        ]);
      }
    };
    fetchPromos();
  }, []);

  // Auto-rotate slides with smooth transition
  useEffect(() => {
    if (promoSlides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promoSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [promoSlides.length]);

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

  // Track promo click
  const trackPromoClick = async (promo) => {
    try {
      await axios.post(`${BACKEND_URL}/api/promotions/track-click`, {
        promo_id: promo.id,
        promo_title: promo.title,
        source_page: 'auth',
        user_agent: navigator.userAgent,
        referrer: document.referrer || 'direct'
      });
    } catch (error) {
      // Silent fail - don't interrupt user experience
      console.log('Click tracking failed:', error);
    }
  };

  const handlePromoClick = (promo, index) => {
    setCurrentSlide(index);
    trackPromoClick(promo);
    toast.info(`${promo.title}`, { 
      description: 'Sign in to claim this offer!',
      duration: 3000
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex" data-testid="auth-page">
      {/* Hide watermark */}
      <style>{`
        [class*="watermark"], [class*="Watermark"], [id*="watermark"], [id*="Watermark"],
        [data-testid*="watermark"], [data-testid*="Watermark"],
        a[href*="emergent"], div:has(> a[href*="emergent"]),
        .fixed.bottom-0.right-0, .fixed.bottom-4.right-4,
        div[style*="position: fixed"][style*="bottom"][style*="right"] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
        }
        
        /* Slide animation */
        .slide-enter {
          opacity: 0;
          transform: translateX(20px);
        }
        .slide-enter-active {
          opacity: 1;
          transform: translateX(0);
          transition: all 0.4s ease-out;
        }
      `}</style>

      {/* Left Side - Promotional Offers */}
      <div className="hidden lg:flex lg:w-[50%] flex-col p-10 relative bg-gradient-to-br from-[#0a0a0a] via-[#111] to-[#0a0a0a]">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-12">
          <img 
            src="https://customer-assets.emergentagent.com/job_b9cc3aae-509a-4338-a133-5fb13a3b9f93/artifacts/oksiful9_Logo%20for%20website.png"
            alt="Go4Garage"
            className="h-10 w-auto"
            data-testid="logo"
          />
        </div>

        {/* Hero Text - More spacious */}
        <div className="mb-12">
          <h1 className="font-poppins text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
            Power Your Future<br />
            <span className="text-[#FF6B35]">With Smart EV</span>
          </h1>
          <p className="text-white/50 text-base max-w-lg">
            Complete ecosystem for electric vehicle charging, automotive workshop management, and business intelligence.
          </p>
        </div>

        {/* Promotional Offers Cards */}
        <div className="flex-1">
          <h2 className="text-[#FF6B35] text-sm font-semibold uppercase tracking-wider mb-6 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Exclusive Offers
          </h2>
          
          {/* Promo Cards Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {promoSlides.slice(0, 4).map((promo, index) => (
              <div 
                key={promo.id || index}
                className={`relative bg-gradient-to-br from-[#1a1a1a] to-[#111] border border-white/10 rounded-2xl p-5 overflow-hidden group hover:border-[#FF6B35]/50 transition-all duration-300 cursor-pointer ${
                  index === currentSlide ? 'border-[#FF6B35]/50 scale-[1.02]' : ''
                }`}
                onClick={() => handlePromoClick(promo, index)}
                data-testid={`promo-card-${index}`}
              >
                {/* Discount Badge */}
                {promo.discount_percent && (
                  <div className="absolute top-3 right-3 bg-[#FF6B35] text-white text-xs font-bold px-2 py-1 rounded-full">
                    {promo.discount_percent}% OFF
                  </div>
                )}
                
                <span className="inline-block px-2 py-0.5 bg-white/10 text-white/70 text-[10px] font-medium rounded mb-3">
                  {promo.badge}
                </span>
                <h3 className="text-white font-semibold text-sm mb-1 pr-12">{promo.title}</h3>
                <p className="text-white/40 text-xs">{promo.description}</p>
                
                {/* Glow effect on active */}
                {index === currentSlide && (
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#FF6B35]/20 rounded-full blur-3xl" />
                )}
              </div>
            ))}
          </div>

          {/* Slider Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {promoSlides.slice(0, 4).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentSlide ? 'bg-[#FF6B35] w-8' : 'bg-white/20 w-2 hover:bg-white/40'
                  }`}
                  data-testid={`slide-dot-${idx}`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={prevSlide}
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-[#FF6B35]/50 transition-all"
                data-testid="prev-slide"
              >
                <ChevronLeft className="w-4 h-4 text-white/70" />
              </button>
              <button 
                onClick={nextSlide}
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-[#FF6B35]/50 transition-all"
                data-testid="next-slide"
              >
                <ChevronRight className="w-4 h-4 text-white/70" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-6 mt-8 text-white/30 text-xs">
          <a href="#" className="hover:text-[#FF6B35] transition-colors">Contact</a>
          <a href="#" className="hover:text-[#FF6B35] transition-colors">About</a>
          <a href="#" className="hover:text-[#FF6B35] transition-colors">Privacy</a>
          <a href="#" className="hover:text-[#FF6B35] transition-colors">Terms</a>
        </div>
      </div>

      {/* Right Side - Login Form with Video Background */}
      <div className="w-full lg:w-[50%] relative flex flex-col items-center justify-center p-6">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/40" />

        {/* Logo - Top Right */}
        <div className="absolute top-4 right-4 z-20 lg:hidden">
          <img 
            src="https://customer-assets.emergentagent.com/job_b9cc3aae-509a-4338-a133-5fb13a3b9f93/artifacts/oksiful9_Logo%20for%20website.png"
            alt="Go4Garage"
            className="h-8 w-auto"
          />
        </div>

        {/* Happy New Year 2026 - Above Login Box */}
        <div className="relative z-10 text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Battery className="w-6 h-6 text-[#FF6B35] animate-pulse" />
            <Car className="w-7 h-7 text-teal-400" />
            <Zap className="w-6 h-6 text-[#FF6B35] animate-pulse" />
          </div>
          <h2 className="font-poppins text-3xl lg:text-4xl font-bold text-white mb-1">
            Happy New Year <span className="text-[#FF6B35]">2026</span>!
          </h2>
          <p className="text-white/50 text-sm">
            Driving the Future of <span className="text-teal-400">Electric Mobility</span>
          </p>
        </div>

        {/* Login Form Card */}
        <div 
          className="w-full max-w-sm bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 relative z-10"
          data-testid="auth-card"
        >
          {/* EKA-Ai Branding */}
          <div className="text-center mb-5">
            <h1 className="font-poppins text-2xl font-bold text-white">
              EKA-<span className="text-[#FF6B35]">Ai</span>
            </h1>
            <p className="text-white/40 text-xs">Go4Garage Intelligence Platform</p>
          </div>

          <div className="mb-4">
            <h2 className="font-poppins text-base font-semibold text-white">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-white/40 text-xs">
              {isLogin ? 'Sign in to your dashboard' : 'Register to get started'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {!isLogin && (
              <div className="space-y-1">
                <Label htmlFor="name" className="text-white/50 text-xs">Full Name</Label>
                <Input
                  id="name"
                  data-testid="name-input"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required={!isLogin}
                  className="h-10 bg-white/5 border-white/10 text-sm"
                />
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="email" className="text-white/50 text-xs">Email</Label>
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
              <Label htmlFor="password" className="text-white/50 text-xs">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  data-testid="password-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
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
                <Label htmlFor="department" className="text-white/50 text-xs">Department</Label>
                <select
                  id="department"
                  data-testid="department-select"
                  className="flex h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[#FF6B35]/50 outline-none"
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
              className="w-full h-10 text-sm mt-2" 
              disabled={loading}
              data-testid="submit-btn"
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-white/40 text-xs">
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

          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-center gap-1.5 text-white/25 text-[10px]">
            <Shield className="w-3 h-3 text-teal-400/50" />
            <span>Powered by <span className="text-teal-400/70">KAILASH</span> • <span className="text-[#FF6B35]/70">GANESHA</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
