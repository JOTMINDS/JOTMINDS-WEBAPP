with open("src/app/components/lessonPlanner/LessonPlanCreation.tsx", "r") as f:
    content = f.read()

content = content.replace("useState('Define a linear equation in one variable.\\nIdentify variables, coefficients, and constants.')", "useState('')")
content = content.replace("useState('Solve simple linear equations involving addition and subtraction.')", "useState('')")
content = content.replace("useState('Apply linear equations to calculate simple real-life budgeting scenarios.')", "useState('')")

with open("src/app/components/lessonPlanner/LessonPlanCreation.tsx", "w") as f:
    f.write(content)
