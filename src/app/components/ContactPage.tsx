import React, { useState } from 'react';
import { ArrowLeft, Mail, MessageSquare, Send, MapPin, Phone, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';

interface ContactPageProps {
  onBack?: () => void;
}

/**
 * Contact Page
 * Allows users to contact JotMinds support team
 */
export function ContactPage({ onBack }: ContactPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission (replace with actual API call)
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: 'general',
        message: ''
      });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button
                variant="ghost"
                onClick={onBack}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Button>
            )}
            <div className="flex items-center gap-3 flex-1">
              <div className="bg-white/20 p-3 rounded-lg">
                <MessageSquare className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-white text-2xl">Contact Us</h1>
                <p className="text-white/90 text-sm">
                  We're here to help with any questions or concerns
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form - Main Section */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5 text-indigo-600" />
                  Send Us a Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isSubmitted ? (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <AlertDescription className="text-green-900">
                      <strong>Message sent successfully!</strong> We'll get back to you within 24-48 hours.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name */}
                    <div>
                      <label htmlFor="name" className="block text-sm mb-2 text-gray-700">
                        Your Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="John Doe"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm mb-2 text-gray-700">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="your.email@example.com"
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label htmlFor="category" className="block text-sm mb-2 text-gray-700">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="general">General Inquiry</option>
                        <option value="technical">Technical Support</option>
                        <option value="account">Account Issues</option>
                        <option value="privacy">Privacy Concerns</option>
                        <option value="parent">Parent/Guardian Support</option>
                        <option value="teacher">Teacher/School Support</option>
                        <option value="feedback">Feedback & Suggestions</option>
                        <option value="partnership">Partnership Opportunities</option>
                      </select>
                    </div>

                    {/* Subject */}
                    <div>
                      <label htmlFor="subject" className="block text-sm mb-2 text-gray-700">
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Brief description of your inquiry"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="message" className="block text-sm mb-2 text-gray-700">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                        placeholder="Please provide as much detail as possible about your inquiry..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Minimum 10 characters
                      </p>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isSubmitting || formData.message.length < 10}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Contact Information - Sidebar */}
          <div className="space-y-6">
            {/* Contact Details */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Get in Touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <Mail className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <a 
                      href="mailto:support@jotminds.com" 
                      className="text-indigo-600 hover:underline"
                    >
                      support@jotminds.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Mail className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Privacy Concerns</p>
                    <a 
                      href="mailto:privacy@jotminds.com" 
                      className="text-purple-600 hover:underline"
                    >
                      privacy@jotminds.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Legal Matters</p>
                    <a 
                      href="mailto:legal@jotminds.com" 
                      className="text-blue-600 hover:underline"
                    >
                      legal@jotminds.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Clock className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Response Time</p>
                    <p className="text-sm">24-48 hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Company Information */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Operated By</p>
                  <p className="font-semibold">i2 Communications Ltd</p>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Location</p>
                    <p className="text-sm">Ghana</p>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <p className="text-xs text-gray-500">
                    Registered under Ghana Data Protection Act, 2012 (Act 843)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Quick Links */}
            <Card className="shadow-lg border-indigo-200 bg-indigo-50/50">
              <CardHeader>
                <CardTitle className="text-lg">Before You Contact</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 mb-3">
                  Check our resources for quick answers:
                </p>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#" className="text-indigo-600 hover:underline">
                      → Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-indigo-600 hover:underline">
                      → Terms of Use
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-indigo-600 hover:underline">
                      → Parent Guide
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-indigo-600 hover:underline">
                      → Teacher Resources
                    </a>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Help Section */}
        <Card className="mt-8 shadow-sm bg-gradient-to-r from-indigo-50 to-purple-50">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Need Immediate Help?</h3>
                <p className="text-sm text-gray-600">
                  For urgent issues affecting child safety or data security, please email{' '}
                  <a href="mailto:urgent@jotminds.com" className="text-indigo-600 hover:underline font-semibold">
                    urgent@jotminds.com
                  </a>
                </p>
              </div>
              <div className="flex gap-2">
                <div className="bg-red-100 px-4 py-2 rounded-lg">
                  <p className="text-xs text-red-800">Emergency Response</p>
                  <p className="text-sm font-semibold text-red-900">Within 2 hours</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="border-t bg-white/50 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">
              <strong>JotMinds Platform</strong>
            </p>
            <p className="text-sm">
              Operated by i2 Communications Ltd, Ghana
            </p>
            <p className="text-sm mt-2">
              We typically respond within 24-48 hours during business days
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
