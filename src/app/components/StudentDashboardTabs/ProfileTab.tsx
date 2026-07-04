import React, { useRef, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { TabsContent } from '../ui/tabs';
import { FileText, MessageSquare, Settings, Flame, Camera, Loader2 } from 'lucide-react';
import { CardV2, CardV2Grid } from '../ui/card-v2';
import { formatMonthYear } from '../../utils/dateFormat';
import { Assessment } from '../../types';
import { updateUserProfile } from '../../utils/api';
import { toast } from 'sonner';

// Resize an image file to a small square data URL so it stays light enough to
// store on the profile (and load fast on a parent's dashboard).
function fileToResizedDataUrl(file: File, size = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas not supported')); return; }
        // Center-crop to a square, then draw scaled down
        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2;
        const sy = (img.height - min) / 2;
        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Adjusting interfaces to use locally if needed
interface ProfileTabProps {
  user: any; // Using any for now or imported User type if available
  reflections: any[];
  assessments: Assessment[];
  brainGymProgress: any;
  setActiveTab: (tab: string) => void;
  calculateAge: (dob: string | Date) => number;
  onAvatarChange?: (avatarUrl: string) => void;
}

export function ProfileTab({
  user,
  reflections,
  assessments,
  brainGymProgress,
  setActiveTab,
  calculateAge,
  onAvatarChange
}: ProfileTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>(user.avatarUrl || '');
  const [isUploading, setIsUploading] = useState(false);

  const handlePhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file.');
      return;
    }
    setIsUploading(true);
    try {
      const dataUrl = await fileToResizedDataUrl(file);
      await updateUserProfile({ avatarUrl: dataUrl } as any);
      setAvatarUrl(dataUrl);
      onAvatarChange?.(dataUrl);
      toast.success('Profile photo updated! Your parent can now see it.');
    } catch (err: any) {
      console.error('[ProfileTab] Avatar upload failed:', err);
      toast.error('Could not update your photo. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <TabsContent value="profile" className="space-y-6">
      {/* User Profile Header */}
      <Card className="border-2 border-gradient-primary bg-gradient-to-br from-[#6B4C9A]/10 via-[#7B61FF]/10 to-[#5B7DB1]/10">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full gradient-aqua-violet flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={`${user.name}'s photo`} className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                aria-label="Change profile photo"
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white text-[#6B4C9A] shadow-md border border-[#6B4C9A]/20 flex items-center justify-center hover:bg-[#6B4C9A] hover:text-white transition-colors disabled:opacity-60"
              >
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoSelected}
              />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl">{user.name}</CardTitle>
              <div className="space-y-1 mt-2">
                <p className="text-sm text-muted-foreground">{user.email}</p>
                {user.school && <p className="text-sm text-muted-foreground font-semibold">{user.school}</p>}
                {user.educationLevel && <Badge variant="secondary" className="mt-2">{user.educationLevel}</Badge>}
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Camera className="h-3 w-3" /> Tap the camera to set a photo your parent will see.
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Profile Sections - Secondary Navigation using Card v2 */}
      <CardV2Grid columns={2}>
        <CardV2
          icon={FileText}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
          title="My Reflections"
          subtitle="View and manage your assessment reflections"
          stats={[
            { label: 'Saved', value: reflections.length }
          ]}
          cta={
            <Button 
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => setActiveTab('reflections')}
            >
              View All →
            </Button>
          }
          onClick={() => setActiveTab('reflections')}
          variant="gradient"
        />

        <CardV2
          icon={MessageSquare}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
          title="Give Feedback"
          subtitle="Share your experience with JotMinds"
          cta={
            <Button 
              size="sm"
              variant="outline"
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                window.open('https://forms.gle/SXPFj29PxUbmYVQq7', '_blank');
              }}
            >
              Open Form →
            </Button>
          }
          onClick={() => setActiveTab('feedback')}
          variant="gradient"
        />
      </CardV2Grid>

      {/* Account Settings */}
      <Card className="border-2 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-4">
            {user.dateOfBirth && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-muted-foreground">Age</p>
                <p className="font-semibold">{calculateAge(user.dateOfBirth)} years</p>
              </div>
            )}
            {user.createdAt && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="font-semibold">
                  {formatMonthYear(user.createdAt)}
                </p>
              </div>
            )}
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-muted-foreground">Assessments Completed</p>
              <p className="font-semibold">{assessments.length} total</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-muted-foreground">Brain Gym Streak</p>
              <p className="font-semibold flex items-center gap-1">
                <Flame className="h-4 w-4 text-orange-500" />
                {brainGymProgress.currentStreak} days
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
