/**
 * When the stored data was last refreshed, for the offline banner and
 * Settings: the time alone if that was today, else the date and time.
 */
export const describeRefreshedAt = (
  refreshedAt: number,
  now: number = Date.now(),
  locale?: string
): string => {
  const then = new Date(refreshedAt);
  const time = then.toLocaleTimeString(locale, {
    hour: 'numeric',
    minute: '2-digit',
  });
  if (then.toDateString() === new Date(now).toDateString()) {
    return time;
  }
  const date = then.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    ...(then.getFullYear() !== new Date(now).getFullYear()
      ? { year: 'numeric' }
      : {}),
  });
  return `${date}, ${time}`;
};
