# Backlog de Tarefas — Weather App

Backlog derivado de `plans/weather-app-plan.md`. As tarefas estão ordenadas
por dependência e agrupadas por entrega. Cada tarefa tem um foco testável e
evita misturar camadas de UI, dados e testes. Os critérios abaixo devem ser
verificados por teste automatizado, inspeção estática ou comando de validação.

A ordem de implementação é: tipos, funções puras, services, hook, componentes,
integração, testes e hardening. Uma tarefa só depende de tarefas anteriores ou
de tarefas explicitamente listadas no mesmo bloco.

## Entrega 1 — Fundamentos de domínio

### T-01 — Definir tipos de cidade e meteorologia
- **Tipo:** Data
- **Descrição:** Criar os contratos `Unit`, `City`, `CurrentWeather`, `ForecastDay` e `WeatherData`.
- **Critérios de aceite:**
  - Os tipos compilam com TypeScript strict e não importam React ou serviços.
  - Temperaturas internas são Celsius e campos meteorológicos ausentes permanecem opcionais.
  - `WeatherData` expõe `city`, `timezone`, `fetchedAt`, `forecast` e `isPartial`; um fixture completo contém cinco itens em `forecast`.
- **Dependências:** —
- **Arquivos prováveis:** `src/types/weather.ts`, `src/types/city.ts`

### T-02 — Definir tipos de estado e erro
- **Tipo:** Data
- **Descrição:** Criar `AppError`, `SearchState` e `WeatherState` para os estados da jornada.
- **Critérios de aceite:**
  - Os tipos incluem os status definidos no plano e `freshness` com `current`, `stale` e `unavailable`.
  - `AppError` distingue rede, timeout, HTTP, dados inválidos e erro desconhecido.
  - Os contratos não dependem de componentes, hooks ou respostas brutas da API.
- **Dependências:** T-01
- **Arquivos prováveis:** `src/types/service.ts`

### T-03 — Implementar conversão de temperatura
- **Tipo:** Data
- **Descrição:** Criar funções puras para conversão e arredondamento de valores Celsius na unidade de apresentação.
- **Critérios de aceite:**
  - `0°C` resulta em `32°F`, `100°C` em `212°F` e `-40°C` em `-40°F`.
  - A fórmula é `round(C * 9 / 5 + 32)` e Celsius é arredondado somente na apresentação.
  - Valores ausentes não viram zero ou estimativas.
- **Dependências:** T-01
- **Arquivos prováveis:** `src/lib/temperature.ts`

### T-04 — Mapear códigos meteorológicos WMO
- **Tipo:** Data
- **Descrição:** Mapear códigos WMO para condições textuais em pt-BR e identificadores de ícone opcionais.
- **Critérios de aceite:**
  - Os códigos `0`, `1`, `2`, `3`, `61` e `80` têm rótulos em pt-BR.
  - Código desconhecido retorna o rótulo literal `Condição indisponível` e não lança exceção.
  - O texto permanece disponível mesmo sem ícone.
- **Dependências:** T-01
- **Arquivos prováveis:** `src/lib/weatherCodes.ts`

### T-05 — Implementar formatação de datas e horários
- **Tipo:** Data
- **Descrição:** Criar helpers puros para formatar datas e horários em pt-BR no timezone da cidade.
- **Critérios de aceite:**
  - A formatação usa o timezone recebido e não o timezone local do navegador.
  - Com a mesma data de referência, timezone e locale `pt-BR`, o helper produz a mesma string em duas execuções.
  - O helper retorna uma string de data/hora para `observedAt` e um rótulo de dia para cada `ForecastDay.date`.
- **Dependências:** T-01
- **Arquivos prováveis:** `src/lib/dateTime.ts`

### T-06 — Implementar validação e seleção do forecast
- **Tipo:** Data
- **Descrição:** Criar funções puras para correlacionar vetores diários, selecionar cinco itens e identificar parcialidade.
- **Critérios de aceite:**
  - Os cinco primeiros dias válidos são selecionados em ordem.
  - Listas menores que cinco ou campos ausentes marcam a resposta como parcial.
  - Valores ausentes permanecem ausentes, sem zero ou estimativa.
