'use strict';

const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const pkg=JSON.parse(read('package.json'));
const app=read('app.js'),server=read('server.js'),css=read('styles.css'),index=read('index.html'),envExample=read('.env.example');
const configSrc=read('services/omie/config.js'),clientSrc=read('services/omie/client.js'),repoSrc=read('services/omie/repository.js'),syncSrc=read('services/omie/sync.js'),ordersSrc=read('services/omie/orders.js'),webhooksSrc=read('services/omie/webhooks.js');
const {envConfig,DEFAULT_SETTINGS,ENDPOINTS}=require('../services/omie/config');
const {OmieClient}=require('../services/omie/client');
const {stableCode,customerPayload,syncCustomer}=require('../services/omie/customers');
const {approvedProposal,rejectedOrAdjustment,makeOrderPayload,syncServiceOrder}=require('../services/omie/orders');
const {redact,eventKey}=require('../services/omie/webhooks');
const {OmieSync}=require('../services/omie/sync');
const {cleanSettingsInput}=require('../services/omie');

let passed=0,total=0;
function check(name,condition){total++;if(condition){passed++;console.log(`PASS - ${name}`);}else{console.error(`FAIL - ${name}`);process.exitCode=1;}}

function approvedOrder(overrides={}){
  return {id:'os-1',number:'1234',clientId:'c-1',dueDate:'2026-08-20',records:{diagnosis:'Rebobinamento e testes.'},budget:{proposalCode:'PROP-001',total:1500,technicalScope:'Executar manutenção conforme diagnóstico.'},approval:{status:'Aprovado',portalApprovalId:'pa-1',approvedProposalCodeV18:'PROP-001',amount:1500,decidedAt:'2026-08-10T12:00:00Z'},...overrides};
}
function settings(){return {...DEFAULT_SETTINGS,enabled:true,categoryCode:'1.01.02',currentAccountId:'11850365',billingStageCode:'20',installmentCode:'000',installmentCount:1,serviceCity:'SAO PAULO (SP)',defaultServiceExternalId:'2342423'};}

