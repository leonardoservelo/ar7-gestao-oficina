'use strict';

const crypto=require('crypto');

function digits(value){return String(value||'').replace(/\D/g,'');}
function stableCode(prefix,id,max=60){const hash=crypto.createHash('sha256').update(String(id||'')).digest('hex').slice(0,16).toUpperCase();return `${prefix}${hash}`.slice(0,max);}
function splitPhone(value){const d=digits(value);if(d.length>=10)return {ddd:d.slice(0,2),number:d.slice(2,17)};return {ddd:'',number:d.slice(0,15)};}
function customerPayload(customer,integrationCode){
  const phone=splitPhone(customer?.phone);
  const payload={
    codigo_cliente_integracao:integrationCode,
    razao_social:String(customer?.name||'Cliente AR7').slice(0,60),
    nome_fantasia:String(customer?.name||'Cliente AR7').slice(0,100),
    cnpj_cpf:String(customer?.cnpj||'').slice(0,20),
    contato:String(customer?.contact||'').slice(0,100),
    email:String(customer?.email||'').slice(0,500),
    telefone1_ddd:phone.ddd,
    telefone1_numero:phone.number,
    endereco:String(customer?.address||'').slice(0,60),
    cidade:String(customer?.city||'').slice(0,40),
    estado:String(customer?.state||'').slice(0,2).toUpperCase(),
    observacao:`Integrado pelo AR7 Gestão da Oficina. ID interno: ${String(customer?.id||'').slice(0,80)}`
  };
  for(const key of Object.keys(payload)){if(payload[key]===''||payload[key]==null)delete payload[key];}
  return payload;
}
function findCustomerInList(payload,customer,integrationCode){
  const list=payload?.clientes_cadastro||payload?.clientes_cadastro_resumido||[];
  const targetDoc=digits(customer?.cnpj);
  return list.find(item=>String(item?.codigo_cliente_integracao||'')===integrationCode)||(targetDoc?list.find(item=>digits(item?.cnpj_cpf)===targetDoc):null)||null;
}
function externalCustomerId(payload){return payload?.codigo_cliente_omie??payload?.codigo_cliente??payload?.nCodCli??null;}

async function syncCustomer({repo,client,customer,settings}){
  if(!customer?.id)throw new Error('Cliente AR7 inválido para sincronização.');
  const localId=String(customer.id),integrationCode=stableCode('AR7-C-',localId);
  let mapping=await repo.getMapping('customer',localId);
  await repo.ensureMapping('customer',localId,{externalCode:integrationCode});
  try{
    if(mapping?.external_id){
      const response=await client.upsertCustomer({...customerPayload(customer,integrationCode),codigo_cliente_omie:Number(mapping.external_id)||undefined});
      const externalId=externalCustomerId(response)||mapping.external_id;
      mapping=await repo.upsertMapping('customer',localId,{externalId,externalCode:integrationCode,status:'SYNCED',metadata:{name:customer.name||'',document:digits(customer.cnpj).slice(-6)}});
      await repo.log({entityType:'customer',localId,externalId,direction:'AR7_TO_OMIE',action:'UPSERT_CUSTOMER',status:'SUCCESS',message:'Cliente atualizado no Omie.',requestSummary:{hasMapping:true,hasDocument:Boolean(customer.cnpj)},responseSummary:{externalId:String(externalId)}});
      return mapping;
    }
    const filter={clientesFiltro:{codigo_cliente_integracao:integrationCode}};
    if(customer.cnpj)filter.clientesFiltro.cnpj_cpf=String(customer.cnpj).slice(0,20);
    const listed=await client.listCustomers(filter);const found=findCustomerInList(listed,customer,integrationCode);
    if(found){
      const externalId=externalCustomerId(found);
      mapping=await repo.upsertMapping('customer',localId,{externalId,externalCode:integrationCode,status:'SYNCED',metadata:{matchedExisting:true,name:customer.name||''}});
      await repo.log({entityType:'customer',localId,externalId,direction:'AR7_TO_OMIE',action:'MAP_CUSTOMER',status:'SUCCESS',message:'Cliente existente no Omie vinculado ao AR7.',requestSummary:{searchedBy:'integration_code_or_document'},responseSummary:{externalId:String(externalId)}});
      return mapping;
    }
    const response=await client.upsertCustomer(customerPayload(customer,integrationCode));
    const externalId=externalCustomerId(response);
    if(!externalId)throw new Error('Omie não retornou o código do cliente após o UpsertCliente.');
    mapping=await repo.upsertMapping('customer',localId,{externalId,externalCode:integrationCode,status:'SYNCED',metadata:{createdOrUpdated:true,name:customer.name||''}});
    await repo.log({entityType:'customer',localId,externalId,direction:'AR7_TO_OMIE',action:'UPSERT_CUSTOMER',status:'SUCCESS',message:'Cliente sincronizado com o Omie.',requestSummary:{hasMapping:false,hasDocument:Boolean(customer.cnpj)},responseSummary:{externalId:String(externalId)}});
    return mapping;
  }catch(error){
    await repo.upsertMapping('customer',localId,{externalCode:integrationCode,status:'ERROR',metadata:{lastError:String(error.message||error).slice(0,300)}});
    await repo.log({entityType:'customer',localId,direction:'AR7_TO_OMIE',action:'SYNC_CUSTOMER',status:'ERROR',message:error.message||String(error),requestSummary:{hasDocument:Boolean(customer.cnpj)},responseSummary:{code:error.omieCode||''}});
    throw error;
  }
}

module.exports={digits,stableCode,splitPhone,customerPayload,findCustomerInList,externalCustomerId,syncCustomer};
