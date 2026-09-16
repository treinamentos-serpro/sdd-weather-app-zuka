# Especificação de Produto — Weather App

## Overview

O Weather App é uma aplicação web responsiva, em pt-BR, para consulta rápida
das condições meteorológicas de uma cidade. O usuário pesquisa e seleciona uma
localidade, visualiza o clima atual e consulta uma previsão diária de cinco
dias, composta pelo dia atual e pelos quatro dias seguintes.

### Objetivos

- Permitir que uma pessoa encontre uma cidade e veja sua condição meteorológica
  sem criar conta ou fazer login.
- Apresentar informações atuais e uma visão de curto prazo de forma clara para
  decisões de deslocamento e planejamento de atividades.
- Funcionar adequadamente em celulares, tablets e telas desktop.
- Oferecer Celsius como unidade inicial e permitir a alternância para
  Fahrenheit.

### Público e contexto de uso

- Pessoas em deslocamento que precisam de uma consulta rápida antes de sair.
- Pessoas que planejam passeios ou atividades para os próximos dias.
- Pessoas que trabalham ao ar livre e precisam verificar dados recentes, mesmo
  em telas pequenas ou redes instáveis.

### Fonte e limites do produto

- A fonte de geocodificação e previsão será a Open-Meteo, sem API key na
  primeira versão.
- A interface exibirá uma cidade por vez.
- A primeira versão será uma aplicação web responsiva, sem autenticação e sem
  persistência em servidor.

### Decisões de produto

- A busca será iniciada após 300 ms sem digitação, a partir de dois caracteres,
  e também poderá ser confirmada por Enter ou pelo controle de busca.
- A lista exibirá no máximo 10 resultados, ordenados por relevância da
  correspondência e depois por localidade.
- Datas e horários meteorológicos seguirão o fuso horário da cidade consultada.
- A unidade selecionada valerá durante a sessão do navegador e não será
  persistida entre sessões.
- A conversão será feita a partir do valor original em Celsius e arredondada
  para o inteiro mais próximo antes da exibição.
- Uma resposta parcial exibirá campos válidos, marcará campos ausentes como
  indisponíveis e não apresentará a previsão como completa.
- Dados em cache terão validade máxima de 30 minutos. Fora desse prazo, serão
  exibidos apenas como indisponíveis, sem serem usados como dados atuais.

## Functional Requirements

### RF01 — Buscar cidades

O sistema deve permitir que o usuário pesquise uma cidade por nome. A busca
deve ser disparada após 300 ms sem digitação a partir de dois caracteres, ou
imediatamente após Enter/ação explícita de busca, e deve apresentar no máximo
10 resultados compatíveis.

### RF02 — Desambiguar e selecionar uma cidade

O sistema deve permitir a seleção de um resultado e apresentar contexto
suficiente para diferenciar localidades homônimas, incluindo cidade, país e,
quando disponível ou necessário, região/estado.

### RF03 — Exibir clima atual

Após a seleção de uma cidade, o sistema deve exibir a temperatura atual, a
condição meteorológica em texto, a cidade e o país, a unidade ativa e a data e
hora da atualização dos dados. O ícone, quando presente, deve ser complementar
ao texto.

### RF04 — Exibir previsão de cinco dias

Após a seleção de uma cidade, o sistema deve exibir uma previsão diária de
exatamente cinco dias: hoje e os quatro dias seguintes. Cada dia deve informar
a data ou dia da semana, as temperaturas mínima e máxima, a condição
meteorológica em texto e/ou ícone e a unidade ativa.

### RF05 — Alternar unidade de temperatura

O usuário deve poder alternar entre Celsius e Fahrenheit. A unidade ativa deve
ser identificável e a mudança deve atualizar a temperatura atual e todos os
valores de mínima e máxima da previsão. A unidade escolhida permanece ativa
durante a sessão do navegador e começa em Celsius em uma nova sessão.

### RF06 — Informar atualização dos dados

O sistema deve exibir a data e hora associadas aos dados meteorológicos
apresentados, no fuso horário da cidade consultada, permitindo ao usuário
avaliar sua atualidade. Dados com mais de 30 minutos devem ser identificados
como desatualizados.

### RF07 — Tratar estados da experiência

O sistema deve comunicar os estados de carregamento, ausência de cidade
selecionada, ausência de resultados, erro de comunicação e ausência de dados
meteorológicos. Em falhas recuperáveis, deve exibir a ação “Tentar novamente”.
Campos ausentes devem ser marcados como “Indisponível”, sem serem substituídos
por valores estimados.

