'use strict';
const fs=require('fs');
const path=require('path');
const net=require('net');
const http=require('http');
const {spawn}=require('child_process');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const checks=[];
function check(name,condition){checks.push({name,ok:Boolean(condition)});console.log(`${condition?'PASS':'FAIL'} - ${name}`);if(!condition)process.exitCode=1;}
function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
function canBind(port){return new Promise(resolve=>{const s=net.createServer();s.once('error',()=>resolve(false));s.listen(port,'127.0.0.1',()=>s.close(()=>resolve(true)));});}
async function freePair(){for(let p=8150;p<8198;p++){if(await canBind(p)&&await canBind(p+1))return p;}throw new Error('Sem par de portas livres para teste.');}
function probe(port,pathName='/health'){return new Promise(resolve=>{const req=http.get({hostname:'127.0.0.1',port,path:pathName,timeout:1000},res=>{let body='';res.on('data',c=>body+=c);res.on('end',()=>resolve({ok:res.statusCode===200,status:res.statusCode,body}));});req.on('error',()=>resolve({ok:false}));req.on('timeout',()=>{req.destroy();resolve({ok:false});});});}
async function waitProbe(port,tries=30){for(let i=0;i<tries;i++){const r=await probe(port);if(r.ok)return r;await sleep(80);}return {ok:false};}
function stop(child){if(!child||child.killed)return;child.kill('SIGTERM');setTimeout(()=>{try{child.kill('SIGKILL');}catch{}},500).unref();}

(async()=>{
  const app=read('app.js'),css=read('styles.css'),server=read('server.js'),pkg=JSON.parse(read('package.json'));
  check('app.js preparado para V20',app.includes('AR7 V20')&&app.includes('const APP_VERSION = 20'));
  check('sincronização remota V20 existe',app.includes('initRemoteSyncV20')&&app.includes("fetchV20('/api/state'")&&app.includes('scheduleRemoteSaveV20'));
  check('login multi-dispositivo existe',app.includes('loginOverlayV20')&&server.includes('/api/auth/login')&&server.includes('ar7_session'));
  check('API de estado central existe',server.includes("'/api/state'")&&server.includes('ar7_app_state')&&server.includes('jsonb'));
  check('PostgreSQL configurado via DATABASE_URL',server.includes('process.env.DATABASE_URL')&&pkg.dependencies?.pg);
  check('dashboard e responsividade V19 preservados',app.includes('executive-kpis-v19')&&css.includes('@media(max-width:980px)'));
  check('galeria separada da camera no tablet',app.includes('Escolher da galeria')&&app.includes('photo-upload-actions-v201')&&app.includes('wizard-photo-actions-v201'));
  check('fotos grandes sao compactadas automaticamente',app.includes('PHOTO_MAX_SOURCE_BYTES_V201=35*1024*1024')&&app.includes('PHOTO_TARGET_BYTES_V201=420*1024')&&app.includes('canvasDataUrlV201'));
  check('limite antigo de 4 MB foi removido',!app.includes('4_000_000')&&!app.includes('excede 4 MB'));
  check('sincronizacao remota nao depende do limite do localStorage',app.includes('if(remoteInitialSyncDoneV20)scheduleRemoteSaveV20()')&&app.includes('Cache local cheio; dados continuam disponíveis pelo banco central.'));
  check('package start correto',pkg.scripts?.start==='node server.js'&&pkg.version==='20.1.0');
  check('healthcheck informa banco central',server.includes('databaseConnected')&&server.includes("version:'20.1.0'"));

  const base=await freePair();
  const first=spawn(process.execPath,['server.js',String(base)],{cwd:root,stdio:'ignore'});
  const firstHealth=await waitProbe(base);
  let payload={};try{payload=JSON.parse(firstHealth.body||'{}');}catch{}
  check('servidor local V20 inicia sem DATABASE_URL',firstHealth.ok&&payload.version==='20.1.0'&&payload.databaseConfigured===false);
  const fallback=spawn(process.execPath,['server.js',String(base),'--auto-port'],{cwd:root,stdio:'ignore'});
  const fallbackHealth=await waitProbe(base+1);
  check('porta local ocupada muda automaticamente',fallbackHealth.ok);
  stop(fallback);stop(first);

  await sleep(120);
  const passed=checks.filter(c=>c.ok).length;
  console.log(`\n${passed}/${checks.length} verificações aprovadas.`);
  if(passed!==checks.length)process.exitCode=1;
})().catch(error=>{console.error(error);process.exit(1);});
