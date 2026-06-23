import React, { useState, useEffect } from 'react';
import { JHSThinkingAssessment } from './JHSThinkingAssessment';
import { JHSThinkingResults } from './JHSThinkingResults';
import { JHSResults } from '../utils/jhsScoring';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { getAuthToken } from '../utils/api';
import { createShareLink } from '../utils/cognitiveProfileApi';

interface JHSThinkingContainerProps {
  userId: string;
  userName: string;
  onComplete: () => void;
  onCancel: () => void;
}

export function JHSThinkingContainer({ 
  userId, 
  userName,
  onComplete,
  onCancel 
}: JHSThinkingContainerProps) {
  const [results, setResults] = useState<JHSResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAssessmentComplete = async (assessmentResults: JHSResults) => {
    setLoading(true);
    setError(null);

    try {
      // Get the auth token
      const token = getAuthToken();
      
      console.log('[JHSThinkingContainer] Saving results with token:', token ? `${token.substring(0, 30)}...` : 'NO TOKEN');
      
      // Save results to backend
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/make-server-fc8eb847/jhs-thinking/submit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token || publicAnonKey}`
          },
          body: JSON.stringify({
            responses: [], // You can pass the actual responses if needed
            results: assessmentResults
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[JHSThinkingContainer] Error response:', errorData);
        throw new Error(errorData.error || 'Failed to save assessment results');
      }

      console.log('[JHSThinkingContainer] ✓ Results saved successfully');
      
      // Show results
      setResults(assessmentResults);
    } catch (err) {
      console.error('[JHSThinkingContainer] Error saving JHS assessment:', err);
      setError(err instanceof Error ? err.message : 'Failed to save assessment');
      // Still show results even if save failed
      setResults(assessmentResults);
    } finally {
      setLoading(false);
    }
  };

  const handleShareWithParent = async () => {
    try {
      const { shareToken } = await createShareLink();
      const shareUrl = `${window.location.origin}/shared/${shareToken}`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'My JHS Cognitive Profile',
          text: `Check out my JotMinds cognitive profile! I'm a ${results.archetype}.`,
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Saving your results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Saving Results</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleReturnToDashboard}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (results) {
    return (
      <JHSThinkingResults
        results={results}
        userName={userName}
        onReturnToDashboard={handleReturnToDashboard}
        onShareWithParent={handleShareWithParent}
      />
    );
  }

  return (
    <JHSThinkingAssessment
      userId={userId}
      onComplete={handleAssessmentComplete}
      onCancel={onCancel}
    />
  );
}