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
  check('app.js preparado para V20.2.1',app.includes('AR7 V20.2.1')&&app.includes('const APP_VERSION = 20.2'));
  check('sincronização remota V20 existe',app.includes('initRemoteSyncV20')&&app.includes("fetchV20('/api/state'")&&app.includes('scheduleRemoteSaveV20'));
  check('login multi-dispositivo existe',app.includes('loginOverlayV20')&&server.includes('/api/auth/login')&&server.includes('ar7_session'));
  check('API de estado central existe',server.includes("'/api/state'")&&server.includes('ar7_app_state')&&server.includes('jsonb'));
  check('PostgreSQL configurado via DATABASE_URL',server.includes('process.env.DATABASE_URL')&&pkg.dependencies?.pg);
  check('dashboard e responsividade V19 preservados',app.includes('executive-kpis-v19')&&css.includes('@media(max-width:980px)'));
  check('galeria separada da camera no tablet',app.includes('Escolher da galeria')&&app.includes('photo-upload-actions-v201')&&app.includes('wizard-photo-actions-v201'));
  check('fotos grandes sao compactadas automaticamente',app.includes('PHOTO_MAX_SOURCE_BYTES_V201=35*1024*1024')&&app.includes('PHOTO_TARGET_BYTES_V201=420*1024')&&app.includes('canvasDataUrlV201'));
  check('limite antigo de 4 MB foi removido',!app.includes('4_000_000')&&!app.includes('excede 4 MB'));
  check('sincronizacao remota nao depende do limite do localStorage',app.includes('if(remoteInitialSyncDoneV20)scheduleRemoteSaveV20()')&&app.includes('Cache local cheio; dados continuam disponíveis pelo banco central.'));
  check('etapas comerciais renomeadas e separadas',app.includes("label:'Peças do orçamento'")&&app.includes("label:'Revisão da proposta'"));
  check('primeira etapa comercial sem frete/mao de obra/desconto',app.includes('quotation-parts-only-v202')&&app.includes('Frete, mão de obra, terceiros, tributos, desconto')&&app.includes('quotationTotalsV11=function(order)')&&app.includes('return {partsCost,laborCost:0,thirdPartyCost:0,otherCost:0,totalCost:partsCost}'));
  check('valores comerciais concentrados na revisão',app.includes('commercial-values-v202')&&app.includes('budget-freight-v11')&&app.includes('budget-discount-v11')&&app.includes('budget-tax-v11'));
  check('botoes de fluxo e compra usam prontidao verde',app.includes('partAdvanceReadyV202')&&app.includes("ready?'btn-success':'btn-light readiness-pending-v202'")&&app.includes('Pronto: confirmar instalação'));
  check('fluxo guiado compacto e selecionavel',app.includes('workflow-selected-detail-v202')&&css.includes('grid-template-columns:repeat(10,minmax(82px,1fr))')&&css.includes('scroll-snap-type:x mandatory'));
  check('teclado virtual usa VisualViewport e margem dinamica',app.includes('window.visualViewport')&&app.includes('scrollContainerForV202')&&css.includes('--ar7-form-safe-bottom-v202'));
  check('relatorio separa cada conjunto de fotos em paginas proprias',app.includes('reportPhotoSectionV2021')&&app.includes('data-photo-group=')&&app.includes('esta página contém somente fotos deste conjunto')&&app.includes('reportPhotoSection=reportPhotoSectionV2021'));
  check('cada pagina fotografica aceita ate quatro fotos da mesma etapa',app.includes('index+=4')&&css.includes('.report-photo-grid-v2021.count-3')&&css.includes('.report-photo-grid-v2021.count-4'));
  check('fotos ocupam melhor o A4 em 1, 2 ou 2x2',css.includes('.report-photo-grid-v2021.count-1')&&css.includes('.report-photo-grid-v2021.count-2')&&css.includes('width:76%')&&css.includes('width:66%'));
  check('paginas tecnicas usam melhor o espaco vazio',app.includes('compactTechnicalReportV2021')&&app.includes('diagnosisSection')&&app.includes('canMergeSignatures')&&css.includes('.report-compact-page-v2021'));
  check('componentes e assinaturas podem compartilhar a pagina quando couber',app.includes('report-has-signatures-v2021')&&app.includes('(partRows+measurementRows)<=8'));
  check('badge do banco nao aparece no PDF',css.includes('.sync-badge-v20,#ar7-sync-badge-v20{display:none!important}'));
  check('assinaturas do relatorio sem contorno',css.includes('.report-signature-card-v9')&&css.includes('border:0!important')&&css.includes('.report-signature-image-v9'));
  check('package start correto',pkg.scripts?.start==='node server.js'&&pkg.version==='20.2.1');
  check('healthcheck informa banco central',server.includes('databaseConnected')&&server.includes("version:'20.2.1'"));

  const base=await freePair();
  const first=spawn(process.execPath,['server.js',String(base)],{cwd:root,stdio:'ignore'});
  const firstHealth=await waitProbe(base);
  let payload={};try{payload=JSON.parse(firstHealth.body||'{}');}catch{}
  check('servidor local V20.2.1 inicia sem DATABASE_URL',firstHealth.ok&&payload.version==='20.2.1'&&payload.databaseConfigured===false);
  const fallback=spawn(process.execPath,['server.js',String(base),'--auto-port'],{cwd:root,stdio:'ignore'});
  const fallbackHealth=await waitProbe(base+1);
  check('porta local ocupada muda automaticamente',fallbackHealth.ok);
  stop(fallback);stop(first);

  await sleep(120);
  const passed=checks.filter(c=>c.ok).length;
  console.log(`\n${passed}/${checks.length} verificações aprovadas.`);
  if(passed!==checks.length)process.exitCode=1;
})().catch(error=>{console.error(error);process.exit(1);});
