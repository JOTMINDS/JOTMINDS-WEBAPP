import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  BookOpen, Video, FileText, Download, Search, CheckCircle2,
  Sparkles, GraduationCap, HelpCircle, ExternalLink, Play, Lightbulb, Shield, Users
} from 'lucide-react';
import { toast } from 'sonner';

interface ResourceItem {
  id: string;
  title: string;
  category: 'getting-started' | 'assessment-guides' | 'pedagogy' | 'video-tutorials';
  description: string;
  format: 'PDF Guide' | 'Video' | 'Article' | 'Checklist';
  readTime: string;
  featured?: boolean;
}

const RESOURCES: ResourceItem[] = [
  {
    id: '1',
    title: 'School Administrator Quick Start Guide',
    category: 'getting-started',
    description: 'Learn how to set up your school profile, invite teachers, generate student codes, and manage classes in under 10 minutes.',
    format: 'PDF Guide',
    readTime: '5 min read',
    featured: true,
  },
  {
    id: '2',
    title: 'Understanding Cognitive Style Assessment Results',
    category: 'assessment-guides',
    description: 'A comprehensive guide to interpreting student Learning, Thinking, and Decision style profiles to tailor instruction.',
    format: 'PDF Guide',
    readTime: '8 min read',
    featured: true,
  },
  {
    id: '3',
    title: 'How to Administer Assessments in the Classroom',
    category: 'assessment-guides',
    description: 'Step-by-step instructions for teachers on guiding primary, JHS, and SHS students through taking their cognitive assessments.',
    format: 'Checklist',
    readTime: '4 min read',
  },
  {
    id: '4',
    title: 'Differentiated Teaching Strategies based on Student Profiles',
    category: 'pedagogy',
    description: 'Practical classroom techniques for adapting lesson plans to accommodate diverse analytical, creative, and practical thinkers.',
    format: 'Article',
    readTime: '10 min read',
    featured: true,
  },
  {
    id: '5',
    title: 'Platform Walkthrough & Dashboard Tour',
    category: 'video-tutorials',
    description: 'Video overview of the JotMinds school portal, student analytics, reporting tools, and class management features.',
    format: 'Video',
    readTime: '6 min watch',
    featured: true,
  },
  {
    id: '6',
    title: 'Teacher-Student Onboarding Checklist',
    category: 'getting-started',
    description: 'Printable checklist for rolling out JotMinds across your institution at the start of the academic term.',
    format: 'Checklist',
    readTime: '3 min read',
  },
  {
    id: '7',
    title: 'Using Cognitive Analytics to Boost Student Engagement',
    category: 'pedagogy',
    description: 'How school administrators and department heads can leverage aggregated analytics to identify at-risk students.',
    format: 'Article',
    readTime: '7 min read',
  },
  {
    id: '8',
    title: 'Generating & Exporting Official School Cognitive Reports',
    category: 'video-tutorials',
    description: 'Tutorial on exporting student and class cognitive summary reports for parent-teacher conferences.',
    format: 'Video',
    readTime: '4 min watch',
  },
];

