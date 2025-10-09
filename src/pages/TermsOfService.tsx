import { Link } from 'react-router-dom';
import { FileText, ArrowLeft } from 'lucide-react';

export function TermsOfService() {
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
            <FileText className="h-10 w-10 text-cyan-400 mr-4" />
            <h1 className="text-4xl font-bold text-white">Terms of Service</h1>
          </div>

          <p className="text-slate-300 mb-8">
            Last Updated: October 9, 2025
          </p>

          <div className="space-y-8 text-slate-300">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="mb-4">
                By accessing and using BIDUA Hosting services, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, you should not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Service Description</h2>
              <p className="mb-4">
                BIDUA Hosting provides enterprise-grade cloud hosting services, including but not limited to virtual private servers, dedicated servers, and cloud infrastructure solutions. We reserve the right to modify, suspend, or discontinue any aspect of our services at any time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Account Registration</h2>
              <p className="mb-4">
                To use our services, you must:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized access</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Acceptable Use Policy</h2>
              <p className="mb-4">
                You agree not to use our services for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Any illegal activities or violations of applicable laws</li>
                <li>Distributing malware, viruses, or harmful code</li>
                <li>Spam, phishing, or unsolicited commercial communications</li>
                <li>Infringing intellectual property rights of others</li>
                <li>Harassment, abuse, or threats toward others</li>
                <li>Resource abuse or denial of service attacks</li>
                <li>Cryptocurrency mining without prior written approval</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Payment Terms</h2>
              <p className="mb-4">
                All fees are due in advance based on your selected billing cycle. We accept various payment methods including credit cards, PayPal, and bank transfers. Failure to pay on time may result in service suspension or termination.
              </p>
              <p className="mb-4">
                Pricing is subject to change with 30 days notice. Promotional pricing applies only to the initial term and standard rates apply upon renewal.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Refund Policy</h2>
              <p className="mb-4">
                We offer a 30-day money-back guarantee for new customers on annual plans. Refunds are prorated based on unused service time. Setup fees, domain registrations, and add-on services are non-refundable. Refund requests must be submitted through our support system.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Service Level Agreement</h2>
              <p className="mb-4">
                We guarantee 99.9% uptime for standard plans and 99.99% for enterprise plans. Scheduled maintenance windows are excluded from uptime calculations. Service credits may be issued for downtime exceeding our SLA commitments.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Data Backup and Security</h2>
              <p className="mb-4">
                While we implement industry-standard security measures and provide backup services, you are ultimately responsible for maintaining your own backups. We are not liable for data loss except as explicitly stated in our SLA.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Suspension and Termination</h2>
              <p className="mb-4">
                We reserve the right to suspend or terminate your account for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Violation of these Terms of Service</li>
                <li>Non-payment of fees</li>
                <li>Fraudulent activity or payment disputes</li>
                <li>Resource abuse affecting service quality</li>
                <li>Legal requirements or court orders</li>
              </ul>
              <p className="mt-4">
                Upon termination, all data may be permanently deleted after a 7-day grace period.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Limitation of Liability</h2>
              <p className="mb-4">
                BIDUA Hosting shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or business opportunities. Our total liability is limited to the amount paid for services in the preceding 12 months.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Intellectual Property</h2>
              <p className="mb-4">
                All content, trademarks, and intellectual property on BIDUA Hosting remain our exclusive property. You retain ownership of content you upload, but grant us a license to store and process it as necessary to provide our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">12. Privacy and Data Protection</h2>
              <p className="mb-4">
                Your use of our services is also governed by our Privacy Policy. We comply with applicable data protection regulations including GDPR and CCPA where applicable.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">13. Modifications to Terms</h2>
              <p className="mb-4">
                We may update these Terms of Service at any time. Material changes will be communicated via email or account notifications. Continued use of services after changes constitutes acceptance of the updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">14. Governing Law and Dispute Resolution</h2>
              <p className="mb-4">
                These terms are governed by the laws of the United States. Any disputes shall be resolved through binding arbitration in accordance with commercial arbitration rules. You waive any right to a jury trial or class action lawsuit.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">15. Contact Information</h2>
              <p className="mb-4">
                For questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                <p className="font-semibold text-white mb-2">BIDUA Hosting</p>
                <p>Email: legal@biduahosting.com</p>
                <p>Phone: +1 (555) 123-4567</p>
                <p>Address: 123 Cloud Street, Tech City, TC 12345</p>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-cyan-500/30">
            <p className="text-slate-400 text-sm text-center">
              By using BIDUA Hosting services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
