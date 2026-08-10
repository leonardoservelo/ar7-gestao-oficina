'use strict';

const { envConfig, credentialsPresent, PROVIDER, DEFAULT_SETTINGS }=require('./config');
const { OmieClient }=require('./client');
const { OmieRepository }=require('./repository');
const { OmieSync }=require('./sync');
const { redact,eventTopic,eventKey,processWebhookEvent }=require('./webhooks');

function cleanSettingsInput(body={}){
  const allowed=['enabled','syncMode','syncClients','syncServices','sendApprovedProposals','syncOrders','queryBilling','queryNfse','queryReceivables','queryPayments','syncProducts','categoryCode','currentAccountId','billingStageCode','installmentCode','installmentCount','serviceCity','defaultServiceExternalId','defaultServiceExternalCode','defaultServiceName','defaultServiceIntegrationCode','autoCreateService','serviceTaxId','serviceMunicipalCode','serviceLc116Code','serviceNbsId'];
  const clean={};for(const key of allowed)if(Object.prototype.hasOwnProperty.call(body,key))clean[key]=body[key];
  for(const key of ['enabled','syncClients','syncServices','sendApprovedProposals','syncOrders','queryBilling','queryNfse','queryReceivables','queryPayments','syncProducts','autoCreateService'])if(key in clean)clean[key]=Boolean(clean[key]);
  if('syncMode' in clean)clean.syncMode=String(clean.syncMode)==='automatic'?'automatic':'manual';
  if('installmentCount' in clean)clean.installmentCount=Math.max(1,Math.min(60,Number(clean.installmentCount)||1));
  for(const key of Object.keys(clean))if(typeof clean[key]==='string')clean[key]=clean[key].trim().slice(0,500);
  return clean;
}

function createOmieIntegration({pool,env=process.env,baseUrl=''}){
  const cfg=envConfig(env);const repo=new OmieRepository(pool,{organizationId:cfg.organizationId});const client=new OmieClient({appKey:cfg.appKey,appSecret:cfg.appSecret,timeoutMs:cfg.timeoutMs});const sync=new OmieSync({repo,client,envConfig:cfg});
  async function ensureSchema(){return repo.ensureSchema();}
  async function publicStatus(){
    const {row,settings}=await repo.getSettings(cfg.syncMode);const summary=await repo.summary();
    return {provider:PROVIDER,organizationId:cfg.organizationId,credentialsPresent:credentialsPresent(cfg),enabledByEnvironment:cfg.enabledByEnvironment,webhookSecured:Boolean(cfg.webhookToken),webhookEndpoint:`${baseUrl||''}/api/integrations/omie/webhook`,status:credentialsPresent(cfg)?(row?.status||'PENDING'):'NOT_CONFIGURED',company:{externalId:row?.company_external_id||'',name:row?.company_name||''},lastSyncAt:row?.last_sync_at||null,lastError:row?.last_error||'',syncCount:Number(row?.sync_count||0),settings,summary};
  }
  async function saveSettings(body){const current=(await repo.getSettings(cfg.syncMode)).settings;return repo.saveSettings({...current,...cleanSettingsInput(body)});}
  function validateWebhook(req,url){if(!cfg.webhookToken)return {ok:false,status:503,error:'Webhook Omie ainda não possui token de segurança configurado no servidor.'};const token=String(url.searchParams.get('token')||req.headers['x-ar7-webhook-token']||'');if(token!==cfg.webhookToken)return {ok:false,status:401,error:'Webhook não autorizado.'};return {ok:true};}
  async function receiveWebhook(req,url,readJson){
    const auth=validateWebhook(req,url);if(!auth.ok)return auth;const payload=await readJson(req,1024*1024);if(!payload||typeof payload!=='object'||Array.isArray(payload))return {ok:false,status:400,error:'Payload de webhook inválido.'};
    const clean=redact(payload),topic=eventTopic(clean),key=eventKey(clean,req.headers);const inserted=await repo.insertWebhookEvent({eventKey:key,topic,payload:clean});if(inserted)setImmediate(()=>processWebhookEvent({repo,eventKey:key,topic,payload:clean,onLinkedOrder:async localId=>{const {settings}=await repo.getSettings(cfg.syncMode);if(cfg.enabledByEnvironment&&settings.enabled&&settings.queryBilling&&client.configured())await sync.refreshOrderBilling(localId);}}));return {ok:true,status:inserted?202:200,duplicate:!inserted,eventKey:key,topic};
  }
  return {cfg,repo,client,sync,ensureSchema,publicStatus,saveSettings,receiveWebhook,cleanSettingsInput};
}

module.exports={createOmieIntegration,cleanSettingsInput,DEFAULT_SETTINGS};
