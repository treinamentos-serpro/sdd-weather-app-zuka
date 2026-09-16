import { describe, expect, it } from 'vitest';
import { convertTemperature, formatTemperature, unitLabel } from '../../src/lib/temperature';

describe('convertTemperature', () => {
  it.each([
    [0, 32],
    [100, 212],
    [-40, -40],
  ])('converte %d°C para %d°F', (celsius, fahrenheit) => {
    expect(convertTemperature(celsius, 'fahrenheit')).toBe(fahrenheit);
  });

  it('mantém o valor em Celsius quando a unidade é celsius', () => {
    expect(convertTemperature(24.5, 'celsius')).toBe(24.5);
  });

  it('converte o valor para Fahrenheit quando a unidade é fahrenheit', () => {
    expect(convertTemperature(20, 'fahrenheit')).toBe(68);
  });
});

describe('formatTemperature', () => {
  it('arredonda o valor e inclui o símbolo Celsius', () => {
    expect(formatTemperature(24.6, 'celsius')).toBe('25°C');
  });

  it('arredonda o valor convertido e inclui o símbolo Fahrenheit', () => {
    expect(formatTemperature(20.4, 'fahrenheit')).toBe('69°F');
  });
});

describe('unitLabel', () => {
  it('retorna o símbolo de Celsius', () => {
    expect(unitLabel('celsius')).toBe('°C');
  });

  it('retorna o símbolo de Fahrenheit', () => {
    expect(unitLabel('fahrenheit')).toBe('°F');
  });
});
