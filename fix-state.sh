#!/bin/bash
awk '
/}: ProfessionalAssessmentReportProps\) {/ {
  print $0
  print "  const [aiSummary, setAiSummary] = useState<any>(null);"
  print "  const [isGeneratingAI, setIsGeneratingAI] = useState(true);"
  print ""
  print "  useEffect(() => {"
  print "    async function fetchAI() {"
  print "      setIsGeneratingAI(true);"
  print "      const summary = await generateAICognitiveExecutiveSummary({"
  print "        name: userName,"
  print "        position: userPosition,"
  print "        organization: userOrganization,"
  print "        learning: assessment?.score?.kolb?.style,"
  print "        thinking: assessment?.score?.sternberg?.style,"
  print "        decision: assessment?.score?.dualProcess?.style"
  print "      });"
  print "      if (summary) setAiSummary(summary);"
  print "      setIsGeneratingAI(false);"
  print "    }"
  print "    fetchAI();"
  print "  }, [assessment?.score, userName, userPosition, userOrganization]);"
  print ""
  next
}
{print}
' src/app/components/ProfessionalAssessmentReport.tsx > temp.tsx && mv temp.tsx src/app/components/ProfessionalAssessmentReport.tsx
