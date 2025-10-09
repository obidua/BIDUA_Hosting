import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/"
          className="inline-flex items-center text-cyan-400 hover:text-cyan-300 mb-8 transition"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        <div className="bg-slate-900/60 backdrop-blur-xl rounded-xl shadow-2xl p-8 md:p-12 border border-cyan-500/30">
          <div className="flex items-center mb-6">
            <Shield className="h-10 w-10 text-cyan-400 mr-4" />
            <h1 className="text-4xl font-bold text-white">Privacy Policy</h1>
          </div>

          <p className="text-slate-300 mb-8">
            Last Updated: October 9, 2025
          </p>

          <div className="space-y-8 text-slate-300">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
              <p className="mb-4">
                BIDUA Hosting is committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you use our cloud hosting services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>

              <h3 className="text-xl font-semibold text-cyan-400 mb-3 mt-4">Personal Information</h3>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>Name, email address, and contact information</li>
                <li>Billing address and payment information</li>
                <li>Company name and business details (if applicable)</li>
                <li>Account credentials and authentication data</li>
              </ul>

              <h3 className="text-xl font-semibold text-cyan-400 mb-3 mt-4">Technical Information</h3>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>IP addresses and device information</li>
                <li>Browser type and operating system</li>
                <li>Server logs and usage statistics</li>
                <li>Cookies and tracking technologies</li>
              </ul>

              <h3 className="text-xl font-semibold text-cyan-400 mb-3 mt-4">Service Data</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Server configurations and settings</li>
                <li>Application and website data you store</li>
                <li>Support ticket communications</li>
                <li>Billing and transaction history</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
              <p className="mb-4">We use collected information to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide, maintain, and improve our hosting services</li>
                <li>Process payments and manage billing</li>
                <li>Communicate with you about services, updates, and support</li>
                <li>Detect and prevent fraud, abuse, and security threats</li>
                <li>Comply with legal obligations and enforce our terms</li>
                <li>Analyze usage patterns and optimize performance</li>
                <li>Send marketing communications (with your consent)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Information Sharing and Disclosure</h2>
              <p className="mb-4">We do not sell your personal information. We may share data with:</p>

              <h3 className="text-xl font-semibold text-cyan-400 mb-3 mt-4">Service Providers</h3>
              <p className="mb-4">
                Third-party vendors who assist with payment processing, data storage, analytics, and customer support. These providers are contractually obligated to protect your data.
              </p>

              <h3 className="text-xl font-semibold text-cyan-400 mb-3 mt-4">Legal Requirements</h3>
              <p className="mb-4">
                When required by law, court order, or government request, or to protect our rights, property, or safety.
              </p>

              <h3 className="text-xl font-semibold text-cyan-400 mb-3 mt-4">Business Transfers</h3>
              <p className="mb-4">
                In connection with a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Data Security</h2>
              <p className="mb-4">
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and authentication protocols</li>
                <li>DDoS protection and network security monitoring</li>
                <li>Secure data centers with physical security measures</li>
                <li>Employee training on data protection practices</li>
              </ul>
              <p className="mt-4">
                While we strive to protect your data, no security system is impenetrable. You are responsible for maintaining the confidentiality of your account credentials.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Data Retention</h2>
              <p className="mb-4">
                We retain your personal information for as long as necessary to provide services and comply with legal obligations. Account data is typically retained for 90 days after account closure. Billing records are kept for 7 years as required by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Your Rights and Choices</h2>
              <p className="mb-4">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access and review your personal information</li>
                <li>Correct inaccurate or incomplete data</li>
                <li>Request deletion of your data (subject to legal requirements)</li>
                <li>Object to or restrict certain data processing</li>
                <li>Data portability to another service provider</li>
                <li>Opt-out of marketing communications</li>
                <li>Withdraw consent where processing is based on consent</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, contact us at privacy@biduahosting.com.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Cookies and Tracking Technologies</h2>
              <p className="mb-4">
                We use cookies and similar technologies to enhance your experience, analyze site usage, and deliver personalized content. You can control cookie preferences through your browser settings, though some features may not function properly if cookies are disabled.
              </p>
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4 mt-4">
                <p className="font-semibold text-white mb-2">Types of Cookies We Use:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Essential cookies for service functionality</li>
                  <li>Analytics cookies to understand usage patterns</li>
                  <li>Preference cookies to remember your settings</li>
                  <li>Marketing cookies for targeted advertising (with consent)</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. International Data Transfers</h2>
              <p className="mb-4">
                Your information may be processed in countries other than your country of residence. We ensure appropriate safeguards are in place, including Standard Contractual Clauses approved by regulatory authorities.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Children's Privacy</h2>
              <p className="mb-4">
                Our services are not directed to individuals under 18 years of age. We do not knowingly collect personal information from children. If you become aware that a child has provided us with personal data, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Third-Party Links</h2>
              <p className="mb-4">
                Our website may contain links to third-party sites. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies before providing any personal information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">12. GDPR Compliance</h2>
              <p className="mb-4">
                For users in the European Economic Area, we comply with GDPR requirements. This includes:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Lawful basis for processing (contract, consent, legitimate interest)</li>
                <li>Data protection by design and by default</li>
                <li>Appointment of a Data Protection Officer</li>
                <li>Data breach notification within 72 hours</li>
                <li>Right to lodge complaints with supervisory authorities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">13. CCPA Compliance</h2>
              <p className="mb-4">
                California residents have additional rights under the California Consumer Privacy Act:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Right to know what personal information is collected</li>
                <li>Right to know if personal information is sold or disclosed</li>
                <li>Right to opt-out of the sale of personal information</li>
                <li>Right to deletion of personal information</li>
                <li>Right to non-discrimination for exercising CCPA rights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">14. Changes to This Privacy Policy</h2>
              <p className="mb-4">
                We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements. We will notify you of material changes via email or prominent notice on our website. Continued use of services after changes constitutes acceptance.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">15. Contact Us</h2>
              <p className="mb-4">
                If you have questions, concerns, or requests regarding this Privacy Policy or our data practices:
              </p>
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                <p className="font-semibold text-white mb-2">BIDUA Hosting - Privacy Team</p>
                <p>Email: privacy@biduahosting.com</p>
                <p>Phone: +1 (555) 123-4567</p>
                <p>Address: 123 Cloud Street, Tech City, TC 12345</p>
                <p className="mt-2">Data Protection Officer: dpo@biduahosting.com</p>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-cyan-500/30">
            <p className="text-slate-400 text-sm text-center">
              Your privacy is important to us. We are committed to protecting your personal information and being transparent about our data practices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
