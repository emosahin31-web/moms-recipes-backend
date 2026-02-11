import React, { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Send, ChefHat, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const ChatAssistant = ({ onSendMessage, translations }) => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error(translations.messageRequired);
      return;
    }

    setLoading(true);
    try {
      const result = await onSendMessage(message);
      setResponse(result);
      setMessage('');
    } catch (error) {
      toast.error(translations.chatError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-stone-100 p-8" data-testid="chat-assistant">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-sage-100 rounded-full flex items-center justify-center">
          <ChefHat className="w-6 h-6 text-sage-600" />
        </div>
        <div>
          <h2 className="text-3xl font-heading font-semibold text-sage-900">
            {translations.aiAssistant}
          </h2>
          <p className="text-sm text-stone-500">{translations.aiAssistantDesc}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-body font-bold uppercase tracking-wider text-stone-500 mb-2">
            {translations.yourQuestion}
          </label>
          <Textarea
            data-testid="chat-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={translations.askPlaceholder}
            className="w-full min-h-[120px] bg-white border-stone-200 focus:border-sage-500 focus:ring-2 focus:ring-sage-500/20 rounded-lg p-4 transition-all resize-none"
            disabled={loading}
          />
        </div>

        <Button
          data-testid="send-chat-btn"
          onClick={handleSend}
          disabled={loading}
          className="bg-sage-500 text-white hover:bg-sage-600 px-8 py-3 rounded-full font-body font-medium transition-all shadow-sm hover:shadow-md active:scale-95 flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {translations.thinking}
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              {translations.askAI}
            </>
          )}
        </Button>

        {response && (
          <div className="mt-6 p-6 bg-sage-50/50 rounded-xl border border-sage-100" data-testid="chat-response">
            <h3 className="text-sm font-body font-bold uppercase tracking-wider text-stone-500 mb-3">
              {translations.aiResponse}
            </h3>
            <div className="text-base text-stone-700 leading-relaxed whitespace-pre-wrap">
              {response}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatAssistant;