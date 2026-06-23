import React, { useState, useEffect } from 'react';
import { ChildrenThinkingAssessment } from './ChildrenThinkingAssessment';
import { ChildrenThinkingResults } from './ChildrenThinkingResults';
import { projectId, publicAnonKey } from '../utils/supabase/info';

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

  if (results) {
    return (
      <ChildrenThinkingResults
        results={results}
        userName={userName}
        onBackToDashboard={onCompleteProp}
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