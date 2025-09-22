import { useQuery, useMutation, useQueryClient } from "react-query";
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
  
  return useMutation(
    (billPayment: any) => createBillPayment(billPayment),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["billPayments"]);
        queryClient.invalidateQueries(["personalHubTransactions"]);
      }
    }
  );
};

/**
 * Hook to fetch bill payments for the current user
 */
export const useBillPayments = () => {
  const { profile } = useAuth();
  
  return useQuery(
    ["billPayments", profile?.user_id],
    () => getBillPayments(profile?.user_id),
    {
      enabled: !!profile?.user_id,
      select: (response) => response?.data || []
    }
  );
};

/**
 * Hook to update bill payment status
 */
export const useUpdateBillPaymentStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, status }: { id: string; status: string }) => updateBillPaymentStatus(id, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["billPayments"]);
        queryClient.invalidateQueries(["personalHubTransactions"]);
      }
    }
  );
};

/**
 * Hook to save a bill account for future use
 */
export const useSaveBillAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (account: any) => saveBillAccount(account),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["savedBillAccounts"]);
      }
    }
  );
};

/**
 * Hook to fetch saved bill accounts for the current user
 */
export const useSavedBillAccounts = (provider?: string) => {
  const { profile } = useAuth();
  
  return useQuery(
    ["savedBillAccounts", profile?.user_id, provider],
    () => getSavedBillAccounts(profile?.user_id, provider),
    {
      enabled: !!profile?.user_id,
      select: (response) => response?.data || []
    }
  );
};

/**
 * Hook to delete a saved bill account
 */
export const useDeleteSavedBillAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (id: string) => deleteSavedBillAccount(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["savedBillAccounts"]);
      }
    }
  );
};
