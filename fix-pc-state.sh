#!/bin/bash
awk '
/const insights = getProfessionalInsights\(profile\);/ {
  print $0
  print "  const [aiSummary, setAiSummary] = React.useState<any>(null);"
  print "  const [isGeneratingAI, setIsGeneratingAI] = React.useState(true);"
  print ""
  print "  React.useEffect(() => {"
  print "    async function fetchAI() {"
  print "      setIsGeneratingAI(true);"
  print "      const summary = await generateAICognitiveExecutiveSummary({"
  print "        name: userName,"
  print "        position: userPosition,"
  print "        learning: profile.learning.style,"
  print "        thinking: profile.thinking.style,"
  print "        decision: profile.decisionMaking.style,"
  print "        motivation: profile.motivation.style"
  print "      });"
  print "      if (summary) setAiSummary(summary);"
  print "      setIsGeneratingAI(false);"
  print "    }"
  print "    fetchAI();"
  print "  }, [profile, userName, userPosition]);"
  print ""
  next
}
{print}
' src/app/components/ProfessionalCognitiveResults.tsx > temp.tsx && mv temp.tsx src/app/components/ProfessionalCognitiveResults.tsx