### RF08 — Realizar novas consultas

Depois de uma consulta concluída ou com erro, o usuário deve poder pesquisar e
selecionar outra cidade sem reiniciar a aplicação.

## User Stories

### US01 — Buscar e selecionar uma cidade (RF01, RF02)

Como Camila, profissional em deslocamento, quero buscar e selecionar a cidade em que estou ou para a qual vou para consultar o clima rapidamente e decidir roupa, transporte e necessidade de guarda-chuva.

### US02 — Consultar o clima atual (RF03, RF06)

Como Camila, profissional em deslocamento, quero visualizar a condição atual, a temperatura e o horário da atualização para confiar na informação antes de sair.

### US03 — Planejar atividades ao longo da semana (RF04)

Como Rafael, planejador de atividades, quero visualizar a previsão de hoje e dos quatro dias seguintes com temperaturas mínima e máxima para escolher a melhor data para um passeio ou viagem curta.

### US04 — Alternar a unidade de temperatura (RF05)

Como Rafael, planejador de atividades, quero alternar entre Celsius e Fahrenheit para interpretar as temperaturas de acordo com o destino e minha preferência.

### US05 — Entender falhas em uma rede instável (RF07)

Como Joana, profissional que trabalha ao ar livre, quero receber mensagens claras sobre carregamento, indisponibilidade ou dados ausentes e poder tentar novamente para saber como agir quando a conexão falhar.

### US06 — Consultar outra localidade (RF08)

Como Joana, profissional que trabalha ao ar livre, quero pesquisar e selecionar outra localidade depois de uma consulta para verificar o destino da próxima atividade sem reiniciar a aplicação.

## Acceptance Criteria

### RF01 / US01 — Busca

- **AC01** — **Given** que o usuário informou pelo menos dois caracteres, **When** ficam 300 ms sem nova digitação, **Then** o sistema envia uma busca e apresenta no máximo 10 resultados compatíveis.
- **AC02** — **Given** que o usuário informou um termo com pelo menos dois caracteres, **When** pressiona Enter ou aciona o controle de busca, **Then** o sistema envia a busca imediatamente, sem aguardar novo intervalo de digitação.
- **AC03** — **Given** que existem resultados para a busca, **When** a lista é exibida, **Then** cada resultado contém pelo menos cidade e país, incluindo região/estado quando necessário para desambiguar.
- **AC04** — **Given** que o campo de busca está vazio ou contém apenas espaços, **When** o usuário tenta buscar, **Then** o sistema não envia uma consulta e orienta o preenchimento do campo.
- **AC05** — **Given** que não há correspondência para o termo informado, **When** a busca termina, **Then** o sistema exibe uma mensagem explícita de nenhum resultado encontrado.

### RF02 / US01 — Seleção

- **AC06** — **Given** que a lista contém resultados, **When** o usuário seleciona uma cidade, **Then** a cidade e o país selecionados ficam claramente identificados.
- **AC07** — **Given** que uma cidade foi selecionada, **When** a consulta meteorológica é iniciada, **Then** o sistema usa a localidade selecionada e não apenas o texto original da busca.
- **AC08** — **Given** que a seleção ou a consulta associada falha, **When** o erro é exibido, **Then** o usuário pode fazer uma nova busca ou tentar novamente.

### RF03 / US02 — Clima atual

- **AC09** — **Given** que uma cidade válida foi selecionada e os dados estão disponíveis, **When** o carregamento termina, **Then** o sistema exibe temperatura atual, condição meteorológica em texto, cidade, país, unidade ativa e atualização dos dados.
- **AC10** — **Given** que a temperatura atual está disponível em Celsius ou Fahrenheit, **When** o valor é exibido, **Then** ele inclui indicação inequívoca da unidade.

### RF04 / US03 — Previsão

- **AC11** — **Given** que uma cidade válida foi selecionada e os dados estão disponíveis, **When** o carregamento termina, **Then** o sistema exibe exatamente cinco itens diários, correspondentes a hoje e aos quatro dias seguintes.
- **AC12** — **Given** que os cinco itens diários são exibidos, **When** o usuário os consulta, **Then** cada item informa data ou dia da semana, mínima, máxima e condição meteorológica.
- **AC13** — **Given** que a previsão está disponível, **When** a unidade é alterada, **Then** as mínimas e máximas dos cinco dias refletem a nova unidade sem novo request meteorológico.

### RF05 / US04 — Unidade

