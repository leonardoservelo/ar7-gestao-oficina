'use strict';

function nfseNumber(status){
  const list=status?.ListaRpsNfse||status?.listaRpsNfse||[];
  const successful=list.find(item=>String(item?.cStatusRps||'')==='004'&&item?.nNfse)||list.find(item=>item?.nNfse);
  return successful?.nNfse?String(successful.nNfse):'';
}
function normalizeBilling(status){
  const billed=String(status?.cFaturada||status?.InfoCadastro?.cFaturada||'').toUpperCase()==='S';
  const canceled=String(status?.cCancelada||status?.InfoCadastro?.cCancelada||'').toUpperCase()==='S';
  const nfse=nfseNumber(status);
  return {billingStatus:canceled?'CANCELADA':billed?'FATURADO':'AGUARDANDO_FATURAMENTO',billed,canceled,nfse,stage:String(status?.cEtapa||status?.Cabecalho?.cEtapa||''),billedAt:String(status?.dDtFat||status?.InfoCadastro?.dDtFat||''),externalNumber:String(status?.cNumOS||'')};
}
async function refreshBilling({repo,client,order}){
  const localId=String(order.id),mapping=await repo.getMapping('service_order',localId);
  if(!mapping?.external_id&&!mapping?.external_code)return null;
  try{
    const key=mapping.external_id?{nCodOS:Number(mapping.external_id)}:{cCodIntOS:mapping.external_code};
    const status=await client.statusServiceOrder(key);const normalized=normalizeBilling(status);
    const updated=await repo.upsertMapping('service_order',localId,{externalId:mapping.external_id,externalCode:mapping.external_code,status:'SYNCED',metadata:{...normalized,billingCheckedAt:new Date().toISOString()}});
    await repo.log({entityType:'service_order',localId,externalId:mapping.external_id,direction:'OMIE_TO_AR7',action:'CHECK_BILLING_STATUS',status:'SUCCESS',message:normalized.billed?'OS faturada no Omie.':'Status de faturamento consultado.',responseSummary:{billingStatus:normalized.billingStatus,nfse:normalized.nfse||null,stage:normalized.stage}});return updated;
  }catch(error){await repo.log({entityType:'service_order',localId,externalId:mapping?.external_id,direction:'OMIE_TO_AR7',action:'CHECK_BILLING_STATUS',status:'ERROR',message:error.message||String(error),responseSummary:{code:error.omieCode||''}});throw error;}
}
module.exports={nfseNumber,normalizeBilling,refreshBilling};
