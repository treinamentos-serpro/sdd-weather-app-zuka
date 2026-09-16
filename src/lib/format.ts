const WEEKDAY_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'short',
});

export function getShortDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return 'Indisponível';
  return WEEKDAY_FORMATTER.format(parsed).replace('.', '');
}

export function formatDayLabel(index: number, date: string): string {
  if (index === 0) return 'Hoje';
  if (index === 1) return 'Amanhã';
  return getShortDate(date);
}
