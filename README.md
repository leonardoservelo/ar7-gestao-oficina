# AR7 Gestão da Oficina V19

MVP web para gestão do fluxo completo da oficina: recebimento, diagnóstico, cotação, orçamento, aprovação do cliente, compras, montagem, testes, relatório técnico e conclusão.

## Destaques da V19

- Dashboard executivo redesenhado com indicadores e gráficos baseados nos dados reais da aplicação;
- visual responsivo para desktop, tablet e smartphone;
- fila operacional com navegação por toque e scroll horizontal controlado;
- reset único das Ordens de Serviço para iniciar os testes do zero, preservando empresas e equipamentos;
- Portal do Cliente com propostas comerciais, aprovação, solicitação de ajuste e negativa com motivo;
- relatório técnico separado da proposta comercial;
- inicializador local com troca automática de porta quando 8108 estiver ocupada;
- estrutura pronta para GitHub e Railway.

## Abrir no Windows

Extraia o ZIP e execute `INICIAR.bat`.

O servidor tenta a porta 8108. Se ela estiver ocupada, tenta automaticamente 8109, 8110 e assim por diante até encontrar uma porta livre.

## GitHub + Railway

Leia `README-GITHUB-RAILWAY.md`.

## Persistência dos dados

Esta versão ainda usa `localStorage` do navegador. O deploy no Railway hospeda a aplicação, mas não cria um banco de dados compartilhado. Cada navegador/dispositivo mantém seus próprios dados até a migração futura para backend + PostgreSQL.
