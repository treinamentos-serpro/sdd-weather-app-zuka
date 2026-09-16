import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useWeather } from '../../../src/hooks/useWeather';
import * as weatherService from '../../../src/services/weatherService';
import type { City, WeatherData } from '../../../src/types/weather';

const sampleCity: City = {
  id: 3451190,
  name: 'Rio de Janeiro',
  country: 'Brazil',
  countryCode: 'BR',
  latitude: -22.9068,
  longitude: -43.1729,
  timezone: 'America/Sao_Paulo',
};

const sampleWeather: WeatherData = {
  city: sampleCity,
  current: { temperatureCelsius: 24, weatherCode: 2, observedAt: '2026-09-16T10:00' },
  forecast: [
    {
      date: '2026-09-16',
      temperatureMinCelsius: 19,
      temperatureMaxCelsius: 27,
      weatherCode: 2,
      precipitation: 0,
    },
  ],
  timezone: 'America/Sao_Paulo',
  fetchedAt: '2026-09-16T10:05:00.000Z',
  isPartial: false,
};

describe('useWeather', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('busca cidades sem carregar clima automaticamente e mantém a lista disponível para seleção', async () => {
    vi.spyOn(weatherService, 'searchCities').mockResolvedValue([sampleCity]);
    const getWeatherSpy = vi.spyOn(weatherService, 'getWeather').mockResolvedValue(sampleWeather);

    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Rio');
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.cities).toEqual([sampleCity]);
    expect(result.current.data).toBeUndefined();
    expect(getWeatherSpy).not.toHaveBeenCalled();
    expect(result.current.query).toBe('Rio');
  });

  it('define status empty quando a busca não retorna cidades', async () => {
    vi.spyOn(weatherService, 'searchCities').mockResolvedValue([]);
    const getWeatherSpy = vi.spyOn(weatherService, 'getWeather');

    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('cidade inexistente');
    });

    expect(result.current.status).toBe('empty');
    expect(result.current.data).toBeUndefined();
    expect(getWeatherSpy).not.toHaveBeenCalled();
  });

  it('define status error quando a busca de cidades falha', async () => {
    vi.spyOn(weatherService, 'searchCities').mockRejectedValue(
      new weatherService.WeatherServiceError('Falha de rede.'),
    );

    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Rio');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe('Falha de rede.');
  });

  it('exibe mensagem amigável quando a rede fica offline durante a busca', async () => {
    vi.spyOn(weatherService, 'searchCities').mockRejectedValue(
      new weatherService.WeatherServiceError(
        'Sem conexão com a internet. Verifique sua rede e tente novamente.',
        'network',
      ),
    );

    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Rio');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe(
      'Sem conexão com a internet. Verifique sua rede e tente novamente.',
    );
  });

  it('usa mensagem genérica para erros inesperados, sem vazar detalhes internos', async () => {
    vi.spyOn(weatherService, 'searchCities').mockRejectedValue(new TypeError('boom'));

    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Rio');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe('Não foi possível carregar o clima. Tente novamente.');
  });

  it('selectCity carrega o clima da cidade escolhida', async () => {
    vi.spyOn(weatherService, 'getWeather').mockResolvedValue(sampleWeather);

    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.selectCity(sampleCity);
    });

    expect(result.current.status).toBe('success');
    expect(result.current.data).toEqual(sampleWeather);
  });

  it('retry refaz a última operação após um erro de busca', async () => {
    const searchSpy = vi
      .spyOn(weatherService, 'searchCities')
      .mockRejectedValueOnce(new weatherService.WeatherServiceError('Falha de rede.'))
      .mockResolvedValueOnce([sampleCity]);
    vi.spyOn(weatherService, 'getWeather').mockResolvedValue(sampleWeather);

    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Rio');
    });
    expect(result.current.status).toBe('error');

    await act(async () => {
      await result.current.retry();
    });

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(searchSpy).toHaveBeenCalledTimes(2);
    expect(result.current.data).toEqual(sampleWeather);
  });

  it('retry refaz o carregamento do clima após erro em selectCity', async () => {
    vi.spyOn(weatherService, 'getWeather')
      .mockRejectedValueOnce(new weatherService.WeatherServiceError('Falha de rede.'))
      .mockResolvedValueOnce(sampleWeather);

    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.selectCity(sampleCity);
    });
    expect(result.current.status).toBe('error');

    await act(async () => {
      await result.current.retry();
    });

    expect(result.current.status).toBe('success');
    expect(result.current.data).toEqual(sampleWeather);
  });

  it('retry refaz a última busca após uma falha offline', async () => {
    const searchSpy = vi
      .spyOn(weatherService, 'searchCities')
      .mockRejectedValueOnce(
        new weatherService.WeatherServiceError(
          'Sem conexão com a internet. Verifique sua rede e tente novamente.',
          'network',
        ),
      )
      .mockResolvedValueOnce([]);

    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Rio');
    });
    expect(result.current.status).toBe('error');

    await act(async () => {
      await result.current.retry();
    });

    expect(result.current.status).toBe('empty');
    expect(searchSpy).toHaveBeenCalledTimes(2);
    expect(searchSpy).toHaveBeenLastCalledWith('Rio');
  });
});
