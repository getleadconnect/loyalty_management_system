import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { adminAPI } from '../../services/api';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  Send,
  MessageSquare,
  Mail,
  Phone,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Download,
  Filter,
  ChevronUp,
  ChevronDown,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MousePointer,
  DollarSign,
  BarChart3,
  Activity
} from 'lucide-react';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('delivery');
  
  // Date range state
  const [dateRange, setDateRange] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });

  // Dashboard data
  const [dashboardData, setDashboardData] = useState({
    quick_stats: {
      total_notifications_sent: 0,
      total_customers_reached: 0,
      average_delivery_rate: 0,
      average_engagement_rate: 0
    },
    channel_distribution: {},
    status_distribution: {}
  });

  // Delivery reports data
  const [deliveryData, setDeliveryData] = useState({
    overall_stats: {
      sms: { total_sent: 0, delivered: 0, failed: 0, delivery_rate: 0 },
      whatsapp: { total_sent: 0, delivered: 0, failed: 0, delivery_rate: 0 },
      email: { total_sent: 0, delivered: 0, failed: 0, delivery_rate: 0 }
    },
    daily_trends: [],
    recent_notifications: []
  });

  // Engagement metrics data
  const [engagementData, setEngagementData] = useState({
    participation: {
      total_customers: 0,
      active_customers: 0,
      participation_rate: 0
    },
    engagement_by_channel: {
      sms: { open_rate: 0, click_rate: 0 },
      whatsapp: { open_rate: 0, click_rate: 0 },
      email: { open_rate: 0, click_rate: 0 }
    },
    customer_activity: {
      new_customers: 0,
      returning_customers: 0,
      total_transactions: 0,
      total_points_earned: 0,
      total_points_redeemed: 0
    },
    engagement_trends: []
  });

  // Channel performance data
  const [channelData, setChannelData] = useState({
    channel_effectiveness: {
      sms: { delivery_rate: 0, click_rate: 0, conversion_rate: 0, roi_score: 0 },
      whatsapp: { delivery_rate: 0, click_rate: 0, conversion_rate: 0, roi_score: 0 },
      email: { delivery_rate: 0, click_rate: 0, conversion_rate: 0, roi_score: 0 }
    },
    top_campaigns: [],
    channel_comparison: {
      labels: [],
      delivery_rates: [],
      click_rates: [],
      conversion_rates: []
    }
  });

  // Colors for charts
  const COLORS = ['#0284c7', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  useEffect(() => {
    loadAllReports();
  }, [dateRange]);

  const loadAllReports = async () => {
    setLoading(true);
    setError('');
    
    try {
      const [dashboard, delivery, engagement, channel] = await Promise.all([
        adminAPI.getReportsDashboard(dateRange),
        adminAPI.getDeliveryReports(dateRange),
        adminAPI.getEngagementMetrics(dateRange),
        adminAPI.getChannelPerformance(dateRange)
      ]);

      setDashboardData(dashboard.data);
      setDeliveryData(delivery.data);
      setEngagementData(engagement.data);
      setChannelData(channel.data);
    } catch (err) {
      console.error('Reports Error:', err);
      console.error('Error response:', err.response);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load reports data';
      setError(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (field, value) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getChannelIcon = (channel) => {
    switch (channel) {
      case 'sms': return <Phone className="h-4 w-4" />;
      case 'whatsapp': return <MessageSquare className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      default: return <Send className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      case 'sent': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Reports & Analytics</h1>
        <p className="text-gray-600">Track communication effectiveness and customer engagement</p>
      </div>

      {/* Date Range Filter */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <Label>Date Range:</Label>
            </div>
            <Input
              type="date"
              value={dateRange.start_date}
              onChange={(e) => handleDateChange('start_date', e.target.value)}
              className="w-40"
            />
            <span>to</span>
            <Input
              type="date"
              value={dateRange.end_date}
              onChange={(e) => handleDateChange('end_date', e.target.value)}
              className="w-40"
            />
            <Button onClick={loadAllReports} className="bg-[#0284c7] hover:bg-[#0369a1]">
              <Filter className="h-4 w-4 mr-2" />
              Apply Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Notifications</p>
                <p className="text-2xl font-bold">
                  {formatNumber(dashboardData.quick_stats.total_notifications_sent)}
                </p>
              </div>
              <Send className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Customers Reached</p>
                <p className="text-2xl font-bold">
                  {formatNumber(dashboardData.quick_stats.total_customers_reached)}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Delivery Rate</p>
                <p className="text-2xl font-bold">
                  {dashboardData.quick_stats.average_delivery_rate}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Engagement Rate</p>
                <p className="text-2xl font-bold">
                  {dashboardData.quick_stats.average_engagement_rate}%
                </p>
              </div>
              <Activity className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <Button
          variant={activeTab === 'delivery' ? 'default' : 'outline'}
          onClick={() => setActiveTab('delivery')}
          className={activeTab === 'delivery' ? 'bg-[#0284c7] hover:bg-[#0369a1]' : ''}
        >
          <Send className="h-4 w-4 mr-2" />
          Delivery Reports
        </Button>
        <Button
          variant={activeTab === 'engagement' ? 'default' : 'outline'}
          onClick={() => setActiveTab('engagement')}
          className={activeTab === 'engagement' ? 'bg-[#0284c7] hover:bg-[#0369a1]' : ''}
        >
          <Activity className="h-4 w-4 mr-2" />
          Engagement Metrics
        </Button>
        <Button
          variant={activeTab === 'channel' ? 'default' : 'outline'}
          onClick={() => setActiveTab('channel')}
          className={activeTab === 'channel' ? 'bg-[#0284c7] hover:bg-[#0369a1]' : ''}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Channel Performance
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Delivery Reports Tab */}
      {activeTab === 'delivery' && (
        <div className="space-y-6">
          {/* Channel Delivery Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['sms', 'whatsapp', 'email'].map(channel => (
              <Card key={channel}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getChannelIcon(channel)}
                    {channel.toUpperCase()} Delivery
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Sent</span>
                      <span className="font-semibold">
                        {deliveryData.overall_stats[channel]?.total_sent || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Delivered</span>
                      <span className="font-semibold text-green-600">
                        {deliveryData.overall_stats[channel]?.delivered || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Failed</span>
                      <span className="font-semibold text-red-600">
                        {deliveryData.overall_stats[channel]?.failed || 0}
                      </span>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Delivery Rate</span>
                        <span className="font-bold text-lg">
                          {deliveryData.overall_stats[channel]?.delivery_rate || 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Daily Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Delivery Trends</CardTitle>
              <CardDescription>Track daily notification delivery performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={deliveryData.daily_trends.slice(0, 30)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="sms.delivery_rate" 
                    stroke="#0284c7" 
                    name="SMS"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="whatsapp.delivery_rate" 
                    stroke="#10b981" 
                    name="WhatsApp"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="email.delivery_rate" 
                    stroke="#f59e0b" 
                    name="Email"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
              <CardDescription>Latest notification activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Customer</th>
                      <th className="text-left p-2">Channel</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Message</th>
                      <th className="text-left p-2">Sent At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveryData.recent_notifications.map((notification, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          {notification.customer?.name || 'Unknown'}
                        </td>
                        <td className="p-2">
                          <span className="flex items-center gap-1">
                            {getChannelIcon(notification.channel)}
                            {notification.channel}
                          </span>
                        </td>
                        <td className="p-2">
                          <span className={`font-medium ${getStatusColor(notification.status)}`}>
                            {notification.status}
                          </span>
                        </td>
                        <td className="p-2 max-w-xs truncate">
                          {notification.message}
                        </td>
                        <td className="p-2 text-sm text-gray-600">
                          {new Date(notification.sent_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Engagement Metrics Tab */}
      {activeTab === 'engagement' && (
        <div className="space-y-6">
          {/* Participation Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Program Participation</CardTitle>
              <CardDescription>Customer engagement overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">
                    {engagementData.participation.total_customers}
                  </p>
                  <p className="text-sm text-gray-600">Total Customers</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {engagementData.participation.active_customers}
                  </p>
                  <p className="text-sm text-gray-600">Active Customers</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">
                    {engagementData.participation.participation_rate}%
                  </p>
                  <p className="text-sm text-gray-600">Participation Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Activity */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">New Customers</p>
                    <p className="text-2xl font-bold">
                      {engagementData.customer_activity.new_customers}
                    </p>
                  </div>
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Returning</p>
                    <p className="text-2xl font-bold">
                      {engagementData.customer_activity.returning_customers}
                    </p>
                  </div>
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Transactions</p>
                    <p className="text-2xl font-bold">
                      {engagementData.customer_activity.total_transactions}
                    </p>
                  </div>
                  <Activity className="h-6 w-6 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Points Earned</p>
                    <p className="text-2xl font-bold">
                      {formatNumber(engagementData.customer_activity.total_points_earned)}
                    </p>
                  </div>
                  <ChevronUp className="h-6 w-6 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Points Redeemed</p>
                    <p className="text-2xl font-bold">
                      {formatNumber(engagementData.customer_activity.total_points_redeemed)}
                    </p>
                  </div>
                  <ChevronDown className="h-6 w-6 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Engagement by Channel */}
          <Card>
            <CardHeader>
              <CardTitle>Engagement by Channel</CardTitle>
              <CardDescription>Open and click rates across communication channels</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    {
                      channel: 'SMS',
                      open_rate: engagementData.engagement_by_channel.sms.open_rate,
                      click_rate: engagementData.engagement_by_channel.sms.click_rate
                    },
                    {
                      channel: 'WhatsApp',
                      open_rate: engagementData.engagement_by_channel.whatsapp.open_rate,
                      click_rate: engagementData.engagement_by_channel.whatsapp.click_rate
                    },
                    {
                      channel: 'Email',
                      open_rate: engagementData.engagement_by_channel.email.open_rate,
                      click_rate: engagementData.engagement_by_channel.email.click_rate
                    }
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="channel" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="open_rate" fill="#0284c7" name="Open Rate %" />
                  <Bar dataKey="click_rate" fill="#10b981" name="Click Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Engagement Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Engagement Trends</CardTitle>
              <CardDescription>Daily engagement metrics over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={engagementData.engagement_trends.slice(0, 30)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="open_rate" 
                    stroke="#0284c7" 
                    name="Open Rate %"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="click_rate" 
                    stroke="#10b981" 
                    name="Click Rate %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Channel Performance Tab */}
      {activeTab === 'channel' && (
        <div className="space-y-6">
          {/* Channel Effectiveness */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['sms', 'whatsapp', 'email'].map(channel => (
              <Card key={channel}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getChannelIcon(channel)}
                    {channel.toUpperCase()} Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Delivery Rate</span>
                        <span className="text-sm font-medium">
                          {channelData.channel_effectiveness[channel]?.delivery_rate || 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ 
                            width: `${channelData.channel_effectiveness[channel]?.delivery_rate || 0}%` 
                          }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Click Rate</span>
                        <span className="text-sm font-medium">
                          {channelData.channel_effectiveness[channel]?.click_rate || 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ 
                            width: `${channelData.channel_effectiveness[channel]?.click_rate || 0}%` 
                          }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Conversion Rate</span>
                        <span className="text-sm font-medium">
                          {channelData.channel_effectiveness[channel]?.conversion_rate || 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ 
                            width: `${channelData.channel_effectiveness[channel]?.conversion_rate || 0}%` 
                          }}
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">ROI Score</span>
                        <span className="font-bold text-lg">
                          {channelData.channel_effectiveness[channel]?.roi_score || 0}%
                        </span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500">Website Visits</span>
                        <span className="text-xs font-medium">
                          {channelData.channel_effectiveness[channel]?.website_visits || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Channel Comparison Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Channel Comparison</CardTitle>
              <CardDescription>Compare performance metrics across channels</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={channelData.channel_comparison.labels.map((label, index) => ({
                    channel: label,
                    delivery: channelData.channel_comparison.delivery_rates[index] || 0,
                    click: channelData.channel_comparison.click_rates[index] || 0,
                    conversion: channelData.channel_comparison.conversion_rates[index] || 0
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="channel" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="delivery" fill="#0284c7" name="Delivery Rate %" />
                  <Bar dataKey="click" fill="#10b981" name="Click Rate %" />
                  <Bar dataKey="conversion" fill="#f59e0b" name="Conversion Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Campaigns */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Campaigns</CardTitle>
              <CardDescription>Campaigns with highest engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Campaign</th>
                      <th className="text-left p-2">Channel</th>
                      <th className="text-left p-2">Sent</th>
                      <th className="text-left p-2">Delivered</th>
                      <th className="text-left p-2">Clicked</th>
                      <th className="text-left p-2">Click Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {channelData.top_campaigns.map((campaign, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{campaign.campaign}</td>
                        <td className="p-2">
                          <span className="flex items-center gap-1">
                            {getChannelIcon(campaign.channel)}
                            {campaign.channel}
                          </span>
                        </td>
                        <td className="p-2">{campaign.total_sent}</td>
                        <td className="p-2 text-green-600">{campaign.delivered}</td>
                        <td className="p-2 text-blue-600">{campaign.clicked}</td>
                        <td className="p-2">
                          <span className="font-medium">{campaign.click_rate}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Reports;