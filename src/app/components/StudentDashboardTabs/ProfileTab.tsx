import React, { useRef, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { InfoTip } from '../ui/info-tip';
import { Skeleton } from '../ui/skeleton';
import { TabsContent } from '../ui/tabs';
import { FileText, MessageSquare, Settings, Flame, Camera, Loader2, Brain, Briefcase, Eye, BookOpen, Target } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { CardV2, CardV2Grid } from '../ui/card-v2';
import { formatMonthYear } from '../../utils/dateFormat';
import { Assessment } from '../../types';
import { updateUserProfile } from '../../utils/api';
import { CognitiveProfile } from '../../utils/cognitiveProfileApi';
import { toast } from 'sonner';
import {
  THINKING_TYPES, latestOfType, assessmentStyleName, CORE_DIMENSIONS, EXTRA_DIMENSIONS, scoreBand, ProfileDimension,
} from './assessmentInfo';

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
  cognitiveProfile: CognitiveProfile | null;
  profileLoading: boolean;
  onOpenFullProfile: () => void;
  onOpenCareers: () => void;
  onViewAssessment: (assessment: Assessment) => void;
}

type View = 'profile' | 'account' | 'both';
type DataView = 'chart' | 'scores';

const VIEWS: Array<{ id: View; label: string }> = [
  { id: 'profile', label: 'Profile' },
  { id: 'account', label: 'Account' },
  { id: 'both', label: 'Both' },
];

const DATA_VIEWS: Array<{ id: DataView; label: string }> = [
  { id: 'chart', label: 'Chart' },
  { id: 'scores', label: 'Scores' },
];

// Accounts made from a class or student code get a placeholder address; do not show it as the student's email.
const PLACEHOLDER_EMAIL = /@student\.jotminds\.app$|@jotminds\.local$/i;

