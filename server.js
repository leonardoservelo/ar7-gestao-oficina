'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');
const { createOmieIntegration } = require('./services/omie');

const root = path.resolve(__dirname);
const argPort = Number.parseInt(process.argv[2] || '', 10);
const envPort = Number.parseInt(process.env.PORT || '', 10);
let port = Number.isFinite(envPort) ? envPort : (Number.isFinite(argPort) ? argPort : 8108);
const isRender = process.env.RENDER === 'true';
const isHosted = Number.isFinite(envPort) || isRender || Boolean(process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID);
const host = process.env.HOST || (isHosted ? '0.0.0.0' : '127.0.0.1');
const shouldOpen = process.argv.includes('--open') && !isHosted;
const autoPort = process.argv.includes('--auto-port') && !isHosted;
const maxLocalPort = 8199;
let server = null;

const DATABASE_URL = process.env.DATABASE_URL || '';
let Pool = null;
if(DATABASE_URL){ ({ Pool } = require('pg')); }
const ADMIN_USER = process.env.AR7_ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.AR7_ADMIN_PASSWORD || '';
const APP_SECRET = process.env.APP_SECRET || '';
const SESSION_HOURS = Number.parseInt(process.env.AR7_SESSION_HOURS || '12', 10) || 12;
const LOGIN_WINDOW_MS = 15*60*1000;
const LOGIN_MAX_ATTEMPTS = 8;
const loginFailures = new Map();
const APP_RELEASE = '20.2.8';
const MIN_WRITE_RELEASE = '20.2.6';
const MAX_MEDIA_BYTES = 2 * 1024 * 1024;

function releaseAtLeast(value, minimum){
  const a=String(value||'0').split('.').map(n=>Number.parseInt(n,10)||0);
  const b=String(minimum||'0').split('.').map(n=>Number.parseInt(n,10)||0);
  const len=Math.max(a.length,b.length);
  for(let i=0;i<len;i++){const av=a[i]||0,bv=b[i]||0;if(av>bv)return true;if(av<bv)return false;}
  return true;
}

function emptyStateV206(base={}){
  const defaults={name:'AR7 Elétrica',unit:'Matriz',email:'relatorios@ar7eletrica.com.br'};
  const defaultCatalog={
    equipmentDescriptions:[],
    manufacturers:['WEG','SEW','Siemens','KSB','Schneider','ABB','NORD','Bonfiglioli','Voges','Marathon','OTAM'],
    partNames:['Rolamento','Retentor','Selo mecânico','O-ring','Ventoinha','Tampa','Eixo','Bucha','Acoplamento','Junta','Bobina','Capacitor']
  };
  return {
    version:20.2,
    company:{...defaults,...(base.company||{})},
    catalog:{...defaultCatalog,...(base.catalog||{}),equipmentDescriptions:[]},
    clients:[],equipment:[],orders:[],activity:[],deletedOrders:[]
  };
}

function collectMediaIds(value,out=new Set()){
  if(value==null)return out;
  if(typeof value==='string'){
    const re=/\/api\/media\/([a-f0-9-]{20,64})/gi;let match;
    while((match=re.exec(value)))out.add(match[1]);
    return out;
  }
  if(Array.isArray(value)){for(const item of value)collectMediaIds(item,out);return out;}
  if(typeof value==='object'){
    if(typeof value.mediaId==='string'&&/^[a-f0-9-]{20,64}$/i.test(value.mediaId))out.add(value.mediaId);
    for(const item of Object.values(value))collectMediaIds(item,out);
  }
  return out;
}

async function getDataEpoch(client=pool){
  const result=await client.query(`SELECT meta_value FROM ar7_system_meta WHERE meta_key='data_epoch'`);
  return String(result.rows[0]?.meta_value||'');
}

async function purgeUnreferencedMedia(client,state){
  const ids=[...collectMediaIds(state)];
  if(ids.length){await client.query(`DELETE FROM ar7_media WHERE NOT (id = ANY($1::text[]))`,[ids]);}
  else{await client.query(`DELETE FROM ar7_media`);}
}

