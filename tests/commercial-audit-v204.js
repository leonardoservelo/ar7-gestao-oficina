
'use strict';
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const app=read('app.js'),css=read('styles.css'),index=read('index.html'),pkg=JSON.parse(read('package.json'));
const checks=[];
function check(name,ok){checks.push({name,ok:Boolean(ok)});console.log(`${ok?'PASS':'FAIL'} - ${name}`);if(!ok)process.exitCode=1;}
check('release V20.2.4 consistente',app.includes("const APP_RELEASE = '20.2.8'")&&pkg.version==='20.2.8'&&index.includes('app.js?v=20.2.8')&&index.includes('styles.css?v=20.2.8'));
check('negativa e detectada pelo feedback mais recente',app.includes("item.feedback?.type!=='rejected'")&&app.includes('latestBudgetFeedbackV17(order)'));
check('alerta permanece ate haver reenvio posterior a negativa',app.includes('sentAt<=rejectedAt')&&app.includes('!sentAt'));
check('dashboard mostra alerta comercial destacado',app.includes('rejected-proposal-alert-v204')&&app.includes('ATENÇÃO COMERCIAL')&&css.includes('.rejected-proposal-alert-v204'));
check('cada negativa leva direto para a OS que exige correcao',app.includes('href="#order/${item.order.id}"')&&app.includes('Abrir orçamento'));
check('alerta exibe motivo proposta e horario da negativa',app.includes('item.feedback?.reason')&&app.includes('item.feedback?.proposalCode')&&app.includes('formatDateTime(item.feedback?.at)'));
check('proposta ativa usa estrutura executiva V20.2.4',app.includes('proposalDocumentBeforeV204')&&app.includes('proposal-document-v204'));
check('proposta foi reduzida para duas paginas',app.includes('· 1/2')&&app.includes('· 2/2')&&!app.slice(app.indexOf('AR7 V20.2.4 — alerta comercial + proposta executiva')).includes('· 3/3'));
check('linguagem comercial e natural e ligada a OS',app.includes('Em atenção à OS')&&app.includes('O que encontramos')&&app.includes('O que será executado'));
check('primeira pagina resume investimento prazo pagamento e validade',app.includes('proposal-summary-v204')&&app.includes('INVESTIMENTO')&&app.includes('PRAZO ESTIMADO')&&app.includes('PAGAMENTO')&&app.includes('VALIDADE'));
check('segunda pagina concentra materiais e composicao comercial',app.includes('Materiais e componentes previstos')&&app.includes('proposal-investment-v204')&&app.includes('Premissas desta proposta'));
check('aceite possui espacos independentes para nome data assinatura',app.includes('proposal-signatures-v204')&&css.includes('height:58px')&&css.includes('height:13mm'));
check('credito Nexora continua discreto e AR7 segue protagonista',app.includes("name:'Nexora Sistemas'")&&app.includes("developerCreditV203('Sistema de gestão e documentos')")&&app.includes('AR7 Elétrica · Documento comercial controlado'));
check('visual mobile do alerta e proposta esta previsto',css.includes('@media(max-width:640px)')&&css.includes('@media(max-width:760px)'));
check('impressao A4 possui regras especificas V20.2.4',css.includes('@media print')&&css.includes('.proposal-document-v204 .proposal-page-v204'));
const passed=checks.filter(x=>x.ok).length;
console.log(`\n${passed}/${checks.length} verificações comerciais V20.2.4 aprovadas.`);
if(passed!==checks.length)process.exitCode=1;
