import type { City, CurrentWeather, ForecastDay, WeatherData } from '../types/weather';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

/** Erro lançado quando a Open-Meteo responde com falha ou dados inválidos. */
export class WeatherServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WeatherServiceError';
  }
}

const REQUEST_TIMEOUT_MS = 10_000;

/** Executa `fetch` com timeout de 10s, convertendo abort/rede em `WeatherServiceError`. */
async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, { signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new WeatherServiceError('A requisição demorou demais.');
    }
    throw new WeatherServiceError('Falha de rede.');
  } finally {
    clearTimeout(timeoutId);
  }
}

/** Faz o parse do corpo JSON, convertendo falhas em `WeatherServiceError`. */
async function parseJson<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    throw new WeatherServiceError('Resposta inválida da API.');
  }
}

interface GeocodingResult {
  id: number;
  name: string;
  country: string;
  country_code?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

interface GeocodingResponse {
  results?: GeocodingResult[];
}

function mapResultToCity(result: GeocodingResult): City {
  return {
    id: result.id,
    name: result.name,
    country: result.country,
    countryCode: result.country_code,
    admin1: result.admin1,
    latitude: result.latitude,
    longitude: result.longitude,
    timezone: result.timezone,
  };
}

/** Busca cidades pelo endpoint de geocoding da Open-Meteo. */
export async function searchCities(name: string): Promise<City[]> {
  if (!name) {
    return [];
  }

  const url = `${GEOCODING_URL}?name=${encodeURIComponent(name)}&count=10&language=pt&format=json`;
  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new WeatherServiceError(`Falha ao buscar cidades: HTTP ${response.status}`);
  }

  const data = await parseJson<GeocodingResponse>(response);

  return (data.results ?? []).map(mapResultToCity);
}

interface ForecastResponse {
  timezone?: string;
  current?: {
    time?: string;
    temperature_2m?: number;
    weather_code?: number;
  };
  daily?: {
    time?: string[];
    temperature_2m_min?: number[];
    temperature_2m_max?: number[];
    weather_code?: number[];
  };
}

/** Busca a previsão de 5 dias para a cidade selecionada. */
export async function getWeather(city: City): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current: 'temperature_2m,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min',
    temperature_unit: 'celsius',
    timezone: 'auto',
    forecast_days: '5',
  });

  const response = await fetchWithTimeout(`${FORECAST_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new WeatherServiceError(`Falha ao buscar previsão: HTTP ${response.status}`);
  }

  const data = await parseJson<ForecastResponse>(response);

  if (!data.current || !data.daily) {
    throw new WeatherServiceError('Resposta de previsão incompleta: current ou daily ausente');
  }

  const current: CurrentWeather = {
    temperatureCelsius: data.current.temperature_2m,
    weatherCode: data.current.weather_code,
    observedAt: data.current.time,
  };

  const dailyTimes = data.daily.time ?? [];
  const forecast: ForecastDay[] = dailyTimes.slice(0, 5).map((date, index) => ({
    date,
    temperatureMinCelsius: data.daily?.temperature_2m_min?.[index],
    temperatureMaxCelsius: data.daily?.temperature_2m_max?.[index],
    weatherCode: data.daily?.weather_code?.[index],
  }));

  const isPartial =
    forecast.length < 5 ||
    current.temperatureCelsius === undefined ||
    current.weatherCode === undefined ||
    forecast.some(
      (day) =>
        day.temperatureMinCelsius === undefined ||
        day.temperatureMaxCelsius === undefined ||
        day.weatherCode === undefined,
    );

  return {
    city,
    current,
    forecast,
    timezone: data.timezone ?? city.timezone ?? 'UTC',
    fetchedAt: new Date().toISOString(),
    isPartial,
  };
}