const pool = DATABASE_URL ? new Pool({
  connectionString: DATABASE_URL,
  ssl: /\.internal(?::|\/|$)/i.test(DATABASE_URL) ? false : { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
}) : null;
const PUBLIC_URL = String(process.env.AR7_PUBLIC_URL || (isHosted ? 'https://ar7-gestao-oficina.onrender.com' : '')).replace(/\/$/,'');
const omie = pool ? createOmieIntegration({pool,env:process.env,baseUrl:PUBLIC_URL}) : null;
let schemaReadyPromise = null;

const mimeTypes = {
  '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8',
  '.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json; charset=utf-8','.svg':'image/svg+xml',
  '.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.gif':'image/gif','.webp':'image/webp','.ico':'image/x-icon','.pdf':'application/pdf'
};

function safeFilePath(urlPath){
  let decoded; try{decoded=decodeURIComponent((urlPath||'/').split('?')[0]);}catch{return null;}
  if(decoded==='/'||decoded==='')decoded='/index.html';
  const normalized=path.normalize(decoded).replace(/^([/\\])+/, '');
  const filePath=path.resolve(root,normalized);
  return filePath.startsWith(root+path.sep)||filePath===root?filePath:null;
}

function openBrowser(url){
  if(!shouldOpen)return;
  try{
    let child;
    if(process.platform==='win32') child=spawn('cmd.exe',['/d','/s','/c','start','',url],{detached:true,stdio:'ignore',windowsHide:true});
    else if(process.platform==='darwin') child=spawn('open',[url],{detached:true,stdio:'ignore'});
    else child=spawn('xdg-open',[url],{detached:true,stdio:'ignore'});
    child.unref();
  }catch{console.log(`Abra manualmente: ${url}`);}
}

function json(res,status,payload,headers={}){
  const body=JSON.stringify(payload);
  res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'same-origin','Permissions-Policy':'camera=(self), microphone=(), geolocation=()',...headers});
  res.end(body);
}

function readJson(req,maxBytes=50*1024*1024){
  return new Promise((resolve,reject)=>{
    const chunks=[];let total=0;
    req.on('data',chunk=>{total+=chunk.length;if(total>maxBytes){reject(Object.assign(new Error('Payload muito grande'),{statusCode:413}));req.destroy();return;}chunks.push(chunk);});
    req.on('end',()=>{try{const raw=Buffer.concat(chunks).toString('utf8');resolve(raw?JSON.parse(raw):{});}catch(error){error.statusCode=400;reject(error);}});
    req.on('error',reject);
  });
}

function parseCookies(req){
  return String(req.headers.cookie||'').split(';').reduce((acc,item)=>{const idx=item.indexOf('=');if(idx>0)acc[item.slice(0,idx).trim()]=decodeURIComponent(item.slice(idx+1).trim());return acc;},{});
}

