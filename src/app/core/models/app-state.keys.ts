export const STORAGE_PREFIX = 'sftm:v1:';

export const StorageKeys = {
  users: `${STORAGE_PREFIX}users`,
  session: `${STORAGE_PREFIX}session`,
  players: `${STORAGE_PREFIX}players`,
  matchWeeks: `${STORAGE_PREFIX}matchWeeks`,
  settings: `${STORAGE_PREFIX}settings`,
  seeded: `${STORAGE_PREFIX}seeded`,
} as const;