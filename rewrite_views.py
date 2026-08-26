import re

def rewrite_file(filepath, replacements):
    with open(filepath, 'r') as f:
        content = f.read()
    for old, new in replacements:
        content = content.replace(old, new)
    with open(filepath, 'w') as f:
        f.write(content)

assess_replacements = [
    ("'Which of these is a linear equation in one variable?'", "'Sample Multiple Choice Question 1'"),
    ("'Translate to an equation: \"Five less than twice a number is fifteen.\"'", "'Sample Multiple Choice Question 2'"),
    ("'Which equation represents \"a number divided by 3 is equal to 9\"?'", "'Sample Multiple Choice Question 3'"),
    ("'Solve for y: 4y - 8 = 16. Show your step-by-step working.'", "'Sample Short Answer Question 1'"),
    ("'Solve for m: 3(m + 2) = 21'", "'Sample Short Answer Question 2'"),
    ("'Write a word problem that can be solved using the equation 2x + 5 = 15.'", "'Sample Short Answer Question 3'"),
    ("'Solve the equation: 5x + 7 = 2x + 16'", "'Sample Short Answer Question 4'"),
    ("'In a real-life taxi fare equation (Fare = $5 + $2/km), explain why the $5 base fee is considered a constant and the distance traveled is a variable.'", "'Sample Essay Question 1'"),
    ("'Why must we perform the same mathematical operation on BOTH sides of the equals sign when solving an equation?'", "'Sample Essay Question 2'"),
    ("'How do you check your answer after solving an algebraic equation? Why is this step important?'", "'Sample Essay Question 3'"),
    ("'Can an equation have no solution? Discuss an example of when this might occur.'", "'Sample Essay Question 4'"),
    ("'Using physical or drawn balance scales, model the equation x + 5 = 11 and demonstrate how removing 5 from both sides maintains balance.'", "'Sample Hands-on Activity Question 1'"),
    ("'Use algebra tiles to construct the equation 3x - 2 = 7, then physically add two positive tiles to both sides.'", "'Sample Hands-on Activity Question 2'"),
    ("'Design a board game where players advance spaces by correctly identifying the next inverse operation needed to solve complex equations.'", "'Sample Hands-on Activity Question 3'"),
    ("'Measure various objects in the classroom and create linear equations representing their combined lengths.'", "'Sample Hands-on Activity Question 4'"),
    ("'Complete textbook page 45, questions 1 to 5 on linear equation word problems. Write a short real-world scenario representing the equation 3x + 2 = 14.'", "'Sample Take-home Activity 1'"),
    ("'Find one example of a linear relationship in your home (e.g., cell phone bill, streaming subscription) and write an equation for it.'", "'Sample Take-home Activity 2'"),
    ("'Solve the 10 mixed equations on Worksheet A. Highlight any steps where you made a mistake and explain how you fixed it.'", "'Sample Take-home Activity 3'"),
    ("'Interview a parent or guardian about how they use math or budgets in their daily work, and formulate one linear equation from their example.'", "'Sample Take-home Activity 4'"),
    ("'Create a 5-question quiz on solving linear equations for a classmate, including an answer key with full working steps.'", "'Sample Take-home Activity 5'"),
    ("|| 'Linear Equations'", "|| 'Topic'")
]

rewrite_file("src/app/components/lessonPlanner/AssessmentGeneratorView.tsx", assess_replacements)

diff_replacements = [
    ("'Standard Linear Equation Solving'", "'Standard Topic Activity'"),
    ("'Solve 4 standard linear equations (e.g. 2x + 4 = 12, 3y - 5 = 10) independently in exercise books.'", "'Complete standard exercises independently.'"),
    ("'Solve x + 3 = 8 using visual balance scale templates and color-coded step-by-step guidance.'", "'Complete scaffolded problems with visual templates and step-by-step guidance.'"),
    ("'Formulate a linear equation for a real-world taxi fare problem: $5 base fee + $2 per km = $25 total.'", "'Formulate and solve a real-world problem based on the topic.'"),
    ("'Formulate and solve a custom linear word problem for a peer.'", "'Create a custom challenge task for a peer.'"),
    ("'Graph the taxi fare equation on a coordinate plane.'", "'Create a visual representation of the concept.'"),
    ("'Kinesthetic Equation Balance'", "'Kinesthetic Modeling'"),
    ("'Digital Equation Solver Game'", "'Interactive Digital Task'"),
    ("'Students map out the decision tree for solving single-variable vs multi-step equations using color-coded flow diagrams.'", "'Students map out a decision tree for the core concepts using flow diagrams.'"),
    ("'Create a short rap or mnemonic chant to remember the order of operations when solving equations.'", "'Create a short mnemonic or chant to remember key rules.'"),
    ("'Research how linear equations are used in computer programming or engineering, and present findings in a short report.'", "'Research how the topic is used in real-world professions and present findings.'"),
    ("'Form teams to debate the most efficient way to solve a complex multi-step equation, arguing for different initial steps.'", "'Form teams to debate different problem-solving approaches to a complex scenario.'"),
    ("'Collect environmental data outside (e.g., leaf sizes, temperatures) and form equations based on observed linear patterns.'", "'Collect environmental data outside and find patterns related to the topic.'"),
    ("|| 'Linear Equations'", "|| 'Topic'")
]

rewrite_file("src/app/components/lessonPlanner/DifferentiatedInstructionView.tsx", diff_replacements)

