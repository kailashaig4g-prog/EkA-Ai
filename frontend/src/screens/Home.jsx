import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Zap, Car, Users, GraduationCap, 
  TrendingUp, Scale, Headphones, Settings,
  ChevronRight, Search, Bell, LogOut,
  MessageSquare, Building2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import useAuthStore from '../store/authStore';
import { generalAPI } from '../services/api';

const products = [
  {
    code: 'PROD_URGAA',
    name: 'URGAA',
    description: 'EV Charging Intelligence',
    agent: 'AG_SURYA',
    agentName: 'SURYA',
    icon: Zap,
    color: 'from-amber-500/20 to-orange-500/20',
    borderColor: 'hover:border-amber-500/50',
    link: '/urgaa',
    image: 'https://images.unsplash.com/photo-1639195046198-a73b6d2d9606?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwxfHxmdXR1cmlzdGljJTIwZXYlMjBjaGFyZ2luZyUyMHN0YXRpb24lMjBuaWdodHxlbnwwfHx8fDE3NjcyMjA4MTF8MA&ixlib=rb-4.1.0&q=85'
  },
  {
    code: 'PROD_GSTSAAS',
    name: 'GSTSAAS',
    description: 'Workshop Intelligence',
    agent: 'AG_VARUNA',
    agentName: 'VARUNA',
    icon: Car,
    color: 'from-blue-500/20 to-cyan-500/20',
    borderColor: 'hover:border-blue-500/50',
    link: '/gstsaas',
    image: 'https://images.unsplash.com/photo-1682531046921-4a37f93b85de?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHwzfHxtb2Rlcm4lMjBhdXRvbW90aXZlJTIwd29ya3Nob3AlMjBtZWNoYW5pY3xlbnwwfHx8fDE3NjcyMjA4MTJ8MA&ixlib=rb-4.1.0&q=85'
  },
  {
    code: 'PROD_IGNITION',
    name: 'IGNITION',
    description: 'Customer Intelligence',
    agent: 'AG_BRAHMA',
    agentName: 'BRAHMA',
    icon: Users,
    color: 'from-purple-500/20 to-pink-500/20',
    borderColor: 'hover:border-purple-500/50',
    link: '/ignition',
    image: 'https://images.unsplash.com/photo-1762279389042-9439bfb6c155?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwzfHxhYnN0cmFjdCUyMGRhdGElMjB2aXN1YWxpemF0aW9uJTIwdGVjaG5vbG9neSUyMGRhcmt8ZW58MHx8fHwxNzY3MjIwODE1fDA&ixlib=rb-4.1.0&q=85'
  },
  {
    code: 'PROD_ARJUN',
    name: 'ARJUN',
    description: 'Training Intelligence',
    agent: 'AG_SARASWATI',
    agentName: 'SARASWATI',
    icon: GraduationCap,
    color: 'from-emerald-500/20 to-teal-500/20',
    borderColor: 'hover:border-emerald-500/50',
    link: '/arjun',
    image: 'https://images.unsplash.com/photo-1758873269035-aae0e1fd3422?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjB0cmFpbmluZyUyMHNlc3Npb24lMjBtb2Rlcm4lMjBvZmZpY2V8ZW58MHx8fHwxNzY3MjIwODE0fDA&ixlib=rb-4.1.0&q=85'
  },
];

const quickLinks = [
  { name: 'Finance', icon: TrendingUp, link: '/finance', agent: 'LAKSHMI' },
  { name: 'Legal', icon: Scale, link: '/legal', agent: 'YAMA' },
  { name: 'Support', icon: Headphones, link: '/support', agent: 'KUBERA' },
  { name: 'Settings', icon: Settings, link: '/settings', agent: 'SYSTEM' },
];

