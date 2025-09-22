import { useQuery, useMutation, useQueryClient } from "react-query";
import { 
  createInsurancePayment, 
  getInsurancePayments,
  updateInsurancePaymentStatus,
  savePolicy,
  getSavedPolicies,
  deleteSavedPolicy
} from "../services/insuranceService";
import { useAuth } from "../contexts/AuthContext";

/**
 * Hook to create an insurance payment
 */
export const useCreateInsurancePayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (insurancePayment: any) => createInsurancePayment(insurancePayment),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["insurancePayments"]);
        queryClient.invalidateQueries(["personalHubTransactions"]);
      }
    }
  );
};

/**
 * Hook to fetch insurance payments for the current user
 */
export const useInsurancePayments = () => {
  const { profile } = useAuth();
  
  return useQuery(
    ["insurancePayments", profile?.user_id],
    () => getInsurancePayments(profile?.user_id),
    {
      enabled: !!profile?.user_id,
      select: (response) => response?.data || []
    }
  );
};

/**
 * Hook to update insurance payment status
 */
export const useUpdateInsurancePaymentStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, status }: { id: string; status: string }) => updateInsurancePaymentStatus(id, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["insurancePayments"]);
        queryClient.invalidateQueries(["personalHubTransactions"]);
      }
    }
  );
};

/**
 * Hook to save a policy for future use
 */
export const useSavePolicy = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (policy: any) => savePolicy(policy),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["savedPolicies"]);
      }
    }
  );
};

/**
 * Hook to fetch saved policies for the current user
 */
export const useSavedPolicies = (provider?: string) => {
  const { profile } = useAuth();
  
  return useQuery(
    ["savedPolicies", profile?.user_id, provider],
    () => getSavedPolicies(profile?.user_id, provider),
    {
      enabled: !!profile?.user_id,
      select: (response) => response?.data || []
    }
  );
};

/**
 * Hook to delete a saved policy
 */
export const useDeleteSavedPolicy = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (id: string) => deleteSavedPolicy(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["savedPolicies"]);
      }
    }
  );
};
