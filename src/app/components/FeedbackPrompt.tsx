import { useState } from 'react';
import { MessageSquare, Star, Send, CheckCircle2, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { toast } from 'sonner';

interface FeedbackPromptProps {
  className?: string;
  variant?: 'default' | 'full';
}

export const FeedbackPrompt = ({ className = '', variant = 'default' }: FeedbackPromptProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedbackCategory, setFeedbackCategory] = useState('User Experience');
  const [feedbackText, setFeedbackText] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) {
      toast.error('Please enter your feedback thoughts.');
      return;
    }

    // Save locally
    const existing = JSON.parse(localStorage.getItem('ts_user_feedback') || '[]');
    const newFeedback = {
      id: Date.now().toString(),
      rating,
      category: feedbackCategory,
      text: feedbackText,
      email: userEmail,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('ts_user_feedback', JSON.stringify([newFeedback, ...existing]));

    setSubmitted(true);
    toast.success('Thank you for your feedback! Your response has been recorded.');
    setTimeout(() => {
      setIsOpen(false);
      setSubmitted(false);
      setFeedbackText('');
    }, 1800);
  };

  return (
    <>
      <Card className={`border-[#6B4C9A]/30 bg-gradient-to-br from-purple-50/70 to-indigo-50/70 dark:border-[#6B4C9A]/20 dark:from-purple-950/30 dark:to-indigo-950/30 ${className}`}>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
            <div className="flex items-start sm:items-center gap-3 flex-1">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#6B4C9A] to-[#7B61FF] flex items-center justify-center flex-shrink-0 shadow-sm">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide text-sm mb-1">
                  Help Us Improve JotMinds — Share Your Feedback
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your input directly shapes the future of JotMinds learning & analytics tools.
                </p>
              </div>
            </div>
            <Button
              onClick={() => setIsOpen(true)}
              className="bg-gradient-to-r from-[#6B4C9A] to-[#7B61FF] hover:from-[#5B3C8A] hover:to-[#6B51EF] text-white w-full sm:w-auto whitespace-nowrap h-12 px-6 text-base font-bold rounded-xl shadow-md transition-all"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Share Feedback
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Native Feedback Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border-2 border-purple-200 dark:border-purple-800 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Share Your Feedback</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {submitted ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">Feedback Received!</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Thank you for helping us improve JotMinds.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Rating */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Overall Experience</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="text-2xl transition-transform transform hover:scale-110"
                      >
                        <Star className={`w-8 h-8 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Feedback Category</label>
                  <select 
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium bg-slate-50 dark:bg-slate-800 dark:text-white"
                    value={feedbackCategory}
                    onChange={(e) => setFeedbackCategory(e.target.value)}
                  >
                    <option value="User Experience">User Experience & Interface</option>
                    <option value="Assessment Clarity">Assessment Questions & Results</option>
                    <option value="Feature Request">New Feature Request</option>
                    <option value="Bug Report">Issue / Bug Report</option>
                  </select>
                </div>

                {/* Feedback Text */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Your Comments & Suggestions</label>
                  <textarea 
                    rows={4}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white"
                    placeholder="Tell us what you liked or what we can do better..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                  />
                </div>

                {/* Optional Email */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Your Email (Optional, for follow-up)</label>
                  <Input 
                    type="email"
                    placeholder="yourname@example.com"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="rounded-xl"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="rounded-xl">
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl">
                    <Send className="w-4 h-4 mr-2" />
                    Submit Feedback
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};