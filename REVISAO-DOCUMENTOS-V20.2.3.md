# AR7 V20.2.3 — Revisão premium do Relatório Técnico e da Proposta Comercial

## Objetivo

Eliminar os desequilíbrios visuais observados nos documentos gerados pelo sistema e elevar a proposta comercial ao padrão de apresentação esperado para um serviço técnico industrial profissional.

## 1. Relatório técnico

### Problema observado

A distribuição anterior podia deixar o item 3 com uma área branca muito grande enquanto os itens 4, 5, 6 e 7 ficavam visualmente concentrados. Em relatórios curtos, componentes, medições e responsáveis também podiam ser aproximados demais, aumentando o risco de nome, função ou assinatura encostarem entre si.

### Correções

1. A página de identificação passou a reunir **1. Objetivo e escopo**, **2. Critérios de avaliação** e **3. Diagnóstico técnico**.
2. Esses três blocos usam um corpo vertical próprio, distribuindo o espaço disponível do A4 de maneira regular.
3. A página seguinte mantém **4. Serviços executados**, **5. Testes e verificações finais**, **6. Conclusão técnica** e **7. Recomendações**, também com distribuição vertical própria.
4. Componentes e medições não são empurrados para a página anterior para economizar papel.
5. Assinaturas só compartilham a página de componentes quando existem no máximo cinco linhas entre peças/medições e no máximo dois técnicos.
6. Cada assinatura possui área reservada para:
   - tipo do responsável;
   - imagem da assinatura;
   - nome;
   - função;
   - data/status.
7. Nomes e funções longos aceitam quebra de linha sem invadir a assinatura vizinha.
8. A área de assinatura no PDF impresso possui reserva mínima de 31 mm por cartão e 15 mm exclusivos para a imagem.
9. O último grupo fotográfico não força uma página branca extra no final do PDF.

## 2. Proposta técnico-comercial

### Direção adotada

A proposta deixou de funcionar como uma listagem artificial de campos do sistema e passou a conduzir a decisão do cliente em três etapas:

1. **Contexto e confiança** — quem será atendido, qual equipamento, qual referência comercial e por que a intervenção está sendo proposta.
2. **Entendimento técnico** — condição identificada, solução recomendada, forma de execução, validação e entregáveis.
3. **Decisão comercial** — materiais, investimento, condição, prazo, garantia, próximo passo e aceite.

### Textos incluídos

A nova versão utiliza mensagens curtas e pertinentes ao serviço, entre elas:

- “Confiabilidade para o equipamento. Clareza para a sua decisão.”
- “Uma proposta construída sobre o que foi encontrado.”
- “Objetivo claro: recuperar confiabilidade sem perder rastreabilidade.”
- “Intervenção rastreável.”
- “Validação antes da liberação.”
- “Entrega documentada.”
- “Ao final, o cliente recebe.”
- “Aprovar esta revisão para liberar o planejamento do serviço.”

Os textos variáveis da OS, cliente, equipamento, diagnóstico e escopo continuam sendo utilizados; os textos institucionais servem apenas para organizar e valorizar essas informações.

## 3. Assinaturas da proposta

A área de aceite foi reestruturada com linhas separadas para:

- nome e função;
- data;
- assinatura/autorização.

No modo de impressão cada linha possui altura reservada de 11 mm. Os rótulos ficam abaixo da área útil e não são posicionados por cima da assinatura.

## 4. Empresa desenvolvedora

Nome de trabalho criado para o software:

### Nexora Sistemas
**Tecnologia que organiza operações.**

O crédito aparece de forma discreta, sem competir com a marca AR7:

**Desenvolvido por Nexora Sistemas**

A identidade pode ser alterada futuramente em um único ponto do código (`SOFTWARE_STUDIO_V203`). Recomenda-se verificar disponibilidade de marca e domínio antes de registrar o nome definitivamente.

## 5. Validação

- Smoke/integridade: **52/52**.
- Auditoria estrutural de UI: **52/52** telas/estados.
- Auditoria específica de documentos: **15/15**.
- Proposta renderizada em A4: **3 páginas**, sem cortes ou sobreposições.
- Relatório renderizado em A4: **7 páginas** no cenário de amostra, sem página branca adicional.
- Assinaturas verificadas com reserva vertical e quebra de texto.
