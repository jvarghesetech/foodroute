import type { BuildingSpecification } from '@/lib/editor/types/buildingSpec';

export type RoomTypeId =
  | 'patient_room'
  | 'operating_room'
  | 'emergency_room'
  | 'trauma_room'
  | 'ambulance_bay';

export interface FurnitureTemplate {
  label: string;
  relativeX: number;
  relativeZ: number;
  width: number;
  depth: number;
  height: number;
  color: string;
}

export interface RoomTypeDefinition {
  id: RoomTypeId;
  label: string;
  shortLabel: string;
  description: string;
  unitWidth: number;
  unitDepth: number;
  floorColor: string;
  wallColor: string;
  priority: number;
  groundFloorOnly: boolean;
  furnitureVariants: FurnitureTemplate[][];
  getCount: (spec: BuildingSpecification) => number;
}

// ── Ambulance Bay variants ──────────────────────────────────────────────────
// Each variant has a special "Ambulance" item rendered as a 3D model in FloorPlanView
const AMBULANCE_VARIANTS: FurnitureTemplate[][] = [
  [
    { label: 'Delivery Van', relativeX: 1.25, relativeZ: 0.75, width: 2.5, depth: 3.5, height: 1.0, color: '#ffffff' },
    { label: 'Supply Shelf', relativeX: 0.15, relativeZ: 0.2, width: 0.55, depth: 0.35, height: 0.75, color: '#c4b5fd' },
    { label: 'Cone', relativeX: 4.4, relativeZ: 0.25, width: 0.25, depth: 0.25, height: 0.35, color: '#fb923c' },
    { label: 'Cone', relativeX: 4.4, relativeZ: 4.4, width: 0.25, depth: 0.25, height: 0.35, color: '#fb923c' },
  ],
  [
    { label: 'Delivery Van', relativeX: 1.25, relativeZ: 0.75, width: 2.5, depth: 3.5, height: 1.0, color: '#ffffff' },
    { label: 'Label Printer', relativeX: 0.15, relativeZ: 2.0, width: 0.35, depth: 0.3, height: 0.55, color: '#f87171' },
    { label: 'Propane Tank', relativeX: 4.5, relativeZ: 2.5, width: 0.2, depth: 0.2, height: 0.7, color: '#5eead4' },
    { label: 'Supply Shelf', relativeX: 0.15, relativeZ: 4.2, width: 0.7, depth: 0.35, height: 0.7, color: '#c4b5fd' },
  ],
  [
    { label: 'Delivery Van', relativeX: 1.25, relativeZ: 0.75, width: 2.5, depth: 3.5, height: 1.0, color: '#ffffff' },
    { label: 'Cart Rack', relativeX: 0.1, relativeZ: 0.3, width: 0.65, depth: 1.6, height: 0.45, color: '#d4d4d8' },
    { label: 'Tool Box', relativeX: 4.2, relativeZ: 1.0, width: 0.5, depth: 0.4, height: 0.35, color: '#fcd34d' },
    { label: 'First Aid Kit', relativeX: 4.3, relativeZ: 3.5, width: 0.35, depth: 0.25, height: 0.25, color: '#f87171' },
  ],
  [
    { label: 'Delivery Van', relativeX: 1.25, relativeZ: 0.75, width: 2.5, depth: 3.5, height: 1.0, color: '#ffffff' },
    { label: 'Medical Cart', relativeX: 0.15, relativeZ: 1.5, width: 0.5, depth: 0.55, height: 0.75, color: '#c4b5fd' },
    { label: 'Fire Extinguisher', relativeX: 4.55, relativeZ: 0.2, width: 0.2, depth: 0.2, height: 0.55, color: '#ef4444' },
    { label: 'Cone', relativeX: 0.2, relativeZ: 4.4, width: 0.25, depth: 0.25, height: 0.35, color: '#fb923c' },
    { label: 'Cone', relativeX: 4.4, relativeZ: 4.4, width: 0.25, depth: 0.25, height: 0.35, color: '#fb923c' },
  ],
  [
    { label: 'Delivery Van', relativeX: 1.25, relativeZ: 0.75, width: 2.5, depth: 3.5, height: 1.0, color: '#ffffff' },
    { label: 'Supply Locker', relativeX: 0.1, relativeZ: 3.5, width: 0.7, depth: 0.55, height: 1.1, color: '#94a3b8' },
    { label: 'Wheelchair', relativeX: 4.1, relativeZ: 2.0, width: 0.55, depth: 0.55, height: 0.65, color: '#9ca3af' },
    { label: 'First Aid Station', relativeX: 4.1, relativeZ: 4.0, width: 0.5, depth: 0.4, height: 0.45, color: '#f87171' },
  ],
];

// ── Emergency Room variants ─────────────────────────────────────────────────
const EMERGENCY_VARIANTS: FurnitureTemplate[][] = [
  [
    { label: 'Pallet Cart', relativeX: 1.5, relativeZ: 1.0, width: 0.7, depth: 1.8, height: 0.5, color: '#f87171' },
    { label: 'Scale', relativeX: 0.25, relativeZ: 0.25, width: 0.3, depth: 0.25, height: 1.0, color: '#6ee7b7' },
    { label: 'Supply Cabinet', relativeX: 4.0, relativeZ: 4.0, width: 0.5, depth: 0.45, height: 0.8, color: '#c4b5fd' },
    { label: 'IV Stand', relativeX: 2.8, relativeZ: 0.8, width: 0.15, depth: 0.15, height: 1.3, color: '#d4d4d8' },
  ],
  [
    { label: 'Pallet Cart', relativeX: 1.5, relativeZ: 1.0, width: 0.7, depth: 1.8, height: 0.5, color: '#f87171' },
    { label: 'Digital Scale', relativeX: 0.25, relativeZ: 0.25, width: 0.35, depth: 0.3, height: 1.1, color: '#6ee7b7' },
    { label: 'Supply Cart', relativeX: 4.0, relativeZ: 1.5, width: 0.5, depth: 0.55, height: 0.8, color: '#f87171' },
    { label: 'Sealer Unit', relativeX: 4.0, relativeZ: 3.5, width: 0.3, depth: 0.3, height: 0.65, color: '#d4d4d8' },
  ],
  [
    { label: 'Pallet Rack', relativeX: 1.2, relativeZ: 1.0, width: 0.9, depth: 2.0, height: 0.55, color: '#93c5fd' },
    { label: 'Scale', relativeX: 0.25, relativeZ: 0.3, width: 0.3, depth: 0.25, height: 1.0, color: '#6ee7b7' },
    { label: 'Scale', relativeX: 0.25, relativeZ: 2.5, width: 0.3, depth: 0.25, height: 1.0, color: '#6ee7b7' },
    { label: 'Distribution Cart', relativeX: 3.8, relativeZ: 2.0, width: 0.5, depth: 0.55, height: 0.75, color: '#c4b5fd' },
    { label: 'Chair', relativeX: 3.5, relativeZ: 4.0, width: 0.5, depth: 0.5, height: 0.45, color: '#fcd34d' },
  ],
  [
    { label: 'Pallet Cart', relativeX: 1.5, relativeZ: 1.2, width: 0.7, depth: 1.8, height: 0.5, color: '#f87171' },
    { label: 'Overhead Light', relativeX: 1.8, relativeZ: 1.8, width: 0.55, depth: 0.55, height: 0.08, color: '#fef08a' },
    { label: 'Sorting Tray', relativeX: 3.5, relativeZ: 1.5, width: 0.5, depth: 0.7, height: 0.7, color: '#a5b4fc' },
    { label: 'Scale', relativeX: 0.25, relativeZ: 0.4, width: 0.3, depth: 0.25, height: 1.0, color: '#6ee7b7' },
    { label: 'Recycling Bin', relativeX: 4.3, relativeZ: 4.3, width: 0.25, depth: 0.2, height: 0.35, color: '#fcd34d' },
  ],
  [
    { label: 'Pallet Rack', relativeX: 1.2, relativeZ: 1.2, width: 0.9, depth: 2.0, height: 0.55, color: '#93c5fd' },
    { label: 'Computer Desk', relativeX: 3.8, relativeZ: 0.25, width: 0.7, depth: 0.5, height: 0.7, color: '#a5b4fc' },
    { label: 'Supply Rack', relativeX: 0.15, relativeZ: 4.0, width: 0.55, depth: 0.4, height: 0.75, color: '#c4b5fd' },
    { label: 'Scale', relativeX: 0.25, relativeZ: 0.3, width: 0.3, depth: 0.25, height: 1.0, color: '#6ee7b7' },
    { label: 'Stool', relativeX: 3.5, relativeZ: 2.2, width: 0.35, depth: 0.35, height: 0.4, color: '#d4d4d8' },
  ],
];

