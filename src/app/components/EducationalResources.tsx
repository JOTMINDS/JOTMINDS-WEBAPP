import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { BookOpen, ExternalLink, Video, FileText, Lightbulb, Loader } from 'lucide-react';
import { useState, useEffect } from 'react';
import { generateAIEducationalResources, AIEducationalResource } from '../utils/aiService';

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
  
  
  const [aiResources, setAiResources] = useState<AIEducationalResource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchResources() {
      setLoading(true);
      try {
        const res = await generateAIEducationalResources({
          learningStyle,
          thinkingStyle,
          decisionStyle,
          userType
        });
        if (res && res.length > 0) {
          setAiResources(res);
        } else {
          setAiResources([]);
        }
      } catch (e) {
        console.error('Error loading AI educational resources:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchResources();
  }, [learningStyle, thinkingStyle, decisionStyle, userType]);

  const resources = aiResources || [];

  const getIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-3.5 w-3.5" />;
      case 'guide':
        return <FileText className="h-3.5 w-3.5" />;
      case 'tip':
        return <Lightbulb className="h-3.5 w-3.5" />;
      default:
        return <BookOpen className="h-3.5 w-3.5" />;
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
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader className="h-6 w-6 animate-spin text-blue-600 mr-2" />
              <span className="text-sm text-muted-foreground">Generating personalized resources with AI...</span>
            </div>
          ) : resources.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No custom resources found.</p>
          ) : (
            resources.map((resource, index) => (
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
                    {resource.url && resource.url !== '#' && (
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
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Note:</strong> These resources are dynamically generated by JotMinds AI based on your profile metrics. 
            {userType === 'parent' 
              ? ' They provide practical strategies you can implement at home to support your child\'s unique learning journey.'
              : ' Use them to differentiate instruction and create more personalized learning experiences for each student.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
