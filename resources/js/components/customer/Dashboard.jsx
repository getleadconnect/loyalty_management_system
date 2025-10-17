import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { dashboardAPI } from '../../services/api';
import { 
  Trophy, 
  TrendingUp, 
  Gift,
  Activity,
  LogOut,
  ScanLine,
  User,
  Info,
  Shield,
  FileText
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import axios from 'axios';

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [socialLinks, setSocialLinks] = useState([]);
  const [adsImages, setAdsImages] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [extendedAds, setExtendedAds] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    fetchSocialLinks();
    fetchAdsImages();
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await dashboardAPI.getDashboard();
      setDashboardData(response.data);
      
      // Update user in localStorage with fresh data including points_balance
      if (response.data?.user) {
        setUser(response.data.user);
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...storedUser, ...response.data.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      localStorage.removeItem('user_role');
      navigate('/login');
    }
  };

  const fetchSocialLinks = async () => {
    try {
      const response = await axios.get('/api/social-media-links/active', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      setSocialLinks(response.data.data || []);
    } catch (error) {
      console.error('Error fetching social links:', error);
    }
  };

  const fetchAdsImages = async () => {
    try {
      const response = await axios.get('/api/ads-images/active', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      const ads = response.data.data || [];
      setAdsImages(ads);
      
      // Create extended array for infinite scroll
      if (ads.length > 0) {
        // Clone the array multiple times for smooth infinite scroll
        const extended = [...ads, ...ads, ...ads];
        setExtendedAds(extended);
        setCurrentSlide(ads.length); // Start from the middle set
      }
    } catch (error) {
      console.error('Error fetching ads images:', error);
    }
  };

  // Handle responsive items per view
  useEffect(() => {
    const handleResize = () => {
      setItemsPerView(window.innerWidth >= 768 ? 3 : 1);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-slide effect with infinite scroll
  useEffect(() => {
    if (adsImages.length > 0 && extendedAds.length > 0) {
      const interval = setInterval(() => {
        setIsTransitioning(true);
        setCurrentSlide((prevSlide) => prevSlide + 1);
      }, 4000); // Change slide every 4 seconds

      return () => clearInterval(interval);
    }
  }, [adsImages.length, extendedAds.length]);

  // Handle infinite scroll reset
  useEffect(() => {
    if (adsImages.length > 0 && extendedAds.length > 0) {
      // When we reach the end of the second set, jump back to the first set
      if (currentSlide >= adsImages.length * 2) {
        setTimeout(() => {
          setIsTransitioning(false);
          setCurrentSlide(adsImages.length);
          setTimeout(() => setIsTransitioning(true), 50);
        }, 500);
      }
      // When we reach the beginning, jump to the second set
      else if (currentSlide < adsImages.length && currentSlide !== adsImages.length) {
        setTimeout(() => {
          setIsTransitioning(false);
          setCurrentSlide(adsImages.length);
          setTimeout(() => setIsTransitioning(true), 50);
        }, 500);
      }
    }
  }, [currentSlide, adsImages.length, extendedAds.length]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Loyalty Dashboard</h1>
              <p className="text-xs sm:text-sm text-gray-600">Welcome back, {user?.name}!</p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/customer/about')}
                title="About Us"
              >
                <Info className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">About Us</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/customer/profile')}
                title="My Profile"
              >
                <User className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">My Profile</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
          {/* Barcode Scanner Button Row */}
          <div className="pb-4">
            <Button
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
              onClick={() => navigate('/customer/qrcode-scanner')}
            >
              <ScanLine className="mr-2 h-4 w-4" />
              Scan QR Code
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Points Balance Card */}
        <Card className="mb-6 sm:mb-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl lg:text-3xl">Current Points Balance</CardTitle>
            <CardDescription className="text-blue-100 text-sm sm:text-base">
              Earn more points with every purchase
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              {dashboardData?.user?.points_balance ? parseFloat(dashboardData.user.points_balance).toLocaleString() : '0'}
            </div>
            <p className="text-blue-100 mt-2 text-sm sm:text-base">Points Available</p>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="mb-6 sm:mb-8">
          {/* First row: Total Earned and Total Redeemed */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-3 sm:mb-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">
                  {formatCurrency(dashboardData?.stats?.total_points_earned || 0)}
                </div>
                <p className="text-xs text-muted-foreground">Lifetime points earned</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Redeemed</CardTitle>
                <Trophy className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">
                  {formatCurrency(dashboardData?.stats?.total_points_redeemed || 0)}
                </div>
                <p className="text-xs text-muted-foreground">Points used for rewards</p>
              </CardContent>
            </Card>

            {/* Rewards Card - Hidden on mobile, shown on md and up */}
            <Card className="hidden md:block">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Rewards</CardTitle>
                <Gift className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {dashboardData?.available_rewards || 0}
                </div>
                <p className="text-xs text-muted-foreground mb-3">Rewards you can redeem</p>
                <Button 
                  size="sm" 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => navigate('/customer/rewards')}
                >
                  View Rewards
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Second row: Rewards Card - Only shown on mobile */}
          <Card className="md:hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Rewards</CardTitle>
              <Gift className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-purple-600">
                {dashboardData?.available_rewards || 0}
              </div>
              <p className="text-xs text-muted-foreground mb-3">Rewards you can redeem</p>
              <Button 
                size="sm" 
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={() => navigate('/customer/rewards')}
              >
                View Rewards
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Ads Image Slider */}
        {adsImages.length > 0 && (
          <Card className="overflow-hidden mb-6">
            <CardContent className="p-4">
              <div className="relative">
                {/* Carousel Container */}
                <div className="overflow-hidden">
                  <div 
                    className={`flex ${isTransitioning ? 'transition-transform duration-500 ease-in-out' : ''}`}
                    style={{
                      transform: `translateX(-${currentSlide * (100 / itemsPerView)}%)`
                    }}
                  >
                    {extendedAds.map((ad, index) => (
                      <div
                        key={`${ad.id}-${index}`}
                        className="w-full md:w-1/3 flex-shrink-0 px-2"
                      >
                        <div className="relative h-48 md:h-64 bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={ad.image_url}
                            alt={ad.description || 'Advertisement'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation Arrows */}
                {adsImages.length > itemsPerView && (
                  <>
                    <button
                      onClick={() => {
                        setIsTransitioning(true);
                        setCurrentSlide(currentSlide - 1);
                      }}
                      className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2 bg-white shadow-lg hover:shadow-xl text-gray-800 p-2 rounded-full transition-all z-10"
                      aria-label="Previous slide"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        setIsTransitioning(true);
                        setCurrentSlide(currentSlide + 1);
                      }}
                      className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-2 bg-white shadow-lg hover:shadow-xl text-gray-800 p-2 rounded-full transition-all z-10"
                      aria-label="Next slide"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}

                {/* Slide Indicators */}
                {adsImages.length > itemsPerView && (
                  <div className="flex justify-center gap-2 mt-4">
                    {adsImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setIsTransitioning(true);
                          setCurrentSlide(adsImages.length + index);
                        }}
                        className={`h-2 transition-all rounded-full ${
                          (currentSlide % adsImages.length) === index 
                            ? 'bg-blue-600 w-8' 
                            : 'bg-gray-300 w-2 hover:bg-gray-400'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData?.recent_transactions?.length > 0 ? (
                dashboardData.recent_transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="text-sm font-medium">{transaction.description}</p>
                      <p className="text-xs text-gray-500">{formatDate(transaction.created_at)}</p>
                    </div>
                    <div className={`text-sm font-bold ${
                      transaction.type === 'earned' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'earned' ? '+' : '-'}{formatCurrency(Math.abs(transaction.points))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No recent transactions</p>
              )}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => navigate('/customer/points')}
            >
              View All Transactions
            </Button>
          </CardContent>
        </Card>

        {/* Footer Section with Links */}
        <div className="mt-6 pt-2">
          {/* Terms and Privacy Links */}
          <div className="flex justify-center gap-6 mb-4">
            <Link 
              to="/customer/terms" 
              className="text-sm text-gray-600 hover:text-blue-600 flex items-center gap-1"
            >
              <FileText className="h-4 w-4" />
              Terms & Conditions
            </Link>
            <Link 
              to="/customer/privacy" 
              className="text-sm text-gray-600 hover:text-blue-600 flex items-center gap-1"
            >
              <Shield className="h-4 w-4" />
              Privacy Policy
            </Link>
          </div>

          {/* Social Media Links */}
          {socialLinks.length > 0 && (
            <div className="flex justify-center gap-3 mb-2">
              {socialLinks.map((link) => {
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-200 hover:bg-blue-500 transition-all duration-300 group flex items-center justify-center hover:scale-110 shadow-sm hover:shadow-md"
                    title={link.platform}
                  >
                    <i className={`${link.icon || 'fas fa-globe'} text-base text-gray-700 group-hover:text-white`}></i>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}