- **Dependências:** T-01
- **Arquivos prováveis:** `src/lib/weatherValidation.ts`

## Entrega 2 — Integração com Open-Meteo

### T-07 — Implementar cliente HTTP com timeout e abort
- **Tipo:** Data
- **Descrição:** Encapsular `fetch`, `AbortController`, timeout e classificação de falhas externas.
- **Critérios de aceite:**
  - HTTP não-2xx, timeout, abort, rede e JSON inválido produzem `AppError` categorizado.
  - Um request que excede o timeout dispara `AbortController.abort()` e rejeita com `kind: 'timeout'`.
  - Erros não registram query completa, coordenadas completas ou credenciais.
- **Dependências:** T-02
- **Arquivos prováveis:** `src/services/httpClient.ts`

### T-08 — Mapear respostas do geocoding
- **Tipo:** Data
- **Descrição:** Implementar o adapter que converte um resultado bruto de geocoding em `City`.
- **Critérios de aceite:**
  - Um fixture com todos os campos produz `City` com os mesmos valores em `id`, nome, país, região, latitude, longitude e timezone.
  - Campos opcionais ausentes permanecem opcionais.
  - O adapter não conhece React nem estado da aplicação.
- **Dependências:** T-01
- **Arquivos prováveis:** `src/services/geocodingMapper.ts`

### T-09 — Implementar request de geocoding
- **Tipo:** Data
- **Descrição:** Criar `searchCities` com URL, parâmetros, limite e ordenação definidos pelo plano.
- **Critérios de aceite:**
  - A request usa `name`, `count=10`, `language=pt` e `format=json`, preservando acentos.
  - A resposta é mapeada para no máximo 10 cidades e ordenada por relevância e localidade.
  - `results` ausente ou vazio retorna lista vazia, distinta de falha de rede/HTTP.
- **Dependências:** T-07, T-08
- **Arquivos prováveis:** `src/services/geocodingService.ts`

### T-10 — Implementar request de forecast
- **Tipo:** Data
- **Descrição:** Criar a chamada Open-Meteo de forecast usando a cidade selecionada e parâmetros fixos do plano.
- **Critérios de aceite:**
  - A URL envia latitude, longitude, current/daily, Celsius, `timezone=auto` e `forecast_days=5`.
  - A função recebe `City` e não texto de busca.
  - Falhas são propagadas como `AppError` pelo cliente HTTP.
- **Dependências:** T-07, T-01
- **Arquivos prováveis:** `src/services/forecastService.ts`

### T-11 — Normalizar resposta de forecast
- **Tipo:** Data
- **Descrição:** Converter o payload bruto de forecast em `WeatherData` usando os helpers de validação.
- **Critérios de aceite:**
  - `current`, `daily`, timezone, cidade e `fetchedAt` são mapeados.
  - Resposta completa produz exatamente cinco dias.
  - Campos ou dias ausentes produzem `isPartial: true`, preservando todos os dados válidos.
- **Dependências:** T-01, T-05, T-06, T-10
- **Arquivos prováveis:** `src/services/forecastNormalizer.ts`

## Entrega 3 — Orquestração da jornada

### T-12 — Implementar estado de busca no hook
- **Tipo:** Data
- **Descrição:** Implementar no `useWeather` a query controlada, debounce e estados do geocoding.
- **Critérios de aceite:**
  - Menos de dois caracteres não chama o serviço e mantém `idle` (AC04).
  - Query válida dispara após 300 ms e atualiza `loading`, `success`, `empty` ou `error` (AC01, AC05, AC21).
  - O hook expõe resultados e erro sem vazar payload bruto.
- **Dependências:** T-09
- **Arquivos prováveis:** `src/hooks/useWeather.ts`

### T-13 — Adicionar busca explícita e seleção de cidade
- **Tipo:** Data
- **Descrição:** Completar as ações de Enter, botão de busca e seleção de `City` no `useWeather`.
- **Critérios de aceite:**
  - Enter e ação explícita enviam imediatamente, sem aguardar novo debounce (AC02).
  - Seleção preserva o objeto `City`, incluindo id e coordenadas (AC06–AC07).
  - Erro de busca permite nova tentativa e não apaga o contexto meteorológico anterior (AC08).
