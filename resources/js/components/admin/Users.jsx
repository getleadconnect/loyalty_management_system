import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { adminAPI } from '../../services/api';
import axios from 'axios';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
  Key,
  User,
  MoreVertical,
  Check,
  X,
  Eye,
  EyeOff,
  CheckCircle
} from 'lucide-react';

const UsersPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Configure toastr
  toastr.options = {
    closeButton: true,
    progressBar: true,
    positionClass: 'toast-top-right',
    timeOut: '5000',
  };
  
  // Users state
  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(10);
  
  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    dateFrom: '',
    dateTo: ''
  });
  const [appliedFilters, setAppliedFilters] = useState({
    status: 'all',
    dateFrom: '',
    dateTo: ''
  });
  
  // Roles state
  const [roles, setRoles] = useState([]);
  
  // Dialog states
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [userToVerify, setUserToVerify] = useState(null);
  
  // Forms
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    country_code: '+91',
    mobile: '',
    aadhar_number: '',
    password: '',
    role_id: 2,
    status: 1,
    image: null,
  });
  
  const [passwordForm, setPasswordForm] = useState({
    password: '',
    password_confirmation: '',
  });
  
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadUsers();
  }, [currentPage, searchQuery, perPage, appliedFilters]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [usersRes, rolesRes] = await Promise.all([
        adminAPI.getUsers({ per_page: perPage, page: 1 }),
        adminAPI.getUserRoles()
      ]);
      
      // Handle users response
      if (usersRes.data && usersRes.data.data) {
        setUsers(usersRes.data.data.data || []);
        setTotalPages(usersRes.data.data.last_page || 1);
        
        // Calculate stats from the users data
        const usersList = usersRes.data.data.data || [];
        setUserStats({
          total_staff: usersList.length,
          active_staff: usersList.filter(u => u.status === 1).length,
          unverified_staff: usersList.filter(u => u.status === 0 || u.status !== 1).length
        });
      }
      
      // Handle roles response
      if (rolesRes.data) {
        setRoles(rolesRes.data.data || rolesRes.data || []);
      }
    } catch (err) {
      setError('Failed to load data');
      console.error('Load initial data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        per_page: perPage,
        search: searchQuery
      };
      
      // Add status filter
      if (appliedFilters.status !== 'all') {
        params.status = appliedFilters.status === 'active' ? 1 : 0;
      }
      
      // Add date filters
      if (appliedFilters.dateFrom) {
        params.date_from = appliedFilters.dateFrom;
      }
      if (appliedFilters.dateTo) {
        params.date_to = appliedFilters.dateTo;
      }
      
      const response = await adminAPI.getUsers(params);
      
      // Handle pagination response structure
      if (response.data && response.data.data) {
        setUsers(response.data.data.data || []);
        setTotalPages(response.data.data.last_page || 1);
        
        // Use stats from backend if available, otherwise calculate from current page
        if (response.data.stats) {
          setUserStats(response.data.stats);
        } else {
          const usersList = response.data.data.data || [];
          setUserStats({
            total_staff: response.data.data.total || usersList.length,
            active_staff: usersList.filter(u => u.status === 1).length,
            unverified_staff: usersList.filter(u => u.status === 0 || u.status !== 1).length
          });
        }
      }
    } catch (err) {
      setError('Failed to load users');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUserForm({ ...userForm, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateUser = async () => {
    setLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('name', userForm.name);
      formData.append('email', userForm.email);
      formData.append('country_code', userForm.country_code);
      formData.append('mobile', userForm.mobile || '');
      formData.append('aadhar_number', userForm.aadhar_number || '');
      formData.append('role_id', userForm.role_id);
      formData.append('status', userForm.status);
      
      if (userForm.image) {
        formData.append('image', userForm.image);
      }
      
      if (!editingUser) {
        formData.append('password', userForm.password);
      }
      
      if (editingUser) {
        // Use adminAPI for update
        await adminAPI.updateUser(editingUser.id, formData);
        toastr.success('User updated successfully');
      } else {
        // Use adminAPI for create
        await adminAPI.createUser(formData);
        toastr.success('User created successfully');
      }
      
      setShowUserDialog(false);
      setEditingUser(null);
      setUserForm({
        name: '',
        email: '',
        country_code: '+91',
        mobile: '',
        aadhar_number: '',
        password: '',
        role_id: 2,
        status: 1,
        image: null,
      });
      setImagePreview(null);
      loadUsers();
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        Object.keys(errors).forEach(key => {
          toastr.error(errors[key][0]);
        });
      } else {
        toastr.error(err.response?.data?.message || 'Failed to save user');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setLoading(true);
    setPasswordError('');
    
    // Client-side validation
    if (!passwordForm.password) {
      setPasswordError('Password is required');
      setLoading(false);
      return;
    }
    
    if (passwordForm.password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }
    
    if (passwordForm.password !== passwordForm.password_confirmation) {
      setPasswordError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    try {
      // Use users API endpoint for password change
      const payload = {
        new_password: passwordForm.password,
        new_password_confirmation: passwordForm.password_confirmation
      };
      console.log('Sending password change request:', payload);
      
      await axios.put(`/api/admin/users/${selectedUserId}/change-password`, payload, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      toastr.success('Password changed successfully');
      setShowPasswordDialog(false);
      setPasswordForm({
        password: '',
        password_confirmation: '',
      });
    } catch (err) {
      console.error('Password change error:', err.response?.data);
      const errors = err.response?.data?.errors;
      if (errors) {
        console.log('Validation errors:', errors);
        if (errors.new_password) {
          setPasswordError(errors.new_password[0]);
        } else {
          // Show first error from any field
          const firstError = Object.values(errors)[0];
          setPasswordError(Array.isArray(firstError) ? firstError[0] : firstError);
        }
      } else {
        setPasswordError(err.response?.data?.message || 'Failed to change password');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    setLoading(true);
    try {
      await adminAPI.deleteUser(userToDelete.id);
      toastr.success('User deleted successfully');
      setShowDeleteDialog(false);
      setUserToDelete(null);
      loadUsers();
    } catch (err) {
      toastr.error(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await adminAPI.toggleUserStatus(user.id);
      toastr.success('User status updated successfully');
      loadUsers();
    } catch (err) {
      toastr.error('Failed to update user status');
    }
  };

  const handleVerifyUser = async () => {
    if (!userToVerify) return;
    
    setLoading(true);
    try {
      // Update user status to 1 (active/verified)
      const formData = new FormData();
      formData.append('status', 1);
      formData.append('name', userToVerify.name);
      formData.append('email', userToVerify.email);
      formData.append('role_id', userToVerify.role_id);
      
      await adminAPI.updateUser(userToVerify.id, formData);
      toastr.success('User verified successfully');
      setShowVerifyDialog(false);
      setUserToVerify(null);
      loadUsers();
    } catch (err) {
      toastr.error(err.response?.data?.message || 'Failed to verify user');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    setAppliedFilters({...filters});
    setCurrentPage(1); // Reset to first page when applying filters
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      status: 'all',
      dateFrom: '',
      dateTo: ''
    };
    setFilters(clearedFilters);
    setAppliedFilters(clearedFilters);
    setCurrentPage(1); // Reset to first page
  };

  const openEditDialog = (user) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      country_code: user.country_code || '+91',
      mobile: user.mobile || '',
      aadhar_number: user.aadhar_number || '',
      password: '',
      role_id: user.role_id,
      status: user.status,
      image: null,
    });
    setImagePreview(user.image_url || null);
    setShowUserDialog(true);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5; // Maximum number of page buttons to show
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">User Settings</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage system users, their roles and permissions</p>
        </div>
        <Button
          onClick={() => {
            setEditingUser(null);
            setUserForm({
              name: '',
              email: '',
              country_code: '+91',
              mobile: '',
              aadhar_number: '',
              password: '',
              role_id: 2,
              status: 1,
              image: null,
            });
            setImagePreview(null);
            setShowUserDialog(true);
          }}
          className="bg-[#0284c7] hover:bg-[#0369a1] w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <Alert className="mb-4 border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="mb-4 border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      {userStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Staff</p>
                  <p className="text-2xl font-bold">{userStats.total_staff}</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Active Staff</p>
                  <p className="text-2xl font-bold">{userStats.active_staff}</p>
                </div>
                <Check className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Unverified Staff</p>
                  <p className="text-2xl font-bold">{userStats.unverified_staff || 0}</p>
                </div>
                <X className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter Section */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Filter Row */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-end max-w-3xl">
              <div className="w-full sm:w-40">
                <Label htmlFor="dateFrom" className="text-sm">Date From</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                  className="mt-1 text-sm"
                />
              </div>
              
              <div className="w-full sm:w-40">
                <Label htmlFor="dateTo" className="text-sm">Date To</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                  className="mt-1 text-sm"
                />
              </div>
              
              <div className="w-full sm:w-32">
                <Label htmlFor="status" className="text-sm">Status</Label>
                <select
                  id="status"
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full px-2 py-2 border rounded-lg mt-1 text-sm"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  onClick={handleApplyFilters}
                  size="sm"
                  className="bg-[#0284c7] hover:bg-[#0369a1] flex-1 sm:flex-initial"
                >
                  Filter
                </Button>
                <Button
                  onClick={handleClearFilters}
                  size="sm"
                  variant="outline"
                  className="flex-1 sm:flex-initial"
                >
                  Clear
                </Button>
              </div>
            </div>
            
            {/* Search Row */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Label className="text-sm">Show:</Label>
                <select
                  value={perPage}
                  onChange={(e) => setPerPage(Number(e.target.value))}
                  className="px-2 sm:px-3 py-1 border rounded-lg text-sm"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto sm:flex-1 sm:max-w-md">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">S.No</th>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Mobile</th>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Aadhar</th>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Created At</th>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user, index) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-2 sm:px-4 py-3 text-sm">{(currentPage - 1) * perPage + index + 1}</td>
                    <td className="px-2 sm:px-4 py-3">
                      <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {user.image_url ? (
                          <img 
                            src={user.image_url} 
                            alt={user.name} 
                            className="h-full w-full rounded-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '';
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = '<svg class="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>';
                            }}
                          />
                        ) : (
                          <User className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-sm font-medium">{user.name}</td>
                    <td className="px-2 sm:px-4 py-3 text-sm break-all">{user.email}</td>
                    <td className="px-2 sm:px-4 py-3 text-sm hidden sm:table-cell">{user.country_code} {user.mobile || '-'}</td>
                    <td className="px-2 sm:px-4 py-3 text-sm hidden md:table-cell">{user.aadhar_number || '-'}</td>
                    <td className="px-2 sm:px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.role?.name === 'Admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : user.role?.name === 'Staff'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role?.name || 'Customer'}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 py-3">
                      <span className={`px-1 sm:px-2 py-1 text-xs rounded-full ${
                        user.status === 1 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-sm hidden lg:table-cell">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-2 sm:px-4 py-3">
                      <div className="flex items-center gap-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(user)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedUserId(user.id);
                              setPasswordError('');
                              setPasswordForm({ password: '', password_confirmation: '' });
                              setShowPasswordDialog(true);
                            }}>
                              <Key className="h-4 w-4 mr-2" />
                              Change Password
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                setUserToDelete(user);
                                setShowDeleteDialog(true);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        {user.status !== 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setUserToVerify(user);
                              setShowVerifyDialog(true);
                            }}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            title="Verify User"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-2 sm:px-4 py-3 border-t flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs sm:text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-1 items-center flex-wrap justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="mr-1 sm:mr-2 text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">Previous</span>
                  <span className="sm:hidden">Prev</span>
                </Button>
                
                {getPageNumbers().map((page, index) => (
                  <React.Fragment key={index}>
                    {page === '...' ? (
                      <span className="px-2 text-gray-400">...</span>
                    ) : (
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={`min-w-[28px] sm:min-w-[32px] text-xs sm:text-sm ${
                          currentPage === page 
                            ? 'bg-[#0284c7] hover:bg-[#0369a1] text-white' 
                            : ''
                        }`}
                      >
                        {page}
                      </Button>
                    )}
                  </React.Fragment>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-1 sm:ml-2 text-xs sm:text-sm"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Edit User' : 'Add User'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                placeholder="Enter name"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                placeholder="Enter email"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1">
                <Label htmlFor="country_code" className="text-sm">Code</Label>
                <Input
                  id="country_code"
                  value={userForm.country_code}
                  onChange={(e) => setUserForm({ ...userForm, country_code: e.target.value })}
                  placeholder="+91"
                  className="text-sm"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="mobile" className="text-sm">Mobile</Label>
                <Input
                  id="mobile"
                  value={userForm.mobile}
                  onChange={(e) => setUserForm({ ...userForm, mobile: e.target.value })}
                  placeholder="Enter mobile"
                  className="text-sm"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="aadhar_number">Aadhar Number</Label>
              <Input
                id="aadhar_number"
                value={userForm.aadhar_number}
                onChange={(e) => setUserForm({ ...userForm, aadhar_number: e.target.value })}
                placeholder="12 digit Aadhar number"
                maxLength={12}
              />
            </div>
            
            {!editingUser && (
              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  placeholder="Minimum 8 characters"
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="role">Role *</Label>
              <select
                id="role"
                value={userForm.role_id}
                onChange={(e) => setUserForm({ ...userForm, role_id: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {roles.map(role => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={userForm.status}
                onChange={(e) => setUserForm({ ...userForm, status: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="image">Profile Image</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="mt-2 h-20 w-20 rounded-full object-cover" />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateUser} className="bg-[#0284c7] hover:bg-[#0369a1]">
              {editingUser ? 'Update' : 'Create'} User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {passwordError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {passwordError}
              </div>
            )}
            <div>
              <Label>New Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={passwordForm.password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                  placeholder="Minimum 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-2"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label>Confirm Password</Label>
              <div className="relative">
                <Input
                  type={showPasswordConfirm ? "text" : "password"}
                  value={passwordForm.password_confirmation}
                  onChange={(e) => setPasswordForm({ ...passwordForm, password_confirmation: e.target.value })}
                  placeholder="Re-enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  className="absolute right-2 top-2"
                >
                  {showPasswordConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)} disabled={loading}>
              Cancel
            </Button>
            <Button 
              onClick={handleChangePassword} 
              className="bg-[#0284c7] hover:bg-[#0369a1]"
              disabled={loading}
            >
              {loading ? 'Changing...' : 'Change Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-[95vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user "{userToDelete?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Verify User Dialog */}
      <AlertDialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <AlertDialogContent className="max-w-[95vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Verify User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to verify the user "{userToVerify?.name}"? This will activate their account and set their status to active.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleVerifyUser}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Verify
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UsersPage;