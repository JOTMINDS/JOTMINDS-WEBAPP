import { useMemo, useState } from 'react';
import { User } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Brain, Lightbulb, Scale, BookOpen, Info, TrendingUp, Users, AlertCircle, Search, ChevronRight, Zap } from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { getAssessmentsByUserId } from '../utils/storage';
import { axisDescriptions, teachingStyleProfiles } from '../utils/teachingStyleData';
import { ScrollArea } from './ui/scroll-area';

interface SchoolInsightsProps {
  professionals: User[];
  organizationName: string;
  isSchool?: boolean;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];

export function SchoolInsights({ professionals, organizationName, isSchool = true }: SchoolInsightsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProfile, setFilterProfile] = useState("All");

  const stats = useMemo(() => {
    const kolbDistribution: Record<string, number> = {};
    const sternbergDistribution: Record<string, number> = {};
    const dualProcessDistribution: Record<string, number> = {};
    const teachingStyleDistribution: Record<string, number> = {};
    const teachingAxesTotals = {
        authority: 0, knowledge: 0, motivation: 0, assessment: 0, adaptability: 0, climate: 0, count: 0
    };
    
    let totalKolb = 0;
    let totalSternberg = 0;
    let totalDual = 0;
    let totalTeaching = 0;

    // Processed list of professionals with their teaching style data
    const processedProfessionals = professionals.map(prof => {
        const assessments = prof.assessments || getAssessmentsByUserId(prof.id);
        const teachingAssessment = assessments.find(a => a.type === 'teaching-style' && a.completedAt);
        const sternbergAssessment = assessments.find(a => a.type === 'sternberg' && a.completedAt);
        
        let teachingData = null;
        if (teachingAssessment?.score?.['teaching-style']) {
            teachingData = teachingAssessment.score['teaching-style'];
        }

        let sternbergData = null;
        if (sternbergAssessment?.score?.sternberg) {
            sternbergData = sternbergAssessment.score.sternberg;
        }

        return {
            ...prof,
            teachingData,
            sternbergData,
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
        } else if (assessment.type === 'teaching-style' && assessment.score['teaching-style']) {
            const score = assessment.score['teaching-style'];
            teachingStyleDistribution[score.primaryStyle] = (teachingStyleDistribution[score.primaryStyle] || 0) + 1;
            totalTeaching++;
            
            teachingAxesTotals.authority += score.scores.axisAuthority;
            teachingAxesTotals.knowledge += score.scores.axisKnowledge;
            teachingAxesTotals.motivation += score.scores.axisMotivation;
            teachingAxesTotals.assessment += score.scores.axisAssessment;
            teachingAxesTotals.adaptability += score.scores.axisAdaptability;
            teachingAxesTotals.climate += score.scores.axisClimate;
            teachingAxesTotals.count++;
        }
      });
    });

    const averageAxes = teachingAxesTotals.count > 0 ? [
        { subject: 'Authority', A: Math.round(teachingAxesTotals.authority / teachingAxesTotals.count), fullMark: 100 },
        { subject: 'Knowledge', A: Math.round(teachingAxesTotals.knowledge / teachingAxesTotals.count), fullMark: 100 },
        { subject: 'Motivation', A: Math.round(teachingAxesTotals.motivation / teachingAxesTotals.count), fullMark: 100 },
        { subject: 'Assessment', A: Math.round(teachingAxesTotals.assessment / teachingAxesTotals.count), fullMark: 100 },
        { subject: 'Adaptability', A: Math.round(teachingAxesTotals.adaptability / teachingAxesTotals.count), fullMark: 100 },
        { subject: 'Climate', A: Math.round(teachingAxesTotals.climate / teachingAxesTotals.count), fullMark: 100 },
    ] : [];

    const sortedTeachingStyles = Object.entries(teachingStyleDistribution)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    const sortedSternbergStyles = Object.entries(sternbergDistribution)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    // Insights Generator
    const generateInsights = () => {
        if (isSchool) {
            if (teachingAxesTotals.count === 0) return [];
            
            const dominantProfile = sortedTeachingStyles[0]?.name;
            const lowestAxis = [...averageAxes].sort((a, b) => a.A - b.A)[0];
            const highestAxis = [...averageAxes].sort((a, b) => b.A - a.A)[0];

            return [
                {
                    title: "Dominant Style",
                    desc: `Your faculty leans towards "${dominantProfile}", indicating a strong culture of ${dominantProfile === 'Structured Educator' ? 'organization and clarity' : 'student engagement'}.`,
                    icon: <Users className="h-5 w-5 text-blue-500" />
                },
                {
                    title: "Key Strength",
                    desc: `The school excels in "${highestAxis.subject}" (${highestAxis.A}%), showing high capability in ${axisDescriptions[`axis${highestAxis.subject}` as keyof typeof axisDescriptions]?.title || 'this area'}.`,
                    icon: <TrendingUp className="h-5 w-5 text-green-500" />
                },
                {
                    title: "Growth Area",
                    desc: `Scores for "${lowestAxis.subject}" are lower (${lowestAxis.A}%). Consider professional development focused on ${lowestAxis.subject === 'Adaptability' ? 'flexible teaching strategies' : 'student autonomy'}.`,
                    icon: <AlertCircle className="h-5 w-5 text-amber-500" />
                }
            ];
        } else {
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
        }
    };

    return {
      kolb: Object.entries(kolbDistribution).map(([name, value]) => ({ name, value })),
      sternberg: sortedSternbergStyles,
      dualProcess: Object.entries(dualProcessDistribution).map(([name, value]) => ({ name, value })),
      teachingStyle: sortedTeachingStyles,
      averageAxes,
      insights: generateInsights(),
      processedProfessionals,
      totals: { kolb: totalKolb, sternberg: totalSternberg, dual: totalDual, teaching: totalTeaching }
    };
  }, [professionals]);

  // Filtering for the Faculty List
  const filteredProfessionals = stats.processedProfessionals.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProfile = filterProfile === "All" || p.teachingData?.primaryStyle === filterProfile;
    const hasTeachingData = !!p.teachingData; // Only show teachers with data in this specific list? Or all? 
    // Let's show all but highlight missing data
    return matchesSearch && matchesProfile;
  });

  if (professionals.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>No Data Available</AlertTitle>
        <AlertDescription>
          Invite {isSchool ? 'teachers' : 'members'} to your organization to see aggregated insights here.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* High Level Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isSchool ? "Total Faculty" : "Total Team Members"}
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
                {isSchool 
                  ? (stats.totals.teaching > 0 ? Math.round((stats.totals.teaching / professionals.length) * 100) : 0)
                  : (stats.totals.sternberg > 0 ? Math.round((stats.totals.sternberg / professionals.length) * 100) : 0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {professionals.length - (isSchool ? stats.totals.teaching : stats.totals.sternberg)} pending completion
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isSchool ? "Dominant Style" : "Dominant Thinking Style"}
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">
                {isSchool ? (stats.teachingStyle[0]?.name || "N/A") : (stats.sternberg[0]?.name || "N/A")}
            </div>
            <p className="text-xs text-muted-foreground">
                {isSchool 
                  ? (stats.totals.teaching > 0 ? Math.round((stats.teachingStyle[0]?.value / stats.totals.teaching) * 100) : 0)
                  : (stats.totals.sternberg > 0 ? Math.round((stats.sternberg[0]?.value / stats.totals.sternberg) * 100) : 0)}% of {isSchool ? 'staff' : 'team'}
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
                {isSchool 
                  ? (stats.teachingStyle.length > 3 ? "High" : "Moderate")
                  : (stats.sternberg.length > 3 ? "High" : "Moderate")}
            </div>
            <p className="text-xs text-muted-foreground">
                {isSchool ? "Balanced across 6 axes" : "Balanced across thinking styles"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue={isSchool ? "teaching" : "thinking"} className="space-y-4">
        <TabsList className="bg-white/50 p-1 border shadow-sm w-full md:w-auto grid grid-cols-2 md:flex h-auto">
          {isSchool && <TabsTrigger value="teaching" className="data-[state=active]:bg-white data-[state=active]:shadow-sm py-2">Teaching Styles</TabsTrigger>}
          <TabsTrigger value="thinking" className="data-[state=active]:bg-white data-[state=active]:shadow-sm py-2">Cognitive Styles</TabsTrigger>
          <TabsTrigger value="learning" className="data-[state=active]:bg-white data-[state=active]:shadow-sm py-2">Learning Approaches</TabsTrigger>
          <TabsTrigger value="decision" className="data-[state=active]:bg-white data-[state=active]:shadow-sm py-2">Decision Making</TabsTrigger>
        </TabsList>

        {isSchool && (
        <TabsContent value="teaching" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Main Chart: Aggregate Radar */}
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>School Aggregate Profile</CardTitle>
                <CardDescription>
                  Average cognitive axes across all {stats.totals.teaching} assessed faculty members.
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                 {stats.averageAxes.length > 0 ? (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={stats.averageAxes}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="subject" />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} />
                            <Radar
                                name="School Average"
                                dataKey="A"
                                stroke="#8884d8"
                                fill="#8884d8"
                                fillOpacity={0.6}
                            />
                            <Tooltip />
                        </RadarChart>
                    </ResponsiveContainer>
                  </div>
                 ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                        Not enough data to generate aggregate profile.
                    </div>
                 )}
              </CardContent>
            </Card>

            {/* Insights Panel */}
            <Card className="col-span-3">
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
                            Insights will appear once more faculty complete assessments.
                        </div>
                    )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Faculty Directory Section */}
          <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div>
                        <CardTitle>Faculty Directory</CardTitle>
                        <CardDescription>
                            View individual teaching style results.
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search faculty..." 
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
                            {Object.keys(teachingStyleProfiles).map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[400px]">
                    <div className="divide-y">
                        {filteredProfessionals.map((teacher) => (
                            <div key={teacher.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                        {teacher.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                    </div>
                                    <div>
                                        <p className="font-medium leading-none">{teacher.name}</p>
                                        <p className="text-sm text-muted-foreground mt-1">{teacher.position || 'Teacher'} • {teacher.email}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-6">
                                    <div className="hidden md:block text-right">
                                        {teacher.teachingData ? (
                                            <>
                                                <p className="text-sm font-medium text-primary">{teacher.teachingData.primaryStyle}</p>
                                                <p className="text-xs text-muted-foreground">Active Profile</p>
                                            </>
                                        ) : (
                                            <p className="text-sm text-muted-foreground italic">Pending Assessment</p>
                                        )}
                                    </div>
                                    <Button size="sm" variant="ghost" disabled={!teacher.teachingData}>
                                        View Report <ChevronRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {filteredProfessionals.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                No teachers found matching your criteria.
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
          </Card>

          {/* Style Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Teaching Style Distribution</CardTitle>
              <CardDescription>
                 Breakdown of dominant teaching styles across faculty.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.teachingStyle.length > 0 ? (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={stats.teachingStyle}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={150} tick={{fontSize: 12}} />
                        <Tooltip 
                            cursor={{fill: 'transparent'}}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]}>
                            {stats.teachingStyle.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  No teaching style data available yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        )}

        {/* Keeping existing tabs (thinking, learning, decision) with their original content */}
        <TabsContent value="thinking" className="space-y-4">
          <Card>
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
        </TabsContent>

        <TabsContent value="learning" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                {isSchool ? "Learning & Teaching Styles (Kolb)" : "Learning Styles (Kolb)"}
              </CardTitle>
              <CardDescription>
                {isSchool 
                  ? "How your teachers process information (Learning Style) often influences how they teach."
                  : "How your team members process information and learn new skills."}
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
                      <Bar dataKey="value" fill="#82ca9d" name={isSchool ? "Number of Teachers" : "Number of Team Members"}>
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
