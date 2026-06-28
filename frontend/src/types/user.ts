/** A full authenticated user record. */
export interface User {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly avatarUrl: string | null;
  readonly age: number | null;
  readonly heightCm: number | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** A compact user profile for lists and avatars. */
export interface UserProfile {
  readonly id: string;
  readonly name: string;
  readonly avatarUrl: string | null;
}

/** Authentication state shared by the UI. */
export interface AuthState {
  readonly user: User | null;
  readonly sessionToken: string | null;
  readonly isAuthenticated: boolean;
}
