import re

with open("src/app/components/AILearningCoach.tsx", "r") as f:
    content = f.read()

content = content.replace("type ReminderConfig\n} from '../utils/aiRecommendations';", "type ReminderConfig,\n  UserProfile,\n  AIProfileInterpretation,\n  Recommendation,\n  StudySession,\n  SmartReminder\n} from '../utils/aiRecommendations';")
content = content.replace("const [userProfile, setUserProfile] = useState<any>(null);", "const [userProfile, setUserProfile] = useState<UserProfile | null>(null);")
content = content.replace("const [profileInterpretation, setProfileInterpretation] = useState<any>(null);", "const [profileInterpretation, setProfileInterpretation] = useState<AIProfileInterpretation | null>(null);")
content = content.replace("const [recommendations, setRecommendations] = useState<any[]>([]);", "const [recommendations, setRecommendations] = useState<Recommendation[]>([]);")
content = content.replace("const [studyPlan, setStudyPlan] = useState<any>(null);", "const [studyPlan, setStudyPlan] = useState<StudySession | null>(null);")
content = content.replace("const [reminders, setReminders] = useState<any[]>([]);", "const [reminders, setReminders] = useState<SmartReminder[]>([]);")

# getCoachInsights return type
coach_insight_type = "ReturnType<typeof getCoachInsights> | null"
content = content.replace("const [coachInsights, setCoachInsights] = useState<any>(null);", f"const [coachInsights, setCoachInsights] = useState<{coach_insight_type}>(null);".replace("{coach_insight_type}", coach_insight_type))

# line 119
content = content.replace("const profile: any = { id: userId, assessmentScores: {} };", "const profile: UserProfile = { id: userId, assessmentScores: {} };")
content = content.replace("results.forEach((result: any) => {", "results.forEach((result: {assessmentType: string, scores: any, primaryStyle: string}) => {")

# line 278: icon: React.FC<any>
content = content.replace("icon: React.FC<any>", "icon: React.ElementType")

# map(strength: any)
content = content.replace("strengths.map((strength: any", "strengths.map((strength: {area: string; description: string}")
content = content.replace("developmentAreas.map((area: any", "developmentAreas.map((area: {area: string; description: string; suggestion: string}")

# studyPlan.activities.map((activity: any
content = content.replace("studyPlan.activities.map((activity: any", "studyPlan.activities.map((activity: StudySession['activities'][0]")

with open("src/app/components/AILearningCoach.tsx", "w") as f:
    f.write(content)

print("Done")
