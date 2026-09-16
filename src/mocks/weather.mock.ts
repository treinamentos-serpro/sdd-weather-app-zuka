import type { WeatherData } from '../types/weather';

/**
 * Fixture de exemplo para desenvolver a UI sem depender da API da Open-Meteo.
 */
export const mockWeatherData: WeatherData = {
  city: {
    id: 3448439,
    name: 'São Paulo',
    country: 'Brasil',
    countryCode: 'BR',
    admin1: 'São Paulo',
    latitude: -23.5475,
    longitude: -46.63611,
    timezone: 'America/Sao_Paulo',
  },
  current: {
    temperatureCelsius: 24.3,
    weatherCode: 2,
    observedAt: '2026-09-16T14:00:00Z',
  },
  forecast: [
    {
      date: '2026-09-16',
      temperatureMinCelsius: 17.2,
      temperatureMaxCelsius: 26.1,
      weatherCode: 2,
      precipitation: 0,
    },
    {
      date: '2026-09-17',
      temperatureMinCelsius: 16.8,
      temperatureMaxCelsius: 24.5,
      weatherCode: 3,
      precipitation: 0,
    },
    {
      date: '2026-09-18',
      temperatureMinCelsius: 15.9,
      temperatureMaxCelsius: 22.7,
      weatherCode: 61,
      precipitation: 2.4,
    },
    {
      date: '2026-09-19',
      temperatureMinCelsius: 14.6,
      temperatureMaxCelsius: 21.3,
      weatherCode: 80,
      precipitation: 4.1,
    },
    {
      date: '2026-09-20',
      temperatureMinCelsius: 16.1,
      temperatureMaxCelsius: 25.0,
      weatherCode: 1,
      precipitation: 0,
    },
  ],
  timezone: 'America/Sao_Paulo',
  fetchedAt: '2026-09-16T14:05:00Z',
  isPartial: false,
};
