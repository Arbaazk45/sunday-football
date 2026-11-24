export type AvailabilityStatus = 'available' | 'unavailable' | 'pending';

export interface AvailabilityEntry {
  playerId: string;
  status: AvailabilityStatus;
  updatedAt: string;
  updatedByUserId: string;
}

export const AVAILABILITY_LABELS: Record<AvailabilityStatus, string> = {
  available: 'Available',
  unavailable: 'Not Available',
  pending: 'Not Sure',
};