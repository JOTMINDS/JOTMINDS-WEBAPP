import React from 'react';
import { Shield, Lock, Eye, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { AgeCategory } from '../../types/age-consent-types';
import { getPrivacyConfig, PrivacyLevel, isMinor } from '../../types/age-privacy-configs';

interface PrivacyProtectionBannerProps {
  ageCategory: AgeCategory;
  userName: string;
  age: number;
}

/**
 * Privacy Protection Banner
 * Shows age-appropriate privacy protections and limitations
 */
export function PrivacyProtectionBanner({
  ageCategory,
  userName,
  age
}: PrivacyProtectionBannerProps) {
  const privacyConfig = getPrivacyConfig(ageCategory);
  const minor = isMinor(ageCategory);

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Main Privacy Banner */}
      <PrivacyLevelBanner privacyLevel={privacyConfig.privacyLevel} age={age} />

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        {/* What We Protect */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <h3 className="text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            What We Protect
          </h3>
          
          <div className="space-y-3">
            <ProtectionItem
              icon={<CheckCircle className="w-4 h-4 text-green-600" />}
              text="Your assessment responses are private"
            />
            <ProtectionItem
              icon={<CheckCircle className="w-4 h-4 text-green-600" />}
              text="No data selling - ever"
            />
            <ProtectionItem
              icon={<CheckCircle className="w-4 h-4 text-green-600" />}
              text="Industry-standard encryption"
            />
            {minor && (
              <>
                <ProtectionItem
                  icon={<CheckCircle className="w-4 h-4 text-green-600" />}
                  text="No advertising or commercial profiling"
                />
                <ProtectionItem
                  icon={<CheckCircle className="w-4 h-4 text-green-600" />}
                  text="No location tracking"
                />
              </>
            )}
          </div>
        </div>

        {/* What's Not Allowed */}
        {minor && (
          <div className="bg-red-50 rounded-xl shadow-md p-6 border-2 border-red-200">
            <h3 className="text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Protected Features (Disabled)
            </h3>
            
            <div className="space-y-3">
              <ProhibitedItem text="❌ No peer messaging" />
              <ProhibitedItem text="❌ No social networking" />
              <ProhibitedItem text="❌ No advertising" />
              <ProhibitedItem text="❌ No location tracking" />
              <ProhibitedItem text="❌ No public profiles" />
              {ageCategory === AgeCategory.EARLY_LEARNER && (
                <>
                  <ProhibitedItem text="❌ No file uploads" />
                  <ProhibitedItem text="❌ No external links" />
                </>
              )}
            </div>
          </div>
        )}

        {/* Adult Privacy Controls */}
        {!minor && (
          <div className="bg-blue-50 rounded-xl shadow-md p-6 border border-blue-200">
            <h3 className="text-gray-900 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              Your Privacy Controls
            </h3>
            
            <div className="space-y-3">
              <ProtectionItem
                icon={<CheckCircle className="w-4 h-4 text-blue-600" />}
                text="Control your data collection preferences"
              />
              <ProtectionItem
                icon={<CheckCircle className="w-4 h-4 text-blue-600" />}
                text="Opt in/out of analytics anytime"
              />
              <ProtectionItem
                icon={<CheckCircle className="w-4 h-4 text-blue-600" />}
                text="Export your data anytime"
              />
              <ProtectionItem
                icon={<CheckCircle className="w-4 h-4 text-blue-600" />}
                text="Delete your account and data"
              />
            </div>
          </div>
        )}
      </div>

      {/* Data Minimization Notice */}
      <DataMinimizationNotice privacyConfig={privacyConfig} />

      {/* Guardian Oversight Notice */}
      {privacyConfig.guardianOversight.viewingRequired && (
        <GuardianOversightNotice ageCategory={ageCategory} userName={userName} />
      )}

      {/* Special Protections */}
      {privacyConfig.specialProtections.length > 0 && (
        <SpecialProtections protections={privacyConfig.specialProtections} />
      )}
    </div>
  );
}

