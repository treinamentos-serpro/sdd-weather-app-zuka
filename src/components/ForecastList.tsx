import type { ForecastDay, Unit } from '../types/weather';
import ForecastDayCard from './ForecastDayCard';

export interface ForecastListProps {
  forecast: ForecastDay[];
  unit: Unit;
  isPartial: boolean;
  timezone?: string;
}

export default function ForecastList({ forecast, unit, isPartial, timezone }: ForecastListProps) {
  return (
    <section aria-label="Previsão de 5 dias" className="flex flex-col gap-3">
      {isPartial && (
        <p className="font-medium text-sun" role="status">
          Previsão parcial
        </p>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {forecast.map((day) => (
          <ForecastDayCard key={day.date} day={day} unit={unit} timezone={timezone} />
        ))}
      </div>
    </section>
  );
}