- **Dependências:** T-12
- **Arquivos prováveis:** `src/hooks/useWeather.ts`

### T-14 — Implementar carregamento de forecast no hook
- **Tipo:** Data
- **Descrição:** Adicionar ao `useWeather` a transição de cidade selecionada para `WeatherData` ou erro recuperável.
- **Critérios de aceite:**
  - Seleção inicia forecast com latitude, longitude e id da cidade, preservando o contexto durante `loading`.
  - Sucesso expõe dados completos ou parciais; erro preserva a cidade e oferece retry (AC19–AC20, AC23, AC25).
  - Uma nova seleção substitui os dados somente quando a consulta correspondente termina (AC24).
- **Dependências:** T-11, T-13
- **Arquivos prováveis:** `src/hooks/useWeather.ts`

### T-15 — Controlar concorrência e respostas obsoletas
- **Tipo:** Data
- **Descrição:** Adicionar request-id e cancelamento para impedir que uma consulta antiga vença uma seleção nova.
- **Critérios de aceite:**
  - Requisições anteriores são abortadas quando possível.
  - Resposta com request-id antigo não altera cidade, dados ou erro atuais.
  - Abort esperado não é exibido como falha recuperável.
- **Dependências:** T-14
- **Arquivos prováveis:** `src/hooks/useWeather.ts`

### T-16 — Adicionar armazenamento de cache ao hook
- **Tipo:** Data
- **Descrição:** Adicionar ao `useWeather` o armazenamento em memória por `City.id`, sem persistência no navegador.
- **Critérios de aceite:**
  - Entradas armazenam `WeatherData` e timestamp de recebimento.
  - O armazenamento é indexado por cidade e uma nova instância do hook começa vazia.
  - Uma inspeção de código confirma que o armazenamento não usa `localStorage`.
- **Dependências:** T-14, T-15
- **Arquivos prováveis:** `src/hooks/useWeather.ts`

### T-17 — Integrar cache e freshness no hook
- **Tipo:** Data
- **Descrição:** Usar o cache no `useWeather` como fallback e calcular `current`, `stale` ou `unavailable`.
- **Critérios de aceite:**
  - Cache de até 30 minutos retorna `freshness: 'stale'` e renderiza a idade ou o horário dos dados.
  - Cache expirado não preenche clima ou previsão.
  - Para timestamps de 29:59 e 30:00, o estado retornado é respectivamente utilizável e expirado conforme a política definida.
  - Idade considera `current.observedAt` quando disponível e `fetchedAt` para auditoria.
- **Dependências:** T-05, T-16
- **Arquivos prováveis:** `src/hooks/useWeather.ts`

### T-18 — Implementar troca de unidade no hook
- **Tipo:** Data
- **Descrição:** Expor unidade inicial Celsius e ação de troca que altera somente a preferência de apresentação.
- **Critérios de aceite:**
  - Unidade inicial é Celsius e não é persistida após reload.
  - A troca não chama geocoding ou forecast nem altera `WeatherData`.
  - O hook expõe a unidade para o atual e toda a previsão (AC13–AC16).
- **Dependências:** T-03, T-14
- **Arquivos prováveis:** `src/hooks/useWeather.ts`

## Entrega 4 — Interface

### T-19 — Construir SearchBar
- **Tipo:** UI
- **Descrição:** Criar o campo controlado, botão de busca e eventos de digitação/Enter.
- **Critérios de aceite:**
  - `getByRole` encontra o campo e o botão por nome acessível, e `Tab` aplica um indicador de foco não nulo em ambos.
  - Busca vazia é bloqueada e orienta o preenchimento (AC04).
  - O componente emite query e ação explícita sem acessar serviços.
- **Dependências:** T-13
- **Arquivos prováveis:** `src/components/SearchBar.tsx`

