import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowLeft, FileText, Shield, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TermsConditions() {
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
            <h1 className="text-xl font-semibold">Terms & Conditions</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-600" />
              Terms & Conditions
            </CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="space-y-6 text-gray-700">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
                <p className="mb-3">
                  By accessing and using our Loyalty Management System, you agree to be bound by these Terms and Conditions. 
                  If you do not agree with any part of these terms, you may not use our services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">2. Loyalty Points Program</h2>
                <div className="space-y-2">
                  <p>Our loyalty points program operates under the following conditions:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Points are earned based on qualifying purchases</li>
                    <li>Points have no cash value and cannot be transferred</li>
                    <li>Points may expire after 12 months of inactivity</li>
                    <li>We reserve the right to modify point values and redemption rates</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">3. User Account</h2>
                <p className="mb-3">
                  You are responsible for maintaining the confidentiality of your account credentials and for all activities 
                  that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">4. Rewards and Redemption</h2>
                <div className="space-y-2">
                  <p>When redeeming rewards:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>All redemptions are final and cannot be reversed</li>
                    <li>Rewards are subject to availability</li>
                    <li>Minimum point requirements apply for redemption</li>
                    <li>Rewards cannot be exchanged for cash</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">5. Prohibited Activities</h2>
                <p className="mb-3">Users are prohibited from:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Creating multiple accounts to earn additional points</li>
                  <li>Using automated systems or bots</li>
                  <li>Engaging in fraudulent activities</li>
                  <li>Violating any applicable laws or regulations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">6. Privacy and Data Protection</h2>
                <p className="mb-3">
                  Your use of our services is also governed by our Privacy Policy. We are committed to protecting your 
                  personal information and using it only as described in our Privacy Policy.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">7. Modifications to Terms</h2>
                <p className="mb-3">
                  We reserve the right to modify these terms at any time. Continued use of the service after changes 
                  constitutes acceptance of the modified terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">8. Termination</h2>
                <p className="mb-3">
                  We may terminate or suspend your account at any time for violation of these terms or for any other 
                  reason at our sole discretion.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">9. Limitation of Liability</h2>
                <p className="mb-3">
                  Our liability is limited to the maximum extent permitted by law. We are not liable for any indirect, 
                  incidental, special, or consequential damages.
                </p>
              </section>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Last Updated:</strong> January 1, 2025
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  By using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}