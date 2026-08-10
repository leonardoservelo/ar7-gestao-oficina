'use strict';

const PROVIDER = 'omie';
const DEFAULT_ORGANIZATION_ID = 'ar7-main';

const ENDPOINTS = Object.freeze({
  companies: 'https://app.omie.com.br/api/v1/geral/empresas/',
  customers: 'https://app.omie.com.br/api/v1/geral/clientes/',
  services: 'https://app.omie.com.br/api/v1/servicos/servico/',
  serviceOrders: 'https://app.omie.com.br/api/v1/servicos/os/',
  billingStages: 'https://app.omie.com.br/api/v1/produtos/etapafat/',
  categories: 'https://app.omie.com.br/api/v1/geral/categorias/',
  currentAccounts: 'https://app.omie.com.br/api/v1/geral/contacorrente/',
  paymentTerms: 'https://app.omie.com.br/api/v1/produtos/formaspagvendas/',
  receivables: 'https://app.omie.com.br/api/v1/financas/contareceber/'
});

const DEFAULT_SETTINGS = Object.freeze({
  enabled: false,
  syncMode: 'manual',
  syncClients: true,
  syncServices: true,
  sendApprovedProposals: true,
  syncOrders: true,
  queryBilling: true,
  queryNfse: false,
  queryReceivables: false,
  queryPayments: false,
  syncProducts: false,
  categoryCode: '',
  currentAccountId: '',
  billingStageCode: '',
  installmentCode: '',
  installmentCount: 1,
  serviceCity: '',
  defaultServiceExternalId: '',
  defaultServiceExternalCode: '',
  defaultServiceName: 'Manutenção eletromecânica conforme proposta AR7',
  defaultServiceIntegrationCode: 'AR7-SVC-MANUT',
  autoCreateService: false,
  serviceTaxId: '',
  serviceMunicipalCode: '',
  serviceLc116Code: '',
  serviceNbsId: '',
  lastOptionsLoadedAt: ''
});

function envFlag(value, fallback=false){
  if(value===undefined||value===null||value==='')return fallback;
  return /^(1|true|yes|sim|on)$/i.test(String(value).trim());
}

function envConfig(env=process.env){
  return {
    appKey: String(env.OMIE_APP_KEY||'').trim(),
    appSecret: String(env.OMIE_APP_SECRET||'').trim(),
    enabledByEnvironment: envFlag(env.OMIE_INTEGRATION_ENABLED,false),
    syncMode: String(env.OMIE_SYNC_MODE||'manual').toLowerCase()==='automatic'?'automatic':'manual',
    timeoutMs: Math.max(2000,Math.min(30000,Number.parseInt(env.OMIE_TIMEOUT_MS||'10000',10)||10000)),
    webhookToken: String(env.OMIE_WEBHOOK_TOKEN||'').trim(),
    organizationId: String(env.AR7_ORGANIZATION_ID||DEFAULT_ORGANIZATION_ID).trim()||DEFAULT_ORGANIZATION_ID
  };
}

function credentialsPresent(cfg){return Boolean(cfg?.appKey&&cfg?.appSecret);}

module.exports={PROVIDER,DEFAULT_ORGANIZATION_ID,ENDPOINTS,DEFAULT_SETTINGS,envFlag,envConfig,credentialsPresent};
