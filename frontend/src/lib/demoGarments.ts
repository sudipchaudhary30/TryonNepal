import { GarmentCategory } from '@/types/garment';
import type { Garment } from '@/types/garment';
import type { GarmentType } from '@/types/ar';

const sharedMeta = {
  userId: 'demo',
  brand: 'AR TryOn Nepal',
  isCustomDesign: false,
  designData: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
} as const;

export const demoGarments: Garment[] = [
  // ── Traditional ───────────────────────────────────────────────────────────
  {
    id: 'garment-kurta-001',
    name: 'Himalayan Kurta',
    category: GarmentCategory.TRADITIONAL,
    imageUrl: '/clothes/himalayan_kurta.png',
    thumbnailUrl: '/clothes/himalayan_kurta.png',
    fileType: '2D',
    uploadedBy: 'Heritage Collection',
    ...sharedMeta,
  },
  {
    id: 'garment-daura-suruwal-001',
    name: 'Daura Suruwal Heritage',
    category: GarmentCategory.TRADITIONAL,
    imageUrl: '/clothes/daura_suruwal.png',
    thumbnailUrl: '/clothes/daura_suruwal.png',
    fileType: '2D',
    uploadedBy: 'Nepal Culture',
    ...sharedMeta,
  },
  {
    id: 'garment-sherwani-001',
    name: 'Kathmandu Sherwani Elite',
    category: GarmentCategory.TRADITIONAL,
    imageUrl: '/clothes/sherwani.png',
    thumbnailUrl: '/clothes/sherwani.png',
    fileType: '2D',
    uploadedBy: 'Royal Studio',
    ...sharedMeta,
  },

  // ── Outerwear / Jackets ───────────────────────────────────────────────────
  {
    id: 'garment-jacket-001',
    name: 'Peakline Field Jacket',
    category: GarmentCategory.OUTERWEAR,
    imageUrl: '/clothes/field_jacket.png',
    thumbnailUrl: '/clothes/field_jacket.png',
    fileType: '2D',
    uploadedBy: 'Peakline',
    ...sharedMeta,
  },
  {
    id: 'demo-navy-blazer',
    name: 'Kathmandu Navy Blazer',
    category: GarmentCategory.OUTERWEAR,
    imageUrl: '/clothes/navy_blazer.png',
    thumbnailUrl: '/clothes/navy_blazer.png',
    fileType: '2D',
    uploadedBy: 'Modern Wear',
    ...sharedMeta,
  },
  {
    id: 'demo-leather-jacket',
    name: 'Midnight Leather Jacket',
    category: GarmentCategory.OUTERWEAR,
    imageUrl: '/clothes/leather_jacket.png',
    thumbnailUrl: '/clothes/leather_jacket.png',
    fileType: '2D',
    uploadedBy: 'Urban Edge',
    ...sharedMeta,
  },

  // ── Tops ──────────────────────────────────────────────────────────────────
  {
    id: 'garment-shirt-001',
    name: 'Midnight Oxford Shirt',
    category: GarmentCategory.TOP,
    imageUrl: '/clothes/oxford_shirt.png',
    thumbnailUrl: '/clothes/oxford_shirt.png',
    fileType: '2D',
    uploadedBy: 'Modern Wear',
    ...sharedMeta,
  },
  {
    id: 'garment-hoodie-001',
    name: 'Urban Grey Hoodie',
    category: GarmentCategory.TOP,
    imageUrl: '/clothes/hoodie_grey.png',
    thumbnailUrl: '/clothes/hoodie_grey.png',
    modelUrl: '/clothes/models/hoodie.glb',  // 14MB real GLB — kept for 3D demo as requested
    fileType: '3D',
    uploadedBy: 'Street Culture',
    ...sharedMeta,
  },

  // ── Bottoms ───────────────────────────────────────────────────────────────
  {
    id: 'demo-chino-pants',
    name: 'Slim Khaki Chinos',
    category: GarmentCategory.BOTTOM,
    imageUrl: '/clothes/chino_pants.png',
    thumbnailUrl: '/clothes/chino_pants.png',
    fileType: '2D',
    uploadedBy: 'Modern Wear',
    ...sharedMeta,
  },
];


export function isDemoGarment(garmentId: string): boolean {
  return garmentId.startsWith('demo-');
}

export function getGarmentTypeFromCategory(category: GarmentCategory): GarmentType {
  switch (category) {
    case GarmentCategory.BOTTOM:
      return 'lower_body';
    case GarmentCategory.DRESS:
      return 'full_body';
    case GarmentCategory.TRADITIONAL:
      return 'traditional';
    case GarmentCategory.TOP:
    case GarmentCategory.OUTERWEAR:
    case GarmentCategory.ACCESSORY:
    default:
      return 'upper_body';
  }
}