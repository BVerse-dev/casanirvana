import { useCreateVisitor } from './useCreateVisitor';

interface CreateDeliveryData {
  deliveryPersonName: string;
  phoneNumber: string;
  companyName: string;
  deliveryDetails: string;
  visitDate: string;
  sendGatePassNotification: boolean;
}

export const useCreateDelivery = () => {
  const createVisitor = useCreateVisitor();

  const createDelivery = async (deliveryData: CreateDeliveryData) => {
    return createVisitor.mutateAsync({
      guestName: deliveryData.deliveryPersonName,
      phoneNumber: deliveryData.phoneNumber,
      visitDate: deliveryData.visitDate,
      sendGatePassNotification: deliveryData.sendGatePassNotification,
      visitorType: 'delivery',
      companyName: deliveryData.companyName,
      deliveryDetails: deliveryData.deliveryDetails,
      purpose: 'Delivery'
    });
  };

  return {
    ...createVisitor,
    mutateAsync: createDelivery, // Expose createDelivery as mutateAsync for compatibility
    createDelivery
  };
};
