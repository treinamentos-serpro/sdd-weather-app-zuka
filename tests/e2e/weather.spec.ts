import { expect, test } from '@playwright/test';

test('busca cidade, exibe previsão e alterna para Fahrenheit', async ({ page }) => {
  await page.route('**/geocoding-api.open-meteo.com/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        results: [
          {
            id: 3451190,
            name: 'Rio de Janeiro',
            country: 'Brazil',
            country_code: 'BR',
            admin1: 'Rio de Janeiro',
            latitude: -22.9068,
            longitude: -43.1729,
            timezone: 'America/Sao_Paulo',
          },
        ],
      }),
    });
  });

  await page.route('**/api.open-meteo.com/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        timezone: 'America/Sao_Paulo',
        current: {
          time: '2026-09-16T10:00',
          temperature_2m: 0,
          weather_code: 0,
        },
        daily: {
          time: ['2026-09-16', '2026-09-17', '2026-09-18', '2026-09-19', '2026-09-20'],
          temperature_2m_min: [0, 1, 2, 3, 4],
          temperature_2m_max: [5, 6, 7, 8, 9],
          weather_code: [0, 1, 2, 3, 61],
          precipitation_sum: [0, 0, 0, 0, 0],
        },
      }),
    });
  });

  await page.goto('/');
  await page.getByLabel('Buscar cidade').fill('Rio de Janeiro');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: 'Rio de Janeiro' })).toBeVisible();
  const currentWeather = page.getByRole('region', { name: 'Clima atual' });
  const forecast = page.getByRole('region', { name: 'Previsão de 5 dias' });
  await expect(currentWeather).toContainText('0°C');
  await expect(forecast).toBeVisible();
  await expect(forecast.getByRole('article')).toHaveCount(5);

  await page.getByRole('button', { name: '°F' }).click();

  await expect(currentWeather).toContainText('32°F');
});

test('exibe mensagem quando o geocoding não retorna cidades', async ({ page }) => {
  await page.route('**/geocoding-api.open-meteo.com/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({}),
    });
  });

  await page.goto('/');
  await page.getByLabel('Buscar cidade').fill('Cidade inexistente');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByText('Nenhuma cidade encontrada', { exact: true })).toBeVisible();
});

test('renderiza o clima no viewport mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });

  await page.route('**/geocoding-api.open-meteo.com/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        results: [
          {
            id: 3451190,
            name: 'Rio de Janeiro',
            country: 'Brazil',
            country_code: 'BR',
            latitude: -22.9068,
            longitude: -43.1729,
            timezone: 'America/Sao_Paulo',
          },
        ],
      }),
    });
  });

  await page.route('**/api.open-meteo.com/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        timezone: 'America/Sao_Paulo',
        current: { time: '2026-09-16T10:00', temperature_2m: 24, weather_code: 2 },
        daily: {
          time: ['2026-09-16', '2026-09-17', '2026-09-18', '2026-09-19', '2026-09-20'],
          temperature_2m_min: [19, 18, 20, 21, 20],
          temperature_2m_max: [27, 26, 28, 29, 27],
          weather_code: [2, 3, 1, 61, 80],
          precipitation_sum: [0, 0, 0, 1, 0],
        },
      }),
    });
  });

  await page.goto('/');
  await page.getByLabel('Buscar cidade').fill('Rio de Janeiro');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: 'Rio de Janeiro' })).toBeVisible();
  const currentWeather = page.getByRole('region', { name: 'Clima atual' });
  const forecast = page.getByRole('region', { name: 'Previsão de 5 dias' });
  await expect(currentWeather).toContainText('24°C');
  await expect(forecast).toBeVisible();
  await expect(forecast.getByRole('article')).toHaveCount(5);
});
