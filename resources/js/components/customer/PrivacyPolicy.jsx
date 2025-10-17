import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowLeft, Shield, Lock, Eye, Database, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              onClick={() => navigate('/customer/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-xl font-semibold">Privacy Policy</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              Privacy Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="space-y-6 text-gray-700">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
                <p className="mb-3">
                  We are committed to protecting your privacy and ensuring the security of your personal information. 
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you 
                  use our Loyalty Management System.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  2. Information We Collect
                </h2>
                <div className="space-y-3">
                  <h3 className="font-semibold">Personal Information:</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Name and contact information (email, phone number)</li>
                    <li>Aadhar number (for verification purposes)</li>
                    <li>Date of birth</li>
                    <li>Profile photo (if uploaded)</li>
                    <li>Account credentials</li>
                  </ul>
                  
                  <h3 className="font-semibold mt-4">Transaction Information:</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Purchase history</li>
                    <li>Points earned and redeemed</li>
                    <li>Reward redemption history</li>
                    <li>Transaction dates and amounts</li>
                  </ul>

                  <h3 className="font-semibold mt-4">Usage Information:</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Login dates and times</li>
                    <li>Features used within the application</li>
                    <li>Device information and IP addresses</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  3. How We Use Your Information
                </h2>
                <p className="mb-3">We use your information to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Manage your loyalty account and points balance</li>
                  <li>Process reward redemptions</li>
                  <li>Send transaction confirmations and account updates</li>
                  <li>Provide customer support</li>
                  <li>Improve our services and user experience</li>
                  <li>Comply with legal obligations</li>
                  <li>Prevent fraud and maintain security</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">4. Information Sharing</h2>
                <p className="mb-3">
                  We do not sell, trade, or rent your personal information to third parties. We may share your 
                  information only in the following circumstances:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>With your explicit consent</li>
                  <li>To comply with legal requirements or court orders</li>
                  <li>To protect our rights and prevent fraud</li>
                  <li>With service providers who assist in operating our system (under strict confidentiality agreements)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  5. Data Security
                </h2>
                <p className="mb-3">
                  We implement appropriate technical and organizational measures to protect your personal information:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Encryption of sensitive data in transit and at rest</li>
                  <li>Secure authentication mechanisms</li>
                  <li>Regular security audits and updates</li>
                  <li>Limited access to personal information on a need-to-know basis</li>
                  <li>Secure data centers with physical security controls</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  6. Your Rights
                </h2>
                <p className="mb-3">You have the right to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate information</li>
                  <li>Request deletion of your account</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Download your data in a portable format</li>
                  <li>Lodge a complaint with supervisory authorities</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">7. Cookies and Tracking</h2>
                <p className="mb-3">
                  We use cookies and similar tracking technologies to enhance your experience. These help us:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Remember your preferences</li>
                  <li>Keep you logged in securely</li>
                  <li>Analyze usage patterns to improve our service</li>
                </ul>
                <p className="mt-3">
                  You can control cookie settings through your browser preferences.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">8. Children's Privacy</h2>
                <p className="mb-3">
                  Our services are not intended for children under 18 years of age. We do not knowingly collect 
                  personal information from children under 18.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">9. Data Retention</h2>
                <p className="mb-3">
                  We retain your personal information for as long as necessary to provide our services and comply 
                  with legal obligations. When you close your account, we will delete or anonymize your personal 
                  information within 90 days, except where retention is required by law.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">10. International Data Transfers</h2>
                <p className="mb-3">
                  Your information may be transferred to and processed in countries other than your country of 
                  residence. We ensure appropriate safeguards are in place to protect your information in accordance 
                  with this Privacy Policy.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">11. Changes to This Policy</h2>
                <p className="mb-3">
                  We may update this Privacy Policy from time to time. We will notify you of any material changes 
                  by posting the new Privacy Policy on this page and updating the "Last Updated" date.
                </p>
              </section>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Last Updated:</strong> January 1, 2025
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  <strong>Effective Date:</strong> January 1, 2025
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Your privacy is important to us. By using our services, you agree to the collection and use of 
                  information in accordance with this Privacy Policy.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}