# Discovery - Aplicação de Previsão do Tempo

## Contexto

A empresa solicitou uma aplicação de previsão do tempo voltada a usuários que precisam consultar rapidamente as condições meteorológicas de uma cidade. O produto deve permitir a busca de cidades, exibir o clima atual e apresentar uma previsão para os cinco dias seguintes.

A experiência deve funcionar em dispositivos móveis e oferecer alternância entre Celsius e Fahrenheit, atendendo usuários com diferentes preferências e localidades. Como o briefing ainda não define integrações, regras de negócio ou critérios detalhados de qualidade, esta análise registra o entendimento inicial e os pontos que precisam ser refinados antes do planejamento técnico.

### Objetivo de negócio

Disponibilizar uma consulta simples, rápida e compreensível das condições atuais e da previsão de curto prazo para cidades escolhidas pelo usuário.

### Escopo inicial

- Busca e seleção de cidades.
- Visualização do clima atual da cidade selecionada.
- Visualização da previsão de cinco dias.
- Alternância entre Celsius e Fahrenheit.
- Uso em dispositivos móveis.

### Fora do escopo inicialmente identificado

- Cadastro, autenticação ou perfis de usuário.
- Persistência de cidades favoritas.
- Alertas meteorológicos ou notificações.
- Previsões para períodos superiores a cinco dias.
- Compartilhamento de previsões.

## Personas

### Persona 1 - Camila, profissional em deslocamento

- **Perfil:** Camila trabalha em um escritório e se desloca diariamente pela cidade. Ela consulta o clima pouco antes de sair para decidir roupa, transporte e necessidade de guarda-chuva.
- **Objetivo principal:** Obter rapidamente uma leitura confiável do clima atual e das próximas horas/dias para a cidade em que está ou para o destino.
- **Contexto de uso:** Principalmente mobile, em deslocamentos e redes móveis; pode fazer consultas rápidas no desktop durante o planejamento da manhã.
- **Métrica de sucesso:** Conseguir buscar ou selecionar uma cidade e visualizar o clima em até 30 segundos, sem precisar repetir a consulta.

### Persona 2 - Rafael, planejador de atividades

- **Perfil:** Rafael organiza passeios, viagens curtas e atividades ao ar livre com antecedência. Ele compara a previsão de vários dias antes de confirmar seus planos.
- **Objetivo principal:** Consultar a previsão de cinco dias com clareza suficiente para escolher a melhor data e entender temperaturas mínimas e máximas.
- **Contexto de uso:** Desktop ou tablet para planejar; mobile para confirmar a previsão fora de casa. Pode alternar entre Celsius e Fahrenheit conforme o destino.
- **Métrica de sucesso:** Conseguir avaliar os cinco dias de uma cidade em uma única visualização e identificar a melhor janela para sua atividade sem recorrer a outra fonte.

### Persona 3 - Joana, profissional que trabalha ao ar livre

- **Perfil:** Joana atua em campo e precisa decidir diariamente se uma atividade externa pode ser realizada com segurança e conforto.
- **Objetivo principal:** Consultar dados atuais e previsão recente de uma localidade específica, com indicação clara de atualização e funcionamento confiável em condições de conectividade limitada.
- **Contexto de uso:** Principalmente mobile, em ambiente externo, com telas pequenas, brilho variável e rede instável.
- **Métrica de sucesso:** Encontrar a localidade correta e confirmar a condição meteorológica mais recente em até 1 minuto, com timestamp visível e orientação clara quando os dados estiverem indisponíveis ou desatualizados.

## Decisões

### D01 - Fonte de dados: Open-Meteo

- **Decisão:** A aplicação utilizará a Open-Meteo como fonte de geocodificação e dados meteorológicos, sem API key.
- **Justificativa:** A fonte atende ao escopo inicial sem exigir gerenciamento de credenciais e reduz a barreira operacional para a primeira versão.
- **Perguntas resolvidas:** Define a fonte de dados, elimina a necessidade inicial de autenticação com o provedor e orienta as decisões sobre cobertura, limites de uso e contrato de integração. Esses limites ainda devem ser confirmados na documentação da Open-Meteo.

