import { useCreateVisitor } from './useCreateVisitor';

interface CreateCabData {
  driverName: string;
  phoneNumber: string;
  vehicleNumber: string;
  vehicleType: string;
  companyName: string;
  visitDate: string;
  sendGatePassNotification: boolean;
}

export const useCreateCab = () => {
  const createVisitor = useCreateVisitor();

  const createCab = async (cabData: CreateCabData) => {
    return await createVisitor.mutateAsync({
      guestName: cabData.driverName,
      phoneNumber: cabData.phoneNumber,
      visitDate: cabData.visitDate,
      sendGatePassNotification: cabData.sendGatePassNotification,
      visitorType: 'cab',
      companyName: cabData.companyName,
      vehicleType: cabData.vehicleType,
      vehicleNumber: cabData.vehicleNumber,
      driverName: cabData.driverName,
      purpose: 'Transportation'
    });
  };

  return {
    ...createVisitor,
    mutateAsync: createCab, // Expose createCab as mutateAsync for compatibility
    createCab,
    isLoading: createVisitor.isPending,
    error: createVisitor.error
  };
};
