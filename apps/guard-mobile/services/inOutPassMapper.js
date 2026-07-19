const defaultVisitorImage = require('../assets/images/visitor1.png');

const parseDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDuration = (milliseconds) => {
  const diffMs = Math.max(0, milliseconds);
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours}hr${minutes > 0 ? ` ${minutes}min` : ''}`;
  }

  if (minutes > 0) {
    return `${minutes}min`;
  }

  return 'Just now';
};

const formatName = (text) => {
  const value = String(text || '').trim();
  if (!value) return '';
  return value
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getUnitLabel = (pass) => {
  const block = pass?.units?.block;
  const number = pass?.units?.number;
  const unitNumber = pass?.units?.unit_number;

  if (block && number) {
    return `${block}-${number}`;
  }

  if (unitNumber) {
    return String(unitNumber);
  }

  return 'N/A';
};

const getVisitorTypeLabel = (pass) => {
  return formatName(pass?.visitor_type || 'guest');
};

const getDurationInside = (pass) => {
  const start =
    parseDate(pass?.actual_entry_time) ||
    parseDate(pass?.checked_in_at) ||
    parseDate(pass?.from_date);

  if (!start) {
    return 'N/A';
  }

  return formatDuration(Date.now() - start.getTime());
};

const getVisitDuration = (pass) => {
  const start =
    parseDate(pass?.actual_entry_time) ||
    parseDate(pass?.checked_in_at) ||
    parseDate(pass?.from_date);
  const end =
    parseDate(pass?.actual_exit_time) ||
    parseDate(pass?.checked_out_at) ||
    parseDate(pass?.to_date);

  if (!start || !end) {
    return 'N/A';
  }

  return formatDuration(end.getTime() - start.getTime());
};

const formatTime = (value) => {
  const date = parseDate(value);
  if (!date) return null;
  return date.toLocaleTimeString();
};

export const mapPassToInOutItem = (pass, mode = 'checked_in') => {
  const rawStatus = pass?.status || mode;
  const hostName = pass?.host_resident?.full_name || pass?.host_name || 'Unknown Host';
  const hostPhone = pass?.host_resident?.phone || pass?.host_phone || null;
  const actualExitValue = pass?.actual_exit_time || pass?.checked_out_at || null;
  const status = actualExitValue && rawStatus === 'checked_in' ? 'checked_out' : rawStatus;

  return {
    key: pass.id,
    image: defaultVisitorImage,
    name: pass?.visitor_name || 'Unknown Visitor',
    block: getUnitLabel(pass),
    other1: getVisitorTypeLabel(pass),
    other2: mode === 'checked_out' ? getVisitDuration(pass) : getDurationInside(pass),
    phoneNumber: pass?.visitor_phone || '-',
    hostName,
    hostPhone,
    flatNo: getUnitLabel(pass),
    entryTime: formatTime(pass?.actual_entry_time || pass?.checked_in_at || pass?.from_date),
    exitTime: mode === 'checked_out' ? formatTime(actualExitValue) : null,
    status,
    vehicleNumber: pass?.vehicle_number || null,
    company: pass?.company_name || null,
    notes: pass?.guard_notes || null,
    serviceType: pass?.service_type || null,
    purpose: pass?.purpose || null,
    passId: pass?.id,
    originalPass: pass,
  };
};

export default mapPassToInOutItem;