- **AC14** — **Given** que a unidade atual é Celsius e a temperatura original é conhecida, **When** o usuário seleciona Fahrenheit, **Then** a temperatura atual e todas as temperaturas da previsão exibem `round(C × 9/5 + 32)` e Fahrenheit fica identificada como ativa.
- **AC15** — **Given** que a unidade atual é Fahrenheit e a temperatura original em Celsius é conhecida, **When** o usuário seleciona Celsius, **Then** a temperatura atual e todas as temperaturas da previsão exibem o valor Celsius original arredondado e Celsius fica identificada como ativa.
- **AC16** — **Given** que os dados meteorológicos já estão carregados, **When** o usuário alterna a unidade, **Then** a aplicação atualiza os valores sem exigir nova busca de cidade ou nova consulta meteorológica.

### RF06 / US02 — Atualização

- **AC17** — **Given** que dados meteorológicos são exibidos, **When** o usuário consulta a tela, **Then** ela apresenta a data e hora da atualização no fuso da cidade e em formato pt-BR.
- **AC18** — **Given** que os dados têm mais de 30 minutos, **When** a tela é apresentada, **Then** a interface informa a idade ou o horário dos dados e exibe o estado “Desatualizado”.

### RF07 / US05 — Estados

- **AC19** — **Given** que uma busca de cidade ou consulta meteorológica está em andamento, **When** o usuário aguarda a resposta, **Then** o sistema exibe um indicador de carregamento e mantém o contexto da operação compreensível.
- **AC20** — **Given** que uma chamada externa falha ou expira, **When** o erro é detectado, **Then** o sistema exibe uma mensagem de indisponibilidade e o controle “Tentar novamente”.
- **AC21** — **Given** que nenhum resultado é encontrado, **When** a busca termina, **Then** o sistema diferencia esse estado de uma falha de comunicação e orienta o próximo passo.
- **AC22** — **Given** que nenhuma cidade foi selecionada, **When** a tela inicial é exibida, **Then** a interface orienta o usuário a pesquisar uma cidade.
- **AC23** — **Given** que a resposta contém campos ausentes, **When** o processamento termina, **Then** os campos disponíveis são exibidos, os ausentes mostram “Indisponível” e a previsão é marcada como parcial.

### RF08 / US06 — Nova consulta

- **AC24** — **Given** que uma cidade já foi consultada, **When** o usuário pesquisa e seleciona outra cidade, **Then** o conteúdo meteorológico é atualizado para a nova localidade sem reiniciar a aplicação.
- **AC25** — **Given** que uma nova consulta falha, **When** o erro é exibido, **Then** a interface mantém disponível a ação de pesquisar novamente.

## Traceability Matrix

| User Story | Functional Requirements | Acceptance Criteria | Relevant Non-Functional Requirements |
| --- | --- | --- | --- |
| US01 — Buscar e selecionar uma cidade | RF01, RF02 | AC01–AC08 | RNF01 Responsividade; RNF02 Desempenho; RNF03 Acessibilidade; RNF06 Segurança e privacidade; RNF07 Compatibilidade e idioma |
| US02 — Consultar o clima atual | RF03, RF06 | AC09–AC10, AC17–AC18 | RNF01 Responsividade; RNF02 Desempenho; RNF03 Acessibilidade; RNF05 Atualidade dos dados; RNF07 Compatibilidade e idioma |
| US03 — Planejar atividades ao longo da semana | RF04 | AC11–AC13 | RNF01 Responsividade; RNF02 Desempenho; RNF03 Acessibilidade; RNF05 Atualidade dos dados; RNF07 Compatibilidade e idioma |
| US04 — Alternar a unidade de temperatura | RF05 | AC14–AC16 | RNF02 Desempenho; RNF03 Acessibilidade; RNF06 Segurança e privacidade; RNF08 Observabilidade |
| US05 — Entender falhas em uma rede instável | RF07 | AC19–AC23 | RNF03 Acessibilidade; RNF04 Resiliência e disponibilidade; RNF05 Atualidade dos dados; RNF06 Segurança e privacidade; RNF08 Observabilidade |
| US06 — Consultar outra localidade | RF08 | AC24–AC25 | RNF01 Responsividade; RNF02 Desempenho; RNF03 Acessibilidade; RNF04 Resiliência e disponibilidade; RNF07 Compatibilidade e idioma |

Os identificadores `AC01`–`AC25` são a referência para tarefas, testes
automatizados e casos de teste de aceitação. Um requisito não-funcional listado
na matriz aplica-se à jornada completa da story, mesmo quando não aparece em um
critério funcional específico.

## Non-Functional Requirements

### RNF01 — Responsividade e estabilidade visual

