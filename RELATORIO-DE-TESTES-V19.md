# Relatório de testes — AR7 Gestão da Oficina V19

Data: 07/08/2026

## Resultado automatizado

`npm test` executado com sucesso: **11/11 verificações aprovadas**.

1. App identificado como V19;
2. reset controlado de OS presente, preservando as demais estruturas do banco local;
3. dashboard executivo e novos gráficos presentes;
4. breakpoints específicos para tablet e smartphone;
5. servidor preparado para a variável `PORT` do Railway e endpoint `/health`;
6. `npm start` configurado;
7. `railway.toml` presente;
8. workflow de CI do GitHub presente;
9. servidor local iniciado e `/health` respondeu HTTP 200;
10. fallback automático de porta validado com a porta inicial ocupada;
11. modo Railway validado usando `PORT` dinâmica e healthcheck da versão 19.

Também foi executado `npm run check`, validando a sintaxe de `app.js` e `server.js` sem erros.

## Revisão estrutural de responsividade

A V19 recebeu regras específicas para:

- desktop amplo;
- notebook;
- tablet até 980 px;
- smartphone até 720 px;
- telas compactas até 440 px;
- dispositivos touch via `pointer: coarse`;
- safe areas de aparelhos móveis;
- fila operacional com scroll horizontal e snap em tablet/celular;
- botões e campos com área mínima de toque;
- tabelas com scroll por toque;
- propostas, portal, modais e fotos adaptados para coluna única em smartphone.

## Limitação do ambiente de teste visual

A navegação automatizada para endereços locais e `file://` foi bloqueada administrativamente pelo navegador disponível neste ambiente. Por isso, não foi possível produzir uma captura automatizada confiável da V19 aqui. Não foi marcado teste visual automático como aprovado sem execução real.
