import { GarmentCategory } from '@/types/garment';
import type { Garment } from '@/types/garment';
import type { GarmentType } from '@/types/ar';

const sharedMeta = {
  userId: 'demo',
  brand: 'DressMesh Nepal',
  price: null,
  isCustomDesign: false,
  designData: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
} as const;

export const demoGarments: Garment[] = [
  {
    id: 'demo-himalayan-kurta',
    name: 'Himalayan Kurta',
    category: GarmentCategory.TRADITIONAL,
    imageUrl: '/clothes/himalayan_kurta.png',
    thumbnailUrl: '/clothes/himalayan_kurta.png',
    fileType: '2D',
    uploadedBy: 'Heritage Collection',
    ...sharedMeta,
  },
  {
    id: 'demo-daura-suruwal',
    name: 'Daura Suruwal Heritage',
    category: GarmentCategory.TRADITIONAL,
    imageUrl: '/clothes/daura_suruwal.png',
    thumbnailUrl: '/clothes/daura_suruwal.png',
    fileType: '2D',
    uploadedBy: 'Nepal Culture',
    ...sharedMeta,
  },
  {
    id: 'demo-sherwani',
    name: 'Kathmandu Sherwani Elite',
    category: GarmentCategory.TRADITIONAL,
    imageUrl: '/clothes/sherwani.png',
    thumbnailUrl: '/clothes/sherwani.png',
    fileType: '2D',
    uploadedBy: 'Royal Studio',
    ...sharedMeta,
  },
  {
    id: 'demo-dhaka-set',
    name: 'Dhaka Festival Ensemble',
    category: GarmentCategory.DRESS,
    imageUrl: '/clothes/dhaka_set.png',
    thumbnailUrl: '/clothes/dhaka_set.png',
    fileType: '2D',
    uploadedBy: 'Festival Fashion',
    ...sharedMeta,
  },
  {
    id: 'demo-oxford-shirt',
    name: 'Midnight Oxford Shirt',
    category: GarmentCategory.TOP,
    imageUrl: '/clothes/oxford_shirt.png',
    thumbnailUrl: '/clothes/oxford_shirt.png',
    fileType: '2D',
    uploadedBy: 'Modern Wear',
    ...sharedMeta,
  },
  {
    id: 'demo-field-jacket',
    name: 'Peakline Field Jacket',
    category: GarmentCategory.OUTERWEAR,
    imageUrl: '/clothes/field_jacket.png',
    thumbnailUrl: '/clothes/field_jacket.png',
    fileType: '2D',
    uploadedBy: 'Peakline',
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