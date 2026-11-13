import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { AlternativeOption } from '../types/index.js';
import { ScoreBar } from '../components/common/ScoreBar.js';
import {
  Bot,
  User,
  Send,
  Sparkles,
  Shuffle,
  Compass,
  ArrowRight,
  Footprints,
  Bus as BusIcon,
  Car,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  cards?: AlternativeOption[];
  quickActions?: string[];
}

const DEFAULT_SUGGESTIONS = [
  'Bus 14B is cancelled from Kinnigoli. How do I get to Alva\'s College?',
  'What is the fastest route from Kateel to Moodbidri?',
  'Where is the nearest bus stop with seats to Vamanjoor?',
  'Is bus KA-19-F-1402 on time today?'
];

export const AIAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: "Namaskara! I am **ROUTELESS AI — Your Journey Companion** 🚌\n\nI monitor the live Dakshina Kannada rural bus network in real-time. If your bus is delayed, cancelled, or overcrowded, ask me and I'll compute verified alternative routes, shared maxicab options, or connecting transfers.\n\nHow can I help you reach college today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickActions: DEFAULT_SUGGESTIONS
    }
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await api.sendAIChat(text, messages);
      const assistantMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: res.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        cards: res.cards,
        quickActions: res.quickActions
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'assistant',
          text: 'I had trouble connecting to the transit server, but you can check the **Smart Journey Planner** or **Alternative Transport Finder** for live options.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          quickActions: ['Open Journey Planner', 'View Live Tracking']
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'msg-welcome',
        sender: 'assistant',
        text: "Namaskara! I am **ROUTELESS AI — Your Journey Companion** 🚌\n\nI monitor the live Dakshina Kannada rural bus network in real-time. How can I help you reach college today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickActions: DEFAULT_SUGGESTIONS
      }
    ]);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      <div className="max-w-4xl mx-auto w-full space-y-6 flex-1 flex flex-col">
        {/* HEADER */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-navy-900 to-brand-blue flex items-center justify-center text-white shadow-md">
              <Bot className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-navy-900">ROUTELESS AI — Your Journey Companion</h1>
                <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Online
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Ground-truth rural route assistance • Real-time timetable & disruption awareness
              </p>
            </div>
          </div>

          <button
            onClick={handleResetChat}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            title="Reset conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* CHAT MESSAGES SCROLL AREA */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-6 space-y-6 flex-1 overflow-y-auto max-h-[600px]">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-navy-900 text-amber-400 flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-xl space-y-3 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                {/* Bubble */}
                <div
                  className={`p-4 rounded-2xl leading-relaxed whitespace-pre-wrap shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-brand-blue text-white rounded-tr-none'
                      : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Embedded Alternative Journey Cards (if any) */}
                {msg.cards && msg.cards.length > 0 && (
                  <div className="space-y-3 w-full animate-fadeIn pt-1">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Suggested Alternative Itineraries:
                    </div>

                    {msg.cards.map(card => (
                      <div
                        key={card.id}
                        className="bg-white rounded-xl border border-slate-200 shadow-sm p-3.5 space-y-2 hover:border-brand-blue transition text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <strong className="text-navy-900 font-extrabold">{card.title}</strong>
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {card.score}% Match
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600">{card.description}</p>
                        <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                          <span>Dep: <strong>{card.departureTime}</strong> → Arr: <strong>{card.arrivalTime}</strong></span>
                          <span className="font-bold text-emerald-600">₹{card.fareRupees}</span>
                        </div>
                        <Link
                          to={`/alternatives?origin=${encodeURIComponent(card.origin)}&destination=${encodeURIComponent(card.destination)}`}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-blue hover:underline pt-1"
                        >
                          <span>View step-by-step navigation →</span>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quick action buttons attached to message */}
                {msg.quickActions && msg.quickActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.quickActions.map(action => (
                      <button
                        key={action}
                        onClick={() => handleSend(action)}
                        className="px-2.5 py-1 bg-blue-50/80 hover:bg-blue-100 text-brand-blue text-[11px] font-semibold rounded-lg border border-blue-200 transition"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                )}

                <span className="text-[10px] text-slate-400 block px-1">{msg.timestamp}</span>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 text-xs items-center text-slate-500 animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-navy-900 text-amber-400 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-100 p-3 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-150"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-300"></span>
                <span className="ml-1 text-[11px]">Evaluating rural route connections...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT BOX */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask anything: 'Bus 14B cancelled from Kinnigoli', 'Fastest way to Alva's', 'Where is my bus?'..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isTyping}
            className="w-full bg-white border border-slate-300 rounded-2xl pl-4 pr-12 py-3 text-xs font-medium text-navy-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 p-2 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-xl shadow-sm disabled:opacity-50 transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
