# Relatório de Testes — AR7 Gestão da Oficina V20.2.3

## Resultado consolidado

- Smoke / integridade / servidor: **52 de 52 aprovados**.
- Auditoria estrutural de interface: **52 de 52 telas/estados aprovados**.
- Auditoria específica de relatório e proposta: **15 de 15 aprovados**.
- Falhas finais: **0**.

## Relatório técnico

Foram validados:

- itens 1, 2 e 3 agrupados e distribuídos na página de identificação;
- item 3 sem página isolada com grande vazio;
- itens 4, 5, 6 e 7 distribuídos verticalmente na página seguinte;
- componentes e medições preservados em área própria;
- compartilhamento com assinaturas somente em conteúdo curto;
- reserva vertical independente para imagem, nome, função e estado da assinatura;
- quebra de nomes/funções longos sem sobreposição;
- fotos separadas por etapa, até quatro por página;
- último grupo fotográfico sem página branca adicional.

Uma amostra real do gerador foi impressa pelo Chromium em A4 e conferida por renderização de cada página. O cenário analisado resultou em **7 páginas**, sendo quatro páginas documentais e três páginas fotográficas.

## Proposta técnico-comercial

Foram validados:

- capa comercial V20.2.3;
- diagnóstico e solução recomendada;
- benefícios operacionais escritos de forma objetiva;
- compromissos de execução;
- critério de liberação técnica;
- bloco de entregáveis ao cliente;
- materiais, investimento e condições;
- próximo passo;
- aceite e linhas de assinatura;
- crédito “Desenvolvido por Nexora Sistemas”.

A proposta foi impressa e inspecionada em **3 páginas A4**, sem texto cortado, sem elemento sobreposto e sem página adicional.

## Comandos de validação

```bash
npm test
npm run test:ui
npm run test:docs
npm run test:all
```

`npm run test:all` executa as três suítes em sequência.
