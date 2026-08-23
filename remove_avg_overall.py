import re

with open('src/app/components/SchoolTeacherStylesView.tsx', 'r') as f:
    code = f.read()

# Find the avgOverall rendering block and remove it
code = re.sub(r'\s*\{avgOverall > 0 && \(\s*<Card style=\{\{ borderLeft.*?\} Alignment</p>\s*</div>\s*</CardContent>\s*</Card>\s*\)\}', '', code, flags=re.DOTALL)

with open('src/app/components/SchoolTeacherStylesView.tsx', 'w') as f:
    f.write(code)
