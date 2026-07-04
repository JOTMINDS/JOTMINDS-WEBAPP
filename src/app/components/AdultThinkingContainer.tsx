import React, { useState } from 'react';
import { AdultThinkingAssessment } from './AdultThinkingAssessment';
import { AdultThinkingResults } from './AdultThinkingResults';
import { AdultResults } from '../utils/adultScoring';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { getAuthToken } from '../utils/api';
import { createShareLink } from '../utils/cognitiveProfileApi';
import { saveAssessment } from '../utils/storage';

interface AdultThinkingContainerProps {
  userId: string;
  userName: string;
  onComplete: () => void;
  onCancel: () => void;
}

export function AdultThinkingContainer({ 
  userId, 
  userName,
  onComplete,
  onCancel 
}: AdultThinkingContainerProps) {
  const [results, setResults] = useState<AdultResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAssessmentComplete = async (assessmentResults: AdultResults) => {
    setLoading(true);
    setError(null);

    try {
      // Get the auth token
      const token = getAuthToken();
      
      console.log('[AdultThinkingContainer] Saving results with token:', token ? `${token.substring(0, 30)}...` : 'NO TOKEN');
      
      // Save results to backend
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/make-server-fc8eb847/adult-thinking/submit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token || publicAnonKey}`
          },
          body: JSON.stringify({
            results: assessmentResults
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[AdultThinkingContainer] Error response:', errorData);
        throw new Error(errorData.error || 'Failed to save assessment results');
      }

      console.log('[AdultThinkingContainer] ✓ Results saved successfully');
      
      // Save locally so teacher portal can see it
      saveAssessment({
        id: `local-adult-thinking-${Date.now()}`,
        userId,
        type: 'adult-thinking',
        responses: [],
        score: {
          analytical: assessmentResults.analytical,
          creative: assessmentResults.creative,
          practical: assessmentResults.practical,
        },
        completedAt: new Date().toISOString()
      } as any);
      
      // Show results
      setResults(assessmentResults);
    } catch (err) {
      console.error('[AdultThinkingContainer] Error saving Adult assessment:', err);
      setError(err instanceof Error ? err.message : 'Failed to save assessment');
      // Still show results even if save failed
      setResults(assessmentResults);
    } finally {
      setLoading(false);
    }
  };

  const handleShareResults = async () => {
    try {
      const { shareToken } = await createShareLink();
      const shareUrl = `${window.location.origin}/shared/${shareToken}`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'My Professional Cognitive Profile',
          text: `Check out my JotMinds cognitive profile! I'm a ${results.professionalProfile}.`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert('Share link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing profile:', error);
      alert('Failed to generate share link. Please try again.');
    }
  };

  const handleReturnToDashboard = () => {
    onComplete();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-slate-700 mx-auto mb-4"></div>
          <p className="text-slate-700">Analyzing your professional profile...</p>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Error Saving Results</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={handleReturnToDashboard}
            className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (results) {
    return (
      <AdultThinkingResults
        results={results}
        userName={userName}
        onReturnToDashboard={handleReturnToDashboard}
        onShareResults={handleShareResults}
      />
    );
  }

  return (
    <AdultThinkingAssessment
      userId={userId}
      onComplete={handleAssessmentComplete}
      onCancel={onCancel}
    />
  );
}
