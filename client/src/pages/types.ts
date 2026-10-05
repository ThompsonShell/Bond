import type { PublicUser } from '../api';

export interface StudyingUser extends PublicUser {
  distanceKm: number | null;
  connected: boolean;
}
