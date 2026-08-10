# AR7 Gestão da Oficina V20.2.7 — Retornos Comerciais

## Alteração principal

Pedidos de revisão feitos pela empresa cliente no Portal agora geram uma pendência visível no Dashboard, da mesma forma que uma proposta negada já gerava.

### Comportamento

- **Negada:** mantém alerta vermelho `Proposta negada`.
- **Revisão solicitada:** alerta âmbar `Revisão solicitada`.
- Ambos exibem motivo, proposta/revisão de origem, data/hora, OS e atalho direto para o orçamento.
- O pedido permanece no Dashboard enquanto não houver um `sentAt` posterior ao retorno do cliente.
- Ao reenviar a proposta revisada, a pendência deixa de ser exibida.

A V20.2.7 preserva integralmente as regras de banco central, anexos e limpeza definitiva introduzidas na V20.2.6.
