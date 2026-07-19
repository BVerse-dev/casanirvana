const ENTRY_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export const generateVisitorEntryCode = (length = 8) => {
  let result = '';
  for (let i = 0; i < length; i += 1) {
    const index = Math.floor(Math.random() * ENTRY_CODE_ALPHABET.length);
    result += ENTRY_CODE_ALPHABET.charAt(index);
  }
  return result;
};

export const createVisitorPassToken = () =>
  `VP-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

export const buildVisitorQrPayload = ({
  token,
  entryCode,
  visitorName,
  visitorPhone,
  unitId,
  fromDate,
  toDate,
  createdBy,
  purpose,
  visitorType = 'guest',
  companyName = null,
  serviceType = null,
  vehicleType = null,
  vehicleNumber = null,
  driverName = null,
  deliveryDetails = null,
}) =>
  JSON.stringify({
    id: token,
    visitor_name: visitorName || 'Visitor',
    visitor_phone: visitorPhone || '',
    unit_id: unitId || null,
    from_date: fromDate || null,
    to_date: toDate || null,
    created_by: createdBy || null,
    created_at: new Date().toISOString(),
    purpose: purpose || 'Guest visit',
    type: 'visitor_pass',
    entry_code: entryCode || null,
    visitor_type: visitorType,
    company_name: companyName,
    service_type: serviceType,
    vehicle_type: vehicleType,
    vehicle_number: vehicleNumber,
    driver_name: driverName,
    delivery_details: deliveryDetails,
  });
