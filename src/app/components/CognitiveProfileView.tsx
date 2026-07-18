import React, { useEffect, useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { ArrowLeft, RefreshCw, Briefcase, Target, Share2, Copy, Check, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import { getCognitiveProfile, generateCognitiveProfile, CognitiveProfile, createShareLink } from '../utils/cognitiveProfileApi';
import { registerPoppins } from '../utils/pdfFonts';
import { CognitiveFingerprint } from './CognitiveFingerprint';
import { toast } from 'sonner';
import { recordProfileShare, recordProfileCompletion } from '../utils/gamification';
import { useAuth } from './AuthContext';
import { celebrateLevelUp, celebrateBadgeUnlock } from '../utils/confettiAnimations';

interface Props {
  onBack: () => void;
  onNavigateToCareers?: () => void;
}

export function CognitiveProfileView({ onBack, onNavigateToCareers }: Props) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CognitiveProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [creatingShare, setCreatingShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setError(null);
    try {
      const data = await getCognitiveProfile();
      setProfile(data);

      // Award XP for completing profile (100%)
      if (user && data.profileCompleteness === 100) {
        const reward = recordProfileCompletion(user.id);
        if (reward) {
          toast.success(reward.message, {
            description: `+${reward.xpEarned} XP earned`,
            duration: 4000,
          });
          if (reward.leveledUp) {
            celebrateLevelUp();
            toast.success(`🎉 Level Up! You're now ${reward.levelTitle}`, {
              duration: 5000,
            });
          }
          reward.newBadges.forEach(badge => {
            celebrateBadgeUnlock(badge.rarity);
            toast.success(`🏆 Badge Unlocked: ${badge.name}`, {
              description: badge.description,
              duration: 5000,
            });
          });
        }
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load cognitive profile');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      toast.info('Regenerating your cognitive profile...');
      const data = await generateCognitiveProfile();
      setProfile(data);
      toast.success('Profile updated!');
    } catch (e: any) {
      toast.error(e.message || 'Failed to regenerate profile');
    } finally {
      setRegenerating(false);
    }
  };

  const handleShare = async () => {
    setCreatingShare(true);
    try {
      const { shareToken } = await createShareLink();
      const link = `${window.location.origin}/shared/${shareToken}`;
      setShareLink(link);
      setShowShareModal(true);

      // Award XP for sharing profile (first time only)
      if (user) {
        const reward = recordProfileShare(user.id);
        if (reward) {
          toast.success(reward.message, {
            description: `+${reward.xpEarned} XP earned`,
            duration: 4000,
          });
          if (reward.leveledUp) {
            celebrateLevelUp();
            toast.success(`🎉 Level Up! You're now ${reward.levelTitle}`, {
              duration: 5000,
            });
          }
          reward.newBadges.forEach(badge => {
            celebrateBadgeUnlock(badge.rarity);
            toast.success(`🏆 Badge Unlocked: ${badge.name}`, {
              description: badge.description,
              duration: 5000,
            });
          });
        }
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to create share link');
    } finally {
      setCreatingShare(false);
    }
  };

  const handleCopyLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExportPDF = async () => {
    if (!profile) return;

    setExportingPDF(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let yPosition = margin;

      // Register Poppins font
      await registerPoppins(doc);

      // Helper function to add text with word wrap
      const addText = (text: string, x: number, y: number, maxWidth: number, fontSize = 12, isBold = false) => {
        doc.setFontSize(fontSize);
        if (isBold) {
          doc.setFont('Poppins', 'bold');
        } else {
          doc.setFont('Poppins', 'normal');
        }
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return y + (lines.length * fontSize * 0.5);
      };

      // Load logo
      const logo = await new Promise<HTMLImageElement | null>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = '/logo.png';
      });

      // Branded header band
      const bandHeight = 40;
      doc.setFillColor(91, 125, 177); // #5B7DB1 JotMinds primary
      doc.rect(0, 0, pageWidth, bandHeight, 'F');
      doc.setFillColor(255, 113, 91); // coral accent strip
      doc.rect(0, bandHeight, pageWidth, 1.5, 'F');

      let logoRight = margin;
      if (logo && logo.naturalWidth > 0) {
        const logoH = 20;
        const logoW = (logo.naturalWidth / logo.naturalHeight) * logoH;
        doc.addImage(logo, 'PNG', margin, (bandHeight - logoH) / 2, logoW, logoH);
        logoRight = margin + logoW + 6;
      }

      doc.setTextColor(255, 255, 255);
      doc.setFont('Poppins', 'bold');
      doc.setFontSize(22);
      doc.text('JotMinds', logoRight, 19);
      doc.setFont('Poppins', 'normal');
      doc.setFontSize(9);
      doc.text('Discover How You Think', logoRight, 26);

      // Report label on the right
      doc.setFont('Poppins', 'bold');
      doc.setFontSize(10);
      doc.text('COGNITIVE PROFILE', pageWidth - margin, 17, { align: 'right' });
      doc.setFont('Poppins', 'normal');
      doc.setFontSize(9);
      doc.text('Assessment Report', pageWidth - margin, 23, { align: 'right' });

      // Reset text color
      doc.setTextColor(0, 0, 0);
      yPosition = bandHeight + 12;

      // Profile Completeness
      yPosition = addText(`Profile Completeness: ${(profile as any).profileCompleteness}%`, margin, yPosition, pageWidth - 2 * margin, 14, true);
      yPosition += 10;

      // Archetype
      yPosition = addText('Cognitive Archetype', margin, yPosition, pageWidth - 2 * margin, 16, true);
      yPosition += 5;
      yPosition = addText((profile as any).archetype, margin, yPosition, pageWidth - 2 * margin, 12);
      yPosition += 5;
      yPosition = addText((profile as any).archetypeDescription, margin, yPosition, pageWidth - 2 * margin, 10);
      yPosition += 15;

      // Cognitive Dimensions
      yPosition = addText('Cognitive Dimensions', margin, yPosition, pageWidth - 2 * margin, 16, true);
      yPosition += 5;

      const dimensions = [
        { name: 'Learning Agility', value: (profile as any).learningAgility },
        { name: 'Analytical Depth', value: (profile as any).analyticalDepth },
        { name: 'Creative Capacity', value: (profile as any).creativeCapacity },
        { name: 'Practical Execution', value: (profile as any).practicalExecution },
        { name: 'Intuitive Speed', value: (profile as any).intuitiveSpeed },
        { name: 'Reflective Depth', value: (profile as any).reflectiveDepth }
      ];

      dimensions.forEach(dim => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = margin;
        }
        yPosition = addText(`${dim.name}: ${dim.value}/100`, margin + 5, yPosition, pageWidth - 2 * margin, 11);
        yPosition += 7;
      });

      yPosition += 10;

      // Strengths
      if ((profile as any).strengths && (profile as any).strengths.length > 0) {
        if (yPosition > 240) {
          doc.addPage();
          yPosition = margin;
        }
        yPosition = addText('Key Strengths', margin, yPosition, pageWidth - 2 * margin, 16, true);
        yPosition += 5;
        (profile as any).strengths.forEach(strength => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = margin;
          }
          yPosition = addText(`• ${strength}`, margin + 5, yPosition, pageWidth - 2 * margin - 10, 10);
          yPosition += 6;
        });
        yPosition += 10;
      }

      // Growth Areas
      if ((profile as any).growthAreas && (profile as any).growthAreas.length > 0) {
        if (yPosition > 240) {
          doc.addPage();
          yPosition = margin;
        }
        yPosition = addText('Growth Opportunities', margin, yPosition, pageWidth - 2 * margin, 16, true);
        yPosition += 5;
        (profile as any).growthAreas.forEach(area => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = margin;
          }
          yPosition = addText(`• ${area}`, margin + 5, yPosition, pageWidth - 2 * margin - 10, 10);
          yPosition += 6;
        });
        yPosition += 10;
      }

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Generated by JotMinds - ${new Date().toLocaleDateString()} - Page ${i} of ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      // Save the PDF
      doc.save(`JotMinds-Cognitive-Profile-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF exported successfully!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF');
    } finally {
      setExportingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-semibold text-lg">Your Cognitive Profile</h1>
            <p className="text-xs text-muted-foreground">
              Unified analysis across learning, thinking, and decision styles
            </p>
          </div>
          <div className="flex gap-2">
            {onNavigateToCareers && profile && (
              <Button
                variant="default"
                onClick={onNavigateToCareers}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <Briefcase className="mr-2 h-4 w-4" />
                Career Matches
              </Button>
            )}
            {profile && (
              <>
                <Button
                  variant="outline"
                  onClick={handleExportPDF}
                  disabled={exportingPDF || loading}
                  size="sm"
                >
                  <Download className={`mr-2 h-4 w-4 ${exportingPDF ? 'animate-pulse' : ''}`} />
                  Export PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={handleShare}
                  disabled={creatingShare || loading}
                  size="sm"
                >
                  <Share2 className={`mr-2 h-4 w-4 ${creatingShare ? 'animate-pulse' : ''}`} />
                  Share
                </Button>
              </>
            )}
            <Button
              variant="outline"
              onClick={handleRegenerate}
              disabled={regenerating || loading}
              size="sm"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${regenerating ? 'animate-spin' : ''}`} />
              {regenerating ? 'Updating...' : 'Refresh'}
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto p-4">
        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        )}

        {error && !profile && (
          <Card className="border-destructive">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <Target className="h-12 w-12 mx-auto text-destructive" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Unable to load cognitive profile</h3>
                  <p className="text-sm text-muted-foreground mb-4">{error}</p>
                  <p className="text-sm text-muted-foreground">
                    Complete at least one assessment to generate your cognitive profile.
                  </p>
                </div>
                <Button onClick={onBack}>Return to Dashboard</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {profile && <CognitiveFingerprint profile={profile} />}
      </main>

      {/* Share Modal */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Share Your Cognitive Profile
            </DialogTitle>
            <DialogDescription>
              Share your cognitive profile with others via a unique link. They'll be able to see your strengths and thinking styles.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {shareLink && (
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border">
                <p className="text-xs text-muted-foreground mb-2">Your shareable link:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm bg-white dark:bg-gray-800 p-2 rounded border break-all">
                    {shareLink}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyLink}
                    className="flex-shrink-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-800 dark:text-blue-200">
                💡 <strong>Note:</strong> Your shared profile includes your cognitive dimensions and archetype, but does not include personal information.
              </p>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowShareModal(false);
                  setCopied(false);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
