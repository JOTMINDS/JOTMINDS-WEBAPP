const fs = require('fs');
let code = fs.readFileSync('src/app/components/CentralAnalyticsHub.tsx', 'utf8');

code = code.replace(
`          )}

          {/* ─── ALIGNMENT & MATCH ─── */}
          {activeTab === 'alignment' && (
            <div className="-mx-4 sm:mx-0">
              <TeacherAnalyticsComparison 
                teacherAssessments={assessments.filter(a => a.userId === user?.id)}
                studentAssessments={assessments.filter(a => a.userId !== user?.id)}
                students={students}
                teacherProfile={user!}
              />
            </div>
          )}
        </div>
      )}`,
`          )}
        </div>
      )}

      {/* ─── ALIGNMENT & MATCH ─── */}
      {activeTab === 'alignment' && (
        <div className="-mx-4 sm:mx-0">
          <TeacherAnalyticsComparison 
            teacherAssessments={assessments.filter(a => a.userId === user?.id)}
            studentAssessments={assessments.filter(a => a.userId !== user?.id)}
            students={students}
            teacherProfile={user!}
          />
        </div>
      )}`
);

fs.writeFileSync('src/app/components/CentralAnalyticsHub.tsx', code);