function Segmented<T extends string>({ options, value, onChange, label }: {
  options: Array<{ id: T; label: string }>;
  value: T;
  onChange: (id: T) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-xl bg-muted p-[3px]">
      {options.map(o => (
        <button
          key={o.id}
          type="button"
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
          className={`px-4 py-1.5 text-sm font-medium rounded-[10px] transition-colors ${
            value === o.id ? 'bg-card text-[#6B4C9A] shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function ProfileTab({
  user,
  reflections,
  assessments,
  brainGymProgress,
  setActiveTab,
  calculateAge,
  onAvatarChange,
  cognitiveProfile,
  profileLoading,
  onOpenFullProfile,
  onOpenCareers,
  onViewAssessment,
}: ProfileTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>(user.avatarUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  const [view, setView] = useState<View>('profile');
  const [dataView, setDataView] = useState<DataView>('chart');

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

  const realEmail = user.email && !PLACEHOLDER_EMAIL.test(user.email) ? user.email : '';
  const schoolName = user.school || user.organizationName;
  const subtitle = [schoolName, user.className && `Class ${user.className}`].filter(Boolean).join(' · ');

  const styles = [
    { label: 'Learning', icon: BookOpen, color: '#5B7DB1', record: latestOfType(assessments, 'kolb') },
    { label: 'Thinking', icon: Brain, color: '#6B4C9A', record: latestOfType(assessments, ...THINKING_TYPES) },
    { label: 'Decision', icon: Target, color: '#1E8A6E', record: latestOfType(assessments, 'dual-process') },
  ];

  const scoreOf = (d: ProfileDimension) => Math.round(Number((cognitiveProfile as any)?.[d.key]) || 0);
  const allDimensions = [...CORE_DIMENSIONS, ...EXTRA_DIMENSIONS];
  const topStrengths = allDimensions
    .map(d => ({ label: d.label, value: scoreOf(d) }))
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);
  const radarData = CORE_DIMENSIONS.map(d => ({ dimension: d.label, value: scoreOf(d) }));
  const description: string | undefined = (cognitiveProfile as any)?.archetypeDescription;
  const stillToDo = cognitiveProfile ? Math.max(0, 3 - cognitiveProfile.completedAssessments.length) : 0;

  const profileSection = (
    <div className="space-y-6">
      {profileLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : !cognitiveProfile ? (
        <Card>
          <CardContent className="py-10 text-center space-y-3">
            <Brain className="h-10 w-10 mx-auto text-[#6B4C9A]" />
            <p className="font-semibold">Your profile starts with your first assessment</p>
            <Button className="text-white bg-[#6B4C9A] hover:bg-[#5B3F85]" onClick={() => setActiveTab('track-record')}>
              Take an assessment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="border-[#6B4C9A]/30">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-full bg-[#6B4C9A]/10 text-[#6B4C9A] flex items-center justify-center shrink-0">
                  <Brain className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Your thinking type</p>
                  <h3 className="text-xl font-bold">{cognitiveProfile.cognitiveArchetype}</h3>
                  {description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{description}</p>}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Profile complete</span>
                  <span className="font-semibold">{Math.round(cognitiveProfile.profileCompleteness)}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-[#6B4C9A]" style={{ width: `${Math.round(cognitiveProfile.profileCompleteness)}%` }} />
                </div>
                {stillToDo > 0 && (
                  <p className="text-xs text-muted-foreground mt-1.5">Finish {stillToDo} more core assessment{stillToDo > 1 ? 's' : ''} to unlock career matches.</p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button size="sm" className="text-white bg-[#6B4C9A] hover:bg-[#5B3F85]" onClick={onOpenFullProfile}>
                  <Brain className="mr-1.5 h-4 w-4" /> Full report
                </Button>
                {cognitiveProfile.profileCompleteness === 100 && (
                  <Button size="sm" variant="outline" onClick={onOpenCareers}>
                    <Briefcase className="mr-1.5 h-4 w-4" /> Career matches
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <section className="space-y-3">
            <h3 className="font-bold">My styles</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              {styles.map(s => {
                const Icon = s.icon;
                const name = s.record ? assessmentStyleName(s.record) : '';
                return (
                  <div key={s.label} className="rounded-xl border bg-card p-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Icon className="h-4 w-4" style={{ color: s.color }} /> {s.label}
                    </div>
                    <p className="font-semibold text-sm min-h-[2.5rem]">{s.record ? (name || 'Result saved') : 'Not taken yet'}</p>
                    {s.record ? (
                      <Button size="sm" variant="outline" onClick={() => onViewAssessment(s.record!)}>
                        <Eye className="mr-1.5 h-3.5 w-3.5" /> View
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setActiveTab('track-record')}>Take it</Button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h3 className="font-bold flex items-center">
                My strengths
                <InfoTip>Scores out of 100, built from your assessments. They show what comes naturally right now, and they can change.</InfoTip>
              </h3>
              <Segmented
                label="How to view your strengths"
                options={DATA_VIEWS}
                value={dataView}
                onChange={(id) => setDataView(id)}
              />
            </div>

            {topStrengths.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {topStrengths.map(s => (
                  <Badge key={s.label} variant="outline" className="border-[#6B4C9A] text-[#6B4C9A]">{s.label}</Badge>
                ))}
              </div>
            )}

            {dataView === 'chart' ? (
              <div className="h-72 rounded-xl border bg-card p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} outerRadius="70%">
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11, fill: 'var(--foreground)' }} />
                    <Radar name="Score" dataKey="value" stroke="#6B4C9A" fill="#6B4C9A" fillOpacity={0.35} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="rounded-xl border bg-card p-4 space-y-3">
                {allDimensions.map(d => {
                  const value = scoreOf(d);
                  return (
                    <div key={d.key} title={d.hint} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{d.label}</span>
                        <span className="text-xs text-muted-foreground">{scoreBand(value)} · <span className="font-semibold text-foreground tabular-nums">{value}</span></span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-[#5B7DB1]" style={{ width: `${value}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );

  const accountRows: Array<[string, string | undefined]> = [
    ['School', schoolName],
    ['Class', user.className],
    ['Level', user.educationLevel],
    ['Email', realEmail],
    ['Age', user.dateOfBirth ? `${calculateAge(user.dateOfBirth)} years` : undefined],
    ['Member since', user.createdAt ? formatMonthYear(user.createdAt) : undefined],
    ['Assessments done', String(assessments.length)],
  ];

  const accountSection = (
    <div className="space-y-6">
      <Card className="border-2 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            My account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-3">
            {accountRows.filter(([, value]) => value).map(([label, value]) => (
              <div key={label} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg min-w-0">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="font-semibold break-words">{value}</p>
              </div>
            ))}
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-muted-foreground">Brain Gym streak</p>
              <p className="font-semibold flex items-center gap-1">
                <Flame className="h-4 w-4 text-orange-500" />
                {brainGymProgress.currentStreak} days
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <CardV2Grid columns={2}>
        <CardV2
          icon={FileText}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
          title="My Reflections"
          subtitle="Notes you wrote about your results"
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
          subtitle="Tell us what you think"
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
    </div>
  );

  return (
    <TabsContent value="profile" className="space-y-6">
      {/* Who you are: always visible, so the profile and the account read together */}
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
            <div className="flex-1 min-w-0">
              <CardTitle className="text-2xl">{user.name}</CardTitle>
              {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
              {user.educationLevel && <Badge variant="secondary" className="mt-2">{user.educationLevel}</Badge>}
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Camera className="h-3 w-3 shrink-0" /> Tap the camera to add a photo. Your parent will see it.
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Segmented label="What to show" options={VIEWS} value={view} onChange={(id) => setView(id)} />

      {view !== 'account' && profileSection}
      {view !== 'profile' && accountSection}
    </TabsContent>
  );
}