### T-20 — Construir lista de resultados de cidade
- **Tipo:** UI
- **Descrição:** Renderizar `City[]`, seleção e contexto de desambiguação.
- **Critérios de aceite:**
  - Cada resultado mostra cidade, país e região quando disponível (AC03).
  - Seleção por teclado e ponteiro emite o objeto `City` completo (AC06).
  - Texto da API é renderizado como texto, nunca como HTML (RNF06).
- **Dependências:** T-01, T-13
- **Arquivos prováveis:** `src/components/SearchResults.tsx`

### T-21 — Construir estados visuais da busca
- **Tipo:** UI
- **Descrição:** Implementar idle, loading, empty e error da busca com anúncios acessíveis.
- **Critérios de aceite:**
  - Loading, nenhum resultado e erro são visualmente distintos (AC05, AC19, AC21).
  - O estado `error` renderiza um controle com o nome acessível “Tentar novamente”.
  - Mensagens usam `aria-live` e não dependem só de cor ou ícone (RNF03).
- **Dependências:** T-02, T-12
- **Arquivos prováveis:** `src/components/states/SearchState.tsx`

### T-22 — Construir resumo do clima atual
- **Tipo:** UI
- **Descrição:** Renderizar cidade, país, temperatura, condição, unidade e atualização.
- **Critérios de aceite:**
  - Dados válidos exibem todos os campos do clima atual em pt-BR (AC09–AC10, AC17).
  - Campo ausente aparece como “Indisponível” (AC23).
  - Dados acima de 30 minutos exibem “Desatualizado” (AC18).
- **Dependências:** T-03, T-05, T-17, T-18
- **Arquivos prováveis:** `src/components/WeatherSummary.tsx`

### T-23 — Construir cartão de previsão diária
- **Tipo:** UI
- **Descrição:** Renderizar um `ForecastDay` com data, mínima, máxima e condição.
- **Critérios de aceite:**
  - Mínima, máxima, data e condição são exibidas na unidade ativa (AC12–AC13).
  - Cada valor ausente mostra “Indisponível”, sem estimativa (AC23).
  - O cartão mantém dimensões estáveis para loading e conteúdo.
- **Dependências:** T-03, T-04, T-05, T-18
- **Arquivos prováveis:** `src/components/ForecastDayCard.tsx`

### T-24 — Construir lista de cinco dias
- **Tipo:** UI
- **Descrição:** Renderizar `ForecastList` com os dias disponíveis e o aviso de parcialidade.
- **Critérios de aceite:**
  - Forecast completo mostra exatamente cinco cartões de hoje aos quatro dias seguintes (AC11).
  - Forecast parcial mostra “Previsão parcial” e não o apresenta como completo (AC23).
  - Em viewports de 320 px, 768 px e 1440 px, `document.documentElement.scrollWidth <= document.documentElement.clientWidth`.
- **Dependências:** T-23
- **Arquivos prováveis:** `src/components/ForecastList.tsx`

### T-25 — Construir controle de unidade
- **Tipo:** UI
- **Descrição:** Criar o controle acessível de Celsius/Fahrenheit.
- **Critérios de aceite:**
  - Celsius e Fahrenheit têm estado ativo identificável.
  - O controle funciona por teclado e anuncia a unidade atual.
  - A ação emitida não dispara nova consulta meteorológica (AC14–AC16).
- **Dependências:** T-18
- **Arquivos prováveis:** `src/components/UnitToggle.tsx`

### T-26 — Construir estados meteorológicos
- **Tipo:** UI
- **Descrição:** Implementar idle, loading, error, partial e unavailable do forecast.
- **Critérios de aceite:**
  - Tela sem cidade orienta a pesquisar (AC22).
  - Loading preserva a cidade e error oferece retry (AC19–AC20, AC25).
  - Partial e unavailable distinguem campos ausentes de falha de comunicação (AC23).
- **Dependências:** T-02, T-14
- **Arquivos prováveis:** `src/components/states/WeatherState.tsx`

### T-27 — Integrar componentes no App
- **Tipo:** UI
- **Descrição:** Conectar `App` ao `useWeather` e aos componentes da jornada.
- **Critérios de aceite:**
  - Um teste E2E completa busca, seleção, forecast, retry, unidade e nova consulta mantendo o mesmo documento carregado (RF01–RF08).
  - Uma inspeção de imports confirma que nenhum arquivo em `src/components/` importa `fetch`, URL de API ou tipo de payload bruto.
  - Todos os estados do hook chegam ao componente responsável.
