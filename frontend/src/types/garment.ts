/** Garment categories available across the system. */
export enum GarmentCategory {
  TOP = 'TOP',
  BOTTOM = 'BOTTOM',
  DRESS = 'DRESS',
  OUTERWEAR = 'OUTERWEAR',
  TRADITIONAL = 'TRADITIONAL',
  ACCESSORY = 'ACCESSORY',
}

/** Stored garment metadata. */
export interface Garment {
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly category: GarmentCategory;
  readonly imageUrl: string;
  readonly thumbnailUrl: string;
  /** Optional path to a .glb / .gltf 3-D model (e.g. '/clothes/models/oxford_shirt.glb').
   *  When present, the AR view renders the 3-D model instead of the flat 2-D image. */
  readonly modelUrl?: string | null;
  readonly isCustomDesign: boolean;
  readonly designData: Record<string, unknown> | null;
  readonly brand: string | null;
  readonly fileType?: '2D' | '3D';
  readonly uploadedBy?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** Upload payload for a garment. */
export interface GarmentUploadPayload {
  readonly file: File;
  readonly name: string;
  readonly category: GarmentCategory;
  readonly brand?: string;
}

/** Filters applied to garment lists. */
export interface GarmentFilter {
  readonly category?: GarmentCategory | 'ALL';
  readonly query?: string;
  readonly isCustomDesign?: boolean;
}
