import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { 
  Search, 
  User, 
  Mail, 
  Phone,
  TrendingUp,
  TrendingDown,
  Edit,
  MessageSquare
} from 'lucide-react';

export default function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [adjustmentModal, setAdjustmentModal] = useState(false);
  const [adjustmentData, setAdjustmentData] = useState({
    type: 'add',
    points: '',
    reason: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/admin/customers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      const data = await response.json();
      setCustomers(data.data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) {
      fetchCustomers();
      return;
    }

    try {
      const response = await fetch(`/api/admin/customers/search?query=${searchQuery}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error('Error searching customers:', error);
    }
  };

  const handleAdjustPoints = async () => {
    if (!selectedCustomer || !adjustmentData.points || !adjustmentData.reason) return;

    try {
      const response = await fetch(`/api/admin/customers/${selectedCustomer.id}/adjust-points`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(adjustmentData),
      });
      
      if (response.ok) {
        setAdjustmentModal(false);
        setAdjustmentData({ type: 'add', points: '', reason: '' });
        fetchCustomers();
        alert('Points adjusted successfully!');
      }
    } catch (error) {
      console.error('Error adjusting points:', error);
    }
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Customer Management</h1>
        <p className="text-gray-600 mt-1">View and manage customer accounts</p>
      </div>

      {/* Search Bar */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full"
              />
            </div>
            <Button onClick={handleSearch} className="w-full sm:w-auto">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 text-sm font-medium text-gray-700">Customer</th>
                  <th className="text-left p-2 text-sm font-medium text-gray-700 hidden sm:table-cell">Contact</th>
                  <th className="text-left p-2 text-sm font-medium text-gray-700">Points</th>
                  <th className="text-left p-2 text-sm font-medium text-gray-700 hidden md:table-cell">Activity</th>
                  <th className="text-left p-2 text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{customer.name}</p>
                          <p className="text-xs text-gray-500 sm:hidden">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-2 hidden sm:table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Mail className="h-3 w-3" />
                          {customer.email}
                        </div>
                        {customer.phone && (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Phone className="h-3 w-3" />
                            {customer.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="font-semibold text-blue-600">
                        {customer.points_balance}
                      </div>
                      <p className="text-xs text-gray-500">points</p>
                    </td>
                    <td className="p-2 hidden md:table-cell">
                      <div className="text-xs">
                        <p>{customer.purchases_count || 0} purchases</p>
                        <p>{customer.redemptions_count || 0} redemptions</p>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setAdjustmentModal(true);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                        >
                          <MessageSquare className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Points Adjustment Modal */}
      {adjustmentModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Adjust Points</CardTitle>
              <p className="text-sm text-gray-600">
                Customer: {selectedCustomer.name}
              </p>
              <p className="text-sm text-gray-600">
                Current Balance: {selectedCustomer.points_balance} points
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Adjustment Type</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    variant={adjustmentData.type === 'add' ? 'default' : 'outline'}
                    onClick={() => setAdjustmentData({...adjustmentData, type: 'add'})}
                  >
                    <TrendingUp className="mr-1 h-3 w-3" />
                    Add Points
                  </Button>
                  <Button
                    size="sm"
                    variant={adjustmentData.type === 'subtract' ? 'default' : 'outline'}
                    onClick={() => setAdjustmentData({...adjustmentData, type: 'subtract'})}
                  >
                    <TrendingDown className="mr-1 h-3 w-3" />
                    Subtract Points
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="points">Points Amount</Label>
                <Input
                  id="points"
                  type="number"
                  placeholder="Enter points amount"
                  value={adjustmentData.points}
                  onChange={(e) => setAdjustmentData({...adjustmentData, points: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="reason">Reason</Label>
                <Input
                  id="reason"
                  type="text"
                  placeholder="Enter reason for adjustment"
                  value={adjustmentData.reason}
                  onChange={(e) => setAdjustmentData({...adjustmentData, reason: e.target.value})}
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={handleAdjustPoints}
                >
                  Apply Adjustment
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setAdjustmentModal(false);
                    setAdjustmentData({ type: 'add', points: '', reason: '' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}