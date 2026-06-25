import { useMemo, useState } from 'react';
import { User } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Brain, Lightbulb, Scale, BookOpen, Info, TrendingUp, Users, Search, ChevronRight, Zap } from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { getAssessmentsByUserId } from '../utils/storage';
import { ScrollArea } from './ui/scroll-area';
import { TeamSynergy } from './TeamSynergy';

interface OrganizationInsightsProps {
  professionals: User[];
  organizationName: string;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];

export function OrganizationInsights({ professionals, organizationName }: OrganizationInsightsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProfile, setFilterProfile] = useState("All");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");

  const departments = Array.from(new Set(professionals.map(p => p.department).filter(Boolean))) as string[];

  const stats = useMemo(() => {
    const kolbDistribution: Record<string, number> = {};
    const sternbergDistribution: Record<string, number> = {};
    const dualProcessDistribution: Record<string, number> = {};
    
    let totalKolb = 0;
    let totalSternberg = 0;
    let totalDual = 0;

    // Processed list of professionals with their assessment data
    const processedProfessionals = professionals
      .filter(prof => selectedDepartment === 'all' || prof.department === selectedDepartment)
      .map(prof => {
        const assessments = prof.assessments || getAssessmentsByUserId(prof.id);
        const sternbergAssessment = assessments.find(a => a.type === 'sternberg' && a.completedAt);
        const kolbAssessment = assessments.find(a => a.type === 'kolb' && a.completedAt);
        const dualProcessAssessment = assessments.find(a => a.type === 'dual-process' && a.completedAt);
        
        let sternbergData = null;
        if (sternbergAssessment?.score?.sternberg) {
            sternbergData = sternbergAssessment.score.sternberg;
        }

        return {
            ...prof,
            sternbergData,
            kolbData: kolbAssessment?.score?.kolb || null,
            dualProcessData: dualProcessAssessment?.score?.dualProcess || null,
            assessments
        };
    });

    processedProfessionals.forEach(prof => {
      prof.assessments.forEach(assessment => {
        if (!assessment.completedAt || !assessment.score) return;

        if (assessment.type === 'kolb' && assessment.score.kolb) {
          const style = assessment.score.kolb.style;
          kolbDistribution[style] = (kolbDistribution[style] || 0) + 1;
          totalKolb++;
        } else if (assessment.type === 'sternberg' && assessment.score.sternberg) {
          const style = assessment.score.sternberg.style;
          sternbergDistribution[style] = (sternbergDistribution[style] || 0) + 1;
          totalSternberg++;
        } else if (assessment.type === 'dual-process' && assessment.score.dualProcess) {
          const style = assessment.score.dualProcess.style;
          dualProcessDistribution[style] = (dualProcessDistribution[style] || 0) + 1;
          totalDual++;
        }
      });
    });

    const sortedSternbergStyles = Object.entries(sternbergDistribution)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    // Insights Generator
    const generateInsights = () => {
        if (totalSternberg === 0) return [];
        
        const dominantProfile = sortedSternbergStyles[0]?.name;
        
        return [
            {
                title: "Dominant Thinking Style",
                desc: `Your team leans towards "${dominantProfile}" thinking, which is excellent for ${dominantProfile === 'Analytical' ? 'problem-solving and evaluation' : dominantProfile === 'Creative' ? 'innovation and ideation' : 'execution and real-world application'}.`,
                icon: <Users className="h-5 w-5 text-blue-500" />
            },
            {
                title: "Cognitive Diversity",
                desc: `Having a mix of analytical, creative, and practical thinkers ensures robust problem-solving from multiple angles.`,
                icon: <TrendingUp className="h-5 w-5 text-green-500" />
            }
        ];
    };

    return {
      kolb: Object.entries(kolbDistribution).map(([name, value]) => ({ name, value })),
      sternberg: sortedSternbergStyles,
      dualProcess: Object.entries(dualProcessDistribution).map(([name, value]) => ({ name, value })),
      insights: generateInsights(),
      processedProfessionals,
      totals: { kolb: totalKolb, sternberg: totalSternberg, dual: totalDual }
    };
  }, [professionals, selectedDepartment]);

  // Filtering for the Member List
  const filteredList = stats.processedProfessionals.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.position?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProfile = filterProfile === "All" || p.sternbergData?.style === filterProfile;
    return matchesSearch && matchesProfile;
  });

  if (professionals.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>No Data Available</AlertTitle>
        <AlertDescription>
          Invite members to your organization to see aggregated insights here.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {departments.length > 0 && (
        <div className="flex justify-end">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-3 py-2 bg-white border rounded-md text-sm dark:bg-gray-900 shadow-sm"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      )}

      {/* High Level Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Team Members
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{professionals.length}</div>
            <p className="text-xs text-muted-foreground">
              Registered members
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Assessment Completion
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
                {stats.totals.sternberg > 0 ? Math.round((stats.totals.sternberg / professionals.length) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {professionals.length - stats.totals.sternberg} pending completion
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Dominant Thinking Style
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">
                {stats.sternberg[0]?.name || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
                {stats.totals.sternberg > 0 ? Math.round((stats.sternberg[0]?.value / stats.totals.sternberg) * 100) : 0}% of team
            </p>
          </CardContent>
        </Card>
        <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cognitive Diversity</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
                {stats.sternberg.length > 2 ? "High" : "Moderate"}
            </div>
            <p className="text-xs text-muted-foreground">
                Balanced across thinking styles
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="thinking" className="space-y-4">
        <TabsList className="bg-white/50 p-1 border shadow-sm w-full md:w-auto grid grid-cols-2 md:flex h-auto">
          <TabsTrigger value="thinking" className="data-[state=active]:bg-white data-[state=active]:shadow-sm py-2">Cognitive Styles</TabsTrigger>
          <TabsTrigger value="learning" className="data-[state=active]:bg-white data-[state=active]:shadow-sm py-2">Learning Approaches</TabsTrigger>
          <TabsTrigger value="decision" className="data-[state=active]:bg-white data-[state=active]:shadow-sm py-2">Decision Making</TabsTrigger>
          <TabsTrigger value="synergy" className="data-[state=active]:bg-white data-[state=active]:shadow-sm py-2">Team Synergy</TabsTrigger>
        </TabsList>

        <TabsContent value="synergy" className="mt-6">
          <TeamSynergy professionals={stats.processedProfessionals} />
        </TabsContent>

        <TabsContent value="thinking" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Insights Panel */}
            <Card className="col-span-7 md:col-span-3">
              <CardHeader>
                <CardTitle>Strategic Insights</CardTitle>
                <CardDescription>
                  AI-driven observations based on current data.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                    {stats.insights.length > 0 ? stats.insights.map((insight, idx) => (
                        <div key={idx} className="flex gap-4">
                            <div className="mt-1 bg-muted p-2 rounded-full h-fit">
                                {insight.icon}
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm">{insight.title}</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {insight.desc}
                                </p>
                            </div>
                        </div>
                    )) : (
                        <div className="text-muted-foreground text-center py-8">
                            Insights will appear once more team members complete assessments.
                        </div>
                    )}
                </div>
              </CardContent>
            </Card>

            {/* Sternberg Chart */}
            <Card className="col-span-7 md:col-span-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-indigo-600" />
                  Cognitive Style Distribution (Sternberg)
                </CardTitle>
                <CardDescription>
                  Breakdown of Analytical, Creative, and Practical thinking styles.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats.sternberg.length > 0 ? (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.sternberg}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {stats.sternberg.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                    No data available yet
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Member Directory Section */}
          <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div>
                        <CardTitle>Team Directory</CardTitle>
                        <CardDescription>
                            View individual cognitive style results.
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search members..." 
                                className="pl-8 w-[200px]" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select 
                            className="h-10 w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={filterProfile}
                            onChange={(e) => setFilterProfile(e.target.value)}
                        >
                            <option value="All">All Styles</option>
                            <option value="Analytical">Analytical</option>
                            <option value="Creative">Creative</option>
                            <option value="Practical">Practical</option>
                        </select>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[400px]">
                    <div className="divide-y">
                        {filteredProfessionals.map((member) => (
                            <div key={member.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                        {member.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                    </div>
                                    <div>
                                        <p className="font-medium leading-none">{member.name}</p>
                                        <p className="text-sm text-muted-foreground mt-1">{member.position || 'Member'} • {member.email}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-6">
                                    <div className="hidden md:block text-right">
                                        {member.sternbergData ? (
                                            <>
                                                <p className="text-sm font-medium text-primary">{member.sternbergData.style}</p>
                                                <p className="text-xs text-muted-foreground">Active Profile</p>
                                            </>
                                        ) : (
                                            <p className="text-sm text-muted-foreground italic">Pending Assessment</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {filteredProfessionals.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                No members found matching your criteria.
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="learning" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                Learning Styles (Kolb)
              </CardTitle>
              <CardDescription>
                How your team members process information and learn new skills.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.kolb.length > 0 ? (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.kolb}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#82ca9d" name="Number of Team Members">
                        {stats.kolb.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                 <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  No data available yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="decision" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-blue-600" />
                Decision Making Patterns (Dual Process)
              </CardTitle>
              <CardDescription>
                Understanding the balance between Intuitive and Reflective decision making.
              </CardDescription>
            </CardHeader>
            <CardContent>
               {stats.dualProcess.length > 0 ? (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.dualProcess}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                         {stats.dualProcess.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                 <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  No data available yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
