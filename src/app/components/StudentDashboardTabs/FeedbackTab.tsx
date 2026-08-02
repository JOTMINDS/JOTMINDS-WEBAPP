import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { MessageSquare, Sparkles, Star, Send, CheckCircle2 } from 'lucide-react';
import { TabsContent } from '../ui/tabs';
import { toast } from 'sonner';

export function FeedbackTab() {
  const [rating, setRating] = useState<number>(5);
  const [category, setCategory] = useState<string>('overall');
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) {
      toast.error('Please enter your feedback comments before submitting.');
      return;
    }

    // Save feedback locally & trigger toast
    const feedbackObj = {
      id: `fb-${Date.now()}`,
      rating,
      category,
      comments: feedbackText,
      createdAt: new Date().toISOString()
    };

    try {
      const existing = JSON.parse(localStorage.getItem('jotminds_user_feedback') || '[]');
      existing.push(feedbackObj);
      localStorage.setItem('jotminds_user_feedback', JSON.stringify(existing));
    } catch {
      // Ignore fallback
    }

    setIsSubmitted(true);
    toast.success('Thank you! Your feedback has been submitted to JotMinds.');
  };

  return (
    <TabsContent value="feedback" className="space-y-6">
      <div className="max-w-3xl mx-auto">
        <Card className="border-2 border-[#6B4C9A] bg-gradient-to-br from-cyan-50 via-white to-purple-50 dark:from-slate-900 dark:to-slate-950 shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-[#6B4C9A] to-[#5B7DB1] flex items-center justify-center shadow-md">
                <MessageSquare className="h-7 w-7 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Share Your JotMinds Experience</CardTitle>
            <CardDescription className="text-xs sm:text-sm mt-1">
              Your feedback directly shapes the AI cognitive assessment algorithms and learning tools across Ghana & globally.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {isSubmitted ? (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-8 rounded-2xl border border-emerald-200 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-lg font-bold text-emerald-950 dark:text-emerald-300">Feedback Submitted Successfully!</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Thank you for helping us make JotMinds better for all students and teachers.
                </p>
                <Button variant="outline" onClick={() => setIsSubmitted(false)} className="text-xs">
                  Submit Additional Feedback
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Rating Selection */}
                <div className="space-y-2 text-center bg-white/80 dark:bg-slate-900 p-4 rounded-xl border border-purple-100 dark:border-slate-800">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                    How would you rate your overall experience?
                  </Label>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`p-2 rounded-xl transition-all ${
                          star <= rating
                            ? 'bg-amber-100 text-amber-500 scale-110 shadow-xs dark:bg-amber-950'
                            : 'bg-slate-100 text-slate-300 dark:bg-slate-800'
                        }`}
                      >
                        <Star className="w-6 h-6 fill-current" />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-amber-600 block pt-1">
                    {rating === 5 ? '🌟 Excellent Experience' : rating === 4 ? '👍 Very Good' : rating === 3 ? '👌 Average' : 'Needs Improvement'}
                  </span>
                </div>

                {/* Feedback Category */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Feedback Topic</Label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                  >
                    <option value="overall">Overall Platform Experience</option>
                    <option value="accuracy">Assessment & Cognitive Profile Accuracy</option>
                    <option value="lesson-planner">AI Lesson Planner & Recommendations</option>
                    <option value="feature">Feature Request or Idea</option>
                    <option value="bug">Report an Issue / Bug</option>
                  </select>
                </div>

                {/* Detailed Feedback Text */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Your Detailed Feedback</Label>
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    rows={4}
                    placeholder="Tell us what you liked, how accurate your profile was, or what features you would love to see..."
                    className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-gradient-to-r from-[#6B4C9A] to-[#5B7DB1] hover:from-purple-800 hover:to-indigo-800 text-white font-bold text-xs shadow-md"
                >
                  <Send className="w-4 h-4 mr-2" /> Submit Feedback
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
}
