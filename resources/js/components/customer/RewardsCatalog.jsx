import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { rewardsAPI, pointsAPI } from '../../services/api';
import { ArrowLeft, Gift, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RewardsCatalog() {
  const navigate = useNavigate();
  const [rewards, setRewards] = useState([]);
  const [userBalance, setUserBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [redeemingId, setRedeemingId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const fetchData = async () => {
    try {
      const [rewardsRes, balanceRes] = await Promise.all([
        rewardsAPI.getRewards(currentPage),
        pointsAPI.getBalance()
      ]);
      
      setRewards(rewardsRes.data.data);
      setTotalPages(rewardsRes.data.last_page);
      setUserBalance(balanceRes.data.points_balance);
    } catch (error) {
      console.error('Error fetching rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (rewardId) => {
    setRedeemingId(rewardId);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await rewardsAPI.redeemReward(rewardId);
      setMessage({
        type: 'success',
        text: `Reward redeemed successfully! Your redemption code is: ${response.data.redemption_code}`
      });
      setUserBalance(response.data.new_balance);
      
      // Refresh rewards list
      fetchData();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to redeem reward'
      });
    } finally {
      setRedeemingId(null);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading rewards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 gap-3">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/customer/dashboard')}
                className="mr-2 sm:mr-4 p-1 sm:p-2"
              >
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <div className="flex-1">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Rewards Catalog</h1>
                <p className="text-xs sm:text-sm text-gray-600">Redeem your points for amazing rewards</p>
              </div>
            </div>
            <div className="text-right ml-auto sm:ml-0">
              <p className="text-xs sm:text-sm text-gray-600">Your Balance</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">
                {formatCurrency(userBalance)} pts
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 mt-0.5" />
            )}
            <div>
              <p className="font-medium">{message.text}</p>
              {message.type === 'success' && (
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-green-700 underline"
                  onClick={() => navigate('/customer/redemptions')}
                >
                  View your redemptions →
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {rewards.length > 0 ? (
            rewards.map((reward) => (
              <Card key={reward.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {reward.image_url && (
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    <Gift className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg">{reward.name}</CardTitle>
                  {reward.category && (
                    <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full mt-1">
                      {reward.category}
                    </span>
                  )}
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <CardDescription className="mb-3 sm:mb-4 text-xs sm:text-sm">
                    {reward.description}
                  </CardDescription>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">
                        {formatCurrency(reward.points_required)}
                      </p>
                      <p className="text-xs text-gray-500">Points Required</p>
                    </div>
                    {reward.stock_quantity !== null && (
                      <div className="text-right">
                        <p className="text-xs sm:text-sm font-medium">
                          {reward.stock_quantity} left
                        </p>
                        <p className="text-xs text-gray-500">In Stock</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="p-4 sm:p-6 pt-0">
                  <Button 
                    className="w-full text-xs sm:text-sm"
                    size="sm"
                    onClick={() => handleRedeem(reward.id)}
                    disabled={
                      userBalance < reward.points_required || 
                      redeemingId === reward.id ||
                      (reward.stock_quantity !== null && reward.stock_quantity === 0)
                    }
                  >
                    {redeemingId === reward.id ? (
                      'Redeeming...'
                    ) : userBalance < reward.points_required ? (
                      'Insufficient Points'
                    ) : reward.stock_quantity === 0 ? (
                      'Out of Stock'
                    ) : (
                      'Redeem Now'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-3 text-center py-12">
              <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No rewards available at the moment</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
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
      </main>
    </div>
  );
}