- **Dependências:** T-15, T-17, T-18, T-19, T-20, T-21, T-22, T-24, T-25, T-26
- **Arquivos prováveis:** `src/App.tsx`

### T-28 — Aplicar estilos responsivos e dimensões estáveis
- **Tipo:** UI
- **Descrição:** Estilizar a tela e reservar dimensões para controles, loading e cartões.
- **Critérios de aceite:**
  - Em viewports de 320 px, 768 px e 1440 px, `scrollWidth <= clientWidth` (RNF01).
  - Uma auditoria de contraste registra no mínimo 4,5:1 para texto normal e 3:1 para texto grande (RNF03).
  - As dimensões dos placeholders de loading e dos cartões permanecem constantes antes e depois do carregamento.
- **Dependências:** T-27
- **Arquivos prováveis:** `src/styles/globals.css`

## Entrega 5 — Testes automatizados

### T-29 — Testar unitariamente a conversão de temperatura
- **Tipo:** Test
- **Descrição:** Criar testes unitários isolados para a função de conversão de temperatura, sem DOM ou rede.
- **Critérios de aceite:**
  - A suíte unitária cobre `0`, `100`, `-40`, arredondamento e alternâncias sem acúmulo (AC14–AC16).
  - Valores ausentes não geram estimativas.
- **Dependências:** T-03
- **Arquivos prováveis:** `tests/unit/lib/temperature.test.ts`

### T-30 — Testar códigos, datas e validação
- **Tipo:** Test
- **Descrição:** Testar os helpers puros de códigos WMO, timezone e forecast parcial.
- **Critérios de aceite:**
  - Códigos conhecidos/desconhecidos, pt-BR e timezone diferente do ambiente são cobertos.
  - Cinco dias completos, menos de cinco dias e campos ausentes são verificados (AC11–AC12, AC23).
- **Dependências:** T-04, T-05, T-06
- **Arquivos prováveis:** `tests/unit/lib/weather-domain.test.ts`

### T-31 — Testar cliente HTTP com mock de fetch
- **Tipo:** Test
- **Descrição:** Validar o cliente HTTP usando `fetch` mockado, sem requests de rede reais.
- **Critérios de aceite:**
  - Cada caso configura `fetch` com mock de sucesso, rejeição, timeout ou resposta HTTP correspondente.
  - Cada categoria produz o `AppError` esperado.
  - Timeout e abort não deixam promises pendentes.
  - A suíte falha se `fetch` real for chamado.
- **Dependências:** T-07
- **Arquivos prováveis:** `tests/unit/services/httpClient.test.ts`

### T-32 — Testar serviço de geocoding
- **Tipo:** Test
- **Descrição:** Validar URL, parâmetros, limite, ordenação, mapeamento e vazio do geocoding.
- **Critérios de aceite:**
  - O teste substitui `fetch` por mock e inspeciona a URL e os parâmetros enviados.
  - Parâmetros `name`, `count`, `language` e `format` são verificados.
  - O teste confirma no máximo 10 cidades e campos opcionais.
  - Vazio é distinto de rede, HTTP e timeout.
- **Dependências:** T-08, T-09
- **Arquivos prováveis:** `tests/unit/services/geocodingService.test.ts`

### T-33 — Testar serviço e normalizador de forecast
- **Tipo:** Test
- **Descrição:** Validar request, mapeamento completo e respostas parciais do forecast.
- **Critérios de aceite:**
  - O teste substitui `fetch` por mock e fornece fixtures de sucesso, erro e payload parcial.
  - Parâmetros de coordenada, Celsius, timezone, current e daily são verificados.
  - Payload completo produz cinco dias e payload incompleto produz `isPartial`.
  - Campos ausentes não são substituídos por zero.
- **Dependências:** T-10, T-11
- **Arquivos prováveis:** `tests/unit/services/forecastService.test.ts`, `tests/unit/services/forecastNormalizer.test.ts`

