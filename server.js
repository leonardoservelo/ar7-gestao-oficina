'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const root = path.resolve(__dirname);
const argPort = Number.parseInt(process.argv[2] || '', 10);
const envPort = Number.parseInt(process.env.PORT || '', 10);
let port = Number.isFinite(envPort) ? envPort : (Number.isFinite(argPort) ? argPort : 8108);
const isRailway = Number.isFinite(envPort) || Boolean(process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID);
const host = process.env.HOST || (isRailway ? '0.0.0.0' : '127.0.0.1');
const shouldOpen = process.argv.includes('--open') && !isRailway;
const autoPort = process.argv.includes('--auto-port') && !isRailway;
const maxLocalPort = 8199;
let server = null;

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

function requestHandler(req,res){
  if(req.url==='/health'||req.url?.startsWith('/health?')){
    const body=JSON.stringify({ok:true,app:'AR7 Gestão da Oficina',version:'19.0.0',timestamp:new Date().toISOString()});
    res.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(body);return;
  }
  const filePath=safeFilePath(req.url);
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
  const candidateServer=http.createServer(requestHandler);
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
    console.log(' AR7 Gestao da Oficina V19');
    console.log(` Servidor: ${host}:${candidate}`);
    console.log(` Acesso local: ${url}`);
    if(isRailway)console.log(' Ambiente Railway detectado.');else console.log(' Nao feche esta janela enquanto estiver usando o sistema.');
    console.log('==============================================================');
    setTimeout(()=>openBrowser(url),400);
  });
}

listenOn(port);

function shutdown(){if(server){try{server.close(()=>process.exit(0));}catch{process.exit(0);}}else process.exit(0);setTimeout(()=>process.exit(0),1000).unref();}
process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown);
