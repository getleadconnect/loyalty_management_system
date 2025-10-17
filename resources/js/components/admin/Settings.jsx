import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { adminAPI } from '../../services/api';
import axios from 'axios';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import {
  Users,
  Shield,
  MessageSquare,
  Mail,
  Phone,
  Plus,
  Edit,
  Trash2,
  Search,
  Key,
  Settings as SettingsIcon,
  ChevronRight,
  Save,
  X,
  Check,
  AlertCircle,
  User,
  Lock,
  MoreVertical,
  Share2,
  Globe,
  Eye,
  EyeOff
} from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('roles');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Configure toastr
  toastr.options = {
    closeButton: true,
    debug: false,
    newestOnTop: false,
    progressBar: true,
    positionClass: 'toast-top-right',
    preventDuplicates: false,
    onclick: null,
    showDuration: '300',
    hideDuration: '1000',
    timeOut: '5000',
    extendedTimeOut: '1000',
    showEasing: 'swing',
    hideEasing: 'linear',
    showMethod: 'fadeIn',
    hideMethod: 'fadeOut'
  };
  
  // Staff state
  const [staff, setStaff] = useState([]);
  const [staffStats, setStaffStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(10);
  
  // Roles state
  const [roles, setRoles] = useState([]);
  
  // Settings state
  const [smsSettings, setSmsSettings] = useState({});
  const [emailSettings, setEmailSettings] = useState({});
  const [whatsappSettings, setWhatsappSettings] = useState({});
  
  // SMS Settings CRUD state
  const [smsSettingsList, setSmsSettingsList] = useState([]);
  const [showSmsDialog, setShowSmsDialog] = useState(false);
  const [editingSmsSettings, setEditingSmsSettings] = useState(null);
  const [showSmsDeleteDialog, setShowSmsDeleteDialog] = useState(false);
  const [smsSettingsToDelete, setSmsSettingsToDelete] = useState(null);
  const [smsForm, setSmsForm] = useState({
    name: '',
    api_key: '',
    api_secret: '',
    sender_id: '',
    api_url: '',
    is_active: false,
    description: ''
  });
  
  // SMS Settings pagination state
  const [smsSearchQuery, setSmsSearchQuery] = useState('');
  const [smsCurrentPage, setSmsCurrentPage] = useState(1);
  const [smsTotalPages, setSmsTotalPages] = useState(1);
  const [smsPerPage, setSmsPerPage] = useState(10);
  const [smsTotal, setSmsTotal] = useState(0);
  const [smsFrom, setSmsFrom] = useState(0);
  const [smsTo, setSmsTo] = useState(0);
  
  // Email Settings CRUD state
  const [emailSettingsList, setEmailSettingsList] = useState([]);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [editingEmailSettings, setEditingEmailSettings] = useState(null);
  const [showEmailDeleteDialog, setShowEmailDeleteDialog] = useState(false);
  const [emailSettingsToDelete, setEmailSettingsToDelete] = useState(null);
  const [emailForm, setEmailForm] = useState({
    name: '',
    mail_driver: '',
    mail_host: '',
    mail_port: 587,
    mail_username: '',
    mail_password: '',
    mail_encryption: 'tls',
    mail_from_address: '',
    mail_from_name: '',
    is_active: false,
    description: ''
  });
  
  // Email Settings pagination state
  const [emailSearchQuery, setEmailSearchQuery] = useState('');
  const [emailCurrentPage, setEmailCurrentPage] = useState(1);
  const [emailTotalPages, setEmailTotalPages] = useState(1);
  const [emailPerPage, setEmailPerPage] = useState(10);
  const [emailTotal, setEmailTotal] = useState(0);
  const [emailFrom, setEmailFrom] = useState(0);
  const [emailTo, setEmailTo] = useState(0);
  
  // WhatsApp Settings CRUD state
  const [whatsappSettingsList, setWhatsappSettingsList] = useState([]);
  const [showWhatsappDialog, setShowWhatsappDialog] = useState(false);
  const [editingWhatsappSettings, setEditingWhatsappSettings] = useState(null);
  const [showWhatsappDeleteDialog, setShowWhatsappDeleteDialog] = useState(false);
  const [whatsappSettingsToDelete, setWhatsappSettingsToDelete] = useState(null);
  const [whatsappForm, setWhatsappForm] = useState({
    name: '',
    provider: '',
    api_key: '',
    api_secret: '',
    phone_number: '',
    business_id: '',
    api_url: '',
    is_active: false,
    description: ''
  });
  
  // WhatsApp Settings pagination state
  const [whatsappSearchQuery, setWhatsappSearchQuery] = useState('');
  const [whatsappCurrentPage, setWhatsappCurrentPage] = useState(1);
  const [whatsappTotalPages, setWhatsappTotalPages] = useState(1);
  const [whatsappPerPage, setWhatsappPerPage] = useState(10);
  const [whatsappTotal, setWhatsappTotal] = useState(0);
  const [whatsappFrom, setWhatsappFrom] = useState(0);
  const [whatsappTo, setWhatsappTo] = useState(0);
  
  // Social Media Links state
  const [socialLinks, setSocialLinks] = useState([]);
  const [showSocialDialog, setShowSocialDialog] = useState(false);
  const [editingSocialLink, setEditingSocialLink] = useState(null);
  const [showSocialDeleteDialog, setShowSocialDeleteDialog] = useState(false);
  const [socialLinkToDelete, setSocialLinkToDelete] = useState(null);
  const [socialForm, setSocialForm] = useState({
    platform: '',
    url: '',
    icon: '',
    order: 0,
    is_active: true
  });
  
  // Dialog states
  const [showStaffDialog, setShowStaffDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [staffToDelete, setStaffToDelete] = useState(null);
  
  // Form states
  const [staffForm, setStaffForm] = useState({
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
  const [imagePreview, setImagePreview] = useState(null);
  
  const [passwordForm, setPasswordForm] = useState({
    password: '',
    password_confirmation: '',
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'roles') {
      loadRoles();
    } else if (activeTab === 'sms') {
      loadSmsSettingsList();
    } else if (activeTab === 'email') {
      loadEmailSettingsList();
    } else if (activeTab === 'whatsapp') {
      loadWhatsappSettingsList();
    } else if (activeTab === 'social') {
      loadSocialLinks();
    }
  }, [activeTab, currentPage, searchQuery, perPage, smsCurrentPage, smsSearchQuery, smsPerPage, emailCurrentPage, emailSearchQuery, emailPerPage, whatsappCurrentPage, whatsappSearchQuery, whatsappPerPage]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      // Load only roles initially
      await loadRoles();
    } catch (err) {
      setError('Failed to load data');
      console.error('Load initial data error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const loadRoles = async () => {
    try {
      const response = await adminAPI.getUserRoles();
      if (response.data) {
        setRoles(response.data.data || response.data || []);
      }
    } catch (err) {
      console.error('Failed to load roles:', err);
      setError('Failed to load roles');
    }
  };

  const loadStaff = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getUsers({
        page: currentPage,
        per_page: perPage,
        search: searchQuery
      });
      
      // Handle pagination response structure
      if (response.data && response.data.data) {
        setStaff(response.data.data.data || []);
        setTotalPages(response.data.data.last_page || 1);
      }
    } catch (err) {
      setError('Failed to load users');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSmsSettings = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getSettingsByGroup('sms');
      setSmsSettings(response.data || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadEmailSettings = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getSettingsByGroup('email');
      setEmailSettings(response.data || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadWhatsappSettings = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getSettingsByGroup('whatsapp');
      setWhatsappSettings(response.data || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadSocialLinks = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getSocialMediaLinks();
      setSocialLinks(response.data.data || []);
    } catch (err) {
      console.error(err);
      setSocialLinks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSocialLink = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (editingSocialLink) {
        await adminAPI.updateSocialMediaLink(editingSocialLink.id, socialForm);
        toastr.success('Social media link updated successfully');
      } else {
        await adminAPI.createSocialMediaLink(socialForm);
        toastr.success('Social media link added successfully');
      }
      
      setShowSocialDialog(false);
      setEditingSocialLink(null);
      setSocialForm({
        platform: '',
        url: '',
        icon: '',
        order: 0,
        is_active: true
      });
      loadSocialLinks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save social media link');
      if (err.response?.data?.errors) {
        Object.keys(err.response.data.errors).forEach(key => {
          toastr.error(err.response.data.errors[key][0]);
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSocialLink = async () => {
    try {
      setLoading(true);
      await adminAPI.deleteSocialMediaLink(socialLinkToDelete.id);
      toastr.success('Social media link deleted successfully');
      setShowSocialDeleteDialog(false);
      setSocialLinkToDelete(null);
      loadSocialLinks();
    } catch (err) {
      toastr.error('Failed to delete social media link');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSocialStatus = async (link) => {
    try {
      await adminAPI.toggleSocialMediaLinkStatus(link.id);
      toastr.success('Status updated successfully');
      loadSocialLinks();
    } catch (err) {
      toastr.error('Failed to update status');
    }
  };

  const handleCreateStaff = async () => {
    setLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('name', staffForm.name);
      formData.append('email', staffForm.email);
      formData.append('country_code', staffForm.country_code);
      formData.append('mobile', staffForm.mobile || '');
      formData.append('aadhar_number', staffForm.aadhar_number || '');
      formData.append('role_id', staffForm.role_id);
      formData.append('status', staffForm.status);
      
      if (staffForm.image) {
        formData.append('image', staffForm.image);
      }
      
      if (!editingStaff) {
        formData.append('password', staffForm.password);
      }
      
      if (editingStaff) {
        // Use adminAPI for update
        await adminAPI.updateUser(editingStaff.id, formData);
        toastr.success('User updated successfully');
      } else {
        // Use adminAPI for create
        await adminAPI.createUser(formData);
        toastr.success('User created successfully');
      }
      
      setShowStaffDialog(false);
      setEditingStaff(null);
      setStaffForm({
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
      loadStaff();
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
    setError('');
    
    try {
      // Use users API endpoint for password change
      await axios.put(`/api/admin/users/${selectedStaffId}/change-password`, passwordForm, {
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
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStaff = async () => {
    if (!staffToDelete) return;
    
    setLoading(true);
    try {
      await adminAPI.deleteUser(staffToDelete.id);
      toastr.success('User deleted successfully');
      setShowDeleteDialog(false);
      setStaffToDelete(null);
      loadStaff();
    } catch (err) {
      toastr.error(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSmsSettings = async () => {
    setLoading(true);
    setError('');
    
    try {
      const formData = {};
      Object.keys(smsSettings).forEach(key => {
        formData[key] = smsSettings[key].value;
      });
      
      await adminAPI.updateSmsSettings(formData);
      toastr.success('SMS settings saved successfully');
    } catch (err) {
      setError('Failed to save SMS settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEmailSettings = async () => {
    setLoading(true);
    setError('');
    
    try {
      const formData = {};
      Object.keys(emailSettings).forEach(key => {
        formData[key] = emailSettings[key].value;
      });
      
      await adminAPI.updateEmailSettings(formData);
      toastr.success('Email settings saved successfully');
    } catch (err) {
      setError('Failed to save email settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWhatsappSettings = async () => {
    setLoading(true);
    setError('');
    
    try {
      const formData = {};
      Object.keys(whatsappSettings).forEach(key => {
        formData[key] = whatsappSettings[key].value;
      });
      
      await adminAPI.updateWhatsAppSettings(formData);
      toastr.success('WhatsApp settings saved successfully');
    } catch (err) {
      setError('Failed to save WhatsApp settings');
    } finally {
      setLoading(false);
    }
  };

  // SMS Settings CRUD Functions
  const loadSmsSettingsList = async () => {
    setLoading(true);
    try {
      const params = {
        page: smsCurrentPage,
        per_page: smsPerPage,
        search: smsSearchQuery
      };
      const response = await adminAPI.getSmsSettings(params);
      setSmsSettingsList(response.data.sms_settings);
      setSmsTotalPages(response.data.total_pages);
      setSmsTotal(response.data.total);
      setSmsFrom(response.data.from);
      setSmsTo(response.data.to);
    } catch (err) {
      setError('Failed to load SMS settings');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSmsSettings = async () => {
    if (!smsForm.name || !smsForm.api_key || !smsForm.api_secret) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Always set provider to twilio since we removed the dropdown
      const formData = { ...smsForm, provider: 'twilio' };
      
      if (editingSmsSettings) {
        await adminAPI.updateSmsSettingById(editingSmsSettings.id, formData);
        toastr.success('SMS settings updated successfully');
      } else {
        await adminAPI.createSmsSettings(formData);
        toastr.success('SMS settings created successfully');
      }
      
      setShowSmsDialog(false);
      setEditingSmsSettings(null);
      setSmsForm({
        name: '',
        api_key: '',
        api_secret: '',
        sender_id: '',
        api_url: '',
        is_active: false,
        description: ''
      });
      loadSmsSettingsList();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save SMS settings');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSmsSettings = async () => {
    if (!smsSettingsToDelete) return;
    
    setLoading(true);
    try {
      await adminAPI.deleteSmsSettings(smsSettingsToDelete.id);
      toastr.success('SMS settings deleted successfully');
      setShowSmsDeleteDialog(false);
      setSmsSettingsToDelete(null);
      loadSmsSettingsList();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete SMS settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActiveSms = async (smsSettings) => {
    try {
      await adminAPI.toggleActiveSmsSettings(smsSettings.id);
      if (!smsSettings.is_active) {
        toastr.success('SMS settings activated successfully. Other SMS settings have been deactivated.');
      } else {
        toastr.success('SMS settings deactivated successfully');
      }
      loadSmsSettingsList();
    } catch (err) {
      toastr.error('Failed to update SMS settings status');
    }
  };

  // Email Settings CRUD Functions
  const loadEmailSettingsList = async () => {
    setLoading(true);
    try {
      const params = {
        page: emailCurrentPage,
        per_page: emailPerPage,
        search: emailSearchQuery
      };
      const response = await adminAPI.getEmailSettings(params);
      setEmailSettingsList(response.data.email_settings);
      setEmailTotalPages(response.data.total_pages);
      setEmailTotal(response.data.total);
      setEmailFrom(response.data.from);
      setEmailTo(response.data.to);
    } catch (err) {
      setError('Failed to load email settings');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmailSettings = async () => {
    if (!emailForm.name || !emailForm.mail_host || !emailForm.mail_username || !emailForm.mail_from_address || !emailForm.mail_from_name) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');
    
    // Always set mail_driver to smtp since we removed the dropdown
    const formData = { ...emailForm, mail_driver: 'smtp' };
    
    try {
      if (editingEmailSettings) {
        await adminAPI.updateEmailSettingById(editingEmailSettings.id, formData);
        toastr.success('Email settings updated successfully');
      } else {
        await adminAPI.createEmailSettings(formData);
        toastr.success('Email settings created successfully');
      }
      
      setShowEmailDialog(false);
      setEditingEmailSettings(null);
      setEmailForm({
        name: '',
        mail_driver: '',
        mail_host: '',
        mail_port: 587,
        mail_username: '',
        mail_password: '',
        mail_encryption: 'tls',
        mail_from_address: '',
        mail_from_name: '',
        is_active: false,
        description: ''
      });
      loadEmailSettingsList();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save email settings');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmailSettings = async () => {
    if (!emailSettingsToDelete) return;
    
    setLoading(true);
    try {
      await adminAPI.deleteEmailSettings(emailSettingsToDelete.id);
      toastr.success('Email settings deleted successfully');
      setShowEmailDeleteDialog(false);
      setEmailSettingsToDelete(null);
      loadEmailSettingsList();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete email settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActiveEmail = async (emailSettings) => {
    try {
      await adminAPI.toggleActiveEmailSettings(emailSettings.id);
      if (!emailSettings.is_active) {
        toastr.success('Email settings activated successfully. Other email settings have been deactivated.');
      } else {
        toastr.success('Email settings deactivated successfully');
      }
      loadEmailSettingsList();
    } catch (err) {
      toastr.error('Failed to update email settings status');
    }
  };

  // WhatsApp Settings CRUD Functions
  const loadWhatsappSettingsList = async () => {
    setLoading(true);
    try {
      const params = {
        page: whatsappCurrentPage,
        per_page: whatsappPerPage,
        search: whatsappSearchQuery
      };
      const response = await adminAPI.getWhatsappSettings(params);
      setWhatsappSettingsList(response.data.whatsapp_settings);
      setWhatsappTotal(response.data.total);
      setWhatsappTotalPages(response.data.total_pages);
      setWhatsappFrom(response.data.from);
      setWhatsappTo(response.data.to);
    } catch (err) {
      toastr.error('Failed to load WhatsApp settings');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWhatsappSettings = async () => {
    if (!whatsappForm.name || !whatsappForm.api_key) {
      toastr.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    // Always set provider to whatsapp_business since we removed the dropdown
    const formData = { ...whatsappForm, provider: 'whatsapp_business' };
    
    try {
      if (editingWhatsappSettings) {
        await adminAPI.updateWhatsappSettingById(editingWhatsappSettings.id, formData);
        toastr.success('WhatsApp settings updated successfully');
      } else {
        await adminAPI.createWhatsappSettings(formData);
        toastr.success('WhatsApp settings created successfully');
      }
      setShowWhatsappDialog(false);
      setEditingWhatsappSettings(null);
      setWhatsappForm({
        name: '',
        provider: '',
        api_key: '',
        api_secret: '',
        phone_number: '',
        business_id: '',
        api_url: '',
        is_active: false,
        description: ''
      });
      loadWhatsappSettingsList();
    } catch (err) {
      toastr.error(err.response?.data?.message || 'Failed to save WhatsApp settings');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWhatsappSettings = async () => {
    if (!whatsappSettingsToDelete) return;
    
    setLoading(true);
    try {
      await adminAPI.deleteWhatsappSettings(whatsappSettingsToDelete.id);
      toastr.success('WhatsApp settings deleted successfully');
      setShowWhatsappDeleteDialog(false);
      setWhatsappSettingsToDelete(null);
      loadWhatsappSettingsList();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete WhatsApp settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActiveWhatsapp = async (whatsappSettings) => {
    try {
      await adminAPI.toggleActiveWhatsappSettings(whatsappSettings.id);
      if (!whatsappSettings.is_active) {
        toastr.success('WhatsApp settings activated successfully. Other WhatsApp settings have been deactivated.');
      } else {
        toastr.success('WhatsApp settings deactivated successfully');
      }
      loadWhatsappSettingsList();
    } catch (err) {
      toastr.error('Failed to update WhatsApp settings status');
    }
  };


  const updateSetting = (group, key, value) => {
    if (group === 'sms') {
      setSmsSettings(prev => ({
        ...prev,
        [key]: { ...prev[key], value }
      }));
    } else if (group === 'email') {
      setEmailSettings(prev => ({
        ...prev,
        [key]: { ...prev[key], value }
      }));
    } else if (group === 'whatsapp') {
      setWhatsappSettings(prev => ({
        ...prev,
        [key]: { ...prev[key], value }
      }));
    }
  };

  const tabs = [
    { id: 'roles', label: 'Roles', icon: Shield },
    { id: 'sms', label: 'SMS Settings', icon: Phone },
    { id: 'email', label: 'Email Settings', icon: Mail },
    { id: 'whatsapp', label: 'WhatsApp Settings', icon: MessageSquare },
    { id: 'social', label: 'Social Media', icon: Share2 },
  ];

  return (
    <div className="flex h-full">
      {/* Vertical Tabs Sidebar */}
      <div className="w-64 bg-white border-r">
        <div className="p-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Settings
          </h2>
        </div>
        <nav className="space-y-1 p-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-sky-50 text-[#0284c7] border-l-4 border-[#0284c7]'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{tab.label}</span>
                {activeTab === tab.id && (
                  <ChevronRight className="h-4 w-4 ml-auto" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 bg-gray-50">
        {/* Alerts */}
        {error && (
          <Alert className="mb-4 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <Check className="h-4 w-4" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Roles Tab */}
        {activeTab === 'roles' && (
          <div>
            <div className="mb-6">
              <h3 className="text-2xl font-bold">Roles & Permissions</h3>
              <p className="text-gray-600 mt-1">Manage user roles and their permissions</p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-4">
                  {roles.map((role) => (
                    <div key={role.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-lg font-semibold">{role.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {role.id === 1 && 'Full system access with all permissions'}
                            {role.id === 2 && 'Customer account with basic access'}
                            {role.id === 3 && 'Staff member with limited administrative access'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className={`h-5 w-5 ${
                            role.id === 1 ? 'text-red-500' :
                            role.id === 2 ? 'text-green-500' :
                            'text-blue-500'
                          }`} />
                          <span className={`px-3 py-1 text-sm rounded-full ${
                            role.id === 1 ? 'bg-red-100 text-red-800' :
                            role.id === 2 ? 'bg-green-100 text-green-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {role.id === 1 ? 'Admin' :
                             role.id === 2 ? 'Customer' :
                             'Staff'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* SMS Settings Tab */}
        {activeTab === 'sms' && (
          <div>
            <div className="mb-6 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold">SMS Settings</h3>
                <p className="text-gray-600 mt-1">Manage SMS provider configurations</p>
              </div>
              <Button
                onClick={() => {
                  setEditingSmsSettings(null);
                  setSmsForm({
                    name: '',
                    api_key: '',
                    api_secret: '',
                    sender_id: '',
                    api_url: '',
                    is_active: false,
                    description: ''
                  });
                  setShowSmsDialog(true);
                }}
                className="bg-[#0284c7] hover:bg-[#0369a1]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add SMS Settings
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Search and Controls */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Show</span>
                      <select
                        className="border rounded-md px-3 py-2"
                        value={smsPerPage}
                        onChange={(e) => {
                          setSmsPerPage(parseInt(e.target.value));
                          setSmsCurrentPage(1);
                        }}
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search SMS settings..."
                        value={smsSearchQuery}
                        onChange={(e) => {
                          setSmsSearchQuery(e.target.value);
                          setSmsCurrentPage(1);
                        }}
                        className="w-64"
                      />
                    </div>
                  </div>

                  {smsTotal > 0 ? (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-3">Sl.No</th>
                              <th className="text-left p-3">Name</th>
                              <th className="text-left p-3">Sender ID</th>
                              <th className="text-left p-3">API URL</th>
                              <th className="text-left p-3">Status</th>
                              <th className="text-left p-3">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {smsSettingsList.map((setting, index) => (
                              <tr key={setting.id} className="border-b hover:bg-gray-50">
                                <td className="p-3 text-gray-600">
                                  {(smsCurrentPage - 1) * smsPerPage + index + 1}
                                </td>
                                <td className="p-3 font-medium">{setting.name}</td>
                                <td className="p-3">{setting.sender_id || '-'}</td>
                                <td className="p-3">
                                  {setting.api_url ? (
                                    <span className="text-sm text-gray-600 truncate max-w-xs inline-block" title={setting.api_url}>
                                      {setting.api_url.length > 30 ? setting.api_url.substring(0, 30) + '...' : setting.api_url}
                                    </span>
                                  ) : (
                                    '-'
                                  )}
                                </td>
                                <td className="p-3">
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    setting.is_active 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {setting.is_active ? 'Active' : 'Inactive'}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                      >
                                        <span className="sr-only">Open menu</span>
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setEditingSmsSettings(setting);
                                          setSmsForm({
                                            name: setting.name,
                                            api_key: setting.api_key,
                                            api_secret: setting.api_secret,
                                            sender_id: setting.sender_id || '',
                                            api_url: setting.api_url || '',
                                            is_active: setting.is_active,
                                            description: setting.description || ''
                                          });
                                          setShowSmsDialog(true);
                                        }}
                                      >
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleToggleActiveSms(setting)}
                                        className={setting.is_active ? 'text-red-600' : 'text-green-600'}
                                      >
                                        {setting.is_active ? (
                                          <>
                                            <X className="mr-2 h-4 w-4" />
                                            Deactivate
                                          </>
                                        ) : (
                                          <>
                                            <Check className="mr-2 h-4 w-4" />
                                            Activate
                                          </>
                                        )}
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => {
                                          if (setting.is_active) {
                                            toastr.error('Cannot delete active SMS settings. Please deactivate this setting first.');
                                            return;
                                          }
                                          setSmsSettingsToDelete(setting);
                                          setShowSmsDeleteDialog(true);
                                        }}
                                        className="text-red-600"
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      <div className="flex justify-between items-center mt-4">
                        {smsTotal > 0 && (
                          <div className="text-sm text-gray-600">
                            Showing {smsFrom} to {smsTo} of {smsTotal} entries
                          </div>
                        )}
                        
                        {smsTotal > 0 && (
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSmsCurrentPage(prev => Math.max(prev - 1, 1))}
                              disabled={smsCurrentPage === 1}
                            >
                              Previous
                            </Button>
                            
                            {smsTotalPages > 1 && (
                              <div className="flex space-x-1">
                                {Array.from({ length: smsTotalPages }, (_, i) => i + 1).map(page => (
                                  <Button
                                    key={page}
                                    variant={page === smsCurrentPage ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSmsCurrentPage(page)}
                                    className={page === smsCurrentPage ? "bg-[#0284c7] hover:bg-[#0369a1]" : ""}
                                  >
                                    {page}
                                  </Button>
                                ))}
                              </div>
                            )}
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSmsCurrentPage(prev => Math.min(prev + 1, smsTotalPages))}
                              disabled={smsCurrentPage === smsTotalPages}
                            >
                              Next
                            </Button>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">
                        {smsSearchQuery ? 'No SMS settings found matching your search.' : 'No SMS settings configured'}
                      </p>
                      {!smsSearchQuery && (
                        <Button
                          onClick={() => {
                            setEditingSmsSettings(null);
                            setSmsForm({
                              name: '',
                              api_key: '',
                              api_secret: '',
                              sender_id: '',
                              api_url: '',
                              is_active: false,
                              description: ''
                            });
                            setShowSmsDialog(true);
                          }}
                          className="bg-[#0284c7] hover:bg-[#0369a1]"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Your First SMS Settings
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Email Settings Tab */}
        {activeTab === 'email' && (
          <div>
            <div className="mb-6 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold">Email Settings</h3>
                <p className="text-gray-600 mt-1">Manage email server configurations</p>
              </div>
              <Button
                onClick={() => {
                  setEditingEmailSettings(null);
                  setEmailForm({
                    name: '',
                    mail_driver: '',
                    mail_host: '',
                    mail_port: 587,
                    mail_username: '',
                    mail_password: '',
                    mail_encryption: 'tls',
                    mail_from_address: '',
                    mail_from_name: '',
                    is_active: false,
                    description: ''
                  });
                  setShowEmailDialog(true);
                }}
                className="bg-[#0284c7] hover:bg-[#0369a1]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Email Settings
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Search and Controls */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Show</span>
                      <select
                        className="border rounded-md px-3 py-2"
                        value={emailPerPage}
                        onChange={(e) => {
                          setEmailPerPage(parseInt(e.target.value));
                          setEmailCurrentPage(1);
                        }}
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search email settings..."
                        value={emailSearchQuery}
                        onChange={(e) => {
                          setEmailSearchQuery(e.target.value);
                          setEmailCurrentPage(1);
                        }}
                        className="w-64"
                      />
                    </div>
                  </div>

                  {emailTotal > 0 ? (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-3">Sl.No</th>
                              <th className="text-left p-3">Name</th>
                              <th className="text-left p-3">Host</th>
                              <th className="text-left p-3">Port</th>
                              <th className="text-left p-3">From Address</th>
                              <th className="text-left p-3">Status</th>
                              <th className="text-left p-3">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {emailSettingsList.map((setting, index) => (
                              <tr key={setting.id} className="border-b hover:bg-gray-50">
                                <td className="p-3 text-gray-600">
                                  {(emailCurrentPage - 1) * emailPerPage + index + 1}
                                </td>
                                <td className="p-3 font-medium">{setting.name}</td>
                                <td className="p-3">
                                  <span className="text-sm text-gray-600" title={setting.mail_host}>
                                    {setting.mail_host.length > 20 ? setting.mail_host.substring(0, 20) + '...' : setting.mail_host}
                                  </span>
                                </td>
                                <td className="p-3">{setting.mail_port}</td>
                                <td className="p-3">
                                  <span className="text-sm text-gray-600" title={setting.mail_from_address}>
                                    {setting.mail_from_address.length > 25 ? setting.mail_from_address.substring(0, 25) + '...' : setting.mail_from_address}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    setting.is_active 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {setting.is_active ? 'Active' : 'Inactive'}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                      >
                                        <span className="sr-only">Open menu</span>
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setEditingEmailSettings(setting);
                                          setEmailForm({
                                            name: setting.name,
                                            mail_driver: setting.mail_driver,
                                            mail_host: setting.mail_host,
                                            mail_port: setting.mail_port,
                                            mail_username: setting.mail_username,
                                            mail_password: setting.mail_password,
                                            mail_encryption: setting.mail_encryption || 'tls',
                                            mail_from_address: setting.mail_from_address,
                                            mail_from_name: setting.mail_from_name,
                                            is_active: setting.is_active,
                                            description: setting.description || ''
                                          });
                                          setShowEmailDialog(true);
                                        }}
                                      >
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleToggleActiveEmail(setting)}
                                        className={setting.is_active ? 'text-red-600' : 'text-green-600'}
                                      >
                                        {setting.is_active ? (
                                          <>
                                            <X className="mr-2 h-4 w-4" />
                                            Deactivate
                                          </>
                                        ) : (
                                          <>
                                            <Check className="mr-2 h-4 w-4" />
                                            Activate
                                          </>
                                        )}
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => {
                                          if (setting.is_active) {
                                            toastr.error('Cannot delete active email settings. Please deactivate this setting first.');
                                            return;
                                          }
                                          setEmailSettingsToDelete(setting);
                                          setShowEmailDeleteDialog(true);
                                        }}
                                        className="text-red-600"
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      <div className="flex justify-between items-center mt-4">
                        {emailTotal > 0 && (
                          <div className="text-sm text-gray-600">
                            Showing {emailFrom} to {emailTo} of {emailTotal} entries
                          </div>
                        )}
                        
                        {emailTotal > 0 && (
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEmailCurrentPage(prev => Math.max(prev - 1, 1))}
                              disabled={emailCurrentPage === 1}
                            >
                              Previous
                            </Button>
                            
                            {emailTotalPages > 1 && (
                              <div className="flex space-x-1">
                                {Array.from({ length: emailTotalPages }, (_, i) => i + 1).map(page => (
                                  <Button
                                    key={page}
                                    variant={page === emailCurrentPage ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setEmailCurrentPage(page)}
                                    className={page === emailCurrentPage ? "bg-[#0284c7] hover:bg-[#0369a1]" : ""}
                                  >
                                    {page}
                                  </Button>
                                ))}
                              </div>
                            )}
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEmailCurrentPage(prev => Math.min(prev + 1, emailTotalPages))}
                              disabled={emailCurrentPage === emailTotalPages}
                            >
                              Next
                            </Button>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">
                        {emailSearchQuery ? 'No email settings found matching your search.' : 'No email settings configured'}
                      </p>
                      {!emailSearchQuery && (
                        <Button
                          onClick={() => {
                            setEditingEmailSettings(null);
                            setEmailForm({
                              name: '',
                              mail_driver: '',
                              mail_host: '',
                              mail_port: 587,
                              mail_username: '',
                              mail_password: '',
                              mail_encryption: 'tls',
                              mail_from_address: '',
                              mail_from_name: '',
                              is_active: false,
                              description: ''
                            });
                            setShowEmailDialog(true);
                          }}
                          className="bg-[#0284c7] hover:bg-[#0369a1]"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Your First Email Settings
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* WhatsApp Settings Tab */}
        {activeTab === 'whatsapp' && (
          <div>
            <div className="mb-6 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold">WhatsApp Settings</h3>
                <p className="text-gray-600 mt-1">Manage WhatsApp Business API configurations</p>
              </div>
              <Button
                onClick={() => {
                  setEditingWhatsappSettings(null);
                  setWhatsappForm({
                    name: '',
                    provider: '',
                    api_key: '',
                    api_secret: '',
                    phone_number: '',
                    business_id: '',
                    api_url: '',
                    is_active: false,
                    description: ''
                  });
                  setShowWhatsappDialog(true);
                }}
                className="bg-[#0284c7] hover:bg-[#0369a1]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add WhatsApp Settings
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Search and Controls */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Show</span>
                      <select
                        className="border rounded-md px-3 py-2"
                        value={whatsappPerPage}
                        onChange={(e) => {
                          setWhatsappPerPage(parseInt(e.target.value));
                          setWhatsappCurrentPage(1);
                        }}
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search WhatsApp settings..."
                        value={whatsappSearchQuery}
                        onChange={(e) => {
                          setWhatsappSearchQuery(e.target.value);
                          setWhatsappCurrentPage(1);
                        }}
                        className="w-64"
                      />
                    </div>
                  </div>

                  {whatsappTotal > 0 ? (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-3">Sl.No</th>
                              <th className="text-left p-3">Name</th>
                              <th className="text-left p-3">Phone Number ID</th>
                              <th className="text-left p-3">Business ID</th>
                              <th className="text-left p-3">API URL</th>
                              <th className="text-left p-3">Status</th>
                              <th className="text-left p-3">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {whatsappSettingsList.map((setting, index) => (
                              <tr key={setting.id} className="border-b hover:bg-gray-50">
                                <td className="p-3 text-gray-600">
                                  {(whatsappCurrentPage - 1) * whatsappPerPage + index + 1}
                                </td>
                                <td className="p-3 font-medium">{setting.name}</td>
                                <td className="p-3">
                                  <span className="text-sm text-gray-600">
                                    {setting.phone_number || '-'}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span className="text-sm text-gray-600" title={setting.business_id}>
                                    {setting.business_id ? (setting.business_id.length > 15 ? setting.business_id.substring(0, 15) + '...' : setting.business_id) : '-'}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span className="text-sm text-gray-600" title={setting.api_url}>
                                    {setting.api_url ? (setting.api_url.length > 25 ? setting.api_url.substring(0, 25) + '...' : setting.api_url) : '-'}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    setting.is_active 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {setting.is_active ? 'Active' : 'Inactive'}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                      >
                                        <span className="sr-only">Open menu</span>
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setEditingWhatsappSettings(setting);
                                          setWhatsappForm({
                                            name: setting.name,
                                            provider: setting.provider,
                                            api_key: setting.api_key,
                                            api_secret: setting.api_secret || '',
                                            phone_number: setting.phone_number || '',
                                            business_id: setting.business_id || '',
                                            api_url: setting.api_url || '',
                                            is_active: setting.is_active,
                                            description: setting.description || ''
                                          });
                                          setShowWhatsappDialog(true);
                                        }}
                                      >
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleToggleActiveWhatsapp(setting)}
                                        className={setting.is_active ? 'text-red-600' : 'text-green-600'}
                                      >
                                        {setting.is_active ? (
                                          <>
                                            <X className="mr-2 h-4 w-4" />
                                            Deactivate
                                          </>
                                        ) : (
                                          <>
                                            <Check className="mr-2 h-4 w-4" />
                                            Activate
                                          </>
                                        )}
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => {
                                          if (setting.is_active) {
                                            toastr.error('Cannot delete active WhatsApp settings. Please deactivate this setting first.');
                                            return;
                                          }
                                          setWhatsappSettingsToDelete(setting);
                                          setShowWhatsappDeleteDialog(true);
                                        }}
                                        className="text-red-600"
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      <div className="flex justify-between items-center mt-4">
                        {whatsappTotal > 0 && (
                          <div className="text-sm text-gray-600">
                            Showing {whatsappFrom} to {whatsappTo} of {whatsappTotal} entries
                          </div>
                        )}
                        
                        {whatsappTotal > 0 && (
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setWhatsappCurrentPage(prev => Math.max(prev - 1, 1))}
                              disabled={whatsappCurrentPage === 1}
                            >
                              Previous
                            </Button>
                            
                            {whatsappTotalPages > 1 && (
                              <div className="flex space-x-1">
                                {Array.from({ length: whatsappTotalPages }, (_, i) => i + 1).map(page => (
                                  <Button
                                    key={page}
                                    variant={page === whatsappCurrentPage ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setWhatsappCurrentPage(page)}
                                    className={page === whatsappCurrentPage ? "bg-[#0284c7] hover:bg-[#0369a1]" : ""}
                                  >
                                    {page}
                                  </Button>
                                ))}
                              </div>
                            )}
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setWhatsappCurrentPage(prev => Math.min(prev + 1, whatsappTotalPages))}
                              disabled={whatsappCurrentPage === whatsappTotalPages}
                            >
                              Next
                            </Button>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">
                        {whatsappSearchQuery ? 'No WhatsApp settings found matching your search.' : 'No WhatsApp settings configured'}
                      </p>
                      {!whatsappSearchQuery && (
                        <Button
                          onClick={() => {
                            setEditingWhatsappSettings(null);
                            setWhatsappForm({
                              name: '',
                              provider: '',
                              api_key: '',
                              api_secret: '',
                              phone_number: '',
                              business_id: '',
                              api_url: '',
                              is_active: false,
                              description: ''
                            });
                            setShowWhatsappDialog(true);
                          }}
                          className="bg-[#0284c7] hover:bg-[#0369a1]"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Your First WhatsApp Settings
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Social Media Links Tab */}
        {activeTab === 'social' && (
          <div>
            <div className="mb-6 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold">Social Media Links</h3>
                <p className="text-gray-600 mt-1">Manage your social media presence</p>
              </div>
              <Button
                onClick={() => {
                  setEditingSocialLink(null);
                  setSocialForm({
                    platform: '',
                    url: '',
                    icon: '',
                    order: 0,
                    is_active: true
                  });
                  setShowSocialDialog(true);
                }}
                className="bg-[#0284c7] hover:bg-[#0369a1]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Social Media Link
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {socialLinks.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Share2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No social media links configured</p>
                      <p className="text-sm mt-2">Add your first social media link to get started</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {socialLinks.map((link) => (
                        <div key={link.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-[#0284c7]/10 rounded-lg flex items-center justify-center">
                              <Globe className="h-5 w-5 text-[#0284c7]" />
                            </div>
                            <div>
                              <div className="font-medium">{link.platform}</div>
                              <div className="text-sm text-gray-500">{link.url}</div>
                              <div className="text-xs text-gray-400 mt-1">Order: {link.order}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleSocialStatus(link)}
                              className="h-8 w-8"
                            >
                              {link.is_active ? (
                                <Eye className="h-4 w-4 text-green-600" />
                              ) : (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingSocialLink(link);
                                setSocialForm({
                                  platform: link.platform,
                                  url: link.url,
                                  icon: link.icon || '',
                                  order: link.order,
                                  is_active: link.is_active
                                });
                                setShowSocialDialog(true);
                              }}
                              className="h-8 w-8"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSocialLinkToDelete(link);
                                setShowSocialDeleteDialog(true);
                              }}
                              className="h-8 w-8 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Staff Dialog */}
      <Dialog open={showStaffDialog} onOpenChange={setShowStaffDialog}>
        <DialogContent style={{ '--dialog-backdrop': '#b3b3b37d' }}>
          <DialogHeader>
            <DialogTitle>
              {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={staffForm.name}
                onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={staffForm.email}
                onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
            
            <div>
              <Label>Mobile</Label>
              <div className="flex gap-2">
                <select
                  className="w-24 p-2 border rounded-md"
                  value={staffForm.country_code}
                  onChange={(e) => setStaffForm({ ...staffForm, country_code: e.target.value })}
                >
                  <option value="+1">+1</option>
                  <option value="+44">+44</option>
                  <option value="+91">+91</option>
                  <option value="+86">+86</option>
                </select>
                <Input
                  value={staffForm.mobile}
                  onChange={(e) => setStaffForm({ ...staffForm, mobile: e.target.value })}
                  placeholder="1234567890"
                  className="flex-1"
                />
              </div>
            </div>
            
            <div>
              <Label>Aadhar Number</Label>
              <Input
                value={staffForm.aadhar_number}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                  setStaffForm({ ...staffForm, aadhar_number: value });
                }}
                placeholder="Enter 12-digit Aadhar number"
                maxLength="12"
              />
              <p className="text-xs text-gray-500 mt-1">Must be exactly 12 digits</p>
            </div>
            
            <div>
              <Label>User Image</Label>
              <div className="space-y-2">
                {imagePreview && (
                  <div className="relative w-24 h-24">
                    <img
                      src={imagePreview}
                      alt="User preview"
                      className="w-full h-full object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-red-500 hover:bg-red-600 text-white"
                      onClick={() => {
                        setStaffForm({ ...staffForm, image: null });
                        setImagePreview(null);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      if (file.size > 2 * 1024 * 1024) {
                        toastr.error('Image size must be less than 2MB');
                        return;
                      }
                      setStaffForm({ ...staffForm, image: file });
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setImagePreview(reader.result);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <p className="text-xs text-gray-500">Max file size: 2MB. Supported formats: JPEG, PNG, JPG, GIF</p>
              </div>
            </div>
            
            <div>
              <Label>Role</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={staffForm.role_id}
                onChange={(e) => setStaffForm({ ...staffForm, role_id: parseInt(e.target.value) })}
              >
                <option value="1">Admin</option>
                <option value="2">Customer</option>
                <option value="3">Staff</option>
              </select>
            </div>
            
            <div>
              <Label>Status</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={staffForm.status}
                onChange={(e) => setStaffForm({ ...staffForm, status: parseInt(e.target.value) })}
              >
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </div>
            
            {!editingStaff && (
              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  value={staffForm.password}
                  onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                  placeholder="Minimum 8 characters"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStaffDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateStaff} className="bg-[#0284c7] hover:bg-[#0369a1]">
              {editingStaff ? 'Update' : 'Create'} Staff
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>New Password</Label>
              <Input
                type="password"
                value={passwordForm.password}
                onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                placeholder="Minimum 8 characters"
              />
            </div>
            
            <div>
              <Label>Confirm Password</Label>
              <Input
                type="password"
                value={passwordForm.password_confirmation}
                onChange={(e) => setPasswordForm({ ...passwordForm, password_confirmation: e.target.value })}
                placeholder="Re-enter password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword} className="bg-[#0284c7] hover:bg-[#0369a1]">
              <Lock className="h-4 w-4 mr-2" />
              Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the staff member
              {staffToDelete && (
                <span className="font-semibold"> "{staffToDelete.name}"</span>
              )}
              {' '}from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowDeleteDialog(false);
              setStaffToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteStaff}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* SMS Settings Dialog */}
      <Dialog open={showSmsDialog} onOpenChange={setShowSmsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingSmsSettings ? 'Edit SMS Settings' : 'Add SMS Settings'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={smsForm.name}
                onChange={(e) => setSmsForm({ ...smsForm, name: e.target.value })}
                placeholder="e.g., Primary Twilio"
                className="mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="api_key">API Key *</Label>
              <Input
                id="api_key"
                type="password"
                value={smsForm.api_key}
                onChange={(e) => setSmsForm({ ...smsForm, api_key: e.target.value })}
                placeholder="Enter API key"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="api_secret">API Secret *</Label>
              <Input
                id="api_secret"
                type="password"
                value={smsForm.api_secret}
                onChange={(e) => setSmsForm({ ...smsForm, api_secret: e.target.value })}
                placeholder="Enter API secret"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="sender_id">Sender ID</Label>
              <Input
                id="sender_id"
                value={smsForm.sender_id}
                onChange={(e) => setSmsForm({ ...smsForm, sender_id: e.target.value })}
                placeholder="e.g., LOYALTY"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="api_url">API URL</Label>
              <Input
                id="api_url"
                value={smsForm.api_url}
                onChange={(e) => setSmsForm({ ...smsForm, api_url: e.target.value })}
                placeholder="https://api.provider.com/sms"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={smsForm.description}
                onChange={(e) => setSmsForm({ ...smsForm, description: e.target.value })}
                placeholder="Optional description"
                className="mt-2"
              />
            </div>

            <div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={smsForm.is_active}
                  onChange={(e) => setSmsForm({ ...smsForm, is_active: e.target.checked })}
                  className="mr-2"
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              {smsForm.is_active && (
                <p className="text-sm text-amber-600 mt-1">
                  Note: Only one SMS setting can be active at a time. Activating this will deactivate others.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSmsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSmsSettings} className="bg-[#0284c7] hover:bg-[#0369a1]">
              {editingSmsSettings ? 'Update' : 'Create'} Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SMS Settings Delete Confirmation Dialog */}
      <AlertDialog open={showSmsDeleteDialog} onOpenChange={setShowSmsDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete SMS Settings</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete the SMS settings
              {smsSettingsToDelete && (
                <span className="font-semibold"> "{smsSettingsToDelete.name}"</span>
              )}
              ?
              <br />
              <br />
              <span className="text-red-600 font-medium">
                ⚠️ This action cannot be undone and will remove all configuration data for this SMS provider.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowSmsDeleteDialog(false);
              setSmsSettingsToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSmsSettings}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, Delete SMS Settings
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Email Settings Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingEmailSettings ? 'Edit Email Settings' : 'Add Email Settings'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email-name">Name *</Label>
              <Input
                id="email-name"
                value={emailForm.name}
                onChange={(e) => setEmailForm({ ...emailForm, name: e.target.value })}
                placeholder="e.g., Primary SMTP"
                className="mt-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mail_host">Mail Host *</Label>
                <Input
                  id="mail_host"
                  value={emailForm.mail_host}
                  onChange={(e) => setEmailForm({ ...emailForm, mail_host: e.target.value })}
                  placeholder="smtp.gmail.com"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="mail_port">Mail Port *</Label>
                <Input
                  id="mail_port"
                  type="number"
                  value={emailForm.mail_port}
                  onChange={(e) => setEmailForm({ ...emailForm, mail_port: parseInt(e.target.value) || 587 })}
                  placeholder="587"
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="mail_username">Mail Username *</Label>
              <Input
                id="mail_username"
                value={emailForm.mail_username}
                onChange={(e) => setEmailForm({ ...emailForm, mail_username: e.target.value })}
                placeholder="your-email@gmail.com"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="mail_password">Mail Password *</Label>
              <Input
                id="mail_password"
                type="password"
                value={emailForm.mail_password}
                onChange={(e) => setEmailForm({ ...emailForm, mail_password: e.target.value })}
                placeholder="Enter password"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="mail_encryption">Encryption</Label>
              <select
                id="mail_encryption"
                className="w-full mt-2 p-2 border rounded-md"
                value={emailForm.mail_encryption}
                onChange={(e) => setEmailForm({ ...emailForm, mail_encryption: e.target.value })}
              >
                <option value="">None</option>
                <option value="tls">TLS</option>
                <option value="ssl">SSL</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mail_from_address">From Email *</Label>
                <Input
                  id="mail_from_address"
                  type="email"
                  value={emailForm.mail_from_address}
                  onChange={(e) => setEmailForm({ ...emailForm, mail_from_address: e.target.value })}
                  placeholder="noreply@loyalty.com"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="mail_from_name">From Name *</Label>
                <Input
                  id="mail_from_name"
                  value={emailForm.mail_from_name}
                  onChange={(e) => setEmailForm({ ...emailForm, mail_from_name: e.target.value })}
                  placeholder="Loyalty Program"
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email-description">Description</Label>
              <Input
                id="email-description"
                value={emailForm.description}
                onChange={(e) => setEmailForm({ ...emailForm, description: e.target.value })}
                placeholder="Optional description"
                className="mt-2"
              />
            </div>

            <div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="email_is_active"
                  checked={emailForm.is_active}
                  onChange={(e) => setEmailForm({ ...emailForm, is_active: e.target.checked })}
                  className="mr-2"
                />
                <Label htmlFor="email_is_active">Active</Label>
              </div>
              {emailForm.is_active && (
                <p className="text-sm text-amber-600 mt-1">
                  Note: Only one email setting can be active at a time. Activating this will deactivate others.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateEmailSettings} className="bg-[#0284c7] hover:bg-[#0369a1]">
              {editingEmailSettings ? 'Update' : 'Create'} Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Settings Delete Confirmation Dialog */}
      <AlertDialog open={showEmailDeleteDialog} onOpenChange={setShowEmailDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete Email Settings</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete the email settings
              {emailSettingsToDelete && (
                <span className="font-semibold"> "{emailSettingsToDelete.name}"</span>
              )}
              ?
              <br />
              <br />
              <span className="text-red-600 font-medium">
                ⚠️ This action cannot be undone and will remove all configuration data for this email provider.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowEmailDeleteDialog(false);
              setEmailSettingsToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEmailSettings}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, Delete Email Settings
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* WhatsApp Settings Dialog */}
      <Dialog open={showWhatsappDialog} onOpenChange={setShowWhatsappDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingWhatsappSettings ? 'Edit WhatsApp Settings' : 'Add WhatsApp Settings'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="whatsapp-name">Name *</Label>
              <Input
                id="whatsapp-name"
                value={whatsappForm.name}
                onChange={(e) => setWhatsappForm({ ...whatsappForm, name: e.target.value })}
                placeholder="e.g., Primary WhatsApp"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="whatsapp_api_key">API Key *</Label>
              <Input
                id="whatsapp_api_key"
                type="password"
                value={whatsappForm.api_key}
                onChange={(e) => setWhatsappForm({ ...whatsappForm, api_key: e.target.value })}
                placeholder="Enter API key"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="whatsapp_api_secret">API Secret</Label>
              <Input
                id="whatsapp_api_secret"
                type="password"
                value={whatsappForm.api_secret}
                onChange={(e) => setWhatsappForm({ ...whatsappForm, api_secret: e.target.value })}
                placeholder="Enter API secret (optional)"
                className="mt-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="whatsapp_phone">Phone Number ID</Label>
                <Input
                  id="whatsapp_phone"
                  value={whatsappForm.phone_number}
                  onChange={(e) => setWhatsappForm({ ...whatsappForm, phone_number: e.target.value })}
                  placeholder="Phone number id"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="whatsapp_business_id">Business ID</Label>
                <Input
                  id="whatsapp_business_id"
                  value={whatsappForm.business_id}
                  onChange={(e) => setWhatsappForm({ ...whatsappForm, business_id: e.target.value })}
                  placeholder="Business ID"
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="whatsapp_api_url">API URL</Label>
              <Input
                id="whatsapp_api_url"
                value={whatsappForm.api_url}
                onChange={(e) => setWhatsappForm({ ...whatsappForm, api_url: e.target.value })}
                placeholder="https://api.whatsapp.com/v1"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="whatsapp-description">Description</Label>
              <Input
                id="whatsapp-description"
                value={whatsappForm.description}
                onChange={(e) => setWhatsappForm({ ...whatsappForm, description: e.target.value })}
                placeholder="Optional description"
                className="mt-2"
              />
            </div>

            <div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="whatsapp_is_active"
                  checked={whatsappForm.is_active}
                  onChange={(e) => setWhatsappForm({ ...whatsappForm, is_active: e.target.checked })}
                  className="mr-2"
                />
                <Label htmlFor="whatsapp_is_active">Active</Label>
              </div>
              {whatsappForm.is_active && (
                <p className="text-sm text-amber-600 mt-1">
                  Note: Only one WhatsApp setting can be active at a time. Activating this will deactivate others.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWhatsappDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateWhatsappSettings} className="bg-[#0284c7] hover:bg-[#0369a1]">
              {editingWhatsappSettings ? 'Update' : 'Create'} Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* WhatsApp Settings Delete Confirmation Dialog */}
      <AlertDialog open={showWhatsappDeleteDialog} onOpenChange={setShowWhatsappDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete WhatsApp Settings</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete the WhatsApp settings
              {whatsappSettingsToDelete && (
                <span className="font-semibold"> "{whatsappSettingsToDelete.name}"</span>
              )}
              ?
              <br />
              <br />
              <span className="text-red-600 font-medium">
                ⚠️ This action cannot be undone and will remove all configuration data for this WhatsApp provider.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowWhatsappDeleteDialog(false);
              setWhatsappSettingsToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteWhatsappSettings}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, Delete WhatsApp Settings
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Social Media Dialogs */}
      <Dialog open={showSocialDialog} onOpenChange={setShowSocialDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingSocialLink ? 'Edit Social Media Link' : 'Add Social Media Link'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="platform">Platform Name</Label>
              <Input
                id="platform"
                value={socialForm.platform}
                onChange={(e) => setSocialForm({ ...socialForm, platform: e.target.value })}
                placeholder="e.g., Facebook, Twitter, Instagram"
              />
            </div>
            <div>
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                value={socialForm.url}
                onChange={(e) => setSocialForm({ ...socialForm, url: e.target.value })}
                placeholder="https://www.example.com/yourprofile"
              />
            </div>
            <div>
              <Label htmlFor="icon">Font Awesome Icon Class (Optional)</Label>
              <Input
                id="icon"
                value={socialForm.icon}
                onChange={(e) => setSocialForm({ ...socialForm, icon: e.target.value })}
                placeholder="e.g., fab fa-facebook, fab fa-twitter, fab fa-instagram"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use Font Awesome 5.15 icon classes. Examples: fab fa-facebook, fab fa-twitter, fab fa-linkedin, fab fa-youtube
              </p>
            </div>
            <div>
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                type="number"
                value={socialForm.order}
                onChange={(e) => setSocialForm({ ...socialForm, order: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={socialForm.is_active}
                onChange={(e) => setSocialForm({ ...socialForm, is_active: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSocialDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSocialLink} disabled={loading}>
              {loading ? 'Saving...' : (editingSocialLink ? 'Update' : 'Add')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Social Media Delete Confirmation Dialog */}
      <AlertDialog open={showSocialDeleteDialog} onOpenChange={setShowSocialDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Social Media Link</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this social media link? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSocialLink}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Settings;