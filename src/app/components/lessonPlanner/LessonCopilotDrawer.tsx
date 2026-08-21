import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Sparkles, Send, X, Bot, User, Loader, HelpCircle } from 'lucide-react';
import { CopilotChatMessage } from '../../types/lessonPlannerTypes';
import { getCopilotChatHistory, saveCopilotChatHistory } from '../../utils/lessonPlannerStorage';
import { chatWithLessonCopilot } from '../../utils/aiService';
import { toast } from 'sonner';

interface LessonCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  context?: any;
}

export const LessonCopilotDrawer: React.FC<LessonCopilotDrawerProps> = ({
  isOpen,
  onClose,
  context
}) => {
  const [messages, setMessages] = useState<CopilotChatMessage[]>(getCopilotChatHistory());
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: CopilotChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setIsThinking(true);

    const replyText = await chatWithLessonCopilot(userMsg.text, updated.map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text })), context);

    setIsThinking(false);

    const botMsg: CopilotChatMessage = {
      id: `msg-b-${Date.now()}`,
      sender: 'copilot',
      text: replyText || generateFallbackCopilotResponse(userMsg.text),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const finalMsgs = [...updated, botMsg];
    setMessages(finalMsgs);
    saveCopilotChatHistory(finalMsgs);
  };

  const generateFallbackCopilotResponse = (promptText: string): string => {
    const lower = promptText.toLowerCase();
    if (lower.includes('photosynthesis')) {
      return `Here is a 60-minute lesson outline for Photosynthesis (SHS 1):\n1. Intro (10 min): Leaf structure & light energy absorption.\n2. Main Lesson (25 min): Light-dependent & light-independent reactions.\n3. Guided Activity (15 min): Differentiated group task on chloroplast diagrams.\n4. Quiz & Wrap-up (10 min): Exit ticket with 3 check questions.`;
    }
    if (lower.includes('quiz') || lower.includes('assessment')) {
      return `Here is a 3-question Quick Quiz:\nQ1. What is the primary function of chlorophyll in photosynthesis?\nQ2. Differentiate between light-dependent and light-independent reactions.\nQ3. State 2 environmental factors that affect the rate of photosynthesis.`;
    }
    return `Certainly! Here is an instant pedagogical suggestion: For your lesson topic, introduce a 5-minute visual hook, pair students into peer discussion dyads for guided practice, and use a 2-question exit ticket to evaluate mastery.`;
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between">
      {/* Drawer Top Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
              Jotti <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30 text-[10px]">Module 10</Badge>
            </h3>
            <p className="text-[11px] text-slate-300">24/7 Intelligent Teaching Assistant</p>
          </div>
        </div>
        <Button size="sm" variant="ghost" onClick={onClose} className="text-slate-300 hover:text-white">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 space-y-1.5">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Quick Prompts:</span>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setInput('Create a 60-minute lesson on Photosynthesis for SHS 1.')}
            className="text-[11px] bg-white dark:bg-slate-900 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-400 transition-colors"
          >
            Photosynthesis Lesson
          </button>
          <button
            onClick={() => setInput('Generate a 3-question quiz on linear equations.')}
            className="text-[11px] bg-white dark:bg-slate-900 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-400 transition-colors"
          >
            Generate Quiz
          </button>
          <button
            onClick={() => setInput('Suggest a group activity for visual learners.')}
            className="text-[11px] bg-white dark:bg-slate-900 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-400 transition-colors"
          >
            Visual Group Activity
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map(m => (
          <div
            key={m.id}
            className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`p-1.5 rounded-lg shrink-0 ${m.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'}`}>
              {m.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>
            <div className={`p-3 rounded-2xl text-xs max-w-[80%] leading-relaxed ${
              m.sender === 'user'
                ? 'bg-indigo-600 text-white rounded-tr-none'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700'
            }`}>
              <p className="whitespace-pre-line">{m.text}</p>
              <span className="text-[9px] opacity-60 block mt-1 text-right">{m.timestamp}</span>
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400">
            <Loader className="w-3.5 h-3.5 animate-spin" />
            <span>Jotti is generating response...</span>
          </div>
        )}
      </div>

      {/* Chat Input Bar */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Jotti for lesson ideas or quizzes..."
            className="text-xs"
          />
          <Button type="submit" disabled={!input.trim() || isThinking} className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0">
            <Send className="w-3.5 h-3.5" />
          </Button>
        </form>
      </div>
    </div>
  );
};
