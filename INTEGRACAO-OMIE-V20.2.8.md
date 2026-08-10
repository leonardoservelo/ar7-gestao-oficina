# AR7 Gestão da Oficina V20.2.8 — Integração Omie Fase 1

## 1. Objetivo e responsabilidade de cada sistema

A integração foi implementada preservando a divisão definida para o projeto:

- **AR7** continua mestre de equipamento, entrada, OS técnica, inspeção, diagnóstico, evidências, peças técnicas, proposta, revisão, aprovação, execução, testes, relatório, andamento e portal do cliente.
- **Omie** continua responsável pelo administrativo/fiscal/financeiro: cadastro administrativo quando compartilhado, OS comercial, faturamento, NFS-e, contas a receber, pagamentos e contabilidade.

A V20.2.8 não transforma o AR7 em ERP fiscal e não cria rotinas próprias de contabilidade, SPED, conciliação bancária, emissão fiscal ou contas a pagar.

## 2. Escopo implementado nesta fase

### Configurações → Integrações → Omie
A tela administrativa mostra:

- status `NOT_CONFIGURED`, `PENDING`, `SYNCING`, `SYNCED`, `PARTIAL` ou `ERROR`;
- empresa Omie identificada no teste de conexão;
- última sincronização;
- último erro;
- quantidade de registros processados;
- presença das credenciais no servidor sem mostrar seus valores;
- status de proteção do webhook;
- botões **Testar conexão**, **Sincronizar agora**, **Carregar parâmetros Omie** e **Ver logs**.

Controles disponíveis:

- integração Omie ON/OFF;
- sincronizar clientes;
- sincronizar serviços;
- enviar propostas aprovadas;
- criar/atualizar OS no Omie;
- consultar faturamento;
- consultar NFS-e;
- consultar contas a receber — preparado para Fase 2;
- consultar pagamentos — preparado para Fase 2;
- produtos/peças — exibido como Fase 2 e sem envio nesta versão;
- modo manual/automático;
- categoria, conta corrente, etapa de faturamento, condição de pagamento e quantidade de parcelas;
- cidade de prestação;
- serviço padrão Omie;
- criação opcional de serviço com campos fiscais avançados.

### Clientes
A sincronização segue esta ordem:

1. procura mapping AR7 ↔ Omie;
2. se já houver vínculo, atualiza/valida sem criar outro cliente;
3. sem vínculo, pesquisa por código de integração e CPF/CNPJ;
4. se encontrar cliente existente, grava o mapping;
5. só usa `UpsertCliente` quando necessário.

O ID interno do AR7 nunca é substituído pelo ID do Omie.

### Serviços
O AR7 prefere vincular um serviço já cadastrado no Omie. A criação automática fica desligada por padrão e só é permitida quando a configuração fiscal necessária estiver preenchida. Isso evita criação acidental de serviço com tributação incompleta.

### Proposta aprovada → Omie
O principal gatilho AR7 → Omie está implementado:

1. proposta é aprovada de forma válida pelo cliente;
2. cliente é validado/sincronizado;
3. serviço é validado/mapeado;
4. AR7 procura a OS Omie por mapping/código de integração;
5. se existir, atualiza; se não existir, inclui;
6. grava mapping e log;
7. consulta status básico de faturamento quando habilitado;
8. card Omie da OS é atualizado.

Regras explícitas:

- **APROVADA**: pode sincronizar;
- **NEGADA**: não sincroniza como aprovada;
- **REVISÃO SOLICITADA**: não sincroniza como aprovada;
- uma nova revisão só pode ser enviada depois de uma nova aprovação válida.

### Card Omie dentro da OS
Mostra:

- cliente sincronizado;
- serviço sincronizado;
- OS Omie criada/vinculada;
- proposta aprovada;
- faturamento;
- NFS-e quando identificada no status da OS;
- pagamento como Fase 2;
- ID/código/número da OS Omie;
- última sincronização;
- último erro;
- **Sincronizar com Omie / Sincronizar novamente**;
- **Atualizar faturamento**.

