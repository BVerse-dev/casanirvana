/**
 * Utility functions for QR Code generation and parsing
 * Used by both user app and guard app for visitor pass QR codes
 */

/**
 * Parse QR code data for visitor pass
 * @param {string} qrData - The QR code data string
 * @returns {object|null} - Parsed visitor pass data or null if invalid
 */
export const parseVisitorPassQR = (qrData) => {
  try {
    // Try to parse as JSON first (new format)
    const parsedData = JSON.parse(qrData);
    
    // Validate that it's a visitor pass QR code
    if (parsedData.type === 'visitor_pass' && parsedData.id) {
      return {
        id: parsedData.id,
        visitor_name: parsedData.visitor_name,
        visitor_phone: parsedData.visitor_phone,
        unit_id: parsedData.unit_id,
        visit_date: parsedData.visit_date,
        from_date: parsedData.from_date,
        to_date: parsedData.to_date,
        created_by: parsedData.created_by,
        created_at: parsedData.created_at,
        purpose: parsedData.purpose || 'Guest Visit',
        type: parsedData.type,
        isValid: true
      };
    }
    
    return null;
  } catch (error) {
    // If JSON parsing fails, treat as legacy format (just visitor name)
    return {
      visitor_name: qrData,
      isLegacyFormat: true,
      isValid: false // Legacy format is not considered valid for gate entry
    };
  }
};

/**
 * Validate if a visitor pass is currently valid for entry
 * @param {object} visitorData - Parsed visitor pass data
 * @returns {object} - Validation result with status and message
 */
export const validateVisitorPass = (visitorData) => {
  if (!visitorData || !visitorData.isValid) {
    return {
      isValid: false,
      status: 'invalid',
      message: 'Invalid QR code format'
    };
  }

  const now = new Date();
  const fromDate = new Date(visitorData.from_date);
  const toDate = new Date(visitorData.to_date);
  const visitDate = new Date(visitorData.visit_date);

  // Check if visit is for today or within date range
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  visitDate.setHours(0, 0, 0, 0);

  if (visitDate.getTime() !== today.getTime()) {
    return {
      isValid: false,
      status: 'expired',
      message: `This pass is for ${visitDate.toDateString()}, not today`
    };
  }

  // Check time range
  if (now < fromDate) {
    return {
      isValid: false,
      status: 'early',
      message: `Visit time starts at ${fromDate.toLocaleTimeString()}`
    };
  }

  if (now > toDate) {
    return {
      isValid: false,
      status: 'expired',
      message: `Visit time ended at ${toDate.toLocaleTimeString()}`
    };
  }

  return {
    isValid: true,
    status: 'valid',
    message: 'Valid visitor pass'
  };
};

/**
 * Format visitor pass data for display
 * @param {object} visitorData - Parsed visitor pass data
 * @returns {object} - Formatted display data
 */
export const formatVisitorDisplayData = (visitorData) => {
  if (!visitorData) return null;

  return {
    visitorName: visitorData.visitor_name,
    visitorPhone: visitorData.visitor_phone,
    unitId: visitorData.unit_id,
    visitDate: new Date(visitorData.visit_date).toLocaleDateString(),
    visitTime: `${new Date(visitorData.from_date).toLocaleTimeString()} - ${new Date(visitorData.to_date).toLocaleTimeString()}`,
    purpose: visitorData.purpose,
    passId: visitorData.id
  };
};