### D02 - Janela da previsão: hoje + 4 dias

- **Decisão:** A previsão de cinco dias será composta pelo dia atual e pelos quatro dias seguintes, em visão diária.
- **Justificativa:** Mantém o total de cinco dias solicitado e estabelece uma interpretação única para produto, API e critérios de aceite.
- **Perguntas resolvidas:** Define se o dia atual está incluído e elimina a ambiguidade sobre a janela temporal. A necessidade de previsão horária permanece fora da decisão e deve ser tratada como evolução ou pergunta residual.

### D03 - Unidade padrão: Celsius

- **Decisão:** A aplicação exibirá temperaturas em Celsius por padrão.
- **Justificativa:** O padrão é adequado ao idioma e ao mercado inicial definido para a interface, pt-BR.
- **Perguntas resolvidas:** Define o valor inicial da unidade e o comportamento esperado no primeiro acesso. A persistência da preferência e a disponibilidade do seletor Fahrenheit continuam sendo decisões funcionais já previstas no escopo.

### D04 - Sem autenticação e sem persistência de servidor

- **Decisão:** A primeira versão não terá autenticação, contas de usuário nem persistência de dados em servidor.
- **Justificativa:** Mantém o produto focado na consulta imediata e reduz complexidade de segurança, infraestrutura e privacidade.
- **Perguntas resolvidas:** Retira autenticação, histórico sincronizado e favoritos persistidos do escopo inicial. Preferências locais temporárias, como a unidade selecionada no navegador, só poderão ser adotadas se não exigirem conta ou armazenamento em servidor.

### D05 - Idioma da interface: pt-BR

- **Decisão:** Todos os textos da interface serão disponibilizados inicialmente em português do Brasil.
- **Justificativa:** Estabelece um público e uma experiência linguística coerentes para a primeira entrega.
- **Perguntas resolvidas:** Define o idioma inicial, o formato textual da interface e a localidade de referência para datas, números e unidades. Suporte a outros idiomas fica fora da primeira versão, salvo nova decisão.

## Requisitos Funcionais

### RF01 - Buscar cidades

O sistema deve permitir que o usuário pesquise uma cidade por nome e apresente resultados compatíveis para seleção.

**Critérios de aceite preliminares:**

- O usuário consegue informar o nome de uma cidade.
- O sistema apresenta resultados correspondentes quando houver correspondência.
- Cada resultado deve conter informação suficiente para diferenciar cidades homônimas, como país e, quando necessário, região/estado.
- O sistema informa quando não encontra resultados.

### RF02 - Selecionar uma cidade

O usuário deve poder selecionar uma cidade entre os resultados da busca para consultar seus dados meteorológicos.

**Critérios de aceite preliminares:**

- A cidade selecionada fica claramente identificada na tela.
- A seleção inicia ou atualiza a consulta meteorológica.
- O sistema trata falhas na busca ou na seleção sem perder a possibilidade de nova tentativa.

### RF03 - Exibir clima atual

O sistema deve exibir as condições meteorológicas atuais da cidade selecionada.

**Dados esperados, sujeitos à confirmação da fonte de dados:**

- Temperatura atual.
- Condição meteorológica, com texto e/ou ícone.
- Cidade e país.
- Data e hora da última atualização.
- Unidade de temperatura ativa.

### RF04 - Exibir previsão de cinco dias

O sistema deve exibir a previsão meteorológica dos cinco dias seguintes para a cidade selecionada.

**Dados esperados, sujeitos à confirmação da fonte de dados:**

- Data ou dia da semana.
- Temperatura mínima e máxima.
- Condição meteorológica, com texto e/ou ícone.
- Unidade de temperatura ativa.

