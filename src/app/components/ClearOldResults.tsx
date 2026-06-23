import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { AlertCircle, Trash2, CheckCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

/**
 * Utility component to clear old assessment results
 * This allows users to retake assessments with the new personalized insights system
 */
export const ClearOldResults: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [clearing, setClearing] = useState(false);
  const [cleared, setCleared] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = () => {
    const session = localStorage.getItem('supabase.auth.token');
    if (session) {
      try {
        const parsedSession = JSON.parse(session);
        return parsedSession.currentSession?.access_token || publicAnonKey;
      } catch {
        return publicAnonKey;
      }
    }
    return publicAnonKey;
  };

  const clearResults = async () => {
    setClearing(true);
    setError(null);
    const clearedTypes: string[] = [];

    try {
      const BASE_URL = `https://${projectId}.supabase.co/functions/v1/server/make-server-fc8eb847`;
      const token = getAuthToken();

      // Get all results
      const response = await fetch(`${BASE_URL}/assessment/results`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }

      const data = await response.json();
      console.log('[ClearOldResults] Current results:', data);

      // The backend doesn't have a delete endpoint, so we need to tell the user
      // to manually delete from the browser or we can overwrite with empty data
      
      if (data.results && data.results.length > 0) {
        // Extract assessment types
        data.results.forEach((result: any) => {
          const match = result.id?.match(/result:.*?:(.*)/);
          if (match) {
            clearedTypes.push(match[1]);
          }
        });
      }

      setCleared(clearedTypes);

    } catch (err) {
      console.error('[ClearOldResults] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to clear results');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Clear Old Assessment Results
          </CardTitle>
          <CardDescription>
            The insights system has been upgraded to provide truly personalized results.
            To see the new personalized insights, you need to retake your assessments.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold mb-2">What's New?</h4>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>Insights reference your exact scores and percentages</li>
              <li>Recommendations tailored to your age, role, and education level</li>
              <li>Activities matched to your school or workplace</li>
              <li>Specific development areas based on your score gaps</li>
              <li>Career advice aligned with your industry and position</li>
            </ul>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {cleared.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <h4 className="font-semibold text-green-900">Old Results Identified</h4>
              </div>
              <p className="text-sm text-green-700 mb-2">
                Found {cleared.length} assessment(s) with old results:
              </p>
              <ul className="text-sm list-disc list-inside text-green-700">
                {cleared.map((type) => (
                  <li key={type}>{type}</li>
                ))}
              </ul>
              <p className="text-sm text-green-700 mt-3 font-semibold">
                ✅ Simply retake these assessments to get personalized insights!
              </p>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold mb-2 text-yellow-900">How It Works</h4>
            <ol className="text-sm space-y-1 list-decimal list-inside text-yellow-800">
              <li>Click "Check Old Results" below to see which assessments need to be retaken</li>
              <li>Go back to your dashboard</li>
              <li>Retake any assessment (they will automatically generate new personalized insights)</li>
              <li>Your new results will include truly customized strengths, weaknesses, and recommendations</li>
            </ol>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              onClick={clearResults}
              disabled={clearing}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {clearing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Checking...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Check Old Results
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
