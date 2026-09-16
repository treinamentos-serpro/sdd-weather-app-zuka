import type { City } from '../types/weather';

export interface SearchResultsProps {
  cities: City[];
  onSelect: (city: City) => Promise<void> | void;
}

export default function SearchResults({ cities, onSelect }: SearchResultsProps) {
  return (
    <section aria-label="Resultados da busca" className="rounded-2xl border border-white/20 bg-white/5 p-4 shadow-glass backdrop-blur-md">
      <h2 className="mb-3 text-lg font-semibold text-white">Resultados</h2>
      <ul className="flex flex-col gap-2">
        {cities.map((city) => {
          const regionLabel = city.admin1 ? ` • ${city.admin1}` : '';
          const description = `${city.name}, ${city.country}${regionLabel}`;

          return (
            <li key={city.id}>
              <button
                type="button"
                onClick={() => onSelect(city)}
                aria-label={description}
                className="flex w-full flex-col items-start gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
              >
                <span className="font-medium">{city.name}</span>
                <span className="text-sm text-white/70">
                  {city.country}
                  {regionLabel}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