### Faturamento e NFS-e
Nesta Fase 1 o AR7 consulta de forma informativa o status da OS no Omie. Quando disponível, registra faturamento, etapa, número externo e NFS-e retornada pelo status da OS. O Omie continua sendo o sistema mestre fiscal/financeiro.

## 3. Webhook

Endpoint preparado:

`https://ar7-gestao-oficina.onrender.com/api/integrations/omie/webhook`

O endpoint:

- exige `OMIE_WEBHOOK_TOKEN`;
- aceita token pela própria URL (`?token=...`) ou pelo header `x-ar7-webhook-token`;
- limita tamanho do payload;
- rejeita payload inválido;
- remove/redige campos com nomes de segredo, senha, token e App Key antes de persistir;
- gera chave idempotente por ID da mensagem/evento quando disponível ou SHA-256 do payload normalizado;
- usa chave composta por organização + provedor + evento;
- retorna rápido e processa em segundo plano;
- trata evento duplicado sem duplicar operação;
- não assume nomes de eventos que não foram confirmados na documentação;
- quando encontra `nCodOS` ou `cCodIntOS` de uma OS mapeada, associa o evento à OS AR7 e pode consultar o status atual de faturamento em segundo plano.

### Como configurar no Omie depois do deploy

1. Configure no Render um token forte e aleatório em `OMIE_WEBHOOK_TOKEN`.
2. Depois que a V20.2.8 estiver online, no Omie Developer abra o aplicativo da integração.
3. Crie um novo webhook.
4. Use a URL:

`https://ar7-gestao-oficina.onrender.com/api/integrations/omie/webhook?token=SEU_TOKEN_DO_RENDER`

5. Selecione somente eventos disponíveis no Omie que sejam úteis ao fluxo de OS/faturamento.
6. Salve e confirme o teste de entrega.

O token não aparece na interface do AR7 nem em respostas públicas.

## 4. Segurança

Credenciais aceitas apenas pelo backend:

```env
OMIE_APP_KEY=
OMIE_APP_SECRET=
OMIE_INTEGRATION_ENABLED=false
OMIE_SYNC_MODE=manual
OMIE_TIMEOUT_MS=10000
OMIE_WEBHOOK_TOKEN=
AR7_ORGANIZATION_ID=ar7-main
AR7_PUBLIC_URL=https://ar7-gestao-oficina.onrender.com
```

Regras aplicadas:

- App Key/App Secret não ficam em `app.js`, HTML, CSS ou banco de configurações;
- frontend recebe apenas `credentialsPresent: true/false`;
- logs não guardam credenciais;
- respostas de erro passam por sanitização;
- todas as rotas administrativas Omie usam a autenticação já existente do servidor AR7;
- webhook não depende da sessão administrativa e usa segredo próprio;
- `.env` e derivados continuam ignorados pelo Git;
- o pacote contém apenas `.env.example` sem segredo real.

## 5. Camada modular criada

Diretório `services/omie/`:

- `config.js` — endpoints, defaults e ambiente;
- `client.js` — HTTP, POST JSON, timeout, retry/backoff e erros;
- `repository.js` — schema, mappings, logs, webhook e status;
- `customers.js` — clientes e prevenção de duplicidade;
- `services.js` — serviço padrão/mapping;
- `orders.js` — aprovação e OS Omie idempotente;
- `billing.js` — status de faturamento/NFS-e;
- `webhooks.js` — validação lógica, idempotência e processamento;
- `sync.js` — coordenação, locks e automação;
- `index.js` — fachada da integração para o servidor.

As chamadas ao Omie não foram espalhadas pelo restante da aplicação.

## 6. Banco de dados e migration

Migration criada:

`migrations/20260810_omie_phase1_v208.sql`

Tabelas novas:

- `ar7_integration_settings`;
- `ar7_integration_mappings`;
- `ar7_integration_logs`;
- `ar7_integration_webhook_events`.

Características:

