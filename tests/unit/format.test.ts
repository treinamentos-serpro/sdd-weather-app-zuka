import { describe, expect, it } from 'vitest';
import { formatDayLabel, getShortDate } from '../../src/lib/format';

describe('formatDayLabel', () => {
  it('rotula o primeiro dia como Hoje', () => {
    expect(formatDayLabel(0, '2026-09-16')).toBe('Hoje');
  });

  it('rotula o segundo dia como Amanhã', () => {
    expect(formatDayLabel(1, '2026-09-17')).toBe('Amanhã');
  });

  it('usa o dia da semana para os demais dias', () => {
    expect(formatDayLabel(2, '2026-09-18')).toBe('sex');
  });
});

describe('getShortDate', () => {
  it('retorna o dia da semana abreviado em pt-BR', () => {
    expect(getShortDate('2026-09-16')).toBe('qua');
  });
});
