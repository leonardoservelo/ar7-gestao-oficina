# Relatório de testes — AR7 V20.2.7

## Objetivo

Validar que pedidos de revisão feitos no Portal do Cliente apareçam no Dashboard como pendência comercial, sem alterar o comportamento já existente para propostas negadas e sem regredir as proteções de dados da V20.2.6.

## Resultado

Todos os testes automatizados passaram.

- Smoke/regressão: **54/54**
- UI/estados: **20/20**
- Documentos: **15/15**
- Comercial V20.2.4: **15/15**
- Hotfix/navegação: **25/25**
- Privacidade/armazenamento: **30/30**
- Retornos comerciais V20.2.7: **12/12**
- **Total: 171/171**

## Cenários específicos V20.2.7

- Pedido de revisão pendente entra no Dashboard.
- Negativa e pedido de revisão podem aparecer simultaneamente.
- O motivo informado pelo cliente aparece no cartão.
- O cartão aponta diretamente para a OS/orçamento.
- O pedido permanece enquanto a revisão ainda não foi reenviada.
- Um `sentAt` posterior ao pedido resolve a pendência.
- Apenas o feedback mais recente da proposta define a pendência atual.

As regras de banco central, anexos e limpeza definitiva permanecem ativas.
