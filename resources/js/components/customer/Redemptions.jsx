import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { rewardsAPI } from '../../services/api';
import { ArrowLeft, Gift, Clock, CheckCircle, XCircle, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Redemptions() {
  const navigate = useNavigate();
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchRedemptions();
  }, [currentPage]);

  const fetchRedemptions = async () => {
    try {
      const response = await rewardsAPI.getRedemptions(currentPage);
      setRedemptions(response.data.data);
      setTotalPages(response.data.last_page);
    } catch (error) {
      console.error('Error fetching redemptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case 'delivered':
        return <Package className="h-5 w-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Gift className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading redemptions...</p>
        </div>
      </div>
    );
  }

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
              className="mr-2 sm:mr-4 p-1 sm:p-2"
            >
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">My Redemptions</h1>
              <p className="text-xs sm:text-sm text-gray-600">Track your reward redemptions</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Redemption History</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="space-y-6">
              {redemptions.length > 0 ? (
                redemptions.map((redemption) => (
                  <div key={redemption.id} className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex items-start space-x-3 sm:space-x-4 flex-1">
                        <div className="flex-shrink-0">
                          {getStatusIcon(redemption.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base sm:text-lg">
                            {redemption.reward?.name || 'Reward'}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 mt-1">
                            {redemption.reward?.description}
                          </p>
                          
                          <div className="mt-2 sm:mt-3 space-y-2">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm">
                              <span className="text-gray-500">Code:</span>
                              <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs mt-1 sm:mt-0">
                                {redemption.redemption_code}
                              </code>
                            </div>
                            
                            <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm">
                              <span className="text-gray-500">Points:</span>
                              <span className="font-medium text-red-600">
                                -{formatCurrency(redemption.points_spent)}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm">
                              <span className="text-gray-500">Date:</span>
                              <span>{formatDate(redemption.created_at)}</span>
                            </div>
                            
                            {redemption.delivered_at && (
                              <div className="flex items-center space-x-4 text-sm">
                                <span className="text-gray-500">Delivered on:</span>
                                <span>{formatDate(redemption.delivered_at)}</span>
                              </div>
                            )}
                            
                            {redemption.notes && (
                              <div className="mt-2 p-3 bg-blue-50 rounded-md">
                                <p className="text-sm text-blue-800">{redemption.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="self-start sm:ml-4">
                        <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(redemption.status)}`}>
                          {redemption.status.charAt(0).toUpperCase() + redemption.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <Gift className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                  <p className="text-sm sm:text-base text-gray-500">You haven't redeemed any rewards yet</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6 space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}