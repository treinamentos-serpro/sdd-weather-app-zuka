# Prompt de Implementação — T-01

Você é o **Coding Agent** do Weather App. Implemente somente a tarefa abaixo,
usando este prompt como contexto completo. Não implemente T-02 ou qualquer
tarefa posterior.

## Contexto do projeto

O projeto é uma aplicação React + Vite em TypeScript strict, com dados da
Open-Meteo e interface em pt-BR. A arquitetura separa contratos em `src/types/`,
funções puras em `src/lib/`, acesso externo em `src/services/`, orquestração em
`src/hooks/` e apresentação em `src/components/`.

Os tipos compartilhados são a fronteira entre as camadas. Eles não podem
importar React, fazer requests, conhecer componentes ou depender de respostas
brutas da Open-Meteo. Temperaturas meteorológicas permanecem em Celsius no
modelo; Fahrenheit será calculado somente na apresentação em uma tarefa futura.

## Tarefa

**T-01 — Definir tipos de cidade e meteorologia**

Criar os contratos TypeScript de `Unit`, `City`, `CurrentWeather`,
`ForecastDay` e `WeatherData` para representar uma cidade selecionada, o clima
atual e a previsão diária normalizada.

## Contratos obrigatórios

Implemente os seguintes contratos, preservando os nomes e a semântica pública:

```ts
export type Unit = 'celsius' | 'fahrenheit';

export interface City {
  id: number;
  name: string;
  country: string;
  countryCode?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

export interface CurrentWeather {
  temperatureCelsius?: number;
  weatherCode?: number;
  observedAt?: string;
}

export interface ForecastDay {
  date: string;
  temperatureMinCelsius?: number;
  temperatureMaxCelsius?: number;
  weatherCode?: number;
}

export interface WeatherData {
  city: City;
  current: CurrentWeather;
  forecast: ForecastDay[];
  timezone: string;
  fetchedAt: string;
  isPartial: boolean;
}
```

## Arquivos permitidos

- Criar ou editar `src/types/weather.ts`.
- Criar ou editar `src/types/city.ts` somente se a separação local de tipos do
  projeto exigir isso; não duplique `City` em dois arquivos.
- Não criar ou editar services, hooks, componentes, estilos ou testes nesta
  tarefa.

Se os diretórios `src/types/` ainda não existirem, crie-os. Preserve qualquer
tipo já existente que não conflite com estes contratos e ajuste imports somente
quando necessário para evitar duplicação.

## Critérios de aceite

1. `Unit` aceita exatamente `'celsius'` e `'fahrenheit'`; qualquer outro valor
   falha no type-check.
2. `City` possui os campos obrigatórios `id`, `name`, `country`, `latitude` e
   `longitude`, e mantém `countryCode`, `admin1` e `timezone` opcionais.
3. `CurrentWeather` e `ForecastDay` mantêm temperatura, código meteorológico e
   horário/data opcionais conforme o contrato; nenhum campo ausente recebe
   valor padrão.
4. `ForecastDay.date` representa uma data `YYYY-MM-DD` e
   `CurrentWeather.observedAt` representa um timestamp ISO da fonte; os tipos
   devem documentar essa convenção apenas quando necessário.
5. `WeatherData` referencia `City`, `CurrentWeather` e `ForecastDay[]`, contém
   `timezone`, `fetchedAt` e `isPartial`, e permite um fixture completo com
   exatamente cinco itens em `forecast`.
6. Os arquivos de tipos não importam React, serviços, hooks, componentes ou
   bibliotecas de rede.
7. O projeto passa no type-check/build existente sem introduzir `any`, casts
   inseguros ou alterações fora do escopo.

## Restrições de implementação

- Use TypeScript strict e `export` explícito.
- Use identificadores em inglês, seguindo as convenções do repositório.
- Não implemente `AppError`, `SearchState` ou `WeatherState`; esses contratos
  pertencem à T-02.
- Não adicione conversão Celsius/Fahrenheit, validação de payload, fetch ou
  lógica de negócio.
- Não adicione comentários de preenchimento nem reestruture arquivos não
  relacionados.

## Validação obrigatória

Depois da implementação, execute:

```bash
pnpm build
```

Se o projeto tiver um comando de type-check separado, execute-o também. Se a
validação falhar por código existente fora do escopo, informe o comando e o
erro sem corrigir funcionalidades de outras tarefas.

## Formato da resposta do Coding Agent

Ao concluir, informe brevemente:

1. Arquivos criados ou alterados.
2. Contratos implementados.
3. Comandos de validação executados e resultado.
4. Qualquer bloqueio ou erro preexistente.