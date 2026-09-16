const UNAVAILABLE_LABEL = 'Indisponível';

/** Rótulo de dia da semana em pt-BR, no timezone informado. */
export function formatDayLabel(date: string, timezone?: string): string {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return UNAVAILABLE_LABEL;
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: timezone,
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  }).format(parsed);
}

/** Data/hora em pt-BR, no timezone informado, para um timestamp ISO. */
export function formatObservedAt(observedAt: string | undefined, timezone?: string): string {
  if (!observedAt) return UNAVAILABLE_LABEL;
  const parsed = new Date(observedAt);
  if (Number.isNaN(parsed.getTime())) return UNAVAILABLE_LABEL;
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed);
}
