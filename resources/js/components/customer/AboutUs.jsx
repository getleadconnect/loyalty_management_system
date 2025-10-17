import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowLeft, Award, Users, Target, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AboutUs() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4 sm:py-6">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/customer/dashboard')}
              className="mr-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">About Us</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <Card className="mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-900">
              Welcome to Our Loyalty Program
            </CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <p className="text-gray-600 text-center text-lg">
              We believe in rewarding our valued customers for their continued trust and support. 
              Our loyalty program is designed to give back to you with every purchase.
            </p>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Award className="h-8 w-8 text-blue-600 mr-3" />
                <CardTitle>Earn Rewards</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Every purchase earns you points that can be redeemed for exciting rewards. 
                The more you shop, the more you earn!
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600 mr-3" />
                <CardTitle>Exclusive Member Benefits</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Get access to member-only offers, early access to sales, 
                and special birthday rewards throughout the year.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Target className="h-8 w-8 text-purple-600 mr-3" />
                <CardTitle>Track Your Progress</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Monitor your points balance, view transaction history, 
                and track your rewards journey all in one place.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Heart className="h-8 w-8 text-red-600 mr-3" />
                <CardTitle>Customer First</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Your satisfaction is our priority. Our support team is always ready 
                to help you make the most of your loyalty benefits.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Mission Statement */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              To create a rewarding shopping experience that celebrates and appreciates 
              our customers' loyalty. We strive to build lasting relationships through 
              meaningful rewards and exceptional service.
            </p>
            <p className="text-gray-600">
              Since our inception, we've been committed to providing value beyond just products. 
              Our loyalty program is a testament to this commitment, ensuring that every interaction 
              with us is rewarding.
            </p>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-2xl">Get in Touch</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
                <p className="text-gray-600">support@loyaltyprogram.com</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Phone</h3>
                <p className="text-gray-600">+91 1234567890</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Working Hours</h3>
                <p className="text-gray-600">Mon-Sat: 9:00 AM - 6:00 PM</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}