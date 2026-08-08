# AR7 Gestão da Oficina V20.2.4

Versão multi-dispositivo com banco central PostgreSQL.

## O que mudou

- Dados centrais compartilhados entre PC, tablet e celular.
- Login do servidor por cookie HttpOnly.
- Sincronização automática a cada 5 segundos e após cada salvamento.
- Cache local mantido para tolerar quedas temporárias de conexão.
- API `/api/state` protegida por autenticação.
- PostgreSQL configurado por `DATABASE_URL`.
- Healthcheck informa se o banco está conectado.

## Variáveis obrigatórias no servidor

- `DATABASE_URL`
- `APP_SECRET`
- `AR7_ADMIN_USER`
- `AR7_ADMIN_PASSWORD`

## Observação sobre a arquitetura V20

A V20 usa um registro JSONB central para preservar toda a estrutura atual da aplicação sem reescrever o fluxo da oficina. É uma migração segura para sincronização multi-dispositivo. Em uma etapa futura, módulos com alta concorrência e fotos podem ser normalizados em tabelas próprias e storage de arquivos.

## Desenvolvimento local

Sem `DATABASE_URL`, o servidor continua abrindo em modo local para manutenção do código. Em produção, configure as variáveis acima.


## V20.2 — melhorias operacionais

- Fluxo guiado remodelado e compacto, sem rolagem vertical interna desnecessária;
- no tablet/celular o fluxo vira stepper horizontal por toque;
- teclado virtual não deve cobrir o campo ativo: modais usam a altura visível e o campo focado é centralizado;
- primeira etapa comercial fica focada somente nas peças/cotações;
- frete, mão de obra, terceiros, tributos, descontos e demais valores ficam concentrados na revisão da proposta;
- botões de passagem, compra e confirmação ficam verdes quando todas as condições estão atendidas;
- relatório técnico final usa espaços menores, agrupa melhor as fotos e remove o contorno externo dos cartões de assinatura.

## Fotos no tablet/celular — V20.1

- Botões separados **Câmera** e **Galeria** nas evidências técnicas.
- A galeria não usa `capture`, evitando que tablets forcem a abertura da câmera.
- Fotos de câmera acima de 4 MB são aceitas e compactadas automaticamente.
- Originais de até 35 MB são processados; a cópia salva é redimensionada para até 1600 px e alvo aproximado de 420 KB.
- Mesmo se o cache `localStorage` do aparelho lotar, a V20.1 continua tentando gravar no banco central autenticado.


## V20.2 FINAL — escopo desta entrega

### Orçamento em duas partes
1. **Peças do orçamento**: cadastro da peça, origem, fornecedor/estoque, marca, quantidade, custo unitário, prazo e observação técnica.
2. **Revisão da proposta**: margem, mão de obra, terceiros, frete, outros valores, tributos, desconto, pagamento, prazo, garantia e observações comerciais.

Valores antigos que estavam na etapa de cotação são transferidos para a revisão da proposta quando possível, evitando perda de informação.

### Estados de prontidão
Botões operacionais permanecem neutros/cinza enquanto houver condição pendente e ficam verdes quando todas as condições daquela ação estiverem atendidas. Isso foi aplicado ao fluxo da OS, compra/recebimento/separação, instalação, revisão comercial e fechamento do relatório.

### Fluxo guiado
O fluxo foi transformado em stepper compacto:
- desktop/notebook: dez etapas compactas em uma linha;
- tablet/celular: rolagem horizontal por toque com `scroll-snap`;
- sem rolagem vertical interna;
- ao tocar numa etapa, um resumo da etapa selecionada aparece abaixo do stepper.

### Teclado em tablet/celular
- `window.visualViewport` controla a altura útil;
- modais ocupam a tela disponível;
- campo focado é trazido para a região visível;
- padding inferior aumenta dinamicamente quando o teclado abre;
- rodapé de ações permanece acessível;
- `textarea` recebe autoajuste de altura.