function PrivacyLevelBanner({ privacyLevel, age }: { privacyLevel: PrivacyLevel; age: number }) {
  const bannerConfigs = {
    [PrivacyLevel.MAXIMUM]: {
      color: 'from-red-500 to-orange-500',
      icon: <Shield className="w-8 h-8" />,
      title: 'Maximum Privacy Protection',
      description: `Ages 6-10: Strictest data minimization and protection`
    },
    [PrivacyLevel.HIGH]: {
      color: 'from-orange-500 to-amber-500',
      icon: <Lock className="w-8 h-8" />,
      title: 'High Privacy Protection',
      description: `Ages 11-15: No public interactions, limited analytics`
    },
    [PrivacyLevel.MODERATE]: {
      color: 'from-blue-500 to-indigo-500',
      icon: <Eye className="w-8 h-8" />,
      title: 'Moderate Privacy Protection',
      description: `Ages 16-18: Broader features but still minor-protected`
    },
    [PrivacyLevel.STANDARD]: {
      color: 'from-green-500 to-teal-500',
      icon: <CheckCircle className="w-8 h-8" />,
      title: 'Standard Privacy Protection',
      description: `Ages 19+: Full access with standard data protection`
    }
  };

  const config = bannerConfigs[privacyLevel];

  return (
    <div className={`bg-gradient-to-r ${config.color} text-white rounded-xl p-6 shadow-lg`}>
      <div className="flex items-center gap-4">
        <div className="bg-white/20 p-3 rounded-lg">
          {config.icon}
        </div>
        <div className="flex-1">
          <h2 className="text-white mb-1">{config.title}</h2>
          <p className="text-white/90">
            {config.description} · Age {age}
          </p>
        </div>
      </div>
    </div>
  );
}

function ProtectionItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-start gap-2">
      {icon}
      <span className="text-gray-700 text-sm">{text}</span>
    </div>
  );
}

function ProhibitedItem({ text }: { text: string }) {
  return (
    <div className="text-red-800 text-sm">
      {text}
    </div>
  );
}

function DataMinimizationNotice({ privacyConfig }: { privacyConfig: any }) {
  const level = privacyConfig.dataMinimization.level;
  
  const notices = {
    strictest: {
      title: 'Strictest Data Minimization',
      description: 'We only collect your name, age, and assessment responses. No behavioral tracking, no analytics, no location data.',
      color: 'red'
    },
    high: {
      title: 'High Data Minimization',
      description: 'We collect only essential information: name, age, email, and basic usage data for educational purposes only.',
      color: 'orange'
    },
    moderate: {
      title: 'Moderate Data Collection',
      description: 'We collect standard information to personalize your experience. No location tracking or social connections.',
      color: 'blue'
    },
    standard: {
      title: 'Standard Data Collection',
      description: 'With your consent, we collect data to provide personalized insights. You control all privacy settings.',
      color: 'green'
    }
  };

  const notice = notices[level as keyof typeof notices];
  const colorClasses = {
    red: 'bg-red-50 border-red-200',
    orange: 'bg-orange-50 border-orange-200',
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200'
  };

  return (
    <div className={`${colorClasses[notice.color as keyof typeof colorClasses]} border-2 rounded-xl p-6 mt-6`}>
      <h3 className="text-gray-900 mb-2 flex items-center gap-2">
        <Lock className="w-5 h-5" />
        {notice.title}
      </h3>
      <p className="text-gray-700">{notice.description}</p>
      
      {privacyConfig.dataMinimization.anonymizeData && (
        <div className="mt-3 bg-white rounded-lg p-3 border border-gray-200">
          <p className="text-gray-700 text-sm">
            <strong>✓ Data Anonymization:</strong> All data is anonymized for your protection.
          </p>
        </div>
      )}
    </div>
  );
}

function GuardianOversightNotice({ ageCategory, userName }: { ageCategory: AgeCategory; userName: string }) {
  return (
    <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-6 mt-6">
      <h3 className="text-gray-900 mb-3 flex items-center gap-2">
        <Eye className="w-5 h-5 text-indigo-600" />
        Guardian Oversight
      </h3>
      
      {ageCategory === AgeCategory.EARLY_LEARNER && (
        <div className="space-y-2 text-gray-700">
          <p>
            <strong>Full Supervision Required:</strong> Your parent/guardian must supervise all activities.
          </p>
          <p>
            All results and insights are visible only to your parent/guardian, who has complete account control.
          </p>
        </div>
      )}
      
      {ageCategory === AgeCategory.JUNIOR_LEARNER && (
        <div className="space-y-2 text-gray-700">
          <p>
            <strong>Guardian Oversight Active:</strong> Your parent/guardian can view your activity and results.
          </p>
          <p>
            This helps them support your learning journey and ensure your safety online.
          </p>
        </div>
      )}
    </div>
  );
}

function SpecialProtections({ protections }: { protections: string[] }) {
  return (
    <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mt-6">
      <h3 className="text-gray-900 mb-4 flex items-center gap-2">
        <Shield className="w-5 h-5 text-purple-600" />
        Special Privacy Protections
      </h3>
      
      <div className="grid md:grid-cols-2 gap-3">
        {protections.map((protection, index) => (
          <div key={index} className="flex items-start gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700">{protection}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
