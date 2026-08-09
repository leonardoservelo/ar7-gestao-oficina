'use strict';
const fs=require('fs');
const vm=require('vm');
const path=require('path');
const root=path.resolve(__dirname,'..');
const storage=new Map([['ar7-v19-os-reset-20260807','1']]);
global.localStorage={getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
global.location={hash:'#dashboard'};global.window=global;
Object.defineProperty(global,'navigator',{value:{},configurable:true,writable:true});
global.CSS={escape:s=>String(s).replace(/[^a-zA-Z0-9_-]/g,'\\$&')};global.HTMLTextAreaElement=class{};
global.requestAnimationFrame=()=>{};global.scrollTo=()=>{};global.cancelAnimationFrame=()=>{};global.addEventListener=()=>{};global.removeEventListener=()=>{};global.visualViewport=null;
global.BroadcastChannel=class{addEventListener(){}postMessage(){}close(){}};
const noop=()=>{};const classList=()=>({add:noop,remove:noop,toggle:noop,contains:()=>false});const appEl={innerHTML:''};const toastEl={children:[],firstElementChild:null};
global.document={getElementById(id){if(id==='app')return appEl;if(id==='toast-region')return toastEl;return null;},addEventListener:noop,querySelectorAll:()=>[],querySelector:()=>null,documentElement:{style:{setProperty:noop},dataset:{}},body:{classList:classList(),appendChild:noop},scrollingElement:{scrollBy:noop},createElement(tag){return{tagName:String(tag).toUpperCase(),className:'',id:'',innerHTML:'',classList:classList(),style:{},dataset:{},appendChild:noop,remove:noop,querySelector:()=>null,querySelectorAll:()=>[]};}};
let src=fs.readFileSync(path.join(root,'app.js'),'utf8');
src=src.replace(/\n  render\(\);\n  initRemoteSyncV20\(\);\n\}\)\(\);\s*$/,`\n  globalThis.__ar7Hotfix={render,getDb:()=>db,repairTextEncodingV205};\n  render();\n})();`);
vm.runInThisContext(src,{filename:'app.js'});
let passed=0,total=0;function check(name,ok){total++;console.log(`${ok?'PASS':'FAIL'} - ${name}`);if(ok)passed++;else process.exitCode=1;}
function renderHash(hash){location.hash=hash;appEl.innerHTML='';__ar7Hotfix.render({resetScroll:true});return appEl.innerHTML;}
const db=__ar7Hotfix.getDb();
const old={clients:db.clients,equipment:db.equipment,orders:db.orders,activity:db.activity,deletedOrders:db.deletedOrders,company:db.company};
db.clients=[];db.equipment=[];db.orders=[];db.activity=[];db.deletedOrders=[];db.company={name:'AR7 ElÃ©trica',unit:'Matriz',email:''};
const routes=['#dashboard','#orders','#clients','#equipment','#parts','#budgets','#workshop','#reports','#portal','#settings','#portal-equipment/x','#portal-orders/x','#portal-reports/x','#portal-proposals/x','#portal-approvals/x','#portal-history/x','#portal-photos/x','#portal-proposal/x','#portal-report/x'];
for(const route of routes){const html=renderHash(route);check(`${route} abre com banco vazio`,html.length>500&&!html.includes('Não foi possível abrir esta tela'));}
const reports=renderHash('#reports');check('Relatórios vazio orienta sem erro',reports.includes('Nenhum relatório disponível')&&reports.includes('Voltar ao dashboard'));
const portal=renderHash('#portal');check('Portal vazio orienta cadastro sem erro',portal.includes('Nenhum cliente disponível para o portal')&&portal.includes('Cadastrar cliente')&&portal.includes('Voltar ao dashboard'));
const dashboard=renderHash('#dashboard');check('topo direito mostra apenas desenvolvedor e versão',dashboard.includes('developer-workspace-v205')&&dashboard.includes('Nexora Sistemas')&&dashboard.includes('v20.2.5')&&!/developer-workspace-v205[^>]*>[^<]*AR7 El/i.test(dashboard));
check('corrige mojibake de acentos',__ar7Hotfix.repairTextEncodingV205('AR7 ElÃ©trica')==='AR7 Elétrica'&&__ar7Hotfix.repairTextEncodingV205('RelatÃ³rio tÃ©cnico')==='Relatório técnico');
check('corrige mojibake de pontuação',__ar7Hotfix.repairTextEncodingV205('Proposta â€” revisÃ£o')==='Proposta — revisão');
const suspicious=/(?:Ã[\u0080-\u00BF]|Â[\u0080-\u00BF]|â[€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ]|ðŸ|ï»¿|�)/;
check('HTML renderizado não expõe mojibake',!suspicious.test(dashboard)&&!suspicious.test(reports)&&!suspicious.test(portal));
Object.assign(db,old);
console.log(`\n${passed}/${total} verificações V20.2.5 aprovadas.`);if(passed!==total)process.exit(1);
