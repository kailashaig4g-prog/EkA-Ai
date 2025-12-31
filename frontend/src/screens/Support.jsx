import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Headphones, Clock, AlertTriangle,
  CheckCircle2, Circle, Plus
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { supportAPI } from '../services/api';
import { toast } from 'sonner';

const priorityColors = {
  urgent: 'error',
  high: 'warning',
  medium: 'info',
  low: 'default',
};

const statusColors = {
  open: 'error',
  in_progress: 'warning',
  resolved: 'success',
  closed: 'default',
};

const TicketCard = ({ ticket }) => (
  <Card className="p-4" data-testid={`ticket-${ticket.id}`}>
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-2">
        <Badge variant={statusColors[ticket.status]}>
          {ticket.status === 'open' && <Circle className="w-3 h-3 mr-1 fill-current" />}
          {ticket.status === 'in_progress' && <Clock className="w-3 h-3 mr-1" />}
          {ticket.status === 'resolved' && <CheckCircle2 className="w-3 h-3 mr-1" />}
          {ticket.status.replace('_', ' ')}
        </Badge>
        <Badge variant={priorityColors[ticket.priority]}>
          {ticket.priority}
        </Badge>
      </div>
      <span className="text-white/40 text-sm">{ticket.ticket_number}</span>
    </div>

    <h3 className="text-white font-medium mb-2">{ticket.subject}</h3>
    <p className="text-white/60 text-sm mb-4 line-clamp-2">{ticket.description}</p>

    <div className="flex items-center justify-between text-sm">
      <span className="text-white/50">Assigned: {ticket.assigned_to}</span>
      <div className="flex items-center gap-1 text-white/50">
        <Clock className="w-4 h-4" />
        SLA: {ticket.sla_hours}h
      </div>
    </div>
  </Card>
);

export default function Support() {
  const [tickets, setTickets] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'medium',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ticketsRes, metricsRes] = await Promise.all([
        supportAPI.getTickets(),
        supportAPI.getMetrics(),
      ]);
      setTickets(ticketsRes.data);
      setMetrics(metricsRes.data);
    } catch (error) {
      toast.error('Failed to load support data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await supportAPI.createTicket(formData);
      toast.success('Ticket created successfully');
      setShowForm(false);
      setFormData({ subject: '', description: '', priority: 'medium' });
      fetchData();
    } catch (error) {
      toast.error('Failed to create ticket');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]" data-testid="support-dashboard">
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
                <h1 className="font-poppins text-xl font-semibold text-white">Support Dashboard</h1>
                <p className="text-white/60 text-sm">Chief Agent: AG_KUBERA • KUBERA</p>
              </div>
            </div>
            <Button onClick={() => setShowForm(!showForm)} data-testid="create-ticket-btn">
              <Plus className="w-4 h-4 mr-2" />
              Create Ticket
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* SLA Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4" data-testid="metric-open">
            <Headphones className="w-8 h-8 text-red-400 mb-2" />
            <p className="text-2xl font-semibold text-white">{metrics?.open_tickets || 23}</p>
            <p className="text-white/50 text-sm">Open Tickets</p>
          </Card>
          <Card className="p-4" data-testid="metric-in-progress">
            <Clock className="w-8 h-8 text-amber-400 mb-2" />
            <p className="text-2xl font-semibold text-white">{metrics?.in_progress || 12}</p>
            <p className="text-white/50 text-sm">In Progress</p>
          </Card>
          <Card className="p-4" data-testid="metric-resolved">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
            <p className="text-2xl font-semibold text-white">{metrics?.resolved_today || 45}</p>
            <p className="text-white/50 text-sm">Resolved Today</p>
          </Card>
          <Card className="p-4" data-testid="metric-sla">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/50 text-sm mb-1">SLA Compliance</p>
                <p className="text-2xl font-semibold text-emerald-400">{metrics?.sla_compliance || 92}%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Create Ticket Form */}
        {showForm && (
          <Card className="p-6 mb-8" data-testid="ticket-form">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Create New Ticket</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Brief description of the issue"
                    required
                    data-testid="ticket-subject-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detailed description..."
                    className="w-full min-h-[100px] rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-white/30 focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] transition-all outline-none"
                    required
                    data-testid="ticket-description-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full h-11 rounded-lg border border-white/10 bg-black/20 px-4 text-white focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] transition-all outline-none"
                    data-testid="ticket-priority-select"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <Button type="submit" data-testid="submit-ticket-btn">Create Ticket</Button>
                  <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Tickets List */}
        <section>
          <h2 className="font-poppins text-xl font-medium text-white mb-6">Recent Tickets</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="h-40 animate-pulse bg-white/5" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          )}
        </section>

        {/* Escalation Path */}
        <Card className="mt-8 p-4 border-amber-500/30 bg-amber-500/5" data-testid="escalation-path">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-amber-400 font-medium mb-1">Escalation Path</h3>
              <p className="text-white/60 text-sm">
                Ticket → AG_KUBERA → Department Head → AG_SHIV (Auto-rectification)
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
