/** A normalized pose landmark in image space. */
export interface NormalizedLandmark {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly visibility?: number;
}

/** Pose landmark array. */
export type PoseLandmarks = readonly NormalizedLandmark[];



/** Runtime state for the AR session. */
export interface ARState {
  readonly isActive: boolean;
  readonly landmarks: PoseLandmarks | null;
  readonly isLoading: boolean;
  readonly error: string | null;
}

/** Result returned from a try-on operation. */
export interface TryOnResult {
  readonly resultImageUrl: string;
  readonly processingTimeMs: number;
}

/** Supported try-on garment placement modes. */
export type GarmentType = 'upper_body' | 'lower_body' | 'full_body' | 'traditional';