### Relatório técnico
- espaços internos reduzidos sem alterar a identidade visual;
- fotos de serviço consolidadas, até quatro lado a lado por página;
- todas as miniaturas usam a mesma área visual;
- fotos permanecem separadas por etapa e são paginadas em grupos de até quatro, preservando a rastreabilidade sem desperdiçar espaço;
- assinatura de técnico e supervisor sem caixa/contorno no PDF.

### Identidade visual
A paleta e as cores existentes do projeto foram mantidas. O verde é usado somente como indicador de condição atendida/pronto para avançar, seguindo o padrão já existente no sistema.

## V20.2.3 — revisão geral antes do piloto

Esta versão recebeu uma revisão transversal do fluxo operacional e da interface, sem alterar a identidade visual da AR7.

### Fluxo operacional revisado
A sequência principal ficou consolidada em dez etapas, com nomenclatura única em todas as telas:
1. Recebimento;
2. Diagnóstico;
3. Peças do orçamento;
4. Revisão da proposta;
5. Aguardando cliente;
6. Compra e materiais;
7. Montagem;
8. Testes finais;
9. Relatório e envio;
10. Concluída.

A passagem entre etapas respeita os requisitos de prontidão. Ações pendentes permanecem desabilitadas; ações realmente prontas usam o verde como confirmação. Uma OS concluída não volta a oferecer o comando de salvar/avançar etapa.

### Interface, textos e responsividade
- alinhamentos, quebras de texto, larguras mínimas e espaçamentos foram revisados em desktop, tablet e celular;
- cabeçalhos, filtros, tabelas, cartões, botões e formulários receberam proteções contra estouro horizontal;
- Configurações passou a se adaptar também a telas muito estreitas;
- campos críticos das etapas comerciais e operacionais receberam rótulos associados;
- botões gerados em telas e modais recebem tipo explícito, evitando envios acidentais de formulários;
- foco por teclado, `focus-visible` e preferência por movimento reduzido foram contemplados;
- nomenclaturas comerciais foram uniformizadas para **Peças do orçamento**, **Revisão da proposta** e **Aguardando cliente**.

### Sincronização e proteção de dados
- a sincronização usa revisão esperada para impedir sobrescrita silenciosa entre dois dispositivos;
- conflito de edição retorna HTTP 409 e preserva uma cópia local antes de recarregar o banco;
- alterações feitas offline permanecem marcadas como pendentes mesmo após recarregar a página;
- ao voltar a ficar online, o sistema tenta enviar a alteração pendente antes de puxar um estado remoto mais novo;
- importação de backup valida tamanho e estrutura mínima antes de substituir os dados locais;
- reset de demonstração exige confirmação explícita e não é executado automaticamente;
- datas de calendário usam o fuso local, evitando mudança de dia provocada por conversão UTC.

### Autenticação e servidor
- o servidor Node mantém login por cookie HttpOnly e PostgreSQL por `DATABASE_URL`;
- tentativas de login inválidas são limitadas por janela de tempo/IP;
- headers básicos de segurança foram adicionados às respostas;
- quando autenticação/banco não estão configurados em ambiente local, a interface entra corretamente em modo local em vez de bloquear o usuário em uma tela de login impossível;
- o servidor Python continua sendo apenas uma contingência para servir os arquivos localmente. Ele sinaliza explicitamente que a API central não está disponível. Para produção multi-dispositivo, use o servidor Node.js.

### Relatório técnico
- relatório compacto preservado;
- diagnóstico aproveita melhor a página de identificação;
- componentes, medições e assinaturas são agrupados quando houver espaço seguro;
- fotos são separadas por etapa e paginadas em grupos de até quatro;
- o indicador de sincronização não aparece no PDF;
- assinaturas permanecem sem contorno externo.

### Verificações incluídas no pacote
- `npm test`: smoke/integridade de código e servidor;
- `npm run test:ui`: auditoria estrutural de 52 telas/estados, incluindo as dez etapas do fluxo;
- `npm run test:docs`: auditoria específica de relatório, proposta, assinaturas e crédito da plataforma;
- `npm run test:all`: executa as três suítes.