- migration exclusivamente aditiva;
- nenhum `DROP TABLE`;
- nenhum `TRUNCATE`;
- nenhuma limpeza de clientes/OS/propostas;
- mappings isolados por `organization_id`, `provider`, `entity_type` e `local_id`;
- external IDs únicos dentro da mesma organização/provedor/tipo;
- webhook isolado por organização/provedor/evento;
- logs também isolados por organização.

O servidor aplica `CREATE TABLE/INDEX IF NOT EXISTS` na inicialização, seguindo o modelo atual do projeto. O SQL da pasta `migrations/` é a versão auditável/manual da mesma alteração.

## 7. Rotas backend

Webhook público protegido por token:

- `POST /api/integrations/omie/webhook`

Rotas administrativas autenticadas:

- `GET /api/integrations/omie/status`
- `PUT /api/integrations/omie/settings`
- `POST /api/integrations/omie/test`
- `POST /api/integrations/omie/sync`
- `GET /api/integrations/omie/logs`
- `GET /api/integrations/omie/options`
- `GET /api/integrations/omie/order/:id`
- `POST /api/integrations/omie/order/:id/sync`
- `POST /api/integrations/omie/order/:id/billing`

## 8. Modo seguro de desenvolvimento

Defaults do pacote:

```env
OMIE_INTEGRATION_ENABLED=false
OMIE_SYNC_MODE=manual
```

Com isso, desenvolver/testar o AR7 não dispara escrita automática no Omie. Consultas reais só devem ser feitas quando você deliberadamente configurar credenciais no servidor de teste. Para um teste controlado, deixe `OMIE_SYNC_MODE=manual` até validar cliente, serviço, categoria, conta corrente, condição de pagamento, etapa e cidade.

## 9. Como testar localmente sem Omie real

No diretório do projeto:

```powershell
& "$env:ProgramFiles\nodejs\npm.cmd" run test:all
```

Para iniciar o modo local sem banco central/Omie:

```powershell
node server.js 8108
```

A integração continuará bloqueada por ambiente e nenhuma escrita Omie será feita.

## 10. Como testar conexão real com segurança

Depois do deploy e das variáveis no Render:

1. mantenha `OMIE_INTEGRATION_ENABLED=false` inicialmente;
2. entre no AR7 como administrador;
3. abra **Configurações → Integrações → Omie**;
4. clique **Testar conexão**;
5. confirme que a empresa Omie é identificada;
6. clique **Carregar parâmetros Omie**;
7. selecione categoria, conta corrente, etapa, condição de pagamento e serviço;
8. informe cidade de prestação;
9. salve;
10. só então ative `OMIE_INTEGRATION_ENABLED=true` no servidor e a chave geral na tela.

O teste de conexão faz consulta e não cria OS.

## 11. Como testar uma proposta aprovada

Para o primeiro teste real, use modo manual:

1. `OMIE_SYNC_MODE=manual`;
2. integração ON;
3. abra uma OS de teste AR7;
4. gere/envie a proposta normalmente;
5. aprove pelo fluxo real do portal;
6. volte à OS;
7. no card **Integração Omie**, clique **Sincronizar com Omie**;
8. confira cliente, serviço, OS Omie e código/número externo;
9. use **Ver logs** em Configurações para confirmar o resultado.

Depois, teste uma proposta negada e uma revisão solicitada: o botão de sincronização deve permanecer indisponível como aprovação e nenhum envio de OS deve ocorrer por esse estado.

## 12. Como identificar a OS criada no Omie

O AR7 usa código de integração estável com prefixo:

`AR7-OS-...`

O mapping guarda separadamente:

- ID interno AR7;
- `external_id` do Omie (`nCodOS`);
- `external_code` (`cCodIntOS`);
- número visível da OS Omie (`cNumOS`) em metadata quando retornado.

O card da OS mostra esses dados sem substituir o número interno da OS AR7.

## 13. Deploy

A V20.2.8 não deve ser publicada automaticamente sem configurar o ambiente. O fluxo recomendado é:

```powershell
& "$env:ProgramFiles\nodejs\npm.cmd" run test:all
node --check app.js
node --check server.js
git add -A
git commit -m "AR7 V20.2.8 - integracao Omie Fase 1"
git push origin main
```

Depois, no serviço Render já existente:

```powershell
$RENDER="$env:USERPROFILE\bin\render.exe"
& $RENDER deploys create "srv-d9qv97ss728c73akiml0" --wait --confirm -o text
```

Confirmação:

```powershell
Invoke-RestMethod "https://ar7-gestao-oficina.onrender.com/health" | Format-List
```

Esperado depois da publicação:

```text
version            : 20.2.8
databaseConfigured : True
databaseConnected  : True
```

O deploy de código não recria o PostgreSQL e não executa limpeza operacional.

## 14. Arquivos criados

- `services/omie/config.js`
- `services/omie/client.js`
- `services/omie/repository.js`
- `services/omie/customers.js`
- `services/omie/services.js`
- `services/omie/orders.js`
- `services/omie/billing.js`
- `services/omie/webhooks.js`
- `services/omie/sync.js`
- `services/omie/index.js`
- `migrations/20260810_omie_phase1_v208.sql`
- `.env.example`
- `tests/omie-integration-audit-v208.js`
- `INTEGRACAO-OMIE-V20.2.8.md`
- `RELATORIO-DE-TESTES-V20.2.8.md`

## 15. Arquivos principais modificados

- `app.js`
- `styles.css`
- `server.js`
- `package.json`
- `index.html`
- `server.py`
- `INICIAR.ps1`
- `LIMPAR-PRODUCAO-APOS-DEPLOY.ps1`
- `README.md`
- testes de regressão das versões anteriores para reconhecer a release atual.

## 16. O que ainda é Fase 2

A estrutura foi preparada, mas a V20.2.8 deliberadamente não tenta implementar tudo de uma vez. Permanecem para uma próxima fase:

- produtos/peças e estoque Omie;
- pedidos/requisições de compra;
- contas a receber detalhadas;
- baixa/pagamentos e movimentos financeiros;
- contratos;
- consultas fiscais/NFS-e mais profundas e download de documentos;
- dashboard administrativo financeiro;
- agenda automática periódica além dos gatilhos atuais;
- escolha fina dos tópicos de webhook depois de validar quais eventos da conta Omie serão usados no fluxo real.

## 17. Riscos e cuidados antes de ativar produção

1. **Não use credenciais expostas em conversa, log ou arquivo.** Gere/rotacione o segredo antes de produção e coloque o valor somente no Render.
2. A primeira sincronização real deve ficar em modo manual.
3. Selecione um **serviço já existente** no Omie antes de habilitar criação automática.
4. Confirme com administrativo/contabilidade categoria, conta corrente, etapa, condição de pagamento, cidade e tributação.
5. Só configure o webhook depois que o endpoint V20.2.8 estiver online.
6. Comece com uma única OS de teste e confirme no Omie que não houve duplicidade.
7. O AR7 continua funcionando se o Omie estiver fora do ar; erros de integração devem ser tratados separadamente.

## 18. Referências oficiais consultadas

- Portal Developer Omie: https://developer.omie.com.br/
- Lista de APIs: https://developer.omie.com.br/service-list/
- Clientes: https://app.omie.com.br/api/v1/geral/clientes/
- Serviços: https://app.omie.com.br/api/v1/servicos/servico/
- Ordens de Serviço: https://app.omie.com.br/api/v1/servicos/os/
- Formas de pagamento: https://app.omie.com.br/api/v1/produtos/formaspagvendas/
- Boas práticas de APIs e Webhooks: central de ajuda oficial Omie.

A API Omie é consumida via POST com corpo JSON contendo `app_key`, `app_secret`, `call` e `param`. O cliente da V20.2.8 centraliza esse formato, timeout e retry/backoff em `services/omie/client.js`.
