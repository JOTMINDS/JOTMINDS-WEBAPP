import React from 'react';
import { ArrowLeft, FileText, AlertTriangle, Shield, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';

interface TermsOfUsePageProps {
  onBack?: () => void;
}

/**
 * Terms of Use Page
 * Displays the complete JotMinds Terms of Use
 */
export function TermsOfUsePage({ onBack }: TermsOfUsePageProps) {
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
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-white text-2xl">JotMinds Terms of Use</h1>
                <p className="text-white/90 text-sm">
                  Effective December 1, 2025
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Introduction */}
        <Alert className="mb-8 border-indigo-200 bg-indigo-50">
          <Shield className="h-5 w-5 text-indigo-600" />
          <AlertDescription className="text-gray-700">
            By accessing or using the JotMinds Platform, you agree to be bound by these Terms of Use. 
            Please read them carefully before proceeding.
          </AlertDescription>
        </Alert>

        {/* 1. Acceptance of Terms */}
        <Card className="mb-6 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-indigo-600">1.</span> Acceptance of Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              Welcome to <strong>JotMinds</strong>, an educational cognitive assessment platform operated by{' '}
              <strong>i2 Communications Ltd</strong>, Ghana. By creating an account, accessing, or using any part 
              of the JotMinds Platform ("Platform," "Services," "we," "us," or "our"), you agree to comply with 
              and be legally bound by these Terms of Use ("Terms").
            </p>
            <p>
              If you do not agree to these Terms, you may not use the Platform.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
              <p className="font-semibold text-amber-900 mb-2">⚠️ Important for Minors:</p>
              <ul className="space-y-1 text-amber-800 ml-4 list-disc">
                <li>Users aged 6–12 require verifiable parental consent</li>
                <li>Users aged 13–15 require parental notification</li>
                <li>Users aged 16–18 may consent independently but are encouraged to involve parents</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 2. Eligibility */}
        <Card className="mb-6 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-indigo-600">2.</span> Eligibility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>You must be at least <strong>6 years old</strong> to use the Platform. Age-specific requirements apply:</p>
            
            <div className="grid gap-3">
              <div className="border-l-4 border-purple-400 pl-4 py-2 bg-purple-50/50">
                <p className="font-semibold text-purple-900">Ages 6–10 (Early Learners)</p>
                <p className="text-sm text-purple-800">Parental consent required. Kids Mode enabled with simplified interface.</p>
              </div>
              
              <div className="border-l-4 border-blue-400 pl-4 py-2 bg-blue-50/50">
                <p className="font-semibold text-blue-900">Ages 11–15 (Junior Learners)</p>
                <p className="text-sm text-blue-800">Parental notification required. Standard assessment interface.</p>
              </div>
              
              <div className="border-l-4 border-indigo-400 pl-4 py-2 bg-indigo-50/50">
                <p className="font-semibold text-indigo-900">Ages 16–18 (Senior Adolescents)</p>
                <p className="text-sm text-indigo-800">Independent consent permitted. Full platform access.</p>
              </div>
              
              <div className="border-l-4 border-gray-400 pl-4 py-2 bg-gray-50/50">
                <p className="font-semibold text-gray-900">Ages 19+ (Adults)</p>
                <p className="text-sm text-gray-800">Full independent access. All features available.</p>
              </div>
            </div>

            <p className="text-sm italic">
              By using the Platform, you represent and warrant that you meet these eligibility requirements.
            </p>
          </CardContent>
        </Card>

        {/* 3. Platform Purpose & Services */}
        <Card className="mb-6 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-indigo-600">3.</span> Platform Purpose & Services
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              JotMinds provides <strong>cognitive assessment tools</strong> designed to help users understand their:
            </p>
            <ul className="ml-6 space-y-2 list-disc">
              <li><strong>Learning Style</strong> – How you absorb and process information</li>
              <li><strong>Thinking Style</strong> – How you approach problems and ideas</li>
              <li><strong>Decision-Making Style</strong> – How you make choices</li>
            </ul>
            <p>
              Our services include assessments, cognitive profiles, personalized insights, and optional parent/teacher dashboards.
            </p>
            
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-blue-900">
                <strong>Educational Tool Only:</strong> JotMinds is designed for educational and self-awareness purposes. 
                It is NOT a diagnostic tool, medical service, or psychological evaluation.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* 4. User Accounts */}
        <Card className="mb-6 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-indigo-600">4.</span> User Accounts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <h3 className="font-semibold text-lg">4.1 Account Registration</h3>
            <p>To use certain features, you must create an account by providing:</p>
            <ul className="ml-6 list-disc space-y-1">
              <li>Name (first and last)</li>
              <li>Email address</li>
              <li>Date of birth</li>
              <li>Password</li>
              <li>Age consent acknowledgment</li>
            </ul>

            <h3 className="font-semibold text-lg mt-6">4.2 Account Security</h3>
            <p>You are responsible for:</p>
            <ul className="ml-6 list-disc space-y-1">
              <li>Maintaining the confidentiality of your password</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
            </ul>

            <h3 className="font-semibold text-lg mt-6">4.3 Parental Accounts</h3>
            <p>
              Parents may create accounts to monitor their child's progress (ages 6–12 require parental linking). 
              Parents must verify their identity via a 6-digit PIN system.
            </p>
          </CardContent>
        </Card>

        {/* 5. Acceptable Use Policy */}
        <Card className="mb-6 shadow-sm border-amber-200">
          <CardHeader className="bg-amber-50/50">
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-indigo-600">5.</span> Acceptable Use Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>You agree to use the Platform in a lawful and responsible manner. You may NOT:</p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Provide False Information</p>
                  <p className="text-sm text-gray-600">Submit inaccurate, misleading, or fraudulent data</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Abuse or Harass</p>
                  <p className="text-sm text-gray-600">Engage in bullying, harassment, or offensive behavior</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Reverse Engineer</p>
                  <p className="text-sm text-gray-600">Attempt to decompile, hack, or access source code</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Scrape or Automate</p>
                  <p className="text-sm text-gray-600">Use bots, scrapers, or automated tools without permission</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Share Accounts</p>
                  <p className="text-sm text-gray-600">Allow others to use your account credentials</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Violate Laws</p>
                  <p className="text-sm text-gray-600">Engage in illegal activity or violate international regulations</p>
                </div>
              </div>
            </div>

            <Alert className="bg-red-50 border-red-200 mt-4">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <AlertDescription className="text-red-900">
                <strong>Violation of these rules may result in immediate account suspension or termination.</strong>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* 6. Account Suspension & Termination */}
        <Card className="mb-6 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-indigo-600">6.</span> Account Suspension & Termination
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <h3 className="font-semibold text-lg">6.1 Grounds for Suspension/Termination</h3>
            <p>We reserve the right to suspend or terminate your account if you:</p>
            <ul className="ml-6 list-disc space-y-1">
              <li>Violate these Terms of Use</li>
              <li>Provide false or misleading information</li>
              <li>Engage in fraudulent or harmful activity</li>
              <li>Violate applicable laws (COPPA, GDPR, FERPA, Ghana Act 843)</li>
              <li>Fail to respond to verification requests</li>
            </ul>

            <h3 className="font-semibold text-lg mt-6">6.2 Termination Process</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <p><strong>Step 1:</strong> Email notification to registered email address</p>
              <p><strong>Step 2:</strong> 14-day grace period for minor violations (immediate for serious violations)</p>
              <p><strong>Step 3:</strong> Account deactivation if no response or resolution</p>
              <p><strong>Step 4:</strong> Data deletion after 30 days (unless required by law)</p>
            </div>

            <h3 className="font-semibold text-lg mt-6">6.3 Your Right to Terminate</h3>
            <p>
              You may delete your account at any time through your account settings or by contacting{' '}
              <a href="mailto:support@jotminds.com" className="text-indigo-600 hover:underline">
                support@jotminds.com
              </a>
            </p>
          </CardContent>
        </Card>

        {/* 7. Intellectual Property */}
        <Card className="mb-6 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-indigo-600">7.</span> Intellectual Property
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              All content on the Platform—including text, graphics, logos, assessment questions, algorithms, 
              software, and the "Jot" robot mascot—is the property of <strong>i2 Communications Ltd</strong> or 
              its licensors and is protected by copyright, trademark, and other intellectual property laws.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  You MAY:
                </h4>
                <ul className="text-sm text-green-800 space-y-1 ml-4 list-disc">
                  <li>Use the Platform for personal/educational purposes</li>
                  <li>Share your own assessment results (if you choose)</li>
                  <li>Print your cognitive profile for personal use</li>
                </ul>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  You MAY NOT:
                </h4>
                <ul className="text-sm text-red-800 space-y-1 ml-4 list-disc">
                  <li>Copy, modify, or distribute Platform content</li>
                  <li>Use assessment questions in other products</li>
                  <li>Claim ownership of JotMinds materials</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 8. Disclaimers & Limitations of Liability */}
        <Card className="mb-6 shadow-sm border-amber-200">
          <CardHeader className="bg-amber-50/50">
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-indigo-600">8.</span> Disclaimers & Limitations of Liability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <h3 className="font-semibold text-lg">8.1 Not Medical or Professional Advice</h3>
            <Alert className="bg-amber-50 border-amber-300">
              <AlertDescription className="text-amber-900">
                <strong>IMPORTANT:</strong> JotMinds is an <strong>educational tool</strong>, not a substitute for 
                professional psychological evaluation, medical diagnosis, or career counseling. Do not rely solely 
                on our assessments for critical decisions.
              </AlertDescription>
            </Alert>

            <h3 className="font-semibold text-lg mt-6">8.2 "AS IS" Service</h3>
            <p>
              The Platform is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, either express or implied, 
              including but not limited to:
            </p>
            <ul className="ml-6 list-disc space-y-1 text-sm">
              <li>Accuracy, reliability, or completeness of assessments</li>
              <li>Uninterrupted or error-free operation</li>
              <li>Fitness for a particular purpose</li>
            </ul>

            <h3 className="font-semibold text-lg mt-6">8.3 Limitation of Liability</h3>
            <p className="text-sm">
              To the fullest extent permitted by law, <strong>i2 Communications Ltd</strong> shall NOT be liable for:
            </p>
            <ul className="ml-6 list-disc space-y-1 text-sm">
              <li>Indirect, incidental, or consequential damages</li>
              <li>Loss of data, profits, or business opportunities</li>
              <li>Decisions made based on assessment results</li>
              <li>Unauthorized access to your account (if due to your negligence)</li>
            </ul>

            <p className="text-sm italic mt-4">
              In no event shall our total liability exceed the amount you paid for services in the past 12 months, 
              or $100 USD (whichever is greater).
            </p>
          </CardContent>
        </Card>

        {/* 9. Privacy & Data Protection */}
        <Card className="mb-6 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-indigo-600">9.</span> Privacy & Data Protection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              Your privacy is important to us. Our collection, use, and protection of your personal data is governed 
              by our <strong>Privacy Policy</strong>, which is incorporated into these Terms by reference.
            </p>
            
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <p className="font-semibold text-indigo-900 mb-2">Key Privacy Commitments:</p>
              <ul className="text-sm text-indigo-800 space-y-1 ml-4 list-disc">
                <li>COPPA compliance for users under 13</li>
                <li>GDPR compliance for EU users</li>
                <li>FERPA compliance for school accounts</li>
                <li>Ghana Data Protection Act (Act 843) compliance</li>
                <li>Parental access controls for children's data</li>
                <li>Right to request data deletion</li>
              </ul>
            </div>

            <p className="text-sm">
              Please review our{' '}
              <a href="#" className="text-indigo-600 hover:underline font-semibold">
                Privacy Policy
              </a>{' '}
              for complete details.
            </p>
          </CardContent>
        </Card>

        {/* 10. International Use & Governing Law */}
        <Card className="mb-6 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-indigo-600">10.</span> International Use & Governing Law
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <h3 className="font-semibold text-lg">10.1 Governing Law</h3>
            <p>
              These Terms are governed by the laws of <strong>Ghana</strong>, specifically the{' '}
              <strong>Data Protection Act, 2012 (Act 843)</strong>, without regard to conflict of law principles.
            </p>

            <h3 className="font-semibold text-lg mt-6">10.2 International Compliance</h3>
            <p>Where applicable, we also comply with:</p>
            <ul className="ml-6 list-disc space-y-1 text-sm">
              <li><strong>COPPA</strong> (Children's Online Privacy Protection Act – USA)</li>
              <li><strong>GDPR</strong> (General Data Protection Regulation – EU/UK)</li>
              <li><strong>FERPA</strong> (Family Educational Rights and Privacy Act – USA)</li>
            </ul>

            <h3 className="font-semibold text-lg mt-6">10.3 Dispute Resolution</h3>
            <p className="text-sm">
              Any disputes arising from these Terms shall be resolved through:
            </p>
            <ol className="ml-6 list-decimal space-y-1 text-sm">
              <li>Good faith negotiation</li>
              <li>Mediation (if negotiation fails)</li>
              <li>Arbitration under Ghana Commercial Law (final step)</li>
            </ol>
          </CardContent>
        </Card>

        {/* 11. Changes to Terms */}
        <Card className="mb-6 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-indigo-600">11.</span> Changes to These Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              We reserve the right to modify these Terms at any time. Changes will be posted on this page with an 
              updated "Effective Date." Significant changes will be communicated via:
            </p>
            <ul className="ml-6 list-disc space-y-1">
              <li>Email notification to registered users</li>
              <li>Prominent banner on the Platform homepage</li>
              <li>Pop-up notice upon next login (for material changes)</li>
            </ul>
            <p>
              Your continued use of the Platform after changes are posted constitutes acceptance of the new Terms.
            </p>
          </CardContent>
        </Card>

        {/* 12. Contact Information */}
        <Card className="mb-6 shadow-sm border-indigo-200">
          <CardHeader className="bg-indigo-50/50">
            <CardTitle className="flex items-center gap-2">
              <span className="text-indigo-600">12.</span> Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>If you have questions about these Terms, please contact us:</p>
            
            <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
              <div>
                <p className="font-semibold text-gray-900">JotMinds Platform</p>
                <p className="text-sm text-gray-600">Operated by i2 Communications Ltd</p>
              </div>
              
              <div className="text-sm space-y-1">
                <p><strong>Email:</strong>{' '}
                  <a href="mailto:legal@jotminds.com" className="text-indigo-600 hover:underline">
                    legal@jotminds.com
                  </a>
                </p>
                <p><strong>Support:</strong>{' '}
                  <a href="mailto:support@jotminds.com" className="text-indigo-600 hover:underline">
                    support@jotminds.com
                  </a>
                </p>
                <p><strong>Website:</strong>{' '}
                  <a href="https://jotminds.com" className="text-indigo-600 hover:underline">
                    www.jotminds.com
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Final Acknowledgment */}
        <Alert className="border-indigo-300 bg-indigo-50">
          <Shield className="h-5 w-5 text-indigo-600" />
          <AlertDescription className="text-indigo-900">
            <strong>By using JotMinds, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use.</strong>
          </AlertDescription>
        </Alert>

        {/* Last Updated */}
        <div className="text-center text-sm text-gray-500 mt-8 pt-6 border-t">
          <p>Last Updated: December 1, 2025</p>
          <p className="mt-2">Version 1.0</p>
        </div>
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
              Questions? Contact us at{' '}
              <a 
                href="mailto:legal@jotminds.com" 
                className="text-indigo-600 hover:underline"
              >
                legal@jotminds.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
