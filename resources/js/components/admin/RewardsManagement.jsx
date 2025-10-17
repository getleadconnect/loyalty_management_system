import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Search, Upload, AlertCircle, Check, X, Image, Filter, Package } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import Pagination from '../ui/pagination';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import { adminAPI } from '../../services/api';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import debounce from 'lodash/debounce';

// Configure toastr
toastr.options = {
  closeButton: true,
  progressBar: true,
  positionClass: "toast-top-right",
  timeOut: "5000",
  extendedTimeOut: "1000",
  showEasing: "swing",
  hideEasing: "linear",
  showMethod: "fadeIn",
  hideMethod: "fadeOut"
};

const RewardsManagement = () => {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rewardToDelete, setRewardToDelete] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  
  const [stats, setStats] = useState({
    total_rewards: 0,
    active_rewards: 0,
    total_redemptions: 0,
    low_stock_count: 0
  });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    points_required: '',
    category: '',
    stock_quantity: '',
    valid_from: '',
    valid_until: '',
    terms_conditions: '',
    is_active: true
  });

  const [formErrors, setFormErrors] = useState({});

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((term) => {
      setCurrentPage(1);
      fetchRewards(1, perPage, term, sortBy, sortOrder);
    }, 500),
    [perPage, sortBy, sortOrder]
  );

  useEffect(() => {
    fetchRewards(currentPage, perPage, searchTerm, sortBy, sortOrder);
    fetchRewardStats();
  }, [currentPage, perPage, sortBy, sortOrder]);

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm]);

  const fetchRewards = async (page = 1, itemsPerPage = 10, search = '', sort = 'created_at', order = 'desc') => {
    try {
      setLoading(true);
      const response = await adminAPI.getRewards({
        page,
        per_page: itemsPerPage,
        search,
        sort_by: sort,
        sort_order: order
      });
      
      setRewards(response.data.data || []);
      setCurrentPage(response.data.current_page);
      setTotalPages(response.data.last_page);
      setTotalItems(response.data.total);
      setPerPage(response.data.per_page);
    } catch (error) {
      toastr.error('Failed to fetch rewards');
    } finally {
      setLoading(false);
    }
  };

  const fetchRewardStats = async () => {
    try {
      const response = await adminAPI.getRewardStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top on mobile
    if (isMobileView) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePerPageChange = (newPerPage) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) errors.name = 'Reward name is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.points_required || formData.points_required <= 0) {
      errors.points_required = 'Valid points value is required';
    }
    if (!formData.category.trim()) errors.category = 'Category is required';
    
    if (formData.valid_from && formData.valid_until) {
      if (new Date(formData.valid_from) > new Date(formData.valid_until)) {
        errors.valid_until = 'End date must be after start date';
      }
    }

    // Validate image file if selected
    if (imageFile) {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      if (!validTypes.includes(imageFile.type)) {
        errors.image = 'Please select a valid image file (JPEG, PNG, JPG, GIF)';
      }
      if (imageFile.size > 2 * 1024 * 1024) { // 2MB
        errors.image = 'Image size must be less than 2MB';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toastr.error('Please fix the validation errors');
      return;
    }

    setSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('points_required', formData.points_required);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('is_active', formData.is_active ? '1' : '0');
      
      if (formData.stock_quantity) {
        formDataToSend.append('stock_quantity', formData.stock_quantity);
      }
      if (formData.valid_from) {
        formDataToSend.append('valid_from', formData.valid_from);
      }
      if (formData.valid_until) {
        formDataToSend.append('valid_until', formData.valid_until);
      }
      if (formData.terms_conditions) {
        formDataToSend.append('terms_conditions', formData.terms_conditions);
      }
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      let response;
      if (editingReward) {
        // For update, we need to use POST with _method field for Laravel
        formDataToSend.append('_method', 'PUT');
        response = await adminAPI.updateReward(editingReward.id, formDataToSend);
        toastr.success('Reward updated successfully!');
      } else {
        response = await adminAPI.createReward(formDataToSend);
        toastr.success('Reward created successfully! WhatsApp notifications sent to all customers.');
      }

      resetForm();
      fetchRewards(currentPage, perPage, searchTerm, sortBy, sortOrder);
      fetchRewardStats();
      setOpenModal(false);
    } catch (error) {
      if (error.response?.data?.errors) {
        // Display validation errors
        const errors = error.response.data.errors;
        Object.keys(errors).forEach(key => {
          toastr.error(errors[key][0]);
        });
      } else {
        toastr.error(error.response?.data?.message || 'Failed to save reward');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (reward) => {
    setEditingReward(reward);
    setFormData({
      name: reward.name,
      description: reward.description,
      points_required: reward.points_required.toString(),
      category: reward.category || '',
      stock_quantity: reward.stock_quantity?.toString() || '',
      valid_from: reward.valid_from ? reward.valid_from.split('T')[0] : '',
      valid_until: reward.valid_until ? reward.valid_until.split('T')[0] : '',
      terms_conditions: reward.terms_conditions || '',
      is_active: reward.is_active
    });
    
    // Set image preview if exists
    if (reward.image_url) {
      setImagePreview(reward.image_url);
    }
    
    setFormErrors({});
    setOpenModal(true);
  };

  const handleDeleteClick = (reward) => {
    setRewardToDelete(reward);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!rewardToDelete) return;
    
    try {
      await adminAPI.deleteReward(rewardToDelete.id);
      toastr.success('Reward deleted successfully');
      
      // If deleting the last item on a page, go to previous page
      if (rewards.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchRewards(currentPage, perPage, searchTerm, sortBy, sortOrder);
      }
      
      fetchRewardStats();
      setDeleteDialogOpen(false);
      setRewardToDelete(null);
    } catch (error) {
      toastr.error(error.response?.data?.message || 'Failed to delete reward');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await adminAPI.toggleRewardStatus(id);
      toastr.success(`Reward ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      fetchRewards(currentPage, perPage, searchTerm, sortBy, sortOrder);
      fetchRewardStats();
    } catch (error) {
      toastr.error('Failed to update reward status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      points_required: '',
      category: '',
      stock_quantity: '',
      valid_from: '',
      valid_until: '',
      terms_conditions: '',
      is_active: true
    });
    setEditingReward(null);
    setFormErrors({});
    setImageFile(null);
    setImagePreview(null);
  };

  const handleOpenModal = () => {
    resetForm();
    setOpenModal(true);
  };

  const categories = ['Electronics', 'Vouchers', 'Travel', 'Fashion', 'Food & Dining', 'Entertainment', 'Services', 'Other'];

  // Mobile Card View Component
  const MobileRewardCard = ({ reward }) => (
    <Card className="mb-3 hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start space-x-3">
          {/* Image */}
          <div className="flex-shrink-0">
            {reward.image_url ? (
              <img 
                src={reward.image_url} 
                alt={reward.name}
                className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg shadow-sm"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center shadow-sm">
                <Image className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title and Status */}
            <div>
              <h3 className="font-semibold text-sm sm:text-base line-clamp-1">{reward.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={() => handleToggleStatus(reward.id, reward.is_active)}
                  className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium transition-colors ${
                    reward.is_active 
                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {reward.is_active ? 'Active' : 'Inactive'}
                </button>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mt-1.5 line-clamp-2">{reward.description}</p>
            </div>
            
            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2 sm:mt-3 text-[11px] sm:text-xs">
              <div className="flex items-center">
                <span className="text-gray-500">Category:</span>
                <span className="ml-1 font-medium truncate">{reward.category || 'Uncategorized'}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-500">Points:</span>
                <span className="ml-1 font-semibold text-blue-600">{reward.points_required}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-500">Stock:</span>
                <span className={`ml-1 font-medium ${reward.stock_quantity && reward.stock_quantity <= 5 ? 'text-orange-600' : ''}`}>
                  {reward.stock_quantity !== null ? `${reward.stock_quantity}${reward.stock_quantity <= 5 ? ' (Low)' : ''}` : 'Unlimited'}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-500">Redeemed:</span>
                <span className="ml-1 font-medium">{reward.redemptions_count || 0}</span>
              </div>
            </div>
            
            {/* Validity */}
            {(reward.valid_from || reward.valid_until) && (
              <div className="mt-2 text-[10px] sm:text-xs text-gray-500 flex items-center gap-2">
                {reward.valid_from && <span>From: {new Date(reward.valid_from).toLocaleDateString()}</span>}
                {reward.valid_until && <span>Until: {new Date(reward.valid_until).toLocaleDateString()}</span>}
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2 mt-2 sm:mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEdit(reward)}
                className="flex-1 text-xs sm:text-sm h-8 sm:h-9"
              >
                <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDeleteClick(reward)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-1 text-xs sm:text-sm h-8 sm:h-9"
              >
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-2 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Rewards Management</h1>
          <p className="text-gray-600 mt-1 text-xs sm:text-sm md:text-base">Manage your loyalty program rewards catalog</p>
        </div>
        <Dialog open={openModal} onOpenChange={setOpenModal}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenModal} className="w-full sm:w-auto flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />
              Add New Reward
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[calc(100%-1rem)] sm:w-[90%] md:w-full mx-auto rounded-lg">
            <DialogHeader>
              <DialogTitle>{editingReward ? 'Edit Reward' : 'Add New Reward'}</DialogTitle>
              <DialogDescription>
                {editingReward ? 'Update reward information' : 'Create a new reward for your customers'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-1">
                  <Label htmlFor="name">Reward Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., $50 Shopping Voucher"
                    className={formErrors.name ? 'border-red-500' : ''}
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                  )}
                </div>

                <div className="col-span-1 md:col-span-1">
                  <Label htmlFor="category">Category *</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md ${formErrors.category ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {formErrors.category && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.category}</p>
                  )}
                </div>

                <div className="col-span-1 md:col-span-1">
                  <Label htmlFor="points_required">Points Required *</Label>
                  <Input
                    id="points_required"
                    type="number"
                    value={formData.points_required}
                    onChange={(e) => setFormData({...formData, points_required: e.target.value})}
                    placeholder="e.g., 500"
                    className={formErrors.points_required ? 'border-red-500' : ''}
                  />
                  {formErrors.points_required && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.points_required}</p>
                  )}
                </div>

                <div className="col-span-1 md:col-span-1">
                  <Label htmlFor="stock_quantity">Stock Quantity (Optional)</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}
                    placeholder="Leave empty for unlimited"
                  />
                </div>

                <div className="col-span-1 md:col-span-1">
                  <Label htmlFor="valid_from">Valid From (Optional)</Label>
                  <Input
                    id="valid_from"
                    type="date"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({...formData, valid_from: e.target.value})}
                  />
                </div>

                <div className="col-span-1 md:col-span-1">
                  <Label htmlFor="valid_until">Valid Until (Optional)</Label>
                  <Input
                    id="valid_until"
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
                    className={formErrors.valid_until ? 'border-red-500' : ''}
                  />
                  {formErrors.valid_until && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.valid_until}</p>
                  )}
                </div>

                <div className="col-span-1 md:col-span-2">
                  <Label htmlFor="image">Reward Image (Optional)</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-2 sm:space-y-0">
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className={`flex-1 ${formErrors.image ? 'border-red-500' : ''}`}
                      />
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Upload className="w-4 h-4" />
                        <span>Max 2MB</span>
                      </div>
                    </div>
                    {formErrors.image && (
                      <p className="text-red-500 text-sm">{formErrors.image}</p>
                    )}
                    {imagePreview && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 mb-2">Preview:</p>
                        <img 
                          src={imagePreview} 
                          alt="Reward preview" 
                          className="w-32 h-32 object-cover rounded-lg border"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <Label htmlFor="description">Description *</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe the reward..."
                    rows="3"
                    className={`w-full px-3 py-2 border rounded-md ${formErrors.description ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {formErrors.description && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
                  )}
                </div>

                <div className="col-span-1 md:col-span-2">
                  <Label htmlFor="terms_conditions">Terms & Conditions (Optional)</Label>
                  <textarea
                    id="terms_conditions"
                    value={formData.terms_conditions}
                    onChange={(e) => setFormData({...formData, terms_conditions: e.target.value})}
                    placeholder="Enter any terms and conditions..."
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                      className="rounded"
                    />
                    <span>Active (Available for redemption)</span>
                  </label>
                </div>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button type="button" variant="outline" onClick={() => setOpenModal(false)} disabled={submitting} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                  {submitting ? 'Saving...' : (editingReward ? 'Update Reward' : 'Create Reward')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <div>
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 font-medium">Total Rewards</p>
              </div>
              <div className="text-lg sm:text-xl md:text-2xl font-bold">{stats.total_rewards}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <div>
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 font-medium">Active</p>
              </div>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">{stats.active_rewards}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <div>
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 font-medium">Redemptions</p>
              </div>
              <div className="text-lg sm:text-xl md:text-2xl font-bold">{stats.total_redemptions}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <div>
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 font-medium">Low Stock</p>
              </div>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600">{stats.low_stock_count}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rewards Table */}
      <Card>
        <CardHeader>
          <CardTitle>Rewards Catalog</CardTitle>
          <CardDescription>
            {totalItems > 0 ? `Total ${totalItems} rewards found` : 'Manage all rewards in your loyalty program'}
          </CardDescription>
        </CardHeader>
        
        {/* Search and Filter Bar - Inside Card but above CardContent */}
        <div className="px-3 sm:px-6 pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Left side - Rows per page and Sort */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">Show</span>
                <select
                  value={perPage}
                  onChange={(e) => handlePerPageChange(Number(e.target.value))}
                  className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[5, 10, 20, 50].map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <span className="text-sm text-gray-700">entries</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Sort:</span>
                <select 
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field);
                    setSortOrder(order);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 sm:flex-none"
                >
                  <option value="created_at-desc">Newest First</option>
                  <option value="created_at-asc">Oldest First</option>
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="points_required-asc">Points (Low to High)</option>
                  <option value="points_required-desc">Points (High to Low)</option>
                  <option value="category-asc">Category (A-Z)</option>
                </select>
              </div>
            </div>
            
            {/* Right side - Search box */}
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search rewards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>
        </div>
        
        <CardContent className="p-3 sm:p-6">
          {loading ? (
            <div className="text-center py-8">Loading rewards...</div>
          ) : rewards.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No rewards found matching your search' : 'No rewards added yet'}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-3 font-medium">Image</th>
                      <th className="text-left p-3 font-medium cursor-pointer hover:bg-gray-100" onClick={() => handleSort('name')}>
                        <div className="flex items-center">
                          Reward
                          {sortBy === 'name' && (
                            <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th className="text-left p-3 font-medium cursor-pointer hover:bg-gray-100" onClick={() => handleSort('category')}>
                        <div className="flex items-center">
                          Category
                          {sortBy === 'category' && (
                            <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th className="text-left p-3 font-medium cursor-pointer hover:bg-gray-100" onClick={() => handleSort('points_required')}>
                        <div className="flex items-center">
                          Points
                          {sortBy === 'points_required' && (
                            <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th className="text-left p-3 font-medium">Stock</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Validity</th>
                      <th className="text-left p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rewards.map((reward) => (
                      <tr key={reward.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          {reward.image_url ? (
                            <img 
                              src={reward.image_url} 
                              alt={reward.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                              <Image className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{reward.name}</div>
                            <div className="text-sm text-gray-500">
                              {reward.description.length > 50 
                                ? reward.description.substring(0, 50) + '...' 
                                : reward.description}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                            {reward.category || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="p-3 font-medium">{reward.points_required}</td>
                        <td className="p-3">
                          {reward.stock_quantity !== null ? (
                            <span className={reward.stock_quantity <= 5 ? 'text-orange-600 font-medium' : ''}>
                              {reward.stock_quantity}
                              {reward.stock_quantity <= 5 && ' (Low)'}
                            </span>
                          ) : (
                            <span className="text-gray-500">Unlimited</span>
                          )}
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleToggleStatus(reward.id, reward.is_active)}
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              reward.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {reward.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="p-3 text-sm">
                          {reward.valid_from || reward.valid_until ? (
                            <div>
                              {reward.valid_from && <div>From: {new Date(reward.valid_from).toLocaleDateString()}</div>}
                              {reward.valid_until && <div>Until: {new Date(reward.valid_until).toLocaleDateString()}</div>}
                            </div>
                          ) : (
                            <span className="text-gray-500">Always valid</span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEdit(reward)}
                              className="p-1 hover:bg-gray-100 rounded"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4 text-blue-600" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(reward)}
                              className="p-1 hover:bg-gray-100 rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Mobile Card View */}
              <div className="lg:hidden">
                <div className="space-y-3">
                  {rewards.map((reward) => (
                    <MobileRewardCard key={reward.id} reward={reward} />
                  ))}
                </div>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 pb-2">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    perPage={perPage}
                    onPageChange={handlePageChange}
                    onPerPageChange={null}
                    perPageOptions={[5, 10, 20, 50]}
                    className="justify-center sm:justify-start"
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Reward</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{rewardToDelete?.name}"? This action cannot be undone.
              {rewardToDelete?.redemptions_count > 0 && (
                <span className="block mt-2 text-orange-600">
                  Warning: This reward has been redeemed {rewardToDelete.redemptions_count} time(s).
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RewardsManagement;