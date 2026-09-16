import type { City, CurrentWeather, ForecastDay, WeatherData } from '../types/weather';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

export type WeatherServiceErrorKind = 'network' | 'timeout' | 'http' | 'invalid-response';

/** Erro lançado quando a Open-Meteo responde com falha ou dados inválidos. */
export class WeatherServiceError extends Error {
  readonly kind: WeatherServiceErrorKind;

  constructor(message: string, kind: WeatherServiceErrorKind = 'network') {
    super(message);
    this.name = 'WeatherServiceError';
    this.kind = kind;
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
      throw new WeatherServiceError(
        'A conexão demorou mais que o esperado. Tente novamente.',
        'timeout',
      );
    }
    throw new WeatherServiceError(
      'Sem conexão com a internet. Verifique sua rede e tente novamente.',
      'network',
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

/** Faz o parse do corpo JSON, convertendo falhas em `WeatherServiceError`. */
async function parseJson<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    throw new WeatherServiceError(
      'O serviço retornou uma resposta inválida. Tente novamente.',
      'invalid-response',
    );
  }
}

interface GeocodingResult {
  id?: number | null;
  name?: string | null;
  country?: string | null;
  country_code?: string | null;
  admin1?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  timezone?: string | null;
}

interface GeocodingResponse {
  results?: (GeocodingResult | null)[] | null;
}

function isFiniteNumber(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isValidGeocodingResult(result: GeocodingResult | null): result is GeocodingResult {
  return Boolean(
    result &&
      isFiniteNumber(result.id) &&
      Boolean(result.name?.trim()) &&
      Boolean(result.country?.trim()) &&
      isFiniteNumber(result.latitude) &&
      isFiniteNumber(result.longitude),
  );
}

function mapResultToCity(result: GeocodingResult): City {
  return {
    id: result.id as number,
    name: result.name?.trim() as string,
    country: result.country?.trim() as string,
    countryCode: result.country_code?.trim() || undefined,
    admin1: result.admin1?.trim() || undefined,
    latitude: result.latitude as number,
    longitude: result.longitude as number,
    timezone: result.timezone?.trim() || undefined,
  };
}

/** Busca cidades pelo endpoint de geocoding da Open-Meteo. */
export async function searchCities(name: string): Promise<City[]> {
  if (!name.trim()) {
    return [];
  }

  const url = `${GEOCODING_URL}?name=${encodeURIComponent(name)}&count=10&language=pt&format=json`;
  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new WeatherServiceError(
      'O serviço de cidades está indisponível. Tente novamente.',
      'http',
    );
  }

  const data = await parseJson<GeocodingResponse>(response);

  return (data.results ?? []).filter(isValidGeocodingResult).slice(0, 10).map(mapResultToCity);
}

interface ForecastResponse {
  timezone?: string | null;
  current?: {
    time?: string | null;
    temperature_2m?: number | null;
    weather_code?: number | null;
  } | null;
  daily?: {
    time?: (string | null)[] | null;
    temperature_2m_min?: (number | null)[] | null;
    temperature_2m_max?: (number | null)[] | null;
    weather_code?: (number | null)[] | null;
    precipitation_sum?: (number | null)[] | null;
  } | null;
}

/** Busca a previsão de 5 dias para a cidade selecionada. */
export async function getWeather(city: City): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current: 'temperature_2m,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum',
    temperature_unit: 'celsius',
    timezone: 'auto',
    forecast_days: '5',
  });

  const response = await fetchWithTimeout(`${FORECAST_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new WeatherServiceError(
      'O serviço de previsão está indisponível. Tente novamente.',
      'http',
    );
  }

  const data = await parseJson<ForecastResponse>(response);

  const currentResponse = data.current ?? {};
  const dailyResponse = data.daily ?? {};

  const current: CurrentWeather = {
    temperatureCelsius: isFiniteNumber(currentResponse.temperature_2m)
      ? currentResponse.temperature_2m
      : undefined,
    weatherCode: isFiniteNumber(currentResponse.weather_code)
      ? currentResponse.weather_code
      : undefined,
    observedAt: currentResponse.time?.trim() || undefined,
  };

  const dailyTimes = dailyResponse.time ?? [];
  const forecast: ForecastDay[] = dailyTimes.slice(0, 5).map((date, index) => ({
    date: date?.trim() || `day-${index}`,
    temperatureMinCelsius: isFiniteNumber(dailyResponse.temperature_2m_min?.[index])
      ? dailyResponse.temperature_2m_min[index]
      : undefined,
    temperatureMaxCelsius: isFiniteNumber(dailyResponse.temperature_2m_max?.[index])
      ? dailyResponse.temperature_2m_max[index]
      : undefined,
    weatherCode: isFiniteNumber(dailyResponse.weather_code?.[index])
      ? dailyResponse.weather_code[index]
      : undefined,
    precipitation: isFiniteNumber(dailyResponse.precipitation_sum?.[index])
      ? dailyResponse.precipitation_sum[index]
      : 0,
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
    timezone: data.timezone?.trim() || city.timezone || 'UTC',
    fetchedAt: new Date().toISOString(),
    isPartial,
  };
}
