import { memo } from 'react';

const QUICK_PROMPTS = [
  {
    id: 'service',
    icon: '🔧',
    title: 'Service Schedule',
    prompt: 'When is my next service due?',
    color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800',
    iconBg: 'bg-purple-100 dark:bg-purple-800',
  },
  {
    id: 'oil',
    icon: '🛢️',
    title: 'Engine Oil',
    prompt: 'Recommend engine oil for my car',
    color: 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800',
    iconBg: 'bg-amber-100 dark:bg-amber-800',
  },
  {
    id: 'battery',
    icon: '🔋',
    title: 'Battery Check',
    prompt: 'How to check battery health?',
    color: 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800',
    iconBg: 'bg-green-100 dark:bg-green-800',
  },
  {
    id: 'ev',
    icon: '⚡',
    title: 'EV Charging',
    prompt: 'Find nearby charging stations',
    color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800',
    iconBg: 'bg-blue-100 dark:bg-blue-800',
  },
];

/**
 * QuickPrompts - Welcome screen with prompt cards
 * @param {Object} props
 * @param {Function} props.onSelectPrompt - Callback when a prompt is selected
 */
export const QuickPrompts = memo(({ onSelectPrompt }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-8 animate-fade-in" data-testid="quick-prompts">
      {/* Logo & Welcome */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--brand-primary)' }}>
          <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Kailash AI
        </h1>
        <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
          Your automotive AI assistant. Ask me anything about your vehicle.
        </p>
      </div>

      {/* Quick Prompt Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt.id}
            onClick={() => onSelectPrompt(prompt.prompt)}
            className={`flex items-center gap-3 p-4 rounded-2xl border transition-all duration-200 hover:scale-[1.02] hover:shadow-md text-left ${prompt.color}`}
            data-testid={`quick-prompt-${prompt.id}`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${prompt.iconBg}`}>
              {prompt.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                {prompt.title}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                {prompt.prompt}
              </p>
            </div>
            <svg className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--text-tertiary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>

      {/* Helpful Tips */}
      <div className="mt-8 text-center max-w-md">
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          You can also upload images for damage analysis, use voice input, or ask about service history.
        </p>
      </div>
    </div>
  );
});

QuickPrompts.displayName = 'QuickPrompts';

export default QuickPrompts;
