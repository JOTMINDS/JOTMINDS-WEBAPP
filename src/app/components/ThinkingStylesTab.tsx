import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Sparkles, GraduationCap, Briefcase } from 'lucide-react';

interface ThinkingStylesTabProps {
  onStartJHS: () => void;
  onStartSHS: () => void;
  onStartAdult: () => void;
}

export function ThinkingStylesTab({ onStartJHS, onStartSHS, onStartAdult }: ThinkingStylesTabProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-4 border-[#6B4C9A] bg-gradient-to-r from-cyan-50 to-indigo-50 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl bg-gradient-to-r from-[#6B4C9A] to-[#5B7DB1] bg-clip-text text-transparent">
            🧠 Thinking Styles Assessments
          </CardTitle>
          <CardDescription className="text-base">
            Choose the age-appropriate assessment to discover your thinking profile and get personalized recommendations
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Assessment Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* JHS - Ages 11-14 */}
        <Card className="border-4 border-[#FF715B] bg-gradient-to-br from-white via-pink-50 to-purple-50 shadow-lg hover:shadow-2xl transition-all">
          <CardHeader>
            <div className="flex justify-between items-start mb-3">
              <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                Ages 11-14
              </Badge>
              <div className="text-3xl">🎨</div>
            </div>
            <CardTitle className="text-xl bg-gradient-to-r from-[#FF715B] to-[#5B7DB1] bg-clip-text text-transparent">
              JHS Thinking Styles
            </CardTitle>
            <CardDescription>
              For Junior High School students - Fun emoji-based assessment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white/80 rounded-lg p-3 border border-[#FF715B]/30">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <span>🎨</span> Creative
                </div>
                <div className="flex items-center gap-1">
                  <span>🔍</span> Analytical
                </div>
                <div className="flex items-center gap-1">
                  <span>🛠️</span> Practical
                </div>
                <div className="flex items-center gap-1">
                  <span>💭</span> Reflective
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-2 border border-yellow-200">
              <p className="text-xs font-semibold text-gray-900">
                🎓 Get SHS Program Recommendations
              </p>
            </div>
            <Button
              onClick={onStartJHS}
              className="w-full bg-gradient-to-r from-[#FF715B] to-[#5B7DB1] hover:from-[#E6644F] hover:to-[#252770] text-white"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Start JHS Assessment
            </Button>
            <p className="text-xs text-center text-gray-500">
              ⏱️ 5-7 minutes • Emoji responses 😕😐🙂😃🤩
            </p>
          </CardContent>
        </Card>

        {/* SHS - Ages 15-18 */}
        <Card className="border-4 border-indigo-300 bg-gradient-to-br from-white via-indigo-50 to-cyan-50 shadow-lg hover:shadow-2xl transition-all">
          <CardHeader>
            <div className="flex justify-between items-start mb-3">
              <Badge className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-white">
                Ages 15-18
              </Badge>
              <div className="text-3xl">🎓</div>
            </div>
            <CardTitle className="text-xl bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
              SHS Thinking Styles
            </CardTitle>
            <CardDescription>
              For Senior High School students - Academic assessment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white/80 rounded-lg p-3 border border-indigo-200">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <span>🎨</span> Creative
                </div>
                <div className="flex items-center gap-1">
                  <span>🔍</span> Analytical
                </div>
                <div className="flex items-center gap-1">
                  <span>🛠️</span> Practical
                </div>
                <div className="flex items-center gap-1">
                  <span>💭</span> Reflective
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-2 border border-yellow-200">
              <p className="text-xs font-semibold text-gray-900">
                🎓 Get University Program Recommendations
              </p>
            </div>
            <Button
              onClick={onStartSHS}
              className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white"
            >
              <GraduationCap className="mr-2 h-4 w-4" />
              Start SHS Assessment
            </Button>
            <p className="text-xs text-center text-gray-500">
              ⏱️ 6-8 minutes • 5-point rating scale
            </p>
          </CardContent>
        </Card>

        {/* Adult - Ages 19+ */}
        <Card className="border-4 border-slate-300 bg-gradient-to-br from-white via-slate-50 to-zinc-50 shadow-lg hover:shadow-2xl transition-all">
          <CardHeader>
            <div className="flex justify-between items-start mb-3">
              <Badge className="bg-gradient-to-r from-slate-700 to-slate-900 text-white">
                Ages 19+
              </Badge>
              <div className="text-3xl">💼</div>
            </div>
            <CardTitle className="text-xl bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
              Professional Thinking Styles
            </CardTitle>
            <CardDescription>
              For professionals - Career development focused
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white/80 rounded-lg p-3 border border-slate-200">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <span>🎨</span> Creative
                </div>
                <div className="flex items-center gap-1">
                  <span>🔍</span> Analytical
                </div>
                <div className="flex items-center gap-1">
                  <span>🛠️</span> Practical
                </div>
                <div className="flex items-center gap-1">
                  <span>💭</span> Reflective
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-2 border border-yellow-200">
              <p className="text-xs font-semibold text-gray-900">
                💼 Get Career Path Recommendations
              </p>
            </div>
            <Button
              onClick={onStartAdult}
              className="w-full bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-black text-white"
            >
              <Briefcase className="mr-2 h-4 w-4" />
              Start Professional Assessment
            </Button>
            <p className="text-xs text-center text-gray-500">
              ⏱️ 8-10 minutes • Professional Likert scale
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Info Section */}
      <Card className="border-2 border-[#6B4C9A] shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#6B4C9A]" />
            Why Take Multiple Assessments?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
              <p className="font-semibold text-gray-900 mb-2">📚 Academic Guidance</p>
              <p className="text-gray-700">
                JHS & SHS assessments help you choose the right programs based on your thinking strengths
              </p>
            </div>
            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
              <p className="font-semibold text-gray-900 mb-2">🎯 Career Planning</p>
              <p className="text-gray-700">
                Professional assessment aligns your thinking style with career paths and growth opportunities
              </p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="font-semibold text-gray-900 mb-2">📊 Track Progress</p>
              <p className="text-gray-700">
                See how your thinking develops across different life stages and educational levels
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
