'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase';

interface ChannelConfig {
  id: string
  channelType: 'sms' | 'email' | 'push' | 'inApp'
  enabled: boolean
  provider: string
  config: any
}

interface ChannelSettings {
  sms: {
    enabled: boolean
    provider: string
    apiKey: string
    fromNumber: string
    deliveryReports: boolean
  }
  email: {
    enabled: boolean
    provider: string
    apiKey: string
    fromEmail: string
    trackOpens: boolean
    trackClicks: boolean
  }
  push: {
    enabled: boolean
    provider: string
    serverKey: string
    bundleId: string
    enableSound: boolean
    enableBadge: boolean
  }
  inApp: {
    enabled: boolean
    displayDuration: number
    enablePersistence: boolean
    enableInteraction: boolean
  }
}

export const useChannelSettings = () => {
  const [channelSettings, setChannelSettings] = useState<ChannelSettings>({
    sms: {
      enabled: true,
      provider: 'Twilio',
      apiKey: '••••••••••••',
      fromNumber: '+1234567890',
      deliveryReports: true
    },
    email: {
      enabled: true,
      provider: 'SendGrid',
      apiKey: '••••••••••••',
      fromEmail: 'noreply@casanirvana.com',
      trackOpens: true,
      trackClicks: true
    },
    push: {
      enabled: true,
      provider: 'Firebase',
      serverKey: '••••••••••••',
      bundleId: 'com.casanirvana.app',
      enableSound: true,
      enableBadge: true
    },
    inApp: {
      enabled: true,
      displayDuration: 5000,
      enablePersistence: true,
      enableInteraction: true
    }
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch channel settings from database
  const fetchChannelSettings = async () => {
    try {
      setLoading(true)
      
      // First, ensure all channel configurations exist in the database
      const channels = ['sms', 'email', 'push', 'inApp']
      
      for (const channel of channels) {
        const { data: existingConfig } = await supabase
          .from('app_settings')
          .select('*')
          .eq('key', `channel_${channel}_config`)
          .single()

        if (!existingConfig) {
          // Create default configuration for this channel
          const defaultConfig = {
            enabled: true,
            provider: channel === 'sms' ? 'Twilio' : 
                     channel === 'email' ? 'SendGrid' : 
                     channel === 'push' ? 'Firebase' : 'Internal',
            config: getDefaultChannelConfig(channel as any)
          }

          await supabase
            .from('app_settings')
            .insert({
              key: `channel_${channel}_config`,
              value: JSON.stringify(defaultConfig),
              category: 'notifications',
              description: `${channel.toUpperCase()} channel configuration`
            })
        }
      }

      // Fetch all channel configurations
      const { data: channelConfigs, error: fetchError } = await supabase
        .from('app_settings')
        .select('*')
        .like('key', 'channel_%_config')

      if (fetchError) throw fetchError

      // Transform database data to component state
      const transformedSettings = { ...channelSettings }

      channelConfigs?.forEach((config: any) => {
        const channelType = config.key.replace('channel_', '').replace('_config', '')
        const configData = JSON.parse(config.value)
        
        if (channelType === 'sms') {
          transformedSettings.sms = {
            enabled: configData.enabled,
            provider: configData.provider,
            apiKey: '••••••••••••',
            fromNumber: configData.config?.fromNumber || '+1234567890',
            deliveryReports: configData.config?.deliveryReports || true
          }
        } else if (channelType === 'email') {
          transformedSettings.email = {
            enabled: configData.enabled,
            provider: configData.provider,
            apiKey: '••••••••••••',
            fromEmail: configData.config?.fromEmail || 'noreply@casanirvana.com',
            trackOpens: configData.config?.trackOpens || true,
            trackClicks: configData.config?.trackClicks || true
          }
        } else if (channelType === 'push') {
          transformedSettings.push = {
            enabled: configData.enabled,
            provider: configData.provider,
            serverKey: '••••••••••••',
            bundleId: configData.config?.bundleId || 'com.casanirvana.app',
            enableSound: configData.config?.enableSound || true,
            enableBadge: configData.config?.enableBadge || true
          }
        } else if (channelType === 'inApp') {
          transformedSettings.inApp = {
            enabled: configData.enabled,
            displayDuration: configData.config?.displayDuration || 5000,
            enablePersistence: configData.config?.enablePersistence || true,
            enableInteraction: configData.config?.enableInteraction || true
          }
        }
      })

      setChannelSettings(transformedSettings)
    } catch (err) {
      console.error('Error fetching channel settings:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch channel settings')
    } finally {
      setLoading(false)
    }
  }

  // Update channel setting
  const updateChannelSetting = async (
    channel: keyof ChannelSettings,
    field: string,
    value: any
  ) => {
    try {
      // Update local state immediately
      setChannelSettings(prev => ({
        ...prev,
        [channel]: {
          ...prev[channel],
          [field]: value
        }
      }))

      // Get current config from database
      const { data: currentConfig } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', `channel_${channel}_config`)
        .single()

      const configData = currentConfig ? JSON.parse(currentConfig.value) : {}
      
      // Update the specific field
      if (field === 'enabled' || field === 'provider') {
        configData[field] = value
      } else {
        if (!configData.config) configData.config = {}
        configData.config[field] = value
      }

      // Save to database
      const { error: updateError } = await supabase
        .from('app_settings')
        .update({
          value: JSON.stringify(configData),
          updated_at: new Date().toISOString()
        })
        .eq('key', `channel_${channel}_config`)

      if (updateError) throw updateError

      return { success: true }
    } catch (err) {
      console.error('Error updating channel setting:', err)
      
      // Revert local state on error
      setChannelSettings(prev => ({
        ...prev,
        [channel]: {
          ...prev[channel],
          [field]: typeof value === 'boolean' ? !value : prev[channel][field as keyof typeof prev[typeof channel]]
        }
      }))
      
      return { success: false, error: err instanceof Error ? err.message : 'Update failed' }
    }
  }

  // Default configurations for each channel
  const getDefaultChannelConfig = (channel: keyof ChannelSettings) => {
    switch (channel) {
      case 'sms':
        return {
          fromNumber: '+1234567890',
          deliveryReports: true
        }
      case 'email':
        return {
          fromEmail: 'noreply@casanirvana.com',
          trackOpens: true,
          trackClicks: true
        }
      case 'push':
        return {
          bundleId: 'com.casanirvana.app',
          enableSound: true,
          enableBadge: true
        }
      case 'inApp':
        return {
          displayDuration: 5000,
          enablePersistence: true,
          enableInteraction: true
        }
      default:
        return {}
    }
  }

  useEffect(() => {
    fetchChannelSettings()
  }, [])

  return {
    channelSettings,
    loading,
    error,
    updateChannelSetting,
    refetch: fetchChannelSettings
  }
}
