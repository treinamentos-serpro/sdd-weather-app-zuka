import { describe, expect, it } from 'vitest';
import { getWeatherLabel } from '../../src/lib/weatherCodes';

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
