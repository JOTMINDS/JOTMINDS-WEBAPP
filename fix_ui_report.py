with open('src/app/components/JTIAReport.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add Progress import if not there
if "import { Progress } from " not in content:
    content = content.replace("import { Card, CardContent, CardHeader, CardTitle, CardDescription } from \"./ui/card\";",
                              "import { Card, CardContent, CardHeader, CardTitle, CardDescription } from \"./ui/card\";\nimport { Progress } from \"./ui/progress\";")
                              
old_card_end = """                        <div className="text-right shrink-0">
                          {getOrientationBadge(item.score)}
                          <div className="text-[10px] text-slate-400 uppercase font-semibold mt-1">
                            Domain Orientation
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>"""

new_card_end = """                        <div className="text-right shrink-0 flex flex-col items-end gap-1">
                          {getOrientationBadge(item.score)}
                          <div className="text-2xl font-black text-indigo-950 dark:text-indigo-100 mt-1">
                            {item.score}
                          </div>
                          <div className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">
                            Domain Score
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-3">
                        <Progress value={item.score} className="h-2 w-full bg-slate-100 dark:bg-slate-800" indicatorClassName="bg-indigo-600 dark:bg-indigo-500" />
                      </div>
                    </CardContent>
                  </Card>"""

if old_card_end in content:
    content = content.replace(old_card_end, new_card_end)
    with open('src/app/components/JTIAReport.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated 5 core domains UI")
else:
    print("Could not find the card end string")