### T-34 — Testar busca do useWeather
- **Tipo:** Test
- **Descrição:** Testar debounce, Enter, validação de query, estados de busca e seleção.
- **Critérios de aceite:**
  - Debounce de 300 ms e Enter imediato são verificados (AC01–AC04).
  - Empty e error são distintos e permitem nova tentativa (AC05, AC08, AC21).
  - A seleção expõe a cidade completa (AC06–AC07).
- **Dependências:** T-12, T-13
- **Arquivos prováveis:** `tests/unit/hooks/useWeather.search.test.ts`

### T-35 — Testar forecast, concorrência e retry do useWeather
- **Tipo:** Test
- **Descrição:** Testar carregamento, request-id, abort, erro, retry e nova seleção.
- **Critérios de aceite:**
  - Resposta obsoleta não substitui a cidade atual.
  - Erro preserva contexto e retry usa a cidade original (AC08, AC20, AC25).
  - Nova seleção atualiza o conteúdo sem reload (AC24).
- **Dependências:** T-14, T-15
- **Arquivos prováveis:** `tests/unit/hooks/useWeather.forecast.test.ts`

### T-36 — Testar cache, freshness e unidade do useWeather
- **Tipo:** Test
- **Descrição:** Testar validade de 30 minutos, stale, expirado e troca sem novo request.
- **Critérios de aceite:**
  - Cache atual, stale e expirado têm comportamentos distintos.
  - `observedAt` e `fetchedAt` são usados conforme o contrato (AC17–AC18).
  - Alternância atualiza valores sem nova chamada e sem mutar Celsius original (AC13–AC16).
- **Dependências:** T-16, T-17, T-18
- **Arquivos prováveis:** `tests/unit/hooks/useWeather.cache.test.ts`

### T-37 — Testar componentes nos estados loading, erro e vazio
- **Tipo:** Test
- **Descrição:** Testar SearchBar, SearchResults e componentes de estado com Testing Library.
- **Critérios de aceite:**
  - Renderizar fixtures separados de `loading`, `error` e `empty` produz respectivamente indicador de carregamento, “Tentar novamente” e “Nenhum resultado”.
  - `Tab`, `Enter` e `Escape` produzem os eventos esperados de busca, seleção e retry nos cenários cobertos.
  - Testes encontram os roles e labels definidos, um indicador de foco não nulo e uma região `aria-live` nos estados loading, empty e error.
  - Cidade, país, região e “Nenhum resultado” aparecem no contexto correto.
- **Dependências:** T-19, T-20, T-21
- **Arquivos prováveis:** `tests/unit/components/search.test.tsx`, `tests/unit/components/searchState.test.tsx`

### T-38 — Testar clima, previsão e unidade com Testing Library
- **Tipo:** Test
- **Descrição:** Testar WeatherSummary, ForecastDayCard, ForecastList, UnitToggle e estados meteorológicos.
- **Critérios de aceite:**
  - Fixtures de success, partial, unavailable e stale produzem respectivamente os blocos esperados.
  - “Indisponível”, “Previsão parcial” e “Desatualizado” aparecem nos fixtures que possuem essas flags.
  - Após acionar cada opção do controle, os valores esperados de atual, mínima e máxima aparecem com a unidade selecionada.
- **Dependências:** T-22, T-23, T-24, T-25, T-26
- **Arquivos prováveis:** `tests/unit/components/weather.test.tsx`

### T-39 — Testar jornada E2E principal
- **Tipo:** Test
- **Descrição:** Cobrir com Playwright a busca, seleção, clima atual, cinco dias, unidade e nova consulta.
- **Critérios de aceite:**
  - Fixtures determinísticas cobrem AC01–AC18 e AC24, com uma asserção observável para cada fluxo.
  - Não há chamadas para a Open-Meteo real.
  - O contador de requests de forecast permanece inalterado após a troca de unidade.
  - O fluxo principal é executado em viewport mobile de 320 px e conclui busca, seleção, clima atual e previsão sem rolagem horizontal.
- **Dependências:** T-27, T-28
- **Arquivos prováveis:** `tests/e2e/weather-primary.spec.ts`, `tests/e2e/fixtures/weather.ts`

