# Relatório de testes — AR7 V20.2.8

Release: **20.2.8 — Integração Omie Fase 1**

## Bateria completa

Executada com:

```powershell
npm run test:all
```

Resultado esperado/final da entrega:

- Smoke/regressão: **54/54**
- Auditoria de interface: **20/20**
- Documentos: **15/15**
- Comercial: **15/15**
- Hotfix/navegação/banco vazio: **25/25**
- Privacidade/armazenamento: **30/30**
- Retornos comerciais: **12/12**
- Integração Omie Fase 1: **56/56**

**Total: 227/227 verificações aprovadas.**

## Cenários Omie cobertos

A suíte `tests/omie-integration-audit-v208.js` cobre, entre outros:

- release e arquivos modulares;
- ausência de credenciais no frontend;
- integração desligada/manual por padrão;
- ciclo de status `NOT_CONFIGURED/PENDING/SYNCING/SYNCED/PARTIAL/ERROR`;
- endpoints e envelope oficial de API;
- clientes existentes e novos sem duplicidade;
- serviços e mapping;
- condição de pagamento carregada da API Omie;
- OS aprovada;
- OS negada;
- revisão solicitada;
- OS já existente no Omie;
- inclusão única de OS nova;
- clique duplo/idempotência;
- mapping por organização/provider;
- logs isolados;
- timeout/falha da API;
- webhook autenticado;
- webhook duplicado;
- webhook isolado por organização;
- associação de webhook por ID ou código de integração da OS;
- atualização de faturamento em segundo plano quando o webhook está ligado a uma OS;
- redaction de segredo/token/senha/App Key;
- purge preservando configurações da integração;
- preservação das regras de privacidade V20.2.6 e retornos comerciais V20.2.7.

## Observação sobre teste real do Omie

Nenhuma credencial real é embutida no pacote e a bateria automatizada não cria registros na conta Omie. A validação final contra a empresa Omie deve ser feita depois do deploy, inicialmente em modo manual, usando **Testar conexão** e uma única OS controlada.
