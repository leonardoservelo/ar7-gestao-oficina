'use strict';
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const app=read('app.js');
const css=read('styles.css');
const checks=[];
function check(name,condition){checks.push({name,ok:Boolean(condition)});console.log(`${condition?'PASS':'FAIL'} - ${name}`);if(!condition)process.exitCode=1;}

check('relatorio V20.2.3 usa distribuidor balanceado',app.includes('function balancedTechnicalReportV203(order)')&&app.includes('reportDocumentV5=balancedTechnicalReportV203'));
check('secao 3 sempre aproveita a pagina de identificacao',app.includes('moveSectionV203(diagnosisSection,identification,identificationNote)'));
check('itens 1 a 3 usam corpo vertical balanceado',app.includes('moveSectionV203(diagnosisSection,identification,identificationNote)')&&app.includes('report-identification-body-v203')&&css.includes('min-height:150mm!important'));
check('itens 4 a 7 usam distribuicao vertical propria',app.includes('report-intervention-body-v203')&&app.includes("interventionTitle.textContent='Serviços, testes e conclusão'")&&css.includes('justify-content:space-between'));
check('componentes nao sao comprimidos junto das assinaturas por padrao',app.includes('(partRows+measurementRows)<=5&&technicianSignatures<=2'));
check('assinaturas tecnicas reservam linhas independentes',css.includes('grid-template-rows:auto 64px auto auto auto')&&css.includes('row-gap:4px'));
check('assinatura impressa reserva area minima',css.includes('min-height:31mm!important')&&css.includes('grid-template-rows:auto 15mm auto auto auto!important'));
check('nomes e funcoes podem quebrar sem sobrepor',css.includes('overflow-wrap:anywhere')&&css.includes('word-break:break-word'));
check('proposta possui capa premium e mensagem de valor',app.includes('proposal-cover-v203')&&app.includes('Confiabilidade para o equipamento. Clareza para a sua decisão.'));
check('proposta explica diagnostico solucao compromissos e entregaveis',app.includes('Condição identificada')&&app.includes('Solução recomendada')&&app.includes('Compromissos de execução')&&app.includes('AO FINAL, O CLIENTE RECEBE')&&css.includes('.proposal-deliverables-v203'));
check('proposta deixa investimento e proximo passo claros',app.includes('INVESTIMENTO PARA EXECUÇÃO DO ESCOPO')&&app.includes('PRÓXIMO PASSO')&&app.includes('ACEITE DA PROPOSTA'));
check('proposta preserva tres paginas comerciais',app.includes('· 1/3')&&app.includes('· 2/3')&&app.includes('· 3/3'));
check('assinaturas comerciais possuem linha livre',css.includes('.proposal-signatures-v203>div')&&css.includes('height:42px!important')&&css.includes('height:11mm!important'));
check('credito Nexora Sistemas aparece sem substituir AR7',app.includes("name:'Nexora Sistemas'")&&app.includes("tagline:'Tecnologia que organiza operações.'")&&app.includes('AR7 Elétrica · Documento comercial controlado'));
check('credito de software e discreto no CSS',css.includes('.developer-credit-v203')&&css.includes('letter-spacing:.02em'));

const passed=checks.filter(c=>c.ok).length;
console.log(`\n${passed}/${checks.length} verificações documentais aprovadas.`);
if(passed!==checks.length)process.exitCode=1;
