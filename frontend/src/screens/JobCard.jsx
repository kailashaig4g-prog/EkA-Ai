import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Mic, MicOff, FileText, 
  Plus, Trash2, Save, Printer, Download
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { gstsaasAPI } from '../services/api';
import { toast } from 'sonner';

export default function JobCard() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedCard, setGeneratedCard] = useState(null);
  const [formData, setFormData] = useState({
    customer_name: '',
    vehicle_make: '',
    vehicle_model: '',
    registration: '',
    complaint: '',
    parts: [{ name: '', quantity: 1, price: 0 }],
    labor_hours: 0,
    labor_rate: 400,
  });

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
      parseTranscription(transcription);
      return;
    }

    setIsRecording(true);
    setTranscription('');
    recognition.start();

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setTranscription(transcript);
    };

    recognition.onerror = () => {
      setIsRecording(false);
      toast.error('Voice recognition failed');
    };
  };

  const parseTranscription = (text) => {
    // Simple parsing logic - in production, use AI for better parsing
    const lower = text.toLowerCase();
    
    // Try to extract vehicle info
    const vehicleMatch = lower.match(/(honda|yamaha|tvs|bajaj|hero|suzuki)\s+(\w+)/i);
    if (vehicleMatch) {
      setFormData(prev => ({
        ...prev,
        vehicle_make: vehicleMatch[1].toUpperCase(),
        vehicle_model: vehicleMatch[2].charAt(0).toUpperCase() + vehicleMatch[2].slice(1),
      }));
    }

    // Extract registration
    const regMatch = text.match(/[A-Z]{2}[-\s]?\d{1,2}[-\s]?[A-Z]{1,2}[-\s]?\d{4}/i);
    if (regMatch) {
      setFormData(prev => ({ ...prev, registration: regMatch[0].toUpperCase() }));
    }

    // Set complaint as full transcription for now
    setFormData(prev => ({ ...prev, complaint: text }));
  };

  const addPart = () => {
    setFormData(prev => ({
      ...prev,
      parts: [...prev.parts, { name: '', quantity: 1, price: 0 }]
    }));
  };

  const removePart = (index) => {
    setFormData(prev => ({
      ...prev,
      parts: prev.parts.filter((_, i) => i !== index)
    }));
  };

  const updatePart = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      parts: prev.parts.map((part, i) => 
        i === index ? { ...part, [field]: value } : part
      )
    }));
  };

  const calculateTotals = () => {
    const partsTotal = formData.parts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const laborCost = formData.labor_hours * formData.labor_rate;
    const subtotal = partsTotal + laborCost;
    const gst = subtotal * 0.18;
    const grandTotal = subtotal + gst;
    return { partsTotal, laborCost, subtotal, gst, grandTotal };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await gstsaasAPI.createJobCard(formData);
      setGeneratedCard(response.data);
      toast.success('Job card created successfully!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create job card');
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-[#0a0a0a]" data-testid="job-card-page">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0a]/80 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon" data-testid="back-btn">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-poppins text-xl font-semibold text-white">Job Card Creator</h1>
                <p className="text-white/60 text-sm">GSTSAAS • AG_VARUNA</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" data-testid="export-pdf-btn">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left - Form */}
          <div className="space-y-6">
            {/* Voice Input Section */}
            <Card className="p-6" data-testid="voice-input-section">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-poppins text-lg font-medium text-white">Input Mode</h2>
                <Badge variant={isRecording ? 'error' : 'default'}>
                  {isRecording ? 'Recording...' : 'Text Mode'}
                </Badge>
              </div>
              
              <Button
                onClick={handleVoiceInput}
                variant={isRecording ? 'destructive' : 'secondary'}
                className="w-full h-20 text-lg"
                data-testid="voice-record-btn"
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-6 h-6 mr-3 animate-pulse" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-6 h-6 mr-3" />
                    Start Voice Input
                  </>
                )}
              </Button>

              {transcription && (
                <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-white/60 text-sm mb-2">Transcription:</p>
                  <p className="text-white">{transcription}</p>
                </div>
              )}
            </Card>

            {/* Job Card Form */}
            <form onSubmit={handleSubmit}>
              <Card className="p-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle>Vehicle & Customer Details</CardTitle>
                </CardHeader>
                <CardContent className="px-0 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Customer Name</Label>
                      <Input
                        value={formData.customer_name}
                        onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                        placeholder="Enter name"
                        required
                        data-testid="customer-name-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Registration</Label>
                      <Input
                        value={formData.registration}
                        onChange={(e) => setFormData({ ...formData, registration: e.target.value })}
                        placeholder="DL-8C-1234"
                        required
                        data-testid="registration-input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Vehicle Make</Label>
                      <Input
                        value={formData.vehicle_make}
                        onChange={(e) => setFormData({ ...formData, vehicle_make: e.target.value })}
                        placeholder="Honda"
                        required
                        data-testid="vehicle-make-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Vehicle Model</Label>
                      <Input
                        value={formData.vehicle_model}
                        onChange={(e) => setFormData({ ...formData, vehicle_model: e.target.value })}
                        placeholder="Activa"
                        required
                        data-testid="vehicle-model-input"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Complaint / Work Required</Label>
                    <textarea
                      value={formData.complaint}
                      onChange={(e) => setFormData({ ...formData, complaint: e.target.value })}
                      placeholder="Describe the issue..."
                      className="w-full min-h-[100px] rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-white/30 focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] transition-all outline-none"
                      required
                      data-testid="complaint-input"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Parts Section */}
              <Card className="p-6 mt-6">
                <CardHeader className="px-0 pt-0">
                  <div className="flex items-center justify-between">
                    <CardTitle>Parts Required</CardTitle>
                    <Button type="button" variant="secondary" size="sm" onClick={addPart} data-testid="add-part-btn">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Part
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-0 space-y-3">
                  {formData.parts.map((part, index) => (
                    <div key={index} className="flex gap-3 items-end">
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs">Part Name</Label>
                        <Input
                          value={part.name}
                          onChange={(e) => updatePart(index, 'name', e.target.value)}
                          placeholder="Spark plug"
                          data-testid={`part-name-${index}`}
                        />
                      </div>
                      <div className="w-20 space-y-1">
                        <Label className="text-xs">Qty</Label>
                        <Input
                          type="number"
                          value={part.quantity}
                          onChange={(e) => updatePart(index, 'quantity', parseInt(e.target.value) || 0)}
                          min="1"
                          data-testid={`part-qty-${index}`}
                        />
                      </div>
                      <div className="w-28 space-y-1">
                        <Label className="text-xs">Price (₹)</Label>
                        <Input
                          type="number"
                          value={part.price}
                          onChange={(e) => updatePart(index, 'price', parseFloat(e.target.value) || 0)}
                          min="0"
                          data-testid={`part-price-${index}`}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removePart(index)}
                        className="text-red-400 hover:text-red-300"
                        data-testid={`remove-part-${index}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Labor Section */}
              <Card className="p-6 mt-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle>Labor</CardTitle>
                </CardHeader>
                <CardContent className="px-0">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Hours</Label>
                      <Input
                        type="number"
                        value={formData.labor_hours}
                        onChange={(e) => setFormData({ ...formData, labor_hours: parseFloat(e.target.value) || 0 })}
                        min="0"
                        step="0.5"
                        data-testid="labor-hours-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Rate (₹/hour)</Label>
                      <Input
                        type="number"
                        value={formData.labor_rate}
                        onChange={(e) => setFormData({ ...formData, labor_rate: parseFloat(e.target.value) || 0 })}
                        min="0"
                        data-testid="labor-rate-input"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button type="submit" className="w-full mt-6" disabled={loading} data-testid="create-jobcard-btn">
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Creating...' : 'Create Job Card'}
              </Button>
            </form>
          </div>

          {/* Right - Preview */}
          <div>
            <Card className="p-6 sticky top-24" data-testid="jobcard-preview">
              <CardHeader className="px-0 pt-0">
                <div className="flex items-center justify-between">
                  <CardTitle>Job Card Preview</CardTitle>
                  {generatedCard && (
                    <Badge variant="success">{generatedCard.job_number}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="px-0">
                <div className="space-y-6">
                  {/* Vehicle Info */}
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <h3 className="text-white/60 text-sm mb-2">VEHICLE DETAILS</h3>
                    <p className="text-white font-medium">
                      {formData.vehicle_make || '—'} {formData.vehicle_model || '—'}
                    </p>
                    <p className="text-white/80">{formData.registration || '—'}</p>
                    <p className="text-white/60 mt-2">Customer: {formData.customer_name || '—'}</p>
                  </div>

                  {/* Complaint */}
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <h3 className="text-white/60 text-sm mb-2">COMPLAINT</h3>
                    <p className="text-white">{formData.complaint || 'No complaint specified'}</p>
                  </div>

                  {/* Parts */}
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <h3 className="text-white/60 text-sm mb-2">PARTS REQUIRED</h3>
                    {formData.parts.filter(p => p.name).map((part, index) => (
                      <div key={index} className="flex justify-between text-white py-1">
                        <span>{part.name} × {part.quantity}</span>
                        <span>₹{(part.price * part.quantity).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                    {!formData.parts.some(p => p.name) && (
                      <p className="text-white/40">No parts added</p>
                    )}
                  </div>

                  {/* Totals */}
                  <div className="p-4 bg-[#FF6B35]/10 rounded-lg border border-[#FF6B35]/30">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-white/70">
                        <span>Parts Total</span>
                        <span>₹{totals.partsTotal.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-white/70">
                        <span>Labor ({formData.labor_hours}h × ₹{formData.labor_rate})</span>
                        <span>₹{totals.laborCost.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="border-t border-white/10 pt-2 mt-2">
                        <div className="flex justify-between text-white/70">
                          <span>Subtotal</span>
                          <span>₹{totals.subtotal.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-white/70">
                          <span>GST (18%)</span>
                          <span>₹{totals.gst.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-white font-semibold text-lg mt-2">
                          <span>Grand Total</span>
                          <span className="text-[#FF6B35]">₹{totals.grandTotal.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Provenance */}
                  <div className="text-center pt-4 border-t border-white/10">
                    <p className="text-white/40 text-xs">
                      Generated by AG_VARUNA • Verified by GANESHA ✓
                    </p>
                    <p className="text-white/30 text-xs mt-1">[WP_SUPPORT_TABLE_V1.0]</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
