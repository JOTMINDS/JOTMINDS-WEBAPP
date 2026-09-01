import re

with open('src/app/components/StudentDetailView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

new_radar = """              <CardHeader>
                <CardTitle>Cognitive Profile Analysis</CardTitle>
                <CardDescription>
                  Visual representation of {student.name}'s learning preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={cognitiveProfile}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="dimension" tick={{fontSize: 10}} />
                    <PolarRadiusAxis angle={90} domain={[0, 48]} />
                    <Radar
                      name={student.name}
                      dataKey="score"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
                
                <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                  <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2"><Brain className="w-5 h-5"/> How to interpret this graph</h4>
                  <div className="space-y-4 text-sm text-blue-800">
                    <p>The radar chart shows how {student.name} prefers to process information across four key dimensions (max score 48):</p>
                    <ul className="list-disc pl-4 space-y-2">
                      <li><strong>Concrete Experience ({ce}):</strong> Learning from feeling and personal experiences.</li>
                      <li><strong>Reflective Observation ({ro}):</strong> Learning by watching and listening.</li>
                      <li><strong>Abstract Concept ({ac}):</strong> Learning by thinking and analyzing logic.</li>
                      <li><strong>Active Experiment ({ae}):</strong> Learning by doing and practical application.</li>
                    </ul>
                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <strong>Dominant Trait: </strong> 
                      {(() => {
                        const highest = [...cognitiveProfile].sort((a,b) => b.score - a.score)[0];
                        if (highest.dimension === 'Concrete Experience') return `They strongly prefer hands-on, emotionally engaging lessons.`;
                        if (highest.dimension === 'Reflective Observation') return `They prefer observing and thinking deeply before participating.`;
                        if (highest.dimension === 'Abstract Concept') return `They prefer logical frameworks and theoretical understanding.`;
                        if (highest.dimension === 'Active Experiment') return `They learn best through trial and error and physical activities.`;
                        return 'Balanced profile.';
                      })()}
                    </div>
                  </div>
                </div>
              </CardContent>"""

content = re.sub(r'<CardHeader>\s*<CardTitle>Cognitive Profile.*?</CardContent>', new_radar, content, flags=re.DOTALL)

with open('src/app/components/StudentDetailView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated StudentDetailView Radar Chart")
