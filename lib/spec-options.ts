export interface SpecOption {
  key: string;
  label: string;
  unit: string;
  type: 'number' | 'text';
}

export const equipmentTypes = [
  { value: 'crane', label: 'Crane', category: 'equipment' },
  { value: 'forklift', label: 'Forklift', category: 'equipment' },
  { value: 'boom_lift', label: 'Boom Lift', category: 'equipment' },
  { value: 'flatbed', label: 'Flatbed', category: 'transport' },
  { value: 'lowbed', label: 'Lowbed', category: 'transport' },
  { value: 'prime_mover', label: 'Prime Mover', category: 'transport' },
];

export const specOptions: Record<string, SpecOption[]> = {
  crane: [
    { key: 'lift_capacity_tons', label: 'Lift Capacity', unit: 'tons', type: 'number' },
    { key: 'boom_length_meters', label: 'Boom Length', unit: 'meters', type: 'number' },
    { key: 'max_radius_meters', label: 'Max Radius', unit: 'meters', type: 'number' },
    { key: 'max_height_meters', label: 'Max Height', unit: 'meters', type: 'number' },
    { key: 'fuel_type', label: 'Fuel Type', unit: '', type: 'text' },
  ],
  forklift: [
    { key: 'lift_capacity_tons', label: 'Lift Capacity', unit: 'tons', type: 'number' },
    { key: 'max_height_meters', label: 'Mast Height', unit: 'meters', type: 'number' },
    { key: 'fuel_type', label: 'Fuel Type', unit: '', type: 'text' },
    { key: 'fork_length_mm', label: 'Fork Length', unit: 'mm', type: 'number' },
  ],
  boom_lift: [
    { key: 'max_height_meters', label: 'Platform Height', unit: 'meters', type: 'number' },
    { key: 'outreach_meters', label: 'Outreach', unit: 'meters', type: 'number' },
    { key: 'boom_length_meters', label: 'Boom Length', unit: 'meters', type: 'number' },
    { key: 'fuel_type', label: 'Fuel Type', unit: '', type: 'text' },
  ],
  flatbed: [
    { key: 'deck_length_ft', label: 'Deck Length', unit: 'ft', type: 'number' },
    { key: 'load_capacity_tons', label: 'Load Capacity', unit: 'tons', type: 'number' },
    { key: 'axle_count', label: 'Axle Count', unit: '', type: 'number' },
    { key: 'deck_height_inches', label: 'Deck Height', unit: 'inches', type: 'number' },
  ],
  lowbed: [
    { key: 'deck_length_ft', label: 'Deck Length', unit: 'ft', type: 'number' },
    { key: 'load_capacity_tons', label: 'Load Capacity', unit: 'tons', type: 'number' },
    { key: 'axle_count', label: 'Axle Count', unit: '', type: 'number' },
    { key: 'deck_height_inches', label: 'Deck Height', unit: 'inches', type: 'number' },
    { key: 'neck_type', label: 'Neck Type', unit: '', type: 'text' },
  ],
  prime_mover: [
    { key: 'horsepower', label: 'Horsepower', unit: 'HP', type: 'number' },
    { key: 'axle_config', label: 'Axle Configuration', unit: '', type: 'text' },
    { key: 'transmission', label: 'Transmission', unit: '', type: 'text' },
    { key: 'load_capacity_tons', label: 'Towing Capacity', unit: 'tons', type: 'number' },
  ],
};

export const specToColumnMap: Record<string, string> = {
  'lift_capacity_tons': 'lift_capacity_tons',
  'boom_length_meters': 'boom_length_meters',
  'deck_length_ft': 'deck_length_ft',
  'load_capacity_tons': 'load_capacity_tons',
  'max_height_meters': 'max_height_meters',
  'axle_count': 'axle_count',
};