### RF05 - Alternar unidade de temperatura

O usuário deve poder alternar entre Celsius e Fahrenheit.

**Critérios de aceite preliminares:**

- A unidade ativa é identificável na interface.
- A temperatura atual e todos os valores da previsão são convertidos e exibidos na unidade escolhida.
- A alternância não exige uma nova busca de cidade.
- O comportamento de persistência da preferência deve ser definido: apenas durante a sessão ou também entre acessos.

### RF06 - Tratar estados da experiência

O sistema deve apresentar estados compreensíveis para carregamento, ausência de resultados, erro de comunicação e ausência de dados meteorológicos.

**Critérios de aceite preliminares:**

- O usuário sabe quando uma consulta está em andamento.
- O usuário recebe uma mensagem acionável em caso de erro, incluindo opção de tentar novamente quando aplicável.
- A interface inicial orienta o usuário a buscar uma cidade quando nenhuma cidade estiver selecionada.

### RF07 - Permitir nova consulta

Após consultar uma cidade, o usuário deve poder buscar e selecionar outra cidade sem reiniciar a aplicação.

## Requisitos Não-Funcionais

### RNF01 - Responsividade

A aplicação deve adaptar layout, tipografia e controles para dispositivos móveis e telas maiores, sem perda de conteúdo ou necessidade de rolagem horizontal.

### RNF02 - Usabilidade

A jornada principal deve ser direta: buscar cidade, selecionar resultado e visualizar o clima. Informações, unidades e estados da interface devem ser claros para usuários não técnicos.

### RNF03 - Acessibilidade

A aplicação deve ser utilizável por teclado e tecnologias assistivas, com estrutura semântica, rótulos acessíveis, contraste adequado e estados comunicados de forma não dependente apenas de cor.

### RNF04 - Desempenho percebido

A interface deve fornecer feedback imediato durante buscas e carregamento dos dados. Consultas devem ser evitadas ou canceladas quando não forem mais relevantes, conforme a solução técnica definida.

### RNF05 - Disponibilidade e resiliência

Falhas ou indisponibilidade temporária da fonte meteorológica devem ser tratadas de forma controlada, com mensagem compreensível e possibilidade de nova tentativa.

### RNF06 - Atualidade dos dados

A aplicação deve informar a data e hora da última atualização dos dados. A frequência de atualização e a política de cache devem ser definidas com base na fonte de dados e no objetivo do produto.

### RNF07 - Segurança e privacidade

A solução deve minimizar a coleta de dados pessoais. Entradas de busca devem ser tratadas com segurança, e credenciais de serviços externos, caso existam, não devem ser expostas no cliente.

### RNF08 - Compatibilidade

A aplicação deve funcionar nos navegadores móveis e desktop suportados pela empresa. A matriz de navegadores e versões ainda precisa ser definida.

### RNF09 - Internacionalização

O formato de temperatura, datas, horários, nomes de localidades e textos deve considerar idioma e região do usuário. O escopo inicial de idiomas ainda precisa ser confirmado.

## Revisão da Classificação dos Requisitos

### Requisitos funcionais

| Item | Classificação | Avaliação |
| --- | --- | --- |
| RF01 - Buscar cidades | Funcional | Correto: descreve uma capacidade que o usuário executa e o resultado esperado. |
| RF02 - Selecionar uma cidade | Funcional | Correto: descreve uma ação do usuário que inicia ou atualiza uma consulta. |
| RF03 - Exibir clima atual | Funcional | Correto: descreve informação que o sistema deve apresentar. Os dados listados são parte do comportamento observável. |
| RF04 - Exibir previsão de cinco dias | Funcional | Correto: define o conteúdo que deve ser disponibilizado ao usuário. |
| RF05 - Alternar unidade de temperatura | Funcional | Correto quanto à alternância e conversão. A persistência da preferência ainda é uma pergunta em aberto, portanto não deve ser tratada como comportamento fechado. |
| RF06 - Tratar estados da experiência | Funcional | Correto: carregamento, erro, vazio e tentativa novamente são estados e respostas observáveis do sistema. |
| RF07 - Permitir nova consulta | Funcional | Correto: descreve uma jornada que o usuário deve conseguir realizar. |