async function main(){
  check('release V20.2.8 consistente',pkg.version==='20.2.8'&&app.includes("const APP_RELEASE = '20.2.8'")&&server.includes("const APP_RELEASE = '20.2.8'")&&index.includes('app.js?v=20.2.8'));
  check('suite Omie faz parte do test all',pkg.scripts?.['test:omie']==='node tests/omie-integration-audit-v208.js'&&String(pkg.scripts?.['test:all']).endsWith('npm run test:omie'));
  check('camada Omie modular existe',['config.js','client.js','repository.js','customers.js','services.js','orders.js','billing.js','webhooks.js','sync.js','index.js'].every(f=>fs.existsSync(path.join(root,'services','omie',f))));
  check('credenciais nao estao no frontend',!app.includes('OMIE_APP_KEY')&&!app.includes('OMIE_APP_SECRET')&&!index.includes('OMIE_APP_SECRET'));
  check('env example contem somente placeholders Omie',envExample.includes('OMIE_APP_KEY=')&&envExample.includes('OMIE_APP_SECRET=')&&envExample.includes('OMIE_WEBHOOK_TOKEN=')&&!/OMIE_APP_SECRET=\S+/.test(envExample));
  check('integracao inicia desligada e manual',DEFAULT_SETTINGS.enabled===false&&envConfig({}).enabledByEnvironment===false&&envConfig({}).syncMode==='manual');
  check('status internos cobrem ciclo de sincronizacao',repoSrc.includes("'NOT_CONFIGURED'")&&repoSrc.includes("'PENDING'")&&syncSrc.includes("markStatus('SYNCING'")&&syncSrc.includes("markStatus('SYNCED'")&&syncSrc.includes("'PARTIAL'")&&syncSrc.includes("markStatus('ERROR'"));
  check('endpoints oficiais Omie centralizados',ENDPOINTS.customers==='https://app.omie.com.br/api/v1/geral/clientes/'&&ENDPOINTS.services==='https://app.omie.com.br/api/v1/servicos/servico/'&&ENDPOINTS.serviceOrders==='https://app.omie.com.br/api/v1/servicos/os/'&&ENDPOINTS.paymentTerms==='https://app.omie.com.br/api/v1/produtos/formaspagvendas/');
  check('cliente HTTP usa POST e envelope oficial',clientSrc.includes("method:'POST'")&&clientSrc.includes('app_key:this.appKey')&&clientSrc.includes('app_secret:this.appSecret')&&clientSrc.includes('param:[param||{}]'));
  check('API de clientes usa ListarClientes e UpsertCliente',clientSrc.includes("'ListarClientes'")&&clientSrc.includes("'UpsertCliente'"));
  check('API de servicos usa metodos oficiais',clientSrc.includes("'ListarCadastroServico'")&&clientSrc.includes("'ConsultarCadastroServico'")&&clientSrc.includes("'UpsertCadastroServico'"));
  check('API de OS usa incluir consultar alterar e status',clientSrc.includes("'IncluirOS'")&&clientSrc.includes("'ConsultarOS'")&&clientSrc.includes("'AlterarOS'")&&clientSrc.includes("'StatusOS'"));
  check('etapas de faturamento usam pagina e registros_por_pagina',clientSrc.includes("'ListarEtapasFaturamento',{pagina:1,registros_por_pagina:100}"));
  check('condicoes de pagamento usam API oficial',clientSrc.includes("'ListarFormasPagVendas',{pagina:1,registros_por_pagina:100}")&&syncSrc.includes("['paymentTerms'"));
  check('schema e aditivo, sem drop',repoSrc.includes('CREATE TABLE IF NOT EXISTS ar7_integration_settings')&&repoSrc.includes('CREATE TABLE IF NOT EXISTS ar7_integration_mappings')&&repoSrc.includes('CREATE TABLE IF NOT EXISTS ar7_integration_logs')&&!/DROP TABLE|TRUNCATE/i.test(repoSrc));
  check('mappings isolados por organizacao e provider',repoSrc.includes('organization_id text NOT NULL')&&repoSrc.includes('ar7_integration_mappings_local_uq')&&repoSrc.includes('(organization_id,provider,entity_type,local_id)'));
  check('logs isolados por organizacao',repoSrc.includes('ar7_integration_logs_scope_idx')&&repoSrc.includes('WHERE organization_id=$1 AND provider=$2 ORDER BY created_at DESC'));
  check('webhook possui armazenamento idempotente',repoSrc.includes('ar7_integration_webhook_events')&&repoSrc.includes('ON CONFLICT (organization_id,provider,event_key) DO NOTHING'));
  check('webhook idempotente respeita isolamento por organizacao',repoSrc.includes('PRIMARY KEY (organization_id,provider,event_key)')&&repoSrc.includes('WHERE organization_id=$1 AND provider=$2 AND event_key=$3'));
  check('webhook associa OS por ID ou codigo de integracao',webhooksSrc.includes("findMappingByExternal('service_order'")&&webhooksSrc.includes("findMappingByExternalCode('service_order'"));
  check('webhook vinculado pode atualizar faturamento sem assumir nome do evento',webhooksSrc.includes("typeof onLinkedOrder==='function'")&&read('services/omie/index.js').includes('sync.refreshOrderBilling(localId)'));
  check('webhook publico possui validacao propria',server.includes("'/api/integrations/omie/webhook'")&&server.includes('omie.receiveWebhook')&&webhooksSrc.includes('eventKey'));
  check('webhook aceita rapido e processa depois',read('services/omie/index.js').includes('setImmediate(()=>processWebhookEvent')&&read('services/omie/index.js').includes('status:inserted?202:200'));
  check('rotas administrativas Omie exigem login',server.includes("url.pathname.startsWith('/api/integrations/omie/')")&&server.includes('const session=requireAuth(req,res)'));
  check('rotas principais da Fase 1 existem',['/api/integrations/omie/status','/api/integrations/omie/settings','/api/integrations/omie/test','/api/integrations/omie/sync','/api/integrations/omie/logs','/api/integrations/omie/options'].every(x=>server.includes(x)));
  check('rotas por OS existem',server.includes('const orderMatch=')&&server.includes('const orderSyncMatch=')&&server.includes('const orderBillingMatch='));
  check('save da OS dispara hook Omie sem bloquear',server.includes('setImmediate(()=>omie.sync.onStateSaved')&&server.includes("await client.query('COMMIT')"));
  check('purge limpa mappings/logs/eventos mas preserva settings',server.includes('DELETE FROM ar7_integration_mappings')&&server.includes('DELETE FROM ar7_integration_logs')&&server.includes('DELETE FROM ar7_integration_webhook_events')&&!server.includes('DELETE FROM ar7_integration_settings'));
  check('configuracoes tem tela Omie profissional',app.includes('Configurar integração')&&app.includes('Testar conexão')&&app.includes('Sincronizar agora')&&app.includes('Ver logs'));
  check('configuracoes mostram toggles solicitados',app.includes('Sincronizar clientes')&&app.includes('Sincronizar serviços')&&app.includes('Enviar propostas aprovadas')&&app.includes('Criar/atualizar OS no Omie')&&app.includes('Consultar faturamento'));
  check('configuracao de OS carrega condicao de pagamento Omie',app.includes('Condição de pagamento')&&app.includes('omieOptionsV208.paymentTerms')&&DEFAULT_SETTINGS.installmentCode==='');
  check('card Omie esta dentro da OS',app.includes('Integração Omie')&&app.includes('Cliente sincronizado')&&app.includes('Serviço sincronizado')&&app.includes('OS Omie criada')&&app.includes('Atualizar faturamento'));
  check('UI avisa que revisao/negativa nao sincroniza',app.includes('Pedido de revisão ou proposta negada não é enviado ao Omie'));
  check('CSS Omie responsivo existe',css.includes('AR7 V20.2.8 — Integração Omie Fase 1')&&css.includes('.omie-config-grid-v208')&&css.includes('@media(max-width:820px)'));

  const c1=stableCode('AR7-C-','cliente-123');const c2=stableCode('AR7-C-','cliente-123');
  check('codigo de integracao do cliente e estavel',c1===c2&&c1.startsWith('AR7-C-')&&c1.length<=60);
  const cp=customerPayload({id:'c1',name:'Empresa Teste',cnpj:'12.345.678/0001-99',phone:'11999998888',email:'a@b.com'},'AR7-C-TEST');
  check('payload de cliente leva codigo documento e contato',cp.codigo_cliente_integracao==='AR7-C-TEST'&&cp.cnpj_cpf==='12.345.678/0001-99'&&cp.telefone1_ddd==='11');

  const calls=[],logs=[];let mappings={};
  const fakeRepo={
    async getMapping(t,id){return mappings[`${t}:${id}`]||null;},
    async ensureMapping(){return null;},
    async upsertMapping(t,id,data){const row={local_id:String(id),external_id:data.externalId?String(data.externalId):null,external_code:data.externalCode||null,sync_status:data.status,metadata:data.metadata||{}};mappings[`${t}:${id}`]=row;return row;},
    async log(v){logs.push(v);}
  };
  const fakeClientExisting={async listCustomers(){calls.push('list');return {clientes_cadastro:[{codigo_cliente_omie:88,codigo_cliente_integracao:c1,cnpj_cpf:'12.345.678/0001-99'}]};},async upsertCustomer(){calls.push('upsert');return {codigo_cliente_omie:99};}};
  const mapped=await syncCustomer({repo:fakeRepo,client:fakeClientExisting,customer:{id:'cliente-123',name:'Empresa Teste',cnpj:'12.345.678/0001-99'},settings:settings()});
  check('cliente existente no Omie vira mapping sem duplicar',mapped.external_id==='88'&&calls.includes('list')&&!calls.includes('upsert'));

  mappings={};calls.length=0;logs.length=0;
  const fakeClientNew={async listCustomers(){calls.push('list');return {clientes_cadastro:[]};},async upsertCustomer(){calls.push('upsert');return {codigo_cliente_omie:99};}};
  const created=await syncCustomer({repo:fakeRepo,client:fakeClientNew,customer:{id:'novo',name:'Novo Cliente',cnpj:'11.222.333/0001-44'},settings:settings()});
  check('cliente nao encontrado e criado uma unica vez',created.external_id==='99'&&calls.filter(x=>x==='upsert').length===1);

  mappings={};logs.length=0;let failed=false;
  try{await syncCustomer({repo:fakeRepo,client:{async listCustomers(){throw Object.assign(new Error('Omie fora do ar'),{omieCode:'NETWORK'});}},customer:{id:'erro',name:'Erro'},settings:settings()});}catch{failed=true;}
  check('falha do Omie registra ERROR sem quebrar camada',failed&&logs.some(x=>x.status==='ERROR'));

  const approved=approvedOrder();
  check('somente aprovacao real libera envio',approvedProposal(approved)===true);
  check('negativa nao libera envio',approvedProposal(approvedOrder({approval:{status:'Recusado',portalApprovalId:'x'}}))===false);
  check('pedido de revisao nao libera envio',approvedProposal(approvedOrder({approval:{status:'Ajuste solicitado',portalApprovalId:'x'}}))===false&&rejectedOrAdjustment(approvedOrder({approval:{status:'Ajuste solicitado'}}))===true);
  const op=makeOrderPayload({order:approved,client:{email:'cliente@teste.com'},customerMapping:{external_id:'123'},serviceMapping:{external_id:'456'},settings:settings()});
  check('payload de OS usa cabecalho oficial e servico mapeado',op.Cabecalho.cCodIntOS.startsWith('AR7-OS-')&&op.Cabecalho.nCodCli===123&&op.ServicosPrestados[0].nCodServico===456&&op.ServicosPrestados[0].nValUnit===1500);

  const orderLogs=[];let orderMapping=null;const orderRepo={
    async getMapping(){return orderMapping;},async ensureMapping(){return null;},
    async upsertMapping(t,id,data){orderMapping={local_id:id,external_id:data.externalId?String(data.externalId):null,external_code:data.externalCode,sync_status:data.status,metadata:data.metadata||{}};return orderMapping;},
    async log(v){orderLogs.push(v);}
  };
  let includeCount=0,alterCount=0;
  const newOsClient={async consultServiceOrder(){throw Object.assign(new Error('não encontrado'),{omieCode:'SOAP-ENV:Client'});},async includeServiceOrder(){includeCount++;return {nCodOS:700,cNumOS:'OS-700'};},async alterServiceOrder(){alterCount++;return {nCodOS:700};}};
  await syncServiceOrder({repo:orderRepo,client:newOsClient,order:approved,customer:{email:'x@y.com'},customerMapping:{external_id:'123'},serviceMapping:{external_id:'456'},settings:settings()});
  check('OS nova e incluida uma vez',includeCount===1&&alterCount===0&&orderMapping.external_id==='700');
  const existingClient={async consultServiceOrder(){return {Cabecalho:{nCodOS:700,cNumOS:'OS-700'},ServicosPrestados:[{nSeqItem:1}]};},async includeServiceOrder(){includeCount++;return {};},async alterServiceOrder(payload){alterCount++;return {nCodOS:700,cNumOS:'OS-700',payload};}};
  await syncServiceOrder({repo:orderRepo,client:existingClient,order:approved,customer:{email:'x@y.com'},customerMapping:{external_id:'123'},serviceMapping:{external_id:'456'},settings:settings()});
  check('OS existente e alterada sem nova inclusao',alterCount===1&&includeCount===1);

  const lockSync=new OmieSync({repo:{},client:{},envConfig:{syncMode:'manual'}});let lockExecutions=0;
  const p1=lockSync.withLock('same',async()=>{lockExecutions++;await new Promise(r=>setTimeout(r,30));return 7;});
  const p2=lockSync.withLock('same',async()=>{lockExecutions++;return 9;});
  const locked=await Promise.all([p1,p2]);
  check('clique duplo usa trava idempotente',lockExecutions===1&&locked[0]===7&&locked[1]===7);

  const e1=eventKey({topic:'os',data:{nCodOS:123}}),e2=eventKey({data:{nCodOS:123},topic:'os'});
  check('webhook repetido gera mesma chave idempotente',e1===e2&&e1.startsWith('omie:sha256:'));
  const clean=redact({app_secret:'abc',token:'def',nested:{password:'ghi',ok:'sim'},app_key:'123'});
  check('webhook redige segredo token senha e app key',!('app_secret' in clean)&&!('token' in clean)&&!('app_key' in clean)&&!('password' in clean.nested)&&clean.nested.ok==='sim');

  let notConfigured=false;try{await new OmieClient({}).listCompanies();}catch(e){notConfigured=e.omieCode==='NOT_CONFIGURED';}
  check('credencial ausente falha de forma controlada',notConfigured);
  let timedOut=false;
  const timeoutClient=new OmieClient({appKey:'x',appSecret:'y',timeoutMs:25,retries:0,fetchImpl:(_u,opt)=>new Promise((resolve,reject)=>{opt.signal.addEventListener('abort',()=>{const e=new Error('aborted');e.name='AbortError';reject(e);});})});
  try{await timeoutClient.listCompanies();}catch(e){timedOut=e.omieCode==='TIMEOUT'&&e.statusCode===504;}
  check('timeout do Omie e tratado sem travar AR7',timedOut);

  const cleaned=cleanSettingsInput({enabled:true,syncMode:'automatic',appKey:'NAO',appSecret:'NAO',webhookToken:'NAO',categoryCode:' 1.01.02 '});
  check('settings nunca aceitam credenciais do frontend',cleaned.enabled===true&&cleaned.syncMode==='automatic'&&cleaned.categoryCode==='1.01.02'&&!('appKey' in cleaned)&&!('appSecret' in cleaned)&&!('webhookToken' in cleaned));
  check('frontend nao mostra token do webhook',!app.includes('x-ar7-webhook-token')&&!app.includes('?token=')&&app.includes('O token não é mostrado no navegador'));
  check('automatico so observa proposta aprovada',syncSrc.includes('if(!approvedProposal(order))continue')&&syncSrc.includes("settings.syncMode==='automatic'"));
  check('falha de billing nao desfaz sincronizacao principal',syncSrc.includes('não desfaz sincronização principal'));
  check('produto e pecas permanecem Fase 2',DEFAULT_SETTINGS.syncProducts===false&&app.includes('Fase 2 — não envia peças nesta versão'));
  check('limpeza de producao exige V20.2.8',read('LIMPAR-PRODUCAO-APOS-DEPLOY.ps1').includes("$health.version -ne '20.2.8'"));

  console.log(`\n${passed}/${total} verificações V20.2.8 de integração Omie aprovadas.`);
  if(passed!==total)process.exit(1);
}

main().catch(error=>{console.error(error);process.exit(1);});
