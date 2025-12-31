import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Zap, Battery, Activity, 
  AlertTriangle, TrendingUp, RefreshCw,
  MapPin, Clock
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { urgaaAPI } from '../services/api';
import { toast } from 'sonner';

const MetricCard = ({ icon: Icon, label, value, suffix, trend, color }) => (
  <Card className="p-4" data-testid={`metric-${label.toLowerCase().replace(/\s/g, '-')}`}>
    <div className="flex items-start justify-between">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      {trend && (
        <Badge variant={trend > 0 ? 'success' : 'error'} className="text-xs">
          {trend > 0 ? '+' : ''}{trend}%
        </Badge>
      )}
    </div>
    <div className="mt-3">
      <p className="text-2xl font-semibold text-white">{value}<span className="text-lg text-white/60">{suffix}</span></p>
      <p className="text-white/50 text-sm">{label}</p>
    </div>
  </Card>
);

const StationCard = ({ station }) => {
  const statusColors = {
    active: 'bg-emerald-500',
    alert: 'bg-amber-500',
    maintenance: 'bg-red-500',
    offline: 'bg-gray-500',
  };

  const statusLabels = {
    active: 'Active',
    alert: 'Alert',
    maintenance: 'Maintenance',
    offline: 'Offline',
  };

  return (
    <Card className="p-5 hover:border-teal-500/50 transition-colors" data-testid={`station-${station.id}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-poppins text-lg font-medium text-white">{station.name}</h3>
          <div className="flex items-center gap-2 text-white/60 text-sm mt-1">
            <MapPin className="w-4 h-4" />
            {station.location}
          </div>
        </div>
        <Badge variant={station.status === 'active' ? 'success' : station.status === 'alert' ? 'warning' : 'error'}>
          <span className={`w-2 h-2 rounded-full mr-1.5 ${statusColors[station.status]}`} />
          {statusLabels[station.status]}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-white/50 text-xs mb-1">Chargers</p>
          <p className="text-white font-medium">
            {station.chargers_active}/{station.chargers_total} Active
          </p>
        </div>
        <div>
          <p className="text-white/50 text-xs mb-1">Current Load</p>
          <p className="text-white font-medium">{station.current_load} kW</p>
        </div>
        <div>
          <p className="text-white/50 text-xs mb-1">Today's Sessions</p>
          <p className="text-white font-medium">{station.today_sessions}</p>
        </div>
        <div>
          <p className="text-white/50 text-xs mb-1">Energy Delivered</p>
          <p className="text-white font-medium">{station.today_energy} kWh</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs text-white/50 mb-1">
          <span>Capacity Usage</span>
          <span>{Math.round((station.chargers_active / station.chargers_total) * 100)}%</span>
        </div>
        <Progress value={(station.chargers_active / station.chargers_total) * 100} />
      </div>

      <div className="flex gap-2">
        <Button variant="secondary" size="sm" className="flex-1" data-testid={`view-station-${station.id}`}>
          View Details
        </Button>
        {station.status === 'alert' && (
          <Button variant="destructive" size="sm" data-testid={`escalate-station-${station.id}`}>
            Escalate
          </Button>
        )}
      </div>
    </Card>
  );
};

export default function URGAA() {
  const [metrics, setMetrics] = useState(null);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [metricsRes, stationsRes] = await Promise.all([
        urgaaAPI.getMetrics(),
        urgaaAPI.getStations(),
      ]);
      setMetrics(metricsRes.data);
      setStations(stationsRes.data);
    } catch (error) {
      toast.error('Failed to load URGAA data');
    } finally {
      setLoading(false);
    }
  };

  const filteredStations = stations.filter(s => {
    if (filter === 'all') return true;
    return s.status === filter;
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a]" data-testid="urgaa-dashboard">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0a]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon" data-testid="back-btn">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-poppins text-xl font-semibold text-white">URGAA - EV Charging Intelligence</h1>
                <p className="text-white/60 text-sm">Chief Agent: AG_SURYA • SURYA</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="warning">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {metrics?.alerts_count || 0} Alerts
              </Badge>
              <Button variant="secondary" size="sm" onClick={fetchData} data-testid="refresh-btn">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <MetricCard
            icon={Zap}
            label="Total Stations"
            value={metrics?.total_stations || 45}
            color="bg-amber-500/20 text-amber-400"
          />
          <MetricCard
            icon={Activity}
            label="Active Sessions"
            value={metrics?.active_sessions || 12}
            color="bg-emerald-500/20 text-emerald-400"
            trend={8}
          />
          <MetricCard
            icon={Battery}
            label="Energy Today"
            value={(metrics?.total_energy_mw || 3.2).toFixed(1)}
            suffix=" MW"
            color="bg-blue-500/20 text-blue-400"
          />
          <MetricCard
            icon={TrendingUp}
            label="Uptime"
            value={(metrics?.uptime_percent || 98.5).toFixed(1)}
            suffix="%"
            color="bg-teal-500/20 text-teal-400"
          />
          <MetricCard
            icon={AlertTriangle}
            label="Alerts"
            value={metrics?.alerts_count || 3}
            color="bg-red-500/20 text-red-400"
          />
          <MetricCard
            icon={TrendingUp}
            label="Revenue Today"
            value={`₹${((metrics?.revenue_today || 120000) / 1000).toFixed(0)}K`}
            color="bg-purple-500/20 text-purple-400"
            trend={12}
          />
        </div>

        {/* Stations Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-poppins text-xl font-medium text-white">Charging Stations</h2>
            <div className="flex gap-2">
              {['all', 'active', 'alert', 'maintenance'].map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? 'default' : 'secondary'}
                  size="sm"
                  onClick={() => setFilter(f)}
                  data-testid={`filter-${f}`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="h-64 animate-pulse bg-white/5" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStations.map((station) => (
                <StationCard key={station.id} station={station} />
              ))}
            </div>
          )}
        </section>

        {/* Restricted Actions Notice */}
        <Card className="mt-8 p-4 border-amber-500/30 bg-amber-500/5" data-testid="restricted-notice">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-amber-400 font-medium mb-1">Restricted Actions</h3>
              <p className="text-white/60 text-sm">
                Remote shutdown, firmware updates, and pricing changes require approval from AG_SURYA.
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