## Notas para produção

A V20.2.3 mantém propositalmente a arquitetura de estado central em JSONB para reduzir o risco desta etapa de implantação. Ela é adequada para o piloto e para evolução controlada, mas há dois pontos que devem entrar no planejamento de produção em escala:

1. **Fotos:** hoje as imagens compactadas fazem parte do estado da aplicação. Com alto volume histórico, o ideal é migrar as imagens para object storage e manter no banco apenas metadados/URLs.
2. **Usuários e permissões:** o servidor possui autenticação administrativa central. Para rastreabilidade individual de técnico, compras, supervisor e administrador, a próxima camada de produção deve adotar contas e permissões por usuário no servidor.

Esses pontos não impedem a demonstração nem o piloto controlado, mas devem ser tratados antes de ampliar a solução para múltiplas oficinas ou grande volume de fotos simultâneas.

## V20.2.3 — acabamento premium dos documentos

Esta revisão acrescenta uma camada específica de qualidade ao **Relatório Técnico** e à **Proposta Técnico-Comercial**, mantendo o restante da V20.2.3 intacto.

### Relatório técnico — distribuição de conteúdo
- itens **1, 2 e 3** passam a ocupar a página de identificação com distribuição vertical equilibrada;
- o diagnóstico não fica mais isolado deixando uma grande área branca sem função;
- itens **4, 5, 6 e 7** permanecem juntos na página de intervenção, porém distribuídos ao longo do A4 em vez de ficarem comprimidos no topo;
- itens **8 e 9** mantêm tabelas próprias de componentes e medições;
- o item **10** e as assinaturas só dividem a página de componentes quando o volume é realmente seguro;
- nomes, funções, datas e imagens de assinatura possuem linhas e alturas independentes, com quebra de texto protegida;
- o último grupo de fotos encerra o PDF sem gerar página branca adicional.

### Proposta técnico-comercial — nova apresentação
A proposta foi redesenhada para parecer um documento comercial real, e não uma tela do sistema impressa:
- capa com hierarquia de informação, identificação do equipamento e mensagem de valor;
- contexto da necessidade, condição identificada e solução recomendada;
- compromissos objetivos de execução e critério de liberação técnica;
- destaque para rastreabilidade, validação e entrega documentada;
- bloco **“Ao final, o cliente recebe”** com entregáveis concretos;
- investimento, materiais e condições apresentados com maior transparência;
- próximo passo e aceite em linguagem clara;
- linhas de nome, data e autorização dimensionadas para não sobrepor assinatura ou texto.

### Crédito da plataforma
Foi incluído um crédito discreto nos documentos:

**Desenvolvido por Nexora Sistemas**  
*Tecnologia que organiza operações.*

`Nexora Sistemas` foi adotado como nome de trabalho da empresa responsável pelo software. O nome está centralizado na constante `SOFTWARE_STUDIO_V203` em `app.js`, portanto pode ser trocado depois sem refazer os layouts dos documentos.

### Auditoria específica dos documentos
Além da auditoria geral, a versão inclui:
- `npm run test:docs`: 15 verificações específicas de relatório, proposta, assinaturas e crédito da desenvolvedora;
- renderização real em A4 usada durante a revisão para conferir cortes, página em branco e sobreposição;
- proposta validada em **3 páginas A4**;
- relatório de amostra validado em **7 páginas A4**, incluindo três páginas fotográficas, sem página branca final.


## V20.2.4 — alerta comercial e proposta executiva

- Dashboard destaca propostas negadas ainda sem reenvio e leva diretamente para a OS/orçamento correspondente.
- A proposta técnico-comercial foi redesenhada em duas páginas, com linguagem mais natural e menos promocional.
- A primeira página concentra contexto, diagnóstico, escopo, plano de execução e síntese comercial.
- A segunda concentra materiais, composição do investimento, condições, premissas e aceite.
- Crédito da Nexora Sistemas permanece discreto, sem competir com a marca AR7 Elétrica.
