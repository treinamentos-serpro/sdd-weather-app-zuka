const WMO_LABELS: Record<number, string> = {
  0: 'Céu limpo',
  1: 'Predominantemente limpo',
  2: 'Parcialmente nublado',
  3: 'Nublado',
  61: 'Chuva fraca',
  80: 'Pancadas de chuva',
};

const WMO_ICONS: Record<number, string> = {
  0: '☀️',
  1: '🌤️',
  2: '⛅',
  3: '☁️',
  61: '🌧️',
  80: '🌦️',
};

const FALLBACK_LABEL = 'Condição indisponível';
const FALLBACK_ICON = '—';

/** Rótulo textual em pt-BR para um código meteorológico WMO. */
export function getWeatherLabel(weatherCode: number | undefined): string {
  if (weatherCode === undefined) return FALLBACK_LABEL;
  return WMO_LABELS[weatherCode] ?? FALLBACK_LABEL;
}

/** Ícone de clima associado ao código WMO. */
export function getWeatherIcon(weatherCode: number | undefined): string {
  if (weatherCode === undefined) return FALLBACK_ICON;
  return WMO_ICONS[weatherCode] ?? FALLBACK_ICON;
}
