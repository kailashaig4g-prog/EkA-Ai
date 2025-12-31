import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, Send, Mic, MicOff, Settings,
  Zap, RefreshCw, Check, Target, Loader2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { aiAPI } from '../services/api';
import { usePipelineUpdates } from '../hooks/useSocket';
import useAuthStore from '../store/authStore';
import { toast } from 'sonner';

const categories = ['All', 'Products', 'Finance', 'Legal', 'Support', 'Tech', 'URGAA', 'GSTSAAS'];

const PipelineStatus = ({ steps, currentStep }) => {
  const stepIcons = {
    routing: RefreshCw,
    drafting: Zap,
    verifying: Check,
    delivered: Target,
  };

  const stepLabels = {
    routing: 'Routing',
    drafting: 'Drafting',
    verifying: 'Verifying',
    delivered: 'Delivered',
  };

  return (
    <div className="flex items-center justify-between p-4 bg-[#121212]/80 rounded-xl border border-white/5 my-4" data-testid="pipeline-status">
      {['routing', 'drafting', 'verifying', 'delivered'].map((step, index) => {
        const Icon = stepIcons[step];
        const isComplete = steps.some(s => s.step === step && s.status === 'complete');
        const isActive = currentStep === step;
        
        return (
          <div key={step} className="flex items-center">
            <div className={`flex flex-col items-center gap-2 transition-all ${isComplete ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                isComplete ? 'bg-emerald-500/20 text-emerald-400' : 
                isActive ? 'bg-[#FF6B35]/20 text-[#FF6B35] animate-pulse' : 
                'bg-white/5 text-white/40'
              }`}>
                {isActive && !isComplete ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <span className={`text-xs font-medium ${isComplete ? 'text-emerald-400' : isActive ? 'text-[#FF6B35]' : 'text-white/40'}`}>
                {stepLabels[step]}
              </span>
            </div>
            {index < 3 && (
              <div className={`w-12 h-0.5 mx-2 ${isComplete ? 'bg-emerald-500/50' : 'bg-white/10'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

const ProvenanceBadge = ({ provenance }) => (
  <div className="border-t border-white/10 pt-3 mt-4 text-sm" data-testid="provenance-badge">
    <div className="flex items-center gap-2 text-white/60 mb-2">
      <span>Answered by <span className="text-teal-400 font-medium">{provenance.answeredBy}</span></span>
      <span>•</span>
      <span>Verified by <span className="text-teal-400 font-medium">{provenance.verifiedBy}</span> ✓</span>
    </div>
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <span key={i} className="text-amber-400">★</span>
        ))}
        <span className="text-white/80 ml-1">{provenance.rating}/5.0</span>
      </div>
    </div>
    <div className="mt-2 text-xs text-white/40 font-mono">
      [{provenance.workProfile} • {provenance.checklist}]
    </div>
  </div>
);

const MessageBubble = ({ message, isUser }) => (
  <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`} data-testid={`message-${message.id}`}>
    <div className={`max-w-[80%] ${isUser ? 'order-1' : ''}`}>
      <div className={`rounded-2xl px-4 py-3 ${
        isUser 
          ? 'bg-[#FF6B35] text-white rounded-br-none' 
          : 'bg-white/[0.03] backdrop-blur-xl border border-white/10 text-white/90 rounded-bl-none'
      }`}>
        <div className="whitespace-pre-wrap">{message.content}</div>
        {!isUser && message.provenance && (
          <ProvenanceBadge provenance={message.provenance} />
        )}
      </div>
      <p className={`text-xs text-white/40 mt-1 ${isUser ? 'text-right' : ''}`}>
        {new Date(message.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
      </p>
    </div>
  </div>
);

export default function AskAI() {
  const location = useLocation();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(location.state?.category || 'All');
  const [pipelineSteps, setPipelineSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulatePipeline = async () => {
    const steps = ['routing', 'drafting', 'verifying', 'delivered'];
    const delays = [800, 1500, 1000, 500];
    
    for (let i = 0; i < steps.length - 1; i++) {
      setCurrentStep(steps[i]);
      setPipelineSteps(prev => [...prev, { step: steps[i], status: 'complete' }]);
      await new Promise(resolve => setTimeout(resolve, delays[i]));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setPipelineSteps([]);
    setCurrentStep('routing');

    try {
      // Start pipeline simulation
      const pipelinePromise = simulatePipeline();
      
      // Make API call
      const response = await aiAPI.ask(userMessage.content, selectedCategory);
      
      // Wait for pipeline animation
      await pipelinePromise;
      
      setCurrentStep('delivered');
      setPipelineSteps(prev => [...prev, { step: 'delivered', status: 'complete' }]);

      const aiMessage = {
        id: response.data.id,
        role: 'assistant',
        content: response.data.answer,
        timestamp: response.data.timestamp,
        provenance: response.data.provenance,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      toast.error('Failed to get response. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setPipelineSteps([]);
        setCurrentStep(null);
      }, 2000);
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
      return;
    }

    setIsRecording(true);
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + ' ' + transcript);
      setIsRecording(false);
    };

    recognition.onerror = () => {
      setIsRecording(false);
      toast.error('Voice recognition failed');
    };

    recognition.onend = () => {
      setIsRecording(false);
    };
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col" data-testid="ask-ai-page">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0a]/80 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon" data-testid="back-btn">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-poppins text-xl font-semibold text-white">Ask EKA-AI</h1>
                <p className="text-white/60 text-sm">Powered by KAILASH • Verified by GANESHA</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" data-testid="settings-btn">
              <Settings className="w-5 h-5" />
            </Button>
          </div>

          {/* Category Selector */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className="shrink-0"
                data-testid={`category-${cat.toLowerCase()}`}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <ScrollArea className="flex-1">
        <div className="max-w-4xl mx-auto px-6 py-6">
          {messages.length === 0 ? (
            <div className="text-center py-20" data-testid="empty-state">
              <div className="w-20 h-20 rounded-2xl bg-[#FF6B35]/20 flex items-center justify-center mx-auto mb-6">
                <Zap className="w-10 h-10 text-[#FF6B35]" />
              </div>
              <h2 className="font-poppins text-2xl font-semibold text-white mb-3">
                What can I help you with?
              </h2>
              <p className="text-white/60 max-w-md mx-auto mb-8">
                Ask about EV charging sessions, workshop operations, customer insights, training progress, or any business metrics.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  'How many EV sessions yesterday in Delhi?',
                  'Show pending job cards',
                  'Customer churn risk report',
                  'Training completion stats',
                ].map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="secondary"
                    size="sm"
                    onClick={() => setInput(suggestion)}
                    data-testid={`suggestion-btn`}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} isUser={message.role === 'user'} />
              ))}
              
              {loading && pipelineSteps.length > 0 && (
                <PipelineStatus steps={pipelineSteps} currentStep={currentStep} />
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="sticky bottom-0 backdrop-blur-xl bg-[#0a0a0a]/80 border-t border-white/5 p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Type your question..."
                className="w-full min-h-[56px] max-h-40 resize-none rounded-2xl border border-white/10 bg-white/5 px-5 py-4 pr-14 text-white placeholder:text-white/40 focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] transition-all outline-none"
                disabled={loading}
                data-testid="chat-input"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={`absolute right-2 bottom-2 ${isRecording ? 'text-red-500' : 'text-white/60'}`}
                onClick={handleVoiceInput}
                disabled={loading}
                data-testid="voice-btn"
              >
                {isRecording ? <MicOff className="w-5 h-5 animate-pulse" /> : <Mic className="w-5 h-5" />}
              </Button>
            </div>
            <Button 
              type="submit" 
              size="lg"
              disabled={!input.trim() || loading}
              className="h-14 px-6"
              data-testid="send-btn"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
