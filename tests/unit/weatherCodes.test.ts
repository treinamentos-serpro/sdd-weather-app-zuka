import { describe, expect, it } from 'vitest';
import { getWeatherIcon, getWeatherLabel } from '../../src/lib/weatherCodes';

describe('getWeatherLabel', () => {
  it('retorna o rótulo conhecido para um código WMO', () => {
    expect(getWeatherLabel(61)).toBe('Chuva fraca');
  });

  it('retorna fallback para código desconhecido', () => {
    expect(getWeatherLabel(999)).toBe('Condição indisponível');
  });

  it('retorna fallback quando o código não está disponível', () => {
    expect(getWeatherLabel(undefined)).toBe('Condição indisponível');
  });
});

describe('getWeatherIcon', () => {
  it('retorna o ícone correspondente ao código WMO', () => {
    expect(getWeatherIcon(0)).toBe('☀️');
    expect(getWeatherIcon(61)).toBe('🌧️');
  });

  it('retorna fallback para código desconhecido ou indisponível', () => {
    expect(getWeatherIcon(999)).toBe('—');
    expect(getWeatherIcon(undefined)).toBe('—');
  });
});