// ── Trauma Room variants ────────────────────────────────────────────────────
const TRAUMA_VARIANTS: FurnitureTemplate[][] = [
  [
    { label: 'Intake Desk', relativeX: 1.5, relativeZ: 1.0, width: 0.9, depth: 2.0, height: 0.55, color: '#f87171' },
    { label: 'Supply Cart', relativeX: 0.2, relativeZ: 0.4, width: 0.5, depth: 0.55, height: 0.75, color: '#c4b5fd' },
    { label: 'Scale Bank', relativeX: 1.3, relativeZ: 4.3, width: 0.8, depth: 0.25, height: 1.0, color: '#6ee7b7' },
    { label: 'Sink', relativeX: 4.0, relativeZ: 4.1, width: 0.45, depth: 0.4, height: 0.8, color: '#a5f3fc' },
  ],
  [
    { label: 'Intake Desk', relativeX: 1.5, relativeZ: 1.0, width: 0.9, depth: 2.0, height: 0.55, color: '#f87171' },
    { label: 'Overhead Light', relativeX: 1.8, relativeZ: 1.8, width: 0.55, depth: 0.55, height: 0.08, color: '#fef08a' },
    { label: 'Sorting Tray', relativeX: 3.5, relativeZ: 1.5, width: 0.5, depth: 0.7, height: 0.7, color: '#a5b4fc' },
    { label: 'Scale', relativeX: 0.25, relativeZ: 0.35, width: 0.3, depth: 0.25, height: 1.0, color: '#6ee7b7' },
    { label: 'Supply Cart', relativeX: 3.8, relativeZ: 3.5, width: 0.5, depth: 0.55, height: 0.75, color: '#c4b5fd' },
  ],
  [
    { label: 'Intake Desk', relativeX: 1.5, relativeZ: 1.0, width: 0.9, depth: 2.0, height: 0.55, color: '#f87171' },
    { label: 'Label Printer', relativeX: 0.2, relativeZ: 3.0, width: 0.35, depth: 0.3, height: 0.55, color: '#f87171' },
    { label: 'IV Stand', relativeX: 2.8, relativeZ: 0.5, width: 0.15, depth: 0.15, height: 1.3, color: '#d4d4d8' },
    { label: 'Air Fan', relativeX: 3.8, relativeZ: 2.0, width: 0.4, depth: 0.4, height: 0.9, color: '#d4d4d8' },
    { label: 'Scale', relativeX: 0.25, relativeZ: 0.3, width: 0.3, depth: 0.25, height: 1.0, color: '#6ee7b7' },
  ],
  [
    { label: 'Intake Desk', relativeX: 1.5, relativeZ: 1.0, width: 0.9, depth: 2.0, height: 0.55, color: '#f87171' },
    { label: 'Inventory Board', relativeX: 4.0, relativeZ: 0.2, width: 0.5, depth: 0.1, height: 0.6, color: '#e0e7ff' },
    { label: 'Shelving Rack', relativeX: 0.15, relativeZ: 3.5, width: 0.4, depth: 0.3, height: 0.8, color: '#c4b5fd' },
    { label: 'Scale', relativeX: 0.25, relativeZ: 0.35, width: 0.3, depth: 0.25, height: 1.0, color: '#6ee7b7' },
    { label: 'Sink', relativeX: 4.0, relativeZ: 4.1, width: 0.45, depth: 0.4, height: 0.8, color: '#a5f3fc' },
  ],
  [
    { label: 'Intake Desk', relativeX: 1.5, relativeZ: 1.0, width: 0.9, depth: 2.0, height: 0.55, color: '#f87171' },
    { label: 'Water Cooler', relativeX: 0.2, relativeZ: 2.5, width: 0.35, depth: 0.35, height: 0.7, color: '#fdba74' },
    { label: 'Scale Bank', relativeX: 1.3, relativeZ: 4.3, width: 0.8, depth: 0.25, height: 1.0, color: '#6ee7b7' },
    { label: 'Packing Cart', relativeX: 3.8, relativeZ: 2.5, width: 0.5, depth: 0.5, height: 0.7, color: '#c4b5fd' },
    { label: 'Sink', relativeX: 4.0, relativeZ: 4.1, width: 0.45, depth: 0.4, height: 0.8, color: '#a5f3fc' },
  ],
];

