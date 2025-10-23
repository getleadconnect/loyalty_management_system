import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription as DialogDesc } from '../ui/dialog';
import { useNavigate } from 'react-router-dom';
import { rewardsAPI, pointsAPI } from '../../services/api';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import {
  ArrowLeft,
  Gift,
  Coins,
  AlertCircle,
  Check,
  Star,
  Package,
  ShoppingCart,
  Clock,
  Tag,
  Trophy,
  Sparkles,
  X
} from 'lucide-react';

const Rewards = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rewards, setRewards] = useState([]);
  const [selectedReward, setSelectedReward] = useState(null);
  const [showRedeemDialog, setShowRedeemDialog] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const [totalEarnedPoints, setTotalEarnedPoints] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRewards, setTotalRewards] = useState(0);
  // Removed filter state - showing all rewards only
  
  // Configure toastr
  toastr.options = {
    closeButton: true,
    progressBar: true,
    positionClass: 'toast-top-right',
    timeOut: '5000'
  };

  useEffect(() => {
    loadRewards();
    loadUserBalance();
    loadTotalEarnedPoints();
  }, [currentPage]);

  const loadRewards = async () => {
    try {
      setLoading(true);
      const response = await rewardsAPI.getRewards(currentPage);
      const allRewards = response.data.data || [];
      
      // Show all active rewards with available stock
      let filteredRewards = allRewards.filter(r => r.is_active && (!r.stock_quantity || r.stock_quantity > 0));
      
      setRewards(filteredRewards);
      setTotalPages(response.data.last_page || 1);
      setTotalRewards(response.data.total || 0);
    } catch (err) {
      console.error('Failed to load rewards:', err);
      toastr.error('Failed to load rewards');
    } finally {
      setLoading(false);
    }
  };

  const loadUserBalance = async () => {
    try {
      // First try to get from API for most up-to-date balance
      const response = await pointsAPI.getBalance();
      if (response.data && response.data.points_balance !== undefined) {
        const balance = parseFloat(response.data.points_balance) || 0;
        setUserBalance(balance);

        // Update localStorage with fresh data
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.points_balance = balance;
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        // Fallback to localStorage if API fails
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const balance = parseFloat(user?.points_balance) || 0;
        setUserBalance(balance);
      }
    } catch (err) {
      console.error('Failed to load user balance:', err);
      // Fallback to localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const balance = parseFloat(user?.points_balance) || 0;
      setUserBalance(balance);
    }
  };

  const loadTotalEarnedPoints = async () => {
    try {
      const response = await pointsAPI.getTotalEarned();
      setTotalEarnedPoints(response.data.total_earned || 0);
    } catch (err) {
      console.error('Failed to load total earned points:', err);
      setTotalEarnedPoints(0);
    }
  };

  const canRedeemRewards = () => {
    return userBalance >= 1000;
  };

  const handleRedeemClick = (reward) => {
    if (!canRedeemRewards()) {
      toastr.warning('You need at least 1000 points balance before you can redeem rewards. Current balance: ' + userBalance);
      return;
    }

    if (reward.points_required > userBalance) {
      toastr.warning('Insufficient points to redeem this reward. You need ' + (reward.points_required - userBalance) + ' more points.');
      return;
    }
    setSelectedReward(reward);
    setShowRedeemDialog(true);
  };

  const handleRedeemConfirm = async () => {
    if (!selectedReward) return;
    
    setRedeeming(true);
    try {
      const response = await rewardsAPI.redeemReward(selectedReward.id);
      toastr.success(response.data.message || 'Redeem successfully completed. Thank You');
      
      // Update user balance
      const newBalance = response.data.new_balance;
      setUserBalance(newBalance);
      
      // Update user in localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      user.points_balance = newBalance;
      localStorage.setItem('user', JSON.stringify(user));
      
      setShowRedeemDialog(false);
      setSelectedReward(null);
      loadRewards(); // Reload to update stock
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to redeem reward';
      toastr.error(errorMessage);
    } finally {
      setRedeeming(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'electronics': return <Package className="h-4 w-4" />;
      case 'vouchers': return <Tag className="h-4 w-4" />;
      case 'merchandise': return <ShoppingCart className="h-4 w-4" />;
      default: return <Gift className="h-4 w-4" />;
    }
  };

  const canAfford = (pointsRequired) => {
    const required = parseFloat(pointsRequired) || 0;
    const balance = parseFloat(userBalance) || 0;
    return required <= balance;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading rewards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-between py-3 sm:py-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/customer/dashboard')}
              className="text-xs sm:text-sm"
            >
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Button>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Rewards</h1>
            <div className="w-16 sm:w-20"></div>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl mx-auto">
        {/* Balance Card */}
        <Card className="mb-4 sm:mb-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm sm:text-base text-purple-100">Your Points Balance</p>
                <p className="text-2xl sm:text-4xl font-bold mt-1">{userBalance.toLocaleString()}</p>
                <p className="text-xs sm:text-sm text-purple-100 mt-1">Points available for redemption</p>
                {!canRedeemRewards() && (
                  <Alert className="mt-3 bg-yellow-500/20 border-yellow-300 text-yellow-100">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs sm:text-sm">
                      Minimum 1000 points balance required to redeem. Current balance: {userBalance}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              <Coins className="h-12 w-12 sm:h-16 sm:w-16 text-yellow-300 opacity-80" />
            </div>
          </CardContent>
        </Card>

        {/* All Rewards Header */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
            All Available Rewards
          </h2>
        </div>

        {/* Rewards Grid */}
        {rewards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {rewards.map((reward) => (
              <Card key={reward.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm sm:text-base line-clamp-1">
                        {reward.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        {getCategoryIcon(reward.category)}
                        <span className="text-xs text-gray-500">{reward.category}</span>
                        {reward.stock_quantity && reward.stock_quantity <= 5 && reward.stock_quantity > 0 && (
                          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded">
                            Only {reward.stock_quantity} left!
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg sm:text-xl font-bold text-purple-600">
                        {reward.points_required}
                      </p>
                      <p className="text-xs text-gray-500">points</p>
                    </div>
                  </div>
                  <CardDescription className="text-xs sm:text-sm mt-2 line-clamp-2">
                    {reward.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="p-3 sm:p-4 pt-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      <Package className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        Stock: {reward.stock_quantity === 0 ? 'No Stock' : reward.stock_quantity === null ? 'Unlimited' : reward.stock_quantity}
                      </span>
                    </div>
                    {!canAfford(reward.points_required) && (
                      <span className="text-xs text-red-500">
                        Need {reward.points_required - userBalance} more points
                      </span>
                    )}
                  </div>
                  
                  <Button
                    className={`w-full text-xs sm:text-sm ${
                      canAfford(reward.points_required) && canRedeemRewards()
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                    onClick={() => handleRedeemClick(reward)}
                    disabled={!canAfford(reward.points_required) || reward.stock_quantity === 0 || !canRedeemRewards()}
                    size="sm"
                  >
                    {reward.stock_quantity === 0 ? (
                      <>Out of Stock</>
                    ) : !canRedeemRewards() ? (
                      <>
                        <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        Min 1000 Points Required
                      </>
                    ) : canAfford(reward.points_required) ? (
                      <>
                        <Gift className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        Redeem Now
                      </>
                    ) : (
                      <>
                        <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        Insufficient Points
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Gift className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Rewards Available</h3>
              <p className="text-sm text-gray-500">
                {filter === 'affordable' 
                  ? "No rewards available within your current points balance."
                  : filter === 'premium'
                  ? "No premium rewards available at the moment."
                  : "Check back later for new rewards!"}
              </p>
              {filter !== 'all' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilter('all')}
                  className="mt-4"
                >
                  View All Rewards
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                if (pageNum < 1 || pageNum > totalPages) return null;
                
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className={pageNum === currentPage ? "bg-purple-600 hover:bg-purple-700" : ""}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </main>

      {/* Redeem Confirmation Dialog */}
      <Dialog open={showRedeemDialog} onOpenChange={setShowRedeemDialog}>
        <DialogContent className="w-[95%] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Confirm Redemption</DialogTitle>
            <DialogDesc className="text-sm text-gray-600 mt-2">
              Are you sure you want to redeem this reward?
            </DialogDesc>
          </DialogHeader>
          
          {selectedReward && (
            <div className="space-y-4 my-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Gift className="h-8 w-8 text-purple-600" />
                <div className="flex-1">
                  <h4 className="font-semibold">{selectedReward.name}</h4>
                  <p className="text-sm text-gray-600">{selectedReward.category}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Points Required:</span>
                  <span className="font-semibold">{selectedReward.points_required}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Your Balance:</span>
                  <span className="font-semibold">{userBalance}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Balance After:</span>
                    <span className="font-semibold text-green-600">
                      {userBalance - selectedReward.points_required}
                    </span>
                  </div>
                </div>
              </div>
              
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-xs text-yellow-800">
                  This action cannot be undone. Points will be deducted immediately.
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowRedeemDialog(false)}
              disabled={redeeming}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRedeemConfirm}
              disabled={redeeming}
              className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
            >
              {redeeming ? (
                <>Processing...</>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Confirm Redemption
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Rewards;