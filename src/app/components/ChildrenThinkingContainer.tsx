import React, { useState, useEffect } from 'react';
import { ChildrenThinkingAssessment } from './ChildrenThinkingAssessment';
import { ChildrenThinkingResults } from './ChildrenThinkingResults';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { createShareLink } from '../utils/cognitiveProfileApi';
import { saveAssessment } from '../utils/storage';

interface ChildrenThinkingContainerProps {
  userId: string;
  userName: string;
  onComplete: () => void;
  onCancel: () => void;
}

interface AssessmentResults {
  creative: number;
  analytical: number;
  practical: number;
  reflective: number;
  answers: Record<number, number>;
}

export function ChildrenThinkingContainer({ userId, userName, onComplete: onCompleteProp, onCancel }: ChildrenThinkingContainerProps) {
  const [results, setResults] = useState<AssessmentResults | null>(null);
  const [saving, setSaving] = useState(false);

  const handleComplete = async (assessmentResults: AssessmentResults) => {
    setSaving(true);
    
    try {
      // Save to backend
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/make-server-fc8eb847/save-thinking-styles-assessment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            userId,
            assessmentType: 'Children',
            results: {
              creative: assessmentResults.creative,
              analytical: assessmentResults.analytical,
              practical: assessmentResults.practical,
              reflective: assessmentResults.reflective,
              primaryStyle: getPrimaryStyle(assessmentResults),
              secondaryStyle: getSecondaryStyle(assessmentResults),
              completedAt: new Date().toISOString()
            },
            answers: assessmentResults.answers
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save assessment');
      }

      console.log('Children Thinking Styles Assessment saved successfully');
      
      // Save locally so teacher portal can see it
      saveAssessment({
        id: `local-children-thinking-${Date.now()}`,
        userId,
        type: 'children-thinking',
        responses: Object.values(assessmentResults.answers),
        score: {
          creative: assessmentResults.creative,
          analytical: assessmentResults.analytical,
          practical: assessmentResults.practical,
          reflective: assessmentResults.reflective,
        },
        completedAt: new Date().toISOString()
      } as any);

      setResults(assessmentResults);
    } catch (error) {
      console.error('Error saving Children assessment:', error);
      // Still show results even if save fails
      setResults(assessmentResults);
    } finally {
      setSaving(false);
    }
  };

  const getPrimaryStyle = (results: AssessmentResults): string => {
    const styles = [
      { name: 'Creative', score: results.creative },
      { name: 'Analytical', score: results.analytical },
      { name: 'Practical', score: results.practical },
      { name: 'Reflective', score: results.reflective }
    ];
    return styles.sort((a, b) => b.score - a.score)[0].name;
  };

  const getSecondaryStyle = (results: AssessmentResults): string => {
    const styles = [
      { name: 'Creative', score: results.creative },
      { name: 'Analytical', score: results.analytical },
      { name: 'Practical', score: results.practical },
      { name: 'Reflective', score: results.reflective }
    ];
    return styles.sort((a, b) => b.score - a.score)[1].name;
  };

  const handleShareResults = async () => {
    try {
      const { shareToken } = await createShareLink();
      const shareUrl = `${window.location.origin}/shared/${shareToken}`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'My Cognitive Profile',
          text: `Check out my JotMinds cognitive profile! I'm a ${getPrimaryStyle(results!)} thinker.`,
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

  if (results) {
    return (
      <ChildrenThinkingResults
        results={results}
        userName={userName}
        onBackToDashboard={onCompleteProp}
        onShareResults={handleShareResults}
      />
    );
  }

  return (
    <ChildrenThinkingAssessment
      onComplete={handleComplete}
      onBack={onCancel}
    />
  );
}