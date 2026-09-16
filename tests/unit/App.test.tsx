import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
import * as weatherService from '../../src/services/weatherService';
import type { City, WeatherData } from '../../src/types/weather';

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

const partialWeather: WeatherData = {
  ...sampleWeather,
  current: { observedAt: '2026-09-16T10:00' },
  forecast: [{ date: '2026-09-16', precipitation: 0 }],
  isPartial: true,
};

describe('App', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('mostra o estado idle antes de qualquer busca', () => {
    render(<App />);

    expect(screen.getByText('Busque uma cidade')).toBeInTheDocument();
  });

  it('mostra o estado empty quando a busca não retorna cidades', async () => {
    vi.spyOn(weatherService, 'searchCities').mockResolvedValue([]);
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText('Buscar cidade'), 'cidade inexistente');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(await screen.findByText('Nenhuma cidade encontrada')).toBeInTheDocument();
  });

  it('mostra resultados de cidade e seleciona explicitamente antes de carregar o clima', async () => {
    vi.spyOn(weatherService, 'searchCities').mockResolvedValue([sampleCity]);
    vi.spyOn(weatherService, 'getWeather').mockResolvedValue(sampleWeather);
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText('Buscar cidade'), 'Rio de Janeiro');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    const resultItem = await screen.findByRole('button', { name: /rio de janeiro/i });
    await user.click(resultItem);

    expect(await screen.findByText('Rio de Janeiro')).toBeInTheDocument();
    expect(weatherService.getWeather).toHaveBeenCalledWith(sampleCity);
  });

  it('move o foco para o conteúdo após concluir a busca', async () => {
    vi.spyOn(weatherService, 'searchCities').mockResolvedValue([sampleCity]);
    vi.spyOn(weatherService, 'getWeather').mockResolvedValue(sampleWeather);
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText('Buscar cidade'), 'Rio de Janeiro');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    await screen.findByText('Rio de Janeiro');

    expect(screen.getByRole('main')).toHaveFocus();
    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'false');
  });

  it('indica campos indisponíveis e previsão parcial', async () => {
    vi.spyOn(weatherService, 'searchCities').mockResolvedValue([sampleCity]);
    vi.spyOn(weatherService, 'getWeather').mockResolvedValue(partialWeather);
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText('Buscar cidade'), 'Rio de Janeiro');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    await user.click(await screen.findByRole('button', { name: /rio de janeiro/i }));

    expect(await screen.findAllByText('Indisponível')).not.toHaveLength(0);
    expect(screen.getByRole('status')).toHaveTextContent('Previsão parcial');
  });

  it('mostra erro com retry que refaz a busca', async () => {
    vi.spyOn(weatherService, 'searchCities')
      .mockRejectedValueOnce(new weatherService.WeatherServiceError('Falha de rede.'))
      .mockResolvedValueOnce([sampleCity]);
    vi.spyOn(weatherService, 'getWeather').mockResolvedValue(sampleWeather);
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText('Buscar cidade'), 'Rio de Janeiro');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    const retryButton = await screen.findByRole('button', { name: 'Tentar novamente' });
    await user.click(retryButton);

    expect(await screen.findByText('Rio de Janeiro')).toBeInTheDocument();
  });
});
