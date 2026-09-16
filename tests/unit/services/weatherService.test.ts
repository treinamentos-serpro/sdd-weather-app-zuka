import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getWeather,
  searchCities,
  WeatherServiceError,
} from '../../../src/services/weatherService';
import type { City } from '../../../src/types/weather';

const sampleCity: City = {
  id: 3451190,
  name: 'Rio de Janeiro',
  country: 'Brazil',
  countryCode: 'BR',
  admin1: 'Rio de Janeiro',
  latitude: -22.9068,
  longitude: -43.1729,
  timezone: 'America/Sao_Paulo',
};

describe('searchCities', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('retorna lista vazia sem chamar a rede quando o input é vazio', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const result = await searchCities('');

    expect(result).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('não chama a rede quando o input contém apenas espaços', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const result = await searchCities('   ');

    expect(result).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('mapeia results para City[] e usa encodeURIComponent no nome', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          {
            id: 3451190,
            name: 'São Paulo',
            country: 'Brazil',
            country_code: 'BR',
            admin1: 'São Paulo',
            latitude: -23.5475,
            longitude: -46.6361,
            timezone: 'America/Sao_Paulo',
          },
        ],
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await searchCities('São Paulo');

    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toContain(encodeURIComponent('São Paulo'));
    expect(result).toEqual([
      {
        id: 3451190,
        name: 'São Paulo',
        country: 'Brazil',
        countryCode: 'BR',
        admin1: 'São Paulo',
        latitude: -23.5475,
        longitude: -46.6361,
        timezone: 'America/Sao_Paulo',
      },
    ]);
  });

  it('retorna lista vazia quando results está ausente', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await searchCities('cidade inexistente');

    expect(result).toEqual([]);
  });

  it('limita os resultados a dez cidades', async () => {
    const results = Array.from({ length: 11 }, (_, index) => ({
      id: index + 1,
      name: `Cidade ${index + 1}`,
      country: 'Brazil',
      latitude: index,
      longitude: index,
    }));
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await searchCities('cidade');

    expect(result).toHaveLength(10);
    expect(result.at(-1)?.name).toBe('Cidade 10');
  });

  it('lança WeatherServiceError em resposta não-ok', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities('Rio')).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it('lança WeatherServiceError quando o corpo não é JSON válido', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => {
        throw new SyntaxError('Unexpected token');
      },
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities('Rio')).rejects.toBeInstanceOf(WeatherServiceError);
  });
});

