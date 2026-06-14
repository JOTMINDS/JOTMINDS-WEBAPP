import { motion } from 'motion/react';
import { User } from '../../types/index';
import { X, Award, Brain, Lightbulb, Target, Puzzle, Users, Star } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';

interface KidsCognitiveProfileProps {
  user: User;
  onClose: () => void;
  isParentView?: boolean; // True when viewing from parent/teacher dashboard
}

export function KidsCognitiveProfile({ user, onClose, isParentView = false }: KidsCognitiveProfileProps) {
  // Get all completed assessments
  const hasAssessment = (type: string) => {
    return user.assessmentsCompleted?.includes(type) || 
           user.assessments?.some(a => a.type === type) || 
           false;
  };

  const getAssessmentScore = (type: string) => {
    return user.assessments?.find(a => a.type === type)?.score;
  };

  // Assessment completion status
  const assessmentStatus = {
    learning: hasAssessment('kolb'),
    thinking: hasAssessment('sternberg'),
    decision: hasAssessment('dual-process'),
    problemSolving: hasAssessment('problem-solving'),
    socialThinking: hasAssessment('social-thinking')
  };

  const totalCompleted = Object.values(assessmentStatus).filter(Boolean).length;
  const totalStars = totalCompleted * 5;

  // Get Learning Style Results
  const learningScore = getAssessmentScore('kolb');
  const learningStyle = learningScore?.kolb?.dominantStyle || null;
  const learningData = learningScore?.kolb?.scores ? [
    { style: 'Active', score: learningScore.kolb.scores.active || 0 },
    { style: 'Reflective', score: learningScore.kolb.scores.reflective || 0 },
    { style: 'Sensing', score: learningScore.kolb.scores.sensing || 0 },
    { style: 'Intuitive', score: learningScore.kolb.scores.intuitive || 0 }
  ] : null;

  // Get Thinking Style Results
  const thinkingScore = getAssessmentScore('sternberg');
  const thinkingStyle = thinkingScore?.sternberg?.dominantStyle || null;
  const thinkingData = thinkingScore?.sternberg?.scores ? [
    { style: 'Creative', score: thinkingScore.sternberg.scores.creative || 0 },
    { style: 'Analytical', score: thinkingScore.sternberg.scores.analytical || 0 },
    { style: 'Practical', score: thinkingScore.sternberg.scores.practical || 0 }
  ] : null;

  // Get Decision Style Results
  const decisionScore = getAssessmentScore('dual-process');
  const decisionStyle = decisionScore?.['dual-process']?.dominantStyle || null;
  const decisionData = decisionScore?.['dual-process']?.scores ? [
    { style: 'Intuitive', score: decisionScore['dual-process'].scores.intuitive || 0 },
    { style: 'Analytical', score: decisionScore['dual-process'].scores.analytical || 0 }
  ] : null;

  // Create combined radar chart data
  const radarData = [
    {
      category: 'Creative',
      score: thinkingScore?.sternberg?.scores?.creative || 0,
      fullMark: 100
    },
    {
      category: 'Analytical',
      score: thinkingScore?.sternberg?.scores?.analytical || 0,
      fullMark: 100
    },
    {
      category: 'Practical',
      score: thinkingScore?.sternberg?.scores?.practical || 0,
      fullMark: 100
    },
    {
      category: 'Active Learning',
      score: learningScore?.kolb?.scores?.active || 0,
      fullMark: 100
    },
    {
      category: 'Reflective',
      score: learningScore?.kolb?.scores?.reflective || 0,
      fullMark: 100
    }
  ];

  // Generate insights for parents/teachers
  const generateInsights = () => {
    const insights = [];

    if (learningStyle) {
      const learningInsights = {
        'Diverging': '🎨 Learns best through imagination and group work. Encourage creative projects and collaborative activities.',
        'Assimilating': '📚 Prefers logical explanations and organized information. Provide clear structures and reading materials.',
        'Converging': '🔧 Excels with practical problem-solving. Use hands-on experiments and real-world applications.',
        'Accommodating': '🏃 Learns through hands-on experience. Incorporate movement, experimentation, and active discovery.'
      };
      insights.push({
        icon: '📚',
        title: 'Learning Style',
        result: learningStyle,
        insight: learningInsights[learningStyle as keyof typeof learningInsights] || 'Developing learning preferences.'
      });
    }

    if (thinkingStyle) {
      const thinkingInsights = {
        'creative': '💡 Thrives with open-ended questions and imaginative tasks. Encourage brainstorming and "what if" scenarios.',
        'analytical': '🔍 Excels at breaking down problems step-by-step. Provide puzzles, logic games, and structured challenges.',
        'practical': '⚙️ Learns by doing and applying knowledge. Connect lessons to real-life situations and hands-on activities.'
      };
      insights.push({
        icon: '🧠',
        title: 'Thinking Style',
        result: thinkingStyle.charAt(0).toUpperCase() + thinkingStyle.slice(1),
        insight: thinkingInsights[thinkingStyle as keyof typeof thinkingInsights] || 'Developing thinking patterns.'
      });
    }

    if (decisionStyle) {
      const decisionInsights = {
        'intuitive': '⚡ Makes quick decisions based on feelings. Help develop reflection skills while respecting their natural intuition.',
        'analytical': '⚖️ Thinks carefully before deciding. Provide time for consideration and encourage confidence in choices.',
        'balanced': '⚖️ Uses both gut feelings and careful thinking. Excellent balance! Support both approaches.'
      };
      insights.push({
        icon: '🎯',
        title: 'Decision Style',
        result: decisionStyle.charAt(0).toUpperCase() + decisionStyle.slice(1),
        insight: decisionInsights[decisionStyle as keyof typeof decisionInsights] || 'Developing decision-making skills.'
      });
    }

    return insights;
  };

  const insights = generateInsights();

  // Generate personalized tips for parents based on the child's complete profile
  const generateParentTips = () => {
    const tips = [];

    // Learning Style Tips
    if (learningStyle) {
      const learningTips = {
        'Diverging': [
          '🎨 **Creative Projects**: Set up art stations, story-writing corners, or dramatic play areas at home.',
          '👥 **Group Learning**: Arrange study groups or learning playdates with peers.',
          '💭 **Open Questions**: Ask "What do you think?" and "How would you feel?" to encourage imagination.',
          '📖 **Story-Based Learning**: Use stories and narratives to teach new concepts.'
        ],
        'Assimilating': [
          '📊 **Organize Information**: Create charts, lists, and visual organizers for homework and chores.',
          '📚 **Reading Time**: Provide books, encyclopedias, and educational videos on topics of interest.',
          '🧩 **Structured Learning**: Break down tasks into clear, logical steps.',
          '🗂️ **Note-Taking**: Teach organization skills like color-coding and bullet points.'
        ],
        'Converging': [
          '🔬 **Experiments at Home**: Try science experiments, cooking projects, or building challenges.',
          '🛠️ **Problem-Solving Games**: Provide puzzles, building sets, and strategy games.',
          '🎯 **Goal-Oriented Tasks**: Set clear objectives with practical outcomes.',
          '💡 **Real-World Connections**: Show how school subjects apply to daily life.'
        ],
        'Accommodating': [
          '🏃 **Active Learning**: Incorporate movement - math while jumping, spelling while walking.',
          '🎮 **Learning by Doing**: Hands-on activities, field trips, and interactive experiences.',
          '🎪 **Trial and Error**: Allow experimentation and learning from mistakes without judgment.',
          '🌳 **Outdoor Education**: Take learning outside - nature walks, outdoor counting, etc.'
        ]
      };
      
      const styleTips = learningTips[learningStyle as keyof typeof learningTips];
      if (styleTips) {
        tips.push({
          category: '📚 Learning Style Support',
          style: learningStyle,
          tips: styleTips
        });
      }
    }

    // Thinking Style Tips
    if (thinkingStyle) {
      const thinkingTips = {
        'creative': [
          '💭 **Encourage Imagination**: Ask open-ended questions like "What else could we do?"',
          '🎨 **Creative Freedom**: Provide materials for free expression - art supplies, building blocks, dress-up.',
          '📝 **Brainstorming Sessions**: Make lists of ideas together without judgment.',
          '🌟 **Celebrate Original Ideas**: Praise unique solutions and creative thinking.'
        ],
        'analytical': [
          '🧩 **Logic Puzzles**: Introduce Sudoku, chess, pattern games, and brain teasers.',
          '🔍 **Ask "Why?"**: Encourage questioning and explaining their reasoning.',
          '📊 **Step-by-Step Planning**: Help them break big tasks into smaller, ordered steps.',
          '🔬 **Cause and Effect**: Discuss how things work and what happens when we change variables.'
        ],
        'practical': [
          '🛠️ **Real-Life Application**: Connect learning to everyday situations - math at the store, reading recipes.',
          '👨‍🍳 **Hands-On Skills**: Teach practical skills like cooking, gardening, basic repairs.',
          '🎯 **Show the Purpose**: Explain WHY we learn things and how they\'re useful.',
          '📱 **Problem-Solving Together**: Involve them in solving real family challenges.'
        ]
      };
      
      const styleTips = thinkingTips[thinkingStyle as keyof typeof thinkingTips];
      if (styleTips) {
        tips.push({
          category: '🧠 Thinking Style Support',
          style: thinkingStyle.charAt(0).toUpperCase() + thinkingStyle.slice(1),
          tips: styleTips
        });
      }
    }

    // Decision Style Tips
    if (decisionStyle) {
      const decisionTips = {
        'intuitive': [
          '⚡ **Trust & Reflect**: "That\'s a good instinct! Let\'s also think about..."',
          '🎲 **Controlled Risk**: Provide safe opportunities to make quick choices and learn from results.',
          '⏰ **Add Pause Time**: "Let\'s take 5 minutes to think before we decide."',
          '📝 **Pros and Cons**: Gently introduce simple decision-making frameworks.'
        ],
        'analytical': [
          '⏳ **Give Thinking Time**: Don\'t rush decisions - allow time for consideration.',
          '✅ **Build Confidence**: "Your careful thinking helps you make great choices!"',
          '🎯 **Reduce Overthinking**: Set gentle time limits to prevent analysis paralysis.',
          '💪 **Celebrate Decisions**: Praise them when they make choices, not just the outcome.'
        ],
        'balanced': [
          '⚖️ **Recognize Both**: "I love how you use both your gut feeling AND careful thinking!"',
          '🎨 **Different Situations**: Discuss when quick decisions work vs. when to take time.',
          '🌟 **Role Model**: Show how you use both approaches in your own decisions.',
          '📚 **Teach Flexibility**: Help them recognize which approach fits each situation.'
        ]
      };
      
      const styleTips = decisionTips[decisionStyle as keyof typeof decisionTips];
      if (styleTips) {
        tips.push({
          category: '🎯 Decision-Making Support',
          style: decisionStyle.charAt(0).toUpperCase() + decisionStyle.slice(1),
          tips: styleTips
        });
      }
    }

    // General Tips Based on Age (6-10)
    tips.push({
      category: '🌟 General Tips for Ages 6-10',
      style: 'Universal',
      tips: [
        '💬 **Communication**: Ask about their day using specific questions: "What made you proud today?"',
        '🎉 **Celebrate Effort**: Praise hard work and progress, not just results.',
        '📱 **Limit Screen Time**: Balance digital activities with hands-on, creative, and outdoor play.',
        '😴 **Sleep & Routine**: Consistent bedtime (9-11 hours) supports learning and emotional regulation.',
        '🍎 **Healthy Habits**: Nutritious meals, water, and physical activity boost brain development.',
        '📖 **Read Together**: 20 minutes daily improves vocabulary, focus, and bonding.',
        '🎭 **Emotional Literacy**: Name feelings together - "I see you\'re frustrated. Let\'s talk about it."',
        '🤝 **Collaboration**: Let them help with decisions - builds confidence and responsibility.'
      ]
    });

    // Tips if bonus games completed
    if (assessmentStatus.problemSolving || assessmentStatus.socialThinking) {
      const bonusTips = [];
      
      if (assessmentStatus.problemSolving) {
        bonusTips.push('🧩 **Problem-Solving Champion**: Continue challenging them with age-appropriate puzzles and real-world problems.');
      }
      
      if (assessmentStatus.socialThinking) {
        bonusTips.push('👥 **Social Skills**: Encourage cooperative games, role-play, and discussions about friendship.');
      }
      
      if (bonusTips.length > 0) {
        tips.push({
          category: '🎁 Bonus Skills Development',
          style: 'Additional Strengths',
          tips: bonusTips
        });
      }
    }

    return tips;
  };

  const parentTips = generateParentTips();

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        onClick={(e) => e.stopPropagation()}
        style={{ border: '6px solid #667eea' }}
      >
        {/* Header */}
        <div 
          className="sticky top-0 z-10 px-8 py-6 rounded-t-3xl"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-4xl">
                {user.name?.charAt(0).toUpperCase() || '👤'}
              </div>
              <div>
                <h2 className="text-4xl font-black text-white">
                  {user.name}'s Brain Profile
                </h2>
                <p className="text-xl text-white/90 font-bold">
                  Age {user.age} • {totalCompleted}/5 Games Complete
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-8 h-8 text-white" />
            </button>
          </div>

          {/* Stars Progress */}
          <div className="flex items-center gap-3 mt-4 bg-white/20 rounded-2xl px-6 py-3">
            <Star className="w-8 h-8 text-yellow-300 fill-yellow-300" />
            <span className="text-2xl font-black text-white">
              {totalStars} Stars Earned!
            </span>
            <div className="flex gap-1 ml-auto">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-3xl">
                  {i < totalCompleted ? '⭐' : '☆'}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Assessment Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AssessmentCard
              icon="📚"
              title="Learning Style"
              completed={assessmentStatus.learning}
              result={learningStyle}
              color="#667eea"
            />
            <AssessmentCard
              icon="🧠"
              title="Thinking Style"
              completed={assessmentStatus.thinking}
              result={thinkingStyle ? thinkingStyle.charAt(0).toUpperCase() + thinkingStyle.slice(1) : null}
              color="#4ECDC4"
            />
            <AssessmentCard
              icon="🎯"
              title="Decision Style"
              completed={assessmentStatus.decision}
              result={decisionStyle ? decisionStyle.charAt(0).toUpperCase() + decisionStyle.slice(1) : null}
              color="#FF9800"
            />
          </div>

          {/* Bonus Games Status */}
          {(assessmentStatus.problemSolving || assessmentStatus.socialThinking) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assessmentStatus.problemSolving && (
                <AssessmentCard
                  icon="🧩"
                  title="Problem Solving"
                  completed={true}
                  result="Completed"
                  color="#9333ea"
                />
              )}
              {assessmentStatus.socialThinking && (
                <AssessmentCard
                  icon="👥"
                  title="Social Thinking"
                  completed={true}
                  result="Completed"
                  color="#ec4899"
                />
              )}
            </div>
          )}

          {/* Visual Brain Map - Radar Chart */}
          {(learningStyle || thinkingStyle) && (
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border-4 border-purple-200">
              <h3 className="text-3xl font-black text-gray-800 mb-4 flex items-center gap-2">
                <Brain className="w-8 h-8 text-purple-600" />
                Brain Strengths Map
              </h3>
              <div className="bg-white rounded-xl p-4">
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e0e0e0" />
                    <PolarAngleAxis 
                      dataKey="category" 
                      tick={{ fill: '#666', fontSize: 14, fontWeight: 'bold' }}
                    />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar 
                      name="Strengths" 
                      dataKey="score" 
                      stroke="#667eea" 
                      fill="#667eea" 
                      fillOpacity={0.6}
                      strokeWidth={3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Detailed Insights for Parents/Teachers */}
          {insights.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-3xl font-black text-gray-800 flex items-center gap-2">
                <Lightbulb className="w-8 h-8 text-yellow-500" />
                How to Support {user.name}
              </h3>
              
              {insights.map((insight, index) => (
                <motion.div
                  key={index}
                  className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border-4 border-yellow-200"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-5xl">{insight.icon}</div>
                    <div className="flex-1">
                      <h4 className="text-2xl font-black text-gray-800 mb-2">
                        {insight.title}: <span className="text-purple-600">{insight.result}</span>
                      </h4>
                      <p className="text-lg text-gray-700 leading-relaxed">
                        {insight.insight}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Learning Style Breakdown */}
          {learningData && (
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-4 border-blue-200">
              <h3 className="text-3xl font-black text-gray-800 mb-4 flex items-center gap-2">
                <Award className="w-8 h-8 text-blue-600" />
                Learning Style Details
              </h3>
              <div className="bg-white rounded-xl p-4">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={learningData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="style" tick={{ fontSize: 14, fontWeight: 'bold' }} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="score" radius={[10, 10, 0, 0]}>
                      {learningData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#667eea', '#4ECDC4', '#FFD700', '#FF9800'][index]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Thinking Style Breakdown */}
          {thinkingData && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-4 border-green-200">
              <h3 className="text-3xl font-black text-gray-800 mb-4 flex items-center gap-2">
                <Puzzle className="w-8 h-8 text-green-600" />
                Thinking Style Details
              </h3>
              <div className="bg-white rounded-xl p-4">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={thinkingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="style" tick={{ fontSize: 14, fontWeight: 'bold' }} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="score" radius={[10, 10, 0, 0]}>
                      {thinkingData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#FF6B9D', '#4ECDC4', '#FFD700'][index]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* No Assessments Yet */}
          {totalCompleted === 0 && (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border-4 border-gray-200 text-center">
              <div className="text-6xl mb-4">🎮</div>
              <h3 className="text-3xl font-black text-gray-800 mb-2">
                No Games Completed Yet
              </h3>
              <p className="text-xl text-gray-600">
                {user.name} hasn't completed any brain games yet. Encourage them to start playing!
              </p>
            </div>
          )}

          {/* Recommendations */}
          {totalCompleted > 0 && totalCompleted < 5 && (
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 border-4 border-purple-300">
              <h3 className="text-2xl font-black text-gray-800 mb-3 flex items-center gap-2">
                <Target className="w-7 h-7 text-purple-600" />
                Next Steps
              </h3>
              <ul className="space-y-2 text-lg text-gray-700">
                {!assessmentStatus.learning && (
                  <li className="flex items-center gap-2">
                    <span className="text-2xl">📚</span>
                    <span>Complete the <strong>Learning Style</strong> game to discover how {user.name} learns best</span>
                  </li>
                )}
                {!assessmentStatus.thinking && (
                  <li className="flex items-center gap-2">
                    <span className="text-2xl">🧠</span>
                    <span>Complete the <strong>Thinking Style</strong> game to understand their problem-solving approach</span>
                  </li>
                )}
                {!assessmentStatus.decision && (
                  <li className="flex items-center gap-2">
                    <span className="text-2xl">🎯</span>
                    <span>Complete the <strong>Decision Style</strong> game to see how they make choices</span>
                  </li>
                )}
                {assessmentStatus.learning && assessmentStatus.thinking && assessmentStatus.decision && (
                  <>
                    <li className="flex items-center gap-2">
                      <span className="text-2xl">🎉</span>
                      <span><strong>Great job!</strong> All 3 main games complete! Bonus games are now unlocked!</span>
                    </li>
                    {!assessmentStatus.problemSolving && (
                      <li className="flex items-center gap-2">
                        <span className="text-2xl">🧩</span>
                        <span>Try the <strong>Problem Solving</strong> bonus game</span>
                      </li>
                    )}
                    {!assessmentStatus.socialThinking && (
                      <li className="flex items-center gap-2">
                        <span className="text-2xl">👥</span>
                        <span>Try the <strong>Social Thinking</strong> bonus game</span>
                      </li>
                    )}
                  </>
                )}
              </ul>
            </div>
          )}

          {/* All Complete Celebration */}
          {totalCompleted === 5 && (
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-8 border-4 border-yellow-300 text-center">
              <div className="text-7xl mb-4">🏆</div>
              <h3 className="text-4xl font-black text-gray-800 mb-2">
                All Games Complete!
              </h3>
              <p className="text-2xl text-gray-700">
                {user.name} has completed all 5 brain games! 🎉
              </p>
              <div className="flex justify-center gap-2 mt-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-5xl">⭐</span>
                ))}
              </div>
            </div>
          )}

          {/* Parent Tips */}
          {isParentView && parentTips.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-3xl font-black text-gray-800 flex items-center gap-2">
                <Users className="w-8 h-8 text-blue-600" />
                Tips for Parents & Teachers
              </h3>
              <p className="text-lg text-gray-600 mb-4">
                Practical strategies to support {user.name}'s unique learning journey at home and school.
              </p>
              
              {parentTips.map((tipCategory, index) => (
                <motion.div
                  key={index}
                  className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border-4 border-blue-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <h4 className="text-2xl font-black text-gray-800 mb-4">
                    {tipCategory.category}
                  </h4>
                  {tipCategory.style !== 'Universal' && tipCategory.style !== 'Additional Strengths' && (
                    <p className="text-lg text-purple-600 font-bold mb-3">
                      {user.name}'s Style: {tipCategory.style}
                    </p>
                  )}
                  <ul className="space-y-3">
                    {tipCategory.tips.map((tip, tipIndex) => {
                      // Parse markdown bold **text** to HTML
                      const parsedTip = tip.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                      
                      return (
                        <motion.li
                          key={tipIndex}
                          className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 + tipIndex * 0.05 }}
                        >
                          <span className="text-2xl flex-shrink-0 mt-1">
                            {tip.includes('Creative') || tip.includes('Imagination') ? '🎨' :
                             tip.includes('Group') || tip.includes('Collaboration') ? '👥' :
                             tip.includes('Organize') || tip.includes('Structure') ? '📊' :
                             tip.includes('Reading') || tip.includes('Read') ? '📚' :
                             tip.includes('Experiment') || tip.includes('Science') ? '🔬' :
                             tip.includes('Problem') || tip.includes('Puzzle') ? '🧩' :
                             tip.includes('Active') || tip.includes('Movement') ? '🏃' :
                             tip.includes('Outdoor') ? '🌳' :
                             tip.includes('Trust') || tip.includes('Confidence') ? '💪' :
                             tip.includes('Think') || tip.includes('Time') ? '⏰' :
                             tip.includes('Communication') || tip.includes('Ask') ? '💬' :
                             tip.includes('Celebrate') || tip.includes('Praise') ? '🎉' :
                             tip.includes('Screen') || tip.includes('Digital') ? '📱' :
                             tip.includes('Sleep') || tip.includes('Routine') ? '😴' :
                             tip.includes('Healthy') || tip.includes('Nutrition') ? '🍎' :
                             tip.includes('Emotional') || tip.includes('Feelings') ? '🎭' :
                             '💡'}
                          </span>
                          <span 
                            className="text-base text-gray-700 leading-relaxed flex-1"
                            dangerouslySetInnerHTML={{ __html: parsedTip }}
                          />
                        </motion.li>
                      );
                    })}
                  </ul>
                </motion.div>
              ))}

              {/* Important Note */}
              <motion.div
                className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 border-4 border-pink-200"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: parentTips.length * 0.1 }}
              >
                <div className="flex items-start gap-4">
                  <span className="text-5xl">💖</span>
                  <div className="flex-1">
                    <h4 className="text-2xl font-black text-gray-800 mb-2">
                      Remember: Every Child is Unique
                    </h4>
                    <p className="text-lg text-gray-700 leading-relaxed">
                      These tips are personalized to {user.name}'s cognitive profile, but every child develops at their own pace. 
                      Use these as starting points and adjust based on what works best for your child. 
                      Celebrate their progress, not perfection! 🌟
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-8 py-6 rounded-b-3xl border-t-4 border-gray-200">
          <button
            onClick={onClose}
            className="w-full py-4 rounded-2xl text-2xl font-black text-white transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
          >
            {isParentView ? 'Close Profile' : 'Back to Kids Mode'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

interface AssessmentCardProps {
  icon: string;
  title: string;
  completed: boolean;
  result: string | null;
  color: string;
}

function AssessmentCard({ icon, title, completed, result, color }: AssessmentCardProps) {
  return (
    <div 
      className="rounded-2xl p-4 border-4 relative overflow-hidden"
      style={{
        background: completed 
          ? `linear-gradient(135deg, ${color}22 0%, ${color}44 100%)`
          : 'linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)',
        borderColor: completed ? color : '#ccc'
      }}
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="text-4xl">{icon}</span>
        <h4 className="text-xl font-black text-gray-800">{title}</h4>
      </div>
      
      {completed ? (
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✅</span>
            <span className="text-lg font-bold text-gray-700">{result || 'Completed'}</span>
          </div>
        </div>
      ) : (
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⏳</span>
            <span className="text-lg font-bold text-gray-500">Not started</span>
          </div>
        </div>
      )}

      {/* Checkmark overlay for completed */}
      {completed && (
        <div className="absolute top-2 right-2 text-3xl">
          ✅
        </div>
      )}
    </div>
  );
}