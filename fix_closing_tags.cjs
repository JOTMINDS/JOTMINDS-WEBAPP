const fs = require('fs');
const path = 'src/app/components/StudentDashboardTabs/MainDashboardTab.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace("</CardContent>\n              </Card>\n\n    </>\n  );\n}", "</CardContent>\n              </Card>\n            )}\n          </TabsContent>\n    </>\n  );\n}");

fs.writeFileSync(path, content);
