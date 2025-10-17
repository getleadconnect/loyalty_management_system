import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => {
    // Check if data is FormData for file upload
    if (data instanceof FormData) {
      return axios.post(`${API_URL}/register`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
      });
    }
    return api.post('/register', data);
  },
  login: (data) => api.post('/login', data),
  logout: () => api.post('/logout'),
  getUser: () => api.get('/user'),
};

// Customer Dashboard APIs
export const dashboardAPI = {
  getDashboard: () => api.get('/customer/dashboard'),
  getMonthlyActivity: (year, month) => 
    api.get('/customer/dashboard/monthly-activity', { params: { year, month } }),
};

// Points APIs
export const pointsAPI = {
  getBalance: () => api.get('/customer/points/balance'),
  getHistory: () => api.get('/customer/points/history'),
  earnPoints: (data) => api.post('/customer/points/earn', data),
  getTotalEarned: () => api.get('/customer/points/total-earned'),
};

// Rewards APIs
export const rewardsAPI = {
  getRewards: (page = 1) => api.get('/customer/rewards', { params: { page } }),
  getReward: (id) => api.get(`/customer/rewards/${id}`),
  redeemReward: (id) => api.post(`/customer/rewards/${id}/redeem`),
  getRedemptions: (page = 1) => api.get('/customer/redemptions', { params: { page } }),
};

// Barcode Scanner APIs
export const barcodeAPI = {
  scanBarcode: (data) => api.post('/customer/barcode/scan', data),
  processScannedProduct: (data) => api.post('/customer/barcode/process', data),
  getRecentScans: (params = {}) => api.get('/customer/barcode/recent-scans', { params }),
  getScanStats: () => api.get('/customer/barcode/stats'),
};

