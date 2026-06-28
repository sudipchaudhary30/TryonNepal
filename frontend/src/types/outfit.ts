import type { Garment } from './garment';

/** Outfit with garments populated. */
export interface Outfit {
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly previewImageUrl: string | null;
  readonly tags: readonly string[];
  readonly garments: readonly Garment[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** Payload used to create a new outfit. */
export interface OutfitCreatePayload {
  readonly name: string;
  readonly garmentIds: readonly string[];
  readonly tags?: readonly string[];
}
