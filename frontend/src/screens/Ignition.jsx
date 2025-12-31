import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Users, TrendingDown, TrendingUp,
  Smile, Frown, Meh, Phone, Mail, AlertTriangle
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { ignitionAPI } from '../services/api';
import { toast } from 'sonner';

const SentimentIcon = ({ score }) => {
  if (score >= 4) return <Smile className="w-5 h-5 text-emerald-400" />;
  if (score >= 3) return <Meh className="w-5 h-5 text-amber-400" />;
  return <Frown className="w-5 h-5 text-red-400" />;
};

const JourneyStage = ({ label, value, color }) => (
  <div className="flex flex-col items-center">
    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${color} mb-2`}>
      <span className="text-white font-semibold">{value}%</span>
    </div>
    <span className="text-white/60 text-sm">{label}</span>
  </div>
);

const ChurnRiskCard = ({ customer }) => (
  <Card className="p-4 border-red-500/30 bg-red-500/5" data-testid={`churn-risk-${customer.id}`}>
    <div className="flex items-start justify-between mb-3">
      <div>
        <h3 className="text-white font-medium">{customer.name}</h3>
        <p className="text-white/50 text-sm">ID: {customer.id}</p>
      </div>
      <Badge variant={customer.risk_level === 'high' ? 'error' : 'warning'}>
        {customer.risk_level} risk
      </Badge>
    </div>
    <div className="flex items-center gap-4 text-sm text-white/60 mb-4">
      <span>Last visit: {customer.last_visit_days} days ago</span>
      <div className="flex items-center gap-1">
        <SentimentIcon score={customer.sentiment} />
        <span>{customer.sentiment}/5</span>
      </div>
    </div>
    <div className="flex gap-2">
      <Button variant="secondary" size="sm" className="flex-1" data-testid={`send-offer-${customer.id}`}>
        <Mail className="w-4 h-4 mr-1" />
        Send Offer
      </Button>
      <Button variant="default" size="sm" data-testid={`call-now-${customer.id}`}>
        <Phone className="w-4 h-4 mr-1" />
        Call
      </Button>
    </div>
  </Card>
);

export default function Ignition() {
  const [metrics, setMetrics] = useState(null);
  const [churnRisks, setChurnRisks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [metricsRes, churnRes] = await Promise.all([
        ignitionAPI.getMetrics(),
        ignitionAPI.getChurnRisks(),
      ]);
      setMetrics(metricsRes.data);
      setChurnRisks(churnRes.data);
    } catch (error) {
      toast.error('Failed to load customer data');
    } finally {
      setLoading(false);
    }
  };

  const journeyStages = metrics?.journey_stages || {
    onboarding: 45,
    first_purchase: 78,
    repeat: 62,
    loyalty: 34,
    advocate: 18,
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]" data-testid="ignition-dashboard">
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
                <h1 className="font-poppins text-xl font-semibold text-white">IGNITION - Customer Intelligence</h1>
                <p className="text-white/60 text-sm">Chief Agent: AG_BRAHMA • BRAHMA</p>
              </div>
            </div>
            <Button variant="secondary" size="sm" data-testid="export-report-btn">
              Export Report
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="p-4" data-testid="metric-total-customers">
            <Users className="w-8 h-8 text-blue-400 mb-2" />
            <p className="text-2xl font-semibold text-white">{metrics?.total_customers?.toLocaleString() || '2,340'}</p>
            <p className="text-white/50 text-sm">Total Customers</p>
          </Card>
          <Card className="p-4" data-testid="metric-active">
            <TrendingUp className="w-8 h-8 text-emerald-400 mb-2" />
            <p className="text-2xl font-semibold text-white">{metrics?.active_customers?.toLocaleString() || '1,890'}</p>
            <p className="text-white/50 text-sm">Active Customers</p>
          </Card>
          <Card className="p-4" data-testid="metric-churn-risk">
            <TrendingDown className="w-8 h-8 text-red-400 mb-2" />
            <p className="text-2xl font-semibold text-white">{metrics?.churn_risk_count || 45}</p>
            <p className="text-white/50 text-sm">Churn Risk</p>
          </Card>
          <Card className="p-4" data-testid="metric-sentiment">
            <Smile className="w-8 h-8 text-amber-400 mb-2" />
            <p className="text-2xl font-semibold text-white">{metrics?.avg_sentiment || 4.2}/5</p>
            <p className="text-white/50 text-sm">Avg Sentiment</p>
          </Card>
          <Card className="p-4 col-span-2" data-testid="metric-nps">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/50 text-sm mb-1">Net Promoter Score</p>
                <p className="text-3xl font-semibold text-emerald-400">+{metrics?.nps_score || 42}</p>
              </div>
              <div className="w-16 h-16 rounded-full border-4 border-emerald-500 flex items-center justify-center">
                <span className="text-emerald-400 font-bold">Good</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Customer Journey */}
        <Card className="p-6 mb-8" data-testid="customer-journey">
          <CardHeader className="px-0 pt-0">
            <CardTitle>Customer Journey Overview</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <div className="flex items-center justify-between">
              {[
                { label: 'Onboarding', value: journeyStages.onboarding, color: 'bg-blue-500/30' },
                { label: 'First Purchase', value: journeyStages.first_purchase, color: 'bg-emerald-500/30' },
                { label: 'Repeat', value: journeyStages.repeat, color: 'bg-teal-500/30' },
                { label: 'Loyalty', value: journeyStages.loyalty, color: 'bg-purple-500/30' },
                { label: 'Advocate', value: journeyStages.advocate, color: 'bg-amber-500/30' },
              ].map((stage, index) => (
                <div key={stage.label} className="flex items-center">
                  <JourneyStage {...stage} />
                  {index < 4 && (
                    <div className="w-12 h-1 bg-white/10 mx-2" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Churn Risk Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <h2 className="font-poppins text-xl font-medium text-white">
                Churn Prediction ({churnRisks.length} at risk)
              </h2>
            </div>
            <Button variant="secondary" size="sm" data-testid="view-all-churn">
              View All
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="h-40 animate-pulse bg-white/5" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {churnRisks.map((customer) => (
                <ChurnRiskCard key={customer.id} customer={customer} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
