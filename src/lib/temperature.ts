import type { Unit } from '../types/weather';

/**
 * Converte e arredonda uma temperatura em Celsius para a unidade de apresentação.
 * Celsius não é arredondado internamente; o arredondamento ocorre apenas aqui.
 */
export function displayTemperature(celsius: number, unit: Unit): number {
  if (unit === 'fahrenheit') {
    return Math.round((celsius * 9) / 5 + 32);
  }
  return Math.round(celsius);
}

export function convertTemperature(celsius: number, unit: Unit): number {
  return unit === 'fahrenheit' ? (celsius * 9) / 5 + 32 : celsius;
}

export function formatTemperature(celsius: number, unit: Unit): string {
  return `${Math.round(convertTemperature(celsius, unit))}${unitLabel(unit)}`;
}

export function unitLabel(unit: Unit): string {
  return unit === 'fahrenheit' ? '°F' : '°C';
}
