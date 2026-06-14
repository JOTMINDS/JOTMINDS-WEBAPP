import { MessageSquare, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { useState } from 'react';

interface FeedbackPromptProps {
  className?: string;
  variant?: 'default' | 'full';
}

export const FeedbackPrompt = ({ className = '', variant = 'default' }: FeedbackPromptProps) => {
  const handleExternalFeedbackClick = () => {
    window.open('https://forms.gle/SXPFj29PxUbmYVQq7', '_blank');
  };

  return (
    <Card className={`border-[#6B4C9A]/30 bg-gradient-to-br from-cyan-50/50 to-blue-50/50 dark:border-[#6B4C9A]/20 dark:from-cyan-950/30 dark:to-blue-950/30 ${className}`}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-start sm:items-center gap-3 flex-1">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#6B4C9A] to-[#5B7DB1] flex items-center justify-center flex-shrink-0">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide text-sm mb-1">
                Help Us Improve JotMinds — Share Your Feedback
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your input helps us build a better experience for students, teachers, and parents
              </p>
            </div>
          </div>
          <Button
            onClick={handleExternalFeedbackClick}
            className="bg-gradient-to-r from-[#6B4C9A] to-[#5B7DB1] hover:from-[#1AB5CC] hover:to-[#252770] w-full sm:w-auto whitespace-nowrap h-12 px-6 text-base font-medium"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Share Feedback
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};