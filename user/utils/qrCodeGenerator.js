import QRCode from 'qrcode';

// Generate QR code for a person/vehicle
export const generateQRCode = async (name, relation = '') => {
  try {
    const data = {
      name: name,
      relation: relation,
      type: 'family_member',
      timestamp: new Date().toISOString(),
      code: generateEntryCode()
    };
    
    // Use toDataURL with proper options for React Native
    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(data), {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    // Return a fallback QR code data URL
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  }
};

// Generate a unique entry code
export const generateEntryCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Generate QR code for vehicles
export const generateVehicleQRCode = async (vehicleNumber, model = '', color = '') => {
  try {
    const data = {
      vehicleNumber: vehicleNumber,
      model: model,
      color: color,
      type: 'vehicle',
      timestamp: new Date().toISOString(),
      code: generateEntryCode()
    };
    
    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(data), {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating vehicle QR code:', error);
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  }
};

// Generate QR code for daily help
export const generateDailyHelpQRCode = async (name, type = '') => {
  try {
    const data = {
      name: name,
      type: type,
      type_category: 'daily_help',
      timestamp: new Date().toISOString(),
      code: generateEntryCode()
    };
    
    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(data), {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating daily help QR code:', error);
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  }
};

// Generate QR code for frequent entries
export const generateFrequentEntryQRCode = async (name, relation = '') => {
  try {
    const data = {
      name: name,
      relation: relation,
      type: 'frequent_entry',
      timestamp: new Date().toISOString(),
      code: generateEntryCode()
    };
    
    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(data), {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating frequent entry QR code:', error);
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  }
}; 