### Requisitos não-funcionais

| Item | Classificação | Avaliação |
| --- | --- | --- |
| RNF01 - Responsividade | Não-funcional | Correto: define uma qualidade de adaptação da interface a diferentes dispositivos. |
| RNF02 - Usabilidade | Não-funcional | Correto: define facilidade e clareza de uso, embora deva receber métricas ou critérios de teste. |
| RNF03 - Acessibilidade | Não-funcional | Correto: define atributos de acessibilidade da solução. |
| RNF04 - Desempenho percebido | Não-funcional | Correto: define tempo de resposta e eficiência percebida. A exigência de cancelar consultas é uma restrição técnica associada ao desempenho. |
| RNF05 - Disponibilidade e resiliência | Parcialmente incorreto | A disponibilidade e a resiliência são não-funcionais, mas exibir mensagem de erro e oferecer nova tentativa são requisitos funcionais. Recomenda-se separar esses comportamentos em RF06 e deixar aqui metas de disponibilidade, recuperação e degradação. |
| RNF06 - Atualidade dos dados | Parcialmente incorreto | Informar data/hora de atualização é funcional; limite de idade dos dados, cache e frequência de atualização são não-funcionais. Recomenda-se dividir o item. |
| RNF07 - Segurança e privacidade | Não-funcional | Correto: define restrições e qualidades de proteção da solução. |
| RNF08 - Compatibilidade | Não-funcional | Correto: define ambientes suportados, mas precisa de uma matriz de navegadores e versões. |
| RNF09 - Internacionalização | Não-funcional | Correto: define capacidade de adaptação regional e linguística. |

### Itens que devem ser ajustados

- Manter em `RF06` as mensagens de erro, estados vazios e ação de tentar novamente.
- Reformular `RNF05` para metas de disponibilidade e recuperação, por exemplo: "A aplicação deve atingir disponibilidade mensal de 99,5%, excluindo manutenções programadas, e recuperar a operação após falha da API sem intervenção manual do usuário".
- Separar `RNF06` em um requisito funcional para exibir a última atualização e um requisito não-funcional para atualidade: "Dados exibidos não devem ter mais de 30 minutos, salvo indisponibilidade da fonte, quando a idade deve ser informada".
- Transformar a pergunta sobre persistência da unidade em uma decisão de produto antes de fechar `RF05`.

## Requisitos Não-Funcionais Adicionais Sugeridos

Os itens abaixo tornam os requisitos de qualidade mais verificáveis. Os valores são propostas iniciais e devem ser confirmados com produto e operação.

### RNF10 - Performance de carregamento

Em uma conexão móvel 4G e em um dispositivo dentro da matriz suportada, a primeira tela utilizável deve carregar em até 2 segundos e a previsão deve aparecer em até 3 segundos após uma resposta bem-sucedida da fonte de dados.

### RNF11 - Performance de busca

Após o usuário parar de digitar, a busca deve aguardar no máximo 300 ms antes de ser enviada, e os primeiros resultados devem ser apresentados em até 1 segundo no percentil 95, quando a fonte externa estiver disponível.

### RNF12 - Acessibilidade conformidade

A aplicação deve atender ao nível AA das WCAG 2.2 para a jornada principal, incluindo navegação completa por teclado, foco visível, nomes acessíveis para controles, contraste adequado e comunicação de mudanças de estado para tecnologias assistivas.

### RNF13 - Acessibilidade de conteúdo

