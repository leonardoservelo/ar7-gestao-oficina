'use strict';

const { stableCode }=require('./customers');

function toBrDate(value){const d=String(value||'').slice(0,10).split('-');return d.length===3&&d[0].length===4?`${d[2]}/${d[1]}/${d[0]}`:'';}
function numberValue(value){if(typeof value==='number')return Number.isFinite(value)?value:0;const t=String(value??'').trim().replace(/R\$\s*/ig,'').replace(/\./g,'').replace(',','.');const n=Number(t);return Number.isFinite(n)?n:0;}
function approvedProposal(order){const a=order?.approval||{};return String(a.status||'')==='Aprovado'&&Boolean(a.portalApprovalId||a.approvedProposalCodeV18||a.portalApprovedByClientId);}
function rejectedOrAdjustment(order){const s=String(order?.approval?.status||'');return s==='Recusado'||s==='Ajuste solicitado';}
function approvedAmount(order){const a=numberValue(order?.approval?.amount);if(a>0)return a;const b=order?.budget||{};const direct=numberValue(b.total||b.totalValue);return direct>0?direct:0;}
function orderIntegrationCode(order){return stableCode('AR7-OS-',order?.id||order?.number||'',60);}
function externalOrderId(payload){return payload?.nCodOS??payload?.Cabecalho?.nCodOS??payload?.cabecalho?.nCodOS??null;}
function externalOrderNumber(payload){return payload?.cNumOS??payload?.Cabecalho?.cNumOS??payload?.cabecalho?.cNumOS??'';}

function validateOrderConfig(settings){
  const missing=[];
  if(!settings.categoryCode)missing.push('categoria');
  if(!settings.currentAccountId)missing.push('conta corrente');
  if(!settings.billingStageCode)missing.push('etapa de faturamento');
  if(!settings.serviceCity)missing.push('cidade da prestação');
  if(!settings.installmentCode)missing.push('condição de pagamento');
  if(missing.length)throw Object.assign(new Error(`Complete a configuração Omie: ${missing.join(', ')}.`),{statusCode:422,omieCode:'OMIE_ORDER_CONFIG_REQUIRED'});
}

function makeOrderPayload({order,client,customerMapping,serviceMapping,settings,existing=null}){
  validateOrderConfig(settings);
  const integrationCode=orderIntegrationCode(order);const total=approvedAmount(order);
  if(total<=0)throw Object.assign(new Error('A proposta aprovada precisa ter valor maior que zero para gerar a OS Omie.'),{statusCode:422,omieCode:'APPROVED_AMOUNT_REQUIRED'});
  const budget=order?.budget||{};const existingItem=existing?.ServicosPrestados?.[0]||existing?.servicosPrestados?.[0]||null;
  const serviceItem={nCodServico:Number(serviceMapping.external_id),nQtde:1,nValUnit:Number(total.toFixed(2)),cDadosAdicItem:String(budget.technicalScope||order?.records?.diagnosis||'Serviço conforme proposta técnica AR7.').slice(0,500),cNaoGerarFinanceiro:'N'};
  if(existing){serviceItem.nSeqItem=Number(existingItem?.nSeqItem||1);serviceItem.cAcaoItem=existingItem?'A':'I';if(existingItem?.nIdItem)serviceItem.nIdItem=Number(existingItem.nIdItem);}
  const payload={
    Cabecalho:{cCodIntOS:integrationCode,cCodParc:String(settings.installmentCode),cEtapa:String(settings.billingStageCode),dDtPrevisao:toBrDate(order?.dueDate||new Date().toISOString().slice(0,10)),nCodCli:Number(customerMapping.external_id),nQtdeParc:Math.max(1,Number(settings.installmentCount)||1)},
    Departamentos:[],
    Email:{cEnvBoleto:'N',cEnvLink:'N',cEnviarPara:String(client?.email||order?.approval?.recipient||'').slice(0,500)},
    InformacoesAdicionais:{cCidPrestServ:String(settings.serviceCity).slice(0,40),cCodCateg:String(settings.categoryCode).slice(0,20),cDadosAdicNF:`AR7 OS #${String(order?.number||'')} · Proposta ${String(budget.proposalCode||order?.approval?.approvedProposalCodeV18||'')}`.slice(0,500),nCodCC:Number(settings.currentAccountId),cContato:String(client?.contact||'').slice(0,100)},
    ServicosPrestados:[serviceItem],
    Observacoes:{cObsOS:`Integração AR7. OS técnica ${String(order?.number||'')} permanece como histórico mestre no AR7.`.slice(0,500)}
  };
  if(existing){const extId=externalOrderId(existing);if(extId)payload.Cabecalho.nCodOS=Number(extId);}
  return payload;
}

