import React from 'react';
import { Shield, AlertTriangle, Info, Users, School, User } from 'lucide-react';
import { AgeCategory } from '../../types/age-consent-types';
import { 
  getLiabilityProtections,
  getWarrantyDisclaimers,
  getNotLiableFor,
  getUserResponsibilities,
  getGuardianResponsibilities,
  getSchoolResponsibilities
} from '../../types/age-account-termination';

interface LiabilityDisclaimersProps {
  ageCategory: AgeCategory;
  isSchoolAccount: boolean;
  showFull?: boolean;
}

/**
 * Liability Disclaimers & Responsibilities
 * Age-appropriate legal protections and user responsibilities
 */
export function LiabilityDisclaimers({
  ageCategory,
  isSchoolAccount,
  showFull = true
}: LiabilityDisclaimersProps) {
  const protections = getLiabilityProtections(ageCategory);
  const warranties = getWarrantyDisclaimers(ageCategory);
  const notLiable = getNotLiableFor(ageCategory);
  const userResp = getUserResponsibilities(ageCategory);
  const guardianResp = getGuardianResponsibilities(ageCategory);
  const schoolResp = getSchoolResponsibilities(ageCategory);

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl p-6 mb-6 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-lg">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-white mb-1">Terms of Use & Liability</h1>
            <p className="text-white/90">
              Important information about platform use and responsibilities
            </p>
          </div>
        </div>
      </div>

      {/* Warranty Disclaimers */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-6 mb-6">
        <h2 className="text-gray-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-amber-600" />
          Important Disclaimers
        </h2>
        
        <div className="space-y-3">
          {warranties.map((warranty, index) => (
            <DisclaimerItem key={index} text={warranty} />
          ))}
        </div>

        <div className="mt-4 bg-white rounded-lg p-4 border border-amber-200">
          <p className="text-gray-800">
            <strong>⚠️ Educational Purpose Only:</strong> JotMinds assessments provide insights 
            for educational and self-discovery purposes. They are not psychological evaluations, 
            career counseling, or professional advice.
          </p>
        </div>
      </div>

      {/* Platform Liability Limitations */}
      {showFull && (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 mb-6">
          <h2 className="text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-600" />
            JotMinds Is Not Liable For
          </h2>
          
          <div className="grid md:grid-cols-2 gap-3">
            {notLiable.map((item, index) => (
              <NotLiableItem key={index} text={item} />
            ))}
          </div>
        </div>
      )}

      {/* User Responsibilities */}
      {userResp.length > 0 && userResp[0] !== 'N/A - Child not responsible for account management' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <h3 className="text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Your Responsibilities
          </h3>
          
          <div className="space-y-2">
            {userResp.map((resp, index) => (
              <ResponsibilityItem key={index} text={resp} color="blue" />
            ))}
          </div>
        </div>
      )}

      {/* Guardian Responsibilities */}
      {guardianResp.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-6">
          <h3 className="text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Parent/Guardian Responsibilities
          </h3>
          
          <div className="space-y-2">
            {guardianResp.map((resp, index) => (
              <ResponsibilityItem key={index} text={resp} color="purple" />
            ))}
          </div>

          {ageCategory === AgeCategory.EARLY_LEARNER && (
            <div className="mt-4 bg-white rounded-lg p-4 border border-purple-200">
              <p className="text-gray-800">
                <strong>⚠️ Full Supervision Required:</strong> Children ages 6-10 must be supervised 
                at all times while using the platform. Parents/guardians are responsible for all 
                interpretations and applications of assessment results.
              </p>
            </div>
          )}
        </div>
      )}

      {/* School Responsibilities */}
      {isSchoolAccount && schoolResp.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
          <h3 className="text-gray-900 mb-4 flex items-center gap-2">
            <School className="w-5 h-5 text-green-600" />
            School Responsibilities
          </h3>
          
          <div className="space-y-2">
            {schoolResp.map((resp, index) => (
              <ResponsibilityItem key={index} text={resp} color="green" />
            ))}
          </div>

          <div className="mt-4 bg-white rounded-lg p-4 border border-green-200">
            <p className="text-gray-800">
              <strong>FERPA Compliance:</strong> Schools using JotMinds must comply with all FERPA 
              requirements, including obtaining appropriate parental consent and maintaining 
              student data confidentiality.
            </p>
          </div>
        </div>
      )}

      {/* Indemnification */}
      {protections.indemnificationRequired && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
          <h3 className="text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Indemnification Agreement
          </h3>
          
          <p className="text-gray-700 mb-3">
            By using JotMinds, the following parties agree to indemnify and hold harmless 
            JotMinds from any claims arising from:
          </p>

          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
            <li>Misuse or misinterpretation of assessment results</li>
            <li>Decisions made based on platform insights</li>
            <li>Unauthorized sharing of results</li>
            <li>Failure to comply with terms of service</li>
            <li>Use outside intended educational purpose</li>
          </ul>

          <div className="bg-white rounded-lg p-4 border border-red-200">
            <p className="text-gray-800 mb-2">
              <strong>Indemnifying Parties:</strong>
            </p>
            <div className="flex flex-wrap gap-2">
              {protections.indemnificationParties.map((party, index) => (
                <span
                  key={index}
                  className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm"
                >
                  {party}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Age-Specific Notice */}
      <AgeSpecificNotice ageCategory={ageCategory} />

      {/* Contact Information */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
          <div className="text-gray-700">
            <p className="mb-2">
              <strong>Questions or Concerns?</strong>
            </p>
            <div className="space-y-1 text-sm">
              <p>📧 Legal: legal@jotminds.com</p>
              <p>📧 Support: support@jotminds.com</p>
              <p>📄 Full Terms: jotminds.com/terms</p>
              <p>🔒 Privacy Policy: jotminds.com/privacy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DisclaimerItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-amber-200">
      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
      <p className="text-gray-800">{text}</p>
    </div>
  );
}

function NotLiableItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <span className="text-red-600">✗</span>
      <p className="text-gray-700 text-sm">{text}</p>
    </div>
  );
}

