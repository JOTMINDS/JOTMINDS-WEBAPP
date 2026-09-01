with open('src/app/components/ui/dashboard-layout.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("<NudgesPanel userId={user.id} isNavbarMode={true} />", "<NudgesPanel userId={user.id} isNavbarMode={true} onNavigate={setActiveTab} />")

with open('src/app/components/ui/dashboard-layout.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated DashboardLayout")
