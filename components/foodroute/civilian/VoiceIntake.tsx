'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface NeedsResult {
  urgency: 'critical' | 'high' | 'moderate';
  reasoning: string;
  needs: {
    languages: string[];
    dietaryNeeds: string[];
    culturalPreference?: string;
    freeText?: string;
  } | null;
}

interface VoiceNeedsProps {
  onNeedsComplete: (needs: NeedsResult) => void;
}

export default function VoiceIntake({ onNeedsComplete }: VoiceNeedsProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [started, setStarted] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Send message to conversation API
  const sendMessage = useCallback(async (userText: string, currentMessages: Message[]) => {
    const newMessages: Message[] = [...currentMessages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setIsThinking(true);
    setError(null);

    try {
      const res = await fetch('/api/foodroute/converse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) {
        throw new Error('Conversation request failed');
      }

      const data = await res.json();
      const assistantMsg: Message = { role: 'assistant', content: data.reply };
      const updatedMessages = [...newMessages, assistantMsg];
      setMessages(updatedMessages);
      setIsThinking(false);

      if (data.needs) {
        setTimeout(() => {
          onNeedsComplete(data.needs);
        }, 500);
      }

      return updatedMessages;
    } catch (err) {
      setIsThinking(false);
      setError('Failed to get response. Please try again.');
      console.error(err);
      return newMessages;
    }
  }, [onNeedsComplete]);

  // Start the conversation
  const startConversation = useCallback(() => {
    setStarted(true);
    setError(null);
    const greeting: Message = { role: 'assistant', content: "FoodRoute here. What's going on?" };
    setMessages([greeting]);
  }, []);

  // Send typed message
  const handleSendText = useCallback(() => {
    if (!textInput.trim()) return;
    const text = textInput.trim();
    setTextInput('');
    setMessages(prev => {
      sendMessage(text, prev);
      return prev;
    });
  }, [textInput, sendMessage]);

  // Initial screen
  if (!started) {
    return (
      <div className="flex flex-col items-center text-center space-y-5 py-4">
        <div className="w-20 h-20 rounded-full bg-sky-100 flex items-center justify-center shadow-md">
          <svg className="w-10 h-10 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-800">We&apos;re here to listen</h3>
          <p className="text-xs text-slate-500 mt-1.5 max-w-[240px] mx-auto leading-relaxed">
            Tell our AI assistant about your situation. We&apos;ll ask a few questions to understand your needs and find the right food bank for you.
          </p>
        </div>

        <button
          onClick={startConversation}
          className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl text-sm font-bold uppercase tracking-wide transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Start Conversation
        </button>
      </div>
    );
  }

  // Conversation UI
  return (
    <div className="flex flex-col h-full -mx-1">
      {/* Chat messages */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1 max-h-[45vh]">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-sky-500 text-white rounded-br-sm'
                  : 'bg-slate-100 text-slate-800 rounded-bl-sm'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="mb-2 p-2.5 bg-red-50 border border-red-200 rounded-xl text-[11px] text-red-700">
          {error}
        </div>
      )}

      {/* Text input */}
      <div className="border-t border-slate-100 pt-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSendText(); }}
            placeholder="Type your message..."
            disabled={isThinking}
            autoFocus
            className="flex-1 px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 disabled:bg-slate-50"
          />
          <button
            onClick={handleSendText}
            disabled={!textInput.trim() || isThinking}
            className="px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl disabled:bg-slate-200 disabled:text-slate-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