function ResponsibilityItem({ text, color }: { text: string; color: 'blue' | 'purple' | 'green' }) {
  const colors = {
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    green: 'text-green-600'
  };

  return (
    <div className="flex items-start gap-2 text-gray-700">
      <span className={`${colors[color]} font-bold`}>✓</span>
      <p>{text}</p>
    </div>
  );
}

function AgeSpecificNotice({ ageCategory }: { ageCategory: AgeCategory }) {
  const notices = {
    [AgeCategory.EARLY_LEARNER]: {
      title: 'Ages 6-10: Minor Protection Notice',
      content: `This account is for a child aged 6-10. All assessment results are provided to 
                parents/guardians for educational support purposes only. Results should not be used 
                for commercial purposes, educational placement decisions, or diagnosis. Parents/guardians 
                are solely responsible for interpreting and applying insights appropriately.`,
      color: 'red'
    },
    [AgeCategory.JUNIOR_LEARNER]: {
      title: 'Ages 11-15: Student Account Notice',
      content: `This account is for a student aged 11-15. Assessment results are educational insights 
                to support learning and development. Results should be used with adult guidance and should 
                not be the sole basis for major educational or career decisions. Parents/guardians maintain 
                oversight responsibility.`,
      color: 'orange'
    },
    [AgeCategory.SENIOR_ADOLESCENT]: {
      title: 'Ages 16-18: Minor Account Notice',
      content: `This account is for a minor aged 16-18. While you have more independence in managing 
                your account, assessment results should be used as guidance, not absolute truth. Seek 
                advice from parents, teachers, or counselors for important decisions. Results are for 
                educational purposes only.`,
      color: 'blue'
    },
    [AgeCategory.ADULT]: {
      title: 'Adult Account Notice',
      content: `As an adult user, you have full control over your account. Assessment results are 
                provided for self-discovery and educational purposes. Use professional judgment when 
                applying insights to career, education, or personal decisions. Consider seeking 
                professional advice for major life decisions.`,
      color: 'green'
    }
  };

  const notice = notices[ageCategory];
  const colorClasses = {
    red: 'bg-red-50 border-red-200',
    orange: 'bg-orange-50 border-orange-200',
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200'
  };

  return (
    <div className={`${colorClasses[notice.color as keyof typeof colorClasses]} border-2 rounded-xl p-6 mb-6`}>
      <h3 className="text-gray-900 mb-3">{notice.title}</h3>
      <p className="text-gray-700">{notice.content}</p>
    </div>
  );
}

/**
 * Compact Liability Notice (for footers, modals, etc.)
 */
export function CompactLiabilityNotice({ ageCategory }: { ageCategory: AgeCategory }) {
  const warranties = getWarrantyDisclaimers(ageCategory);

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <p className="text-gray-600 text-sm mb-2">
        <strong>⚠️ Important:</strong> {warranties[0]}. {warranties[2]}.
      </p>
      <p className="text-gray-500 text-xs">
        By using this platform, you agree to our{' '}
        <a href="/terms" className="text-indigo-600 hover:underline">
          Terms of Service
        </a>{' '}
        and acknowledge these limitations.
      </p>
    </div>
  );
}
