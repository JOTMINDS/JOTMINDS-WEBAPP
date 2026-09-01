with open('src/app/components/ui/dashboard-layout.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

navigation_handler = """            {user && (
              <div className="flex items-center ml-4">
                <NudgesPanel userId={user.id} isNavbarMode={true} onNavigate={(route) => {
                  // Map legacy route names to new dashboard tabs
                  let targetTab = route;
                  if (route.includes('/assessments') || route.includes('jtia')) targetTab = 'jtia';
                  else if (route.includes('/profile') || route.includes('my-style')) targetTab = 'my-style';
                  else if (route.includes('/analytics')) targetTab = 'analytics';
                  else if (route.includes('/lesson')) targetTab = 'lesson-planner';
                  else if (route.includes('/students') || route.includes('class')) targetTab = 'students';
                  setActiveTab(targetTab);
                }} />
              </div>
            )}"""

content = content.replace("<NudgesPanel userId={user.id} isNavbarMode={true} onNavigate={setActiveTab} />", navigation_handler.split('<NudgesPanel ')[1].split(' />')[0] + ' />')
# Need to be precise with the replacement
import re
content = re.sub(r'\{user && \(\s*<div className="flex items-center ml-4">\s*<NudgesPanel userId=\{user\.id\} isNavbarMode=\{true\} onNavigate=\{setActiveTab\} />\s*</div>\s*\)\}', navigation_handler, content, flags=re.DOTALL)

with open('src/app/components/ui/dashboard-layout.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated DashboardLayout with routing map")