// Admin APIs
export const adminAPI = {
  // Dashboard
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  
  // Customer Management
  getCustomers: (page = 1) => api.get('/admin/customers', { params: { page } }),
  getCustomer: (id) => api.get(`/admin/customers/${id}`),
  searchCustomers: (query) => api.get('/admin/customers/search', { params: { query } }),
  adjustPoints: (customerId, data) => api.post(`/admin/customers/${customerId}/adjust-points`, data),
  getCustomerStats: () => api.get('/admin/customers/stats'),
  
  // Reward Management
  getRewards: (params = {}) => api.get('/admin/rewards', { params }),
  getReward: (id) => api.get(`/admin/rewards/${id}`),
  createReward: (data) => {
    const config = data instanceof FormData ? {
      headers: { 'Content-Type': 'multipart/form-data' }
    } : {};
    return api.post('/admin/rewards', data, config);
  },
  updateReward: (id, data) => {
    // If FormData is used, we use POST with _method field for Laravel
    const config = data instanceof FormData ? {
      headers: { 'Content-Type': 'multipart/form-data' }
    } : {};
    const url = `/admin/rewards/${id}`;
    const method = data instanceof FormData ? 'post' : 'put';
    return api[method](url, data, config);
  },
  deleteReward: (id) => api.delete(`/admin/rewards/${id}`),
  toggleRewardStatus: (id) => api.post(`/admin/rewards/${id}/toggle-status`),
  getRewardStats: () => api.get('/admin/rewards/stats'),
  
  // Communication - Messaging
  sendIndividualMessage: (data) => api.post('/admin/communication/individual', data),
  sendBulkMessage: (data) => api.post('/admin/communication/bulk', data),
  
  // Communication - Templates
  getTemplates: (params = {}) => api.get('/admin/communication/templates', { params }),
  getTemplate: (id) => api.get(`/admin/communication/templates/${id}`),
  createTemplate: (data) => api.post('/admin/communication/templates', data),
  updateTemplate: (id, data) => api.put(`/admin/communication/templates/${id}`, data),
  deleteTemplate: (id) => api.delete(`/admin/communication/templates/${id}`),
  
  // Communication - Segments
  getSegments: (params = {}) => api.get('/admin/communication/segments', { params }),
  getSegment: (id) => api.get(`/admin/communication/segments/${id}`),
  createSegment: (data) => api.post('/admin/communication/segments', data),
  updateSegment: (id, data) => api.put(`/admin/communication/segments/${id}`, data),
  deleteSegment: (id) => api.delete(`/admin/communication/segments/${id}`),
  getSegmentCustomers: (id, page = 1) => api.get(`/admin/communication/segments/${id}/customers`, { params: { page } }),
  
  // Communication - History & Stats
  getCommunicationHistory: (params = {}) => api.get('/admin/communication/history', { params }),
  getCommunicationDetails: (id) => api.get(`/admin/communication/history/${id}`),
  getCommunicationStats: (days = 30) => api.get('/admin/communication/stats', { params: { days } }),
  
  // Reports
  getEngagementMetrics: (period = 30) => api.get('/admin/reports/engagement', { params: { period } }),
  getCommunicationReport: () => api.get('/admin/reports/communication'),
  getRewardsReport: () => api.get('/admin/reports/rewards'),
  exportReport: (type, format) => api.post('/admin/reports/export', { type, format }),
  
  // Settings
  getSettings: () => api.get('/admin/settings'),
  getSettingsByGroup: (group) => api.get(`/admin/settings/group/${group}`),
  updateSmsSettings: (data) => api.put('/admin/settings/sms', data),
  updateEmailSettings: (data) => api.put('/admin/settings/email', data),
  updateWhatsAppSettings: (data) => api.put('/admin/settings/whatsapp', data),
  
  // SMS Settings CRUD
  getSmsSettings: (params = {}) => api.get('/admin/sms-settings', { params }),
  createSmsSettings: (data) => api.post('/admin/sms-settings', data),
  getSmsSettingById: (id) => api.get(`/admin/sms-settings/${id}`),
  updateSmsSettingById: (id, data) => api.put(`/admin/sms-settings/${id}`, data),
  deleteSmsSettings: (id) => api.delete(`/admin/sms-settings/${id}`),
  setDefaultSmsSettings: (id) => api.post(`/admin/sms-settings/${id}/set-default`),
  toggleActiveSmsSettings: (id) => api.post(`/admin/sms-settings/${id}/toggle-active`),
  
  // Email Settings CRUD
  getEmailSettings: (params = {}) => api.get('/admin/email-settings', { params }),
  createEmailSettings: (data) => api.post('/admin/email-settings', data),
  getEmailSettingById: (id) => api.get(`/admin/email-settings/${id}`),
  updateEmailSettingById: (id, data) => api.put(`/admin/email-settings/${id}`, data),
  deleteEmailSettings: (id) => api.delete(`/admin/email-settings/${id}`),
  toggleActiveEmailSettings: (id) => api.post(`/admin/email-settings/${id}/toggle-active`),
  
  // WhatsApp Settings CRUD
  getWhatsappSettings: (params = {}) => api.get('/admin/whatsapp-settings', { params }),
  createWhatsappSettings: (data) => api.post('/admin/whatsapp-settings', data),
  getWhatsappSettingById: (id) => api.get(`/admin/whatsapp-settings/${id}`),
  updateWhatsappSettingById: (id, data) => api.put(`/admin/whatsapp-settings/${id}`, data),
  deleteWhatsappSettings: (id) => api.delete(`/admin/whatsapp-settings/${id}`),
  toggleActiveWhatsappSettings: (id) => api.post(`/admin/whatsapp-settings/${id}/toggle-active`),
  
  // Roles
  getRoles: () => api.get('/admin/roles'),
  getRole: (id) => api.get(`/admin/roles/${id}`),
  createRole: (data) => api.post('/admin/roles', data),
  updateRole: (id, data) => api.put(`/admin/roles/${id}`, data),
  deleteRole: (id) => api.delete(`/admin/roles/${id}`),
  
  // Staff Management
  getStaff: (params = {}) => api.get('/admin/staff', { params }),
  getStaffStats: () => api.get('/admin/staff/stats'),
  getStaffMember: (id) => api.get(`/admin/staff/${id}`),
  createStaff: (data) => api.post('/admin/staff', data),
  updateStaff: (id, data) => api.put(`/admin/staff/${id}`, data),
  changeStaffPassword: (id, data) => api.put(`/admin/staff/${id}/change-password`, data),
  deleteStaff: (id) => api.delete(`/admin/staff/${id}`),
  toggleStaffStatus: (id) => api.post(`/admin/staff/${id}/toggle-status`),
  
  // Product Management
  getProducts: (params = {}) => api.get('/admin/products', { params }),
  getProduct: (id) => api.get(`/admin/products/${id}`),
  createProduct: (data) => api.post('/admin/products', data),
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  getProductStats: () => api.get('/admin/products/stats'),
  toggleProductStatus: (id) => api.post(`/admin/products/${id}/toggle-status`),
  searchProducts: (query) => api.get('/admin/products/search', { params: { query } }),
  bulkDeleteProducts: (ids) => api.post('/admin/products/bulk-delete', { ids }),
  importProducts: (formData) => api.post('/admin/products/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  exportProducts: () => api.get('/admin/products/export', {
    responseType: 'blob',
  }),
  
  // Redeemed Customers Management
  getRedeemedCustomers: (params = {}) => api.get('/admin/redeemed-customers', { params }),
  getRedeemedCustomerStats: () => api.get('/admin/redeemed-customers/stats'),
  getRedeemedCustomer: (id) => api.get(`/admin/redeemed-customers/${id}`),
  updateRedeemedCustomerStatus: (id, data) => api.put(`/admin/redeemed-customers/${id}/status`, data),
  deleteRedeemedCustomer: (id) => api.delete(`/admin/redeemed-customers/${id}`),
  bulkUpdateRedeemedCustomers: (data) => api.post('/admin/redeemed-customers/bulk-update', data),

  // Reports
  getReportsDashboard: (params) => api.get('/admin/reports/dashboard', { params }),
  getDeliveryReports: (params) => api.get('/admin/reports/delivery', { params }),
  getEngagementMetrics: (params) => api.get('/admin/reports/engagement', { params }),
  getChannelPerformance: (params) => api.get('/admin/reports/channel-performance', { params }),
  
  // Social Media Links Management
  getSocialMediaLinks: () => api.get('/admin/social-media-links'),
  getSocialMediaLink: (id) => api.get(`/admin/social-media-links/${id}`),
  createSocialMediaLink: (data) => api.post('/admin/social-media-links', data),
  updateSocialMediaLink: (id, data) => api.put(`/admin/social-media-links/${id}`, data),
  deleteSocialMediaLink: (id) => api.delete(`/admin/social-media-links/${id}`),
  toggleSocialMediaLinkStatus: (id) => api.post(`/admin/social-media-links/${id}/toggle-status`),
  
  // User Management
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  getUserRoles: () => api.get('/admin/users/roles'),
  getUser: (id) => api.get(`/admin/users/${id}`),
  createUser: (data) => {
    const config = data instanceof FormData ? {
      headers: { 'Content-Type': 'multipart/form-data' }
    } : {};
    return api.post('/admin/users', data, config);
  },
  updateUser: (id, data) => {
    const config = data instanceof FormData ? {
      headers: { 'Content-Type': 'multipart/form-data' }
    } : {};
    return api.post(`/admin/users/${id}`, data, config);
  },
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  toggleUserStatus: (id) => api.post(`/admin/users/${id}/toggle-status`),
  
  // Social Media Links
  getSocialMediaLinks: () => api.get('/admin/social-media-links'),
  createSocialMediaLink: (data) => api.post('/admin/social-media-links', data),
  updateSocialMediaLink: (id, data) => api.put(`/admin/social-media-links/${id}`, data),
  deleteSocialMediaLink: (id) => api.delete(`/admin/social-media-links/${id}`),
};

export default api;