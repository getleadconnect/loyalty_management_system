import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import { 
  Search, 
  User, 
  Mail, 
  Phone,
  TrendingUp,
  TrendingDown,
  Edit,
  MessageSquare,
  Trash2,
  Plus,
  Filter,
  Download,
  MoreVertical,
  ChevronLeft,
  X,
  ChevronRight,
  CreditCard,
  Calendar,
  MapPin,
  Send,
  ChevronDown
} from 'lucide-react';
import api from '@/services/api';

export default function Customers() {
  // Configure toastr
  toastr.options = {
    closeButton: true,
    progressBar: true,
    positionClass: 'toast-top-right',
    showDuration: '300',
    hideDuration: '1000',
    timeOut: '5000',
    extendedTimeOut: '1000',
    showEasing: 'swing',
    hideEasing: 'linear',
    showMethod: 'fadeIn',
    hideMethod: 'fadeOut'
  };

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [tableSearchQuery, setTableSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // Modal states
  const [adjustPointsModal, setAdjustPointsModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [messageModal, setMessageModal] = useState(false);
  const [addCustomerModal, setAddCustomerModal] = useState(false);
  
  // Form data
  const [adjustmentData, setAdjustmentData] = useState({
    type: 'add',
    amount: '',
    reason: ''
  });
  
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    country_code: '',
    mobile: '',
    status: 'active'
  });
  
  const [messageData, setMessageData] = useState({
    channel: 'email',
    subject: '',
    message: ''
  });

  const [newCustomerData, setNewCustomerData] = useState({
    name: '',
    email: '',
    password: '',
    mobile: '',
    country_code: '+91',
    points_balance: ''
  });

  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, perPage]);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExportMenu && !event.target.closest('.export-menu-container')) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportMenu]);

  const fetchCustomers = async (searchTerm = null) => {
    setLoading(true);
    try {
      const response = await api.get('/admin/customers', {
        params: {
          page: currentPage,
          per_page: perPage,
          search: searchTerm !== null ? searchTerm : searchQuery,
          date_from: dateFrom,
          date_to: dateTo
        }
      });
      setCustomers(response.data.data || []);
      setTotalPages(response.data.last_page || 1);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchCustomers();
  };

  const handleClear = () => {
    setSearchQuery('');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
    fetchCustomers(''); // Pass empty string directly
  };

  const handleAdjustPoints = async () => {
    if (!selectedCustomer || !adjustmentData.amount || !adjustmentData.reason) {
      toastr.warning('Please fill all fields');
      return;
    }

    try {
      const response = await api.post(`/admin/customers/${selectedCustomer.id}/adjust-points`, adjustmentData);
      
      if (response.data) {
        setAdjustPointsModal(false);
        setAdjustmentData({ type: 'add', amount: '', reason: '' });
        fetchCustomers();
        toastr.success('Points adjusted successfully!');
      }
    } catch (error) {
      console.error('Error adjusting points:', error);
      toastr.error('Failed to adjust points');
    }
  };

  const handleEditCustomer = async () => {
    if (!selectedCustomer) return;

    try {
      const response = await api.put(`/admin/customers/${selectedCustomer.id}`, editData);
      
      if (response.data) {
        setEditModal(false);
        fetchCustomers();
        toastr.success('Customer updated successfully!');
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      toastr.error('Failed to update customer');
    }
  };

  const handleDeleteCustomer = async () => {
    if (!selectedCustomer) return;

    try {
      await api.delete(`/admin/customers/${selectedCustomer.id}`);
      setDeleteModal(false);
      fetchCustomers();
      toastr.success('Customer deleted successfully!');
    } catch (error) {
      console.error('Error deleting customer:', error);
      toastr.error('Failed to delete customer');
    }
  };

  const handleAddCustomer = async () => {
    // Validate required fields
    if (!newCustomerData.name || !newCustomerData.email || !newCustomerData.password) {
      toastr.warning('Please fill in all required fields (Name, Email, and Password)');
      return;
    }

    try {
      const response = await api.post('/admin/customers', {
        ...newCustomerData,
        points_balance: newCustomerData.points_balance === '' ? 0 : newCustomerData.points_balance,
        role_id: 2 // Customer role
      });
      
      if (response.data) {
        setAddCustomerModal(false);
        // Reset form
        setNewCustomerData({
          name: '',
          email: '',
          password: '',
          mobile: '',
          country_code: '+91',
          points_balance: ''
        });
        fetchCustomers();
        toastr.success('Customer added successfully!');
      }
    } catch (error) {
      console.error('Error adding customer:', error);
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        toastr.error('Failed to add customer: ' + errorMessages.join(', '));
      } else {
        toastr.error('Failed to add customer');
      }
    }
  };

  const handleSendMessage = async () => {
    if (!selectedCustomer || !messageData.subject || !messageData.message) {
      toastr.warning('Please fill all fields');
      return;
    }

    try {
      const response = await api.post(`/admin/customers/${selectedCustomer.id}/send-message`, messageData);
      
      if (response.data) {
        setMessageModal(false);
        setMessageData({ channel: 'email', subject: '', message: '' });
        toastr.success('Message sent successfully!');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toastr.error('Failed to send message');
    }
  };

  const handleExport = async (format = 'csv') => {
    try {
      // Hide the export menu
      setShowExportMenu(false);
      
      // Get the current filters
      const params = new URLSearchParams({
        search: searchQuery,
        date_from: dateFrom,
        date_to: dateTo,
        format: format // Add format parameter
      });

      // Create a download link
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const exportUrl = `${apiUrl}/api/admin/customers/export?${params.toString()}`;
      
      // Determine the content type based on format
      const contentType = format === 'xlsx' 
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'text/csv';
      
      // Add authorization header using fetch
      const response = await fetch(exportUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': contentType
        }
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Get the blob from response
      const blob = await response.blob();
      
      // Create object URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Get filename from response headers or use default
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `customers_export.${format}`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      // Create download link and click it
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toastr.success(`Export downloaded successfully as ${format.toUpperCase()}!`);
    } catch (error) {
      console.error('Error exporting customers:', error);
      toastr.error('Failed to export customers');
    }
  };

  const openEditModal = (customer) => {
    setSelectedCustomer(customer);
    setEditData({
      name: customer.name,
      email: customer.email,
      country_code: customer.country_code || '',
      mobile: customer.mobile || '',
      status: customer.status || 'active'
    });
    setEditModal(true);
  };

  if (loading && customers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-1">Manage your customer accounts and points</p>
        </div>
        <Button 
          className="bg-sky-600 hover:bg-sky-700"
          onClick={() => setAddCustomerModal(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            {/* Search box, Date filters, Filter and Clear buttons - Left Side */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search Box */}
              <div className="relative" style={{ width: '350px' }}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 w-full"
                />
              </div>
              
              {/* Date Filters */}
              <div className="flex items-center gap-2">
                <Label htmlFor="date-from" className="text-sm text-gray-600 whitespace-nowrap">
                  From:
                </Label>
                <Input
                  id="date-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-36"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="date-to" className="text-sm text-gray-600 whitespace-nowrap">
                  To:
                </Label>
                <Input
                  id="date-to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-36"
                />
              </div>
              
              {/* Filter and Clear Buttons */}
              <Button 
                variant="outline" 
                onClick={handleSearch}
                style={{ backgroundColor: '#bcbfc4', color: 'black' }}
                className="hover:opacity-90 border-0"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline" onClick={handleClear}>
                <X className="mr-2 h-4 w-4" />
                Clear
              </Button>
            </div>
            
            {/* Export button with dropdown - Right Side */}
            <div className="relative export-menu-container">
              <Button 
                variant="outline" 
                onClick={() => setShowExportMenu(!showExportMenu)}
              >
                <Download className="mr-2 h-4 w-4" />
                Export
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
              
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center rounded-t-lg"
                    onClick={() => handleExport('csv')}
                  >
                    <Download className="mr-2 h-4 w-4 text-green-600" />
                    <span>Export as CSV</span>
                    <span className="ml-auto text-xs text-gray-500">.csv</span>
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center rounded-b-lg"
                    onClick={() => handleExport('xlsx')}
                  >
                    <Download className="mr-2 h-4 w-4 text-blue-600" />
                    <span>Export as Excel</span>
                    <span className="ml-auto text-xs text-gray-500">.xlsx</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-0">
          {/* Table Header - Customer List Heading */}
          <div className="p-4 bg-gradient-to-r from-sky-50 to-blue-50 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Customer List</h3>
          </div>
          
          {/* Controls Row - Rows per page and Search */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 border-b">
            {/* Rows per page selector - Left Side */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show</span>
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-600">entries</span>
            </div>
            
            {/* Table Search - Right Side */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search in table..."
                value={tableSearchQuery}
                onChange={(e) => setTableSearchQuery(e.target.value)}
                className="pl-10 pr-3 py-1.5 text-sm w-full"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">Customer</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700 hidden md:table-cell">Email</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">Mobile</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">Points</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700 hidden lg:table-cell">Joined</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700 hidden xl:table-cell">Status</th>
                  <th className="text-center p-4 text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <div className="rounded-full bg-gray-100 p-3 mb-4">
                          <User className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-lg font-medium text-gray-900 mb-1">No records found</p>
                        <p className="text-sm text-gray-500">Try adjusting your search or filter criteria</p>
                      </div>
                    </td>
                  </tr>
                ) : customers
                  .filter(customer => {
                    if (!tableSearchQuery) return true;
                    const searchLower = tableSearchQuery.toLowerCase();
                    return (
                      customer.name?.toLowerCase().includes(searchLower) ||
                      customer.email?.toLowerCase().includes(searchLower) ||
                      customer.mobile?.toLowerCase().includes(searchLower) ||
                      customer.country_code?.toString().includes(searchLower)
                    );
                  })
                  .length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <div className="rounded-full bg-gray-100 p-3 mb-4">
                          <Search className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-lg font-medium text-gray-900 mb-1">No matching records</p>
                        <p className="text-sm text-gray-500">No customers found matching "{tableSearchQuery}"</p>
                      </div>
                    </td>
                  </tr>
                ) : customers
                  .filter(customer => {
                    if (!tableSearchQuery) return true;
                    const searchLower = tableSearchQuery.toLowerCase();
                    return (
                      customer.name?.toLowerCase().includes(searchLower) ||
                      customer.email?.toLowerCase().includes(searchLower) ||
                      customer.mobile?.toLowerCase().includes(searchLower) ||
                      customer.country_code?.toString().includes(searchLower)
                    );
                  })
                  .map((customer, index) => (
                  <tr key={customer.id} className={`border-b hover:bg-sky-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full flex items-center justify-center text-white font-semibold text-sm" style={{ width: '2rem', height: '2rem', backgroundColor: '#60a5fa' }}>
                          {customer.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{customer.name}</p>
                          <p className="text-xs text-gray-500 sm:hidden">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-3 w-3" />
                        <span className="truncate max-w-[200px]">{customer.email}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-3 w-3" />
                        <span>
                          {customer.country_code && customer.mobile 
                            ? `${customer.country_code} ${customer.mobile}` 
                            : customer.mobile || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-sky-600" />
                        <div>
                          <p className="font-semibold text-sky-600">{customer.points_balance || 0}</p>
                          <p className="text-xs text-gray-500">points</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-3 w-3" />
                        {customer.member_since || 'N/A'}
                      </div>
                    </td>
                    <td className="p-4 hidden xl:table-cell">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        customer.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : customer.status === 'inactive'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {customer.status || 'active'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="group relative p-2 rounded-lg hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:shadow-sm transition-all duration-200"
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setAdjustPointsModal(true);
                          }}
                          title="Adjust Points"
                        >
                          <CreditCard className="h-4 w-4 text-amber-600 group-hover:scale-110 transition-transform" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="group relative p-2 rounded-lg hover:bg-gradient-to-r hover:from-sky-50 hover:to-blue-50 hover:shadow-sm transition-all duration-200"
                          onClick={() => openEditModal(customer)}
                          title="Edit Customer"
                        >
                          <Edit className="h-4 w-4 text-sky-600 group-hover:scale-110 transition-transform" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="group relative p-2 rounded-lg hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:shadow-sm transition-all duration-200"
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setMessageModal(true);
                          }}
                          title="Send Message"
                        >
                          <MessageSquare className="h-4 w-4 text-green-600 group-hover:scale-110 transition-transform" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="group relative p-2 rounded-lg hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:shadow-sm transition-all duration-200"
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setDeleteModal(true);
                          }}
                          title="Delete Customer"
                        >
                          <Trash2 className="h-4 w-4 text-red-500 group-hover:scale-110 transition-transform" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t">
            <div className="text-sm text-gray-600">
              Showing {customers.length > 0 ? ((currentPage - 1) * perPage) + 1 : 0} to {Math.min(currentPage * perPage, customers.length)} of {customers.length} entries
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-3 py-1 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Adjust Points Modal */}
      {adjustPointsModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Adjust Points</CardTitle>
              <p className="text-sm text-gray-600">Customer: {selectedCustomer.name}</p>
              <p className="text-sm text-gray-600">Current Balance: {selectedCustomer.points_balance} points</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Adjustment Type</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    variant={adjustmentData.type === 'add' ? 'default' : 'outline'}
                    onClick={() => setAdjustmentData({...adjustmentData, type: 'add'})}
                    className={adjustmentData.type === 'add' ? 'bg-sky-600' : ''}
                  >
                    <TrendingUp className="mr-1 h-3 w-3" />
                    Add Points
                  </Button>
                  <Button
                    size="sm"
                    variant={adjustmentData.type === 'deduct' ? 'default' : 'outline'}
                    onClick={() => setAdjustmentData({...adjustmentData, type: 'deduct'})}
                    className={adjustmentData.type === 'deduct' ? 'bg-red-600' : ''}
                  >
                    <TrendingDown className="mr-1 h-3 w-3" />
                    Deduct Points
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="amount">Points Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  placeholder="Enter points amount"
                  value={adjustmentData.amount}
                  onChange={(e) => setAdjustmentData({...adjustmentData, amount: e.target.value})}
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
                  className="flex-1 bg-sky-600 hover:bg-sky-700"
                  onClick={handleAdjustPoints}
                >
                  Apply Adjustment
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setAdjustPointsModal(false);
                    setAdjustmentData({ type: 'add', amount: '', reason: '' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Customer Modal */}
      {editModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Edit Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({...editData, name: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({...editData, email: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="edit-country-code">Country Code</Label>
                  <Input
                    id="edit-country-code"
                    type="text"
                    value={editData.country_code}
                    onChange={(e) => setEditData({...editData, country_code: e.target.value})}
                    placeholder="+1"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="edit-mobile">Mobile</Label>
                  <Input
                    id="edit-mobile"
                    type="tel"
                    value={editData.mobile}
                    onChange={(e) => setEditData({...editData, mobile: e.target.value})}
                    placeholder="Enter mobile number"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <select
                  id="edit-status"
                  className="w-full px-3 py-2 border rounded-md"
                  value={editData.status}
                  onChange={(e) => setEditData({...editData, status: e.target.value})}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              
              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-sky-600 hover:bg-sky-700"
                  onClick={handleEditCustomer}
                >
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setEditModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-red-600">Delete Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Are you sure you want to delete this customer?</p>
              <p className="font-semibold">{selectedCustomer.name}</p>
              <p className="text-sm text-gray-600">This action cannot be undone.</p>
              
              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  onClick={handleDeleteCustomer}
                >
                  Delete Customer
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDeleteModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Customer Modal */}
      {addCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add New Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="new-name">Name *</Label>
                <Input
                  id="new-name"
                  type="text"
                  placeholder="Enter customer name"
                  value={newCustomerData.name}
                  onChange={(e) => setNewCustomerData({...newCustomerData, name: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="new-email">Email *</Label>
                <Input
                  id="new-email"
                  type="email"
                  placeholder="Enter email address"
                  value={newCustomerData.email}
                  onChange={(e) => setNewCustomerData({...newCustomerData, email: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="new-password">Password *</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter password"
                  value={newCustomerData.password}
                  onChange={(e) => setNewCustomerData({...newCustomerData, password: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="new-country-code">Country Code</Label>
                  <Input
                    id="new-country-code"
                    type="text"
                    value={newCustomerData.country_code}
                    onChange={(e) => setNewCustomerData({...newCustomerData, country_code: e.target.value})}
                    placeholder="+1"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="new-mobile">Mobile</Label>
                  <Input
                    id="new-mobile"
                    type="tel"
                    value={newCustomerData.mobile}
                    onChange={(e) => setNewCustomerData({...newCustomerData, mobile: e.target.value})}
                    placeholder="Enter mobile number"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="new-points">Initial Points Balance</Label>
                <Input
                  id="new-points"
                  type="number"
                  min="0"
                  value={newCustomerData.points_balance}
                  onChange={(e) => setNewCustomerData({...newCustomerData, points_balance: e.target.value === '' ? '' : parseInt(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-sky-600 hover:bg-sky-700"
                  onClick={handleAddCustomer}
                >
                  Add Customer
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setAddCustomerModal(false);
                    setNewCustomerData({
                      name: '',
                      email: '',
                      password: '',
                      mobile: '',
                      country_code: '+91',
                      points_balance: ''
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Send Message Modal */}
      {messageModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Send Message</CardTitle>
              <p className="text-sm text-gray-600">To: {selectedCustomer.name}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Channel</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    variant={messageData.channel === 'email' ? 'default' : 'outline'}
                    onClick={() => setMessageData({...messageData, channel: 'email'})}
                    className={messageData.channel === 'email' ? 'bg-sky-600' : ''}
                  >
                    Email
                  </Button>
                  <Button
                    size="sm"
                    variant={messageData.channel === 'sms' ? 'default' : 'outline'}
                    onClick={() => setMessageData({...messageData, channel: 'sms'})}
                    className={messageData.channel === 'sms' ? 'bg-sky-600' : ''}
                  >
                    SMS
                  </Button>
                  <Button
                    size="sm"
                    variant={messageData.channel === 'whatsapp' ? 'default' : 'outline'}
                    onClick={() => setMessageData({...messageData, channel: 'whatsapp'})}
                    className={messageData.channel === 'whatsapp' ? 'bg-sky-600' : ''}
                  >
                    WhatsApp
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  type="text"
                  placeholder="Enter message subject"
                  value={messageData.subject}
                  onChange={(e) => setMessageData({...messageData, subject: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="message">Message</Label>
                <textarea
                  id="message"
                  className="w-full px-3 py-2 border rounded-md"
                  rows="4"
                  placeholder="Enter your message"
                  value={messageData.message}
                  onChange={(e) => setMessageData({...messageData, message: e.target.value})}
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-sky-600 hover:bg-sky-700"
                  onClick={handleSendMessage}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setMessageModal(false);
                    setMessageData({ channel: 'email', subject: '', message: '' });
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