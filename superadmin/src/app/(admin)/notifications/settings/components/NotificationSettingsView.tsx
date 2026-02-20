'use client'

import { useState, useEffect } from 'react'
import { Card, CardBody, CardHeader, Nav, NavItem, NavLink, Button, Form, Badge, Table, Row, Col, FormControl, FormSelect, FormLabel, FormCheck, Alert, Modal } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useNotificationSettings } from '@/hooks/useNotificationSettings'
import { useNotificationConfigs } from '@/hooks/useNotificationConfigs'
import { useChannelSettings } from '@/hooks/useChannelSettings'

interface NotificationRule {
  id: string
  name: string
  trigger: string
  channels: string[]
  conditions: string
  status: 'active' | 'inactive'
  priority: 'low' | 'medium' | 'high'
  createdAt: string
}

interface RateLimitSettings {
  sms: { perHour: number; perDay: number }
  email: { perHour: number; perDay: number }
  push: { perHour: number; perDay: number }
  inApp: { perHour: number; perDay: number }
}

const NotificationSettingsView = () => {
  const [activeTab, setActiveTab] = useState('general')
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [showAddRuleModal, setShowAddRuleModal] = useState(false)
  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    triggerEvent: '',
    channels: {
      email: false,
      sms: false,
      push: false,
      inApp: false
    },
    recipientRoles: [] as string[],
    priority: 'medium' as 'low' | 'medium' | 'high'
  })

  // Use hooks for data fetching
  const { 
    data: notificationData, 
    loading: notificationLoading, 
    error: notificationError,
    updateGeneralSetting,
    updateRateLimitSetting 
  } = useNotificationSettings()
  
  const { 
    data: configsData, 
    isLoading: configsLoading, 
    error: configsError 
  } = useNotificationConfigs()

  // Use professional channel settings hook
  const {
    channelSettings,
    loading: channelLoading,
    error: channelError,
    updateChannelSetting
  } = useChannelSettings()

  // Transform hook data to match existing component structure
  const [generalSettings, setGeneralSettings] = useState({
    defaultSender: 'Casa Nirvana',
    defaultFromEmail: 'noreply@casanirvana.com',
    defaultTimezone: 'UTC',
    enableBatchProcessing: true,
    enableAnalytics: true,
    enableUserPreferences: true,
    retryFailedNotifications: true,
    maxRetryAttempts: 3
  })

  // Rate limit settings
  const [rateLimitSettings, setRateLimitSettings] = useState<RateLimitSettings>({
    sms: { perHour: 100, perDay: 1000 },
    email: { perHour: 500, perDay: 5000 },
    push: { perHour: 1000, perDay: 10000 },
    inApp: { perHour: 2000, perDay: 20000 }
  })

  const handleChannelConfigChange = async (
    channel: 'sms' | 'email' | 'push' | 'inApp',
    field: string,
    value: any
  ) => {
    if (updateChannelSetting) {
      const result = await updateChannelSetting(channel, field, value)
      if (!result.success) {
        console.error(`Error updating ${channel} ${field}:`, result.error)
      }
    }
  }

  // Update state when hook data changes (only on initial load, not during updates)
  useEffect(() => {
    if (notificationData?.generalSettings && !isUpdating) {
      const hookData = notificationData.generalSettings
      
      // Helper function to parse boolean values correctly
      const parseBooleanValue = (setting: any): boolean => {
        if (!setting) return false // Default to false if setting doesn't exist
        const value = setting.value
        if (typeof value === 'boolean') return value
        if (typeof value === 'string') return value.toLowerCase() === 'true'
        return false
      }
      
      const newSettings = {
        defaultSender: hookData.find(s => s.id === 'default_sender')?.value as string || 'Casa Nirvana',
        defaultFromEmail: hookData.find(s => s.id === 'default_from_email')?.value as string || 'noreply@casanirvana.com',
        defaultTimezone: hookData.find(s => s.id === 'default_timezone')?.value as string || 'UTC',
        enableBatchProcessing: parseBooleanValue(hookData.find(s => s.id === 'enable_batch_processing')),
        enableAnalytics: parseBooleanValue(hookData.find(s => s.id === 'enable_analytics')),
        enableUserPreferences: parseBooleanValue(hookData.find(s => s.id === 'enable_user_preferences')),
        retryFailedNotifications: parseBooleanValue(hookData.find(s => s.id === 'retry_failed_notifications')),
        maxRetryAttempts: parseInt(hookData.find(s => s.id === 'max_retry_attempts')?.value as string) || 3
      }
      
      setGeneralSettings(newSettings)
    }
  }, [notificationData, isUpdating])

  useEffect(() => {
    if (notificationData?.rateLimitSettings) {
      const hookData = notificationData.rateLimitSettings
      setRateLimitSettings({
        sms: { 
          perHour: hookData.find(s => s.id === 'max_sms_per_hour')?.value || 100,
          perDay: hookData.find(s => s.id === 'max_sms_per_day')?.value || 1000
        },
        email: { 
          perHour: hookData.find(s => s.id === 'max_email_per_hour')?.value || 500,
          perDay: hookData.find(s => s.id === 'max_email_per_day')?.value || 5000
        },
        push: { 
          perHour: hookData.find(s => s.id === 'max_push_per_hour')?.value || 1000,
          perDay: hookData.find(s => s.id === 'max_push_per_day')?.value || 10000
        },
        inApp: { 
          perHour: hookData.find(s => s.id === 'max_in_app_per_hour')?.value || 2000,
          perDay: hookData.find(s => s.id === 'max_in_app_per_day')?.value || 20000
        }
      })
    }
  }, [notificationData])

  useEffect(() => {
    if (configsData) {
      // For now, keep using static channel configs until channel database structure is clarified
      // The main focus is on fixing the general settings toggles
      console.log('Channel configs data loaded:', configsData)
    }
  }, [configsData])

  // Sample notification rules - will be replaced with real data
  const [notificationRules, setNotificationRules] = useState<NotificationRule[]>([
    {
      id: 'rule_1',
      name: 'Welcome Email',
      trigger: 'user.registration',
      channels: ['email', 'inApp'],
      conditions: 'Event: user.registration',
      status: 'active',
      priority: 'medium',
      createdAt: '2024-01-15'
    },
    {
      id: 'rule_2',
      name: 'Payment Confirmation',
      trigger: 'payment.received',
      channels: ['email', 'sms'],
      conditions: 'Event: payment.received',
      status: 'active',
      priority: 'high',
      createdAt: '2024-01-10'
    },
    {
      id: 'rule_3',
      name: 'Maintenance Alert',
      trigger: 'maintenance.requested',
      channels: ['push', 'inApp'],
      conditions: 'Event: maintenance.requested',
      status: 'inactive',
      priority: 'low',
      createdAt: '2024-01-05'
    }
  ])

  // Fetch notification rules and transform data
  useEffect(() => {
    if (notificationData?.notificationRules) {
      const transformedRules: NotificationRule[] = notificationData.notificationRules.map(rule => ({
        id: rule.id,
        name: rule.name || rule.description,
        trigger: rule.triggerEvent,
        channels: Object.entries(rule.channels)
          .filter(([_, enabled]) => enabled)
          .map(([channel, _]) => channel),
        conditions: `Event: ${rule.triggerEvent}`,
        status: (rule.channels.email || rule.channels.sms || rule.channels.push || rule.channels.inApp ? 'active' : 'inactive') as 'active' | 'inactive',
        priority: 'medium' as 'low' | 'medium' | 'high', // Default priority
        createdAt: new Date().toISOString().split('T')[0]
      }))
      setNotificationRules(transformedRules)
    }
  }, [notificationData])

  // Show loading state while data is being fetched
  if (notificationLoading || configsLoading || channelLoading) {
    return (
      <div className="container-fluid p-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">Loading notification settings...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show error state if there's an error
  if (notificationError || configsError || channelError) {
    return (
      <div className="container-fluid p-4">
        <Alert variant="danger">
          <h5>Error Loading Settings</h5>
          <p>{
            String(notificationError || configsError || channelError || 'An error occurred')
          }</p>
          <Button variant="outline-danger" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Alert>
      </div>
    )
  }

  const priorityColors = {
    low: 'success',
    medium: 'warning',
    high: 'danger'
  }

  const statusColors = {
    active: 'success',
    inactive: 'secondary'
  }

  // Handle automatic saving for general settings
  const handleGeneralSettingChange = async (key: string, value: boolean | string | number) => {
    // Set updating flag to prevent useEffect conflicts
    setIsUpdating(true)
    
    // Update local state immediately for responsive UI
    setGeneralSettings(prev => ({ ...prev, [key]: value }))
    
    // Save to database
    if (updateGeneralSetting) {
      try {
        const settingKey = 
          key === 'defaultSender' ? 'default_sender' :
          key === 'defaultFromEmail' ? 'default_from_email' :
          key === 'defaultTimezone' ? 'default_timezone' :
          key === 'enableBatchProcessing' ? 'enable_batch_processing' :
          key === 'enableAnalytics' ? 'enable_analytics' :
          key === 'enableUserPreferences' ? 'enable_user_preferences' :
          key === 'retryFailedNotifications' ? 'retry_failed_notifications' :
          key === 'maxRetryAttempts' ? 'max_retry_attempts' : key
        
        console.log(`Updating ${settingKey} with value:`, value, typeof value)
        
        const result = await updateGeneralSetting(settingKey, typeof value === 'number' ? value.toString() : value)
        
        if (result.success) {
          console.log(`Setting ${settingKey} updated successfully`)
        } else {
          console.error(`Error updating setting ${settingKey}:`, result.error)
          // Revert to previous state on error
          setGeneralSettings(prev => ({ ...prev, [key]: typeof value === 'boolean' ? !value : prev[key as keyof typeof prev] }))
        }
      } catch (error) {
        console.error('Error updating setting:', error)
        // Revert to previous state on error
        setGeneralSettings(prev => ({ ...prev, [key]: typeof value === 'boolean' ? !value : prev[key as keyof typeof prev] }))
      } finally {
        // Clear updating flag after database operation
        setTimeout(() => setIsUpdating(false), 2000)
      }
    }
  }

  // Handle automatic saving for rate limit settings
  const handleRateLimitChange = async (channel: string, period: string, value: number) => {
    // Update local state immediately
    setRateLimitSettings(prev => ({
      ...prev,
      [channel]: { ...prev[channel as keyof RateLimitSettings], [period]: value }
    }))
    
    // Save to database
    if (updateRateLimitSetting) {
      try {
        const settingKey = `max_${channel}_per_${period === 'perHour' ? 'hour' : 'day'}`
        const result = await updateRateLimitSetting(settingKey, value)
        
        if (result.success) {
          setAlertMessage(`Rate limit updated successfully!`)
          setShowAlert(true)
          setTimeout(() => setShowAlert(false), 2000)
        }
      } catch (error) {
        console.error('Error updating rate limit:', error)
      }
    }
  }

  // Manual save all settings function (for the Save All button)
  const handleSaveSettings = async () => {
    try {
      console.log('Saving all settings...')
      setAlertMessage('All settings saved successfully!')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
      setAlertMessage('Error saving settings. Please try again.')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
    }
  }

  const handleTestChannel = (channel: string) => {
    console.log(`Testing ${channel} channel...`)
    setAlertMessage(`Test notification sent via ${channel}!`)
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 3000)
  }

  const handleAddRule = () => {
    setShowAddRuleModal(true)
  }

  const handleCloseAddRuleModal = () => {
    setShowAddRuleModal(false)
    setNewRule({
      name: '',
      description: '',
      triggerEvent: '',
      channels: {
        email: false,
        sms: false,
        push: false,
        inApp: false
      },
      recipientRoles: [],
      priority: 'medium'
    })
  }

  const handleSaveNewRule = () => {
    // Validate required fields
    if (!newRule.name || !newRule.triggerEvent) {
      setAlertMessage('Please fill in all required fields (Name and Trigger Event)')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
      return
    }

    // Check if at least one channel is selected
    const hasChannels = Object.values(newRule.channels).some(enabled => enabled)
    if (!hasChannels) {
      setAlertMessage('Please select at least one notification channel')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
      return
    }

    // Create new rule object
    const ruleToAdd: NotificationRule = {
      id: `rule_${Date.now()}`,
      name: newRule.name,
      trigger: newRule.triggerEvent,
      channels: Object.entries(newRule.channels)
        .filter(([_, enabled]) => enabled)
        .map(([channel, _]) => channel),
      conditions: `Event: ${newRule.triggerEvent}`,
      status: 'active',
      priority: newRule.priority,
      createdAt: new Date().toISOString().split('T')[0]
    }

    // Add to rules list
    setNotificationRules(prev => [...prev, ruleToAdd])
    
    // Close modal and show success message
    handleCloseAddRuleModal()
    setAlertMessage('Notification rule added successfully!')
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 3000)
  }

  const handleDeleteRule = (ruleId: string) => {
    setNotificationRules(prev => prev.filter(rule => rule.id !== ruleId))
    setAlertMessage('Notification rule deleted successfully!')
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 3000)
  }

  const handleToggleRuleStatus = (ruleId: string) => {
    setNotificationRules(prev => 
      prev.map(rule => 
        rule.id === ruleId 
          ? { ...rule, status: rule.status === 'active' ? 'inactive' : 'active' as 'active' | 'inactive' }
          : rule
      )
    )
    setAlertMessage('Rule status updated successfully!')
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 3000)
  }

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Notification Settings & Preferences</h1>
          <p className="text-muted">Configure notification channels, rules, and system preferences</p>
        </div>
        <Button variant="primary" onClick={handleSaveSettings}>
          <IconifyIcon icon="ri:save-line" className="me-2" />
          Save All Settings
        </Button>
      </div>

      {/* Alert */}
      {showAlert && (
        <Alert variant="success" className="mb-4" dismissible onClose={() => setShowAlert(false)}>
          {alertMessage}
        </Alert>
      )}

      {/* Navigation Tabs */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="bg-white border-bottom">
          <Nav variant="tabs" className="nav-tabs-custom">
            <NavItem>
              <NavLink
                active={activeTab === 'general'}
                onClick={() => setActiveTab('general')}
                className="cursor-pointer"
              >
                <IconifyIcon icon="ri:settings-3-line" className="me-2" />
                General
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                active={activeTab === 'channels'}
                onClick={() => setActiveTab('channels')}
                className="cursor-pointer"
              >
                <IconifyIcon icon="ri:smartphone-line" className="me-2" />
                Channels
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                active={activeTab === 'rules'}
                onClick={() => setActiveTab('rules')}
                className="cursor-pointer"
              >
                <IconifyIcon icon="ri:git-branch-line" className="me-2" />
                Rules & Triggers
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                active={activeTab === 'limits'}
                onClick={() => setActiveTab('limits')}
                className="cursor-pointer"
              >
                <IconifyIcon icon="ri:speed-line" className="me-2" />
                Rate Limits
              </NavLink>
            </NavItem>
          </Nav>
        </CardHeader>
        <CardBody>
          <div className="tab-content">
            {/* General Settings Tab */}
            {activeTab === 'general' && (
              <div className="tab-pane active">
                <Row>
                  <Col md={6}>
                    <Card>
                      <CardHeader>
                        <h5 className="mb-0">Basic Configuration</h5>
                      </CardHeader>
                      <CardBody>
                        <Form>
                          <div className="mb-3">
                            <FormLabel>Default Sender Name</FormLabel>
                            <FormControl
                              type="text"
                              value={generalSettings.defaultSender}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                handleGeneralSettingChange('defaultSender', e.target.value)
                              }
                            />
                          </div>
                          <div className="mb-3">
                            <FormLabel>Default From Email</FormLabel>
                            <FormControl
                              type="email"
                              value={generalSettings.defaultFromEmail}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                handleGeneralSettingChange('defaultFromEmail', e.target.value)
                              }
                            />
                          </div>
                          <div className="mb-3">
                            <FormLabel>Default Timezone</FormLabel>
                            <FormSelect
                              value={generalSettings.defaultTimezone}
                              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                                handleGeneralSettingChange('defaultTimezone', e.target.value)
                              }
                            >
                              <option value="UTC">UTC</option>
                              <option value="America/New_York">Eastern Time</option>
                              <option value="America/Chicago">Central Time</option>
                              <option value="America/Denver">Mountain Time</option>
                              <option value="America/Los_Angeles">Pacific Time</option>
                            </FormSelect>
                          </div>
                          <div className="mb-3">
                            <FormLabel>Max Retry Attempts</FormLabel>
                            <FormSelect
                              value={generalSettings.maxRetryAttempts}
                              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                                handleGeneralSettingChange('maxRetryAttempts', parseInt(e.target.value))
                              }
                            >
                              <option value={1}>1</option>
                              <option value={2}>2</option>
                              <option value={3}>3</option>
                              <option value={5}>5</option>
                            </FormSelect>
                          </div>
                        </Form>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card>
                      <CardHeader>
                        <h5 className="mb-0">System Features</h5>
                      </CardHeader>
                      <CardBody>
                        <Form>
                          <div className="mb-3">
                            <FormCheck
                              type="switch"
                              id="enableBatchProcessing"
                              label="Enable Batch Processing"
                              checked={generalSettings.enableBatchProcessing}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                handleGeneralSettingChange('enableBatchProcessing', e.target.checked)
                              }
                            />
                            <small className="text-muted">Process notifications in batches for better performance</small>
                          </div>
                          <div className="mb-3">
                            <FormCheck
                              type="switch"
                              id="enableAnalytics"
                              label="Enable Analytics Tracking"
                              checked={generalSettings.enableAnalytics}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                handleGeneralSettingChange('enableAnalytics', e.target.checked)
                              }
                            />
                            <small className="text-muted">Track delivery, open, and click rates</small>
                          </div>
                          <div className="mb-3">
                            <FormCheck
                              type="switch"
                              id="enableUserPreferences"
                              label="Respect User Preferences"
                              checked={generalSettings.enableUserPreferences}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                handleGeneralSettingChange('enableUserPreferences', e.target.checked)
                              }
                            />
                            <small className="text-muted">Honor user opt-out and preference settings</small>
                          </div>
                          <div className="mb-3">
                            <FormCheck
                              type="switch"
                              id="retryFailedNotifications"
                              label="Retry Failed Notifications"
                              checked={generalSettings.retryFailedNotifications}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                handleGeneralSettingChange('retryFailedNotifications', e.target.checked)
                              }
                            />
                            <small className="text-muted">Automatically retry failed notification deliveries</small>
                          </div>
                        </Form>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
              </div>
            )}

            {/* Channels Configuration Tab */}
            {activeTab === 'channels' && (
              <div className="tab-pane active">
                <Row>
                  {/* SMS Configuration */}
                  <Col md={6} className="mb-4">
                    <Card>
                      <CardHeader className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">
                          <IconifyIcon icon="ri:message-3-line" className="me-2" />
                          SMS Configuration
                        </h5>
                        <div className="d-flex gap-2">
                          <FormCheck
                            type="switch"
                            id="smsEnabled"
                            checked={channelSettings.sms.enabled}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                              handleChannelConfigChange('sms', 'enabled', e.target.checked)
                            }
                          />
                          <Button size="sm" variant="outline-primary" onClick={() => handleTestChannel('SMS')}>
                            Test
                          </Button>
                        </div>
                      </CardHeader>
                      <CardBody>
                        <Form>
                          <div className="mb-3">
                            <FormLabel>Provider</FormLabel>
                            <FormSelect
                              value={channelSettings.sms.provider}
                              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                                handleChannelConfigChange('sms', 'provider', e.target.value)
                              }
                            >
                              <option value="Twilio">Twilio</option>
                              <option value="AWS SNS">AWS SNS</option>
                              <option value="MessageBird">MessageBird</option>
                            </FormSelect>
                          </div>
                          <div className="mb-3">
                            <FormLabel>API Key</FormLabel>
                            <FormControl
                              type="password"
                              value={channelSettings.sms.apiKey}
                              placeholder="Enter API key"
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                handleChannelConfigChange('sms', 'apiKey', e.target.value)
                              }
                            />
                          </div>
                          <div className="mb-3">
                            <FormLabel>From Number</FormLabel>
                            <FormControl
                              type="text"
                              value={channelSettings.sms.fromNumber}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                handleChannelConfigChange('sms', 'fromNumber', e.target.value)
                              }
                            />
                          </div>
                          <FormCheck
                            type="checkbox"
                            id="smsDeliveryReports"
                            label="Enable Delivery Reports"
                            checked={channelSettings.sms.deliveryReports}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                              handleChannelConfigChange('sms', 'deliveryReports', e.target.checked)
                            }
                          />
                        </Form>
                      </CardBody>
                    </Card>
                  </Col>

                  {/* Email Configuration */}
                  <Col md={6} className="mb-4">
                    <Card>
                      <CardHeader className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">
                          <IconifyIcon icon="ri:mail-line" className="me-2" />
                          Email Configuration
                        </h5>
                        <div className="d-flex gap-2">
                          <FormCheck
                            type="switch"
                            id="emailEnabled"
                            checked={channelSettings.email.enabled}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                              handleChannelConfigChange('email', 'enabled', e.target.checked)
                            }
                          />
                          <Button size="sm" variant="outline-primary" onClick={() => handleTestChannel('Email')}>
                            Test
                          </Button>
                        </div>
                      </CardHeader>
                      <CardBody>
                        <Form>
                          <div className="mb-3">
                            <FormLabel>Provider</FormLabel>
                            <FormSelect
                              value={channelSettings.email.provider}
                              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                                handleChannelConfigChange('email', 'provider', e.target.value)
                              }
                            >
                              <option value="SendGrid">SendGrid</option>
                              <option value="AWS SES">AWS SES</option>
                              <option value="Mailgun">Mailgun</option>
                              <option value="Postmark">Postmark</option>
                            </FormSelect>
                          </div>
                          <div className="mb-3">
                            <FormLabel>API Key</FormLabel>
                            <FormControl
                              type="password"
                              value={channelSettings.email.apiKey}
                              placeholder="Enter API key"
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                handleChannelConfigChange('email', 'apiKey', e.target.value)
                              }
                            />
                          </div>
                          <div className="mb-3">
                            <FormLabel>From Email</FormLabel>
                            <FormControl
                              type="email"
                              value={channelSettings.email.fromEmail}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                handleChannelConfigChange('email', 'fromEmail', e.target.value)
                              }
                            />
                          </div>
                          <div className="d-flex gap-3">
                            <FormCheck
                              type="checkbox"
                              id="emailTrackOpens"
                              label="Track Opens"
                              checked={channelSettings.email.trackOpens}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                handleChannelConfigChange('email', 'trackOpens', e.target.checked)
                              }
                            />
                            <FormCheck
                              type="checkbox"
                              id="emailTrackClicks"
                              label="Track Clicks"
                              checked={channelSettings.email.trackClicks}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                handleChannelConfigChange('email', 'trackClicks', e.target.checked)
                              }
                            />
                          </div>
                        </Form>
                      </CardBody>
                    </Card>
                  </Col>

                  {/* Push Notifications Configuration */}
                  <Col md={6} className="mb-4">
                    <Card>
                      <CardHeader className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">
                          <IconifyIcon icon="ri:notification-3-line" className="me-2" />
                          Push Notifications
                        </h5>
                        <div className="d-flex gap-2">
                          <FormCheck
                            type="switch"
                            id="pushEnabled"
                            checked={channelSettings.push.enabled}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                              handleChannelConfigChange('push', 'enabled', e.target.checked)
                            }
                          />
                          <Button size="sm" variant="outline-primary" onClick={() => handleTestChannel('Push')}>
                            Test
                          </Button>
                        </div>
                      </CardHeader>
                      <CardBody>
                        <Form>
                          <div className="mb-3">
                            <FormLabel>Provider</FormLabel>
                            <FormSelect
                              value={channelSettings.push.provider}
                              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                                handleChannelConfigChange('push', 'provider', e.target.value)
                              }
                            >
                              <option value="Firebase">Firebase Cloud Messaging</option>
                              <option value="APNS">Apple Push Notification Service</option>
                              <option value="OneSignal">OneSignal</option>
                            </FormSelect>
                          </div>
                          <div className="mb-3">
                            <FormLabel>Server Key</FormLabel>
                            <FormControl
                              type="password"
                              value={channelSettings.push.serverKey}
                              placeholder="Enter server key"
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                handleChannelConfigChange('push', 'serverKey', e.target.value)
                              }
                            />
                          </div>
                          <div className="mb-3">
                            <FormLabel>Bundle ID</FormLabel>
                            <FormControl
                              type="text"
                              value={channelSettings.push.bundleId}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                handleChannelConfigChange('push', 'bundleId', e.target.value)
                              }
                            />
                          </div>
                          <div className="d-flex gap-3">
                            <FormCheck
                              type="checkbox"
                              id="pushEnableSound"
                              label="Enable Sound"
                              checked={channelSettings.push.enableSound}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                handleChannelConfigChange('push', 'enableSound', e.target.checked)
                              }
                            />
                            <FormCheck
                              type="checkbox"
                              id="pushEnableBadge"
                              label="Enable Badge"
                              checked={channelSettings.push.enableBadge}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                handleChannelConfigChange('push', 'enableBadge', e.target.checked)
                              }
                            />
                          </div>
                        </Form>
                      </CardBody>
                    </Card>
                  </Col>

                  {/* In-App Notifications Configuration */}
                  <Col md={6} className="mb-4">
                    <Card>
                      <CardHeader className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">
                          <IconifyIcon icon="ri:smartphone-line" className="me-2" />
                          In-App Notifications
                        </h5>
                        <FormCheck
                          type="switch"
                          id="inAppEnabled"
                          checked={channelSettings.inApp.enabled}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                            handleChannelConfigChange('inApp', 'enabled', e.target.checked)
                          }
                        />
                      </CardHeader>
                      <CardBody>
                        <Form>
                          <div className="mb-3">
                            <FormLabel>Display Duration (ms)</FormLabel>
                            <FormControl
                              type="number"
                              value={channelSettings.inApp.displayDuration}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                handleChannelConfigChange('inApp', 'displayDuration', parseInt(e.target.value))
                              }
                            />
                          </div>
                          <div className="d-flex flex-column gap-2">
                            <FormCheck
                              type="checkbox"
                              id="inAppPersistence"
                              label="Enable Persistence"
                              checked={channelSettings.inApp.enablePersistence}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                handleChannelConfigChange('inApp', 'enablePersistence', e.target.checked)
                              }
                            />
                            <small className="text-muted">Save notifications for later viewing</small>
                            <FormCheck
                              type="checkbox"
                              id="inAppInteraction"
                              label="Enable User Interaction"
                              checked={channelSettings.inApp.enableInteraction}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                handleChannelConfigChange('inApp', 'enableInteraction', e.target.checked)
                              }
                            />
                            <small className="text-muted">Allow users to mark as read, dismiss, etc.</small>
                          </div>
                        </Form>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
              </div>
            )}

            {/* Rules & Triggers Tab */}
            {activeTab === 'rules' && (
              <div className="tab-pane active">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="mb-0">Notification Rules & Triggers</h5>
                  <Button variant="primary" size="sm" onClick={handleAddRule}>
                    <IconifyIcon icon="ri:add-line" className="me-2" />
                    Add Rule
                  </Button>
                </div>
                <div className="table-responsive">
                  <Table className="table-hover">
                    <thead>
                      <tr>
                        <th>Rule Name</th>
                        <th>Trigger</th>
                        <th>Channels</th>
                        <th>Conditions</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notificationRules.map(rule => (
                        <tr key={rule.id}>
                          <td>
                            <strong>{rule.name}</strong>
                          </td>
                          <td>
                            <code className="small">{rule.trigger}</code>
                          </td>
                          <td>
                            <div className="d-flex flex-wrap gap-1">
                              {rule.channels.map(channel => (
                                <Badge key={channel} bg="secondary" className="small">
                                  {channel}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td>
                            <code className="small">{rule.conditions}</code>
                          </td>
                          <td>
                            <Badge bg={priorityColors[rule.priority]} className="text-capitalize">
                              {rule.priority}
                            </Badge>
                          </td>
                          <td>
                            <Badge bg={statusColors[rule.status]} className="text-capitalize">
                              {rule.status}
                            </Badge>
                          </td>
                          <td>{new Date(rule.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline-primary"
                                title="Edit Rule"
                              >
                                <IconifyIcon icon="ri:edit-line" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant={rule.status === 'active' ? 'outline-warning' : 'outline-success'}
                                onClick={() => handleToggleRuleStatus(rule.id)}
                                title={rule.status === 'active' ? 'Disable Rule' : 'Enable Rule'}
                              >
                                <IconifyIcon icon={rule.status === 'active' ? 'ri:pause-line' : 'ri:play-line'} />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline-danger"
                                onClick={() => handleDeleteRule(rule.id)}
                                title="Delete Rule"
                              >
                                <IconifyIcon icon="ri:delete-bin-line" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </div>
            )}

            {/* Rate Limits Tab */}
            {activeTab === 'limits' && (
              <div className="tab-pane active">
                <h5 className="mb-4">Rate Limiting Configuration</h5>
                <Row>
                  <Col md={6}>
                    <Card className="mb-4">
                      <CardHeader>
                        <h6 className="mb-0">SMS Rate Limits</h6>
                      </CardHeader>
                      <CardBody>
                        <Row>
                          <Col md={6}>
                            <div className="mb-3">
                              <FormLabel>Per Hour</FormLabel>
                              <FormControl
                                type="number"
                                value={rateLimitSettings.sms.perHour}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                  handleRateLimitChange('sms', 'perHour', parseInt(e.target.value))
                                }
                              />
                            </div>
                          </Col>
                          <Col md={6}>
                            <div className="mb-3">
                              <FormLabel>Per Day</FormLabel>
                              <FormControl
                                type="number"
                                value={rateLimitSettings.sms.perDay}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                  handleRateLimitChange('sms', 'perDay', parseInt(e.target.value))
                                }
                              />
                            </div>
                          </Col>
                        </Row>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card className="mb-4">
                      <CardHeader>
                        <h6 className="mb-0">Email Rate Limits</h6>
                      </CardHeader>
                      <CardBody>
                        <Row>
                          <Col md={6}>
                            <div className="mb-3">
                              <FormLabel>Per Hour</FormLabel>
                              <FormControl
                                type="number"
                                value={rateLimitSettings.email.perHour}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                  handleRateLimitChange('email', 'perHour', parseInt(e.target.value))
                                }
                              />
                            </div>
                          </Col>
                          <Col md={6}>
                            <div className="mb-3">
                              <FormLabel>Per Day</FormLabel>
                              <FormControl
                                type="number"
                                value={rateLimitSettings.email.perDay}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                  handleRateLimitChange('email', 'perDay', parseInt(e.target.value))
                                }
                              />
                            </div>
                          </Col>
                        </Row>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card className="mb-4">
                      <CardHeader>
                        <h6 className="mb-0">Push Notification Rate Limits</h6>
                      </CardHeader>
                      <CardBody>
                        <Row>
                          <Col md={6}>
                            <div className="mb-3">
                              <FormLabel>Per Hour</FormLabel>
                              <FormControl
                                type="number"
                                value={rateLimitSettings.push.perHour}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                  handleRateLimitChange('push', 'perHour', parseInt(e.target.value))
                                }
                              />
                            </div>
                          </Col>
                          <Col md={6}>
                            <div className="mb-3">
                              <FormLabel>Per Day</FormLabel>
                              <FormControl
                                type="number"
                                value={rateLimitSettings.push.perDay}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                  handleRateLimitChange('push', 'perDay', parseInt(e.target.value))
                                }
                              />
                            </div>
                          </Col>
                        </Row>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card className="mb-4">
                      <CardHeader>
                        <h6 className="mb-0">In-App Rate Limits</h6>
                      </CardHeader>
                      <CardBody>
                        <Row>
                          <Col md={6}>
                            <div className="mb-3">
                              <FormLabel>Per Hour</FormLabel>
                              <FormControl
                                type="number"
                                value={rateLimitSettings.inApp.perHour}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                  handleRateLimitChange('inApp', 'perHour', parseInt(e.target.value))
                                }
                              />
                            </div>
                          </Col>
                          <Col md={6}>
                            <div className="mb-3">
                              <FormLabel>Per Day</FormLabel>
                              <FormControl
                                type="number"
                                value={rateLimitSettings.inApp.perDay}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                  handleRateLimitChange('inApp', 'perDay', parseInt(e.target.value))
                                }
                              />
                            </div>
                          </Col>
                        </Row>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Add Rule Modal */}
      <Modal show={showAddRuleModal} onHide={handleCloseAddRuleModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Notification Rule</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <div className="mb-3">
                  <FormLabel>Rule Name <span className="text-danger">*</span></FormLabel>
                  <FormControl
                    type="text"
                    placeholder="Enter rule name"
                    value={newRule.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      setNewRule(prev => ({ ...prev, name: e.target.value }))
                    }
                  />
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <FormLabel>Priority</FormLabel>
                  <FormSelect
                    value={newRule.priority}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                      setNewRule(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))
                    }
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </FormSelect>
                </div>
              </Col>
            </Row>
            
            <div className="mb-3">
              <FormLabel>Description</FormLabel>
              <FormControl
                as="textarea"
                rows={2}
                placeholder="Enter rule description"
                value={newRule.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                  setNewRule(prev => ({ ...prev, description: e.target.value }))
                }
              />
            </div>

            <div className="mb-3">
              <FormLabel>Trigger Event <span className="text-danger">*</span></FormLabel>
              <FormSelect
                value={newRule.triggerEvent}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                  setNewRule(prev => ({ ...prev, triggerEvent: e.target.value }))
                }
              >
                <option value="">Select trigger event</option>
                <option value="user.registration">User Registration</option>
                <option value="user.login">User Login</option>
                <option value="payment.received">Payment Received</option>
                <option value="payment.failed">Payment Failed</option>
                <option value="maintenance.requested">Maintenance Requested</option>
                <option value="maintenance.completed">Maintenance Completed</option>
                <option value="complaint.submitted">Complaint Submitted</option>
                <option value="complaint.resolved">Complaint Resolved</option>
                <option value="visitor.registered">Visitor Registered</option>
                <option value="notice.published">Notice Published</option>
                <option value="emergency.alert">Emergency Alert</option>
              </FormSelect>
            </div>

            <div className="mb-3">
              <FormLabel>Notification Channels <span className="text-danger">*</span></FormLabel>
              <div className="d-flex flex-wrap gap-3 mt-2">
                <FormCheck
                  type="checkbox"
                  id="newRuleEmail"
                  label="Email"
                  checked={newRule.channels.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setNewRule(prev => ({ 
                      ...prev, 
                      channels: { ...prev.channels, email: e.target.checked }
                    }))
                  }
                />
                <FormCheck
                  type="checkbox"
                  id="newRuleSms"
                  label="SMS"
                  checked={newRule.channels.sms}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setNewRule(prev => ({ 
                      ...prev, 
                      channels: { ...prev.channels, sms: e.target.checked }
                    }))
                  }
                />
                <FormCheck
                  type="checkbox"
                  id="newRulePush"
                  label="Push Notification"
                  checked={newRule.channels.push}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setNewRule(prev => ({ 
                      ...prev, 
                      channels: { ...prev.channels, push: e.target.checked }
                    }))
                  }
                />
                <FormCheck
                  type="checkbox"
                  id="newRuleInApp"
                  label="In-App"
                  checked={newRule.channels.inApp}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setNewRule(prev => ({ 
                      ...prev, 
                      channels: { ...prev.channels, inApp: e.target.checked }
                    }))
                  }
                />
              </div>
            </div>

            <div className="mb-3">
              <FormLabel>Recipient Roles</FormLabel>
              <div className="d-flex flex-wrap gap-3 mt-2">
                {['admin', 'community_member', 'guard', 'maintenance', 'manager'].map(role => (
                  <FormCheck
                    key={role}
                    type="checkbox"
                    id={`newRuleRole${role}`}
                    label={role.charAt(0).toUpperCase() + role.slice(1)}
                    checked={newRule.recipientRoles.includes(role)}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      setNewRule(prev => ({ 
                        ...prev, 
                        recipientRoles: e.target.checked 
                          ? [...prev.recipientRoles, role]
                          : prev.recipientRoles.filter(r => r !== role)
                      }))
                    }
                  />
                ))}
              </div>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAddRuleModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveNewRule}>
            <IconifyIcon icon="ri:save-line" className="me-2" />
            Save Rule
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default NotificationSettingsView
