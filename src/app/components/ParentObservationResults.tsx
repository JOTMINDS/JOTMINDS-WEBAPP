import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ParentObservationAssessment, User } from '../types';
import { ArrowLeft, Eye, Brain, Target, Heart, Download, Share2 } from 'lucide-react';
import { generateParentObservationPDF } from '../utils/parentObservationPdfGenerator';
import { toast } from 'sonner';
import { useState } from 'react';
import { useAuth } from './AuthContext';

interface ParentObservationResultsProps {
  assessment: ParentObservationAssessment;
  child: User;
  onBack: () => void;
}

const sectionIcons = {
  A: Eye,
  B: Brain,
  C: Target,
  D: Heart
};

const sectionColors = {
  A: "from-blue-500 to-cyan-500",
  B: "from-purple-500 to-pink-500",
  C: "from-green-500 to-emerald-500",
  D: "from-orange-500 to-red-500"
};

const sectionNames = {
  A: "Learning Habits",
  B: "Thinking Patterns",
  C: "Decision-Making Behavior",
  D: "Motivation & Self-Management"
};

export function ParentObservationResults({ 
  assessment, 
  child, 
  onBack 
}: ParentObservationResultsProps) {
  const { score } = assessment;
  const { user } = useAuth();

  const sections = [
    { key: 'A' as const, data: score.sectionA },
    { key: 'B' as const, data: score.sectionB },
    { key: 'C' as const, data: score.sectionC },
    { key: 'D' as const, data: score.sectionD }
  ];

  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const parentName = user?.user_metadata?.name || 'Parent';
      const childName = child.name || 'Child';
      await generateParentObservationPDF(assessment, parentName, childName);
      toast.success('Report exported successfully!');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to export report.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareResults = async () => {
    const shareText = `I've completed a parent observation assessment for ${child.name} on JotMinds. Overall Summary: ${assessment.score.overallSummary.substring(0, 150)}...`;
    
    // Check if Web Share API is available and supported
    if (navigator.share && navigator.canShare) {
      const shareData = {
        title: `${child.name}'s Parent Observation Assessment`,
        text: shareText
      };
      
      // Check if the data can be shared
      if (navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData);
          toast.success('Shared successfully!');
          return;
        } catch (error: any) {
          // User cancelled or permission denied
          if (error.name === 'AbortError') {
            // User cancelled, do nothing
            return;
          }
          // For other errors, fall back to clipboard
          console.log('Share API error, using fallback:', error.name);
        }
      }
    }
    
    // Fallback for browsers that don't support Web Share API or if sharing failed
    fallbackShare(shareText);
  };

  const fallbackShare = (shareText?: string) => {
    // Copy summary to clipboard
    const textToShare = shareText || `Check out ${child.name}'s Parent Observation Assessment on JotMinds - Discover How You Think`;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToShare).then(() => {
        toast.success('Assessment summary copied to clipboard!');
      }).catch((err) => {
        console.error('Clipboard error:', err);
        // Final fallback - show the text in a dialog
        showShareDialog(textToShare);
      });
    } else {
      // Legacy clipboard fallback
      showShareDialog(textToShare);
    }
  };

  const showShareDialog = (text: string) => {
    // Create a temporary textarea to copy text
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
      document.execCommand('copy');
      toast.success('Assessment summary ready to share!');
    } catch (err) {
      toast.info('Share text: ' + text);
    } finally {
      document.body.removeChild(textarea);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-violet-50 to-indigo-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Button variant="ghost" onClick={onBack} className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#6B4C9A] via-[#7B61FF] to-[#5B7DB1] bg-clip-text text-transparent">
            Parent Observation Assessment Results
          </h1>
          <p className="text-muted-foreground">
            Your observations about {child.name}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Overall Summary Card */}
        <Card className="border-2 border-[#6B4C9A] bg-gradient-to-br from-white to-cyan-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#6B4C9A] to-[#5B7DB1] flex items-center justify-center">
                <Eye className="h-5 w-5 text-white" />
              </div>
              Overall Cognitive Profile
            </CardTitle>
            <CardDescription>Based on your observations of {child.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-white rounded-lg p-6 border-2 border-blue-100">
              <p className="text-lg leading-relaxed">{score.overallSummary}</p>
            </div>
          </CardContent>
        </Card>

        {/* Section Details */}
        <div className="grid gap-6 md:grid-cols-2">
          {sections.map(({ key, data }) => {
            const Icon = sectionIcons[key];
            const color = sectionColors[key];
            const name = sectionNames[key];

            return (
              <Card key={key} className="border-2">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle>{name}</CardTitle>
                      <CardDescription>
                        Score: {data.total} / 30
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Style Badge */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Primary Style:</p>
                    <Badge className={`bg-gradient-to-r ${color} text-white px-4 py-2`}>
                      {data.style}
                    </Badge>
                  </div>

                  {/* Interpretation */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Interpretation:</p>
                    <p className="text-sm font-medium">{data.interpretation}</p>
                  </div>

                  {/* Insights */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Key Insights:</p>
                    <p className="text-sm">{data.insights}</p>
                  </div>

                  {/* Tags */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Characteristics:</p>
                    <div className="flex flex-wrap gap-2">
                      {data.tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Summary Table */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Reference Summary</CardTitle>
            <CardDescription>
              A consolidated view of {child.name}'s cognitive profile from your perspective
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 bg-gray-50">Dimension</th>
                    <th className="text-left p-3 bg-gray-50">Primary Style</th>
                    <th className="text-left p-3 bg-gray-50">Score</th>
                    <th className="text-left p-3 bg-gray-50">Interpretation</th>
                  </tr>
                </thead>
                <tbody>
                  {sections.map(({ key, data }) => (
                    <tr key={key} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {(() => {
                            const Icon = sectionIcons[key];
                            return <Icon className="h-4 w-4" />;
                          })()}
                          <span className="font-medium">{sectionNames[key]}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline">{data.style}</Badge>
                      </td>
                      <td className="p-3">
                        <Badge>{data.total}/30</Badge>
                      </td>
                      <td className="p-3 text-sm">{data.interpretation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
            <CardDescription>
              Learn how your observations compare with {child.name}'s self-assessment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">
              If {child.name} has completed their self-assessment and granted permission, 
              you can view a combined report that shows both perspectives side-by-side.
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={handleExportPDF}
                disabled={isExporting}
              >
                <Download className="mr-2 h-4 w-4" />
                {isExporting ? 'Exporting...' : 'Export Report'}
              </Button>
              <Button 
                variant="outline"
                onClick={handleShareResults}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share Results
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}