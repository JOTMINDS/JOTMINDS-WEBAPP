import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  ArrowLeft,
  Brain,
  Zap,
  Target,
  Trophy,
  TrendingUp,
  Clock,
  Flame,
  Lock,
  Unlock,
  Star,
  Award,
  BarChart3,
} from 'lucide-react';
import {
  getAllLessons,
  getAvailableLessons,
  getLesson,
  getCompletedLessonIds,
  generateDailyWorkout,
  getWorkoutStreak,
  type CognitiveLesson,
  type DailyWorkout,
} from '../utils/cognitiveWorkout';
import {
  getMasteryProgress,
  getSkillRecommendations,
  calculateSkillSynergies,
  type MasteryProgress,
} from '../utils/skillMastery';
import {
  getUserChallengeProfile,
  getUnlockableLevels,
  type UnlockableLevel,
} from '../utils/adaptiveChallenges';

interface Props {
  userId: string;
  onBack: () => void;
  onStartLesson: (lessonId: string) => void;
  onStartChallenge: () => void;
}

export function CognitiveWorkoutDashboard({ userId, onBack, onStartLesson, onStartChallenge }: Props) {
  const [masteryProgress, setMasteryProgress] = useState<MasteryProgress | null>(null);
  const [dailyWorkout, setDailyWorkout] = useState<DailyWorkout | null>(null);
  const [streak, setStreak] = useState<any>(null);
  const [availableLessons, setAvailableLessons] = useState<CognitiveLesson[]>([]);
  const [unlockableLevels, setUnlockableLevels] = useState<UnlockableLevel[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = () => {
    const progress = getMasteryProgress(userId);
    const workout = generateDailyWorkout(userId);
    const streakData = getWorkoutStreak(userId);
    const lessons = getAvailableLessons(userId);
    const levels = getUnlockableLevels(userId);

    setMasteryProgress(progress);
    setDailyWorkout(workout);
    setStreak(streakData);
    setAvailableLessons(lessons);
    setUnlockableLevels(levels);
  };

  if (!masteryProgress || !dailyWorkout || !streak) {
    return <div className="p-8 text-center">Loading workout...</div>;
  }

  const completedLessons = getCompletedLessonIds(userId);
  const recommendations = getSkillRecommendations(userId);
  const synergies = calculateSkillSynergies(userId);
  const challengeProfile = getUserChallengeProfile(userId);

  // Calculate daily progress
  const dailyLessonsCompleted = dailyWorkout.lessons.filter(id =>
    completedLessons.includes(id)
  ).length;
  const dailyProgress = (dailyLessonsCompleted / dailyWorkout.lessons.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-semibold text-lg flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Cognitive Workout Center
            </h1>
            <p className="text-xs text-muted-foreground">
              Train your brain, level up your skills
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Overall Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Trophy className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {masteryProgress.overallMasteryScore}%
                  </div>
                  <div className="text-xs text-muted-foreground">Overall Mastery</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-200 bg-gradient-to-br from-white to-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Flame className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {streak.currentStreak}
                  </div>
                  <div className="text-xs text-muted-foreground">Day Streak</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200 bg-gradient-to-br from-white to-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Star className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {masteryProgress.totalSkillXP.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Skill XP</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 bg-gradient-to-br from-white to-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Award className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {completedLessons.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Lessons Complete</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Workout */}
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Today's Workout
                </CardTitle>
                <CardDescription>
                  {dailyWorkout.bonusMultiplier > 1 && (
                    <Badge variant="default" className="mt-2">
                      {dailyWorkout.bonusMultiplier}x XP Bonus!
                    </Badge>
                  )}
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {dailyLessonsCompleted}/{dailyWorkout.lessons.length}
                </div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={dailyProgress} className="h-2" />

            <div className="grid gap-3 md:grid-cols-3">
              {dailyWorkout.lessons.map(lessonId => {
                const lesson = getLesson(lessonId);
                if (!lesson) return null;

                const isCompleted = completedLessons.includes(lessonId);

                return (
                  <Card
                    key={lessonId}
                    className={`cursor-pointer transition hover:shadow-lg ${
                      isCompleted ? 'bg-green-50 border-green-200' : ''
                    }`}
                    onClick={() => !isCompleted && onStartLesson(lessonId)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{lesson.category === 'learning' ? '📚' : lesson.category === 'thinking' ? '🧠' : '🎯'}</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm mb-1">{lesson.title}</h4>
                          <p className="text-xs text-muted-foreground mb-2">
                            {lesson.estimatedTime} min • {lesson.xpReward} XP
                          </p>
                          {isCompleted ? (
                            <Badge variant="default" className="bg-green-600">
                              ✓ Completed
                            </Badge>
                          ) : (
                            <Badge variant="outline">{lesson.difficulty}</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Button onClick={onStartChallenge} className="w-full" size="lg">
              <Zap className="h-5 w-5 mr-2" />
              Start Daily Challenge ({dailyWorkout.challenge.rewards.xp} XP)
            </Button>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="lessons">Lessons</TabsTrigger>
            <TabsTrigger value="levels">Levels</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* Recommendations */}
            {recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recommended for You</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recommendations.map((rec, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">{rec.reason}</h4>
                        <Badge
                          variant={
                            rec.priority === 'high'
                              ? 'destructive'
                              : rec.priority === 'medium'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {rec.priority}
                        </Badge>
                      </div>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {rec.suggestedActivities.map((activity, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            {activity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Synergies */}
            {synergies.length > 0 && (
              <Card className="border-2 border-yellow-200 bg-gradient-to-br from-white to-yellow-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-600" />
                    Skill Synergies Unlocked
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {synergies.map((synergy, idx) => (
                    <div key={idx} className="p-4 bg-white rounded-lg border-2 border-yellow-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-yellow-900">
                          {synergy.combination.join(' + ')}
                        </div>
                        <Badge className="bg-yellow-600 text-white">
                          +{synergy.bonus}% Bonus
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700">{synergy.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Streak Milestones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-600" />
                  Streak Milestones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {streak.milestones.map((milestone: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {milestone.claimed ? (
                          <Trophy className="h-5 w-5 text-yellow-600" />
                        ) : streak.currentStreak >= milestone.days ? (
                          <Star className="h-5 w-5 text-orange-600" />
                        ) : (
                          <Lock className="h-5 w-5 text-gray-400" />
                        )}
                        <div>
                          <div className="font-semibold">{milestone.days} Day Streak</div>
                          <div className="text-sm text-muted-foreground">{milestone.reward}</div>
                        </div>
                      </div>
                      {milestone.claimed ? (
                        <Badge className="bg-yellow-600 text-white">Claimed</Badge>
                      ) : streak.currentStreak >= milestone.days ? (
                        <Badge className="bg-green-600 text-white">Ready!</Badge>
                      ) : (
                        <Badge variant="outline">
                          {milestone.days - streak.currentStreak} days left
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-4">
            <div className="grid gap-4">
              {masteryProgress.skills.map(skill => (
                <Card key={skill.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{skill.icon}</div>
                        <div>
                          <CardTitle className="text-base">{skill.name}</CardTitle>
                          <CardDescription>{skill.description}</CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="mb-1">
                          {skill.rank}
                        </Badge>
                        <div className="text-sm font-semibold">Level {skill.currentLevel}</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress to Level {skill.currentLevel + 1}</span>
                      <span className="font-semibold">
                        {skill.currentXP} / {skill.xpToNextLevel} XP
                      </span>
                    </div>
                    <Progress
                      value={skill.currentLevel === 10 ? 100 : (skill.currentXP / skill.xpToNextLevel) * 100}
                      className="h-2"
                    />

                    {/* Milestones */}
                    <div className="flex items-center gap-2 mt-3">
                      {skill.milestones.map(milestone => (
                        <div
                          key={milestone.level}
                          className={`flex items-center gap-1 text-xs p-2 rounded-lg border ${
                            milestone.achieved
                              ? 'bg-green-50 border-green-200 text-green-700'
                              : 'bg-gray-50 border-gray-200 text-gray-500'
                          }`}
                          title={milestone.description}
                        >
                          {milestone.achieved ? (
                            <Trophy className="h-3 w-3" />
                          ) : (
                            <Lock className="h-3 w-3" />
                          )}
                          <span>Lv{milestone.level}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Lessons Tab */}
          <TabsContent value="lessons" className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {availableLessons.map(lesson => {
                const isCompleted = completedLessons.includes(lesson.id);
                const isLocked = lesson.unlockRequirement !== undefined;

                return (
                  <Card
                    key={lesson.id}
                    className={`cursor-pointer transition hover:shadow-lg ${
                      isCompleted ? 'bg-green-50 border-green-200' : ''
                    } ${isLocked ? 'opacity-75' : ''}`}
                    onClick={() => !isCompleted && !isLocked && onStartLesson(lesson.id)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="text-2xl">
                          {lesson.category === 'learning'
                            ? '📚'
                            : lesson.category === 'thinking'
                            ? '🧠'
                            : lesson.category === 'decision'
                            ? '🎯'
                            : lesson.category === 'memory'
                            ? '🧠'
                            : lesson.category === 'attention'
                            ? '👁️'
                            : '🧩'}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm mb-1">{lesson.title}</h4>
                          <p className="text-xs text-muted-foreground mb-2">
                            {lesson.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs">
                          <Clock className="h-3 w-3" />
                          <span>{lesson.estimatedTime} min</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          +{lesson.xpReward} XP
                        </Badge>
                      </div>

                      <div className="mt-3">
                        {isCompleted ? (
                          <Badge className="bg-green-600 w-full justify-center">
                            ✓ Completed
                          </Badge>
                        ) : isLocked ? (
                          <Badge variant="secondary" className="w-full justify-center">
                            <Lock className="h-3 w-3 mr-1" />
                            Locked
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="w-full justify-center capitalize">
                            {lesson.difficulty}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Levels Tab */}
          <TabsContent value="levels" className="space-y-4">
            <div className="grid gap-4">
              {unlockableLevels.map(level => (
                <Card
                  key={level.id}
                  className={
                    level.unlocked
                      ? 'border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50'
                      : 'opacity-75'
                  }
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {level.unlocked ? (
                          <Unlock className="h-6 w-6 text-purple-600" />
                        ) : (
                          <Lock className="h-6 w-6 text-gray-400" />
                        )}
                        <div>
                          <CardTitle className="text-base">
                            Level {level.level}: {level.name}
                          </CardTitle>
                          <CardDescription>{level.description}</CardDescription>
                        </div>
                      </div>
                      {level.unlocked && (
                        <Badge className="bg-purple-600 text-white">Unlocked!</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium mb-1">Requirement:</div>
                        <div className="text-sm text-muted-foreground capitalize">
                          {level.requirement.type.replace('_', ' ')}: {level.requirement.value}
                        </div>
                      </div>

                      <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="text-sm font-medium mb-2 text-yellow-900">Rewards:</div>
                        <div className="space-y-1">
                          <div className="text-sm text-yellow-800">
                            +{level.rewards.xp} XP
                          </div>
                          {level.rewards.badges.map((badge, idx) => (
                            <div key={idx} className="text-sm text-yellow-800 flex items-center gap-1">
                              <Trophy className="h-3 w-3" />
                              {badge} Badge
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