function b64url(input){return Buffer.from(input).toString('base64url');}
function signSession(username){
  const payload=b64url(JSON.stringify({u:username,exp:Date.now()+SESSION_HOURS*60*60*1000}));
  const sig=crypto.createHmac('sha256',APP_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}
function verifySession(token){
  try{
    if(!APP_SECRET||!token)return null;
    const [payload,sig]=String(token).split('.');if(!payload||!sig)return null;
    const expected=crypto.createHmac('sha256',APP_SECRET).update(payload).digest('base64url');
    const a=Buffer.from(sig),b=Buffer.from(expected);if(a.length!==b.length||!crypto.timingSafeEqual(a,b))return null;
    const data=JSON.parse(Buffer.from(payload,'base64url').toString('utf8'));
    if(!data?.u||!data?.exp||Date.now()>Number(data.exp))return null;
    return data;
  }catch{return null;}
}
function safeEquals(a,b){const aa=Buffer.from(String(a)),bb=Buffer.from(String(b));return aa.length===bb.length&&crypto.timingSafeEqual(aa,bb);}
function loginAttemptKey(req){return String(req.socket?.remoteAddress||'unknown');}
function pruneLoginFailures(now=Date.now()){
  for(const [key,state] of loginFailures){if(now-state.startedAt>LOGIN_WINDOW_MS)loginFailures.delete(key);}
  if(loginFailures.size>1024){for(const key of loginFailures.keys()){loginFailures.delete(key);if(loginFailures.size<=768)break;}}
}
function loginAttemptState(req){
  const key=loginAttemptKey(req),now=Date.now();
  if(loginFailures.size>1024)pruneLoginFailures(now);
  let state=loginFailures.get(key);
  if(!state||now-state.startedAt>LOGIN_WINDOW_MS){state={count:0,startedAt:now};loginFailures.set(key,state);}
  return {key,state,now};
}
function loginBlocked(req){const {state,now}=loginAttemptState(req);return state.count>=LOGIN_MAX_ATTEMPTS&&now-state.startedAt<=LOGIN_WINDOW_MS;}
function recordLoginFailure(req){const {key,state}=loginAttemptState(req);state.count+=1;loginFailures.set(key,state);}
function clearLoginFailures(req){loginFailures.delete(loginAttemptKey(req));}
function requireAuth(req,res){
  if(!APP_SECRET||!ADMIN_PASSWORD){json(res,503,{ok:false,error:'Autenticação do servidor ainda não configurada.'});return null;}
  const session=verifySession(parseCookies(req).ar7_session);
  if(!session){json(res,401,{ok:false,error:'Login necessário.'});return null;}
  return session;
}

async function ensureSchema(){
  if(!pool)throw new Error('DATABASE_URL não configurada.');
  if(!schemaReadyPromise){
    schemaReadyPromise=(async()=>{
      await pool.query(`CREATE TABLE IF NOT EXISTS ar7_app_state (
        state_key text PRIMARY KEY,
        data jsonb NOT NULL,
        revision bigint NOT NULL DEFAULT 1,
        updated_at timestamptz NOT NULL DEFAULT now()
      )`);
      await pool.query(`CREATE TABLE IF NOT EXISTS ar7_audit_log (
        id bigserial PRIMARY KEY,
        actor text NOT NULL,
        action text NOT NULL,
        revision bigint,
        created_at timestamptz NOT NULL DEFAULT now()
      )`);
      await pool.query(`CREATE TABLE IF NOT EXISTS ar7_media (
        id text PRIMARY KEY,
        content_type text NOT NULL,
        data bytea NOT NULL,
        size_bytes integer NOT NULL,
        actor text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      )`);
      await pool.query(`CREATE TABLE IF NOT EXISTS ar7_system_meta (
        meta_key text PRIMARY KEY,
        meta_value text NOT NULL,
        updated_at timestamptz NOT NULL DEFAULT now()
      )`);
      await pool.query(`INSERT INTO ar7_system_meta(meta_key,meta_value) VALUES('data_epoch',$1)
        ON CONFLICT (meta_key) DO NOTHING`,[crypto.randomUUID()]);
      if(omie)await omie.ensureSchema();
      return true;
    })().catch(error=>{schemaReadyPromise=null;throw error;});
  }
  return schemaReadyPromise;
}

async function handleApi(req,res,url){
  if(url.pathname==='/api/auth/status'&&req.method==='GET'){
    if(!APP_SECRET||!ADMIN_PASSWORD){json(res,503,{ok:false,authenticated:false,configured:false,error:'Autenticação do servidor ainda não configurada.'});return true;}
    const session=verifySession(parseCookies(req).ar7_session);
    if(!session){json(res,401,{ok:false,authenticated:false,configured:true});return true;}
    json(res,200,{ok:true,authenticated:true,configured:true,user:session.u});return true;
  }
  if(url.pathname==='/api/auth/login'&&req.method==='POST'){
    if(!APP_SECRET||!ADMIN_PASSWORD){json(res,503,{ok:false,error:'Login ainda não configurado no servidor.'});return true;}
    if(loginBlocked(req)){json(res,429,{ok:false,error:'Muitas tentativas de login. Aguarde alguns minutos e tente novamente.'},{'Retry-After':String(Math.ceil(LOGIN_WINDOW_MS/1000))});return true;}
    const body=await readJson(req,64*1024);
    if(!safeEquals(body.username||'',ADMIN_USER)||!safeEquals(body.password||'',ADMIN_PASSWORD)){
      recordLoginFailure(req);json(res,401,{ok:false,error:'Usuário ou senha inválidos.'});return true;
    }
    clearLoginFailures(req);
    const token=signSession(ADMIN_USER);
    const secure=isHosted?'; Secure':'';
    json(res,200,{ok:true,user:ADMIN_USER},{'Set-Cookie':`ar7_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_HOURS*3600}${secure}`});
    return true;
  }
  if(url.pathname==='/api/auth/logout'&&req.method==='POST'){
    json(res,200,{ok:true},{'Set-Cookie':`ar7_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${isHosted?'; Secure':''}`});return true;
  }
  if(url.pathname==='/api/integrations/omie/webhook'&&req.method==='POST'){
    if(!omie){json(res,503,{ok:false,error:'Banco central indisponível.'});return true;}
    try{
      await ensureSchema();
      const result=await omie.receiveWebhook(req,url,readJson);
      json(res,result.status||200,{ok:Boolean(result.ok),duplicate:Boolean(result.duplicate),eventKey:result.eventKey||undefined,topic:result.topic||undefined,error:result.error||undefined});
    }catch(error){console.error('POST /api/integrations/omie/webhook',error?.message||error);json(res,error.statusCode||500,{ok:false,error:'Webhook Omie inválido ou temporariamente indisponível.'});}
    return true;
  }
  if(url.pathname==='/api/media'&&req.method==='POST'){
    const session=requireAuth(req,res);if(!session)return true;
    try{
      await ensureSchema();
      const body=await readJson(req,4*1024*1024);
      const raw=String(body.dataUrl||'');
      const match=raw.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/i);
      if(!match){json(res,400,{ok:false,error:'Imagem inválida. Use JPEG, PNG ou WEBP.'});return true;}
      const buffer=Buffer.from(match[2],'base64');
      if(!buffer.length||buffer.length>MAX_MEDIA_BYTES){json(res,413,{ok:false,error:'A imagem compactada excede 2 MB.'});return true;}
      const id=crypto.randomUUID();
      const contentType=match[1].toLowerCase()==='image/jpg'?'image/jpeg':match[1].toLowerCase();
      await pool.query(`INSERT INTO ar7_media(id,content_type,data,size_bytes,actor) VALUES($1,$2,$3,$4,$5)`,[id,contentType,buffer,buffer.length,session.u]);
      json(res,201,{ok:true,id,url:`/api/media/${id}`,size:buffer.length,contentType});
    }catch(error){console.error('POST /api/media',error);json(res,error.statusCode||503,{ok:false,error:error.statusCode===413?'Imagem excedeu o limite permitido.':'Não foi possível armazenar o anexo no banco central.'});}
    return true;
  }
  if(/^\/api\/media\/[a-f0-9-]{20,64}$/i.test(url.pathname)&&req.method==='GET'){
    const session=requireAuth(req,res);if(!session)return true;
    try{
      await ensureSchema();
      const id=url.pathname.split('/').pop();
      const result=await pool.query(`SELECT content_type,data,size_bytes FROM ar7_media WHERE id=$1`,[id]);
      if(!result.rows.length){json(res,404,{ok:false,error:'Anexo não encontrado.'});return true;}
      const row=result.rows[0];
      res.writeHead(200,{
        'Content-Type':row.content_type,
        'Content-Length':String(row.size_bytes),
        'Cache-Control':'no-store, no-cache, must-revalidate, private, max-age=0',
        'Pragma':'no-cache','Expires':'0','X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'same-origin'
      });
      res.end(row.data);
    }catch(error){console.error('GET /api/media',error);json(res,503,{ok:false,error:'Não foi possível carregar o anexo.'});}
    return true;
  }
  if(/^\/api\/media\/[a-f0-9-]{20,64}$/i.test(url.pathname)&&req.method==='DELETE'){
    const session=requireAuth(req,res);if(!session)return true;
    try{
      await ensureSchema();
      const id=url.pathname.split('/').pop();
      const result=await pool.query(`DELETE FROM ar7_media WHERE id=$1`,[id]);
      json(res,200,{ok:true,deleted:result.rowCount>0});
    }catch(error){console.error('DELETE /api/media',error);json(res,503,{ok:false,error:'Não foi possível excluir o anexo.'});}
    return true;
  }
  if(url.pathname.startsWith('/api/integrations/omie/')&&url.pathname!=='/api/integrations/omie/webhook'){
    const session=requireAuth(req,res);if(!session)return true;
    if(!omie){json(res,503,{ok:false,error:'Banco central indisponível.'});return true;}
    try{
      await ensureSchema();
      if(url.pathname==='/api/integrations/omie/status'&&req.method==='GET'){
        json(res,200,{ok:true,...await omie.publicStatus()});return true;
      }
      if(url.pathname==='/api/integrations/omie/settings'&&req.method==='PUT'){
        const body=await readJson(req,256*1024);const saved=await omie.saveSettings(body);
        await omie.repo.log({entityType:'settings',direction:'AR7_TO_OMIE',action:'UPDATE_SETTINGS',status:'SUCCESS',message:`Configuração Omie atualizada por ${session.u}.`,requestSummary:{enabled:Boolean(saved.settings?.enabled),syncMode:saved.settings?.syncMode||'manual'}});
        json(res,200,{ok:true,settings:saved.settings,status:(await omie.publicStatus()).status});return true;
      }
      if(url.pathname==='/api/integrations/omie/test'&&req.method==='POST'){
        json(res,200,{ok:true,result:await omie.sync.testConnection(),integration:await omie.publicStatus()});return true;
      }
      if(url.pathname==='/api/integrations/omie/sync'&&req.method==='POST'){
        const result=await omie.sync.syncAll();json(res,result.ok?200:207,{ok:result.ok,...result});return true;
      }
      if(url.pathname==='/api/integrations/omie/logs'&&req.method==='GET'){
        json(res,200,{ok:true,logs:await omie.repo.logs(url.searchParams.get('limit')||100)});return true;
      }
      if(url.pathname==='/api/integrations/omie/options'&&req.method==='GET'){
        json(res,200,{ok:true,...await omie.sync.options()});return true;
      }
      const orderMatch=url.pathname.match(/^\/api\/integrations\/omie\/order\/([^/]+)$/);
      const orderSyncMatch=url.pathname.match(/^\/api\/integrations\/omie\/order\/([^/]+)\/sync$/);
      const orderBillingMatch=url.pathname.match(/^\/api\/integrations\/omie\/order\/([^/]+)\/billing$/);
      if(orderMatch&&req.method==='GET'){
        const localId=decodeURIComponent(orderMatch[1]);const result=await omie.sync.orderStatus(localId);
        if(!result){json(res,404,{ok:false,error:'OS não encontrada.'});return true;}
        json(res,200,{ok:true,...result});return true;
      }
      if(orderSyncMatch&&req.method==='POST'){
        const localId=decodeURIComponent(orderSyncMatch[1]);json(res,200,{ok:true,mapping:await omie.sync.syncOrder(localId),status:await omie.sync.orderStatus(localId)});return true;
      }
      if(orderBillingMatch&&req.method==='POST'){
        const localId=decodeURIComponent(orderBillingMatch[1]);json(res,200,{ok:true,mapping:await omie.sync.refreshOrderBilling(localId),status:await omie.sync.orderStatus(localId)});return true;
      }
    }catch(error){
      console.error(`Omie API ${req.method} ${url.pathname}`,error?.message||error);
      const status=Number(error?.statusCode)||500;
      const safe=status>=500&&status!==503&&status!==504?'Falha na comunicação com o Omie.':String(error?.message||'Falha na integração Omie.').slice(0,500);
      json(res,status,{ok:false,error:safe,code:error?.omieCode||undefined});return true;
    }
  }
  if(url.pathname==='/api/admin/purge'&&req.method==='POST'){
    const session=requireAuth(req,res);if(!session)return true;
    let client=null;
    try{
      const body=await readJson(req,64*1024);
      if(String(body.confirm||'')!=='LIMPAR AR7'){json(res,400,{ok:false,error:'Confirmação inválida.'});return true;}
      await ensureSchema();
      client=await pool.connect();await client.query('BEGIN');
      const currentState=await client.query(`SELECT data FROM ar7_app_state WHERE state_key='main' FOR UPDATE`);
      const clean=emptyStateV206(currentState.rows[0]?.data||{});
      const epoch=crypto.randomUUID();
      const mediaCount=await client.query(`SELECT count(*)::int AS total FROM ar7_media`);
      const stateResult=await client.query(`INSERT INTO ar7_app_state(state_key,data,revision,updated_at)
        VALUES('main',$1::jsonb,1,now())
        ON CONFLICT (state_key) DO UPDATE SET data=EXCLUDED.data, revision=ar7_app_state.revision+1, updated_at=now()
        RETURNING revision,updated_at`,[JSON.stringify(clean)]);
      await client.query(`DELETE FROM ar7_media`);
      await client.query(`DELETE FROM ar7_audit_log`);
      await client.query(`DELETE FROM ar7_integration_webhook_events WHERE organization_id=$1 AND provider='omie'`,[omie?.cfg?.organizationId||'ar7-main']);
      await client.query(`DELETE FROM ar7_integration_logs WHERE organization_id=$1 AND provider='omie'`,[omie?.cfg?.organizationId||'ar7-main']);
      await client.query(`DELETE FROM ar7_integration_mappings WHERE organization_id=$1 AND provider='omie'`,[omie?.cfg?.organizationId||'ar7-main']);
      await client.query(`UPDATE ar7_system_meta SET meta_value=$1,updated_at=now() WHERE meta_key='data_epoch'`,[epoch]);
      await client.query(`INSERT INTO ar7_audit_log(actor,action,revision) VALUES($1,$2,$3)`,[session.u,'data-purge',Number(stateResult.rows[0].revision)]);
      await client.query('COMMIT');
      json(res,200,{ok:true,purged:true,data:clean,revision:Number(stateResult.rows[0].revision),updatedAt:stateResult.rows[0].updated_at,dataEpoch:epoch,mediaDeleted:Number(mediaCount.rows[0]?.total||0)});
    }catch(error){if(client){try{await client.query('ROLLBACK');}catch{}}console.error('POST /api/admin/purge',error);json(res,error.statusCode||503,{ok:false,error:'Não foi possível concluir a limpeza definitiva.'});}
    finally{client?.release?.();}
    return true;
  }
  if(url.pathname==='/api/state'&&req.method==='GET'){
    const session=requireAuth(req,res);if(!session)return true;
    try{
      await ensureSchema();
      await pool.query(`INSERT INTO ar7_app_state(state_key,data,revision,updated_at) VALUES('main',$1::jsonb,1,now()) ON CONFLICT (state_key) DO NOTHING`,[JSON.stringify(emptyStateV206())]);
      const [result,epoch]=await Promise.all([
        pool.query(`SELECT data, revision, updated_at FROM ar7_app_state WHERE state_key='main'`),
        getDataEpoch()
      ]);
      const row=result.rows[0];
      json(res,200,{ok:true,data:row.data,revision:Number(row.revision),updatedAt:row.updated_at,dataEpoch:epoch,remoteOnly:true});
    }catch(error){console.error('GET /api/state',error);json(res,503,{ok:false,error:'Banco de dados indisponível.'});}
    return true;
  }
  if(url.pathname==='/api/state'&&req.method==='PUT'){
    const session=requireAuth(req,res);if(!session)return true;
    let client=null;
    try{
      const body=await readJson(req);
      if(!releaseAtLeast(body.clientVersion,MIN_WRITE_RELEASE)){
        json(res,426,{ok:false,updateRequired:true,minVersion:MIN_WRITE_RELEASE,error:'Este dispositivo está com uma versão antiga. Recarregue o AR7 antes de salvar.'});return true;
      }
      if(!body||typeof body.data!=='object'||Array.isArray(body.data)){json(res,400,{ok:false,error:'Estado inválido.'});return true;}
      const expectedRevision=Number(body.expectedRevision);
      if(!Number.isInteger(expectedRevision)||expectedRevision<0){json(res,400,{ok:false,error:'Revisão de sincronização inválida.'});return true;}
      await ensureSchema();
      client=await pool.connect();
      await client.query('BEGIN');
      const currentEpoch=await getDataEpoch(client);
      if(!body.expectedEpoch||String(body.expectedEpoch)!==currentEpoch){
        await client.query('ROLLBACK');
        json(res,409,{ok:false,resetRequired:true,dataEpoch:currentEpoch,error:'Os dados centrais foram reinicializados. Recarregue o sistema; dados antigos deste dispositivo não serão reenviados.'});return true;
      }
      const current=await client.query(`SELECT revision,data FROM ar7_app_state WHERE state_key='main' FOR UPDATE`);
      const previousData=current.rows[0]?.data||emptyStateV206();
      let row;
      if(!current.rows.length){
        if(expectedRevision!==0){
          await client.query('ROLLBACK');
          json(res,409,{ok:false,conflict:true,currentRevision:0,dataEpoch:currentEpoch,error:'O banco central foi reinicializado. Recarregue os dados antes de salvar.'});return true;
        }
        const inserted=await client.query(`INSERT INTO ar7_app_state(state_key,data,revision,updated_at) VALUES('main',$1::jsonb,1,now()) RETURNING revision,updated_at`,[JSON.stringify(body.data)]);
        row=inserted.rows[0];
      }else{
        const currentRevision=Number(current.rows[0].revision);
        if(currentRevision!==expectedRevision){
          await client.query('ROLLBACK');
          json(res,409,{ok:false,conflict:true,currentRevision,dataEpoch:currentEpoch,error:'Outro dispositivo salvou alterações antes deste. Recarregue o banco central antes de continuar.'});return true;
        }
        const updated=await client.query(`UPDATE ar7_app_state SET data=$1::jsonb, revision=revision+1, updated_at=now() WHERE state_key='main' RETURNING revision,updated_at`,[JSON.stringify(body.data)]);
        row=updated.rows[0];
      }
      await purgeUnreferencedMedia(client,body.data);
      await client.query(`INSERT INTO ar7_audit_log(actor,action,revision) VALUES($1,$2,$3)`,[session.u,'state-save',Number(row.revision)]);
      await client.query('COMMIT');
      if(omie)setImmediate(()=>omie.sync.onStateSaved(previousData,body.data).catch(error=>console.error('Omie post-save hook',error?.message||error)));
      json(res,200,{ok:true,revision:Number(row.revision),updatedAt:row.updated_at,dataEpoch:currentEpoch});
    }catch(error){
      if(client){try{await client.query('ROLLBACK');}catch{}}
      console.error('PUT /api/state',error);json(res,error.statusCode||503,{ok:false,error:error.statusCode===413?'Dados excederam o limite de sincronização.':'Não foi possível salvar no banco central.'});
    }finally{client?.release?.();}
    return true;
  }
  if(url.pathname==='/api/sync-status'&&req.method==='GET'){
    const session=requireAuth(req,res);if(!session)return true;
    try{await ensureSchema();const [result,epoch]=await Promise.all([pool.query(`SELECT revision,updated_at FROM ar7_app_state WHERE state_key='main'`),getDataEpoch()]);json(res,200,{ok:true,database:true,state:result.rows[0]||null,dataEpoch:epoch,remoteOnly:true});}
    catch(error){json(res,503,{ok:false,database:false,error:error.message});}
    return true;
  }
  return false;
}

