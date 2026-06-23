import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { TabsContent } from '../ui/tabs';
import { FileText, MessageSquare, Settings, Flame } from 'lucide-react';
import { CardV2, CardV2Grid } from '../ui/card-v2';
import { formatMonthYear } from '../../utils/dateFormat';
import { Assessment } from '../../utils/teachingStyleScoring';

// Adjusting interfaces to use locally if needed
interface ProfileTabProps {
  user: any; // Using any for now or imported User type if available
  reflections: any[];
  assessments: Assessment[];
  brainGymProgress: any;
  setActiveTab: (tab: string) => void;
  calculateAge: (dob: string | Date) => number;
}

export function ProfileTab({
  user,
  reflections,
  assessments,
  brainGymProgress,
  setActiveTab,
  calculateAge
}: ProfileTabProps) {
  return (
    <TabsContent value="profile" className="space-y-6">
      {/* User Profile Header */}
      <Card className="border-2 border-gradient-primary bg-gradient-to-br from-[#6B4C9A]/10 via-[#7B61FF]/10 to-[#5B7DB1]/10">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full gradient-aqua-violet flex items-center justify-center text-white text-3xl font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl">{user.name}</CardTitle>
              <div className="space-y-1 mt-2">
                <p className="text-sm text-muted-foreground">{user.email}</p>
                {user.school && <p className="text-sm text-muted-foreground font-semibold">{user.school}</p>}
                {user.educationLevel && <Badge variant="secondary" className="mt-2">{user.educationLevel}</Badge>}
              </div>
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
