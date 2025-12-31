import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Scale, FileText, AlertTriangle,
  CheckCircle2, Clock, Download, Plus
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { legalAPI } from '../services/api';
import { toast } from 'sonner';

const riskColors = {
  low: 'success',
  medium: 'warning',
  high: 'error',
};

const statusIcons = {
  approved: CheckCircle2,
  under_review: Clock,
  pending: AlertTriangle,
};

const ContractCard = ({ contract }) => {
  const StatusIcon = statusIcons[contract.status] || Clock;

  return (
    <Card className="p-5" data-testid={`contract-${contract.id}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Badge variant={contract.status === 'approved' ? 'success' : contract.status === 'pending' ? 'warning' : 'info'}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {contract.status.replace('_', ' ')}
          </Badge>
          <Badge variant={riskColors[contract.risk_level]}>
            {contract.risk_level} risk
          </Badge>
        </div>
      </div>

      <h3 className="text-white font-medium mb-3">{contract.title}</h3>

      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        <div>
          <p className="text-white/50">Clauses</p>
          <p className="text-white">{contract.clauses}</p>
        </div>
        <div>
          <p className="text-white/50">Flagged</p>
          <p className={contract.flagged > 0 ? 'text-amber-400' : 'text-white'}>{contract.flagged}</p>
        </div>
        {contract.valid_until && (
          <div className="col-span-2">
            <p className="text-white/50">Valid Until</p>
            <p className="text-white">{contract.valid_until}</p>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {contract.status === 'under_review' ? (
          <>
            <Button variant="secondary" size="sm" className="flex-1" data-testid={`review-${contract.id}`}>
              Review
            </Button>
            <Button variant="secondary" size="sm" data-testid={`request-changes-${contract.id}`}>
              Request Changes
            </Button>
            <Button size="sm" data-testid={`approve-${contract.id}`}>
              Approve
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" size="sm" className="flex-1" data-testid={`view-${contract.id}`}>
              View
            </Button>
            <Button variant="secondary" size="sm" data-testid={`download-${contract.id}`}>
              <Download className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </Card>
  );
};

export default function Legal() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await legalAPI.getContracts();
      setContracts(response.data);
    } catch (error) {
      toast.error('Failed to load legal data');
    } finally {
      setLoading(false);
    }
  };

  const pendingReviews = contracts.filter(c => c.status === 'under_review' || c.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#0a0a0a]" data-testid="legal-dashboard">
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
                <h1 className="font-poppins text-xl font-semibold text-white">Legal & Compliance</h1>
                <p className="text-white/60 text-sm">Chief Agent: AG_YAMA • YAMA</p>
              </div>
            </div>
            <Button data-testid="new-contract-btn">
              <Plus className="w-4 h-4 mr-2" />
              New Contract
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Pending Reviews Alert */}
        {pendingReviews > 0 && (
          <Card className="p-4 mb-8 border-amber-500/30 bg-amber-500/5" data-testid="pending-alert">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-amber-400 font-medium">
                  {pendingReviews} contract{pendingReviews > 1 ? 's' : ''} awaiting review
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Contracts Grid */}
        <section>
          <h2 className="font-poppins text-xl font-medium text-white mb-6">Contracts</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="h-48 animate-pulse bg-white/5" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {contracts.map((contract) => (
                <ContractCard key={contract.id} contract={contract} />
              ))}
            </div>
          )}
        </section>

        {/* Work Profile Notice */}
        <Card className="mt-8 p-4 border-white/10" data-testid="work-profile-notice">
          <p className="text-white/60 text-sm">
            All legal outputs follow <span className="text-teal-400 font-mono">WP_LEGAL_BRIEF_V1.0</span> (brief, risk-aware format)
          </p>
        </Card>
      </main>
    </div>
  );
}