// ── Operating Room variants ─────────────────────────────────────────────────
const OPERATING_VARIANTS: FurnitureTemplate[][] = [
  [
    { label: 'Cold Storage Rack', relativeX: 1.5, relativeZ: 1.2, width: 0.7, depth: 1.9, height: 0.85, color: '#93c5fd' },
    { label: 'Supply Cart', relativeX: 0.2, relativeZ: 0.4, width: 0.5, depth: 0.55, height: 0.75, color: '#c4b5fd' },
    { label: 'Sorting Table', relativeX: 3.8, relativeZ: 2.0, width: 0.5, depth: 0.8, height: 0.75, color: '#a5b4fc' },
    { label: 'Packing Station', relativeX: 0.2, relativeZ: 3.8, width: 0.55, depth: 0.5, height: 0.95, color: '#fdba74' },
    { label: 'Overhead Light', relativeX: 1.7, relativeZ: 1.8, width: 0.6, depth: 0.6, height: 0.08, color: '#fef08a' },
  ],
  [
    { label: 'Cold Storage Rack', relativeX: 1.5, relativeZ: 1.2, width: 0.7, depth: 1.9, height: 0.85, color: '#93c5fd' },
    { label: 'Scale Tower', relativeX: 0.2, relativeZ: 0.3, width: 0.4, depth: 0.4, height: 1.2, color: '#6ee7b7' },
    { label: 'Sorting Table', relativeX: 3.8, relativeZ: 2.0, width: 0.5, depth: 0.8, height: 0.75, color: '#a5b4fc' },
    { label: 'Packing Station', relativeX: 0.2, relativeZ: 3.8, width: 0.55, depth: 0.5, height: 0.95, color: '#fdba74' },
    { label: 'Overhead Light', relativeX: 1.7, relativeZ: 1.8, width: 0.6, depth: 0.6, height: 0.08, color: '#fef08a' },
  ],
  [
    { label: 'Cold Storage Rack', relativeX: 1.5, relativeZ: 1.2, width: 0.7, depth: 1.9, height: 0.85, color: '#93c5fd' },
    { label: 'Conveyor Unit', relativeX: 0.15, relativeZ: 2.2, width: 0.6, depth: 0.5, height: 1.0, color: '#d4d4d8' },
    { label: 'Sorting Tray', relativeX: 3.8, relativeZ: 1.5, width: 0.5, depth: 0.7, height: 0.7, color: '#a5b4fc' },
    { label: 'Overhead Light', relativeX: 1.7, relativeZ: 1.8, width: 0.6, depth: 0.6, height: 0.08, color: '#fef08a' },
    { label: 'Scale', relativeX: 3.8, relativeZ: 4.0, width: 0.3, depth: 0.25, height: 1.0, color: '#6ee7b7' },
  ],
  [
    { label: 'Cold Storage Rack', relativeX: 1.5, relativeZ: 1.2, width: 0.7, depth: 1.9, height: 0.85, color: '#93c5fd' },
    { label: 'Barcode Scanner', relativeX: 3.5, relativeZ: 0.3, width: 0.5, depth: 0.5, height: 0.9, color: '#d4d4d8' },
    { label: 'Sorting Table', relativeX: 0.2, relativeZ: 3.0, width: 0.5, depth: 0.8, height: 0.75, color: '#a5b4fc' },
    { label: 'Storage Rack', relativeX: 4.0, relativeZ: 3.5, width: 0.5, depth: 0.4, height: 0.8, color: '#c4b5fd' },
    { label: 'Overhead Light', relativeX: 1.7, relativeZ: 1.8, width: 0.6, depth: 0.6, height: 0.08, color: '#fef08a' },
  ],
  [
    { label: 'Cold Storage Rack', relativeX: 1.5, relativeZ: 1.2, width: 0.7, depth: 1.9, height: 0.85, color: '#93c5fd' },
    { label: 'Label Printer', relativeX: 3.5, relativeZ: 0.4, width: 0.3, depth: 0.3, height: 0.8, color: '#d4d4d8' },
    { label: 'Sorting Table', relativeX: 0.2, relativeZ: 2.5, width: 0.5, depth: 0.8, height: 0.75, color: '#a5b4fc' },
    { label: 'Packing Station', relativeX: 0.2, relativeZ: 3.8, width: 0.55, depth: 0.5, height: 0.95, color: '#fdba74' },
    { label: 'Overhead Light', relativeX: 1.7, relativeZ: 1.8, width: 0.6, depth: 0.6, height: 0.08, color: '#fef08a' },
    { label: 'Scale', relativeX: 3.8, relativeZ: 3.5, width: 0.3, depth: 0.25, height: 1.0, color: '#6ee7b7' },
  ],
];

