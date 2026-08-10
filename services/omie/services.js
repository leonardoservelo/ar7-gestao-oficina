'use strict';

function serviceExternalId(item){return item?.intListar?.nCodServ??item?.intEditar?.nCodServ??item?.nCodServ??null;}
function serviceExternalCode(item){return item?.intListar?.cCodIntServ??item?.intEditar?.cCodIntServ??item?.cCodIntServ??item?.cabecalho?.cCodigo??'';}
function serviceLabel(item){return item?.cabecalho?.cDescricao||item?.descricao?.cDescrCompleta||item?.cDescricao||'Serviço Omie';}
function findService(payload,{externalId='',integrationCode='',displayCode=''}){
  const list=payload?.cadastros||[];
  return list.find(item=>externalId&&String(serviceExternalId(item))===String(externalId))||list.find(item=>integrationCode&&String(serviceExternalCode(item))===String(integrationCode))||list.find(item=>displayCode&&String(item?.cabecalho?.cCodigo||'')===String(displayCode))||null;
}
function serviceCreatePayload(settings){
  const code=String(settings.defaultServiceIntegrationCode||'AR7-SVC-MANUT').slice(0,60);
  const description=String(settings.defaultServiceName||'Manutenção eletromecânica conforme proposta AR7').slice(0,100);
  return {
    intEditar:{cCodIntServ:code,nCodServ:0},
    descricao:{cDescrCompleta:description},
    cabecalho:{cDescricao:description,cCodigo:String(settings.defaultServiceExternalCode||'AR7-MANUT').slice(0,20),cIdTrib:String(settings.serviceTaxId||''),cCodServMun:String(settings.serviceMunicipalCode||''),cCodLC116:String(settings.serviceLc116Code||''),nIdNBS:String(settings.serviceNbsId||''),nPrecoUnit:0,cCodCateg:String(settings.categoryCode||'')},
    impostos:{nAliqISS:0,cRetISS:'N',nAliqPIS:0,cRetPIS:'N',nAliqCOFINS:0,cRetCOFINS:'N',nAliqCSLL:0,cRetCSLL:'N',nAliqIR:0,cRetIR:'N',nAliqINSS:0,cRetINSS:'N',nRedBaseINSS:0,nRedBaseCOFINS:0,nRedBasePIS:0,lDeduzISS:false}
  };
}

async function syncDefaultService({repo,client,settings}){
  const localId='service:default';let mapping=await repo.getMapping('service',localId);
  try{
    if(mapping?.external_id){
      const existing=await client.consultService({nCodServ:Number(mapping.external_id)});
      const id=serviceExternalId(existing)||mapping.external_id;
      mapping=await repo.upsertMapping('service',localId,{externalId:id,externalCode:serviceExternalCode(existing)||mapping.external_code,status:'SYNCED',metadata:{name:serviceLabel(existing)}});
      await repo.log({entityType:'service',localId,externalId:id,direction:'AR7_TO_OMIE',action:'CHECK_SERVICE',status:'SUCCESS',message:'Serviço Omie já vinculado.',responseSummary:{externalId:String(id)}});return mapping;
    }
    const preferredId=String(settings.defaultServiceExternalId||'').trim();const integrationCode=String(settings.defaultServiceIntegrationCode||'AR7-SVC-MANUT').trim();
    const list=await client.listServices(preferredId?{}:{cCodigo:String(settings.defaultServiceExternalCode||'').trim()});
    const found=findService(list,{externalId:preferredId,integrationCode,displayCode:settings.defaultServiceExternalCode});
    if(found){
      const id=serviceExternalId(found);mapping=await repo.upsertMapping('service',localId,{externalId:id,externalCode:serviceExternalCode(found)||integrationCode,status:'SYNCED',metadata:{name:serviceLabel(found),matchedExisting:true}});
      await repo.log({entityType:'service',localId,externalId:id,direction:'AR7_TO_OMIE',action:'MAP_SERVICE',status:'SUCCESS',message:'Serviço existente no Omie vinculado ao AR7.',responseSummary:{externalId:String(id),name:serviceLabel(found)}});return mapping;
    }
    if(!settings.autoCreateService)throw Object.assign(new Error('Selecione um serviço existente do Omie ou habilite a criação do serviço padrão.'),{statusCode:422,omieCode:'SERVICE_MAPPING_REQUIRED'});
    if(!settings.serviceTaxId||!settings.serviceMunicipalCode||!settings.serviceLc116Code||!settings.categoryCode)throw Object.assign(new Error('Para criar serviço no Omie, preencha tributação, serviço municipal, LC 116 e categoria.'),{statusCode:422,omieCode:'SERVICE_TAX_CONFIG_REQUIRED'});
    const response=await client.upsertService(serviceCreatePayload(settings));const id=serviceExternalId(response);
    if(!id)throw new Error('Omie não retornou nCodServ após sincronizar o serviço.');
    mapping=await repo.upsertMapping('service',localId,{externalId:id,externalCode:response?.cCodIntServ||integrationCode,status:'SYNCED',metadata:{name:settings.defaultServiceName,createdByAr7:true}});
    await repo.log({entityType:'service',localId,externalId:id,direction:'AR7_TO_OMIE',action:'UPSERT_SERVICE',status:'SUCCESS',message:'Serviço padrão AR7 sincronizado com o Omie.',requestSummary:{taxConfigured:true},responseSummary:{externalId:String(id)}});return mapping;
  }catch(error){
    await repo.upsertMapping('service',localId,{externalCode:String(settings.defaultServiceIntegrationCode||'AR7-SVC-MANUT'),status:'ERROR',metadata:{lastError:String(error.message||error).slice(0,300)}});
    await repo.log({entityType:'service',localId,direction:'AR7_TO_OMIE',action:'SYNC_SERVICE',status:'ERROR',message:error.message||String(error),responseSummary:{code:error.omieCode||''}});throw error;
  }
}

module.exports={serviceExternalId,serviceExternalCode,serviceLabel,findService,serviceCreatePayload,syncDefaultService};
