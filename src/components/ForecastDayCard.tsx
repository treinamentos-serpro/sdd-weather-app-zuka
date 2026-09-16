import { formatDayLabel } from '../lib/dateTime';
import { displayTemperature } from '../lib/temperature';
import { getWeatherLabel } from '../lib/weatherCodes';
import type { ForecastDay, Unit } from '../types/weather';

export interface ForecastDayCardProps {
  day: ForecastDay;
  unit: Unit;
  timezone?: string;
}

const UNIT_SYMBOL: Record<Unit, string> = {
  celsius: '°C',
  fahrenheit: '°F',
};

const UNAVAILABLE_LABEL = 'Indisponível';

function formatTemperature(celsius: number | undefined, unit: Unit): string {
  if (typeof celsius !== 'number' || !Number.isFinite(celsius)) return UNAVAILABLE_LABEL;
  return `${displayTemperature(celsius, unit)}${UNIT_SYMBOL[unit]}`;
}

export default function ForecastDayCard({ day, unit, timezone }: ForecastDayCardProps) {
  return (
    <article className="flex min-h-[9rem] flex-col items-center justify-between gap-2 rounded-2xl border border-white/20 bg-white/5 p-4 text-center shadow-glass backdrop-blur-md">
      <p className="text-sm font-medium capitalize text-white/70">
        {formatDayLabel(day.date, timezone)}
      </p>
      <p className="text-sm text-white/80">{getWeatherLabel(day.weatherCode)}</p>
      <p className="text-base font-semibold text-white">
        <span className="sr-only">Máxima </span>
        {formatTemperature(day.temperatureMaxCelsius, unit)}
        <span aria-hidden="true" className="mx-1 text-white/40">
          /
        </span>
        <span className="text-white/60">
          <span className="sr-only">Mínima </span>
          {formatTemperature(day.temperatureMinCelsius, unit)}
        </span>
      </p>
    </article>
  );
}
