import { useState } from 'react';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import WeatherSummary from './components/WeatherSummary';
import { useWeather } from './hooks/useWeather';
import type { Unit } from './types/weather';

export default function App() {
  const [unit, setUnit] = useState<Unit>('celsius');
  const { status, data, error, search, retry } = useWeather();

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <h1 className="text-2xl font-bold text-white">SDD Weather</h1>
        <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
          <SearchBar onSearch={search} disabled={status === 'loading'} />
          <UnitToggle unit={unit} onChange={setUnit} />
        </div>
      </header>

      <main className="flex flex-col gap-6">
        {status === 'idle' && (
          <EmptyState
            title="Busque uma cidade"
            hint="Digite o nome de uma cidade para ver o clima atual e a previsão de 5 dias."
          />
        )}
        {status === 'loading' && <LoadingState message="Buscando o clima..." />}
        {status === 'empty' && (
          <EmptyState title="Nenhuma cidade encontrada" hint="Tente buscar outra cidade." />
        )}
        {status === 'error' && (
          <ErrorState message={error ?? 'Não foi possível carregar o clima.'} onRetry={retry} />
        )}
        {status === 'success' && data && (
          <>
            <WeatherSummary city={data.city} current={data.current} unit={unit} />
            <ForecastList
              forecast={data.forecast}
              unit={unit}
              isPartial={data.isPartial}
              timezone={data.timezone}
            />
          </>
        )}
      </main>
    </div>
  );
}