### T-40 — Testar resiliência, concorrência e viewports E2E
- **Tipo:** Test
- **Descrição:** Cobrir falhas, retry, parcialidade, cache stale, request obsoleto, teclado e matriz responsiva.
- **Critérios de aceite:**
  - Fixtures cobrem AC19–AC25, timeout, erro, parcialidade, retry e concorrência, com asserções de mensagem e estado final.
  - Em 320 px, 768 px e 1440 px, `scrollWidth <= clientWidth`.
  - `Tab` e `Enter` completam busca e troca de unidade sem clique do mouse.
- **Dependências:** T-28, T-39
- **Arquivos prováveis:** `tests/e2e/weather-resilience.spec.ts`, `playwright.config.ts`

## Entrega 6 — Hardening e entrega

### T-41 — Criar instrumentação técnica agregada
- **Tipo:** Infra
- **Descrição:** Criar helper de telemetria para latência, timeout, falhas e conversão sem dados pessoais.
- **Critérios de aceite:**
  - Eventos aceitam somente métricas técnicas agregadas.
  - Query completa, coordenadas completas e credenciais não entram nos eventos.
  - O helper não depende de React nem bloqueia a aplicação.
- **Dependências:** T-02
- **Arquivos prováveis:** `src/lib/telemetry.ts`

### T-42 — Integrar métricas nos fluxos de busca e forecast
- **Tipo:** Infra
- **Descrição:** Emitir métricas nos pontos de busca, forecast, timeout e conversão definidos no plano.
- **Critérios de aceite:**
  - São medidos primeira tela, resultados, forecast, latência, timeout e falha de conversão (RNF02, RNF08).
  - A instrumentação não altera estados funcionais nem mensagens da jornada.
  - Logs respeitam RNF06.
- **Dependências:** T-12, T-14, T-18, T-41
- **Arquivos prováveis:** `src/hooks/useWeather.ts`

### T-43 — Executar validações automatizadas de entrega
- **Tipo:** Infra
- **Descrição:** Validar lint, build, testes unitários e E2E após a implementação.
- **Critérios de aceite:**
  - `pnpm lint`, `pnpm build`, `pnpm test` e `pnpm test:e2e` passam.
  - Falhas são registradas com o comando e o escopo afetado.
  - Metas de p95 não são transformadas em testes unitários dependentes da rede.
- **Dependências:** T-29, T-30, T-31, T-32, T-33, T-34, T-35, T-36, T-37, T-38, T-39, T-40, T-42
- **Arquivos prováveis:** `package.json`

### T-44 — Auditar acessibilidade, compatibilidade e estabilidade visual
- **Tipo:** Infra
- **Descrição:** Validar WCAG AA, contraste, teclado, CLS e navegadores prioritários.
- **Critérios de aceite:**
  - A auditoria encontra nome acessível e foco em cada controle, uma região `aria-live` por estado e as razões de contraste mínimas de RNF03.
  - A matriz de execução registra resultado para os dois últimos releases estáveis de Chrome, Edge, Firefox e Safari, além de Chrome Android e Safari iOS (RNF07).
  - A medição registra CLS menor que `0,1` e `scrollWidth <= clientWidth` nos viewports definidos (RNF01).
- **Dependências:** T-28, T-40, T-43
- **Arquivos prováveis:** `README.md`, `docs/`, `playwright.config.ts`

## Prioridade e tamanho relativo

`P0` = necessário para o MVP e para a primeira jornada utilizável; `P1` =
importante para resiliência, compatibilidade ou qualidade de entrega; `P2` =
melhoria posterior que não impede a consulta principal. `S`, `M` e `G` são
tamanhos relativos de esforço e risco: pequeno, médio e grande.

