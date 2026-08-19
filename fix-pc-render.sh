#!/bin/bash
awk '
/<!-- Executive Summary -->/ {
  print $0
  next
}
/<div className="bg-white\/70 dark:bg-gray-800\/70 backdrop-blur-sm rounded-lg p-4 border-2 border-violet-200 dark:border-violet-700">/ {
  in_summary = 1
  print $0
  next
}
in_summary && /<\/div>/ {
  print $0
  print "            "
  print "            {/* AI Executive Summary */}"
  print "            <div className=\"mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-5 border border-blue-100 dark:border-blue-800\">"
  print "              <div className=\"flex items-center gap-2 mb-3\">"
  print "                <Brain className=\"w-5 h-5 text-indigo-600 dark:text-indigo-400\" />"
  print "                <h3 className=\"font-semibold text-indigo-900 dark:text-indigo-300\">JotMinds AI Analysis</h3>"
  print "              </div>"
  print "              {isGeneratingAI ? ("
  print "                <div className=\"flex flex-col items-center justify-center py-4 space-y-3 animate-pulse\">"
  print "                  <p className=\"text-sm text-indigo-600/70 dark:text-indigo-400/70 font-medium\">Synthesizing profile data...</p>"
  print "                  <div className=\"w-full max-w-sm bg-indigo-100 dark:bg-indigo-900/50 rounded-full h-1.5 overflow-hidden\">"
  print "                    <div className=\"bg-indigo-400 h-full rounded-full w-2/3\"></div>"
  print "                  </div>"
  print "                </div>"
  print "              ) : aiSummary ? ("
  print "                <div className=\"space-y-4\">"
  print "                  <p className=\"text-sm text-gray-700 dark:text-gray-300 leading-relaxed\">{aiSummary.narrativeSummary}</p>"
  print "                  <div className=\"bg-white dark:bg-gray-800 rounded p-3 border border-indigo-50 dark:border-indigo-900/30\">"
  print "                    <p className=\"text-xs font-semibold text-indigo-800 dark:text-indigo-400 uppercase tracking-wider mb-1\">Key Takeaway</p>"
  print "                    <p className=\"text-sm text-gray-800 dark:text-gray-200\">{aiSummary.keyTakeaway}</p>"
  print "                  </div>"
  print "                  <div className=\"text-center mt-2\">"
  print "                    <p className=\"text-sm italic text-indigo-600 dark:text-indigo-400 font-medium\">\"{aiSummary.personalizedMantra}\"</p>"
  print "                  </div>"
  print "                </div>"
  print "              ) : ("
  print "                <p className=\"text-sm text-gray-500 italic\">AI analysis unavailable.</p>"
  print "              )}"
  print "            </div>"
  in_summary = 0
  next
}
{print}
' src/app/components/ProfessionalCognitiveResults.tsx > temp.tsx && mv temp.tsx src/app/components/ProfessionalCognitiveResults.tsx