export default function Home() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]" data-testid="home-dashboard">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0a]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FF6B35] flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <span className="font-poppins text-xl font-bold text-white">EKA-AI</span>
              </Link>
            </div>

            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input 
                  placeholder="Search products, departments..." 
                  className="pl-10 bg-white/5 border-white/10"
                  data-testid="global-search"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative" data-testid="notifications-btn">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF6B35] rounded-full" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2" data-testid="user-menu-trigger">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <span className="text-white/80 hidden md:inline">{user?.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} data-testid="logout-btn">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-10">
          <h1 className="font-poppins text-3xl font-semibold text-white mb-2">
            Welcome back, {user?.name?.split(' ')[0]}! 
          </h1>
          <p className="text-white/60">
            {formatDate(currentTime)} • {formatTime(currentTime)}
          </p>
        </div>

        {/* Products Grid */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-poppins text-xl font-medium text-white">Products</h2>
            <Badge variant="teal">4 Active</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link to={product.link} key={product.code}>
                <Card 
                  className={`h-full cursor-pointer group overflow-hidden relative ${product.borderColor}`}
                  data-testid={`product-card-${product.code}`}
                >
                  <div 
                    className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity bg-cover bg-center"
                    style={{ backgroundImage: `url('${product.image}')` }}
                  />
                  <div className={`absolute inset-0 bg-gradient-to-b ${product.color} opacity-50`} />
                  <CardHeader className="relative z-10">
                    <div className="flex items-center justify-between">
                      <product.icon className="w-8 h-8 text-white/80" />
                      <Badge variant="success">Active</Badge>
                    </div>
                    <CardTitle className="text-xl mt-4">{product.name}</CardTitle>
                    <CardDescription className="text-white/60">{product.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="relative z-10 pt-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/40">Chief: {product.agentName}</span>
                      <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-[#FF6B35] group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Quick Links & Ask AI */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Department Quick Links */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-poppins text-xl font-medium text-white">Quick Access</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickLinks.map((item) => (
                <Link to={item.link} key={item.name}>
                  <Card 
                    className="p-4 cursor-pointer hover:border-[#FF6B35]/50 transition-all group"
                    data-testid={`quick-link-${item.name.toLowerCase()}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[#FF6B35]/20 transition-colors">
                        <item.icon className="w-5 h-5 text-white/60 group-hover:text-[#FF6B35]" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{item.name}</p>
                        <p className="text-white/40 text-xs">{item.agent}</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Ask EKA-AI Widget */}
          <Card className="p-6 bg-gradient-to-br from-[#FF6B35]/10 to-transparent border-[#FF6B35]/30" data-testid="ask-ai-widget">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#FF6B35] flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-poppins text-lg font-medium text-white">Ask EKA-AI</h3>
                <p className="text-white/60 text-sm">Powered by KAILASH</p>
              </div>
            </div>
            <p className="text-white/70 mb-6 text-sm">
              Get instant answers about your business metrics, operations, and insights.
            </p>
            <Button 
              className="w-full" 
              onClick={() => navigate('/ask')}
              data-testid="ask-ai-btn"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Start Conversation
            </Button>
          </Card>
        </div>

        {/* Departments Section */}
        <section className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-poppins text-xl font-medium text-white">Departments</h2>
            <Badge variant="default">11 Departments</Badge>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              { name: 'Marketing', agent: 'VAYU' },
              { name: 'Finance', agent: 'LAKSHMI' },
              { name: 'Technology', agent: 'VISHWAKARMA' },
              { name: 'Sales', agent: 'INDRA' },
              { name: 'Compliance', agent: 'YAMA' },
              { name: 'Support', agent: 'KUBERA' },
              { name: 'HR', agent: 'GAYATRI' },
              { name: 'Operations', agent: 'HANUMAN' },
              { name: 'Admin', agent: 'ANNAPURNA' },
              { name: 'R&D', agent: 'VISHNU' },
              { name: 'PR', agent: 'NARADA' },
            ].map((dept) => (
              <Button
                key={dept.name}
                variant="secondary"
                className="text-sm"
                onClick={() => navigate('/ask', { state: { category: dept.name } })}
                data-testid={`dept-btn-${dept.name.toLowerCase()}`}
              >
                <Building2 className="w-4 h-4 mr-2" />
                {dept.name}
                <span className="text-white/40 ml-1">• {dept.agent}</span>
              </Button>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-white/40 text-sm">
          <p>© 2025 Go4Garage. Powered by Kailash-Ai.in</p>
          <p>Secured by GANESHA</p>
        </div>
      </footer>
    </div>
  );
}
