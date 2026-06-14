import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Reflection, Assessment } from '../types';
import { getUserReflections, getUserAssessments } from '../utils/storage';
import { FileText, Search, Calendar, Eye, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { formatDateTime, formatDate } from '../utils/dateFormat';

interface ReflectionsViewerProps {
  userId: string;
  onViewAssessment?: (assessment: Assessment) => void;
}

export function ReflectionsViewer({ userId, onViewAssessment }: ReflectionsViewerProps) {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'kolb' | 'sternberg' | 'dual-process'>('all');
  const [expandedReflection, setExpandedReflection] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = () => {
    const userReflections = getUserReflections(userId);
    const userAssessments = getUserAssessments(userId);
    
    // Sort reflections by date, newest first
    const sortedReflections = userReflections.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    setReflections(sortedReflections);
    setAssessments(userAssessments);
  };

  const getAssessmentForReflection = (assessmentId: string) => {
    return assessments.find(a => a.id === assessmentId);
  };

  const getAssessmentTypeName = (type: string) => {
    switch (type) {
      case 'kolb': return 'Learning Style';
      case 'sternberg': return 'Thinking Style';
      case 'dual-process': return 'Decision Style';
      default: return type;
    }
  };

  const filteredReflections = reflections.filter(reflection => {
    const assessment = getAssessmentForReflection(reflection.assessmentId);
    
    // Filter by assessment type
    if (filterType !== 'all' && assessment?.type !== filterType) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const contentMatch = reflection.content.toLowerCase().includes(query);
      const dateMatch = formatDate(reflection.createdAt).toLowerCase().includes(query);
      return contentMatch || dateMatch;
    }
    
    return true;
  });

  if (reflections.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Your Reflections
          </CardTitle>
          <CardDescription>Review your past thoughts and insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No reflections yet.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Complete an assessment and add your reflections to see them here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Your Reflections
          </CardTitle>
          <CardDescription>
            Review and search through your past thoughts and insights
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{reflections.length}</p>
                  <p className="text-sm text-muted-foreground mt-1">Total Reflections</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {reflections.filter(r => {
                      const a = getAssessmentForReflection(r.assessmentId);
                      return a?.type === 'kolb';
                    }).length}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Learning Style</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">
                    {reflections.filter(r => {
                      const a = getAssessmentForReflection(r.assessmentId);
                      return a?.type === 'sternberg';
                    }).length}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Thinking Style</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-orange-600">
                    {reflections.filter(r => {
                      const a = getAssessmentForReflection(r.assessmentId);
                      return a?.type === 'dual-process';
                    }).length}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Decision Style</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reflections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="kolb">Learning Style</SelectItem>
                <SelectItem value="sternberg">Thinking Style</SelectItem>
                <SelectItem value="dual-process">Decision Style</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results count */}
          {(searchQuery || filterType !== 'all') && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <p>
                Showing {filteredReflections.length} of {reflections.length} reflection{reflections.length !== 1 ? 's' : ''}
              </p>
              {(searchQuery || filterType !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterType('all');
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reflections List */}
      <div className="space-y-4">
        {filteredReflections.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No reflections match your search criteria.</p>
                <p className="text-sm mt-2">Try adjusting your filters or search terms.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredReflections.map((reflection) => {
            const assessment = getAssessmentForReflection(reflection.assessmentId);
            const isExpanded = expandedReflection === reflection.id;
            const contentPreview = reflection.content.length > 200 
              ? reflection.content.substring(0, 200) + '...'
              : reflection.content;
            
            return (
              <Card key={reflection.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {assessment && (
                            <Badge variant="outline">
                              {getAssessmentTypeName(assessment.type)}
                            </Badge>
                          )}
                          <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 inline-block align-text-bottom" />
                            <span className="inline-block align-baseline">{formatDateTime(reflection.createdAt)}</span>
                          </span>
                        </div>
                      </div>
                      {assessment && onViewAssessment && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewAssessment(assessment)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Assessment
                        </Button>
                      )}
                    </div>

                    {/* Content */}
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {isExpanded ? reflection.content : contentPreview}
                      </p>
                    </div>

                    {/* Expand button for long content */}
                    {reflection.content.length > 200 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedReflection(isExpanded ? null : reflection.id)}
                      >
                        {isExpanded ? 'Show less' : 'Show more'}
                      </Button>
                    )}

                    {/* Assessment details */}
                    {assessment && (
                      <div className="pt-4 border-t">
                        <p className="text-xs text-muted-foreground">
                          Assessment Result: {' '}
                          <span className="font-medium text-foreground">
                            {assessment.score.kolb?.style || 
                             assessment.score.sternberg?.style || 
                             assessment.score.dualProcess?.style}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
