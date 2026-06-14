import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { BookOpen, ExternalLink, Video, FileText, Lightbulb } from 'lucide-react';

interface Resource {
  title: string;
  description: string;
  type: 'article' | 'video' | 'guide' | 'tip';
  url: string;
  relevance: string;
}

interface EducationalResourcesProps {
  learningStyle?: string;
  thinkingStyle?: string;
  decisionStyle?: string;
  userType: 'parent' | 'teacher';
}

export function EducationalResources({ 
  learningStyle, 
  thinkingStyle, 
  decisionStyle,
  userType 
}: EducationalResourcesProps) {
  
  const getResourcesForLearningStyle = (style: string): Resource[] => {
    switch (style) {
      case 'Diverging':
        return [
          {
            title: 'Supporting Creative Learners at Home',
            description: 'Practical strategies for nurturing creative thinking and imaginative exploration in children who thrive on brainstorming and group work.',
            type: 'article',
            url: 'https://www.edutopia.org/article/supporting-creative-learners',
            relevance: 'Perfect for Diverging learners who excel at viewing situations from multiple perspectives'
          },
          {
            title: 'Group Learning Activities for Children',
            description: 'Collection of collaborative learning activities that encourage discussion, reflection, and diverse perspectives.',
            type: 'guide',
            url: 'https://www.scholastic.com/teachers/articles/teaching-content/collaborative-learning/',
            relevance: 'Diverging learners prefer working in groups and value different opinions'
          },
          {
            title: 'Encouraging Reflective Thinking',
            description: 'Techniques to help children develop deeper reflection skills and connect experiences to learning.',
            type: 'article',
            url: 'https://www.teachthought.com/pedagogy/reflective-thinking-students/',
            relevance: 'Supports the reflective observation strength of Diverging learners'
          }
        ];
      
      case 'Assimilating':
        return [
          {
            title: 'Supporting Logical Thinkers',
            description: 'How to nurture analytical and systematic thinking in children who love organizing information into clear frameworks.',
            type: 'article',
            url: 'https://www.understood.org/articles/logical-thinking-what-it-is',
            relevance: 'Ideal for Assimilating learners who excel at creating theoretical models'
          },
          {
            title: 'Independent Study Strategies',
            description: 'Guide to supporting self-directed learning and independent research projects at home.',
            type: 'guide',
            url: 'https://www.readingrockets.org/topics/independent-learning',
            relevance: 'Assimilating learners prefer working independently with ideas and concepts'
          },
          {
            title: 'Making Abstract Concepts Concrete',
            description: 'Techniques to help children understand and apply theoretical knowledge effectively.',
            type: 'article',
            url: 'https://www.edutopia.org/article/making-abstract-concrete',
            relevance: 'Helps bridge the gap between abstract conceptualization and practical application'
          }
        ];
      
      case 'Converging':
        return [
          {
            title: 'Problem-Solving Activities for Kids',
            description: 'Practical exercises and challenges to develop technical problem-solving skills and logical thinking.',
            type: 'guide',
            url: 'https://www.parents.com/kids/development/problem-solving-activities/',
            relevance: 'Perfect for Converging learners who excel at finding practical solutions'
          },
          {
            title: 'STEM Learning at Home',
            description: 'Science, technology, engineering, and math activities that emphasize hands-on experimentation.',
            type: 'article',
            url: 'https://www.stem.org.uk/home-learning',
            relevance: 'Converging learners thrive with technical tasks and practical applications'
          },
          {
            title: 'Decision-Making Skills for Children',
            description: 'Teaching kids to make logical, evidence-based decisions through structured thinking.',
            type: 'guide',
            url: 'https://www.childmind.org/article/decision-making-skills/',
            relevance: 'Supports the analytical decision-making strength of Converging learners'
          }
        ];
      
      case 'Accommodating':
        return [
          {
            title: 'Hands-On Learning Activities',
            description: 'Engaging practical activities that let children learn by doing and experimenting.',
            type: 'guide',
            url: 'https://www.scholastic.com/parents/books-and-reading/raise-a-reader-blog/hands-on-learning.html',
            relevance: 'Perfect for Accommodating learners who prefer active experimentation'
          },
          {
            title: 'Supporting Action-Oriented Learners',
            description: 'Strategies for nurturing children who learn best through trial and error and real-world experiences.',
            type: 'article',
            url: 'https://www.understood.org/articles/hands-on-learners',
            relevance: 'Accommodating learners rely on concrete experience and active doing'
          },
          {
            title: 'Encouraging Adaptability in Children',
            description: 'How to support flexible thinking and help children thrive in changing situations.',
            type: 'article',
            url: 'https://www.parentingscience.com/teaching-flexibility.html',
            relevance: 'Accommodating learners are adaptable and excel at adjusting plans based on experience'
          }
        ];
      
      default:
        return [];
    }
  };

  const getResourcesForThinkingStyle = (style: string): Resource[] => {
    switch (style) {
      case 'Analytical':
        return [
          {
            title: 'Nurturing Critical Thinking Skills',
            description: 'Methods to develop analytical reasoning and systematic problem-solving in children.',
            type: 'article',
            url: 'https://www.criticalthinking.org/pages/nurturing-critical-thinking/829',
            relevance: 'Analytical thinkers excel at breaking down problems and examining components'
          },
          {
            title: 'Logic Puzzles and Brain Teasers',
            description: 'Collection of age-appropriate puzzles that strengthen analytical reasoning abilities.',
            type: 'guide',
            url: 'https://www.education.com/resources/logic-puzzles/',
            relevance: 'Perfect for developing the structured thinking approach of Analytical learners'
          }
        ];
      
      case 'Creative':
        return [
          {
            title: 'Fostering Creativity in Children',
            description: 'Practical approaches to nurture imaginative thinking and innovative problem-solving.',
            type: 'article',
            url: 'https://www.naeyc.org/resources/pubs/yc/mar2018/fostering-creativity',
            relevance: 'Creative thinkers excel at generating novel ideas and innovative solutions'
          },
          {
            title: 'Open-Ended Learning Activities',
            description: 'Activities that encourage imagination, exploration, and thinking outside the box.',
            type: 'guide',
            url: 'https://www.scholastic.com/parents/family-life/creativity-and-critical-thinking/creative-thinking.html',
            relevance: 'Supports the imaginative and innovative strengths of Creative thinkers'
          }
        ];
      
      case 'Practical':
        return [
          {
            title: 'Real-World Learning Experiences',
            description: 'How to connect learning to everyday situations and practical applications.',
            type: 'article',
            url: 'https://www.edutopia.org/article/real-world-learning',
            relevance: 'Practical thinkers excel at applying knowledge to concrete situations'
          },
          {
            title: 'Life Skills Education at Home',
            description: 'Teaching practical competencies and common-sense problem-solving through daily activities.',
            type: 'guide',
            url: 'https://www.parents.com/parenting/better-parenting/teaching-life-skills/',
            relevance: 'Practical thinkers thrive when learning has immediate, tangible applications'
          }
        ];
      
      default:
        return [];
    }
  };

  const getGeneralResources = (): Resource[] => {
    if (userType === 'parent') {
      return [
        {
          title: 'Understanding Your Child\'s Learning Style',
          description: 'Comprehensive guide to identifying and supporting different learning preferences in children.',
          type: 'guide',
          url: 'https://www.understood.org/articles/understanding-your-childs-learning-style',
          relevance: 'Essential foundation for all parents'
        },
        {
          title: 'Creating a Supportive Learning Environment',
          description: 'Tips for setting up home spaces that enhance learning based on individual preferences.',
          type: 'article',
          url: 'https://www.scholastic.com/parents/family-life/creativity-and-critical-thinking/learning-at-home.html',
          relevance: 'Applicable to all learning styles'
        },
        {
          title: 'Communicating with Your Child About Learning',
          description: 'Strategies for having productive conversations about schoolwork, challenges, and successes.',
          type: 'tip',
          url: 'https://www.parenttoolkit.com/academics/supporting-your-learner',
          relevance: 'Builds metacognitive awareness in all learners'
        }
      ];
    } else {
      return [
        {
          title: 'Differentiated Instruction Strategies',
          description: 'Teaching methods to address diverse learning styles and thinking preferences in the classroom.',
          type: 'guide',
          url: 'https://www.edutopia.org/topic/differentiated-instruction',
          relevance: 'Essential for all teachers working with diverse learners'
        },
        {
          title: 'Assessment for Learning',
          description: 'Using cognitive assessments to inform teaching practice and personalize instruction.',
          type: 'article',
          url: 'https://www.teachthought.com/pedagogy/assessment-for-learning/',
          relevance: 'Helps translate assessment results into teaching strategies'
        },
        {
          title: 'Building Student Self-Awareness',
          description: 'Activities to help students understand their own learning preferences and develop metacognitive skills.',
          type: 'guide',
          url: 'https://www.edutopia.org/metacognition-resources',
          relevance: 'Empowers students to take ownership of their learning'
        }
      ];
    }
  };

  const allResources = [
    ...(learningStyle ? getResourcesForLearningStyle(learningStyle) : []),
    ...(thinkingStyle ? getResourcesForThinkingStyle(thinkingStyle) : []),
    ...getGeneralResources()
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'article': return <FileText className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'guide': return <BookOpen className="h-4 w-4" />;
      case 'tip': return <Lightbulb className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          Educational Resources & Articles
        </CardTitle>
        <CardDescription>
          {userType === 'parent' 
            ? 'Curated resources to help you support your child\'s learning journey at home'
            : 'Evidence-based strategies and materials to enhance your teaching practice'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {learningStyle && (
          <div className="mb-4">
            <Badge variant="outline" className="mb-2">
              Based on Learning Style: {learningStyle}
            </Badge>
          </div>
        )}

        <div className="space-y-3">
          {allResources.map((resource, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {getIcon(resource.type)}
                        {getTypeLabel(resource.type)}
                      </Badge>
                    </div>
                    <h4 className="font-medium">{resource.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {resource.description}
                    </p>
                    <p className="text-xs text-blue-600 italic">
                      Why this helps: {resource.relevance}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a 
                      href={resource.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1"
                    >
                      View
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Note:</strong> These resources are carefully selected based on the assessment results. 
            {userType === 'parent' 
              ? ' They provide practical strategies you can implement at home to support your child\'s unique learning journey.'
              : ' Use them to differentiate instruction and create more personalized learning experiences for each student.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