Ícones e cores meteorológicos não devem ser a única forma de comunicar uma condição. Cada condição deve possuir texto alternativo ou rótulo equivalente, e mensagens de erro e carregamento devem ser anunciadas de forma acessível.

### RNF14 - Responsividade e estabilidade visual

O conteúdo deve permanecer utilizável entre 320 px e 1440 px de largura, sem rolagem horizontal. A atualização dos dados não deve causar deslocamento inesperado do conteúdo principal, com meta de CLS inferior a 0,1 na jornada de consulta.

### RNF15 - Disponibilidade operacional

O serviço deve alcançar disponibilidade mensal mínima de 99,5%, com monitoramento de falhas da aplicação e da fonte meteorológica e registro de incidentes para investigação.

### RNF16 - Degradação controlada

Quando a fonte meteorológica estiver indisponível, a aplicação deve informar a indisponibilidade em até 5 segundos, preservar a última consulta válida quando houver dados em cache e indicar claramente a data/hora desses dados.

### RNF17 - Observabilidade


Falhas de busca, consultas meteorológicas, tempos de resposta e erros de conversão de unidade devem ser registrados sem incluir dados pessoais desnecessários, permitindo acompanhar as metas de performance e disponibilidade.

## Ambiguidades e Lacunas do Briefing

As perguntas abaixo representam decisões que não podem ser inferidas com segurança a partir do briefing. A prioridade indica o risco de bloquear escopo ou arquitetura: **Alta** deve ser resolvida antes do plano técnico; **Média** pode ser refinada durante o desenho; **Baixa** pode ser tratada como evolução, desde que fique explicitamente fora da primeira versão.

