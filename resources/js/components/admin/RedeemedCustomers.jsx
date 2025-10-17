import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  Truck,
  Gift,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter 
} from '../ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import api from '@/services/api';

export default function RedeemedCustomers() {
  const [redemptions, setRedemptions] = useState([]);
  const [filteredRedemptions, setFilteredRedemptions] = useState([]);
  const [displayedRedemptions, setDisplayedRedemptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [tempFilters, setTempFilters] = useState({
    dateFrom: '',
    dateTo: '',
    status: '',
    deliveryStatus: ''
  });
  const [appliedFilters, setAppliedFilters] = useState({
    dateFrom: '',
    dateTo: '',
    status: '',
    deliveryStatus: ''
  });
  const [stats, setStats] = useState({
    total_redemptions: 0,
    pending_redemptions: 0,
    verified_redemptions: 0,
    delivered_redemptions: 0,
    total_points_redeemed: 0,
    redemptions_today: 0,
    redemptions_this_month: 0
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRedemption, setSelectedRedemption] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    fetchRedemptions();
    fetchStats();
  }, [sortBy, sortOrder, appliedFilters]);

  useEffect(() => {
    // Filter redemptions based on search term
    if (searchTerm) {
      const filtered = redemptions.filter(redemption => 
        redemption.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        redemption.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        redemption.rewards_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        redemption.customer_mobile?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRedemptions(filtered);
    } else {
      setFilteredRedemptions(redemptions);
    }
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchTerm, redemptions]);

  useEffect(() => {
    // Paginate filtered redemptions
    if (rowsPerPage === 'all') {
      setDisplayedRedemptions(filteredRedemptions);
    } else {
      const start = (currentPage - 1) * parseInt(rowsPerPage);
      const end = start + parseInt(rowsPerPage);
      setDisplayedRedemptions(filteredRedemptions.slice(start, end));
    }
  }, [filteredRedemptions, currentPage, rowsPerPage]);

  const fetchRedemptions = async () => {
    setLoading(true);
    try {
      const params = {
        per_page: 'all', // Fetch all records
        sort_by: sortBy,
        sort_order: sortOrder,
        ...appliedFilters
      };

      const response = await api.get('/admin/redeemed-customers', { params });
      const data = response.data.data || [];
      setRedemptions(data);
      setFilteredRedemptions(data);
    } catch (error) {
      console.error('Error fetching redeemed customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/redeemed-customers/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const viewRedemptionDetails = async (id) => {
    try {
      const response = await api.get(`/admin/redeemed-customers/${id}`);
      setSelectedRedemption(response.data);
      setShowDetailsDialog(true);
    } catch (error) {
      console.error('Error fetching redemption details:', error);
    }
  };

  const updateRedemptionStatus = async (id, statusType, statusValue) => {
    try {
      const data = {
        [statusType]: statusValue
      };
      await api.put(`/admin/redeemed-customers/${id}/status`, data);
      fetchRedemptions();
      fetchStats();
      if (showDetailsDialog) {
        viewRedemptionDetails(id);
      }
    } catch (error) {
      console.error('Error updating redemption status:', error);
    }
  };

  const deleteRedemption = async () => {
    if (!deleteId) return;
    
    try {
      await api.delete(`/admin/redeemed-customers/${deleteId}`);
      fetchRedemptions();
      fetchStats();
      setShowDeleteDialog(false);
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting redemption:', error);
    }
  };

  const bulkUpdateStatus = async (statusType, statusValue) => {
    if (selectedIds.length === 0) return;

    try {
      const data = {
        ids: selectedIds,
        [statusType]: statusValue
      };
      await api.post('/admin/redeemed-customers/bulk-update', data);
      setSelectedIds([]);
      fetchRedemptions();
      fetchStats();
    } catch (error) {
      console.error('Error bulk updating:', error);
    }
  };

  const applyFilters = () => {
    setAppliedFilters({...tempFilters});
  };

  const clearFilters = () => {
    setTempFilters({
      dateFrom: '',
      dateTo: '',
      status: '',
      deliveryStatus: ''
    });
    setAppliedFilters({
      dateFrom: '',
      dateTo: '',
      status: '',
      deliveryStatus: ''
    });
    setSearchTerm('');
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const toggleSelectRedemption = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === displayedRedemptions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(displayedRedemptions.map(r => r.id));
    }
  };

  const handleExport = () => {
    // Prepare parameters for export
    const params = new URLSearchParams({
      ...appliedFilters,
      sort_by: sortBy,
      sort_order: sortOrder
    });

    // Create a temporary link element for download
    const link = document.createElement('a');
    const token = localStorage.getItem('auth_token');
    
    // Construct the URL with parameters
    link.href = `/api/admin/redeemed-customers/export?${params.toString()}`;
    
    // Trigger download using fetch to include auth token
    fetch(link.href, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'text/csv',
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Export failed');
      }
      return response.blob();
    })
    .then(blob => {
      // Create a download link for the blob
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `redeemed_customers_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    })
    .catch(error => {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    });
  };

  const getStatusBadge = (status, type = 'redeem') => {
    if (type === 'redeem') {
      // Handle text-based status from redeem_status_text
      if (typeof status === 'string') {
        switch (status) {
          case 'Not Verified':
            return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Not Verified</span>;
          case 'Verified':
            return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Verified</span>;
          default:
            return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{status}</span>;
        }
      }
      // Handle numeric status (fallback)
      switch (status) {
        case 0:
          return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
        case 1:
          return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Verified</span>;
        case 2:
          return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Rejected</span>;
        default:
          return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Unknown</span>;
      }
    } else {
      // Handle text-based status from delivery_status_text
      if (typeof status === 'string') {
        switch (status) {
          case 'Not Delivered':
            return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Not Delivered</span>;
          case 'Delivered':
            return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Delivered</span>;
          case 'In Transit':
            return <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">In Transit</span>;
          default:
            return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{status}</span>;
        }
      }
      // Handle numeric status (fallback)
      switch (status) {
        case 0:
          return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Not Delivered</span>;
        case 1:
          return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Delivered</span>;
        case 2:
          return <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">In Transit</span>;
        default:
          return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Unknown</span>;
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Redeemed Customers</h1>
        <p className="text-gray-600 mt-1">Manage and track customer reward redemptions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Redemptions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_redemptions}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Gift className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Verification</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending_redemptions}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-gray-900">{stats.verified_redemptions}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-gray-900">{stats.delivered_redemptions}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          {/* Filters Row */}
          <div className="mb-4" style={{marginBottom: '35px'}}>
            <div className="flex flex-wrap gap-2 items-center">
              {/* Filter By Label */}
              <span className="text-sm font-medium text-gray-700 mr-2">Filter By:</span>
              
              {/* Date From */}
              <Input
                type="date"
                value={tempFilters.dateFrom}
                onChange={(e) => setTempFilters({...tempFilters, dateFrom: e.target.value})}
                className="w-[168px] h-9"
                placeholder="From"
              />

              {/* Date To */}
              <Input
                type="date"
                value={tempFilters.dateTo}
                onChange={(e) => setTempFilters({...tempFilters, dateTo: e.target.value})}
                className="w-[168px] h-9"
                placeholder="To"
              />

              {/* Redeem Status */}
              <select
                className="px-3 h-9 w-[150px] border border-gray-300 rounded-md text-sm"
                value={tempFilters.status}
                onChange={(e) => setTempFilters({...tempFilters, status: e.target.value})}
              >
                <option value="">All Status</option>
                <option value="0">Not Verified</option>
                <option value="1">Verified</option>
              </select>

              {/* Delivery Status */}
              <select
                className="px-3 h-9 w-[150px] border border-gray-300 rounded-md text-sm"
                value={tempFilters.deliveryStatus}
                onChange={(e) => setTempFilters({...tempFilters, deliveryStatus: e.target.value})}
              >
                <option value="">All Delivery</option>
                <option value="0">Not Delivered</option>
                <option value="1">Delivered</option>
              </select>

              {/* Filter Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={applyFilters}
                className="h-9"
              >
                <Filter className="w-4 h-4 mr-1" />
                Filter
              </Button>

              {/* Clear Button - Always visible */}
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="h-9"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Clear
              </Button>

              {/* Export Button - Right aligned */}
              <div className="flex-1 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="h-9 bg-green-50 hover:bg-green-100 border-green-300 text-green-700"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Export to Excel
                </Button>
              </div>
            </div>
          </div>

          {/* Rows per page and Search Row - Above DataTable */}
          <div className="mb-4 flex justify-between items-center">
            {/* Rows per page selector - Left side */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show</span>
              <select
                className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="all">All</option>
              </select>
              <span className="text-sm text-gray-600">entries</span>
            </div>

            {/* Search Box - Right side */}
            <div className="relative" style={{width: '250px'}}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 w-full"
              />
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedIds.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                {selectedIds.length} item(s) selected
              </span>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Update Status
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Redeem Status</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => bulkUpdateStatus('redeem_status', 0)}>
                      Mark as Pending
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => bulkUpdateStatus('redeem_status', 1)}>
                      Mark as Verified
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Delivery Status</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => bulkUpdateStatus('delivery_status', 0)}>
                      Mark as Not Delivered
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => bulkUpdateStatus('delivery_status', 1)}>
                      Mark as Delivered
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedIds([])}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === displayedRedemptions.length && displayedRedemptions.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    S.No
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('customer_name')}
                  >
                    Customer
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('rewards_name')}
                  >
                    Reward
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('redeem_points')}
                  >
                    Points
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Redeem Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery Status
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('created_at')}
                  >
                    Redeemed At
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : displayedRedemptions.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                      No redemptions found
                    </td>
                  </tr>
                ) : (
                  displayedRedemptions.map((redemption, index) => (
                    <tr key={redemption.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(redemption.id)}
                          onChange={() => toggleSelectRedemption(redemption.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {((currentPage - 1) * rowsPerPage) + index + 1}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {redemption.customer_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {redemption.customer_email}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">{redemption.rewards_name}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {redemption.redeem_points}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {getStatusBadge(redemption.redeem_status_text, 'redeem')}
                      </td>
                      <td className="px-4 py-4">
                        {getStatusBadge(redemption.delivery_status, 'delivery')}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {redemption.redeemed_at}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => viewRedemptionDetails(redemption.id)}
                          className="gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Records count and Pagination - Bottom of DataTable */}
          <div className="mt-4 flex justify-between items-center">
            {/* Records Count - Bottom left */}
            <div className="text-sm text-gray-600">
              {rowsPerPage === 'all' ? (
                <span>Showing <span className="font-semibold">{filteredRedemptions.length}</span> of <span className="font-semibold">{redemptions.length}</span> records</span>
              ) : (
                <span>
                  Showing <span className="font-semibold">
                    {Math.min((currentPage - 1) * parseInt(rowsPerPage) + 1, filteredRedemptions.length)}
                  </span> to <span className="font-semibold">
                    {Math.min(currentPage * parseInt(rowsPerPage), filteredRedemptions.length)}
                  </span> of <span className="font-semibold">{filteredRedemptions.length}</span> entries
                  {filteredRedemptions.length < redemptions.length && (
                    <span> (filtered from <span className="font-semibold">{redemptions.length}</span> total records)</span>
                  )}
                </span>
              )}
            </div>

            {/* Pagination controls - Bottom right */}
            {rowsPerPage !== 'all' && filteredRedemptions.length > parseInt(rowsPerPage) && (
              <div className="flex gap-2 items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="h-8"
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-8"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {Math.ceil(filteredRedemptions.length / parseInt(rowsPerPage))}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage >= Math.ceil(filteredRedemptions.length / parseInt(rowsPerPage))}
                  className="h-8"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.ceil(filteredRedemptions.length / parseInt(rowsPerPage)))}
                  disabled={currentPage >= Math.ceil(filteredRedemptions.length / parseInt(rowsPerPage))}
                  className="h-8"
                >
                  Last
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Redemption Details</DialogTitle>
          </DialogHeader>
          {selectedRedemption && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-500">Customer</Label>
                  <p className="font-medium">{selectedRedemption.user?.name || 'N/A'}</p>
                  <p className="text-sm text-gray-500">{selectedRedemption.user?.email || ''}</p>
                  <p className="text-sm text-gray-500">{selectedRedemption.user?.mobile || ''}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Current Points Balance</Label>
                  <p className="font-medium">{selectedRedemption.user?.points_balance || 0} points</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <Label className="text-sm text-gray-500">Reward Details</Label>
                <p className="font-medium">{selectedRedemption.rewards_name}</p>
                <p className="text-sm text-gray-500">Points Used: {selectedRedemption.redeem_points}</p>
              </div>

              <div className="border-t pt-4 grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-500">Verification Status</Label>
                  <div className="mt-1">
                    {selectedRedemption.verified_at ? (
                      <>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Verified</span>
                        <p className="text-xs text-gray-500 mt-1">
                          Verified at: {new Date(selectedRedemption.verified_at).toLocaleString()}
                        </p>
                      </>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Not Verified</span>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Delivery Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedRedemption.delivery_status_text, 'delivery')}
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <Label className="text-sm text-gray-500">Timestamps</Label>
                <p className="text-sm">Redeemed: {new Date(selectedRedemption.created_at).toLocaleString()}</p>
                <p className="text-sm">Last Updated: {new Date(selectedRedemption.updated_at).toLocaleString()}</p>
              </div>

              <div className="border-t pt-4 flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateRedemptionStatus(selectedRedemption.id, 'verified_at', true)}
                  disabled={selectedRedemption.verified_at}
                  className={selectedRedemption.verified_at 
                    ? "opacity-50 cursor-not-allowed" 
                    : "bg-green-50 hover:bg-green-100 text-green-700 border-green-300"}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Verified
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateRedemptionStatus(selectedRedemption.id, 'delivery_status', 1)}
                  disabled={!selectedRedemption.verified_at || selectedRedemption.delivery_status === 1}
                  className={!selectedRedemption.verified_at || selectedRedemption.delivery_status === 1
                    ? "opacity-50 cursor-not-allowed" 
                    : "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300"}
                >
                  <Package className="w-4 h-4 mr-2" />
                  Mark as Delivered
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this redemption record. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteRedemption}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}