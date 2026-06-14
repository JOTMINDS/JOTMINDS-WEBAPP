import { GraduationCap, BookOpen, Briefcase } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface GhanaEducationGuidanceProps {
  cognitiveStyle: string;
  assessmentType: string;
}

interface EducationPathway {
  level: 'SHS' | 'Tertiary';
  program: string;
  description: string;
  whyRecommended: string;
  keySubjects?: string[];
}

export function GhanaEducationGuidance({ cognitiveStyle, assessmentType }: GhanaEducationGuidanceProps) {
  const getEducationPathways = (): EducationPathway[] => {
    const pathways: EducationPathway[] = [];

    // Kolb Learning Styles
    if (assessmentType === 'kolb') {
      switch (cognitiveStyle.toLowerCase()) {
        case 'diverging':
          pathways.push(
            {
              level: 'SHS',
              program: 'General Arts',
              description: 'Focus on humanities, social sciences, and languages',
              whyRecommended: 'Your reflective, people-centered approach thrives in subjects exploring human behavior and society',
              keySubjects: ['Literature', 'Economics', 'Geography', 'French', 'Government']
            },
            {
              level: 'Tertiary',
              program: 'Psychology',
              description: 'University of Ghana, KNUST, or UCC',
              whyRecommended: 'Perfect for your empathetic, reflective nature and interest in understanding diverse perspectives'
            },
            {
              level: 'Tertiary',
              program: 'Social Work',
              description: 'University of Ghana School of Social Work',
              whyRecommended: 'Aligns with your ability to see situations from multiple angles and help others'
            },
            {
              level: 'Tertiary',
              program: 'Communication Studies',
              description: 'Various universities including UG, GIMPA',
              whyRecommended: 'Leverages your observational skills and ability to understand different viewpoints'
            }
          );
          break;

        case 'assimilating':
          pathways.push(
            {
              level: 'SHS',
              program: 'General Science',
              description: 'Focus on pure sciences and mathematics',
              whyRecommended: 'Your logical, theoretical approach excels in structured scientific learning',
              keySubjects: ['Physics', 'Chemistry', 'Biology', 'Elective Mathematics']
            },
            {
              level: 'SHS',
              program: 'Business (Accounting Option)',
              description: 'Business subjects with accounting focus',
              whyRecommended: 'Systematic thinking suits structured business and accounting principles',
              keySubjects: ['Financial Accounting', 'Cost Accounting', 'Business Management', 'Economics']
            },
            {
              level: 'Tertiary',
              program: 'Computer Science',
              description: 'KNUST, UG, Ashesi, Academic City, GTUC',
              whyRecommended: 'Logical thinking and love for organized systems suit programming and algorithms'
            },
            {
              level: 'Tertiary',
              program: 'Mathematics',
              description: 'KNUST, UG, UCC',
              whyRecommended: 'Your abstract thinking and logical analysis are ideal for pure and applied mathematics'
            },
            {
              level: 'Tertiary',
              program: 'Pharmacy',
              description: 'KNUST College of Health Sciences',
              whyRecommended: 'Combines systematic learning with scientific precision'
            }
          );
          break;

        case 'converging':
          pathways.push(
            {
              level: 'SHS',
              program: 'General Science',
              description: 'Science track with practical applications focus',
              whyRecommended: 'Your hands-on, problem-solving nature thrives in applied sciences',
              keySubjects: ['Physics', 'Chemistry', 'Elective Mathematics', 'Technical subjects']
            },
            {
              level: 'Tertiary',
              program: 'Engineering (All branches)',
              description: 'KNUST, UG, AAMUSTED, Takoradi Technical University',
              whyRecommended: 'Perfect for your practical problem-solving and technical application skills'
            },
            {
              level: 'Tertiary',
              program: 'Computer Engineering',
              description: 'KNUST, Ashesi, Academic City',
              whyRecommended: 'Combines technical knowledge with practical application - ideal for your style'
            },
            {
              level: 'Tertiary',
              program: 'Medical Laboratory Science',
              description: 'KNUST, UG, UCC, UDS',
              whyRecommended: 'Hands-on laboratory work with precise technical application'
            }
          );
          break;

        case 'accommodating':
          pathways.push(
            {
              level: 'SHS',
              program: 'Business',
              description: 'Focus on entrepreneurship and management',
              whyRecommended: 'Your adaptable, action-oriented nature suits dynamic business environments',
              keySubjects: ['Business Management', 'Economics', 'Principles of Costing', 'Financial Accounting']
            },
            {
              level: 'SHS',
              program: 'Visual Arts',
              description: 'Creative and practical arts track',
              whyRecommended: 'Freedom to experiment and hands-on creation align with your learning style',
              keySubjects: ['Graphic Design', 'General Knowledge in Art', 'Picture Making']
            },
            {
              level: 'Tertiary',
              program: 'Nursing',
              description: 'University of Ghana, KNUST, UCC, UDS',
              whyRecommended: 'Direct patient care and adaptability in dynamic healthcare environments'
            },
            {
              level: 'Tertiary',
              program: 'Hospitality Management',
              description: 'GIMPA, Takoradi Technical University, Various polytechnics',
              whyRecommended: 'Dynamic, people-focused work requiring quick adaptation'
            },
            {
              level: 'Tertiary',
              program: 'Marketing',
              description: 'GIMPA, University of Ghana Business School',
              whyRecommended: 'Fast-paced, people-oriented field requiring flexibility and initiative'
            }
          );
          break;

        default:
          return getDefaultPathways();
      }
    }

    // Sternberg Thinking Styles
    if (assessmentType === 'sternberg') {
      switch (cognitiveStyle.toLowerCase()) {
        case 'analytical':
          pathways.push(
            {
              level: 'SHS',
              program: 'General Science',
              description: 'Strong foundation in analytical subjects',
              whyRecommended: 'Your critical thinking and analytical skills excel in scientific reasoning',
              keySubjects: ['Physics', 'Chemistry', 'Elective Mathematics', 'Biology']
            },
            {
              level: 'Tertiary',
              program: 'Medicine (MBChB)',
              description: 'UG Medical School, KNUST SMS, UHAS',
              whyRecommended: 'Diagnostic reasoning and analytical problem-solving are central to medicine'
            },
            {
              level: 'Tertiary',
              program: 'Law (LLB)',
              description: 'University of Ghana, KNUST, CU',
              whyRecommended: 'Legal reasoning, case analysis, and argumentation suit your analytical mind'
            },
            {
              level: 'Tertiary',
              program: 'Finance',
              description: 'University of Ghana Business School, GIMPA',
              whyRecommended: 'Financial analysis and modeling require strong analytical thinking'
            }
          );
          break;

        case 'creative':
          pathways.push(
            {
              level: 'SHS',
              program: 'Visual Arts',
              description: 'Focus on creative expression and design',
              whyRecommended: 'Your innovative thinking thrives in creative, open-ended environments',
              keySubjects: ['Graphic Design', 'General Knowledge in Art', 'Sculpture']
            },
            {
              level: 'SHS',
              program: 'General Arts',
              description: 'With focus on creative subjects',
              whyRecommended: 'Literature and creative writing suit your imaginative approach',
              keySubjects: ['Literature', 'French', 'Creative writing options']
            },
            {
              level: 'Tertiary',
              program: 'Graphic Design',
              description: 'KNUST Department of Industrial Art, Accra Technical University',
              whyRecommended: 'Direct channel for creative visual expression and innovation'
            },
            {
              level: 'Tertiary',
              program: 'Architecture',
              description: 'KNUST, Presbyterian University',
              whyRecommended: 'Combines creative design with technical implementation'
            },
            {
              level: 'Tertiary',
              program: 'Media Studies / Film Production',
              description: 'NAFTI, UG School of Communication Studies',
              whyRecommended: 'Perfect outlet for creative storytelling and innovation'
            }
          );
          break;

        case 'practical':
          pathways.push(
            {
              level: 'SHS',
              program: 'Business',
              description: 'Practical business applications',
              whyRecommended: 'Your focus on real-world application suits business management',
              keySubjects: ['Business Management', 'Financial Accounting', 'Economics']
            },
            {
              level: 'Tertiary',
              program: 'Nursing',
              description: 'UG, KNUST, UCC, UDS, UEW',
              whyRecommended: 'Hands-on patient care with immediate real-world impact'
            },
            {
              level: 'Tertiary',
              program: 'Project Management',
              description: 'GIMPA, Wisconsin University College',
              whyRecommended: 'Direct application of organizational skills to real projects'
            },
            {
              level: 'Tertiary',
              program: 'Agricultural Engineering',
              description: 'KNUST, UDS',
              whyRecommended: 'Practical solutions to real-world food production challenges'
            }
          );
          break;

        default:
          return getDefaultPathways();
      }
    }

    // Dual-Process Decision Styles
    if (assessmentType === 'dual-process') {
      switch (cognitiveStyle.toLowerCase()) {
        case 'intuitive':
          pathways.push(
            {
              level: 'Tertiary',
              program: 'Emergency Medicine / Nursing',
              description: 'Various medical schools and nursing colleges',
              whyRecommended: 'Quick decision-making under pressure suits emergency care'
            },
            {
              level: 'Tertiary',
              program: 'Journalism',
              description: 'GIJ, UG School of Communication Studies',
              whyRecommended: 'Fast-paced news environment requires quick pattern recognition'
            }
          );
          break;

        case 'reflective':
          pathways.push(
            {
              level: 'Tertiary',
              program: 'Research / PhD Programs',
              description: 'All major universities',
              whyRecommended: 'Deliberate, thorough analysis suits academic research'
            },
            {
              level: 'Tertiary',
              program: 'Strategic Management',
              description: 'GIMPA, University of Ghana Business School',
              whyRecommended: 'Long-term planning requires careful, reflective thinking'
            }
          );
          break;

        default:
          return getDefaultPathways();
      }
    }

    return pathways;
  };

  function getDefaultPathways(): EducationPathway[] {
    return [
      {
        level: 'SHS',
        program: 'General Science / Business / Arts',
        description: 'Choose based on your subject interests',
        whyRecommended: 'Explore different paths to find what resonates with your strengths'
      },
      {
        level: 'Tertiary',
        program: 'University Programs',
        description: 'Various options across Ghana\'s universities',
        whyRecommended: 'Many programs align with different cognitive profiles'
      }
    ];
  }

  const pathways = getEducationPathways();
  const shsPathways = pathways.filter(p => p.level === 'SHS');
  const tertiaryPathways = pathways.filter(p => p.level === 'Tertiary');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-green-600 dark:text-green-400" />
          <CardTitle>🇬🇭 Ghana Education Pathways</CardTitle>
        </div>
        <CardDescription>
          Recommended programs in Ghana's education system based on your {cognitiveStyle} profile
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* SHS Programs */}
        {shsPathways.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Senior High School (SHS) Tracks
              </h3>
            </div>
            <div className="space-y-4">
              {shsPathways.map((pathway, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                      {pathway.program}
                    </h4>
                    <Badge variant="secondary">SHS</Badge>
                  </div>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                    {pathway.description}
                  </p>
                  <div className="bg-white dark:bg-gray-900 p-3 rounded-md mb-2">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Why recommended:</strong> {pathway.whyRecommended}
                    </p>
                  </div>
                  {pathway.keySubjects && (
                    <div>
                      <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">
                        Key Subjects:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {pathway.keySubjects.map((subject, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tertiary Programs */}
        {tertiaryPathways.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Tertiary Education Programs
              </h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {tertiaryPathways.map((pathway, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border-2 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-purple-900 dark:text-purple-100">
                      {pathway.program}
                    </h4>
                    <Badge variant="secondary">University</Badge>
                  </div>
                  <p className="text-xs text-purple-700 dark:text-purple-300 mb-2 italic">
                    {pathway.description}
                  </p>
                  <div className="bg-white dark:bg-gray-900 p-2 rounded-md">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {pathway.whyRecommended}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Application Tips */}
        <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg mt-6">
          <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
            <span>📝</span> Application Tips for Ghana
          </h4>
          <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">•</span>
              <span><strong>WASSCE Requirements:</strong> Check specific aggregate requirements for your chosen programs</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">•</span>
              <span><strong>Counseling Office:</strong> Visit your school's counseling office for detailed program information</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">•</span>
              <span><strong>University Days:</strong> Attend open days at universities to explore programs firsthand</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">•</span>
              <span><strong>Scholarships:</strong> Research scholarship opportunities like GETFUND, GSFP, and university-specific awards</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">•</span>
              <span><strong>Career Guidance:</strong> Connect with professionals in your field of interest through social media or alumni networks</span>
            </li>
          </ul>
        </div>

        {/* Key Universities Reference */}
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            🎓 Key Universities Mentioned
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
            <div>• UG - University of Ghana</div>
            <div>• KNUST - Kwame Nkrumah University of Science and Technology</div>
            <div>• UCC - University of Cape Coast</div>
            <div>• UDS - University for Development Studies</div>
            <div>• GIMPA - Ghana Institute of Management and Public Administration</div>
            <div>• UHAS - University of Health and Allied Sciences</div>
            <div>• Ashesi University</div>
            <div>• Academic City University</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
