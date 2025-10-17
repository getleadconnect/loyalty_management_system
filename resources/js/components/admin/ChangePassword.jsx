import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import api from '@/services/api';

export default function ChangePassword() {
  const [formData, setFormData] = useState({
    new_password: '',
    confirm_password: ''
  });
  const [showPassword, setShowPassword] = useState({
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});

  const validatePassword = (password) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      special: /[!@#$%^&*]/.test(password)
    };
    return requirements;
  };

  const passwordRequirements = validatePassword(formData.new_password);
  const isPasswordValid = Object.values(passwordRequirements).every(req => req);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setErrors({});

    // Validation
    const newErrors = {};
    if (!formData.new_password) {
      newErrors.new_password = 'New password is required';
    } else if (!isPasswordValid) {
      newErrors.new_password = 'Password does not meet requirements';
    }
    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Please confirm your new password';
    } else if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await api.post('/user/change-password', {
        password: formData.new_password,
        password_confirmation: formData.confirm_password
      });
      
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setFormData({
        new_password: '',
        confirm_password: ''
      });
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        setMessage({ type: 'error', text: error.response.data.message });
      } else {
        setMessage({ type: 'error', text: 'Failed to change password. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Change Password</h1>
        <p className="text-gray-600 mt-1">Update your account password</p>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Change Your Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            {message.text && (
              <Alert className={`mb-6 ${message.type === 'success' ? 'border-green-500' : 'border-red-500'}`}>
                {message.type === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <AlertDescription className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
                  {message.text}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password */}
              <div>
                <Label htmlFor="new_password">New Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="new_password"
                    type={showPassword.new ? 'text' : 'password'}
                    value={formData.new_password}
                    onChange={(e) => setFormData({...formData, new_password: e.target.value})}
                    placeholder="Enter your new password"
                    className={errors.new_password ? 'border-red-500' : ''}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.new_password && (
                  <p className="text-red-500 text-sm mt-1">{errors.new_password}</p>
                )}
                
                {/* Password Requirements - Always Visible */}
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-medium text-gray-700">Password must contain:</p>
                  <ul className="space-y-1">
                    <li className={`text-sm flex items-center gap-2 ${passwordRequirements.length ? 'text-green-600' : 'text-gray-500'}`}>
                      <span className="text-xs">{passwordRequirements.length ? '✓' : '○'}</span>
                      At least 8 characters
                    </li>
                    <li className={`text-sm flex items-center gap-2 ${passwordRequirements.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                      <span className="text-xs">{passwordRequirements.uppercase ? '✓' : '○'}</span>
                      One uppercase letter
                    </li>
                    <li className={`text-sm flex items-center gap-2 ${passwordRequirements.special ? 'text-green-600' : 'text-gray-500'}`}>
                      <span className="text-xs">{passwordRequirements.special ? '✓' : '○'}</span>
                      One special character (!@#$%^&*)
                    </li>
                  </ul>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <Label htmlFor="confirm_password">Confirm New Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="confirm_password"
                    type={showPassword.confirm ? 'text' : 'password'}
                    value={formData.confirm_password}
                    onChange={(e) => setFormData({...formData, confirm_password: e.target.value})}
                    placeholder="Confirm your new password"
                    className={errors.confirm_password ? 'border-red-500' : ''}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirm_password && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirm_password}</p>
                )}
                {formData.confirm_password && formData.new_password && (
                  <p className={`text-sm mt-1 ${formData.new_password === formData.confirm_password ? 'text-green-600' : 'text-red-500'}`}>
                    {formData.new_password === formData.confirm_password ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading || !isPasswordValid}>
                  {loading ? 'Changing Password...' : 'Change Password'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFormData({
                      new_password: '',
                      confirm_password: ''
                    });
                    setErrors({});
                    setMessage({ type: '', text: '' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}