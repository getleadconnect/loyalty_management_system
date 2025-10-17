import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { adminAPI } from '../../services/api';
import { 
  Send, 
  MessageSquare, 
  Mail, 
  Phone, 
  Users, 
  FileText, 
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

const Communication = () => {
  const [activeTab, setActiveTab] = useState('compose');
  const [channel, setChannel] = useState('email');
  const [customers, setCustomers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [segments, setSegments] = useState([]);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form states
  const [messageForm, setMessageForm] = useState({
    channel: 'email',
    type: 'bulk',
    segment_id: '',
    template_id: '',
    customer_ids: [],
    subject: '',
    message: '',
    variables: {}
  });

  const [templateForm, setTemplateForm] = useState({
    name: '',
    channel: 'email',
    event_type: '',
    subject: '',
    content: '',
    variables: [],
    is_active: true
  });

  const [segmentForm, setSegmentForm] = useState({
    name: '',
    description: '',
    criteria: [],
    is_active: true
  });

  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showSegmentDialog, setShowSegmentDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [editingSegment, setEditingSegment] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [customersRes, templatesRes, segmentsRes, historyRes, statsRes] = await Promise.all([
        adminAPI.getCustomers(),
        adminAPI.getTemplates(),
        adminAPI.getSegments(),
        adminAPI.getCommunicationHistory(),
        adminAPI.getCommunicationStats()
      ]);
      
      setCustomers(customersRes.data.data || []);
      setTemplates(templatesRes.data.data || []);
      setSegments(segmentsRes.data.data || []);
      setHistory(historyRes.data.data || []);
      setStats(statsRes.data);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (messageForm.type === 'individual' && messageForm.customer_ids.length === 1) {
        await adminAPI.sendIndividualMessage({
          ...messageForm,
          customer_id: messageForm.customer_ids[0]
        });
      } else {
        await adminAPI.sendBulkMessage(messageForm);
      }
      
      setSuccess('Message sent successfully!');
      setMessageForm({
        channel: 'email',
        type: 'bulk',
        segment_id: '',
        template_id: '',
        customer_ids: [],
        subject: '',
        message: '',
        variables: {}
      });
      
      loadInitialData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (editingTemplate) {
        await adminAPI.updateTemplate(editingTemplate.id, templateForm);
        setSuccess('Template updated successfully!');
      } else {
        await adminAPI.createTemplate(templateForm);
        setSuccess('Template created successfully!');
      }
      
      setShowTemplateDialog(false);
      setEditingTemplate(null);
      setTemplateForm({
        name: '',
        channel: 'email',
        event_type: '',
        subject: '',
        content: '',
        variables: [],
        is_active: true
      });
      
      loadInitialData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save template');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    setLoading(true);
    try {
      await adminAPI.deleteTemplate(id);
      setSuccess('Template deleted successfully!');
      loadInitialData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete template');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSegment = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (editingSegment) {
        await adminAPI.updateSegment(editingSegment.id, segmentForm);
        setSuccess('Segment updated successfully!');
      } else {
        await adminAPI.createSegment(segmentForm);
        setSuccess('Segment created successfully!');
      }
      
      setShowSegmentDialog(false);
      setEditingSegment(null);
      setSegmentForm({
        name: '',
        description: '',
        criteria: [],
        is_active: true
      });
      
      loadInitialData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save segment');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSegment = async (id) => {
    if (!confirm('Are you sure you want to delete this segment?')) return;
    
    setLoading(true);
    try {
      await adminAPI.deleteSegment(id);
      setSuccess('Segment deleted successfully!');
      loadInitialData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete segment');
    } finally {
      setLoading(false);
    }
  };

  const addSegmentCriterion = () => {
    setSegmentForm({
      ...segmentForm,
      criteria: [
        ...segmentForm.criteria,
        { field: 'points_balance', operator: '>=', value: '' }
      ]
    });
  };

  const updateSegmentCriterion = (index, field, value) => {
    const newCriteria = [...segmentForm.criteria];
    newCriteria[index][field] = value;
    setSegmentForm({ ...segmentForm, criteria: newCriteria });
  };

  const removeSegmentCriterion = (index) => {
    const newCriteria = segmentForm.criteria.filter((_, i) => i !== index);
    setSegmentForm({ ...segmentForm, criteria: newCriteria });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'partial':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getChannelIcon = (channel) => {
    switch (channel) {
      case 'sms':
        return <Phone className="h-4 w-4" />;
      case 'whatsapp':
        return <MessageSquare className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      default:
        return <Send className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Communication Center</h1>
          <p className="text-gray-600 mt-1">Manage customer communications across all channels</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Sent (30d)</p>
                  <p className="text-2xl font-bold">{stats.total_sent}</p>
                </div>
                <Send className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold">{stats.success_rate}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Templates</p>
                  <p className="text-2xl font-bold">{stats.templates_used}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Segments</p>
                  <p className="text-2xl font-bold">{stats.active_segments}</p>
                </div>
                <Users className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alerts */}
      {error && (
        <Alert className="bg-red-50 border-red-200">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <div className="border-b">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('compose')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'compose'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Compose Message
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'templates'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Templates
          </button>
          <button
            onClick={() => setActiveTab('segments')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'segments'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Segments
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            History
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'compose' && (
          <Card>
            <CardHeader>
              <CardTitle>Compose Message</CardTitle>
              <CardDescription>Send messages to customers via SMS, WhatsApp, or Email</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Channel Selection */}
              <div>
                <Label>Channel</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant={messageForm.channel === 'sms' ? 'default' : 'outline'}
                    onClick={() => setMessageForm({ ...messageForm, channel: 'sms' })}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    SMS
                  </Button>
                  <Button
                    variant={messageForm.channel === 'whatsapp' ? 'default' : 'outline'}
                    onClick={() => setMessageForm({ ...messageForm, channel: 'whatsapp' })}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                  <Button
                    variant={messageForm.channel === 'email' ? 'default' : 'outline'}
                    onClick={() => setMessageForm({ ...messageForm, channel: 'email' })}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                </div>
              </div>

              {/* Type Selection */}
              <div>
                <Label>Message Type</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant={messageForm.type === 'individual' ? 'default' : 'outline'}
                    onClick={() => setMessageForm({ ...messageForm, type: 'individual' })}
                  >
                    Individual
                  </Button>
                  <Button
                    variant={messageForm.type === 'bulk' ? 'default' : 'outline'}
                    onClick={() => setMessageForm({ ...messageForm, type: 'bulk' })}
                  >
                    Bulk
                  </Button>
                </div>
              </div>

              {/* Recipients Selection */}
              <div>
                <Label>Recipients</Label>
                {messageForm.type === 'individual' ? (
                  <select
                    className="w-full mt-2 p-2 border rounded-md"
                    value={messageForm.customer_ids[0] || ''}
                    onChange={(e) => setMessageForm({ ...messageForm, customer_ids: [e.target.value] })}
                  >
                    <option value="">Select a customer</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} ({customer.email})
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    className="w-full mt-2 p-2 border rounded-md"
                    value={messageForm.segment_id}
                    onChange={(e) => setMessageForm({ ...messageForm, segment_id: e.target.value })}
                  >
                    <option value="">All Customers</option>
                    {segments.map(segment => (
                      <option key={segment.id} value={segment.id}>
                        {segment.name} ({segment.customer_count} customers)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Template Selection */}
              <div>
                <Label>Template (Optional)</Label>
                <select
                  className="w-full mt-2 p-2 border rounded-md"
                  value={messageForm.template_id}
                  onChange={(e) => {
                    const template = templates.find(t => t.id == e.target.value);
                    if (template) {
                      setMessageForm({
                        ...messageForm,
                        template_id: e.target.value,
                        subject: template.subject || '',
                        message: template.content
                      });
                    } else {
                      setMessageForm({
                        ...messageForm,
                        template_id: '',
                        subject: '',
                        message: ''
                      });
                    }
                  }}
                >
                  <option value="">No template</option>
                  {templates
                    .filter(t => t.channel === messageForm.channel)
                    .map(template => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Subject (for email) */}
              {messageForm.channel === 'email' && (
                <div>
                  <Label>Subject</Label>
                  <Input
                    value={messageForm.subject}
                    onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
                    placeholder="Enter email subject"
                    className="mt-2"
                  />
                </div>
              )}

              {/* Message Content */}
              <div>
                <Label>Message</Label>
                <textarea
                  className="w-full mt-2 p-2 border rounded-md"
                  rows={6}
                  value={messageForm.message}
                  onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                  placeholder="Enter your message here..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  You can use variables like {`{name}`}, {`{points}`}, {`{balance}`}
                </p>
              </div>

              {/* Send Button */}
              <div className="flex justify-end">
                <Button 
                  onClick={handleSendMessage} 
                  disabled={loading || !messageForm.message}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'templates' && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Message Templates</CardTitle>
                  <CardDescription>Manage reusable message templates</CardDescription>
                </div>
                <Button 
                  onClick={() => {
                    setEditingTemplate(null);
                    setTemplateForm({
                      name: '',
                      channel: 'email',
                      event_type: '',
                      subject: '',
                      content: '',
                      variables: [],
                      is_active: true
                    });
                    setShowTemplateDialog(true);
                  }}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates.map(template => (
                  <div key={template.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {getChannelIcon(template.channel)}
                          <h3 className="font-semibold">{template.name}</h3>
                          {template.is_active ? (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Active</span>
                          ) : (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">Inactive</span>
                          )}
                        </div>
                        {template.subject && (
                          <p className="text-sm text-gray-600 mt-1">Subject: {template.subject}</p>
                        )}
                        <p className="text-sm text-gray-500 mt-2">{template.content.substring(0, 100)}...</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Used {template.usage_count} times</span>
                          {template.last_used_at && (
                            <span>Last used: {new Date(template.last_used_at).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingTemplate(template);
                            setTemplateForm(template);
                            setShowTemplateDialog(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'segments' && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Customer Segments</CardTitle>
                  <CardDescription>Create targeted customer groups</CardDescription>
                </div>
                <Button 
                  onClick={() => {
                    setEditingSegment(null);
                    setSegmentForm({
                      name: '',
                      description: '',
                      criteria: [],
                      is_active: true
                    });
                    setShowSegmentDialog(true);
                  }}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Segment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {segments.map(segment => (
                  <div key={segment.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <h3 className="font-semibold">{segment.name}</h3>
                          {segment.is_active ? (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Active</span>
                          ) : (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">Inactive</span>
                          )}
                        </div>
                        {segment.description && (
                          <p className="text-sm text-gray-600 mt-1">{segment.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>{segment.customer_count} customers</span>
                          {segment.last_updated && (
                            <span>Updated: {new Date(segment.last_updated).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingSegment(segment);
                            setSegmentForm(segment);
                            setShowSegmentDialog(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteSegment(segment.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'history' && (
          <Card>
            <CardHeader>
              <CardTitle>Communication History</CardTitle>
              <CardDescription>View all sent communications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Channel</th>
                      <th className="text-left p-2">Type</th>
                      <th className="text-left p-2">Recipients</th>
                      <th className="text-left p-2">Subject/Content</th>
                      <th className="text-left p-2">Sent At</th>
                      <th className="text-left p-2">Success Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map(log => (
                      <tr key={log.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          <div className="flex items-center gap-1">
                            {getStatusIcon(log.status)}
                            <span className="text-sm capitalize">{log.status}</span>
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-1">
                            {getChannelIcon(log.channel)}
                            <span className="text-sm capitalize">{log.channel}</span>
                          </div>
                        </td>
                        <td className="p-2">
                          <span className="text-sm capitalize">{log.type}</span>
                        </td>
                        <td className="p-2">
                          <span className="text-sm">{log.total_recipients}</span>
                        </td>
                        <td className="p-2">
                          <p className="text-sm truncate max-w-xs">
                            {log.subject || log.content.substring(0, 50)}...
                          </p>
                        </td>
                        <td className="p-2">
                          <span className="text-sm">
                            {log.sent_at ? new Date(log.sent_at).toLocaleString() : '-'}
                          </span>
                        </td>
                        <td className="p-2">
                          <span className="text-sm">
                            {log.total_recipients > 0 
                              ? `${Math.round((log.successful_count / log.total_recipients) * 100)}%`
                              : '-'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit Template' : 'Create New Template'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Template Name</Label>
              <Input
                value={templateForm.name}
                onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                placeholder="e.g., Welcome Message"
              />
            </div>
            
            <div>
              <Label>Channel</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={templateForm.channel}
                onChange={(e) => setTemplateForm({ ...templateForm, channel: e.target.value })}
              >
                <option value="sms">SMS</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
              </select>
            </div>
            
            <div>
              <Label>Event Type (Optional)</Label>
              <Input
                value={templateForm.event_type}
                onChange={(e) => setTemplateForm({ ...templateForm, event_type: e.target.value })}
                placeholder="e.g., points_earned, reward_redeemed"
              />
            </div>
            
            {templateForm.channel === 'email' && (
              <div>
                <Label>Subject</Label>
                <Input
                  value={templateForm.subject}
                  onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                  placeholder="Email subject"
                />
              </div>
            )}
            
            <div>
              <Label>Content</Label>
              <textarea
                className="w-full p-2 border rounded-md"
                rows={6}
                value={templateForm.content}
                onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
                placeholder="Message content..."
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={templateForm.is_active}
                onChange={(e) => setTemplateForm({ ...templateForm, is_active: e.target.checked })}
                className="mr-2"
              />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate} className="bg-purple-600 hover:bg-purple-700">
              {editingTemplate ? 'Update' : 'Create'} Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Segment Dialog */}
      <Dialog open={showSegmentDialog} onOpenChange={setShowSegmentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSegment ? 'Edit Segment' : 'Create New Segment'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Segment Name</Label>
              <Input
                value={segmentForm.name}
                onChange={(e) => setSegmentForm({ ...segmentForm, name: e.target.value })}
                placeholder="e.g., High Value Customers"
              />
            </div>
            
            <div>
              <Label>Description</Label>
              <textarea
                className="w-full p-2 border rounded-md"
                rows={2}
                value={segmentForm.description}
                onChange={(e) => setSegmentForm({ ...segmentForm, description: e.target.value })}
                placeholder="Describe this segment..."
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Criteria</Label>
                <Button size="sm" onClick={addSegmentCriterion}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Criterion
                </Button>
              </div>
              <div className="space-y-2">
                {segmentForm.criteria.map((criterion, index) => (
                  <div key={index} className="flex gap-2">
                    <select
                      className="flex-1 p-2 border rounded-md"
                      value={criterion.field}
                      onChange={(e) => updateSegmentCriterion(index, 'field', e.target.value)}
                    >
                      <option value="points_balance">Points Balance</option>
                      <option value="registration_date">Registration Date</option>
                      <option value="total_spent">Total Spent</option>
                      <option value="redemption_count">Redemption Count</option>
                      <option value="last_activity">Last Activity</option>
                    </select>
                    <select
                      className="w-24 p-2 border rounded-md"
                      value={criterion.operator}
                      onChange={(e) => updateSegmentCriterion(index, 'operator', e.target.value)}
                    >
                      <option value=">">{'>'}</option>
                      <option value="<">{'<'}</option>
                      <option value=">=">{'>='}</option>
                      <option value="<=">{'<='}</option>
                      <option value="=">{'='}</option>
                      <option value="!=">{'!='}</option>
                    </select>
                    <Input
                      className="w-32"
                      value={criterion.value}
                      onChange={(e) => updateSegmentCriterion(index, 'value', e.target.value)}
                      placeholder="Value"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeSegmentCriterion(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={segmentForm.is_active}
                onChange={(e) => setSegmentForm({ ...segmentForm, is_active: e.target.checked })}
                className="mr-2"
              />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSegmentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSegment} className="bg-purple-600 hover:bg-purple-700">
              {editingSegment ? 'Update' : 'Create'} Segment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Communication;