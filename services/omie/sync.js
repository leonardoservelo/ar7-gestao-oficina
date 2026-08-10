'use strict';

const { syncCustomer }=require('./customers');
const { syncDefaultService, serviceExternalId, serviceExternalCode, serviceLabel }=require('./services');
const { syncServiceOrder, approvedProposal, orderIntegrationCode }=require('./orders');
const { refreshBilling }=require('./billing');

function findById(list,id){return (Array.isArray(list)?list:[]).find(item=>String(item?.id)===String(id));}
function proposalIdentity(order){return String(order?.approval?.approvedProposalCodeV18||order?.budget?.proposalCode||'');}

class OmieSync{
  constructor({repo,client,envConfig}){this.repo=repo;this.client=client;this.envConfig=envConfig;this.inflight=new Map();}
  async settings(){return this.repo.getSettings(this.envConfig.syncMode);}
  assertOperational(settings){
    if(!this.envConfig.enabledByEnvironment)throw Object.assign(new Error('Integração Omie está bloqueada no servidor. Configure OMIE_INTEGRATION_ENABLED=true.'),{statusCode:409,omieCode:'ENV_DISABLED'});
    if(!settings.enabled)throw Object.assign(new Error('Integração Omie está desativada nas Configurações.'),{statusCode:409,omieCode:'INTEGRATION_DISABLED'});
    if(!this.client.configured())throw Object.assign(new Error('App Key/App Secret do Omie não estão configurados no servidor.'),{statusCode:503,omieCode:'NOT_CONFIGURED'});
  }
  async withLock(key,fn){
    if(this.inflight.has(key))return this.inflight.get(key);
    const promise=Promise.resolve().then(fn).finally(()=>this.inflight.delete(key));this.inflight.set(key,promise);return promise;
  }
  async testConnection(){
    await this.repo.markStatus('SYNCING',{error:null});
    try{
      const payload=await this.client.listCompanies();
      const list=payload?.empresas_cadastro||payload?.empresasCadastro||payload?.cadastros||[];const company=list[0]||{};
      const externalId=company?.codigo_empresa??company?.nCodEmp??company?.codigo??null;
      const name=company?.nome_fantasia||company?.razao_social||company?.cNomeFantasia||company?.cRazaoSocial||'Empresa Omie';
      await this.repo.markStatus('SYNCED',{companyExternalId:externalId?String(externalId):null,companyName:String(name),countIncrement:1});
      await this.repo.log({entityType:'connection',direction:'AR7_TO_OMIE',action:'TEST_CONNECTION',status:'SUCCESS',message:'Conexão com o Omie validada.',responseSummary:{companyExternalId:externalId?String(externalId):null,companyName:String(name)}});
      return {ok:true,company:{externalId:externalId?String(externalId):'',name:String(name)},count:Array.isArray(list)?list.length:0};
    }catch(error){await this.repo.markStatus('ERROR',{error:error.message});await this.repo.log({entityType:'connection',direction:'AR7_TO_OMIE',action:'TEST_CONNECTION',status:'ERROR',message:error.message||String(error),responseSummary:{code:error.omieCode||''}});throw error;}
  }
  async syncCustomerById(localId,state=null){
    const {settings}=await this.settings();this.assertOperational(settings);if(!settings.syncClients)throw Object.assign(new Error('Sincronização de clientes está desativada.'),{statusCode:409});
    const data=state||await this.repo.state();const customer=findById(data.clients,localId);if(!customer)throw Object.assign(new Error('Cliente AR7 não encontrado.'),{statusCode:404});
    return this.withLock(`customer:${localId}`,()=>syncCustomer({repo:this.repo,client:this.client,customer,settings}));
  }
  async syncService(){const {settings}=await this.settings();this.assertOperational(settings);if(!settings.syncServices)throw Object.assign(new Error('Sincronização de serviços está desativada.'),{statusCode:409});return this.withLock('service:default',()=>syncDefaultService({repo:this.repo,client:this.client,settings}));}
  async syncOrder(localId,{refreshBillingAfter=true}={}){
    return this.withLock(`order:${localId}`,async()=>{
      const {settings}=await this.settings();this.assertOperational(settings);
      await this.repo.markStatus('SYNCING',{error:null});
      try{
      if(!settings.sendApprovedProposals||!settings.syncOrders)throw Object.assign(new Error('Envio de propostas aprovadas/OS ao Omie está desativado.'),{statusCode:409});
      const state=await this.repo.state();const order=findById(state.orders,localId);if(!order)throw Object.assign(new Error('OS AR7 não encontrada.'),{statusCode:404});
      if(!approvedProposal(order))throw Object.assign(new Error('Somente proposta aprovada pela empresa pode ser sincronizada com o Omie.'),{statusCode:409,omieCode:'PROPOSAL_NOT_APPROVED'});
      const customer=findById(state.clients,order.clientId);if(!customer)throw Object.assign(new Error('Cliente da OS não encontrado no AR7.'),{statusCode:422});
      let customerMapping=await this.repo.getMapping('customer',customer.id);
      if(!customerMapping?.external_id){if(!settings.syncClients)throw Object.assign(new Error('Cliente ainda não possui vínculo Omie e a sincronização de clientes está desativada.'),{statusCode:422});customerMapping=await syncCustomer({repo:this.repo,client:this.client,customer,settings});}
      let serviceMapping=await this.repo.getMapping('service','service:default');
      if(!serviceMapping?.external_id){if(!settings.syncServices)throw Object.assign(new Error('Serviço Omie ainda não está vinculado e a sincronização de serviços está desativada.'),{statusCode:422});serviceMapping=await syncDefaultService({repo:this.repo,client:this.client,settings});}
      const mapping=await syncServiceOrder({repo:this.repo,client:this.client,order,customer,customerMapping,serviceMapping,settings});
      let finalMapping=mapping;
      if(refreshBillingAfter&&settings.queryBilling){try{finalMapping=await refreshBilling({repo:this.repo,client:this.client,order})||mapping;}catch{/* já registrado; não desfaz sincronização principal */}}
      await this.repo.markStatus('SYNCED',{countIncrement:1,error:null});return finalMapping;
      }catch(error){await this.repo.markStatus('ERROR',{error:error.message||String(error)});throw error;}
    });
  }
  async refreshOrderBilling(localId){const {settings}=await this.settings();this.assertOperational(settings);if(!settings.queryBilling)throw Object.assign(new Error('Consulta de faturamento está desativada.'),{statusCode:409});const state=await this.repo.state(),order=findById(state.orders,localId);if(!order)throw Object.assign(new Error('OS não encontrada.'),{statusCode:404});return this.withLock(`billing:${localId}`,()=>refreshBilling({repo:this.repo,client:this.client,order}));}
  async syncAll(){
    const {settings}=await this.settings();this.assertOperational(settings);await this.repo.markStatus('SYNCING',{error:null});const state=await this.repo.state();let success=0,errors=0;const details=[];
    if(settings.syncClients){for(const customer of state.clients||[]){try{await this.syncCustomerById(customer.id,state);success++;}catch(error){errors++;details.push({type:'customer',id:customer.id,error:error.message});}}}
    if(settings.syncServices){try{await this.syncService();success++;}catch(error){errors++;details.push({type:'service',id:'service:default',error:error.message});}}
    if(settings.sendApprovedProposals&&settings.syncOrders){for(const order of (state.orders||[]).filter(approvedProposal)){try{await this.syncOrder(order.id);success++;}catch(error){errors++;details.push({type:'service_order',id:order.id,error:error.message});}}}
    await this.repo.markStatus(errors?'PARTIAL':'SYNCED',{countIncrement:success,error:errors?`${errors} registro(s) com falha na sincronização.`:null});
    await this.repo.log({entityType:'sync',direction:'AR7_TO_OMIE',action:'SYNC_ALL',status:errors?'ERROR':'SUCCESS',message:`Sincronização manual: ${success} sucesso(s), ${errors} falha(s).`,requestSummary:{customers:Boolean(settings.syncClients),services:Boolean(settings.syncServices),approvedOrders:Boolean(settings.syncOrders&&settings.sendApprovedProposals)},responseSummary:{success,errors}});
    return {ok:errors===0,success,errors,details:details.slice(0,50)};
  }
  async options(){
    const {settings}=await this.settings();if(!this.client.configured())throw Object.assign(new Error('Credenciais Omie não configuradas.'),{statusCode:503});
    const results={categories:[],accounts:[],stages:[],paymentTerms:[],services:[]};const failures=[];
    const jobs=[
      ['categories',()=>this.client.listCategories(),p=>(p?.categoria_cadastro||p?.categorias||[]).map(x=>({id:String(x?.codigo||x?.cCodCateg||''),label:String(x?.descricao||x?.cDescricao||x?.codigo||'Categoria')}))],
      ['accounts',()=>this.client.listCurrentAccounts(),p=>(p?.ListarContasCorrentes||p?.conta_corrente_cadastro||p?.contas_correntes||p?.contacorrente_lista||[]).map(x=>({id:String(x?.nCodCC||x?.codigo||x?.codigo_conta_corrente||''),label:String(x?.descricao||x?.cDescricao||x?.nome||x?.nCodCC||'Conta corrente')}))],
      ['stages',()=>this.client.listBillingStages(),p=>{const rows=[];for(const group of (p?.cadastros||[]))for(const x of (group?.etapas||[]))rows.push({id:String(x?.cCodigo||''),label:String(x?.cDescricao||x?.cCodigo||'Etapa')});return rows;}],
      ['paymentTerms',()=>this.client.listPaymentTerms(),p=>(p?.cadastros||[]).map(x=>({id:String(x?.cCodigo||''),label:`${String(x?.cDescricao||x?.cCodigo||'Condição')} · ${Number(x?.nQtdeParc||1)} parcela(s)`,installments:Number(x?.nQtdeParc||1)}))],
      ['services',()=>this.client.listServices(),p=>(p?.cadastros||[]).map(x=>({id:String(serviceExternalId(x)||''),code:String(x?.cabecalho?.cCodigo||serviceExternalCode(x)||''),integrationCode:String(serviceExternalCode(x)||''),label:String(serviceLabel(x))}))]
    ];
    for(const [key,fn,normalize] of jobs){try{results[key]=normalize(await fn()).filter(x=>x.id||x.code).slice(0,500);}catch(error){failures.push({key,error:error.message});}}
    await this.repo.log({entityType:'reference_data',direction:'OMIE_TO_AR7',action:'LOAD_OPTIONS',status:failures.length?'ERROR':'SUCCESS',message:failures.length?'Parâmetros Omie carregados parcialmente.':'Parâmetros Omie carregados.',responseSummary:{categories:results.categories.length,accounts:results.accounts.length,stages:results.stages.length,paymentTerms:results.paymentTerms.length,services:results.services.length,failures:failures.map(f=>f.key)}});
    return {...results,partial:Boolean(failures.length),failures};
  }
  async orderStatus(localId){
    const state=await this.repo.state();const order=findById(state.orders,localId);if(!order)return null;const customer=order?findById(state.clients,order.clientId):null;
    const [customerMapping,serviceMapping,orderMapping]=await Promise.all([customer?this.repo.getMapping('customer',customer.id):null,this.repo.getMapping('service','service:default'),this.repo.getMapping('service_order',localId)]);
    return {approved:approvedProposal(order),proposalCode:proposalIdentity(order),customer:{synced:Boolean(customerMapping?.external_id),status:customerMapping?.sync_status||'PENDING'},service:{synced:Boolean(serviceMapping?.external_id),status:serviceMapping?.sync_status||'PENDING'},order:{synced:Boolean(orderMapping?.external_id),status:orderMapping?.sync_status||'PENDING',externalId:orderMapping?.external_id||'',externalCode:orderMapping?.external_code||'',externalNumber:orderMapping?.metadata?.externalNumber||'',lastSyncedAt:orderMapping?.last_synced_at||'',billingStatus:orderMapping?.metadata?.billingStatus||'AGUARDANDO_FATURAMENTO',nfse:orderMapping?.metadata?.nfse||'',billingCheckedAt:orderMapping?.metadata?.billingCheckedAt||'',lastError:orderMapping?.metadata?.lastError||''}};
  }
  async onStateSaved(previous,current){
    const {settings}=await this.settings();if(!this.envConfig.enabledByEnvironment||!settings.enabled||!settings.sendApprovedProposals||!settings.syncOrders)return;
    const before=new Map((previous?.orders||[]).map(o=>[String(o.id),o]));
    for(const order of current?.orders||[]){
      if(!approvedProposal(order))continue;const old=before.get(String(order.id));const changed=!approvedProposal(old)||proposalIdentity(old)!==proposalIdentity(order);
      if(!changed)continue;
      await this.repo.ensureMapping('service_order',order.id,{status:'PENDING',externalCode:orderIntegrationCode(order)});
      if(settings.syncMode==='automatic')setImmediate(()=>this.syncOrder(order.id).catch(()=>{}));
    }
  }
}

module.exports={OmieSync,findById,proposalIdentity};
