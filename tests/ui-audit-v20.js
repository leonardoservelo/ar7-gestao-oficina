'use strict';
const fs=require('fs');
const vm=require('vm');
const path=require('path');
const root=path.resolve(__dirname,'..');
const storage=new Map([['ar7-v19-os-reset-20260807','1']]);
global.localStorage={getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
global.location={hash:'#dashboard'};
global.window=global;
Object.defineProperty(global,'navigator',{value:{},configurable:true,writable:true});
global.CSS={escape:s=>String(s).replace(/[^a-zA-Z0-9_-]/g,'\\$&')};
global.HTMLTextAreaElement=class {};
global.requestAnimationFrame=()=>{};global.cancelAnimationFrame=()=>{};global.addEventListener=()=>{};global.removeEventListener=()=>{};global.visualViewport=null;
global.BroadcastChannel=class {addEventListener(){} postMessage(){} close(){}};
const noop=()=>{};const classList=()=>({add:noop,remove:noop,toggle:noop,contains:()=>false});
const appEl={innerHTML:''};const toastEl={children:[],firstElementChild:null};
global.document={
  getElementById(id){if(id==='app')return appEl;if(id==='toast-region')return toastEl;return null;},
  addEventListener:noop,querySelectorAll:()=>[],querySelector:()=>null,
  documentElement:{style:{setProperty:noop},dataset:{}},body:{classList:classList(),appendChild:noop},scrollingElement:{scrollBy:noop},
  createElement(tag){return {tagName:String(tag).toUpperCase(),className:'',id:'',innerHTML:'',classList:classList(),style:{},dataset:{},appendChild:noop,remove:noop,querySelector:()=>null,querySelectorAll:()=>[]};}
};
let src=fs.readFileSync(path.join(root,'app.js'),'utf8');
src=src.replace(/\n  render\(\);\n  initRemoteSyncV20\(\);\n\}\)\(\);\s*$/,
`\n  globalThis.__ar7Audit={render,getDb:()=>db,STAGES};\n  render();\n})();`);
vm.runInThisContext(src,{filename:'app.js'});
function renderHash(hash){location.hash=hash;appEl.innerHTML='';__ar7Audit.render({resetScroll:true});return appEl.innerHTML;}
function countAttr(html,tag,attr){const re=new RegExp(`<${tag}\\b[^>]*\\b${attr}\\s*=`, 'gi');return (html.match(re)||[]).length;}
function tags(html,tag){return html.match(new RegExp(`<${tag}\\b[^>]*>`, 'gi'))||[];}
function attr(tag,name){const m=tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`,'i'));return m?(m[1]??m[2]??m[3]??''):'';}
function audit(name,html){
  const errors=[];
  if(html.length<500)errors.push('HTML muito curto');
  if(html.includes('Não foi possível abrir esta tela'))errors.push('tela fatal');
  const idMatches=[...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);
  const seen=new Set();for(const id of idMatches){if(seen.has(id))errors.push(`id duplicado: ${id}`);seen.add(id);}
  for(const b of tags(html,'button'))if(!/\btype\s*=/.test(b))errors.push(`button sem type: ${b.slice(0,100)}`);
  for(const i of tags(html,'img'))if(!/\balt\s*=/.test(i))errors.push(`img sem alt: ${i.slice(0,100)}`);
  for(const a of tags(html,'a'))if(!/\bhref\s*=/.test(a))errors.push(`link sem href: ${a.slice(0,100)}`);
  if(/\bonclick\s*=|href\s*=\s*["']javascript:/i.test(html))errors.push('script inline em elemento interativo');
  for(const tagName of ['input','select','textarea']){
    for(const control of tags(html,tagName)){
      if(/\btype\s*=\s*["']hidden["']/i.test(control)||/\shidden(?:\s|>|=)/i.test(control))continue;
      const id=attr(control,'id');if(!id)continue;
      const labelled=new RegExp(`<label\\b[^>]*\\bfor=["']${id.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}["']`,'i').test(html)||/\baria-label\s*=|\baria-labelledby\s*=|\btitle\s*=/.test(control);
      if(!labelled)errors.push(`${tagName} sem rótulo: #${id}`);
    }
  }
  if(errors.length){console.error(`FAIL - ${name}`);errors.forEach(e=>console.error('  -',e));return false;}
  console.log(`PASS - ${name}`);return true;
}
const db=__ar7Audit.getDb();
const routes=['#dashboard','#orders','#orders/open',...__ar7Audit.STAGES.map(stage=>`#orders/${stage.id}`),'#clients','#equipment','#parts','#budgets','#workshop','#trash-orders','#settings'];
if(db.clients[0])routes.push(`#client/${db.clients[0].id}`,`#portal/${db.clients[0].id}`,`#portal-equipment/${db.clients[0].id}`,`#portal-orders/${db.clients[0].id}`,`#portal-reports/${db.clients[0].id}`,`#portal-proposals/${db.clients[0].id}`,`#portal-approvals/${db.clients[0].id}`,`#portal-history/${db.clients[0].id}`,`#portal-photos/${db.clients[0].id}`);
for(const order of db.orders){routes.push(`#order/${order.id}`);if(order.budget)routes.push(`#proposal/${order.id}`);if(order.report?.sent)routes.push(`#portal-report/${order.id}`);}
let passed=0,total=0;
for(const route of routes){total++;if(audit(route,renderHash(route)))passed++;}
const sample=db.orders[0];if(sample){const original=sample.stage;for(const stage of __ar7Audit.STAGES){sample.stage=stage.id;const html=renderHash(`#order/${sample.id}`);total++;let ok=audit(`workflow:${stage.id}`,html);if(stage.id==='concluida'&&html.includes('data-action="save-stage"')){console.error('FAIL - concluída ainda mostra Salvar etapa');ok=false;}if(ok)passed++;}sample.stage=original;}
console.log(`\n${passed}/${total} telas/estados aprovados no UI audit.`);
if(passed!==total)process.exit(1);
