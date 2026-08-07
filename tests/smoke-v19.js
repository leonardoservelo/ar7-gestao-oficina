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
function freePort(){return new Promise((resolve,reject)=>{const s=net.createServer();s.once('error',reject);s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p));});});}
function probe(port,pathName='/health'){return new Promise(resolve=>{const req=http.get({hostname:'127.0.0.1',port,path:pathName,timeout:800},res=>{let body='';res.on('data',c=>body+=c);res.on('end',()=>resolve({ok:res.statusCode===200,status:res.statusCode,body}));});req.on('error',()=>resolve({ok:false}));req.on('timeout',()=>{req.destroy();resolve({ok:false});});});}
async function waitProbe(port,tries=20){for(let i=0;i<tries;i++){const r=await probe(port);if(r.ok)return r;await sleep(80);}return {ok:false};}
function stop(child){if(!child||child.killed)return;child.kill('SIGTERM');setTimeout(()=>{try{child.kill('SIGKILL');}catch{}},500).unref();}

(async()=>{
  const app=read('app.js'),css=read('styles.css'),server=read('server.js'),pkg=JSON.parse(read('package.json'));
  check('app.js preparado para V19',app.includes('AR7 V19')&&app.includes("const APP_VERSION = 19"));
  check('reset controlado somente das OS existe',app.includes('OS_RESET_FLAG_V19')&&app.includes('db.orders=[]')&&app.includes('db.deletedOrders=[]'));
  check('dashboard executivo e gráficos V19 existem',app.includes('executive-kpis-v19')&&app.includes('monthlyBarsV19')&&app.includes('portfolioDonutV19')&&app.includes('deadlineHealthV19'));
  check('responsividade tablet e smartphone declarada',css.includes('@media(max-width:980px)')&&css.includes('@media(max-width:720px)')&&css.includes('@media(max-width:440px)'));
  check('servidor respeita PORT do Railway e possui healthcheck',server.includes('process.env.PORT')&&server.includes("'/health'"));
  check('package start correto',pkg.scripts?.start==='node server.js');
  check('railway.toml existe',fs.existsSync(path.join(root,'railway.toml')));
  check('workflow GitHub existe',fs.existsSync(path.join(root,'.github/workflows/ci.yml')));

  const base=await freePair();
  const first=spawn(process.execPath,['server.js',String(base)],{cwd:root,stdio:'ignore'});
  const firstHealth=await waitProbe(base);
  check('servidor local inicia e responde /health',firstHealth.ok);
  const fallback=spawn(process.execPath,['server.js',String(base),'--auto-port'],{cwd:root,stdio:'ignore'});
  const fallbackHealth=await waitProbe(base+1);
  check('porta local ocupada muda automaticamente para a próxima',fallbackHealth.ok);
  stop(fallback);stop(first);

  const railwayPort=await freePort();
  const railway=spawn(process.execPath,['server.js'],{cwd:root,env:{...process.env,PORT:String(railwayPort),RAILWAY_ENVIRONMENT:'test'},stdio:'ignore'});
  const railwayHealth=await waitProbe(railwayPort);
  let railwayPayload={};try{railwayPayload=JSON.parse(railwayHealth.body||'{}');}catch{}
  check('modo Railway usa PORT e retorna versão 19 no healthcheck',railwayHealth.ok&&railwayPayload.version==='19.0.0');
  stop(railway);

  await sleep(120);
  const passed=checks.filter(c=>c.ok).length;
  console.log(`\n${passed}/${checks.length} verificações aprovadas.`);
  if(passed!==checks.length)process.exitCode=1;
})().catch(error=>{console.error(error);process.exit(1);});
