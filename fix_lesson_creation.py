import re

with open('src/app/components/lessonPlanner/LessonPlanCreation.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add endDate state
content = content.replace("const [date, setDate] = useState(new Date().toISOString().split('T')[0]);", "const [date, setDate] = useState(new Date().toISOString().split('T')[0]);\n  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);")

# Update newPlan object
content = content.replace("      durationMinutes,\n      date,\n", "      durationMinutes,\n      date,\n      endDate,\n")

# Update curriculum select
old_curriculum = """<SelectContent>
                    <SelectItem value="National">National Curriculum</SelectItem>
                    <SelectItem value="Cambridge">Cambridge</SelectItem>
                    <SelectItem value="IB">International Baccalaureate (IB)</SelectItem>
                    <SelectItem value="Montessori">Montessori</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>"""

new_curriculum = """<SelectContent>
                    <SelectItem value="National Curriculum">National Curriculum</SelectItem>
                    <SelectItem value="British Curriculum (Cambridge/Pearson Edexcel)">British Curriculum (Cambridge/Pearson Edexcel)</SelectItem>
                    <SelectItem value="Oxford International Curriculum">Oxford International Curriculum</SelectItem>
                    <SelectItem value="International Baccalaureate (IB)">International Baccalaureate (IB)</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>"""
content = content.replace(old_curriculum, new_curriculum)
content = content.replace("useState<any>('National')", "useState<any>('National Curriculum')")

# Update Labels Topic and Subtopic
content = content.replace('className="text-xs font-semibold">Topic</Label>', 'className="text-xs font-semibold">Topic / Strand</Label>')
content = content.replace('className="text-xs font-semibold">Subtopic (Optional)</Label>', 'className="text-xs font-semibold">Subtopic / Sub-strand (Optional)</Label>')
content = content.replace('placeholder="e.g. Parts of a Plant"', 'placeholder="e.g. Parts of a Plant or Biology Strand 1"')
content = content.replace('placeholder="e.g. Leaf Structure"', 'placeholder="e.g. Leaf Structure or Sub-strand 1A"')

# Add End Date field next to Lesson Date
date_fields_old = """            <div>
              <Label className="text-xs font-semibold">Lesson Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1"
              />
            </div>"""

date_fields_new = """            <div>
              <Label className="text-xs font-semibold">Start Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">End Date (Optional)</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1"
              />
            </div>"""
            
content = content.replace(date_fields_old, date_fields_new)

with open('src/app/components/lessonPlanner/LessonPlanCreation.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated LessonPlanCreation")
