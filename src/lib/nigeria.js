export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'FCT (Abuja)', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina',
  'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo',
  'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
];

// Maps Nominatim's state names to our canonical list
const STATE_ALIASES = {
  'abuja': 'FCT (Abuja)',
  'federal capital territory': 'FCT (Abuja)',
  'fct': 'FCT (Abuja)',
  'cross river state': 'Cross River',
  'akwa ibom state': 'Akwa Ibom',
};

export function normalizeState(raw) {
  if (!raw) return null;
  const lower = raw.toLowerCase().replace(' state', '').trim();
  if (STATE_ALIASES[lower]) return STATE_ALIASES[lower];
  return NIGERIAN_STATES.find((s) => s.toLowerCase() === lower) ?? null;
}
