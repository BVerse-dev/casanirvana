import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  
  return useMutation({
    mutationFn: (insurancePayment: any) => createInsurancePayment(insurancePayment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insurancePayments"] });
      queryClient.invalidateQueries({ queryKey: ["personalHubTransactions"] });
    }
  });
};

/**
 * Hook to fetch insurance payments for the current user
 */
export const useInsurancePayments = () => {
  const { profile } = useAuth();
  const profileKey = profile?.user_id || profile?.id;
  
  return useQuery({
    queryKey: ["insurancePayments", profileKey],
    queryFn: () => getInsurancePayments(profileKey),
    enabled: !!profileKey,
    select: (response: any) => response?.data || [],
  });
};

/**
 * Hook to update insurance payment status
 */
export const useUpdateInsurancePaymentStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateInsurancePaymentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insurancePayments"] });
      queryClient.invalidateQueries({ queryKey: ["personalHubTransactions"] });
    }
  });
};

/**
 * Hook to save a policy for future use
 */
export const useSavePolicy = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (policy: any) => savePolicy(policy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedPolicies"] });
    }
  });
};

/**
 * Hook to fetch saved policies for the current user
 */
export const useSavedPolicies = (provider?: string) => {
  const { profile } = useAuth();
  const profileKey = profile?.user_id || profile?.id;
  
  return useQuery({
    queryKey: ["savedPolicies", profileKey, provider],
    queryFn: () => getSavedPolicies(profileKey, provider),
    enabled: !!profileKey,
    select: (response: any) => response?.data || [],
  });
};

/**
 * Hook to delete a saved policy
 */
export const useDeleteSavedPolicy = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteSavedPolicy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedPolicies"] });
    }
  });
};
