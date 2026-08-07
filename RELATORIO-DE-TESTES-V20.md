# AR7 Gestão da Oficina V20.1 — relatório de testes

## Validações executadas

- Sintaxe de `app.js`: aprovada.
- Sintaxe de `server.js`: aprovada.
- Sincronização remota V20 preservada.
- Login multi-dispositivo presente.
- API central `/api/state` presente.
- Schema PostgreSQL JSONB + auditoria presente.
- Configuração por `DATABASE_URL` presente.
- Dashboard/responsividade V19 preservados.
- Botões separados **Câmera** e **Galeria** no tablet/celular.
- Limite antigo de 4 MB removido.
- Compactação automática para fotos grandes presente.
- Originais de até 35 MB aceitos para processamento.
- Cache local cheio não bloqueia a tentativa de sincronização remota.
- Servidor local inicia sem banco para desenvolvimento.
- Fallback automático de porta preservado.

Resultado automatizado: **14/14 verificações aprovadas**.

## Limite do teste no ambiente de geração

A conexão com um PostgreSQL real do usuário e a câmera física do tablet não foram executadas neste ambiente. A validação final do banco ocorre no Render após provisionamento; a seleção câmera/galeria foi validada no código e no fluxo de upload.
