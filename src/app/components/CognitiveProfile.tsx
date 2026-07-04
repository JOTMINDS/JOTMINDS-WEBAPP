import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { ArrowLeft, Brain, Download, Sparkles, TrendingUp, Target, Lightbulb, FileText, CheckCircle2, MessageSquare } from 'lucide-react';
import { getAllAssessmentResults, getUserAssessmentResults, saveReflection as saveReflectionAPI, getReflections, getUserReflections as getUserReflectionsAPI } from '../utils/api';
import { useAuth } from './AuthContext';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { FeedbackPrompt } from './FeedbackPrompt';

export interface AssessmentResult {
  id?: string;
  userId?: string;
  assessmentType: string;
  scores: Record<string, number>;
  primaryStyle?: string;
  completedAt?: string;
  results?: Record<string, number>;
}

export interface UserReflection {
  id?: string;
  userId?: string;
  reflectionText?: string;
  createdAt?: string;
  content?: string;
  type?: string;
}


interface CognitiveProfileProps {
  onBack: () => void;
}

export const CognitiveProfile: React.FC<CognitiveProfileProps> = ({ onBack }) => {
  const { impersonatedUser } = useAuth();
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [reflection, setReflection] = useState('');
  const [reflectionSaved, setReflectionSaved] = useState(false);
  const [userReflections, setUserReflections] = useState<UserReflection[]>([]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // If viewing impersonated user's profile
        if (impersonatedUser) {
          const { results } = await getUserAssessmentResults(impersonatedUser.id);
          setAssessmentResults(results || []);
        } else {
          // Regular user viewing their own profile
          const { results } = await getAllAssessmentResults();
          setAssessmentResults(results || []);
        }
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [impersonatedUser]);

  useEffect(() => {
    const fetchReflections = async () => {
      try {
        // If viewing impersonated user's profile
        if (impersonatedUser) {
          const { reflections } = await getUserReflectionsAPI(impersonatedUser.id);
          setUserReflections(reflections || []);
        } else {
          // Regular user viewing their own profile
          const { reflections } = await getReflections();
          setUserReflections(reflections || []);
        }
      } catch (error) {
        console.error('Error fetching reflections:', error);
      }
    };

    fetchReflections();
  }, [impersonatedUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#5B7DB1' }}></div>
          <p>Loading cognitive profile...</p>
        </div>
      </div>
    );
  }

  const learningResult = assessmentResults.find(r => r.assessmentType === 'learning');
  const thinkingResult = assessmentResults.find(r => r.assessmentType === 'thinking');
  const decisionResult = assessmentResults.find(r => r.assessmentType === 'decision');

  // Check if we have any results
  const hasResults = learningResult || thinkingResult || decisionResult;

  if (!hasResults) {
    return (
      <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(to bottom, #F8F9FA 0%, #FFFFFF 100%)' }}>
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {impersonatedUser ? 'Back to Admin Dashboard' : 'Back to Dashboard'}
          </Button>
          
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>No Assessment Results Found</CardTitle>
              <CardDescription>Complete at least one assessment to view your cognitive profile.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8" style={{ color: '#6B7280' }}>
                Take an assessment from your dashboard to start building your cognitive profile.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Prepare data for radar chart - collect all unique styles
  const allStyles = new Set<string>();
  [learningResult, thinkingResult, decisionResult].forEach(result => {
    if (result?.results) {
      Object.keys(result.results).forEach(styleName => allStyles.add(styleName));
    }
  });

  // Create radar data with proper structure - use "dimension" instead of "subject" or "style"
  const radarData = Array.from(allStyles).map(styleName => {
    const dataPoint: Record<string, string | number> = {
      dimension: styleName, // Use "dimension" as the key - safe word that won't conflict
    };
    
    // Add scores for each assessment type
    if (learningResult?.results) {
      dataPoint.learning = Number(learningResult.results[styleName] || 0);
    }
    if (thinkingResult?.results) {
      dataPoint.thinking = Number(thinkingResult.results[styleName] || 0);
    }
    if (decisionResult?.results) {
      dataPoint.decision = Number(decisionResult.results[styleName] || 0);
    }
    
    return dataPoint;
  }).filter(item => item.dimension); // Ensure we have valid dimension names

  console.log('[CognitiveProfile] Radar Data:', radarData);

  // Get dominant style for each assessment type
  const getDominantStyle = (results: Record<string, number>) => {
    if (!results || Object.keys(results).length === 0) {
      return { styleName: 'N/A', percentage: 0 };
    }
    const entries = Object.entries(results).sort((a: [string, number], b: [string, number]) => b[1] - a[1]);
    return {
      styleName: entries[0]?.[0] || 'N/A',
      percentage: Number(entries[0]?.[1] || 0)
    };
  };

  const learningDominant = getDominantStyle(learningResult?.results);
  const thinkingDominant = getDominantStyle(thinkingResult?.results);
  const decisionDominant = getDominantStyle(decisionResult?.results);

  const dominantStyles = [
    {
      category: 'Learning',
      styleName: learningDominant.styleName,
      percentage: learningDominant.percentage,
      color: '#5B7DB1'
    },
    {
      category: 'Thinking',
      styleName: thinkingDominant.styleName,
      percentage: thinkingDominant.percentage,
      color: '#6B4C9A'
    },
    {
      category: 'Decision',
      styleName: decisionDominant.styleName,
      percentage: decisionDominant.percentage,
      color: '#FF715B'
    }
  ];

  // Generate personalized insights
  const generateInsights = () => {
    const insights = {
      strengths: [] as string[],
      recommendations: [] as string[]
    };

    // Add insights based on dominant styles
    dominantStyles.forEach(({ category, styleName, percentage }) => {
      if (percentage > 40) {
        insights.strengths.push(`Strong ${styleName} tendencies in ${category.toLowerCase()}`);
      }
    });

    // Add generic recommendations
    if (insights.strengths.length < 3) {
      insights.recommendations.push('Complete all three assessments for a comprehensive profile');
    }
    insights.recommendations.push('Review your results regularly to track cognitive development');
    insights.recommendations.push('Explore learning resources tailored to your cognitive style');

    return insights;
  };

  const insights = generateInsights();

  console.log('[CognitiveProfile] Dominant Styles:', dominantStyles);
  console.log('[CognitiveProfile] Learning Result:', learningResult);
  console.log('[CognitiveProfile] Thinking Result:', thinkingResult);
  console.log('[CognitiveProfile] Decision Result:', decisionResult);

  const handleSaveReflection = async () => {
    try {
      await saveReflectionAPI(reflection);
      setReflectionSaved(true);
      
      // Refresh reflections
      const { reflections } = impersonatedUser 
        ? await getUserReflectionsAPI(impersonatedUser.id)
        : await getReflections();
      setUserReflections(reflections || []);
      
      // Clear the input and reset saved state after 3 seconds
      setTimeout(() => {
        setReflection('');
        setReflectionSaved(false);
      }, 2000);
    } catch (error) {
      console.error('Error saving reflection:', error);
    }
  };

  const handleExportProfile = () => {
    const userName = (impersonatedUser as any)?.user_metadata?.name || 'User';
    const exportDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    // Generate HTML content for export
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Cognitive Profile - ${userName}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #374151;
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
      background: white;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 4px solid #5B7DB1;
      padding-bottom: 20px;
    }
    .header h1 {
      color: #5B7DB1;
      font-size: 36px;
      margin: 0 0 10px 0;
    }
    .header p {
      color: #6B7280;
      font-size: 18px;
      margin: 5px 0;
    }
    .section {
      margin-bottom: 40px;
      page-break-inside: avoid;
    }
    .section-title {
      color: #5B7DB1;
      font-size: 24px;
      margin-bottom: 20px;
      border-bottom: 2px solid #E5E7EB;
      padding-bottom: 10px;
    }
    .dominant-styles {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }
    .style-card {
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      border: 2px solid;
    }
    .style-card.learning {
      background-color: #F0F0FF;
      border-color: #5B7DB1;
    }
    .style-card.thinking {
      background-color: #E0F9FF;
      border-color: #6B4C9A;
    }
    .style-card.decision {
      background-color: #FFF0EE;
      border-color: #FF715B;
    }
    .style-card h3 {
      font-size: 14px;
      color: #6B7280;
      margin: 0 0 10px 0;
    }
    .style-card p {
      font-size: 24px;
      font-weight: bold;
      margin: 0 0 10px 0;
    }
    .style-card.learning p {
      color: #5B7DB1;
    }
    .style-card.thinking p {
      color: #6B4C9A;
    }
    .style-card.decision p {
      color: #FF715B;
    }
    .style-card .percentage {
      display: inline-block;
      background: #5B7DB1;
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 14px;
    }
    .summary-box {
      background: linear-gradient(to bottom right, #FFFFFF, #F0FEFF);
      border: 2px solid #6B4C9A;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .summary-box p {
      margin: 0 0 15px 0;
      line-height: 1.8;
    }
    .insight-box {
      background-color: #F0F0FF;
      border: 1px solid #5B7DB1;
      border-radius: 8px;
      padding: 15px;
      margin-top: 15px;
    }
    .detail-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }
    .detail-card {
      border: 1px solid #E5E7EB;
      border-radius: 8px;
      overflow: hidden;
    }
    .detail-header {
      padding: 15px;
      font-weight: bold;
      font-size: 16px;
    }
    .detail-header.learning {
      background-color: #F0F0FF;
      color: #5B7DB1;
    }
    .detail-header.thinking {
      background-color: #E0F9FF;
      color: #6B4C9A;
    }
    .detail-header.decision {
      background-color: #FFF0EE;
      color: #FF715B;
    }
    .detail-body {
      padding: 15px;
    }
    .style-item {
      margin-bottom: 15px;
    }
    .style-item-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
      font-size: 14px;
    }
    .progress-bar {
      background-color: #E5E7EB;
      border-radius: 4px;
      height: 8px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      border-radius: 4px;
    }
    .progress-fill.learning {
      background-color: #5B7DB1;
    }
    .progress-fill.thinking {
      background-color: #6B4C9A;
    }
    .progress-fill.decision {
      background-color: #FF715B;
    }
    .insights-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }
    .insight-card {
      border: 2px solid;
      border-radius: 8px;
      padding: 20px;
    }
    .insight-card.strengths {
      background: linear-gradient(to bottom right, #FFFFFF, #F0FDF4);
      border-color: #BBF7D0;
    }
    .insight-card.recommendations {
      background: linear-gradient(to bottom right, #FFFFFF, #EFF6FF);
      border-color: #BFDBFE;
    }
    .insight-card h3 {
      font-size: 18px;
      margin-bottom: 15px;
    }
    .insight-card.strengths h3 {
      color: #166534;
    }
    .insight-card.recommendations h3 {
      color: #1E40AF;
    }
    .insight-card ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .insight-card li {
      margin-bottom: 10px;
      padding-left: 20px;
      position: relative;
    }
    .insight-card.strengths li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #16A34A;
      font-weight: bold;
    }
    .insight-card.recommendations li:before {
      content: "→";
      position: absolute;
      left: 0;
      color: #3B82F6;
      font-weight: bold;
    }
    .reflections-section {
      margin-top: 30px;
    }
    .reflection-item {
      background-color: #F8F9FA;
      border: 1px solid #E5E7EB;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 15px;
    }
    .reflection-date {
      color: #6B7280;
      font-size: 12px;
      margin-bottom: 8px;
    }
    .reflection-content {
      color: #374151;
      font-size: 14px;
      line-height: 1.6;
    }
    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 2px solid #E5E7EB;
      text-align: center;
      color: #6B7280;
      font-size: 14px;
    }
    @media print {
      body {
        padding: 20px;
      }
      .section {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Cognitive Profile</h1>
    <p><strong>${userName}</strong></p>
    <p>Discover How You Think</p>
    <p>Generated: ${exportDate}</p>
  </div>

  <!-- Dominant Styles -->
  <div class="section">
    <h2 class="section-title">Your Dominant Styles</h2>
    <div class="dominant-styles">
      <div class="style-card learning">
        <h3>Learning Style</h3>
        <p>${learningDominant.styleName}</p>
        <span class="percentage">${learningDominant.percentage}%</span>
      </div>
      <div class="style-card thinking">
        <h3>Thinking Style</h3>
        <p>${thinkingDominant.styleName}</p>
        <span class="percentage">${thinkingDominant.percentage}%</span>
      </div>
      <div class="style-card decision">
        <h3>Decision Style</h3>
        <p>${decisionDominant.styleName}</p>
        <span class="percentage">${decisionDominant.percentage}%</span>
      </div>
    </div>
  </div>

  <!-- Executive Summary -->
  <div class="section">
    <h2 class="section-title">Executive Summary</h2>
    <div class="summary-box">
      <p>
        ${learningResult && thinkingResult && decisionResult ? 
          `Your cognitive profile reveals a <strong>${learningDominant.styleName}</strong> learning style, 
          indicating you excel at ${learningDominant.styleName.toLowerCase()} approaches to acquiring knowledge. 
          Your thinking is characterized by a <strong>${thinkingDominant.styleName}</strong> style 
          with ${thinkingDominant.percentage}% preference, while your decision-making follows a <strong>${decisionDominant.styleName}</strong> pattern 
          at ${decisionDominant.percentage}% strength.` :
          learningResult && thinkingResult ?
          `Your cognitive profile shows a <strong>${learningDominant.styleName}</strong> learning style 
          and a <strong>${thinkingDominant.styleName}</strong> thinking pattern. 
          Complete the Decision Style assessment to get a comprehensive view of your cognitive profile.` :
          learningResult && decisionResult ?
          `Your cognitive profile demonstrates a <strong>${learningDominant.styleName}</strong> learning approach 
          and a <strong>${decisionDominant.styleName}</strong> decision-making style. 
          Complete the Thinking Style assessment to enhance your profile insights.` :
          thinkingResult && decisionResult ?
          `Your cognitive profile exhibits a <strong>${thinkingDominant.styleName}</strong> thinking style 
          and a <strong>${decisionDominant.styleName}</strong> decision-making pattern. 
          Complete the Learning Style assessment for a complete cognitive overview.` :
          learningResult ?
          `Your learning style assessment reveals a <strong>${learningDominant.styleName}</strong> preference 
          with ${learningDominant.percentage}% strength. This indicates your natural approach to acquiring and processing new information.` :
          thinkingResult ?
          `Your thinking style assessment shows a <strong>${thinkingDominant.styleName}</strong> pattern 
          with ${thinkingDominant.percentage}% preference. This reflects how you approach problem-solving and intellectual challenges.` :
          `Your decision-making style assessment indicates a <strong>${decisionDominant.styleName}</strong> approach 
          with ${decisionDominant.percentage}% strength. This shows how you process information when making choices.`
        }
      </p>
      ${learningResult && thinkingResult && decisionResult ? `
        <div class="insight-box">
          <strong>Key Insight:</strong> This unique combination of cognitive styles suggests you have a ${
            (learningDominant.percentage + thinkingDominant.percentage + decisionDominant.percentage) / 3 > 50 
              ? 'strong and well-defined' 
              : 'balanced and flexible'
          } cognitive profile. Understanding these patterns will help you optimize your learning strategies, 
          enhance your problem-solving abilities, and make more informed decisions in academic and professional settings.
        </div>
      ` : ''}
    </div>
  </div>

  <!-- Detailed Breakdown -->
  <div class="section">
    <h2 class="section-title">Detailed Style Breakdown</h2>
    <div class="detail-grid">
      ${learningResult ? `
        <div class="detail-card">
          <div class="detail-header learning">Learning Style</div>
          <div class="detail-body">
            ${Object.entries(learningResult.results)
              .sort((a, b) => b[1] - a[1])
              .map(([styleName, percentage]) => `
                <div class="style-item">
                  <div class="style-item-header">
                    <span>${styleName}</span>
                    <span>${percentage}%</span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill learning" style="width: ${percentage}%"></div>
                  </div>
                </div>
              `).join('')}
          </div>
        </div>
      ` : ''}
      
      ${thinkingResult ? `
        <div class="detail-card">
          <div class="detail-header thinking">Thinking Style</div>
          <div class="detail-body">
            ${Object.entries(thinkingResult.results)
              .sort((a, b) => b[1] - a[1])
              .map(([styleName, percentage]) => `
                <div class="style-item">
                  <div class="style-item-header">
                    <span>${styleName}</span>
                    <span>${percentage}%</span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill thinking" style="width: ${percentage}%"></div>
                  </div>
                </div>
              `).join('')}
          </div>
        </div>
      ` : ''}
      
      ${decisionResult ? `
        <div class="detail-card">
          <div class="detail-header decision">Decision Style</div>
          <div class="detail-body">
            ${Object.entries(decisionResult.results)
              .sort((a, b) => b[1] - a[1])
              .map(([styleName, percentage]) => `
                <div class="style-item">
                  <div class="style-item-header">
                    <span>${styleName}</span>
                    <span>${percentage}%</span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill decision" style="width: ${percentage}%"></div>
                  </div>
                </div>
              `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  </div>

  <!-- Insights -->
  <div class="section">
    <h2 class="section-title">Cognitive Insights</h2>
    <div class="insights-grid">
      <div class="insight-card strengths">
        <h3>Your Cognitive Strengths</h3>
        <ul>
          ${insights.strengths.length > 0 ? 
            insights.strengths.map(strength => `<li>${strength}</li>`).join('') :
            '<li style="list-style: none; padding-left: 0;"><em>Complete more assessments to reveal your cognitive strengths</em></li>'
          }
        </ul>
      </div>
      <div class="insight-card recommendations">
        <h3>Personalized Recommendations</h3>
        <ul>
          ${insights.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
      </div>
    </div>
  </div>

  ${userReflections.length > 0 ? `
    <!-- Reflections -->
    <div class="section reflections-section">
      <h2 class="section-title">Your Reflections</h2>
      ${userReflections.map(ref => `
        <div class="reflection-item">
          <div class="reflection-date">
            ${new Date(ref.createdAt).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
          <div class="reflection-content">${ref.content}</div>
        </div>
      `).join('')}
    </div>
  ` : ''}

  <div class="footer">
    <p><strong>JotMinds</strong> - Thinking Styles Assessment Platform</p>
    <p>Empowering Ghana's education system through cognitive assessment</p>
  </div>
</body>
</html>
    `;

    // Create a blob and download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeUserName = userName || 'User';
    link.download = `cognitive-profile-${safeUserName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(to bottom, #F8F9FA 0%, #FFFFFF 100%)' }}>
      <div className="max-w-7xl mx-auto">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {impersonatedUser ? 'Back to Admin Dashboard' : 'Back to Dashboard'}
        </Button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: '#F0F0FF' }}>
            <Brain className="w-8 h-8" style={{ color: '#5B7DB1' }} />
          </div>
          <h1 className="text-3xl mb-2" style={{ color: '#5B7DB1' }}>Your Cognitive Profile</h1>
          <p className="text-lg" style={{ color: '#6B7280' }}>
            Discover How You Think - A comprehensive view of your cognitive patterns
          </p>
        </div>

        {/* Dominant Styles Overview */}
        <Card className="mb-8 shadow-lg" style={{ borderTop: '4px solid #5B7DB1' }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Dominant Styles</CardTitle>
                <CardDescription>Primary cognitive patterns across all assessments</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleExportProfile}>
                <Download className="w-4 h-4 mr-2" />
                Export Profile
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {dominantStyles.map((item) => (
                <div
                  key={item.category}
                  className="p-6 rounded-lg text-center"
                  style={{ backgroundColor: `${item.color}10`, border: `2px solid ${item.color}` }}
                >
                  <p className="text-sm mb-2" style={{ color: '#6B7280' }}>{item.category} Style</p>
                  <p className="text-2xl mb-1" style={{ color: item.color }}>{item.styleName}</p>
                  <Badge style={{ backgroundColor: item.color, color: 'white' }}>{item.percentage}%</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Executive Summary */}
        <Card className="mb-8 shadow-lg border-2" style={{ borderColor: '#6B4C9A', background: 'linear-gradient(to bottom right, #FFFFFF, #F0FEFF)' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: '#5B7DB1' }}>
              <Sparkles className="h-6 w-6" style={{ color: '#6B4C9A' }} />
              Executive Summary
            </CardTitle>
            <CardDescription>Your comprehensive cognitive profile at a glance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose prose-sm max-w-none">
              <p className="text-base leading-relaxed" style={{ color: '#374151' }}>
                {learningResult && thinkingResult && decisionResult ? (
                  <>
                    Your cognitive profile reveals a <strong style={{ color: '#5B7DB1' }}>{learningDominant.styleName}</strong> learning style, 
                    indicating you excel at {learningDominant.styleName.toLowerCase()} approaches to acquiring knowledge. 
                    Your thinking is characterized by a <strong style={{ color: '#6B4C9A' }}>{thinkingDominant.styleName}</strong> style 
                    with {thinkingDominant.percentage}% preference, while your decision-making follows a <strong style={{ color: '#FF715B' }}>{decisionDominant.styleName}</strong> pattern 
                    at {decisionDominant.percentage}% strength.
                  </>
                ) : learningResult && thinkingResult ? (
                  <>
                    Your cognitive profile shows a <strong style={{ color: '#5B7DB1' }}>{learningDominant.styleName}</strong> learning style 
                    and a <strong style={{ color: '#6B4C9A' }}>{thinkingDominant.styleName}</strong> thinking pattern. 
                    Complete the Decision Style assessment to get a comprehensive view of your cognitive profile.
                  </>
                ) : learningResult && decisionResult ? (
                  <>
                    Your cognitive profile demonstrates a <strong style={{ color: '#5B7DB1' }}>{learningDominant.styleName}</strong> learning approach 
                    and a <strong style={{ color: '#FF715B' }}>{decisionDominant.styleName}</strong> decision-making style. 
                    Complete the Thinking Style assessment to enhance your profile insights.
                  </>
                ) : thinkingResult && decisionResult ? (
                  <>
                    Your cognitive profile exhibits a <strong style={{ color: '#6B4C9A' }}>{thinkingDominant.styleName}</strong> thinking style 
                    and a <strong style={{ color: '#FF715B' }}>{decisionDominant.styleName}</strong> decision-making pattern. 
                    Complete the Learning Style assessment for a complete cognitive overview.
                  </>
                ) : learningResult ? (
                  <>
                    Your learning style assessment reveals a <strong style={{ color: '#5B7DB1' }}>{learningDominant.styleName}</strong> preference 
                    with {learningDominant.percentage}% strength. This indicates your natural approach to acquiring and processing new information. 
                    Complete the Thinking and Decision Style assessments to build your comprehensive cognitive profile.
                  </>
                ) : thinkingResult ? (
                  <>
                    Your thinking style assessment shows a <strong style={{ color: '#6B4C9A' }}>{thinkingDominant.styleName}</strong> pattern 
                    with {thinkingDominant.percentage}% preference. This reflects how you approach problem-solving and intellectual challenges. 
                    Complete the Learning and Decision Style assessments for complete insights.
                  </>
                ) : (
                  <>
                    Your decision-making style assessment indicates a <strong style={{ color: '#FF715B' }}>{decisionDominant.styleName}</strong> approach 
                    with {decisionDominant.percentage}% strength. This shows how you process information when making choices. 
                    Complete the Learning and Thinking Style assessments to unlock your full cognitive profile.
                  </>
                )}
              </p>
              
              {learningResult && thinkingResult && decisionResult && (
                <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: '#F0F0FF', border: '1px solid #5B7DB1' }}>
                  <p className="text-sm" style={{ color: '#5B7DB1' }}>
                    <strong>Key Insight:</strong> This unique combination of cognitive styles suggests you have a {
                      (learningDominant.percentage + thinkingDominant.percentage + decisionDominant.percentage) / 3 > 50 
                        ? 'strong and well-defined' 
                        : 'balanced and flexible'
                    } cognitive profile. Understanding these patterns will help you optimize your learning strategies, 
                    enhance your problem-solving abilities, and make more informed decisions in academic and professional settings.
                  </p>
                </div>
              )}
            </div>

            {/* Assessment Completion Status */}
            <div className="flex items-center gap-2 pt-2">
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span style={{ color: '#6B7280' }}>Profile Completion</span>
                  <span style={{ color: '#5B7DB1' }}>
                    {[learningResult, thinkingResult, decisionResult].filter(Boolean).length} / 3 Assessments
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${([learningResult, thinkingResult, decisionResult].filter(Boolean).length / 3) * 100}%`,
                      background: 'linear-gradient(to right, #5B7DB1, #6B4C9A, #FF715B)'
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Comprehensive Radar Chart */}
          {radarData.length > 0 && (
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" style={{ color: '#6B4C9A' }} />
                  Multi-Dimensional Profile
                </CardTitle>
                <CardDescription>Compare your styles across all frameworks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#E5E7EB" />
                      <PolarAngleAxis 
                        dataKey="dimension"
                        tick={{ fill: '#666', fontSize: 12 }}
                        stroke="#999"
                      />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar 
                        name="Learning" 
                        dataKey="learning" 
                        stroke="#5B7DB1" 
                        fill="#5B7DB1" 
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                      <Radar 
                        name="Thinking" 
                        dataKey="thinking" 
                        stroke="#6B4C9A" 
                        fill="#6B4C9A" 
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                      <Radar 
                        name="Decision" 
                        dataKey="decision" 
                        stroke="#FF715B" 
                        fill="#FF715B" 
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                      <Legend />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '2px solid #6B4C9A',
                          borderRadius: '8px'
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dominant Styles Bar Chart */}
          {dominantStyles.some(s => s.percentage > 0) && (
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" style={{ color: '#5B7DB1' }} />
                  Dominant Style Strength
                </CardTitle>
                <CardDescription>Your primary style in each framework</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dominantStyles} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis 
                        type="category" 
                        dataKey="category" 
                        width={80}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '2px solid #5B7DB1',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="percentage" radius={[0, 8, 8, 0]}>
                        {dominantStyles.map((entry, index) => (
                          <rect key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Learning Style Breakdown */}
          {learningResult && (
            <Card className="shadow-md">
              <CardHeader style={{ backgroundColor: '#F0F0FF' }}>
                <CardTitle className="text-lg">Learning Style</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {Object.entries(learningResult.results)
                    .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
                    .map(([styleName, percentage]: [string, number]) => (
                      <div key={styleName}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm">{styleName}</span>
                          <span className="text-sm">{percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: '#5B7DB1'
                            }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Thinking Style Breakdown */}
          {thinkingResult && (
            <Card className="shadow-md">
              <CardHeader style={{ backgroundColor: '#E0F9FF' }}>
                <CardTitle className="text-lg">Thinking Style</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {Object.entries(thinkingResult.results)
                    .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
                    .map(([styleName, percentage]: [string, number]) => (
                      <div key={styleName}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm">{styleName}</span>
                          <span className="text-sm">{percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: '#6B4C9A'
                            }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Decision Style Breakdown */}
          {decisionResult && (
            <Card className="shadow-md">
              <CardHeader style={{ backgroundColor: '#FFF0EE' }}>
                <CardTitle className="text-lg">Decision Style</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {Object.entries(decisionResult.results)
                    .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
                    .map(([styleName, percentage]: [string, number]) => (
                      <div key={styleName}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm">{styleName}</span>
                          <span className="text-sm">{percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: '#FF715B'
                            }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Insights */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Strengths */}
          <Card className="border-2 border-green-200 bg-gradient-to-br from-white to-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900">
                <Target className="h-5 w-5 text-green-600" />
                Your Cognitive Strengths
              </CardTitle>
              <CardDescription>
                Areas where you naturally excel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {insights.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-sm text-gray-700">{strength}</span>
                  </li>
                ))}
                {insights.strengths.length === 0 && (
                  <li className="text-sm text-gray-500 italic">
                    Complete more assessments to reveal your cognitive strengths
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-white to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Lightbulb className="h-5 w-5 text-blue-600" />
                Personalized Recommendations
              </CardTitle>
              <CardDescription>
                Actionable steps to enhance your learning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {insights.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">→</span>
                    <span className="text-sm text-gray-700">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Reflections */}
        <div className="mt-8">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" style={{ color: '#5B7DB1' }} />
                Reflections
              </CardTitle>
              <CardDescription>Share your thoughts on your cognitive profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Label htmlFor="reflection" className="text-sm">Write a reflection:</Label>
                <Textarea
                  id="reflection"
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  className="w-full h-24"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveReflection}
                  disabled={reflectionSaved}
                >
                  {reflectionSaved ? (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  {reflectionSaved ? 'Saved' : 'Save Reflection'}
                </Button>
              </div>
              <div className="mt-4">
                <CardDescription>Previous Reflections:</CardDescription>
                {userReflections.length > 0 ? (
                  <ul className="space-y-3 mt-3">
                    {userReflections.map((ref, index) => (
                      <li 
                        key={ref.id || index} 
                        className="p-3 rounded-lg" 
                        style={{ backgroundColor: '#F8F9FA', border: '1px solid #E5E7EB' }}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <span className="text-xs" style={{ color: '#6B7280' }}>
                            {new Date(ref.createdAt).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="text-sm" style={{ color: '#374151' }}>{ref.content}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm mt-3" style={{ color: '#6B7280' }}>
                    No reflections yet. Write your first reflection above!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feedback Prompt */}
        <div className="mt-8">
          <FeedbackPrompt />
        </div>
      </div>
    </div>
  );
};