// ── Patient Room variants ───────────────────────────────────────────────────
const PATIENT_VARIANTS: FurnitureTemplate[][] = [
  [
    { label: 'Pallet Rack', relativeX: 1.0, relativeZ: 1.5, width: 0.9, depth: 2.0, height: 0.55, color: '#93c5fd' },
    { label: 'Cabinet', relativeX: 0.15, relativeZ: 1.5, width: 0.5, depth: 0.45, height: 0.8, color: '#c4b5fd' },
    { label: 'Chair', relativeX: 3.5, relativeZ: 4.0, width: 0.5, depth: 0.5, height: 0.45, color: '#fcd34d' },
    { label: 'Scale', relativeX: 0.2, relativeZ: 3.5, width: 0.3, depth: 0.25, height: 1.0, color: '#6ee7b7' },
  ],
  [
    { label: 'Pallet Rack', relativeX: 1.0, relativeZ: 1.5, width: 0.9, depth: 2.0, height: 0.55, color: '#93c5fd' },
    { label: 'Side Shelf', relativeX: 2.4, relativeZ: 1.5, width: 0.4, depth: 0.35, height: 0.55, color: '#c4b5fd' },
    { label: 'Monitor Stand', relativeX: 4.0, relativeZ: 0.25, width: 0.3, depth: 0.25, height: 1.1, color: '#d4d4d8' },
    { label: 'Break Chair', relativeX: 3.2, relativeZ: 3.5, width: 0.6, depth: 0.7, height: 0.5, color: '#fcd34d' },
    { label: 'Scale', relativeX: 0.2, relativeZ: 3.5, width: 0.3, depth: 0.25, height: 1.0, color: '#6ee7b7' },
  ],
  [
    { label: 'Pallet Rack', relativeX: 1.0, relativeZ: 1.5, width: 0.9, depth: 2.0, height: 0.55, color: '#93c5fd' },
    { label: 'Cabinet', relativeX: 0.15, relativeZ: 1.5, width: 0.5, depth: 0.45, height: 0.8, color: '#c4b5fd' },
    { label: 'Scale', relativeX: 0.2, relativeZ: 3.5, width: 0.3, depth: 0.25, height: 1.0, color: '#6ee7b7' },
    { label: 'IV Stand', relativeX: 2.4, relativeZ: 1.0, width: 0.15, depth: 0.15, height: 1.3, color: '#d4d4d8' },
    { label: 'Side Table', relativeX: 3.5, relativeZ: 2.5, width: 0.5, depth: 0.4, height: 0.6, color: '#a5b4fc' },
  ],
  [
    { label: 'Pallet Rack', relativeX: 1.0, relativeZ: 1.5, width: 0.9, depth: 2.0, height: 0.55, color: '#93c5fd' },
    { label: 'Desk', relativeX: 3.5, relativeZ: 0.2, width: 0.7, depth: 0.5, height: 0.7, color: '#a5b4fc' },
    { label: 'Locker', relativeX: 4.0, relativeZ: 3.0, width: 0.6, depth: 0.45, height: 1.0, color: '#c4b5fd' },
    { label: 'Scale', relativeX: 0.2, relativeZ: 3.5, width: 0.3, depth: 0.25, height: 1.0, color: '#6ee7b7' },
    { label: 'Chair', relativeX: 3.5, relativeZ: 4.2, width: 0.5, depth: 0.5, height: 0.45, color: '#fcd34d' },
  ],
  [
    { label: 'Pallet Rack', relativeX: 1.0, relativeZ: 1.5, width: 0.9, depth: 2.0, height: 0.55, color: '#93c5fd' },
    { label: 'Small Bin', relativeX: 3.0, relativeZ: 1.8, width: 0.45, depth: 0.7, height: 0.6, color: '#fde68a' },
    { label: 'Chair', relativeX: 3.5, relativeZ: 3.8, width: 0.5, depth: 0.5, height: 0.45, color: '#fcd34d' },
    { label: 'Cabinet', relativeX: 0.15, relativeZ: 1.5, width: 0.5, depth: 0.45, height: 0.8, color: '#c4b5fd' },
    { label: 'Scale', relativeX: 0.2, relativeZ: 3.5, width: 0.3, depth: 0.25, height: 1.0, color: '#6ee7b7' },
  ],
];