async function requestHandler(req,res){
  const url=new URL(req.url||'/',`http://${req.headers.host||'localhost'}`);
  if(url.pathname==='/health'){
    let database=false;
    if(pool){try{await ensureSchema();await pool.query('SELECT 1');database=true;}catch(error){console.error('Health database check',error.message);}}
    json(res,database||!isHosted?200:503,{ok:true,app:'AR7 Gestão da Oficina',version:APP_RELEASE,databaseConfigured:Boolean(pool),databaseConnected:database,timestamp:new Date().toISOString()});return;
  }
  if(url.pathname.startsWith('/api/')){
    try{if(await handleApi(req,res,url))return;}catch(error){console.error('API error',error);json(res,error.statusCode||500,{ok:false,error:'Erro interno da API.'});return;}
    json(res,404,{ok:false,error:'Endpoint não encontrado.'});return;
  }

  const filePath=safeFilePath(url.pathname);
  if(!filePath){res.writeHead(400,{'Content-Type':'text/plain; charset=utf-8'});res.end('Requisição inválida.');return;}
  fs.stat(filePath,(statError,stats)=>{
    let target=filePath;if(!statError&&stats.isDirectory())target=path.join(filePath,'index.html');
    fs.readFile(target,(error,data)=>{
      if(error){
        if(error.code==='ENOENT'&&!path.extname(target)){
          fs.readFile(path.join(root,'index.html'),(fallbackError,fallbackData)=>{if(fallbackError){res.writeHead(404);res.end('Arquivo não encontrado.');return;}res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(fallbackData);});return;
        }
        res.writeHead(error.code==='ENOENT'?404:500,{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'});res.end(error.code==='ENOENT'?'Arquivo não encontrado.':'Erro interno do servidor.');return;
      }
      const extension=path.extname(target).toLowerCase(),immutable=/\.(png|jpg|jpeg|gif|webp|svg|ico)$/i.test(extension);
      res.writeHead(200,{'Content-Type':mimeTypes[extension]||'application/octet-stream','Cache-Control':immutable?'public, max-age=86400':'no-store, no-cache, must-revalidate, max-age=0','X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'same-origin','Permissions-Policy':'camera=(self), microphone=(), geolocation=()'});res.end(data);
    });
  });
}

function listenOn(candidate){
  port=candidate;
  const candidateServer=http.createServer((req,res)=>{requestHandler(req,res).catch(error=>{console.error(error);if(!res.headersSent)json(res,500,{ok:false,error:'Erro interno do servidor.'});else res.end();});});
  candidateServer.once('error',error=>{
    if(error?.code==='EADDRINUSE'&&autoPort&&candidate<maxLocalPort){
      console.log(`Porta ${candidate} ocupada. Tentando automaticamente a porta ${candidate+1}...`);
      try{candidateServer.close();}catch{}
      setTimeout(()=>listenOn(candidate+1),60);return;
    }
    console.error(`Falha ao iniciar o servidor na porta ${candidate}.`);console.error(error?.message||String(error));process.exitCode=10;
  });
  candidateServer.listen(candidate,host,()=>{
    server=candidateServer;
    const url=`http://localhost:${candidate}/#dashboard`;
    console.log('==============================================================');
    console.log(' AR7 Gestao da Oficina V20.2.8 - Banco central + Integracao Omie');
    console.log(` Servidor: ${host}:${candidate}`);
    console.log(` Acesso local: ${url}`);
    console.log(` Banco central: ${DATABASE_URL?'configurado':'NAO configurado'}`);
    if(isHosted)console.log(' Ambiente hospedado detectado.');else console.log(' Nao feche esta janela enquanto estiver usando o sistema.');
    console.log('==============================================================');
    if(pool)ensureSchema().then(()=>console.log(' PostgreSQL conectado e schema pronto.')).catch(error=>console.error(' PostgreSQL indisponível:',error.message));
    setTimeout(()=>openBrowser(url),400);
  });
}

listenOn(port);

async function shutdown(){
  try{await pool?.end();}catch{}
  if(server){try{server.close(()=>process.exit(0));}catch{process.exit(0);}}else process.exit(0);
  setTimeout(()=>process.exit(0),1000).unref();
}
process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown);