describe('getWeather', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('mapeia current e daily para WeatherData completo', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        timezone: 'America/Sao_Paulo',
        current: {
          time: '2026-09-16T10:00',
          temperature_2m: 24.3,
          weather_code: 2,
        },
        daily: {
          time: ['2026-09-16', '2026-09-17', '2026-09-18', '2026-09-19', '2026-09-20'],
          temperature_2m_min: [19.1, 18.7, 20.0, 21.2, 20.4],
          temperature_2m_max: [27.5, 26.8, 28.1, 29.0, 27.9],
          weather_code: [2, 3, 1, 61, 80],
          precipitation_sum: [0, 1.2, null, 4.5, 0.4],
        },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await getWeather(sampleCity);

    expect(result.city).toEqual(sampleCity);
    expect(result.current).toEqual({
      temperatureCelsius: 24.3,
      weatherCode: 2,
      observedAt: '2026-09-16T10:00',
    });
    expect(result.forecast).toHaveLength(5);
    expect(result.forecast[0]).toEqual({
      date: '2026-09-16',
      temperatureMinCelsius: 19.1,
      temperatureMaxCelsius: 27.5,
      weatherCode: 2,
      precipitation: 0,
    });
    expect(result.forecast).toEqual([
      expect.objectContaining({ date: '2026-09-16', precipitation: 0 }),
      expect.objectContaining({ date: '2026-09-17', precipitation: 1.2 }),
      expect.objectContaining({ date: '2026-09-18', precipitation: 0 }),
      expect.objectContaining({ date: '2026-09-19', precipitation: 4.5 }),
      expect.objectContaining({ date: '2026-09-20', precipitation: 0.4 }),
    ]);
    expect(result.isPartial).toBe(false);
    expect(result.timezone).toBe('America/Sao_Paulo');
  });

  it('marca isPartial quando há menos de cinco dias', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        timezone: 'America/Sao_Paulo',
        current: { time: '2026-09-16T10:00', temperature_2m: 24.3, weather_code: 2 },
        daily: {
          time: ['2026-09-16', '2026-09-17'],
          temperature_2m_min: [19.1, 18.7],
          temperature_2m_max: [27.5, 26.8],
          weather_code: [2, 3],
        },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await getWeather(sampleCity);

    expect(result.isPartial).toBe(true);
    expect(result.forecast).toHaveLength(2);
  });

  it('preserva campos ausentes e marca a resposta como parcial', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        timezone: 'America/Sao_Paulo',
        current: { time: '2026-09-16T10:00', temperature_2m: 24.3 },
        daily: {
          time: ['2026-09-16'],
          temperature_2m_min: [19.1],
          temperature_2m_max: [27.5],
        },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await getWeather(sampleCity);

    expect(result.current).toEqual({
      temperatureCelsius: 24.3,
      weatherCode: undefined,
      observedAt: '2026-09-16T10:00',
    });
    expect(result.forecast[0]).toEqual({
      date: '2026-09-16',
      temperatureMinCelsius: 19.1,
      temperatureMaxCelsius: 27.5,
      weatherCode: undefined,
      precipitation: 0,
    });
    expect(result.isPartial).toBe(true);
  });

  it('marca como parcial quando current está ausente', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        timezone: 'America/Sao_Paulo',
        daily: {
          time: ['2026-09-16'],
          temperature_2m_min: [19.1],
          temperature_2m_max: [27.5],
          weather_code: [2],
        },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await getWeather(sampleCity);

    expect(result.current).toEqual({
      temperatureCelsius: undefined,
      weatherCode: undefined,
      observedAt: undefined,
    });
    expect(result.isPartial).toBe(true);
  });

  it('marca como parcial quando daily está ausente', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        timezone: 'America/Sao_Paulo',
        current: { time: '2026-09-16T10:00', temperature_2m: 24.3, weather_code: 2 },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await getWeather(sampleCity);

    expect(result.forecast).toEqual([]);
    expect(result.isPartial).toBe(true);
  });

  it('normaliza campos nulos sem produzir NaN ou valores nulos', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        timezone: null,
        current: {
          time: null,
          temperature_2m: null,
          weather_code: null,
        },
        daily: {
          time: [null],
          temperature_2m_min: [null],
          temperature_2m_max: [null],
          weather_code: [null],
          precipitation_sum: [null],
        },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await getWeather(sampleCity);

    expect(result.current).toEqual({
      temperatureCelsius: undefined,
      weatherCode: undefined,
      observedAt: undefined,
    });
    expect(result.forecast).toEqual([
      {
        date: 'day-0',
        temperatureMinCelsius: undefined,
        temperatureMaxCelsius: undefined,
        weatherCode: undefined,
        precipitation: 0,
      },
    ]);
    expect(result.timezone).toBe('America/Sao_Paulo');
    expect(JSON.stringify(result)).not.toContain('NaN');
  });

  it('lança WeatherServiceError em resposta não-ok', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(getWeather(sampleCity)).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it('lança WeatherServiceError quando o corpo não é JSON válido', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => {
        throw new SyntaxError('Unexpected token');
      },
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(getWeather(sampleCity)).rejects.toBeInstanceOf(WeatherServiceError);
  });
});

describe('fetchWithTimeout', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('converte AbortError em uma mensagem clara de timeout', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockImplementation((_url, init?: RequestInit) => {
      return new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          const error = new Error('The operation was aborted.');
          error.name = 'AbortError';
          reject(error);
        });
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const promise = searchCities('Rio');
    const assertion = expect(promise).rejects.toThrow(
      'A conexão demorou mais que o esperado. Tente novamente.',
    );
    await vi.advanceTimersByTimeAsync(10_000);
    await assertion;
  });

  it('converte falha offline em uma mensagem orientada à ação', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities('Rio')).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'network',
      message: 'Sem conexão com a internet. Verifique sua rede e tente novamente.',
    });
  });

  it('converte falha offline do forecast em WeatherServiceError', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    vi.stubGlobal('fetch', fetchMock);

    await expect(getWeather(sampleCity)).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'network',
      message: 'Sem conexão com a internet. Verifique sua rede e tente novamente.',
    });
  });
});
