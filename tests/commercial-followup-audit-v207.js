'use strict';
const fs=require('fs');
const vm=require('vm');
const path=require('path');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const app=read('app.js'),css=read('styles.css'),pkg=JSON.parse(read('package.json'));

const storage=new Map([['ar7-v19-os-reset-20260807','1']]);
global.localStorage={getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k),key:i=>[...storage.keys()][i]??null,get length(){return storage.size;},clear:()=>storage.clear()};
global.sessionStorage={getItem:()=>null,setItem:()=>{},removeItem:()=>{}};
global.location={hash:'#dashboard'};global.window=global;
Object.defineProperty(global,'navigator',{value:{},configurable:true,writable:true});
global.CSS={escape:s=>String(s).replace(/[^a-zA-Z0-9_-]/g,'\\$&')};global.HTMLTextAreaElement=class{};
global.requestAnimationFrame=()=>{};global.scrollTo=()=>{};global.cancelAnimationFrame=()=>{};global.addEventListener=()=>{};global.removeEventListener=()=>{};global.visualViewport=null;
global.BroadcastChannel=class{addEventListener(){}postMessage(){}close(){}};
const noop=()=>{};const classList=()=>({add:noop,remove:noop,toggle:noop,contains:()=>false});const appEl={innerHTML:''};const toastEl={children:[],firstElementChild:null};
global.document={getElementById(id){if(id==='app')return appEl;if(id==='toast-region')return toastEl;return null;},addEventListener:noop,querySelectorAll:()=>[],querySelector:()=>null,documentElement:{style:{setProperty:noop},dataset:{}},body:{classList:classList(),appendChild:noop},scrollingElement:{scrollBy:noop},createElement(tag){return{tagName:String(tag).toUpperCase(),className:'',id:'',innerHTML:'',classList:classList(),style:{},dataset:{},appendChild:noop,remove:noop,querySelector:()=>null,querySelectorAll:()=>[]};}};

let src=app;
src=src.replace(/\n  render\(\);\n  initRemoteSyncV20\(\);\n\}\)\(\);\s*$/,`\n  globalThis.__ar7V207={render,getDb:()=>db,queue:adjustmentProposalQueueV207,alert:adjustmentProposalAlertV207,latest:latestBudgetFeedbackV17,ensureBudget:ensureBudgetV11};\n  render();\n})();`);
vm.runInThisContext(src,{filename:'app.js'});

let passed=0,total=0;
function check(name,ok){total++;console.log(`${ok?'PASS':'FAIL'} - ${name}`);if(ok)passed++;else process.exitCode=1;}
check('release V20.2.7 consistente',pkg.version==='20.2.7'&&app.includes("const APP_RELEASE = '20.2.7'"));
check('fila de revisao usa feedback mais recente',app.includes('function adjustmentProposalQueueV207()')&&app.includes("item.feedback?.type!=='adjustment'"));
check('pedido permanece ate reenvio posterior',app.includes('sentAt<=requestedAt')&&app.includes('!sentAt'));
check('dashboard possui alerta especifico de revisao',app.includes('REVISÃO SOLICITADA')&&app.includes('pedido de revisão')&&css.includes('.adjustment-proposal-alert-v207'));
check('atalho leva direto para a OS',app.includes('Revisar orçamento')&&app.includes('href="#order/${item.order.id}"'));
check('alerta mostra motivo proposta e horario',app.includes("item.feedback?.reason||'O cliente solicitou revisão da proposta.'")&&app.includes("item.feedback?.proposalCode||'Proposta anterior'")&&app.includes('formatDateTime(item.feedback?.at)'));
check('negativa existente continua separada',app.includes('function rejectedProposalQueueV204()')&&app.includes('Proposta negada'));

const db=__ar7V207.getDb();
const old={clients:db.clients,equipment:db.equipment,orders:db.orders,activity:db.activity,deletedOrders:db.deletedOrders};
db.clients=[{id:'c207',name:'Cliente Teste',contact:'Compras'}];
db.equipment=[{id:'e207',clientId:'c207',tag:'MTR-207',type:'Motor',manufacturer:'WEG'}];
const makeOrder=(type,feedbackAt,sentAt='')=>({id:'o207'+type,number:type==='adjustment'?'2071':'2072',clientId:'c207',equipmentId:'e207',stage:'orcamento',entryDate:'2026-08-10',dueDate:'2026-08-20',defect:'Teste',records:{},parts:[],measurements:[],photos:{before:[],during:[],assembly:[],after:[]},report:{sent:false},approval:{},budget:{revision:2,status:'adjustment',sentAt,proposalCode:'PROP-207-R02'},clientBudgetFeedbackV17:[{id:'fb1',type,reason:type==='adjustment'?'Revisar prazo e condição de pagamento':'Valor não aprovado',at:feedbackAt,by:'Compras',proposalCode:'PROP-207-R01',revision:1}]});
const t='2026-08-10T12:00:00.000Z';
db.orders=[makeOrder('adjustment',t,''),makeOrder('rejected',t,'')];
let queue=__ar7V207.queue();
check('pedido de revisao pendente entra na fila',queue.length===1&&queue[0].feedback.type==='adjustment');
let html=__ar7V207.alert(queue);
check('cartao de revisao traz OS e motivo',html.includes('OS #2071')&&html.includes('Revisar prazo e condição de pagamento')&&html.includes('#order/o207adjustment'));
location.hash='#dashboard';appEl.innerHTML='';__ar7V207.render({resetScroll:true});
check('dashboard renderizado mostra negativa e revisao simultaneamente',appEl.innerHTML.includes('Proposta negada')&&appEl.innerHTML.includes('Revisão solicitada'));
// Reenvio posterior deve resolver a pendencia de ajuste
const later='2026-08-10T13:00:00.000Z';
db.orders[0].budget.sentAt=later;
queue=__ar7V207.queue();
check('reenvio posterior remove pedido de revisao do dashboard',queue.length===0);
// Feedback mais recente rejeitado não deve aparecer como ajuste
db.orders[0].budget.sentAt='';
db.orders[0].clientBudgetFeedbackV17.push({id:'fb2',type:'rejected',reason:'Depois foi negada',at:'2026-08-10T14:00:00.000Z',by:'Compras',proposalCode:'PROP-207-R02',revision:2});
check('somente o feedback mais recente define a pendencia',__ar7V207.queue().length===0);
Object.assign(db,old);
console.log(`\n${passed}/${total} verificações V20.2.7 de retornos comerciais aprovadas.`);
if(passed!==total)process.exit(1);
