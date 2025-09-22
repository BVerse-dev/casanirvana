import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPersonalHubTransactions, updateTransactionStatus } from '../services/personalHubService';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook to fetch personal hub transactions
 * @param options - Query options
 * @returns Query result with personal hub transactions
 */
export const usePersonalHubTransactions = (options: {
  limit?: number;
  page?: number;
  transaction_type?: string;
  status?: string;
  orderBy?: string;
  ascending?: boolean;
  enabled?: boolean;
} = {}) => {
  const { profile } = useAuth();
  const userId = profile?.user_id;
  const { limit, page, transaction_type, status, orderBy, ascending, enabled = true } = options;

  return useQuery({
    queryKey: ['personalHubTransactions', userId, limit, page, transaction_type, status, orderBy, ascending],
    queryFn: () => getPersonalHubTransactions(userId, { limit, page, transaction_type, status, orderBy, ascending }),
    enabled: !!userId && enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to update a transaction status
 * @returns Mutation function to update transaction status
 */
export const useUpdateTransactionStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ transactionType, transactionId, status }: { 
      transactionType: string;
      transactionId: string;
      status: string;
    }) => updateTransactionStatus(transactionType, transactionId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personalHubTransactions'] });
    },
  });
};

/**
 * Hook to fetch airtime purchase transactions
 * @param options - Query options
 * @returns Query result with airtime purchase transactions
 */
export const useAirtimePurchases = (options: {
  limit?: number;
  page?: number;
  status?: string;
  enabled?: boolean;
} = {}) => {
  return usePersonalHubTransactions({
    ...options,
    transaction_type: 'airtime',
  });
};

/**
 * Hook to fetch data purchase transactions
 * @param options - Query options
 * @returns Query result with data purchase transactions
 */
export const useDataPurchases = (options: {
  limit?: number;
  page?: number;
  status?: string;
  enabled?: boolean;
} = {}) => {
  return usePersonalHubTransactions({
    ...options,
    transaction_type: 'data',
  });
};

/**
 * Hook to fetch money transfer transactions
 * @param options - Query options
 * @returns Query result with money transfer transactions
 */
export const useMoneyTransfers = (options: {
  limit?: number;
  page?: number;
  status?: string;
  enabled?: boolean;
} = {}) => {
  return usePersonalHubTransactions({
    ...options,
    transaction_type: 'money_transfer',
  });
};

/**
 * Hook to fetch bill payment transactions
 * @param options - Query options
 * @returns Query result with bill payment transactions
 */
export const useBillPayments = (options: {
  limit?: number;
  page?: number;
  status?: string;
  enabled?: boolean;
} = {}) => {
  return usePersonalHubTransactions({
    ...options,
    transaction_type: 'bill_payment',
  });
};

/**
 * Hook to fetch insurance payment transactions
 * @param options - Query options
 * @returns Query result with insurance payment transactions
 */
export const useInsurancePayments = (options: {
  limit?: number;
  page?: number;
  status?: string;
  enabled?: boolean;
} = {}) => {
  return usePersonalHubTransactions({
    ...options,
    transaction_type: 'insurance',
  });
};

/**
 * Hook to fetch shopping payment transactions
 * @param options - Query options
 * @returns Query result with shopping payment transactions
 */
export const useShoppingPayments = (options: {
  limit?: number;
  page?: number;
  status?: string;
  enabled?: boolean;
} = {}) => {
  return usePersonalHubTransactions({
    ...options,
    transaction_type: 'shopping',
  });
};
