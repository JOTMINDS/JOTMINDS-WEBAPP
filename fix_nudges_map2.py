with open('src/app/components/ui/dashboard-layout.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

import re
content = re.sub(r'userId=\{user\.id\}.*?targetTab = \'lesson-planner\';\n.*?\n.*?\n.*?\n', """<NudgesPanel userId={user.id} isNavbarMode={true} onNavigate={(route) => {
                  // Map legacy route names to new dashboard tabs
                  let targetTab = route;
                  if (route.includes('/assessments') || route.includes('jtia')) targetTab = 'jtia';
                  else if (route.includes('/profile') || route.includes('my-style')) targetTab = 'my-style';
                  else if (route.includes('/analytics')) targetTab = 'analytics';
                  else if (route.includes('/lesson')) targetTab = 'lesson-planner';
                  else if (route.includes('/students') || route.includes('class')) targetTab = 'students';
                  setActiveTab(targetTab);
                }} />""", content, flags=re.DOTALL)

with open('src/app/components/ui/dashboard-layout.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
