import React from 'react';
import { Shield, Eye, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { getParentResponsibilities, getMonitoringLevelDescription } from '../../types/age-feature-configs';
import { AgeCategory } from '../../types/age-consent-types';

interface ParentResponsibilitiesGuideProps {
  ageCategory: AgeCategory;
  childAge: number;
  childName: string;
}

/**
 * Parent/Guardian Responsibilities Guide
 * Shows age-appropriate responsibilities for parents/guardians
 */
export function ParentResponsibilitiesGuide({
  ageCategory,
  childAge,
  childName
}: ParentResponsibilitiesGuideProps) {
  const responsibilities = getParentResponsibilities(ageCategory);
  const monitoringDesc = getMonitoringLevelDescription(responsibilities.monitoringLevel);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-8 mb-6 shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 p-3 rounded-lg">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-white mb-2">Parent/Guardian Responsibilities</h1>
            <p className="text-blue-100">
              For {childName} · Age {childAge}
            </p>
          </div>
        </div>
      </div>

      {/* Responsibility Level */}
      <ResponsibilityLevel
        required={responsibilities.required}
        recommended={responsibilities.recommended}
        optional={responsibilities.optional}
        notApplicable={responsibilities.notApplicable}
        ageCategory={ageCategory}
        childAge={childAge}
      />

      {/* Monitoring Level */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 mb-6">
        <div className="flex items-start gap-4">
          <div className="bg-indigo-100 p-3 rounded-lg">
            <Eye className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-gray-900 mb-2">Monitoring Level: {responsibilities.monitoringLevel.charAt(0).toUpperCase() + responsibilities.monitoringLevel.slice(1)}</h3>
            <p className="text-gray-700">{monitoringDesc}</p>
          </div>
        </div>
      </div>

      {/* Specific Responsibilities */}
      {!responsibilities.notApplicable && (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 mb-6">
          <h3 className="text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Your Responsibilities
          </h3>
          
          <div className="space-y-3">
            {responsibilities.responsibilities.map((responsibility, index) => (
              <ResponsibilityItem key={index} text={responsibility} />
            ))}
          </div>
        </div>
      )}

      {/* Age-Specific Guidance */}
      <AgeSpecificGuidance ageCategory={ageCategory} childName={childName} childAge={childAge} />

      {/* Quick Actions */}
      {!responsibilities.notApplicable && (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-md p-6 border border-purple-200">
          <h3 className="text-gray-900 mb-4">Quick Actions</h3>
          
          <div className="grid md:grid-cols-2 gap-3">
            <QuickActionButton icon="👁️" text="View Child's Progress" />
            <QuickActionButton icon="📊" text="Review Assessment Results" />
            <QuickActionButton icon="⚙️" text="Manage Account Settings" />
            <QuickActionButton icon="📧" text="Update Contact Information" />
            {responsibilities.monitoringLevel === 'full' && (
              <>
                <QuickActionButton icon="🔒" text="Privacy & Data Controls" />
                <QuickActionButton icon="🗑️" text="Request Data Deletion" />
              </>
            )}
          </div>
        </div>
      )}

      {/* Support Information */}
      <div className="bg-gray-50 rounded-xl p-6 mt-6 border border-gray-200">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
          <div className="text-gray-700">
            <p className="mb-2">
              <strong>Need Help?</strong> We're here to support you in guiding {childName}'s learning journey.
            </p>
            <div className="space-y-1 text-sm">
              <p>📧 Parent Support: parents@jotminds.com</p>
              <p>📞 Response Time: Within 24 hours</p>
              <p>📚 Parent Resources: Available in your dashboard</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ResponsibilityLevelProps {
  required: boolean;
  recommended: boolean;
  optional: boolean;
  notApplicable: boolean;
  ageCategory: AgeCategory;
  childAge: number;
}

function ResponsibilityLevel({
  required,
  recommended,
  optional,
  notApplicable,
  ageCategory,
  childAge
}: ResponsibilityLevelProps) {
  if (notApplicable) {
    return (
      <div className="bg-gray-100 border-2 border-gray-300 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="bg-gray-300 p-3 rounded-lg">
            <AlertCircle className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <h3 className="text-gray-900 mb-2">Not Applicable (Ages 19+)</h3>
            <p className="text-gray-700">
              No parental involvement or oversight is required. The user has complete account independence 
              and full control over their data and activities.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (required) {
    return (
      <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="bg-red-200 p-3 rounded-lg">
            <Shield className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-gray-900 mb-2">Required (Ages 6-12)</h3>
            {ageCategory === AgeCategory.JUNIOR_LEARNER && childAge >= 11 && childAge <= 12 ? (
              <p className="text-gray-700">
                <strong>Full parental consent and oversight required.</strong> As your child is {childAge} years old, 
                you must monitor all activities, review results, and maintain account security.
              </p>
            ) : (
              <p className="text-gray-700">
                <strong>Full parental supervision required.</strong> You must supervise all activities, 
                as your child cannot use the platform independently at this age.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (recommended) {
    return (
      <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="bg-amber-200 p-3 rounded-lg">
            <AlertCircle className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-gray-900 mb-2">Recommended (Ages 13-15)</h3>
            <p className="text-gray-700">
              <strong>Parental oversight strongly recommended.</strong> While your child can use the platform 
              independently, we recommend periodic monitoring and reviewing results together to support 
              their learning journey.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (optional) {
    return (
      <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="bg-blue-200 p-3 rounded-lg">
            <Info className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-gray-900 mb-2">Optional (Ages 16-18)</h3>
            <p className="text-gray-700">
              <strong>Parental oversight is optional.</strong> Your child can manage their account independently. 
              You may request access if your child grants permission, but it's not required.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function ResponsibilityItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
      <p className="text-gray-700">{text}</p>
    </div>
  );
}

function AgeSpecificGuidance({
  ageCategory,
  childName,
  childAge
}: {
  ageCategory: AgeCategory;
  childName: string;
  childAge: number;
}) {
  let guidance = [];

  switch (ageCategory) {
    case AgeCategory.EARLY_LEARNER:
      guidance = [
        `Sit with ${childName} during assessment sessions to ensure they understand questions`,
        `Review all results in your Parent Dashboard before discussing with ${childName}`,
        `Use age-appropriate language when explaining insights`,
        `Focus on positive reinforcement and encouragement`,
        `Set time limits for platform usage (recommended: 20-30 minutes per session)`,
        `Ensure ${childName} understands that there are no "wrong" answers`
      ];
      break;

    case AgeCategory.JUNIOR_LEARNER:
      if (childAge >= 11 && childAge <= 12) {
        guidance = [
          `Check in with ${childName} about their assessment experiences regularly`,
          `Review results together and discuss insights`,
          `Help ${childName} understand how to apply insights to schoolwork`,
          `Monitor sharing of results with friends or classmates`,
          `Discuss any career interests that emerge from assessments`,
          `Encourage ${childName} to ask questions about their results`
        ];
      } else {
        guidance = [
          `Have open conversations about ${childName}'s assessment results`,
          `Respect ${childName}'s growing independence while staying informed`,
          `Be available to discuss insights if ${childName} wants to share`,
          `Support ${childName}'s exploration of strengths and interests`,
          `Discuss data privacy and online safety periodically`,
          `Encourage responsible use of insights for academic planning`
        ];
      }
      break;

    case AgeCategory.SENIOR_ADOLESCENT:
      guidance = [
        `Respect ${childName}'s account independence and privacy`,
        `Be available if ${childName} wants to discuss career insights`,
        `Support ${childName}'s exploration of college and career paths`,
        `Discuss insights only if ${childName} voluntarily shares`,
        `Recognize ${childName}'s maturity in managing their own learning`,
        `Offer guidance on using insights for college/career planning if asked`
      ];
      break;

    default:
      guidance = [];
  }

  if (guidance.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 mb-6">
      <h3 className="text-gray-900 mb-4 flex items-center gap-2">
        💡 Age-Appropriate Guidance
      </h3>
      
      <div className="space-y-2">
        {guidance.map((item, index) => (
          <div key={index} className="flex items-start gap-3">
            <span className="text-indigo-600 font-bold">•</span>
            <p className="text-gray-700">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickActionButton({ icon, text }: { icon: string; text: string }) {
  return (
    <button className="flex items-center gap-3 bg-white p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all text-left">
      <span className="text-2xl">{icon}</span>
      <span className="text-gray-700">{text}</span>
    </button>
  );
}
