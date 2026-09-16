import { formatObservedAt } from '../lib/dateTime';
import { displayTemperature } from '../lib/temperature';
import { getWeatherLabel } from '../lib/weatherCodes';
import type { City, CurrentWeather, Unit } from '../types/weather';

export interface WeatherSummaryProps {
  city: City;
  current: CurrentWeather;
  unit: Unit;
  /** Indica que os dados vêm do cache com mais de 30 minutos. */
  isStale?: boolean;
}

const UNIT_SYMBOL: Record<Unit, string> = {
  celsius: '°C',
  fahrenheit: '°F',
};

const UNAVAILABLE_LABEL = 'Indisponível';

export default function WeatherSummary({
  city,
  current,
  unit,
  isStale = false,
}: WeatherSummaryProps) {
  const temperature = current.temperatureCelsius;
  const hasTemperature = typeof temperature === 'number' && Number.isFinite(temperature);
  const temperatureLabel = hasTemperature
    ? `${displayTemperature(temperature, unit)}${UNIT_SYMBOL[unit]}`
    : UNAVAILABLE_LABEL;
  const conditionLabel = getWeatherLabel(current.weatherCode);
  const updatedLabel = formatObservedAt(current.observedAt, city.timezone);

  return (
    <section
      aria-label="Clima atual"
      className="flex flex-col gap-2 rounded-2xl border border-white/20 bg-white/5 p-6 text-center shadow-glass backdrop-blur-md sm:text-left"
    >
      <header>
        <h2 className="text-xl font-semibold text-white">{city.name}</h2>
        <p className="text-sm text-white/60">{city.country}</p>
      </header>

      <p className="text-5xl font-bold text-white sm:text-6xl">{temperatureLabel}</p>
      <p className="text-lg text-white/80">{conditionLabel}</p>

      <p className="text-sm text-white/50">
        Atualizado às {updatedLabel}
        {isStale && <span className="ml-2 font-medium text-sun">Desatualizado</span>}
      </p>
    </section>
  );
}
