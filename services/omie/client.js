'use strict';

const { ENDPOINTS, credentialsPresent } = require('./config');

class OmieApiError extends Error{
  constructor(message,{statusCode=502,omieCode='',retryable=false,details=null}={}){
    super(message||'Falha na comunicação com o Omie.');
    this.name='OmieApiError';this.statusCode=statusCode;this.omieCode=String(omieCode||'');this.retryable=Boolean(retryable);this.details=details;
  }
}

function sleep(ms){return new Promise(resolve=>setTimeout(resolve,ms));}
function safeMessage(value){return String(value||'').replace(/app[_ -]?secret\s*[:=]?\s*[^\s,;]+/ig,'app_secret=[protegido]').slice(0,500);}

class OmieClient{
  constructor({appKey,appSecret,timeoutMs=10000,fetchImpl=globalThis.fetch,retries=2}={}){
    this.appKey=String(appKey||'').trim();this.appSecret=String(appSecret||'').trim();this.timeoutMs=timeoutMs;this.fetchImpl=fetchImpl;this.retries=Math.max(0,Math.min(3,retries));
  }
  configured(){return credentialsPresent({appKey:this.appKey,appSecret:this.appSecret});}
  async call(endpoint,call,param={},options={}){
    if(!this.configured())throw new OmieApiError('Credenciais do Omie não configuradas no servidor.',{statusCode:503,omieCode:'NOT_CONFIGURED'});
    if(typeof this.fetchImpl!=='function')throw new OmieApiError('Cliente HTTP indisponível no servidor.',{statusCode:503,omieCode:'HTTP_UNAVAILABLE'});
    const timeoutMs=Number(options.timeoutMs||this.timeoutMs),maxAttempts=1+(options.retries??this.retries);
    let lastError=null;
    for(let attempt=1;attempt<=maxAttempts;attempt++){
      const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeoutMs);
      try{
        const response=await this.fetchImpl(endpoint,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({call,app_key:this.appKey,app_secret:this.appSecret,param:[param||{}]}),signal:controller.signal});
        const raw=await response.text();let payload={};
        try{payload=raw?JSON.parse(raw):{};}catch{payload={message:raw.slice(0,500)};}
        const fault=payload?.faultstring||payload?.message||payload?.cDesStatus||payload?.descricao_status||'';
        if(!response.ok||payload?.faultcode||payload?.faultstring){
          const retryable=response.status===429||response.status>=500;
          throw new OmieApiError(safeMessage(fault||`Omie respondeu HTTP ${response.status}.`),{statusCode:response.status===401||response.status===403?502:response.status||502,omieCode:payload?.faultcode||payload?.code||'',retryable,details:{endpoint,call,httpStatus:response.status}});
        }
        return payload;
      }catch(error){
        if(error?.name==='AbortError')lastError=new OmieApiError(`Tempo limite excedido ao chamar ${call}.`,{statusCode:504,omieCode:'TIMEOUT',retryable:true,details:{endpoint,call}});
        else if(error instanceof OmieApiError)lastError=error;
        else lastError=new OmieApiError(safeMessage(error?.message||'Falha de rede ao comunicar com o Omie.'),{statusCode:502,omieCode:'NETWORK',retryable:true,details:{endpoint,call}});
        if(attempt>=maxAttempts||!lastError.retryable)throw lastError;
        await sleep(250*Math.pow(2,attempt-1));
      }finally{clearTimeout(timer);}
    }
    throw lastError||new OmieApiError('Falha desconhecida na API Omie.');
  }

  listCompanies(){return this.call(ENDPOINTS.companies,'ListarEmpresas',{pagina:1,registros_por_pagina:100,apenas_importado_api:'N'},{retries:0});}
  listCustomers(filter={}){return this.call(ENDPOINTS.customers,'ListarClientes',{pagina:1,registros_por_pagina:100,apenas_importado_api:'N',...filter});}
  upsertCustomer(payload){return this.call(ENDPOINTS.customers,'UpsertCliente',payload);}
  consultCustomer(key){return this.call(ENDPOINTS.customers,'ConsultarCliente',key,{retries:0});}
  listServices(filter={}){return this.call(ENDPOINTS.services,'ListarCadastroServico',{nPagina:1,nRegPorPagina:100,...filter});}
  consultService(key){return this.call(ENDPOINTS.services,'ConsultarCadastroServico',key,{retries:0});}
  upsertService(payload){return this.call(ENDPOINTS.services,'UpsertCadastroServico',payload);}
  includeServiceOrder(payload){return this.call(ENDPOINTS.serviceOrders,'IncluirOS',payload);}
  consultServiceOrder(key){return this.call(ENDPOINTS.serviceOrders,'ConsultarOS',key,{retries:0});}
  statusServiceOrder(key){return this.call(ENDPOINTS.serviceOrders,'StatusOS',key,{retries:0});}
  alterServiceOrder(payload){return this.call(ENDPOINTS.serviceOrders,'AlterarOS',payload);}
  listBillingStages(){return this.call(ENDPOINTS.billingStages,'ListarEtapasFaturamento',{pagina:1,registros_por_pagina:100},{retries:0});}
  listCategories(){return this.call(ENDPOINTS.categories,'ListarCategorias',{pagina:1,registros_por_pagina:100},{retries:0});}
  listCurrentAccounts(){return this.call(ENDPOINTS.currentAccounts,'ListarContasCorrentes',{pagina:1,registros_por_pagina:100,apenas_importado_api:'N'},{retries:0});}
  listPaymentTerms(){return this.call(ENDPOINTS.paymentTerms,'ListarFormasPagVendas',{pagina:1,registros_por_pagina:100},{retries:0});}
}

module.exports={OmieClient,OmieApiError,safeMessage};
