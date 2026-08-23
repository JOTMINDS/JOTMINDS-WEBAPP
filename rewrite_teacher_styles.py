import re

with open('src/app/components/SchoolTeacherStylesView.tsx', 'r') as f:
    code = f.read()

# We need to remove the extractThinking, extractLearning, extractDecision functions and usage
code = re.sub(r'function extractThinking.*?}\n\n', '', code, flags=re.DOTALL)
code = re.sub(r'function extractLearning.*?}\n\n', '', code, flags=re.DOTALL)
code = re.sub(r'function extractDecision.*?}\n\n', '', code, flags=re.DOTALL)

# In interface TeacherData
code = re.sub(r'  thinking:\s*any;\n', '', code)
code = re.sub(r'  learning:\s*any;\n', '', code)
code = re.sub(r'  decision:\s*any;\n', '', code)

# In buildTeacherData
code = re.sub(r'  const learning = extractLearning\(assessments\);\n', '', code)
code = re.sub(r'  const thinking = extractThinking\(assessments\);\n', '', code)
code = re.sub(r'  const decision = extractDecision\(assessments\);\n', '', code)
code = re.sub(r'  const completedCount = \[teaching, learning, thinking, decision\]\.filter\(Boolean\)\.length;', '  const completedCount = [teaching].filter(Boolean).length;', code)
code = re.sub(r'return \{ user, teaching, learning, thinking, decision, completedCount \};', 'return { user, teaching, completedCount };', code)

# Remove computeTeachingThinkingAlignment, computeLearningTeachingAlignment, computeDecisionTeachingAlignment
code = re.sub(r'function computeTeachingThinkingAlignment.*?return Math.max\(30, Math.min\(98, Math.round\(s\)\)\);\n}\n', '', code, flags=re.DOTALL)
code = re.sub(r'function computeLearningTeachingAlignment.*?return Math.max\(30, Math.min\(98, Math.round\(s\)\)\);\n}\n', '', code, flags=re.DOTALL)
code = re.sub(r'function computeDecisionTeachingAlignment.*?return Math.max\(30, Math.min\(98, Math.round\(s\)\)\);\n}\n', '', code, flags=re.DOTALL)

# Modify FullProfile interface
code = re.sub(r'  teachingAlignment: number; // 0-100 — teaching vs thinking style\n', '', code)
code = re.sub(r'  cognitiveAlignment: number; // 0-100 — learning vs teaching style\n', '', code)
code = re.sub(r'  decisionAlignment: number;  // 0-100 — decision style vs teaching\n', '', code)

# Modify generateFullProfile
gen_profile_replacement = """function generateFullProfile(t: TeacherData): FullProfile | null {
  if (!t.teaching) return null;
  const axes = t.teaching.axes;
  const teachStyle = t.teaching.primaryStyle;

  const overallScore = 100; // JTIA replaces the alignment scores

  const nameBase = teachStyle;

  const strengths: string[] = [];
  const gaps: string[] = [];

  if (axes.axisAdaptability > 55) strengths.push('Highly adaptive in teaching methods');
  if (axes.axisAssessment > 55) strengths.push('Strong focus on objective evaluation');
  if (axes.axisClimate > 55) strengths.push('Creates a supportive emotional climate');
  if (axes.axisKnowledge > 55) strengths.push('Deep commitment to content mastery');
  if (axes.axisMotivation > 55) strengths.push('Inspires student engagement naturally');
  
  if (axes.axisAdaptability < 40) gaps.push('May stick too rigidly to lesson plans');
  if (axes.axisClimate < 40) gaps.push('Could focus more on relationship-building');
  if (axes.axisKnowledge < 40) gaps.push('May benefit from deeper content-focused PD');

  const studentFit: string[] = [];
  if (axes.axisAdaptability > 50) studentFit.push('Students who need dynamic learning environments');
  if (axes.axisClimate > 50) studentFit.push('Students who thrive with emotional support');
  if (axes.axisAssessment > 50) studentFit.push('Students who benefit from structured feedback');

  let desc = `An educator whose primary teaching style is ${teachStyle}. `;
  
  return {
    name: nameBase,
    tagline: `A ${teachStyle} Educator`,
    description: desc,
    strengths,
    gaps,
    studentFit,
    overallScore
  };
}"""
code = re.sub(r'function generateFullProfile.*?return \{\n    name: nameBase,.*?overallScore\n  \};\n}', gen_profile_replacement, code, flags=re.DOTALL)


# Remove the charts for Staff Thinking Styles, etc.
# Find "Staff Thinking Styles" Card
code = re.sub(r'\s*<Card>\s*<CardHeader><CardTitle className="text-sm">Staff Thinking Styles</CardTitle></CardHeader>.*?</Card>', '', code, flags=re.DOTALL)
# Find "School-wide Educator Alignment" Card
code = re.sub(r'\s*\{avgOverall > 0 && \(\s*<Card className="border-amber-200 bg-amber-50">.*?</Card>\s*\)\}', '', code, flags=re.DOTALL)

# In the render Profile details section
code = re.sub(r'\{/\* Cognitive Alignment Scores \*/\}.*?\{/\* Development Focus \*/\}', '{/* Development Focus */}', code, flags=re.DOTALL)

# In the distribution state
code = re.sub(r'  const \[thinkingDist, setThinkingDist\] = useState<\{name:string, value:number\}\[\]>\(\[\]\);\n', '', code)
code = re.sub(r'  const \[learningDist, setLearningDist\] = useState<\{name:string, value:number\}\[\]>\(\[\]\);\n', '', code)
code = re.sub(r'  const \[decisionDist, setDecisionDist\] = useState<\{name:string, value:number\}\[\]>\(\[\]\);\n', '', code)

# In useEffect distribution calculation
code = re.sub(r'    const thinkCount: Record<string, number> = \{\};\n.*?setDecisionDist\(Object\.entries\(decCount\)\.map\(\(\[name, value\]\) => \(\{ name, value \}\)\)\);\n', '', code, flags=re.DOTALL)

# In the tabs array for Mobile/desktop
code = re.sub(r'\s*\{\s*title: \'Thinking Styles\'.*?\},', '', code, flags=re.DOTALL)
code = re.sub(r'\s*\{\s*title: \'Learning Styles\'.*?\},', '', code, flags=re.DOTALL)
code = re.sub(r'\s*\{\s*title: \'Decision Making\'.*?\},', '', code, flags=re.DOTALL)

# In the profile list view details
code = re.sub(r'\s*\{/\* Thinking Style \*/\}.*?\{/\* Decision Style \*/\}.*?</div>', '</div>', code, flags=re.DOTALL)


with open('src/app/components/SchoolTeacherStylesView.tsx', 'w') as f:
    f.write(code)
