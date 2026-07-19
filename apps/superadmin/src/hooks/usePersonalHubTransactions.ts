'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from './useSupabase'
import { PersonalHubTransaction, ServiceType, TransactionStatus } from '@/types/database'

interface TransactionFilters {
  serviceType?: ServiceType
  status?: TransactionStatus
  provider?: string
  dateFrom?: string
  dateTo?: string
  userId?: string
}

export const usePersonalHubTransactions = (filters?: TransactionFilters) => {
  const [transactions, setTransactions] = useState<PersonalHubTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const supabase = useSupabase()

  const fetchTransactions = async (page = 1, limit = 50) => {
    try {
      setLoading(true)
      let query = supabase
        .from('personal_hub_transactions')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters?.serviceType) {
        query = query.eq('transaction_type', filters.serviceType)
      }

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.provider) {
        query = query.eq('provider', filters.provider)
      }

      if (filters?.userId) {
        query = query.eq('user_id', filters.userId)
      }

      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom)
      }

      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo)
      }

      // Pagination
      const from = (page - 1) * limit
      const to = from + limit - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) throw error
      
      setTransactions(data || [])
      setTotalCount(count || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions')
    } finally {
      setLoading(false)
    }
  }

  const getTransactionDetails = async (transactionId: string, transactionType: ServiceType) => {
    try {
      let tableName: string
      
      switch (transactionType) {
        case 'airtime':
          tableName = 'airtime_purchases'
          break
        case 'data':
          tableName = 'data_purchases'
          break
        case 'money_transfer':
          tableName = 'money_transfers'
          break
        case 'bill_payment':
          tableName = 'bill_payments'
          break
        case 'insurance':
          tableName = 'insurance_payments'
          break
        case 'marketplace':
          tableName = 'shopping_payments'
          break
        default:
          throw new Error('Invalid transaction type')
      }

      const { data, error } = await supabase
        .from(tableName as any)
        .select('*')
        .eq('id', transactionId)
        .single()

      if (error) throw error
      return data
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to fetch transaction details')
    }
  }

  const updateTransactionStatus = async (
    transactionId: string,
    transactionType: ServiceType,
    status: TransactionStatus,
    adminNotes?: string
  ) => {
    try {
      let tableName: string
      
      switch (transactionType) {
        case 'airtime':
          tableName = 'airtime_purchases'
          break
        case 'data':
          tableName = 'data_purchases'
          break
        case 'money_transfer':
          tableName = 'money_transfers'
          break
        case 'bill_payment':
          tableName = 'bill_payments'
          break
        case 'insurance':
          tableName = 'insurance_payments'
          break
        case 'marketplace':
          tableName = 'shopping_payments'
          break
        default:
          throw new Error('Invalid transaction type')
      }

      const updates: any = { status }
      if (adminNotes) {
        updates.admin_notes = adminNotes
      }

      const { data, error } = await supabase
        .from(tableName as any)
        .update(updates)
        .eq('id', transactionId)
        .select()

      if (error) throw error

      // Log status change
      await supabase
        .from('transaction_status_logs')
        .insert([{
          transaction_id: transactionId,
          transaction_type: transactionType,
          new_status: status,
          reason: adminNotes || 'Status updated by admin'
        }])

      return data?.[0]
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update transaction status')
    }
  }

  const getTransactionStatusLogs = async (transactionId: string) => {
    try {
      const { data, error } = await supabase
        .from('transaction_status_logs')
        .select('*')
        .eq('transaction_id', transactionId)
        .order('changed_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to fetch status logs')
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [filters])

  return {
    transactions,
    loading,
    error,
    totalCount,
    fetchTransactions,
    getTransactionDetails,
    updateTransactionStatus,
    getTransactionStatusLogs,
    refetch: () => fetchTransactions()
  }
}
