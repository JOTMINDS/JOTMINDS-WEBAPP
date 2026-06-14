import React from 'react';
import { Scale, Globe, Shield, FileText, MapPin, AlertCircle } from 'lucide-react';
import { 
  Jurisdiction,
  GOVERNING_LAW,
  GHANA_ACT_843,
  getApplicableLaws,
  getInternationalProtection,
  getConsentAge
} from '../../types/governing-law-configs';

interface GoverningLawNoticeProps {
  userJurisdiction: Jurisdiction;
  userAge?: number;
  showFull?: boolean;
}

/**
 * Governing Law Notice Component
 * Displays applicable laws based on Ghana (Act 843) + international location
 */
export function GoverningLawNotice({
  userJurisdiction,
  userAge,
  showFull = true
}: GoverningLawNoticeProps) {
  const applicableLaws = getApplicableLaws(userJurisdiction);
  const internationalProtection = getInternationalProtection(userJurisdiction);
  const consentAge = getConsentAge(userJurisdiction);
  const isInternational = userJurisdiction !== Jurisdiction.GHANA;

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-yellow-600 text-white rounded-xl p-6 mb-6 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-lg">
            <Scale className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-white mb-1">Governing Law & Jurisdiction</h1>
            <p className="text-white/90">
              Republic of Ghana with international protections
            </p>
          </div>
        </div>
      </div>

      {/* Primary Jurisdiction - Ghana */}
      <div className="bg-white rounded-xl shadow-md p-6 border-2 border-green-600 mb-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="bg-green-100 p-3 rounded-lg">
            <MapPin className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-gray-900 mb-2">Primary Jurisdiction: Republic of Ghana 🇬🇭</h2>
            <p className="text-gray-700">
              These Terms and Conditions are governed by the <strong>Laws of the Republic of Ghana</strong>.
            </p>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-gray-900 mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-600" />
            Applicable Ghanaian Laws
          </h3>
          
          <div className="space-y-2">
            {GOVERNING_LAW.applicableLaws.map((law, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span className="text-gray-700">{law}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ghana Children's Act 843 */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 mb-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="bg-purple-100 p-3 rounded-lg">
            <Shield className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-gray-900 mb-2">
              Ghana Children's Act, 1998 (Act 843)
            </h2>
            <p className="text-gray-700 mb-3">
              JotMinds complies with <strong>Act 843</strong>, Ghana's primary legislation for 
              child protection and welfare.
            </p>
            
            <div className="grid md:grid-cols-2 gap-3 mb-4">
              <InfoBadge label="Minor Definition" value={GHANA_ACT_843.minorDefinition} />
              <InfoBadge label="Age of Majority" value="18 years" />
              <InfoBadge label="Parental Consent" value="Required under 18" />
              <InfoBadge label="Jurisdiction" value="Republic of Ghana" />
            </div>
          </div>
        </div>

        {showFull && (
          <Act843Details />
        )}
      </div>

      {/* International Protections */}
      {isInternational && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Globe className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-gray-900 mb-2">
                Additional International Protections
              </h2>
              <p className="text-gray-700 mb-3">
                When used internationally, JotMinds applies <strong>additional protections</strong> 
                from your location's data protection laws.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-blue-200 mb-4">
            <h3 className="text-gray-900 mb-3">
              Your Location: {getJurisdictionName(userJurisdiction)}
            </h3>
            <p className="text-gray-700 mb-3">
              <strong>Applicable Regulation:</strong> {internationalProtection.regulationName}
            </p>
            <p className="text-gray-700">
              <strong>Consent Age in Your Location:</strong> Under {internationalProtection.applicableAge} years
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-gray-900">Additional Protections Applied:</h4>
            {internationalProtection.provisions.map((provision, index) => (
              <div key={index} className="flex items-start gap-2 text-gray-700">
                <span className="text-blue-600">✓</span>
                <span>{provision}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dispute Resolution */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 mb-6">
        <h2 className="text-gray-900 mb-4 flex items-center gap-2">
          <Scale className="w-5 h-5 text-indigo-600" />
          Dispute Resolution
        </h2>
        
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="text-gray-900 mb-2">Primary Venue</h4>
            <p className="text-gray-700">
              {GOVERNING_LAW.disputeResolution.primaryVenue}
            </p>
          </div>

          {GOVERNING_LAW.disputeResolution.arbitrationClause && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="text-gray-900 mb-2">Alternative Dispute Resolution</h4>
              <p className="text-gray-700">
                {GOVERNING_LAW.disputeResolution.alternativeResolution}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* User-Specific Notice */}
      {userAge && userAge < consentAge && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-gray-900 mb-2">Minor Protection Notice</h3>
              <p className="text-gray-700">
                You are under {consentAge} years old. Under both Ghanaian law (Act 843) 
                {isInternational && ` and ${internationalProtection.regulationName}`}, 
                parental consent and oversight are required for your use of this platform.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Contact Information */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h3 className="text-gray-900 mb-3">Legal Questions or Concerns</h3>
        <div className="space-y-2 text-gray-700">
          <p>📧 Legal Inquiries: legal@jotminds.com</p>
          <p>📧 Compliance: compliance@jotminds.com</p>
          <p>📄 Full Terms: jotminds.com/terms</p>
          <p>🏛️ Ghana Data Protection Commission: dataprotection.gov.gh</p>
        </div>
      </div>
    </div>
  );
}

function Act843Details() {
  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-4">
      <h3 className="text-gray-900 mb-3">Key Protections under Act 843:</h3>
      
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <ProtectionBadge icon="🔒" text="Right to Privacy" />
        <ProtectionBadge icon="📚" text="Right to Education" />
        <ProtectionBadge icon="🛡️" text="Protection from Exploitation" />
        <ProtectionBadge icon="⭐" text="Best Interest of Child" />
        <ProtectionBadge icon="ℹ️" text="Right to Information" />
        <ProtectionBadge icon="👨‍👩‍👧" text="Parental Responsibility" />
      </div>

      <div className="bg-white rounded-lg p-4 border border-purple-200">
        <h4 className="text-gray-900 mb-3">Relevant Sections Applied:</h4>
        <div className="space-y-3">
          {GHANA_ACT_843.relevantSections.map((section, index) => (
            <div key={index} className="text-sm">
              <p className="text-gray-900 mb-1">
                <strong>{section.section}: {section.title}</strong>
              </p>
              <p className="text-gray-700 mb-1">{section.description}</p>
              <p className="text-gray-600 italic text-xs">
                Applicability: {section.applicability}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InfoBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg p-3 border border-gray-200">
      <p className="text-gray-600 text-sm mb-1">{label}</p>
      <p className="text-gray-900">{value}</p>
    </div>
  );
}

function ProtectionBadge({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-2 bg-white rounded-lg p-3 border border-purple-200">
      <span className="text-2xl">{icon}</span>
      <span className="text-gray-700">{text}</span>
    </div>
  );
}

function getJurisdictionName(jurisdiction: Jurisdiction): string {
  const names = {
    [Jurisdiction.GHANA]: 'Ghana',
    [Jurisdiction.EUROPEAN_UNION]: 'European Union',
    [Jurisdiction.UNITED_STATES]: 'United States',
    [Jurisdiction.UNITED_KINGDOM]: 'United Kingdom',
    [Jurisdiction.CANADA]: 'Canada',
    [Jurisdiction.AUSTRALIA]: 'Australia',
    [Jurisdiction.OTHER]: 'International'
  };
  
  return names[jurisdiction];
}

/**
 * Compact Governing Law Footer
 */
export function CompactGoverningLawFooter({ jurisdiction }: { jurisdiction: Jurisdiction }) {
  const isInternational = jurisdiction !== Jurisdiction.GHANA;

  return (
    <div className="bg-gray-50 border-t border-gray-200 p-4 text-center">
      <p className="text-gray-600 text-sm">
        <strong>Governing Law:</strong> Republic of Ghana (Children's Act, 1998 - Act 843)
        {isInternational && ' with additional international protections'}
      </p>
      <p className="text-gray-500 text-xs mt-1">
        Disputes resolved in Courts of Ghana or through arbitration
      </p>
    </div>
  );
}
