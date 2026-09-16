import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import UnitToggle from '../../../src/components/UnitToggle';
import WeatherSummary from '../../../src/components/WeatherSummary';
import type { City, Unit } from '../../../src/types/weather';

const sampleCity: City = {
  id: 1,
  name: 'Rio de Janeiro',
  country: 'Brazil',
  latitude: -22.9068,
  longitude: -43.1729,
  timezone: 'America/Sao_Paulo',
};

function WeatherUnitControl() {
  const [unit, setUnit] = useState<Unit>('celsius');

  return (
    <>
      <UnitToggle unit={unit} onChange={setUnit} />
      <WeatherSummary
        city={sampleCity}
        current={{ temperatureCelsius: 0, weatherCode: 0, observedAt: '2026-09-16T10:00' }}
        unit={unit}
      />
    </>
  );
}

describe('UnitToggle e WeatherSummary', () => {
  it('exibe 32°F ao alternar uma temperatura de 0°C', async () => {
    const user = userEvent.setup();
    render(<WeatherUnitControl />);

    expect(screen.getByText('0°C')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '°F' }));

    expect(screen.getByText('32°F')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '°F' })).toHaveAttribute('aria-pressed', 'true');
  });
});
