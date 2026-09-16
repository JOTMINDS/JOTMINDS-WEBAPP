import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { PowerOff, ArrowLeft } from 'lucide-react';

interface FeatureDisabledNoticeProps {
  featureName: string;
  onBack: () => void;
}

export function FeatureDisabledNotice({ featureName, onBack }: FeatureDisabledNoticeProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 flex flex-col items-center text-center gap-4">
          <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-full">
            <PowerOff className="w-6 h-6 text-slate-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{featureName} is currently unavailable</h2>
            <p className="text-sm text-slate-500 mt-1">This feature has been temporarily turned off for your account. Contact your administrator if you believe this is a mistake.</p>
          </div>
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
