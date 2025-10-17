import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ArrowLeft, Edit, Save, X, User as UserIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import axios from 'axios';

export default function MyProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updating, setUpdating] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    country_code: '91',
    mobile: '',
    aadhar_number: '',
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [passwordData, setPasswordData] = useState({
    new_password: '',
    new_password_confirmation: '',
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await authAPI.getUser();
      const userData = response.data.user;
      setUser(userData);
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        country_code: userData.country_code || '91',
        mobile: userData.mobile || '',
        aadhar_number: userData.aadhar_number || '',
      });
      if (userData.image) {
        setImagePreview(`/${userData.image}`);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size must be less than 2MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleUpdateProfile = async () => {
    setError('');
    setSuccess('');
    setUpdating(true);

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          submitData.append(key, formData[key]);
        }
      });
      if (imageFile) {
        submitData.append('image', imageFile);
      }

      const response = await axios.put('/api/user/profile', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      setUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setSuccess('Profile updated successfully!');
      setEditMode(false);
      setImageFile(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    setError('');
    setSuccess('');
    setUpdating(true);

    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      setError('New passwords do not match');
      setUpdating(false);
      return;
    }

    try {
      const response = await axios.post('/api/user/change-password', passwordData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      setSuccess('Password changed successfully!');
      setPasswordData({
        new_password: '',
        new_password_confirmation: '',
      });
      setShowPasswordForm(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to change password');
    } finally {
      setUpdating(false);
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      country_code: user.country_code || '91',
      mobile: user.mobile || '',
      aadhar_number: user.aadhar_number || '',
    });
    setImageFile(null);
    setImagePreview(user.image ? `/${user.image}` : null);
    setError('');
    setSuccess('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 sm:py-6">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/customer/dashboard')}
                className="mr-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Profile</h1>
            </div>
            {!editMode && (
              <Button 
                onClick={() => setEditMode(true)}
                size="icon"
                variant="ghost"
                title="Edit Profile"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">{success}</span>
          </div>
        )}

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Image */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-300 flex-shrink-0">
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <UserIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                {editMode && (
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={updating}
                      className="max-w-xs"
                    />
                    <p className="text-xs text-gray-500 mt-1">Max size: 2MB (JPG, PNG, GIF)</p>
                  </div>
                )}
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!editMode || updating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!editMode || updating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile</Label>
                <div className="flex gap-2">
                  <select
                    name="country_code"
                    value={formData.country_code}
                    onChange={handleInputChange}
                    className="flex h-10 w-24 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    disabled={!editMode || updating}
                  >
                    <option value="91">+91</option>
                    <option value="1">+1</option>
                    <option value="44">+44</option>
                    <option value="61">+61</option>
                    <option value="86">+86</option>
                    <option value="81">+81</option>
                  </select>
                  <Input
                    id="mobile"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    className="flex-1"
                    disabled={!editMode || updating}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="aadhar_number">Aadhar Number</Label>
                <Input
                  id="aadhar_number"
                  name="aadhar_number"
                  value={formData.aadhar_number}
                  maxLength={12}
                  disabled={!editMode || updating}
                  onChange={handleInputChange}
                />
              </div>

              {!editMode && (
                <>
                  <div className="space-y-2">
                    <Label>Points Balance</Label>
                    <Input
                      value={user?.points_balance || 0}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Account Status</Label>
                    <Input
                      value={user?.status === 1 ? 'Active' : user?.status === 2 ? 'Blocked' : 'Pending'}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            {editMode && (
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={cancelEdit}
                  disabled={updating}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateProfile}
                  disabled={updating}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {updating ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Change Password</CardTitle>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setShowPasswordForm(!showPasswordForm)}
              >
                {showPasswordForm ? 'Cancel' : 'Change Password'}
              </Button>
            </div>
          </CardHeader>
          {showPasswordForm && (
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new_password">New Password</Label>
                <Input
                  id="new_password"
                  name="new_password"
                  type="password"
                  placeholder="Enter new password (min 8 characters)"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  disabled={updating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new_password_confirmation">Confirm New Password</Label>
                <Input
                  id="new_password_confirmation"
                  name="new_password_confirmation"
                  type="password"
                  placeholder="Re-enter new password"
                  value={passwordData.new_password_confirmation}
                  onChange={handlePasswordChange}
                  disabled={updating}
                />
              </div>
              <div className="flex justify-end">
                <Button 
                  onClick={handleChangePassword}
                  disabled={updating}
                >
                  {updating ? 'Changing...' : 'Change Password'}
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      </main>
    </div>
  );
}