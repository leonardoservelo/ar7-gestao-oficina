# AR7 Gestão da Oficina V20.2.2 — Revisão geral

## Objetivo

Revisar o projeto principal antes do piloto, procurando inconsistências de fluxo, nomenclatura, prontidão, alinhamento, espaçamento, responsividade, acessibilidade, sincronização e segurança de dados que pudessem comprometer o uso real da oficina.

## Correções de fluxo

- sequência operacional consolidada em 10 etapas;
- nomes das etapas uniformizados entre dashboard, OS, orçamento e compras;
- Diagnóstico libera **Peças do orçamento**;
- Peças do orçamento libera **Revisão da proposta**;
- Revisão da proposta envia para **Aguardando cliente**;
- aprovação válida libera compra e materiais;
- compra, recebimento e separação não são confundidos com instalação;
- instalação permanece responsabilidade da Oficina;
- ações de avanço só ficam verdes quando as condições estão cumpridas;
- botões pendentes ficam realmente desabilitados;
- OS concluída não oferece novo salvamento/avanço de etapa.

## Correções comerciais

- etapa de peças concentra origem, fornecedor/estoque, marca, quantidade, custo e prazo;
- frete, mão de obra, terceiros, tributos, desconto e demais valores permanecem na revisão da proposta;
- textos de passagem deixaram de misturar “cotação” com “compra” ou “revisão”;
- aprovação do cliente passa a ser comunicada como espera real, sem sugerir que o sistema possa aprovar em nome dele;
- compra continua bloqueada sem autorização válida.

## Interface e alinhamento

- proteção de `min-width:0` aplicada nos principais grids/cartões para impedir estouro de conteúdo;
- quebras de palavras e textos longos revisadas em cabeçalhos, tabelas, cards e alertas;
- botões aceitam quebra de linha e mantêm ícones alinhados;
- filtros reorganizam corretamente em tablet/celular;
- cabeçalhos e ações passam a empilhar de forma previsível em telas pequenas;
- formulários viram uma coluna em celular;
- grids de Configurações e KPIs de Compras deixaram de depender de larguras mínimas que estouravam telas estreitas;
- tabelas mantêm rolagem horizontal somente onde ela é realmente necessária;
- topbar e indicador do ambiente receberam limites de largura e truncamento controlado;
- foco de teclado ganhou estado visual consistente;
- redução de movimento do sistema operacional é respeitada.

## Formulários e acessibilidade

- campos críticos de Recebimento, Peças do orçamento e Revisão da proposta receberam associação explícita entre `label` e controle;
- buscas/filtros receberam rótulos ARIA;
- modais associam rótulos aos seus controles e normalizam botões sem `type`;
- HTML renderizado é auditado contra IDs duplicados, imagens sem `alt`, links sem `href` e controles sem rótulo.

## Dados, sincronização e segurança

- removida a execução automática de reset destrutivo de demonstração;
- datas de calendário passaram a usar o dia local em vez de conversão UTC;
- sincronização central passou a exigir revisão esperada, evitando sobrescrita silenciosa;
- conflito entre dispositivos retorna 409 e preserva backup local;
- alterações offline permanecem pendentes mesmo após recarregar a página;
- importação de backup valida tamanho e estrutura antes de substituir dados;
- reset manual exibe aviso forte;
- login recebeu limitação de tentativas e limpeza/cap do mapa de falhas;
- respostas Node usam headers básicos de segurança;
- modo local sem banco/autenticação não prende o usuário numa tela de login impossível;
- servidor Python de contingência foi atualizado para a V20.2.2 e informa explicitamente que não oferece a API central.

## Relatório técnico

- relatório compacto preservado;
- diagnóstico utiliza melhor a página de identificação;
- páginas técnicas são agrupadas quando o volume permite;
- fotos permanecem separadas por etapa e são distribuídas em grupos de até quatro;
- miniaturas usam área visual consistente;
- indicador de sincronização é ocultado na impressão/PDF;
- assinaturas permanecem sem caixa externa.

## Testes finais desta entrega

- 48/48 smoke tests aprovados;
- 52/52 telas/estados aprovados na auditoria estrutural de UI;
- as 10 etapas do fluxo foram renderizadas individualmente;
- rotas selecionadas passaram pela auditoria de saída/XSS;
- CSS passou pelo parser PostCSS;
- Node passou por teste funcional de healthcheck, autenticação, sessão e bloqueio por tentativas;
- servidor Python local retornou healthcheck V20.2.2 e `503 configured:false` para autenticação central ausente.

## Pontos conhecidos para a próxima fase de produção

A revisão evitou uma reescrita estrutural arriscada imediatamente antes do piloto. Dois pontos continuam propositalmente como evolução de produção:

1. as fotos ainda fazem parte do estado JSONB; com grande volume histórico, devem migrar para object storage;
2. a autenticação atual é administrativa central; rastreabilidade individual completa pede usuários e permissões por função no servidor.

Esses itens estão documentados para não serem confundidos com funcionalidades já concluídas.