export function TrainingPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredResources = RESOURCES.filter(r => {
    const matchesCategory = selectedCategory === 'all' || r.category === selectedCategory;
    const matchesSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDownload = (resource: ResourceItem) => {
    toast.success(`Downloading "${resource.title}"...`, {
      description: `${resource.format} · ${resource.readTime}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <Card className="bg-gradient-to-r from-[#5B7DB1] via-indigo-600 to-[#6B4C9A] text-white overflow-hidden border-none shadow-md">
        <CardContent className="pt-6 pb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                  <GraduationCap className="w-3.5 h-3.5 mr-1" /> Educator Hub
                </Badge>
                <Badge className="bg-amber-400/20 text-amber-200 border-amber-300/30">
                  <Sparkles className="w-3.5 h-3.5 mr-1" /> Professional Development
                </Badge>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Training & Resource Portal
              </h2>
              <p className="text-indigo-100 text-sm leading-relaxed">
                Access step-by-step guides, video tutorials, assessment administration checklists, and research-backed pedagogical strategies to help your school thrive.
              </p>
            </div>
            <div className="shrink-0 flex gap-2">
              <Button
                onClick={() => setSelectedCategory('getting-started')}
                className="bg-white text-indigo-900 hover:bg-indigo-50 font-semibold shadow-sm text-xs"
              >
                <BookOpen className="w-4 h-4 mr-1.5" /> Quick Start
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search training guides, videos, checklists..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Resources' },
            { id: 'getting-started', label: 'Getting Started' },
            { id: 'assessment-guides', label: 'Assessment Guides' },
            { id: 'pedagogy', label: 'Teaching Strategies' },
            { id: 'video-tutorials', label: 'Videos' },
          ].map(cat => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className={selectedCategory === cat.id ? 'bg-[#5B7DB1] text-white hover:bg-[#4a6999]' : 'bg-white text-gray-700'}
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Featured Video Tutorial Section */}
      {selectedCategory === 'all' && !search && (
        <Card className="border-indigo-100 bg-gradient-to-r from-indigo-50/50 via-purple-50/30 to-blue-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-indigo-600" />
                <CardTitle className="text-base text-gray-900">Featured Video Walkthrough</CardTitle>
              </div>
              <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">Featured</Badge>
            </div>
            <CardDescription className="text-xs text-gray-600">
              Watch this 6-minute orientation video to get your teachers and classes set up smoothly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative rounded-xl overflow-hidden bg-slate-900 aspect-video max-h-[300px] flex items-center justify-center group cursor-pointer border border-indigo-200 shadow-inner">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-between p-6">
                <div className="flex justify-between items-start">
                  <Badge className="bg-red-600 text-white font-semibold text-[10px]">HD VIDEO</Badge>
                  <span className="text-xs text-white/80 font-mono">6:12</span>
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg mb-1">School Portal Setup & Student Code Distribution</h4>
                  <p className="text-indigo-200 text-xs line-clamp-1">Complete walkthrough of administrator settings, student code generation, and cognitive report exports.</p>
                </div>
              </div>
              <div className="w-14 h-14 rounded-full bg-white/90 text-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform z-10">
                <Play className="w-6 h-6 ml-1 fill-current" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredResources.map(res => (
          <Card key={res.id} className="hover:shadow-md transition-shadow flex flex-col justify-between border-gray-200">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  {res.format === 'Video' ? (
                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                      <Video className="w-4 h-4" />
                    </div>
                  ) : res.format === 'Checklist' ? (
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                  )}
                  <div>
                    <Badge variant="outline" className="text-[10px] text-gray-500 font-medium">
                      {res.format}
                    </Badge>
                    <span className="text-[10px] text-gray-400 ml-2">· {res.readTime}</span>
                  </div>
                </div>
                {res.featured && (
                  <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px]">Popular</Badge>
                )}
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1.5 line-clamp-1">{res.title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 mb-4">{res.description}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(res)}
                className="w-full text-xs text-[#5B7DB1] border-[#5B7DB1]/30 hover:bg-[#5B7DB1]/10 flex items-center justify-center gap-1.5"
              >
                {res.format === 'Video' ? (
                  <>
                    <Play className="w-3.5 h-3.5" /> Watch Video
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" /> Access {res.format}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <Card className="py-12 text-center">
          <CardContent>
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-700 mb-1">No resources found</h3>
            <p className="text-xs text-gray-500">Try adjusting your search query or selecting a different category filter.</p>
          </CardContent>
        </Card>
      )}

      {/* Best Practices Banner */}
      <Card className="bg-slate-50 border-slate-200">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <CardTitle className="text-sm text-gray-800">Classroom Best Practice Tips</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <p className="font-semibold text-gray-900 mb-1">1. Periodic Assessment</p>
              <p className="text-gray-600">Encourage students to retake cognitive assessments once per term to track growth and cognitive style evolution.</p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <p className="font-semibold text-gray-900 mb-1">2. Mixed-Style Grouping</p>
              <p className="text-gray-600">Form collaborative project groups with a mix of Analytical, Creative, and Practical thinkers for peer learning.</p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <p className="font-semibold text-gray-900 mb-1">3. Parent Sharing</p>
              <p className="text-gray-600">Export student PDF cognitive reports for parent-teacher conferences to discuss personalized study strategies.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