| Tarefa | Prioridade | Tamanho |
| --- | --- | --- |
| T-01 | P0 | S |
| T-02 | P0 | S |
| T-03 | P0 | S |
| T-04 | P0 | S |
| T-05 | P0 | M |
| T-06 | P0 | M |
| T-07 | P0 | M |
| T-08 | P0 | S |
| T-09 | P0 | M |
| T-10 | P0 | M |
| T-11 | P0 | M |
| T-12 | P0 | M |
| T-13 | P0 | S |
| T-14 | P0 | M |
| T-15 | P0 | M |
| T-16 | P1 | M |
| T-17 | P1 | M |
| T-18 | P0 | S |
| T-19 | P0 | S |
| T-20 | P0 | S |
| T-21 | P0 | S |
| T-22 | P0 | M |
| T-23 | P0 | S |
| T-24 | P0 | S |
| T-25 | P0 | S |
| T-26 | P0 | S |
| T-27 | P0 | G |
| T-28 | P0 | M |
| T-29 | P0 | S |
| T-30 | P0 | S |
| T-31 | P0 | M |
| T-32 | P0 | M |
| T-33 | P0 | M |
| T-34 | P0 | M |
| T-35 | P0 | M |
| T-36 | P1 | M |
| T-37 | P0 | M |
| T-38 | P0 | M |
| T-39 | P0 | G |
| T-40 | P1 | G |
| T-41 | P2 | S |
| T-42 | P2 | M |
| T-43 | P0 | M |
| T-44 | P1 | G |

## Sequência de entrega em fatias verticais

As fatias abaixo priorizam uma experiência visível cedo. Cada fatia atravessa
as camadas necessárias; as dependências anteriores continuam sendo concluídas
antes de executar a tarefa que as consome.

1. **Base executável:** T-01–T-11. Entrega contratos, helpers e adapters
  testáveis para consultar geocoding e forecast sem UI.
2. **Primeira experiência visível:** T-12–T-18 e T-19–T-28. Conecta busca,
  seleção, clima atual, previsão, unidade, loading/erro, cache e layout no
  app. Este é o primeiro marco de valor visível, pois inclui todas as
  dependências da integração T-27.
3. **Cobertura da primeira fatia:** T-29–T-34 e T-37–T-39. Consolida testes
  unitários, services com mock de `fetch`, hook, estados de componentes e o
  fluxo principal E2E em mobile.
4. **Resiliência:** T-35–T-36 e T-40. Acrescenta testes de concorrência, retry,
  cache, freshness, respostas parciais e cenários de falha em múltiplos
  viewports.
5. **Hardening e entrega:** T-41–T-44. Adiciona telemetria, validações de
  qualidade, compatibilidade, acessibilidade e estabilidade visual.

## Rastreabilidade requisito funcional → tarefa

As tarefas de implementação aparecem separadas das tarefas de validação para
deixar claro qual item constrói cada comportamento e qual item o verifica.

| Requisito da spec | Implementação | Validação | Status |
| --- | --- | --- | --- |
| RF01 — Buscar cidades | T-09, T-12, T-13, T-19, T-21, T-27 | T-32, T-34, T-37, T-39 | Coberto |
| RF02 — Desambiguar e selecionar uma cidade | T-08, T-13, T-20, T-27 | T-32, T-34, T-37, T-39 | Coberto |
| RF03 — Exibir clima atual | T-10, T-11, T-14, T-22, T-27 | T-33, T-38, T-39 | Coberto |
| RF04 — Exibir previsão de cinco dias | T-06, T-11, T-14, T-23, T-24, T-27 | T-30, T-33, T-38, T-39 | Coberto |
| RF05 — Alternar unidade de temperatura | T-03, T-18, T-25, T-27 | T-29, T-36, T-38, T-39 | Coberto |
| RF06 — Informar atualização dos dados | T-05, T-17, T-22, T-27 | T-30, T-36, T-38, T-40 | Coberto |
| RF07 — Tratar estados da experiência | T-02, T-07, T-14, T-17, T-21, T-26, T-27 | T-31, T-34, T-35, T-37, T-38, T-40 | Coberto |
| RF08 — Realizar novas consultas | T-13, T-14, T-19, T-27 | T-34, T-35, T-37, T-39 | Coberto |

**Requisitos funcionais sem tarefa correspondente:** nenhum. Todos os RF01 a
RF08 possuem pelo menos uma tarefa de implementação e uma tarefa de validação.