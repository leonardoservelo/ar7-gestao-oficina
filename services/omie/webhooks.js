'use strict';
const crypto=require('crypto');

function redact(value,depth=0){
  if(depth>8)return '[limite]';
  if(Array.isArray(value))return value.slice(0,100).map(v=>redact(v,depth+1));
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).filter(([k])=>!/(secret|password|senha|token|app[_-]?key)/i.test(k)).map(([k,v])=>[k,redact(v,depth+1)]));
  if(typeof value==='string')return value.slice(0,5000);
  return value;
}
function canonical(value){if(Array.isArray(value))return `[${value.map(canonical).join(',')}]`;if(value&&typeof value==='object')return `{${Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')}}`;return JSON.stringify(value);}
function eventTopic(payload){return String(payload?.topic||payload?.event||payload?.evento||payload?.eventName||payload?.evento_tipo||payload?.event_type||'omie.event').slice(0,200);}
function eventKey(payload,headers={}){const direct=payload?.eventId||payload?.event_id||payload?.idEvento||payload?.id_evento||payload?.messageId||payload?.message_id||headers['x-request-id'];return direct?`omie:${String(direct).slice(0,180)}`:`omie:sha256:${crypto.createHash('sha256').update(canonical(redact(payload))).digest('hex')}`;}
function collectValues(obj,keys,out=new Set(),depth=0){if(depth>8||obj==null)return out;if(Array.isArray(obj)){for(const x of obj)collectValues(x,keys,out,depth+1);return out;}if(typeof obj==='object'){for(const [k,v] of Object.entries(obj)){if(keys.has(k)&&['string','number'].includes(typeof v))out.add(String(v));collectValues(v,keys,out,depth+1);}}return out;}

async function processWebhookEvent({repo,eventKey:key,topic,payload,onLinkedOrder=null}){
  try{
    const clean=redact(payload);const osIds=[...collectValues(clean,new Set(['nCodOS','codigo_os','codigoOrdemServico']))];const osCodes=[...collectValues(clean,new Set(['cCodIntOS','codigo_integracao_os']))];
    let linked=false;const touched=new Set();
    const applyMap=async map=>{if(!map||touched.has(String(map.local_id)))return;await repo.upsertMapping('service_order',map.local_id,{externalId:map.external_id,externalCode:map.external_code,status:'SYNCED',metadata:{lastWebhookAt:new Date().toISOString(),lastWebhookTopic:topic}});touched.add(String(map.local_id));linked=true;};
    for(const externalId of osIds)await applyMap(await repo.findMappingByExternal('service_order',externalId));
    for(const externalCode of osCodes)await applyMap(await repo.findMappingByExternalCode('service_order',externalCode));
    let billingRefreshes=0,billingRefreshErrors=0;
    if(linked&&typeof onLinkedOrder==='function')for(const localId of touched){try{await onLinkedOrder(localId);billingRefreshes++;}catch{billingRefreshErrors++;}}
    await repo.log({entityType:linked?'service_order':'webhook',direction:'OMIE_TO_AR7',action:'WEBHOOK_EVENT',status:linked?'SUCCESS':'SKIPPED',message:linked?'Webhook associado a uma OS AR7.':'Webhook recebido e armazenado; evento não exige ação direta nesta fase.',requestSummary:{topic,eventKey:key,osIds:osIds.slice(0,5),osCodes:osCodes.slice(0,5)},responseSummary:{linked,billingRefreshes,billingRefreshErrors}});
    await repo.markWebhook(key,linked?'SUCCESS':'SKIPPED');
  }catch(error){await repo.markWebhook(key,'ERROR',error.message||String(error));await repo.log({entityType:'webhook',direction:'OMIE_TO_AR7',action:'WEBHOOK_EVENT',status:'ERROR',message:error.message||String(error),requestSummary:{topic,eventKey:key}});}
}
module.exports={redact,canonical,eventTopic,eventKey,collectValues,processWebhookEvent};
