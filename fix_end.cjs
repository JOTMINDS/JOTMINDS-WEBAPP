const fs = require('fs');
const path = 'src/app/components/StudentDashboardTabs/MainDashboardTab.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `            </CardContent>
              </Card>
    </>
  );
}
            )}
          </TabsContent>`;

const replacement = `            </CardContent>
              </Card>
            )}
          </TabsContent>
    </>
  );
}`;

content = content.replace(target, replacement);
fs.writeFileSync(path, content);
