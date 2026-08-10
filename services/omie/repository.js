'use strict';

const crypto=require('crypto');
const { PROVIDER, DEFAULT_SETTINGS }=require('./config');

function jsonObject(value,fallback={}){return value&&typeof value==='object'&&!Array.isArray(value)?value:fallback;}
function mergeSettings(row,envMode='manual'){
  const cfg={...DEFAULT_SETTINGS,...jsonObject(row?.config)};
  cfg.enabled=Boolean(row?.enabled??cfg.enabled);
  cfg.syncMode=['manual','automatic'].includes(String(row?.sync_mode||''))?row.sync_mode:envMode;
  return cfg;
}

class OmieRepository{
  constructor(pool,{organizationId='ar7-main'}={}){this.pool=pool;this.organizationId=organizationId;}
  async ensureSchema(client=this.pool){
    await client.query(`CREATE TABLE IF NOT EXISTS ar7_integration_settings (
      organization_id text NOT NULL,
      provider text NOT NULL,
      enabled boolean NOT NULL DEFAULT false,
      sync_mode text NOT NULL DEFAULT 'manual',
      config jsonb NOT NULL DEFAULT '{}'::jsonb,
      status text NOT NULL DEFAULT 'NOT_CONFIGURED',
      company_external_id text,
      company_name text,
      last_sync_at timestamptz,
      last_error text,
      sync_count bigint NOT NULL DEFAULT 0,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      PRIMARY KEY (organization_id,provider)
    )`);
    await client.query(`CREATE TABLE IF NOT EXISTS ar7_integration_mappings (
      id text PRIMARY KEY,
      organization_id text NOT NULL,
      provider text NOT NULL,
      entity_type text NOT NULL,
      local_id text NOT NULL,
      external_id text,
      external_code text,
      sync_status text NOT NULL DEFAULT 'PENDING',
      metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
      last_synced_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )`);
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS ar7_integration_mappings_local_uq ON ar7_integration_mappings(organization_id,provider,entity_type,local_id)`);
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS ar7_integration_mappings_external_uq ON ar7_integration_mappings(organization_id,provider,entity_type,external_id) WHERE external_id IS NOT NULL AND external_id<>''`);
    await client.query(`CREATE INDEX IF NOT EXISTS ar7_integration_mappings_status_idx ON ar7_integration_mappings(organization_id,provider,sync_status,updated_at DESC)`);
    await client.query(`CREATE TABLE IF NOT EXISTS ar7_integration_logs (
      id bigserial PRIMARY KEY,
      organization_id text NOT NULL,
      provider text NOT NULL,
      entity_type text,
      local_id text,
      external_id text,
      direction text NOT NULL,
      action text NOT NULL,
      status text NOT NULL,
      message text,
      request_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
      response_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now()
    )`);
    await client.query(`CREATE INDEX IF NOT EXISTS ar7_integration_logs_scope_idx ON ar7_integration_logs(organization_id,provider,created_at DESC)`);
    await client.query(`CREATE TABLE IF NOT EXISTS ar7_integration_webhook_events (
      event_key text NOT NULL,
      organization_id text NOT NULL,
      provider text NOT NULL,
      topic text,
      payload jsonb NOT NULL DEFAULT '{}'::jsonb,
      status text NOT NULL DEFAULT 'PENDING',
      attempts integer NOT NULL DEFAULT 0,
      last_error text,
      received_at timestamptz NOT NULL DEFAULT now(),
      processed_at timestamptz,
      PRIMARY KEY (organization_id,provider,event_key)
    )`);
    await client.query(`CREATE INDEX IF NOT EXISTS ar7_integration_webhook_scope_idx ON ar7_integration_webhook_events(organization_id,provider,received_at DESC)`);
    await client.query(`INSERT INTO ar7_integration_settings(organization_id,provider,enabled,sync_mode,config,status)
      VALUES($1,$2,false,'manual',$3::jsonb,'NOT_CONFIGURED') ON CONFLICT (organization_id,provider) DO NOTHING`,[this.organizationId,PROVIDER,JSON.stringify(DEFAULT_SETTINGS)]);
  }
  async getSettings(envMode='manual'){
    const r=await this.pool.query(`SELECT * FROM ar7_integration_settings WHERE organization_id=$1 AND provider=$2`,[this.organizationId,PROVIDER]);
    return {row:r.rows[0]||null,settings:mergeSettings(r.rows[0],envMode)};
  }
  async saveSettings(settings){
    const clean={...DEFAULT_SETTINGS,...settings};delete clean.appKey;delete clean.appSecret;delete clean.webhookToken;
    const enabled=Boolean(clean.enabled),syncMode=clean.syncMode==='automatic'?'automatic':'manual';
    const r=await this.pool.query(`INSERT INTO ar7_integration_settings(organization_id,provider,enabled,sync_mode,config,status,updated_at)
      VALUES($1,$2,$3,$4,$5::jsonb,CASE WHEN $3 THEN 'PENDING' ELSE 'NOT_CONFIGURED' END,now())
      ON CONFLICT (organization_id,provider) DO UPDATE SET enabled=EXCLUDED.enabled,sync_mode=EXCLUDED.sync_mode,config=EXCLUDED.config,status=CASE WHEN EXCLUDED.enabled THEN 'PENDING' ELSE 'NOT_CONFIGURED' END,last_error=NULL,updated_at=now()
      RETURNING *`,[this.organizationId,PROVIDER,enabled,syncMode,JSON.stringify(clean)]);
    return {row:r.rows[0],settings:mergeSettings(r.rows[0],syncMode)};
  }
  async markStatus(status,{companyExternalId=null,companyName=null,error=null,countIncrement=0}={}){
    await this.pool.query(`UPDATE ar7_integration_settings SET status=$3, company_external_id=COALESCE($4,company_external_id), company_name=COALESCE($5,company_name), last_error=$6,
      last_sync_at=CASE WHEN $3 IN ('SYNCED','PARTIAL') THEN now() ELSE last_sync_at END, sync_count=sync_count+$7, updated_at=now()
      WHERE organization_id=$1 AND provider=$2`,[this.organizationId,PROVIDER,status,companyExternalId,companyName,error?String(error).slice(0,1000):null,Number(countIncrement||0)]);
  }
  async getMapping(entityType,localId){const r=await this.pool.query(`SELECT * FROM ar7_integration_mappings WHERE organization_id=$1 AND provider=$2 AND entity_type=$3 AND local_id=$4`,[this.organizationId,PROVIDER,entityType,String(localId)]);return r.rows[0]||null;}
  async findMappingByExternal(entityType,externalId){const r=await this.pool.query(`SELECT * FROM ar7_integration_mappings WHERE organization_id=$1 AND provider=$2 AND entity_type=$3 AND external_id=$4`,[this.organizationId,PROVIDER,entityType,String(externalId)]);return r.rows[0]||null;}
  async findMappingByExternalCode(entityType,externalCode){const r=await this.pool.query(`SELECT * FROM ar7_integration_mappings WHERE organization_id=$1 AND provider=$2 AND entity_type=$3 AND external_code=$4`,[this.organizationId,PROVIDER,entityType,String(externalCode)]);return r.rows[0]||null;}
  async ensureMapping(entityType,localId,{status='PENDING',externalCode=''}={}){
    const id=crypto.randomUUID();
    const r=await this.pool.query(`INSERT INTO ar7_integration_mappings(id,organization_id,provider,entity_type,local_id,external_code,sync_status)
      VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (organization_id,provider,entity_type,local_id) DO UPDATE SET updated_at=now() RETURNING *`,[id,this.organizationId,PROVIDER,entityType,String(localId),externalCode||null,status]);
    return r.rows[0];
  }
  async upsertMapping(entityType,localId,{externalId=null,externalCode=null,status='SYNCED',metadata={}}={}){
    const id=crypto.randomUUID();
    const r=await this.pool.query(`INSERT INTO ar7_integration_mappings(id,organization_id,provider,entity_type,local_id,external_id,external_code,sync_status,metadata,last_synced_at)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,CASE WHEN $8='SYNCED' THEN now() ELSE NULL END)
      ON CONFLICT (organization_id,provider,entity_type,local_id) DO UPDATE SET external_id=COALESCE(EXCLUDED.external_id,ar7_integration_mappings.external_id),external_code=COALESCE(EXCLUDED.external_code,ar7_integration_mappings.external_code),sync_status=EXCLUDED.sync_status,metadata=ar7_integration_mappings.metadata||EXCLUDED.metadata,last_synced_at=CASE WHEN EXCLUDED.sync_status='SYNCED' THEN now() ELSE ar7_integration_mappings.last_synced_at END,updated_at=now() RETURNING *`,
      [id,this.organizationId,PROVIDER,entityType,String(localId),externalId?String(externalId):null,externalCode?String(externalCode):null,status,JSON.stringify(jsonObject(metadata))]);
    return r.rows[0];
  }
  async log({entityType=null,localId=null,externalId=null,direction='AR7_TO_OMIE',action,status='SUCCESS',message='',requestSummary={},responseSummary={}}){
    await this.pool.query(`INSERT INTO ar7_integration_logs(organization_id,provider,entity_type,local_id,external_id,direction,action,status,message,request_summary,response_summary)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11::jsonb)`,[this.organizationId,PROVIDER,entityType,localId?String(localId):null,externalId?String(externalId):null,direction,action,status,String(message||'').slice(0,1000),JSON.stringify(jsonObject(requestSummary)),JSON.stringify(jsonObject(responseSummary))]);
  }
  async logs(limit=100){const n=Math.max(1,Math.min(500,Number(limit)||100));const r=await this.pool.query(`SELECT id,entity_type,local_id,external_id,direction,action,status,message,request_summary,response_summary,created_at FROM ar7_integration_logs WHERE organization_id=$1 AND provider=$2 ORDER BY created_at DESC LIMIT $3`,[this.organizationId,PROVIDER,n]);return r.rows;}
  async summary(){
    const [m,l]=await Promise.all([this.pool.query(`SELECT entity_type,sync_status,count(*)::int AS total FROM ar7_integration_mappings WHERE organization_id=$1 AND provider=$2 GROUP BY entity_type,sync_status`,[this.organizationId,PROVIDER]),this.pool.query(`SELECT count(*)::int AS total FROM ar7_integration_logs WHERE organization_id=$1 AND provider=$2`,[this.organizationId,PROVIDER])]);
    return {mappings:m.rows,logs:Number(l.rows[0]?.total||0)};
  }
  async state(){const r=await this.pool.query(`SELECT data FROM ar7_app_state WHERE state_key='main'`);return r.rows[0]?.data||{};}
  async insertWebhookEvent({eventKey,topic='',payload={}}){
    const r=await this.pool.query(`INSERT INTO ar7_integration_webhook_events(event_key,organization_id,provider,topic,payload) VALUES($1,$2,$3,$4,$5::jsonb) ON CONFLICT (organization_id,provider,event_key) DO NOTHING RETURNING event_key`,[eventKey,this.organizationId,PROVIDER,String(topic||'').slice(0,200),JSON.stringify(jsonObject(payload))]);return Boolean(r.rowCount);
  }
  async markWebhook(eventKey,status,error=null){await this.pool.query(`UPDATE ar7_integration_webhook_events SET status=$4,attempts=attempts+1,last_error=$5,processed_at=CASE WHEN $4 IN ('SUCCESS','SKIPPED') THEN now() ELSE processed_at END WHERE organization_id=$1 AND provider=$2 AND event_key=$3`,[this.organizationId,PROVIDER,eventKey,status,error?String(error).slice(0,1000):null]);}
}

module.exports={OmieRepository,mergeSettings};