- A jornada principal deve permanecer utilizável entre 320 px e 1440 px de
  largura, sem rolagem horizontal.
- O layout deve adaptar controles, tipografia e conteúdo para mobile, tablet e
  desktop.
- A atualização dos dados não deve deslocar inesperadamente o conteúdo
  principal; a meta de CLS para a jornada principal é inferior a 0,1.

### RNF02 — Desempenho

- Em uma conexão móvel 4G, no dispositivo de referência da matriz de suporte,
  a primeira tela utilizável deve carregar em até 2 segundos no percentil  p95.
- Após uma resposta bem-sucedida da fonte, a previsão deve ficar disponível em
  até 3 segundos no p95.
- Após o usuário parar de digitar, a busca deve ser enviada em 300 ms, e os
  primeiros resultados devem aparecer em até 1 segundo no p95, excluindo a
  latência da fonte externa.

### RNF03 — Acessibilidade

- A jornada principal deve atender ao nível AA das WCAG 2.2.
- Todos os controles devem ser operáveis por teclado, possuir nome acessível e
  apresentar foco visível.
- Condições meteorológicas, carregamento, erro e sucesso não podem ser
  comunicados somente por cor ou ícone; mudanças de estado devem ser anunciadas
  por tecnologia assistiva.
- O contraste de texto normal deve ser de no mínimo 4,5:1 e o de texto grande
  de no mínimo 3:1.

### RNF04 — Resiliência e disponibilidade

- Falhas e timeouts da fonte externa não devem travar a interface nem impedir
  uma nova tentativa.
- Quando houver dados anteriores em cache com até 30 minutos, a aplicação pode
  preservá-los, mas deve indicar claramente a data e hora e o estado
  “Desatualizado”.
- Dados em cache com mais de 30 minutos não devem ser usados para preencher o
  clima atual ou a previsão.
- A meta de disponibilidade mensal do serviço é 99,5%, excluindo manutenções
  programadas.

### RNF05 — Atualidade dos dados

- Em condições normais, os dados meteorológicos exibidos não devem ter mais de
  30 minutos, conforme a disponibilidade e o contrato da fonte.
- Quando essa meta não puder ser cumprida, a idade dos dados deve ser
  transparente para o usuário.

### RNF06 — Segurança e privacidade

- A aplicação deve minimizar a coleta de dados pessoais e não deve exigir
  cadastro para a consulta.
- Entradas de busca devem ser tratadas sem permitir execução de conteúdo não
  confiável.
- Nenhum segredo ou credencial de serviço externo pode ser exposto ao cliente.
- Logs e métricas devem evitar dados pessoais desnecessários.

### RNF07 — Compatibilidade e idioma

- A jornada principal deve funcionar nas duas versões estáveis mais recentes
  de Chrome, Edge, Firefox e Safari, incluindo Chrome no Android e Safari no
  iOS.
- Os textos da primeira versão devem estar em português do Brasil.
- Datas e horários devem seguir o fuso horário da cidade consultada, e datas,
  números e textos devem seguir a localidade pt-BR.

### RNF08 — Observabilidade

- Devem ser mensuráveis falhas de busca, falhas de previsão, tempos de resposta
  e erros de conversão de unidade.
- Os registros devem permitir investigar indisponibilidade e desempenho sem
  armazenar dados pessoais desnecessários.

## Edge Cases

| Situação | Comportamento esperado |
| --- | --- |
| Campo vazio ou só com espaços | Não enviar busca e orientar o preenchimento. |
| Cidade inexistente | Exibir estado vazio explícito, sem tratar como erro da API. |
| Nome com acentos ou caracteres especiais | Aceitar a entrada e buscar normalmente. |
| Muitas cidades homônimas | Exibir país e região/estado para permitir escolha segura. |
| Resultado sem região/estado | Usar os demais dados disponíveis sem bloquear a seleção. |
| Timeout na geocodificação | Informar falha de comunicação e oferecer nova tentativa. |
| Falha no forecast após geocodificação | Preservar a cidade selecionada e oferecer nova tentativa da previsão. |
| API indisponível ou com limite excedido | Exibir mensagem de indisponibilidade e “Tentar novamente”; usar somente cache de até 30 minutos, marcado como “Desatualizado”. |
| Resposta sem temperatura ou condição | Não inventar valores; indicar dado indisponível e manter o layout utilizável. |
| Resposta parcial da previsão | Exibir campos válidos, marcar ausentes como “Indisponível” e identificar a previsão como parcial. |
| Temperatura negativa ou igual a zero | Exibir corretamente o sinal e a unidade. |
| Alternância repetida de unidade | Manter valores consistentes e não acumular erro de arredondamento. |
| Consulta de outra cidade durante carregamento | Garantir que uma resposta antiga não substitua os dados da cidade mais recentemente selecionada. |
| Rede perdida durante a consulta | Encerrar ou sinalizar o carregamento, preservar o contexto e permitir nova tentativa. |
| Tela de 320 px | Manter controles e conteúdo acessíveis sem rolagem horizontal. |