| ID | Ambiguidade ou lacuna | Pergunta em aberto | Impacto de seguir sem resposta | Prioridade |
| --- | --- | --- | --- | --- |
| DA01 | Público-alvo | Quem usará o produto e em quais contextos: consulta casual, viagem, agricultura, operação ou outro? | Pode levar a decisões erradas de linguagem, densidade de informação, acessibilidade e métricas de sucesso. | Alta |
| DA02 | Mercado e cobertura geográfica | Quais países, regiões e cidades devem ser atendidos? | Afeta fonte de dados, cobertura, idioma, fuso horário, formatos locais e custos. | Alta |
| DA03 | Objetivo e sucesso | Qual problema prioritário o app deve resolver e como o sucesso será medido? | Sem métricas, não será possível priorizar funcionalidades nem avaliar se o produto entrega valor. | Alta |
| DA04 | Definição de "clima atual" | O que compõe o clima atual: temperatura, sensação térmica, vento, umidade, precipitação, visibilidade ou índice UV? | O modelo de dados, a interface, a integração e os critérios de aceite ficam indefinidos. | Alta |
| DA05 | Definição de "previsão de 5 dias" | Os cinco dias incluem hoje? A previsão será diária, horária ou ambas? | Pode gerar interpretações diferentes, retrabalho de UI e inconsistência com a fonte meteorológica. | Alta |
| DA06 | Fonte e contrato de dados | Qual provedor será usado, com quais limites, licença, SLA, cobertura e custo? | A arquitetura pode depender de uma API inadequada, sofrer bloqueios por limite ou gerar custo inesperado. | Alta |
| DA07 | Geocodificação e homônimos | Como cidades homônimas serão diferenciadas e qual nível de precisão será exigido? | O usuário pode receber a previsão de uma localidade errada, comprometendo a confiabilidade do produto. | Alta |
| DA08 | Comportamento da busca | A busca ocorre enquanto o usuário digita, após envio explícito ou nos dois modos? Quantos resultados aparecem? | Define debounce, volume de requisições, desenho do componente e desempenho percebido. | Alta |
| DA09 | Localização do usuário | O app deve solicitar geolocalização para sugerir a cidade atual? | Envolve permissão, privacidade, fallback manual e requisitos de UX que não estão no escopo atual. | Média |
| DA10 | Atualidade dos dados | Qual idade máxima aceitável para dados atuais e previsão? A última consulta pode ser exibida em cache? | Sem uma política, o app pode exibir dados obsoletos sem transparência ou fazer chamadas excessivas. | Alta |
| DA11 | Falhas da fonte | O que deve acontecer quando a API falhar, exceder limite ou retornar dados incompletos? | É necessário definir cache, mensagens, retry, degradação e critérios para não apresentar informação enganosa. | Alta |
| DA12 | Unidades | Celsius/Fahrenheit são as únicas unidades? A preferência é temporária, persistida no navegador ou associada a uma conta? | Afeta estado da aplicação, armazenamento, internacionalização e critérios de teste. | Média |
| DA13 | Idioma e localização | Qual idioma será suportado e como serão formatados datas, horários, números, países e condições meteorológicas? | Pode exigir estrutura de i18n desde o início; adiar a decisão pode tornar textos e componentes difíceis de localizar. | Alta |
| DA14 | Fuso horário | Horários e dias devem seguir o fuso da cidade consultada ou o fuso do usuário? | Pode alterar a data da previsão, o significado de "atual" e a confiança nas informações exibidas. | Alta |
| DA15 | Dispositivos móveis | Quais larguras, orientações, sistemas operacionais e condições de rede precisam ser suportados? | "Responsivo" sem alvo testável pode esconder falhas em aparelhos reais e aumentar o escopo de QA. | Alta |
| DA16 | Navegadores | Quais navegadores e versões têm suporte oficial? | Define APIs disponíveis, estratégia de compatibilidade e matriz de testes. | Média |
| DA17 | Acessibilidade | Qual nível de conformidade é exigido e quais tecnologias assistivas serão consideradas? | Sem critérios, a acessibilidade vira intenção não verificável e pode exigir retrabalho estrutural. | Alta |
| DA18 | Performance | Quais tempos máximos são aceitáveis para carregar a aplicação, buscar cidades e mostrar a previsão? | Sem metas, não há critério objetivo para escolher cache, otimização, cancelamento de chamadas ou aceitar uma entrega. | Alta |
| DA19 | Disponibilidade | Qual disponibilidade mensal, janela de manutenção e tempo de recuperação são esperados? | Impede dimensionar monitoramento, fallback, suporte e responsabilidade operacional. | Alta |
| DA20 | Segurança e privacidade | Quais dados serão coletados, por quanto tempo e com quais obrigações legais? | Pode resultar em coleta indevida, exposição de localização, não conformidade e alterações tardias de arquitetura. | Alta |
| DA21 | Autenticação e personalização | O usuário precisa de conta, histórico, favoritos ou sincronização entre dispositivos? | Muda radicalmente o modelo de dados, a segurança e o escopo; a ausência dessa decisão pode gerar dívida de produto. | Média |
| DA22 | Alertas e notificações | Alertas meteorológicos, notificações push ou avisos de mudança estão no produto inicial? | Afeta permissões, backend, regras de negócio e operação; não deve ficar implicitamente incluído. | Baixa |
| DA23 | Offline e conectividade ruim | O app deve funcionar offline ou exibir a última consulta em redes intermitentes? | Define cache, armazenamento local, indicadores de staleness e estratégia de recuperação. | Média |
| DA24 | Identidade e conteúdo | Existe identidade visual, tom de voz, catálogo de ícones e regra para descrever condições meteorológicas? | Sem padrão, a interface pode ficar inconsistente e depender de conteúdo técnico ou ambíguo. | Média |
| DA25 | Monetização e custos | Há limite de orçamento para API, infraestrutura e observabilidade? Haverá publicidade ou outro modelo de receita? | Influencia a escolha do provedor, arquitetura, privacidade e sustentabilidade do produto. | Média |
| DA26 | Observabilidade e suporte | Quais eventos, erros e métricas precisam ser monitorados e quem responderá a incidentes? | Falhas podem ser descobertas apenas por usuários, sem diagnóstico ou responsabilidade operacional definida. | Média |
| DA27 | Escopo de entrega | A primeira versão é apenas web responsiva ou também deve ser PWA, app nativo ou instalável? | Muda tecnologia, distribuição, permissões, testes e expectativas de entrega. | Média |
| DA28 | Fora do escopo formal | Favoritos, histórico, compartilhamento, mapas, radar, alertas e previsão horária estão explicitamente fora da primeira versão? | Sem limites formais, stakeholders podem considerar essas capacidades implícitas e ampliar o escopo durante a execução. | Alta |

