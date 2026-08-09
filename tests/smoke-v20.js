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
  const app=read('app.js'),css=read('styles.css'),server=read('server.js'),serverPy=read('server.py'),index=read('index.html'),pkg=JSON.parse(read('package.json'));
  check('app.js preparado para V20.2.5',app.includes("const APP_RELEASE = '20.2.5'")&&app.includes('const APP_VERSION = 20.2'));
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
  check('paginas tecnicas equilibram itens 3 a 7 sem comprimir conteudo',app.includes('balancedTechnicalReportV203')&&app.includes('diagnosisSection')&&app.includes('report-intervention-body-v203')&&app.includes('Serviços, testes e conclusão')&&css.includes('.report-balanced-page-v203'));
  check('componentes e assinaturas so compartilham pagina com margem segura',app.includes('report-has-signatures-v2021')&&app.includes('(partRows+measurementRows)<=5&&technicianSignatures<=2')&&app.includes('report-signature-safe-v203'));
  check('badge do banco nao aparece no PDF',css.includes('.sync-badge-v20,#ar7-sync-badge-v20{display:none!important}'));
  check('assinaturas do relatorio sem contorno e com reserva vertical',css.includes('.report-signature-card-v9')&&css.includes('border:0!important')&&css.includes('grid-template-rows:auto 64px auto auto auto')&&css.includes('min-height:136px')&&css.includes('grid-template-rows:auto 15mm auto auto auto'));
  check('proposta comercial premium V20.2.3 ativa',app.includes('proposal-document-v203')&&app.includes('Confiabilidade para o equipamento. Clareza para a sua decisão.')&&css.includes('.proposal-document-v203'));
  check('proposta comercial usa narrativa orientada a valor',app.includes('UMA PROPOSTA CONSTRUÍDA SOBRE O QUE FOI ENCONTRADO')&&app.includes('Intervenção rastreável')&&app.includes('PRÓXIMO PASSO')&&app.includes('Critério de liberação técnica')&&app.includes('AO FINAL, O CLIENTE RECEBE'));
  check('credito da desenvolvedora Nexora Sistemas esta presente',app.includes("name:'Nexora Sistemas'")&&app.includes('Tecnologia que organiza operações.')&&app.includes('developerCreditV203'));
  check('assinaturas da proposta possuem area livre e segura',css.includes('.proposal-signatures-v203>div')&&css.includes('height:42px!important')&&css.includes('height:11mm!important'));
  check('reset destrutivo automatico foi removido',app.includes('function applyOrderResetV19()')&&!app.includes('  applyOrderResetV19();'));
  check('datas usam calendario local e formatacao tolera valor invalido',app.includes('function validDate(value, dateOnly=false)')&&app.includes('d.getFullYear()')&&!app.includes("new Date().toISOString().slice(0,10)"));
  check('versao visual e cache estao consistentes',index.includes('styles.css?v=20.2.5')&&index.includes('app.js?v=20.2.5')&&index.includes('manifest.webmanifest?v=20.2.5')&&app.includes('v${APP_RELEASE}'));
  check('buscas e filtros possuem rotulos de acessibilidade',app.includes('Pesquisar ordem de serviço, cliente ou TAG')&&app.includes('Filtrar ordens por etapa')&&app.includes('Pesquisar cliente, contato ou cidade'));
  check('revisao geral de alinhamento e responsividade aplicada',css.includes('AR7 V20.2.3 — revisão geral de interface e responsividade')&&css.includes('@media(prefers-reduced-motion:reduce)')&&css.includes('.settings-danger-note-v2022'));
  check('sincronizacao evita sobrescrita silenciosa entre dispositivos',app.includes('expectedRevision:remoteRevisionV20')&&app.includes("response.status===409&&payload.conflict")&&server.includes("currentRevision!==expectedRevision")&&server.includes("json(res,409,{ok:false,conflict:true"));
  check('conflito de sincronizacao preserva backup local',app.includes('ar7-sync-conflict-backup-v2022')&&app.includes("remoteStatusV20('conflict'"));
  check('cabecalhos de seguranca basicos ativos',server.includes("'X-Frame-Options':'DENY'")&&server.includes("'Permissions-Policy':'camera=(self), microphone=(), geolocation=()'"));
  check('package start correto',pkg.scripts?.start==='node server.js'&&pkg.version==='20.2.5');
  check('healthcheck informa banco central',server.includes('databaseConnected')&&server.includes("version:'20.2.5'"));
  check('alteracoes offline sobrevivem a recarga',app.includes("REMOTE_PENDING_KEY_V2022='ar7-remote-pending-v2022'")&&app.includes("REMOTE_REVISION_KEY_V2022='ar7-remote-revision-v2022'")&&app.includes('markRemotePendingV2022')&&app.includes('clearRemotePendingV2022'));
  check('estado pendente e enviado antes do pull inicial',app.includes("const hadPending=localStorage.getItem(REMOTE_PENDING_KEY_V2022)==='1'")&&app.includes('if(initial&&remoteDirtyV20)')&&app.includes('const pushed=await pushRemoteStateV20()'));
  check('login possui limitacao de tentativas',server.includes('LOGIN_MAX_ATTEMPTS = 8')&&server.includes('LOGIN_WINDOW_MS')&&server.includes('loginBlocked(req)')&&server.includes('recordLoginFailure(req)')&&server.includes('json(res,429'));
  check('modo local nao prende usuario na tela de login',server.includes("configured:false")&&server.includes("Autenticação do servidor ainda não configurada")&&app.includes("if(response.status===503){remoteStatusV20('local'"));
  check('servidor Python de contingencia nao prende login e informa versao atual',serverPy.includes("'version':'20.2.5'")&&serverPy.includes("route == '/api/auth/status'")&&serverPy.includes('self._json(503')&&serverPy.includes('API central indisponível no servidor Python local'));
  check('importacao de backup valida tamanho e estrutura',app.includes('file.size>60*1024*1024')&&app.includes('Array.isArray(parsed.orders)')&&app.includes('Array.isArray(parsed.clients)')&&app.includes('Array.isArray(parsed.equipment)')&&app.includes('Importar este backup substituirá os dados locais atuais'));
  check('reset de demonstracao exige aviso forte',app.includes('ATENÇÃO: esta ação substitui os dados locais atuais pelos dados de demonstração'));
  check('campos criticos das etapas possuem rotulos associados',app.includes('for="stage-entry-date"')&&app.includes('for="stage-record"')&&app.includes('for="quotation-responsible-v11"')&&app.includes('for="budget-scope-v11"')&&app.includes('for="budget-recipient-v11"'));
  check('OS concluida nao oferece salvar etapa novamente',app.includes("order.stage==='concluida'?'':")&&app.includes('data-action="save-stage"'));
  check('acao de aprovacao pendente informa espera pelo cliente',app.includes("approvalGrantedV10(order)?'Aprovação registrada: liberar próxima equipe':'Aguardando aprovação do cliente'"));
  check('configuracoes se adaptam a telas estreitas',app.includes('settings-grid-v2022')&&css.includes('.settings-grid-v2022{grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr))}'));
  check('fontes de imagens dinamicas sao escapadas',app.includes('src="${safe(part.photo)}"')&&app.includes('src="${safe(normalized.src)}"'));
  check('auditorias estruturais acompanham o pacote',pkg.scripts?.['test:ui']==='node tests/ui-audit-v20.js'&&pkg.scripts?.['test:docs']==='node tests/document-audit-v203.js'&&pkg.scripts?.['test:commercial']==='node tests/commercial-audit-v204.js'&&pkg.scripts?.['test:hotfix']==='node tests/hotfix-audit-v205.js'&&pkg.scripts?.['test:all']==='npm test && npm run test:ui && npm run test:docs && npm run test:commercial && npm run test:hotfix'&&fs.existsSync(path.join(root,'tests','ui-audit-v20.js'))&&fs.existsSync(path.join(root,'tests','document-audit-v203.js'))&&fs.existsSync(path.join(root,'tests','commercial-audit-v204.js'))&&fs.existsSync(path.join(root,'tests','hotfix-audit-v205.js')));

  check('dashboard destaca proposta negada com atalho direto',app.includes('rejectedProposalQueueV204')&&app.includes('Proposta negada')&&app.includes('href="#order/${item.order.id}"'));
  check('proposta executiva V20.2.4 em duas paginas esta ativa',app.includes('proposal-document-v204')&&app.includes('Prezados,')&&app.includes('Composição e condições comerciais')&&app.includes('· 1/2')&&app.includes('· 2/2')&&css.includes('.proposal-document-v204'));

  const base=await freePair();
  const first=spawn(process.execPath,['server.js',String(base)],{cwd:root,stdio:'ignore'});
  const firstHealth=await waitProbe(base);
  let payload={};try{payload=JSON.parse(firstHealth.body||'{}');}catch{}
  check('servidor local V20.2.5 inicia sem DATABASE_URL',firstHealth.ok&&payload.version==='20.2.5'&&payload.databaseConfigured===false);
  const fallback=spawn(process.execPath,['server.js',String(base),'--auto-port'],{cwd:root,stdio:'ignore'});
  const fallbackHealth=await waitProbe(base+1);
  check('porta local ocupada muda automaticamente',fallbackHealth.ok);
  stop(fallback);stop(first);

  await sleep(120);
  const passed=checks.filter(c=>c.ok).length;
  console.log(`\n${passed}/${checks.length} verificações aprovadas.`);
  if(passed!==checks.length)process.exitCode=1;
})().catch(error=>{console.error(error);process.exit(1);});
