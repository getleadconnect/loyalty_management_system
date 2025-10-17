import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { 
  Users, 
  Gift, 
  DollarSign, 
  Activity,
  UserPlus,
  TrendingUp,
  TrendingDown,
  Award,
  ShoppingBag,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  RefreshCw,
  Package,
  FileText,
  Settings
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import api from '../../services/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    newCustomersThisMonth: 0,
    activeRewards: 0,
    totalRedemptions: 0,
    totalPointsIssued: 0,
    totalPointsRedeemed: 0,
    engagementRate: 0
  });
  const [loading, setLoading] = useState(false);
  
  const [chartData, setChartData] = useState([
    { month: 'Jan', customers: 0, points: 0 },
    { month: 'Feb', customers: 0, points: 0 },
    { month: 'Mar', customers: 0, points: 0 },
    { month: 'Apr', customers: 0, points: 0 },
    { month: 'May', customers: 0, points: 0 },
    { month: 'Jun', customers: 0, points: 0 }
  ]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/dashboard/stats');
      if (response.data) {
        setStats({
          totalCustomers: response.data.customers?.total || 0,
          newCustomersThisMonth: response.data.customers?.new_this_month || 0,
          activeRewards: response.data.rewards?.active || 0,
          totalRedemptions: response.data.redemptions?.total || 0,
          totalPointsIssued: response.data.points?.total_issued || 0,
          totalPointsRedeemed: response.data.points?.total_redeemed || 0,
          engagementRate: response.data.engagement?.rate || 0
        });
        
        // Update chart data if available
        if (response.data.chart_data && Array.isArray(response.data.chart_data)) {
          setChartData(response.data.chart_data);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Refresh Button */}
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          size="sm"
          onClick={fetchDashboardData}
          className="gap-2 text-gray-600 hover:text-sky-600 hover:bg-sky-50 border-gray-300"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        {/* Total Customers */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2.5 sm:p-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl shadow-lg">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">Total Customers</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{stats.totalCustomers.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Active Rewards */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2.5 sm:p-3 bg-gradient-to-r from-emerald-400 to-green-600 rounded-xl shadow-lg">
                <Gift className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">Active Rewards</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{stats.activeRewards}</p>
            </div>
          </CardContent>
        </Card>

        {/* Points Redeemed */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2.5 sm:p-3 bg-gradient-to-r from-purple-400 to-indigo-600 rounded-xl shadow-lg">
                <Award className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">Points Redeemed</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{stats.totalPointsRedeemed.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Active Engagement */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2.5 sm:p-3 bg-gradient-to-r from-teal-400 to-cyan-600 rounded-xl shadow-lg">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">Active Engagement</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{stats.engagementRate}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <Card 
            className="border-0 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group"
            onClick={() => navigate('/admin/customers')}
          >
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 bg-gradient-to-r from-violet-400 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <UserPlus className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-700">Add Customer</p>
            </CardContent>
          </Card>
          
          <Card 
            className="border-0 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group"
            onClick={() => navigate('/admin/rewards')}
          >
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 bg-gradient-to-r from-green-400 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Gift className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-700">Add Rewards</p>
            </CardContent>
          </Card>
          
          <Card 
            className="border-0 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group"
            onClick={() => navigate('/admin/products')}
          >
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 bg-gradient-to-r from-orange-400 to-amber-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-700">Add Products</p>
            </CardContent>
          </Card>
          
          <Card 
            className="border-0 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group"
            onClick={() => navigate('/admin/reports')}
          >
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 bg-gradient-to-r from-purple-400 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-700">Reports</p>
            </CardContent>
          </Card>
          
          <Card 
            className="border-0 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group"
            onClick={() => navigate('/admin/settings')}
          >
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 bg-gradient-to-r from-gray-400 to-slate-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-700">Settings</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Monthly Activity - Redeemed Points */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg font-semibold">Monthly Redeemed Points</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <ResponsiveContainer width="100%" height={200} className="sm:h-[250px]">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} className="sm:text-xs" />
                <YAxis tick={{ fontSize: 10 }} className="sm:text-xs" />
                <Tooltip 
                  formatter={(value) => [`${value.toLocaleString()} points`, 'Redeemed']}
                  labelStyle={{ fontSize: 12 }}
                  contentStyle={{ fontSize: 12 }}
                />
                <Bar dataKey="redeemedPoints" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9333ea" stopOpacity={1} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={1} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Trend Analysis - Points Redemption */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg font-semibold">Points Redemption Trend</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <ResponsiveContainer width="100%" height={200} className="sm:h-[250px]">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} className="sm:text-xs" />
                <YAxis tick={{ fontSize: 10 }} className="sm:text-xs" />
                <Tooltip 
                  formatter={(value) => [`${value.toLocaleString()} points`, 'Redeemed']}
                  labelStyle={{ fontSize: 12 }}
                  contentStyle={{ fontSize: 12 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="redeemedPoints" 
                  stroke="#8b5cf6" 
                  fill="url(#areaGradient)" 
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}