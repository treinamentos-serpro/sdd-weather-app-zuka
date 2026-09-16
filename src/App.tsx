import { useState } from 'react';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import WeatherSummary from './components/WeatherSummary';
import { mockWeatherData } from './mocks/weather.mock';
import type { Unit } from './types/weather';

type ViewState = 'idle' | 'loading' | 'empty' | 'error' | 'success';

export default function App() {
  const [unit, setUnit] = useState<Unit>('celsius');
  const [viewState, setViewState] = useState<ViewState>('idle');
  const [lastQuery, setLastQuery] = useState('');

  const runSearch = (query: string) => {
    setLastQuery(query);
    setViewState('loading');

    const normalized = query.trim().toLowerCase();
    window.setTimeout(() => {
      if (normalized === 'erro') {
        setViewState('error');
      } else if (normalized.includes(mockWeatherData.city.name.toLowerCase())) {
        setViewState('success');
      } else {
        setViewState('empty');
      }
    }, 400);
  };

  const handleRetry = () => runSearch(lastQuery);

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <h1 className="text-2xl font-bold text-white">SDD Weather</h1>
        <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
          <SearchBar onSearch={runSearch} disabled={viewState === 'loading'} />
          <UnitToggle unit={unit} onChange={setUnit} />
        </div>
      </header>

      <main className="flex flex-col gap-6">
        {viewState === 'idle' && (
          <EmptyState
            title="Busque uma cidade"
            hint="Digite o nome de uma cidade para ver o clima atual e a previsão de 5 dias."
          />
        )}
        {viewState === 'loading' && <LoadingState message="Buscando o clima..." />}
        {viewState === 'empty' && (
          <EmptyState title="Nenhum resultado encontrado" hint="Tente buscar outra cidade." />
        )}
        {viewState === 'error' && (
          <ErrorState message="Não foi possível carregar o clima." onRetry={handleRetry} />
        )}
        {viewState === 'success' && (
          <>
            <WeatherSummary
              city={mockWeatherData.city}
              current={mockWeatherData.current}
              unit={unit}
            />
            <ForecastList
              forecast={mockWeatherData.forecast}
              unit={unit}
              isPartial={mockWeatherData.isPartial}
              timezone={mockWeatherData.timezone}
            />
          </>
        )}
      </main>
    </div>
  );
}
