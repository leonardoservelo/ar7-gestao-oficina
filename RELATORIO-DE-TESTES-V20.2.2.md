# AR7 Gestão da Oficina V20.2.2 — Relatório de revisão e testes

Data da revisão: 08/08/2026

## Escopo revisado

A revisão cobriu o fluxo operacional ativo, textos e nomenclaturas, estados de prontidão, formulários, alinhamentos e responsividade, sincronização multi-dispositivo, autenticação local/remota, importação/reset de dados, geração do relatório e segurança básica de saída.

## Resultado das suítes

### Sintaxe
- `app.js`: aprovado em `node --check`;
- `server.js`: aprovado em `node --check`;
- `tests/smoke-v20.js`: aprovado em `node --check`;
- `server.py`: aprovado em `python -m py_compile`.

### Smoke tests
**48/48 verificações aprovadas.**

A suíte valida, entre outros pontos:
- versão/cache V20.2.2;
- banco PostgreSQL e API central;
- login e limitação de tentativas;
- modo local sem bloqueio de autenticação;
- sincronização com revisão e detecção de conflito;
- persistência de alterações offline;
- segurança de importação e reset;
- datas locais;
- fluxo comercial em duas partes;
- prontidão de compra, montagem e relatório;
- fotos grandes e galeria/câmera;
- responsividade e campos críticos com rótulo;
- servidor Python de contingência sinalizando corretamente a ausência da API central.

### Auditoria estrutural de interface
**52/52 telas/estados aprovados.**

Foram renderizadas e verificadas as principais rotas administrativas, portal do cliente, propostas e as dez etapas sintéticas do fluxo:
Recebimento, Diagnóstico, Peças do orçamento, Revisão da proposta, Aguardando cliente, Compra e materiais, Montagem, Testes finais, Relatório e envio e Concluída.

A auditoria procura:
- falha fatal de renderização;
- IDs duplicados;
- botões sem tipo explícito;
- imagens sem texto alternativo;
- links sem destino;
- `onclick`/`javascript:` inline;
- campos visíveis sem rótulo/ARIA;
- ação indevida de salvar etapa em OS já concluída.

### Auditoria de saída/XSS
As rotas auditadas retornaram **SAFE**, incluindo dashboard, OS, clientes, equipamentos, peças, orçamentos, oficina, configurações, portal e propostas. Fontes de imagens dinâmicas usadas no fluxo ativo também são escapadas.

### CSS
`styles.css` foi analisado pelo parser PostCSS sem erro de sintaxe.

### Integração do servidor Node
Teste funcional local aprovado:
- healthcheck sem `DATABASE_URL`: HTTP 200;
- status de autenticação local não configurada: HTTP 503, permitindo modo local;
- servidor configurado sem sessão: HTTP 401;
- login válido: HTTP 200;
- sessão por cookie: autenticada;
- bloqueio após tentativas inválidas: oito respostas 401 e a seguinte 429.

### Fluxos renderizados
As dez etapas do fluxo foram renderizadas individualmente sem falha no harness de UI.

## Limitação do harness de relatório

O gerador final de relatório usa `HTMLTemplateElement.content` e manipulação de DOM real. O harness Node simplificado não implementa integralmente essa API, portanto as rotas de relatório técnico não são consideradas falhas quando esse ambiente sintético não consegue executar `template.content.querySelectorAll`.

O código ativo do relatório foi preservado e revisado, e suas regras de compactação, separação das fotos por etapa, uso de até quatro fotos por página, ocultação do indicador de banco no PDF e assinaturas sem contorno continuam cobertas por smoke tests.

## Pontos de evolução conhecidos

Não foram tratados como defeitos desta entrega, mas devem ser planejados para escala de produção:
- migrar fotos históricas de alto volume para object storage em vez de mantê-las dentro do estado JSONB;
- evoluir autenticação administrativa central para usuários individuais e permissões por função.

## Conclusão

A V20.2.2 fecha a revisão geral do fluxo ativo e da camada de apresentação para o piloto. Os testes automatizados e os harnesses usados nesta entrega não substituem homologação humana em dispositivos reais, mas reduzem significativamente o risco de regressões de fluxo, layout estrutural, acessibilidade e sincronização.
