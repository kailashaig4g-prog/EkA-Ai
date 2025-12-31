import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, BarChart3, TrendingUp, MousePointer,
  Calendar, Clock, Target, RefreshCw
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { promotionsAPI } from '../services/api';
import { toast } from 'sonner';

const MetricCard = ({ icon: Icon, label, value, subtext, color }) => (
  <Card className="p-4" data-testid={`metric-${label.toLowerCase().replace(/\s/g, '-')}`}>
    <div className="flex items-start justify-between">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <div className="mt-3">
      <p className="text-2xl font-semibold text-white">{value}</p>
      <p className="text-white/50 text-sm">{label}</p>
      {subtext && <p className="text-white/30 text-xs mt-1">{subtext}</p>}
    </div>
  </Card>
);

export default function PromoAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await promotionsAPI.getAnalytics();
      setAnalytics(response.data);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const maxClicks = analytics?.promo_stats?.length 
    ? Math.max(...analytics.promo_stats.map(p => p.total_clicks))
    : 1;

  return (
    <div className="min-h-screen bg-[#0a0a0a]" data-testid="promo-analytics-page">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0a]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/settings">
                <Button variant="ghost" size="icon" data-testid="back-btn">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-poppins text-xl font-semibold text-white">Promotional Analytics</h1>
                <p className="text-white/60 text-sm">Track offer performance and engagement</p>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={fetchAnalytics} data-testid="refresh-btn">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Summary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <MetricCard
            icon={MousePointer}
            label="Total Clicks"
            value={analytics?.summary?.total_clicks || 0}
            color="bg-[#FF6B35]/20 text-[#FF6B35]"
          />
          <MetricCard
            icon={Target}
            label="Promos Clicked"
            value={analytics?.summary?.unique_promos_clicked || 0}
            color="bg-teal-500/20 text-teal-400"
          />
          <MetricCard
            icon={TrendingUp}
            label="Top Performer"
            value={analytics?.summary?.top_promo?.total_clicks || 0}
            subtext={analytics?.summary?.top_promo?.promo_title?.slice(0, 20) || 'N/A'}
            color="bg-emerald-500/20 text-emerald-400"
          />
          <MetricCard
            icon={BarChart3}
            label="Avg per Promo"
            value={
              analytics?.summary?.unique_promos_clicked 
                ? Math.round(analytics.summary.total_clicks / analytics.summary.unique_promos_clicked)
                : 0
            }
            color="bg-purple-500/20 text-purple-400"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Promo Performance */}
          <Card className="p-6" data-testid="promo-performance">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#FF6B35]" />
                Promotion Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 space-y-4">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : analytics?.promo_stats?.length > 0 ? (
                analytics.promo_stats.map((promo, index) => (
                  <div key={promo._id || index} className="p-3 bg-white/5 rounded-lg" data-testid={`promo-stat-${index}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">{promo.promo_title}</p>
                        <p className="text-white/40 text-xs">ID: {promo._id?.slice(0, 8)}...</p>
                      </div>
                      <Badge variant="orange" className="ml-2">
                        {promo.total_clicks} clicks
                      </Badge>
                    </div>
                    <Progress value={(promo.total_clicks / maxClicks) * 100} className="h-2" />
                    <div className="flex justify-between mt-2 text-xs text-white/40">
                      <span>First: {new Date(promo.first_click).toLocaleDateString()}</span>
                      <span>Last: {new Date(promo.last_click).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <MousePointer className="w-10 h-10 text-white/20 mx-auto mb-3" />
                  <p className="text-white/40">No click data yet</p>
                  <p className="text-white/30 text-sm">Clicks will appear here when users interact with promotions</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Daily Activity */}
          <Card className="p-6" data-testid="daily-activity">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-400" />
                Daily Activity (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5, 6, 7].map(i => (
                    <div key={i} className="h-8 bg-white/5 rounded animate-pulse" />
                  ))}
                </div>
              ) : analytics?.daily_stats?.length > 0 ? (
                <div className="space-y-2">
                  {analytics.daily_stats.map((day, index) => (
                    <div key={day._id || index} className="flex items-center gap-3" data-testid={`daily-stat-${index}`}>
                      <span className="text-white/60 text-xs w-20">{day._id}</span>
                      <div className="flex-1 bg-white/5 rounded-full h-6 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full flex items-center justify-end pr-2"
                          style={{ width: `${Math.max((day.clicks / (analytics?.summary?.total_clicks || 1)) * 100 * 3, 10)}%` }}
                        >
                          <span className="text-[10px] text-white font-medium">{day.clicks}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-10 h-10 text-white/20 mx-auto mb-3" />
                  <p className="text-white/40">No daily data yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Hourly Heatmap */}
          <Card className="p-6 lg:col-span-2" data-testid="hourly-heatmap">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-400" />
                Hourly Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              {loading ? (
                <div className="h-20 bg-white/5 rounded animate-pulse" />
              ) : analytics?.hourly_stats?.length > 0 ? (
                <div className="flex gap-1 flex-wrap">
                  {Array.from({ length: 24 }, (_, hour) => {
                    const stat = analytics.hourly_stats.find(h => h._id === hour);
                    const clicks = stat?.clicks || 0;
                    const maxHourly = Math.max(...analytics.hourly_stats.map(h => h.clicks));
                    const intensity = clicks / (maxHourly || 1);
                    
                    return (
                      <div
                        key={hour}
                        className="flex flex-col items-center gap-1"
                        title={`${hour}:00 - ${clicks} clicks`}
                      >
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-medium transition-colors"
                          style={{
                            backgroundColor: clicks > 0 
                              ? `rgba(255, 107, 53, ${0.2 + intensity * 0.8})`
                              : 'rgba(255, 255, 255, 0.05)',
                            color: clicks > 0 ? 'white' : 'rgba(255, 255, 255, 0.3)'
                          }}
                        >
                          {clicks || '-'}
                        </div>
                        <span className="text-[9px] text-white/30">{hour}h</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-10 h-10 text-white/20 mx-auto mb-3" />
                  <p className="text-white/40">No hourly data yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
