'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');

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

const pool = DATABASE_URL ? new Pool({
  connectionString: DATABASE_URL,
  ssl: /\.internal(?::|\/|$)/i.test(DATABASE_URL) ? false : { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
}) : null;
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
  res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers});
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
      return true;
    })().catch(error=>{schemaReadyPromise=null;throw error;});
  }
  return schemaReadyPromise;
}

async function handleApi(req,res,url){
  if(url.pathname==='/api/auth/status'&&req.method==='GET'){
    const session=verifySession(parseCookies(req).ar7_session);
    if(!session){json(res,401,{ok:false,authenticated:false});return true;}
    json(res,200,{ok:true,authenticated:true,user:session.u});return true;
  }
  if(url.pathname==='/api/auth/login'&&req.method==='POST'){
    if(!APP_SECRET||!ADMIN_PASSWORD){json(res,503,{ok:false,error:'Login ainda não configurado no servidor.'});return true;}
    const body=await readJson(req,64*1024);
    if(!safeEquals(body.username||'',ADMIN_USER)||!safeEquals(body.password||'',ADMIN_PASSWORD)){
      json(res,401,{ok:false,error:'Usuário ou senha inválidos.'});return true;
    }
    const token=signSession(ADMIN_USER);
    const secure=isHosted?'; Secure':'';
    json(res,200,{ok:true,user:ADMIN_USER},{'Set-Cookie':`ar7_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_HOURS*3600}${secure}`});
    return true;
  }
  if(url.pathname==='/api/auth/logout'&&req.method==='POST'){
    json(res,200,{ok:true},{'Set-Cookie':`ar7_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${isHosted?'; Secure':''}`});return true;
  }
  if(url.pathname==='/api/state'&&req.method==='GET'){
    const session=requireAuth(req,res);if(!session)return true;
    try{
      await ensureSchema();
      const result=await pool.query(`SELECT data, revision, updated_at FROM ar7_app_state WHERE state_key='main'`);
      if(!result.rows.length){json(res,404,{ok:false,empty:true});return true;}
      const row=result.rows[0];
      json(res,200,{ok:true,data:row.data,revision:Number(row.revision),updatedAt:row.updated_at});
    }catch(error){console.error('GET /api/state',error);json(res,503,{ok:false,error:'Banco de dados indisponível.'});}
    return true;
  }
  if(url.pathname==='/api/state'&&req.method==='PUT'){
    const session=requireAuth(req,res);if(!session)return true;
    try{
      const body=await readJson(req);
      if(!body||typeof body.data!=='object'||Array.isArray(body.data)){json(res,400,{ok:false,error:'Estado inválido.'});return true;}
      await ensureSchema();
      const result=await pool.query(`
        INSERT INTO ar7_app_state(state_key,data,revision,updated_at)
        VALUES('main',$1::jsonb,1,now())
        ON CONFLICT(state_key) DO UPDATE
          SET data=EXCLUDED.data,
              revision=ar7_app_state.revision+1,
              updated_at=now()
        RETURNING revision,updated_at
      `,[JSON.stringify(body.data)]);
      const row=result.rows[0];
      await pool.query(`INSERT INTO ar7_audit_log(actor,action,revision) VALUES($1,$2,$3)`,[session.u,'state-save',Number(row.revision)]).catch(()=>{});
      json(res,200,{ok:true,revision:Number(row.revision),updatedAt:row.updated_at});
    }catch(error){console.error('PUT /api/state',error);json(res,error.statusCode||503,{ok:false,error:error.statusCode===413?'Dados excederam o limite de sincronização.':'Não foi possível salvar no banco central.'});}
    return true;
  }
  if(url.pathname==='/api/sync-status'&&req.method==='GET'){
    const session=requireAuth(req,res);if(!session)return true;
    try{await ensureSchema();const result=await pool.query(`SELECT revision,updated_at FROM ar7_app_state WHERE state_key='main'`);json(res,200,{ok:true,database:true,state:result.rows[0]||null});}
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
    json(res,database||!isHosted?200:503,{ok:true,app:'AR7 Gestão da Oficina',version:'20.2.1',databaseConfigured:Boolean(pool),databaseConnected:database,timestamp:new Date().toISOString()});return;
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
      res.writeHead(200,{'Content-Type':mimeTypes[extension]||'application/octet-stream','Cache-Control':immutable?'public, max-age=86400':'no-store, no-cache, must-revalidate, max-age=0','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin'});res.end(data);
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
    console.log(' AR7 Gestao da Oficina V20.2.1 - Banco Central + Relatorio Compacto');
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
