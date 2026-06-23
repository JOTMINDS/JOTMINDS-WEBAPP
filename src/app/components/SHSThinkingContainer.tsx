import React, { useState } from 'react';
import { SHSThinkingAssessment } from './SHSThinkingAssessment';
import { SHSThinkingResults } from './SHSThinkingResults';
import { SHSResults } from '../utils/shsScoring';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { getAuthToken } from '../utils/api';
import { createShareLink } from '../utils/cognitiveProfileApi';

interface SHSThinkingContainerProps {
  userId: string;
  userName: string;
  onComplete: () => void;
  onCancel: () => void;
}

export function SHSThinkingContainer({ 
  userId, 
  userName,
  onComplete,
  onCancel 
}: SHSThinkingContainerProps) {
  const [results, setResults] = useState<SHSResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAssessmentComplete = async (assessmentResults: SHSResults) => {
    setLoading(true);
    setError(null);

    try {
      // Get the auth token
      const token = getAuthToken();
      
      console.log('[SHSThinkingContainer] Saving results with token:', token ? `${token.substring(0, 30)}...` : 'NO TOKEN');
      
      // Save results to backend
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/make-server-fc8eb847/shs-thinking/submit`,
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
        console.error('[SHSThinkingContainer] Error response:', errorData);
        throw new Error(errorData.error || 'Failed to save assessment results');
      }

      console.log('[SHSThinkingContainer] ✓ Results saved successfully');
      
      // Show results
      setResults(assessmentResults);
    } catch (err) {
      console.error('[SHSThinkingContainer] Error saving SHS assessment:', err);
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
          title: 'My SHS Cognitive Profile',
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Saving your results...</p>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Saving Results</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleReturnToDashboard}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (results) {
    return (
      <SHSThinkingResults
        results={results}
        userName={userName}
        onReturnToDashboard={handleReturnToDashboard}
        onShareWithParent={handleShareWithParent}
      />
    );
  }

  return (
    <SHSThinkingAssessment
      userId={userId}
      onComplete={handleAssessmentComplete}
      onCancel={onCancel}
    />
  );
}
