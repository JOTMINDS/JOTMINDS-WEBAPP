import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Info, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Alert, AlertDescription } from './ui/alert';

interface EnhancedTriangleVisualizationProps {
  concreteExperience: number;
  reflectiveObservation: number;
  abstractConceptualization: number;
  activeExperimentation: number;
  dominantStyle: string;
}

export function EnhancedTriangleVisualization({
  concreteExperience,
  reflectiveObservation,
  abstractConceptualization,
  activeExperimentation,
  dominantStyle
}: EnhancedTriangleVisualizationProps) {
  
  // Calculate percentages for better visualization
  const cePercent = (concreteExperience / 48) * 100;
  const roPercent = (reflectiveObservation / 48) * 100;
  const acPercent = (abstractConceptualization / 48) * 100;
  const aePercent = (activeExperimentation / 48) * 100;

  const dimensions = [
    {
      name: 'Concrete Experience',
      score: concreteExperience,
      maxScore: 48,
      percent: cePercent,
      description: 'Learning by feeling and experiencing',
      color: 'bg-blue-500',
      textColor: 'text-blue-700',
      bgLight: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      name: 'Reflective Observation',
      score: reflectiveObservation,
      maxScore: 48,
      percent: roPercent,
      description: 'Learning by watching and reflecting',
      color: 'bg-green-500',
      textColor: 'text-green-700',
      bgLight: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      name: 'Abstract Conceptualization',
      score: abstractConceptualization,
      maxScore: 48,
      percent: acPercent,
      description: 'Learning by thinking and analyzing',
      color: 'bg-purple-500',
      textColor: 'text-purple-700',
      bgLight: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      name: 'Active Experimentation',
      score: activeExperimentation,
      maxScore: 48,
      percent: aePercent,
      description: 'Learning by doing and testing',
      color: 'bg-orange-500',
      textColor: 'text-orange-700',
      bgLight: 'bg-orange-50',
      borderColor: 'border-orange-200'
    }
  ];

  const getStyleExplanation = (style: string) => {
    switch (style) {
      case 'Diverging':
        return {
          primary: 'Concrete Experience & Reflective Observation',
          strength: 'You learn best by feeling and watching',
          approach: 'You prefer to observe situations from multiple perspectives and brainstorm ideas'
        };
      case 'Assimilating':
        return {
          primary: 'Abstract Conceptualization & Reflective Observation',
          strength: 'You learn best by thinking and watching',
          approach: 'You prefer logical reasoning and creating theoretical models'
        };
      case 'Converging':
        return {
          primary: 'Abstract Conceptualization & Active Experimentation',
          strength: 'You learn best by thinking and doing',
          approach: 'You prefer solving problems and finding practical solutions'
        };
      case 'Accommodating':
        return {
          primary: 'Concrete Experience & Active Experimentation',
          strength: 'You learn best by feeling and doing',
          approach: 'You prefer hands-on experiences and learning by trial and error'
        };
      default:
        return {
          primary: '',
          strength: '',
          approach: ''
        };
    }
  };

  const styleInfo = getStyleExplanation(dominantStyle);

  return (
    <div className="space-y-6">
      {/* Explanation Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Understanding Your Scores:</strong> The chart below shows your preferences across four learning dimensions. 
          Higher scores indicate stronger preferences. Your dominant style ({dominantStyle}) is determined by your two highest-scoring dimensions.
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left side: Bar Chart Visualization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Your Learning Dimensions
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Each bar represents how strongly you prefer that learning approach. The maximum score is 48.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
            <CardDescription>
              Your preferences across the four learning dimensions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dimensions.map((dimension) => (
              <div key={dimension.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${dimension.textColor}`}>
                      {dimension.name}
                    </span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3 w-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{dimension.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <span className="text-sm font-semibold">
                    {dimension.score}/{dimension.maxScore}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full ${dimension.color} transition-all duration-500 rounded-full flex items-center justify-end pr-2`}
                    style={{ width: `${dimension.percent}%` }}
                  >
                    {dimension.percent > 15 && (
                      <span className="text-xs text-white font-medium">
                        {Math.round(dimension.percent)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Right side: Style Explanation */}
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your Learning Style</CardTitle>
              <Badge className="text-lg px-4 py-1">{dominantStyle}</Badge>
            </div>
            <CardDescription>
              Based on your strongest learning preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                  Primary Dimensions
                </h4>
                <p className="text-sm">
                  {styleInfo.primary}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                  Your Strength
                </h4>
                <p className="text-sm">
                  {styleInfo.strength}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                  Your Approach
                </h4>
                <p className="text-sm">
                  {styleInfo.approach}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="text-sm font-semibold mb-2">What This Means:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• You have a natural preference for certain ways of learning</li>
                <li>• Understanding this helps you learn more effectively</li>
                <li>• You can develop other dimensions through practice</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Dimension Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dimensions.map((dimension) => (
          <Card key={dimension.name} className={`border ${dimension.borderColor}`}>
            <CardContent className="pt-6">
              <div className={`${dimension.bgLight} dark:bg-opacity-10 rounded-lg p-4 space-y-2`}>
                <div className="flex items-center justify-between">
                  <h4 className={`font-semibold text-sm ${dimension.textColor}`}>
                    {dimension.name.split(' ')[0]}
                  </h4>
                  <Badge variant="outline" className={dimension.textColor}>
                    {Math.round(dimension.percent)}%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {dimension.description}
                </p>
                <div className={`w-full h-2 ${dimension.color} rounded-full`} 
                     style={{ opacity: dimension.percent / 100 }} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
