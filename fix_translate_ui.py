import re

with open('src/app/components/ui/dashboard-layout.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add google translate div before the NudgesPanel
new_header = """            <div className="flex-1 flex items-center">
              {headerContent}
            </div>
            {user && (
              <div className="flex items-center ml-4 gap-4">
                <div id="google_translate_element" className="scale-90 origin-right hidden md:block"></div>
                <NudgesPanel userId={user.id}"""

content = re.sub(r'<div className="flex-1 flex items-center">\s*\{headerContent\}\s*</div>\s*\{user && \(\s*<div className="flex items-center ml-4">\s*<NudgesPanel userId=\{user\.id\}', new_header, content, flags=re.DOTALL)

with open('src/app/components/ui/dashboard-layout.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Added translate div to DashboardLayout")
