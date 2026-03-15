// Warehouse Zone definitions — shared across all WMS modules

export const ZONES = [
  { id: 'A',      label: 'Zone A',       description: 'General Storage',        color: '#00E5FF', locationPrefix: 'A-' },
  { id: 'B',      label: 'Zone B',       description: 'Heavy Goods',            color: '#00CC88', locationPrefix: 'B-' },
  { id: 'C',      label: 'Zone C',       description: 'Small Parts',            color: '#FFD700', locationPrefix: 'C-' },
  { id: 'COLD',   label: 'Cold Zone',    description: 'Temperature Controlled', color: '#7EC8E3', locationPrefix: 'COLD-' },
  { id: 'HAZMAT', label: 'Hazmat Zone',  description: 'Hazardous Materials',    color: '#FF8C42', locationPrefix: 'HAZMAT-' },
  { id: 'BULK',   label: 'Bulk Zone',    description: 'Bulk Storage',           color: '#9B7FFF', locationPrefix: 'BULK-' },
];

export const ZONE_MAP = Object.fromEntries(ZONES.map(z => [z.id, z]));

/** Derive zone id from a location string, e.g. "A-01-1" → "A" */
export function locationToZone(location = '') {
  if (!location) return '';
  const upper = location.toUpperCase();
  if (upper.startsWith('HAZMAT')) return 'HAZMAT';
  if (upper.startsWith('COLD'))   return 'COLD';
  if (upper.startsWith('BULK'))   return 'BULK';
  const prefix = upper.charAt(0);
  return ['A','B','C'].includes(prefix) ? prefix : '';
}

export const ZONE_OPTIONS = [{ id: '', label: 'ทุก Zone' }, ...ZONES];
