import os

files = [
    'src/app/components/JTIAAssessmentTaking.tsx',
    'src/app/components/JTIAReport.tsx',
    'src/app/components/TeacherDashboardNew.tsx',
    'src/app/components/teacher/TeacherAnalyticsComparison.tsx',
    'src/app/components/JTIASchoolDashboard.tsx',
    'src/app/components/TeacherDashboardNew.tsx.bak',
]

for file in files:
    if os.path.exists(file):
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        c = content
        c = c.replace('JTIA Assessment Selector', 'Teaching Insights Selector')
        c = c.replace('JTIA • Item', 'Teaching Insights • Item')
        c = c.replace('JTIA • Teacher Insights', 'Teaching Insights • Teacher Insights')
        c = c.replace('your JTIA profile', 'your Teaching Insights profile')
        c = c.replace('JTIA responses', 'Teaching Insights responses')
        c = c.replace('JTIA competency mappings', 'competency mappings')
        c = c.replace('JTIA • 5 Core Domains', 'Teaching Insights • 5 Core Domains')
        c = c.replace('Retake JTIA', 'Retake Teaching Insights Assessment')
        c = c.replace('Start JTIA Assessment', 'Start Teaching Insights Assessment')
        c = c.replace('5 JTIA domains', '5 Teaching Insights domains')
        c = c.replace('Overall JTIA Analysis', 'Overall Teaching Insights Analysis')

        if c != content:
            with open(file, 'w', encoding='utf-8') as f:
                f.write(c)
            print(f"Updated {file}")
