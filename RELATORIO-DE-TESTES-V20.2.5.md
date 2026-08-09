# Relatório de Testes — AR7 Gestão da Oficina V20.2.5

## Escopo
Hotfix de estados vazios, navegação segura, identidade do topo e prevenção de mojibake.

## Critérios
- Relatórios não pode quebrar com banco vazio.
- Portal do Cliente não pode quebrar sem clientes.
- Topo direito deve exibir somente Nexora Sistemas e a versão.
- Textos persistidos com mojibake comum devem ser corrigidos na apresentação e normalização.
- Todas as rotas principais devem abrir com banco vazio sem tela fatal.

## Execução
Use `npm run test:all`.
