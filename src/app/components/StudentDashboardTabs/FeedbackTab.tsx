import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { MessageSquare, Sparkles } from 'lucide-react';
import { TabsContent } from '../ui/tabs';

export function FeedbackTab() {
  return (
    <TabsContent value="feedback" className="space-y-6">
      <div className="max-w-3xl mx-auto">
        <Card className="border-2 border-[#6B4C9A] bg-gradient-to-br from-cyan-50 to-blue-50">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#6B4C9A] to-[#5B7DB1] flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl">Share Your Experience with JotMinds</CardTitle>
            <CardDescription className="text-base mt-2">
              Your feedback helps us improve the platform for students, teachers, parents, and professionals across Ghana
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#6B4C9A]" />
                We'd love to hear from you about:
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="flex items-start gap-3 p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                  <span className="text-[#6B4C9A] font-bold text-lg">•</span>
                  <span className="text-sm">Your overall experience using JotMinds</span>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-[#5B7DB1] font-bold text-lg">•</span>
                  <span className="text-sm">How accurate your assessment results were</span>
                </div>
                <div className="flex items-start gap-3 p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                  <span className="text-[#6B4C9A] font-bold text-lg">•</span>
                  <span className="text-sm">What features you found most helpful</span>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-[#5B7DB1] font-bold text-lg">•</span>
                  <span className="text-sm">Suggestions for improvement</span>
                </div>
                <div className="flex items-start gap-3 p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                  <span className="text-[#6B4C9A] font-bold text-lg">•</span>
                  <span className="text-sm">How JotMinds has helped your learning</span>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-[#5B7DB1] font-bold text-lg">•</span>
                  <span className="text-sm">Any challenges you encountered</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#6B4C9A]/10 to-[#5B7DB1]/10 rounded-lg p-4 border border-[#6B4C9A]/30">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">✓</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Your Feedback is Valuable</p>
                  <p className="text-sm text-gray-600">
                    Every response helps us understand how to better serve and make JotMinds more effective for everyone.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 pt-4">
              <Button
                onClick={() => window.open('https://forms.gle/SXPFj29PxUbmYVQq7', '_blank')}
                size="lg"
                className="w-full max-w-md bg-gradient-to-r from-[#6B4C9A] to-[#5B7DB1] hover:from-[#1AB5CC] hover:to-[#252770] text-white shadow-lg hover:shadow-xl transition-all"
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                Complete Feedback Form
                <Sparkles className="ml-2 h-5 w-5" />
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                Takes 2-3 minutes • Your responses are confidential
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-3 pt-4">
              <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                <p className="text-2xl font-bold text-[#6B4C9A]">2-3</p>
                <p className="text-xs text-gray-600">Minutes to complete</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                <p className="text-2xl font-bold text-[#5B7DB1]">100%</p>
                <p className="text-xs text-gray-600">Confidential</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
}
