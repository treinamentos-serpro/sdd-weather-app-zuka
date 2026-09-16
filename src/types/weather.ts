export type Unit = 'celsius' | 'fahrenheit';

export interface City {
  id: number;
  name: string;
  country: string;
  countryCode?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

export interface CurrentWeather {
  temperatureCelsius?: number;
  weatherCode?: number;
  /** Timestamp ISO 8601 informado pela fonte de dados. */
  observedAt?: string;
}

export interface ForecastDay {
  /** Data no formato YYYY-MM-DD. */
  date: string;
  temperatureMinCelsius?: number;
  temperatureMaxCelsius?: number;
  weatherCode?: number;
  precipitation: number;
}

export interface WeatherData {
  city: City;
  current: CurrentWeather;
  forecast: ForecastDay[];
  timezone: string;
  fetchedAt: string;
  isPartial: boolean;
}
