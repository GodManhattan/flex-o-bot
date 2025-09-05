// utils/timer.ts
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} hour${hours !== 1 ? "s" : ""}`;
  }

  return `${hours}h ${remainingMinutes}m`;
};

export const addMinutesToNow = (minutes: number): Date => {
  const now = new Date();
  return new Date(now.getTime() + minutes * 60 * 1000);
};

export const getMinutesFromNow = (date: Date): number => {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60)));
};