## Riscos

| ID | Tipo | Risco | Probabilidade | Impacto | Estratégia de mitigação |
| --- | --- | --- | --- | --- | --- |
| R01 | Técnico | A API meteorológica pode ficar indisponível, lenta, limitada por quota ou sofrer alteração de contrato. | Alta | Alto | Validar provedor e SLA, monitorar quotas, aplicar timeout/retry com limite, cache controlado e fallback explícito. |
| R02 | Técnico | A geocodificação pode retornar cidades homônimas ou coordenadas incorretas. | Média | Alto | Exibir país e região/estado, usar identificador e coordenadas da localidade selecionada e testar casos ambíguos. |
| R03 | Técnico | Os dados podem estar desatualizados ou divergentes entre localidades e fontes. | Média | Alto | Definir SLA de atualidade, exibir timestamp, documentar a fonte e sinalizar dados em cache ou degradados. |
| R04 | Produto | A definição de "previsão de cinco dias" pode não atender à expectativa dos usuários. | Média | Alto | Decidir se inclui o dia atual e se a visão será diária ou horária antes de fechar o contrato de dados e os critérios de aceite. |
| R05 | Técnico | Conversões Celsius/Fahrenheit ou arredondamentos podem apresentar valores inconsistentes. | Baixa | Médio | Centralizar a conversão, definir regra de arredondamento e cobrir ambas as unidades com testes automatizados. |
| R06 | Produto | A interface pode não ser compreensível ou utilizável em telas pequenas e redes móveis. | Média | Alto | Projetar mobile-first, testar em larguras e dispositivos reais, validar estados de carregamento e evitar rolagem horizontal. |
| R07 | Técnico | A aplicação pode apresentar desempenho insuficiente por chamadas excessivas à busca e à previsão. | Média | Alto | Definir metas de latência, aplicar debounce, cancelar consultas obsoletas, usar cache e medir percentis de resposta. |
| R08 | Técnico | Falhas parciais podem gerar tela vazia, mensagens pouco acionáveis ou previsões incorretas. | Média | Alto | Modelar estados de loading, vazio, erro e dados parciais; oferecer retry e impedir que dados incompletos sejam apresentados como completos. |
| R09 | Técnico | A solução pode expor chaves de API, localização ou dados de telemetria indevidamente. | Baixa | Alto | Manter segredos fora do cliente quando aplicável, minimizar coleta, aplicar política de retenção e revisar segurança e privacidade. |
| R10 | Produto | O suporte a idiomas, fusos, formatos de data e cobertura regional pode ser subestimado. | Média | Médio | Confirmar mercados-alvo, fuso da cidade consultada, idioma inicial e formatos antes de implementar internacionalização. |
| R11 | Produto | O escopo pode crescer com favoritos, alertas, localização automática, mapas ou autenticação. | Alta | Médio | Formalizar o MVP e o fora de escopo, priorizar um backlog posterior e exigir decisão para qualquer expansão. |
| R12 | Produto | O usuário pode selecionar a cidade errada por falta de contexto nos resultados. | Média | Alto | Mostrar cidade, país, região e, quando necessário, coordenadas; confirmar a localidade antes de carregar a previsão. |
| R13 | Técnico | Diferenças entre navegadores, leitores de tela e dispositivos podem quebrar a jornada principal. | Média | Alto | Definir matriz de suporte, testar teclado e tecnologias assistivas, executar testes responsivos e automatizar regressões críticas. |
| R14 | Operacional | Não existir monitoramento suficiente para detectar indisponibilidade, lentidão ou erros de conversão. | Média | Alto | Instrumentar métricas, logs sem dados pessoais, alertas, dashboards e procedimento de resposta a incidentes. |
| R15 | Produto | As metas de sucesso podem não estar definidas, impedindo saber se o app resolve o problema. | Média | Médio | Definir métricas como conclusão da busca, tempo até a previsão, erro por consulta e uso recorrente antes do lançamento. |
| R16 | Técnico | Cache ou modo degradado pode exibir informação meteorológica antiga sem transparência. | Média | Alto | Definir idade máxima dos dados, invalidar cache, exibir horário da última atualização e distinguir claramente dado atual de dado armazenado. |

