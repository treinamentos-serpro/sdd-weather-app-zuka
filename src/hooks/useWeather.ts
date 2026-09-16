import { useCallback, useRef, useState } from 'react';
import { getWeather, searchCities, WeatherServiceError } from '../services/weatherService';
import type { City, WeatherData } from '../types/weather';

export type WeatherStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';

const UNKNOWN_ERROR_MESSAGE = 'Não foi possível carregar o clima. Tente novamente.';

function toErrorMessage(error: unknown): string {
  return error instanceof WeatherServiceError ? error.message : UNKNOWN_ERROR_MESSAGE;
}

export interface UseWeatherResult {
  status: WeatherStatus;
  data?: WeatherData;
  cities: City[];
  error?: string;
  query: string;
  search: (name: string) => Promise<void>;
  selectCity: (city: City) => Promise<void>;
  retry: () => Promise<void>;
}

/** Orquestra busca de cidades e carregamento do clima da jornada principal. */
export function useWeather(): UseWeatherResult {
  const [status, setStatus] = useState<WeatherStatus>('idle');
  const [data, setData] = useState<WeatherData | undefined>(undefined);
  const [cities, setCities] = useState<City[]>([]);
  const [error, setError] = useState<string | undefined>(undefined);
  const [query, setQuery] = useState('');
  const lastActionRef = useRef<() => Promise<void>>(async () => {});

  const selectCity = useCallback(async (city: City) => {
    lastActionRef.current = () => selectCity(city);
    setStatus('loading');
    setError(undefined);

    try {
      const weather = await getWeather(city);
      setData(weather);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(toErrorMessage(err));
    }
  }, []);

  const search = useCallback(async (name: string) => {
    lastActionRef.current = () => search(name);
    setQuery(name);
    setError(undefined);

    if (!name.trim()) {
      setStatus('idle');
      setCities([]);
      setData(undefined);
      return;
    }

    setStatus('loading');

    try {
      const results = await searchCities(name);
      setCities(results);

      if (results.length === 0) {
        setData(undefined);
        setStatus('empty');
        return;
      }

      setData(undefined);
      setStatus('idle');
    } catch (err) {
      setStatus('error');
      setError(toErrorMessage(err));
    }
  }, []);

  const retry = useCallback(async () => {
    await lastActionRef.current();
  }, []);

  return { status, data, cities, error, query, search, selectCity, retry };
}