async function syncServiceOrder({repo,client,order,customer,customerMapping,serviceMapping,settings}){
  if(!approvedProposal(order))throw Object.assign(new Error(rejectedOrAdjustment(order)?'Proposta negada ou em revisão não pode ser enviada ao Omie.':'A proposta precisa estar aprovada pelo cliente antes da sincronização.'),{statusCode:409,omieCode:'PROPOSAL_NOT_APPROVED'});
  const localId=String(order.id),integrationCode=orderIntegrationCode(order);let mapping=await repo.getMapping('service_order',localId);
  await repo.ensureMapping('service_order',localId,{externalCode:integrationCode});
  try{
    let existing=null;
    if(mapping?.external_id||mapping?.external_code){
      try{existing=await client.consultServiceOrder(mapping?.external_id?{nCodOS:Number(mapping.external_id)}:{cCodIntOS:integrationCode});}catch(error){if(error.omieCode!=='SOAP-ENV:Client'&&!/não encontrado|nao encontrado/i.test(error.message||''))throw error;}
    }else{
      try{existing=await client.consultServiceOrder({cCodIntOS:integrationCode});}catch(error){if(error.omieCode!=='SOAP-ENV:Client'&&!/não encontrado|nao encontrado/i.test(error.message||''))throw error;}
    }
    let response,action;
    if(existing&&externalOrderId(existing)){
      response=await client.alterServiceOrder(makeOrderPayload({order,client:customer,customerMapping,serviceMapping,settings,existing}));action='ALTER_SERVICE_ORDER';
    }else{
      response=await client.includeServiceOrder(makeOrderPayload({order,client:customer,customerMapping,serviceMapping,settings}));action='INCLUDE_SERVICE_ORDER';
    }
    const externalId=externalOrderId(response)||externalOrderId(existing);const externalNumber=externalOrderNumber(response)||externalOrderNumber(existing);
    if(!externalId)throw new Error('Omie não retornou o código da Ordem de Serviço.');
    mapping=await repo.upsertMapping('service_order',localId,{externalId,externalCode:integrationCode,status:'SYNCED',metadata:{externalNumber,proposalCode:order?.budget?.proposalCode||order?.approval?.approvedProposalCodeV18||'',approvedAmount:approvedAmount(order),billingStatus:'AGUARDANDO_FATURAMENTO',syncedProposalAt:order?.approval?.decidedAt||''}});
    await repo.log({entityType:'service_order',localId,externalId,direction:'AR7_TO_OMIE',action,status:'SUCCESS',message:existing?'OS Omie atualizada sem duplicidade.':'OS Omie criada a partir da proposta aprovada.',requestSummary:{proposalCode:order?.budget?.proposalCode||'',amount:approvedAmount(order),customerMapped:true,serviceMapped:true},responseSummary:{externalId:String(externalId),externalNumber}});
    return mapping;
  }catch(error){
    await repo.upsertMapping('service_order',localId,{externalCode:integrationCode,status:'ERROR',metadata:{lastError:String(error.message||error).slice(0,400),proposalCode:order?.budget?.proposalCode||''}});
    await repo.log({entityType:'service_order',localId,direction:'AR7_TO_OMIE',action:'SYNC_SERVICE_ORDER',status:'ERROR',message:error.message||String(error),requestSummary:{proposalCode:order?.budget?.proposalCode||'',approved:true},responseSummary:{code:error.omieCode||''}});throw error;
  }
}

module.exports={toBrDate,numberValue,approvedProposal,rejectedOrAdjustment,approvedAmount,orderIntegrationCode,externalOrderId,externalOrderNumber,validateOrderConfig,makeOrderPayload,syncServiceOrder};