## Perguntas em Aberto

1. Qual é o público-alvo principal e quais países ou regiões serão atendidos?
2. Quais são os limites de requisições, a cobertura, os termos de uso e os requisitos de custo da Open-Meteo para o volume esperado?
3. **Resolvida:** a previsão de cinco dias inclui hoje e os quatro dias seguintes; ainda é necessário confirmar se uma visão horária será necessária no futuro.
4. Quais informações devem aparecer no clima atual e em cada dia da previsão, além da temperatura?
5. Devem ser exibidos dados como sensação térmica, umidade, vento, precipitação ou índice UV?
6. A busca deve começar enquanto o usuário digita, após confirmação, ou nos dois casos?
7. Como o sistema deve tratar cidades homônimas e resultados muito numerosos?
8. A preferência de Celsius/Fahrenheit deve ser mantida localmente entre sessões no mesmo navegador? A unidade padrão será Celsius.
9. **Resolvida para a primeira versão:** o idioma da UI será pt-BR; quais idiomas adicionais devem ser priorizados em uma evolução?
10. A aplicação deve solicitar permissão de localização para sugerir a cidade atual?
11. **Parcialmente resolvida:** não haverá autenticação nem persistência de servidor; histórico, favoritos, alertas ou notificações devem permanecer fora da primeira versão?
12. Qual é a política esperada quando a API falhar: exibir dados em cache, mensagem de indisponibilidade ou ambos?
13. Qual é o tempo de resposta aceitável para busca de cidades e carregamento da previsão?
14. Quais navegadores, versões e tamanhos de tela precisam ser oficialmente suportados?
15. Existem requisitos legais, de privacidade, acessibilidade ou identidade visual corporativa que devam ser aplicados?
16. Quais métricas definirão o sucesso do produto, como tempo até a primeira previsão, taxa de busca concluída ou uso recorrente?

## Suposições

- A primeira versão será uma aplicação web responsiva, sem necessidade de instalação nativa.
- O usuário poderá consultar o clima sem criar conta ou fazer login.
- Uma fonte externa fornecerá dados de geocodificação e previsão meteorológica.
- A busca será baseada no nome da cidade; coordenadas e localização automática poderão ser consideradas em uma etapa posterior.
- Os resultados de busca apresentarão pelo menos cidade e país para reduzir ambiguidades.
- Celsius e Fahrenheit serão as únicas unidades de temperatura na primeira versão.
- A previsão será apresentada em uma visão diária, e não em intervalos horários, salvo decisão posterior.
- O sistema exibirá uma cidade por vez.
- A preferência de unidade será aplicada tanto ao clima atual quanto à previsão.
- Não haverá edição manual dos dados meteorológicos pelo usuário.
- O produto deverá oferecer mensagens de carregamento, erro e ausência de resultados desde a primeira versão.
- Os requisitos de desempenho, disponibilidade, navegadores suportados e retenção de dados serão refinados durante o planejamento técnico.