## Assumptions

- A primeira versão será uma aplicação web responsiva, sem instalação nativa.
- A Open-Meteo fornecerá geocodificação e previsão sem necessidade de API key.
- O usuário consultará uma cidade por vez e informará o nome manualmente.
- A previsão será diária, não horária, e incluirá hoje mais os quatro dias
  seguintes.
- Celsius será a unidade padrão; Celsius e Fahrenheit serão as únicas unidades
  da primeira versão.
- O idioma inicial será pt-BR.
- O usuário não precisará de conta, autenticação ou localização automática para
  consultar uma cidade.
- Resultados de busca terão contexto suficiente para reduzir a escolha de uma
  cidade homônima.
- O navegador e a conexão permitirão acesso à fonte externa na maior parte das
  consultas.
- A unidade não será persistida entre sessões e o cache obedecerá ao limite de
  30 minutos definido nesta especificação.

## Risks

| ID | Risco | Mitigação |
| --- | --- | --- |
| R01 | A Open-Meteo pode ficar indisponível, lenta, limitada por quota ou alterar seu contrato. | Validar limites e termos, aplicar timeout e retry limitado, monitorar falhas e comunicar degradação. |
| R02 | A geocodificação pode retornar homônimos ou coordenadas inadequadas. | Exibir país e região/estado, usar o identificador da localidade selecionada e testar casos ambíguos. |
| R03 | Dados antigos podem ser interpretados como atuais. | Exibir timestamp, definir idade máxima e identificar claramente dados em cache ou degradados. |
| R04 | A definição de cinco dias pode não atender expectativas futuras de previsão horária. | Fixar no MVP a visão diária de hoje mais quatro dias e registrar a previsão horária como evolução. |
| R05 | Conversões e arredondamentos podem produzir temperaturas inconsistentes. | Definir uma regra única de conversão e cobrir as duas unidades nos testes. |
| R06 | Chamadas excessivas de busca ou previsão podem prejudicar latência e quota. | Definir espera após digitação, cancelar consultas obsoletas, reutilizar dados quando apropriado e medir percentis. |
| R07 | Falhas parciais podem gerar tela vazia ou dados enganosos. | Modelar estados de loading, vazio, erro e dados incompletos; não substituir campos ausentes por valores inventados. |
| R08 | A experiência pode ser difícil de usar em telas pequenas, redes móveis ou com tecnologia assistiva. | Projetar mobile-first, testar a matriz de larguras, teclado, leitores de tela e estados de rede. |
| R09 | Logs ou integrações podem expor dados pessoais ou credenciais. | Minimizar telemetria, revisar retenção e manter segredos fora do cliente. |
| R10 | O escopo pode crescer com favoritos, alertas, mapas, localização automática ou autenticação. | Manter o MVP e o fora de escopo explícitos e exigir decisão de produto para expansão. |

## Out of Scope

Os itens abaixo não fazem parte da primeira versão:

- Cadastro, autenticação, perfis e sincronização entre dispositivos.
- Favoritos, histórico persistente e gerenciamento de múltiplas cidades.
- Geolocalização automática ou solicitação de permissão de localização.
- Alertas meteorológicos, notificações push e avisos personalizados.
- Compartilhamento de previsões.
- Mapas, radar meteorológico e camadas geográficas.
- Previsão horária ou previsões para período superior a cinco dias.
- Edição manual dos dados meteorológicos.
- Idiomas diferentes de pt-BR.
- Aplicativos nativos para Android ou iOS.

## Open Questions

As perguntas abaixo são decisões operacionais ou de evolução e não bloqueiam o
contrato funcional do MVP:

1. Quais países e regiões terão prioridade comercial além da cobertura técnica
  disponível na Open-Meteo?
2. Quais campos adicionais, como sensação térmica, umidade, vento,
  precipitação, pressão e índice UV, entrarão em uma evolução?
3. Quais métricas de negócio acompanharão sucesso, além das metas técnicas de
  busca e carregamento?
4. Qual identidade visual, tom de voz e catálogo de ícones devem ser adotados?
5. Qual equipe será responsável por monitoramento, suporte e resposta a
  incidentes?
