# AR7 Gestão da Oficina V20.2

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
- fotos de diferentes etapas são reunidas em páginas de **Fotos do serviço**, reduzindo páginas desperdiçadas;
- assinatura de técnico e supervisor sem caixa/contorno no PDF.

### Identidade visual
A paleta e as cores existentes do projeto foram mantidas. O verde é usado somente como indicador de condição atendida/pronto para avançar, seguindo o padrão já existente no sistema.
