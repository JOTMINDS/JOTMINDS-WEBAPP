const fs = require('fs');
const path = 'src/app/components/StudentDashboardTabs/MainDashboardTab.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace("            )}\n          </TabsContent>\n", "");

fs.writeFileSync(path, content);