// ─────────────────────────────────────────────────────────────────────────────

export const ROOM_TYPES: RoomTypeDefinition[] = [
  {
    id: 'ambulance_bay',
    label: 'Delivery Bays',
    shortLabel: 'Delivery',
    description: 'Ground-floor vehicle bays for food delivery and pickup',
    unitWidth: 5,
    unitDepth: 5,
    floorColor: '#fafaf9',
    wallColor: '#d6d3d1',
    priority: 0,
    groundFloorOnly: true,
    furnitureVariants: AMBULANCE_VARIANTS,
    getCount: (spec) => spec.hospitalAmbulances ?? 0,
  },
  {
    id: 'emergency_room',
    label: 'Distribution Rooms',
    shortLabel: 'Dist',
    description: 'Client distribution counters for hamper pickup and assembly',
    unitWidth: 5,
    unitDepth: 5,
    floorColor: '#fff5f5',
    wallColor: '#d1d5db',
    priority: 1,
    groundFloorOnly: true,
    furnitureVariants: EMERGENCY_VARIANTS,
    getCount: (spec) => spec.hospitalEmergencyBays ?? 0,
  },
  {
    id: 'trauma_room',
    label: 'Intake Rooms',
    shortLabel: 'Intake',
    description: 'Registration and intake rooms for client processing',
    unitWidth: 5,
    unitDepth: 5,
    floorColor: '#fffbf0',
    wallColor: '#b8b2a8',
    priority: 2,
    groundFloorOnly: true,
    furnitureVariants: TRAUMA_VARIANTS,
    getCount: (spec) => spec.hospitalTraumaRooms ?? 0,
  },
  {
    id: 'operating_room',
    label: 'Cold Storage Rooms',
    shortLabel: 'Cold',
    description: 'Refrigerated storage for perishable food items',
    unitWidth: 5,
    unitDepth: 5,
    floorColor: '#f0fdf4',
    wallColor: '#9ca3af',
    priority: 3,
    groundFloorOnly: false,
    furnitureVariants: OPERATING_VARIANTS,
    getCount: (spec) => spec.hospitalOperatingRooms ?? 0,
  },
  {
    id: 'patient_room',
    label: 'Storage Rooms',
    shortLabel: 'Storage',
    description: 'Pallet storage rooms for non-perishable food inventory',
    unitWidth: 5,
    unitDepth: 5,
    floorColor: '#f5f8fc',
    wallColor: '#b0bec5',
    priority: 4,
    groundFloorOnly: false,
    furnitureVariants: PATIENT_VARIANTS,
    getCount: (spec) => spec.hospitalRooms ?? 0,
  },
];
