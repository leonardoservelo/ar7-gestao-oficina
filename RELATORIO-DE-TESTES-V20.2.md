# AR7 Gestão da Oficina V20.2 — relatório de validação

Validação executada em 07/08/2026.

## Resultado automatizado

**22/22 verificações aprovadas** com `npm run check` e `npm test`.

Cobertura das verificações:
- sintaxe de `app.js` e `server.js`;
- banco central PostgreSQL e login multi-dispositivo preservados;
- API de estado central e sincronização remota preservadas;
- câmera e galeria separadas;
- compactação de fotos grandes preservada;
- etapas comerciais renomeadas para **Peças do orçamento** e **Revisão da proposta**;
- primeira etapa comercial limitada às peças, origem/fornecedor e custo unitário;
- frete, mão de obra, terceiros, tributos, desconto e outros valores concentrados na revisão da proposta;
- botões de fluxo, compra, instalação e revisão com estado verde quando prontos;
- fluxo guiado compacto e navegável;
- comportamento de teclado com `window.visualViewport`, rolagem do campo focado e margem inferior dinâmica;
- relatório com fotos consolidadas em grupos de quatro por página;
- assinaturas no relatório sem caixa/contorno;
- servidor local inicia sem `DATABASE_URL`;
- fallback automático de porta local.

## Observação do ambiente de teste

O `npm install` não pôde baixar o pacote `pg` no ambiente de geração por limitação do espelho NPM interno deste ambiente. Isso não é erro de código. A dependência continua declarada em `package.json`; a validação de sintaxe e os testes locais que não exigem PostgreSQL foram executados normalmente.

## Teste visual

A estrutura responsiva foi validada por regras específicas para desktop, tablet e celular. O navegador headless disponível no ambiente não concluiu uma captura confiável nesta execução, portanto não é alegado teste visual automatizado por screenshot.
