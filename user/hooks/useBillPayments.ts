import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  createBillPayment, 
  getBillPayments,
  updateBillPaymentStatus,
  saveBillAccount,
  getSavedBillAccounts,
  deleteSavedBillAccount
} from "../services/billPaymentService";
import { useAuth } from "../contexts/AuthContext";

/**
 * Hook to create a bill payment
 */
export const useCreateBillPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (billPayment: any) => createBillPayment(billPayment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billPayments"] });
      queryClient.invalidateQueries({ queryKey: ["personalHubTransactions"] });
    }
  });
};

/**
 * Hook to fetch bill payments for the current user
 */
export const useBillPayments = () => {
  const { profile } = useAuth();
  const profileKey = profile?.user_id || profile?.id;
  
  return useQuery({
    queryKey: ["billPayments", profileKey],
    queryFn: () => getBillPayments(profileKey),
    enabled: !!profileKey,
    select: (response: any) => response?.data || [],
  });
};

/**
 * Hook to update bill payment status
 */
export const useUpdateBillPaymentStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateBillPaymentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billPayments"] });
      queryClient.invalidateQueries({ queryKey: ["personalHubTransactions"] });
    }
  });
};

/**
 * Hook to save a bill account for future use
 */
export const useSaveBillAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (account: any) => saveBillAccount(account),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedBillAccounts"] });
    }
  });
};

/**
 * Hook to fetch saved bill accounts for the current user
 */
export const useSavedBillAccounts = (provider?: string) => {
  const { profile } = useAuth();
  const profileKey = profile?.user_id || profile?.id;
  
  return useQuery({
    queryKey: ["savedBillAccounts", profileKey, provider],
    queryFn: () => getSavedBillAccounts(profileKey, provider),
    enabled: !!profileKey,
    select: (response: any) => response?.data || [],
  });
};

/**
 * Hook to delete a saved bill account
 */
export const useDeleteSavedBillAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteSavedBillAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedBillAccounts"] });
    }
  });
};
