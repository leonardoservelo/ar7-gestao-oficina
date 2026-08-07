# AR7 Gestão da Oficina V20.1.1

Versão multi-dispositivo com banco central PostgreSQL.

## O que mudou

- Dados centrais compartilhados entre PC, tablet e celular.
- Login do servidor por cookie HttpOnly.
- Sincronização automática a cada 5 segundos e após cada salvamento.
- Cache local mantido para tolerar quedas temporárias de conexão.
- API `/api/state` protegida por autenticação.
- PostgreSQL configurado por `DATABASE_URL`.
- Healthcheck informa se o banco está conectado.

## Variáveis obrigatórias no servidor

- `DATABASE_URL`
- `APP_SECRET`
- `AR7_ADMIN_USER`
- `AR7_ADMIN_PASSWORD`

## Observação sobre a arquitetura V20

A V20 usa um registro JSONB central para preservar toda a estrutura atual da aplicação sem reescrever o fluxo da oficina. É uma migração segura para sincronização multi-dispositivo. Em uma etapa futura, módulos com alta concorrência e fotos podem ser normalizados em tabelas próprias e storage de arquivos.

## Desenvolvimento local

Sem `DATABASE_URL`, o servidor continua abrindo em modo local para manutenção do código. Em produção, configure as variáveis acima.


## Fotos no tablet/celular — V20.1

- Botões separados **Câmera** e **Galeria** nas evidências técnicas.
- A galeria não usa `capture`, evitando que tablets forcem a abertura da câmera.
- Fotos de câmera acima de 4 MB são aceitas e compactadas automaticamente.
- Originais de até 35 MB são processados; a cópia salva é redimensionada para até 1600 px e alvo aproximado de 420 KB.
- Mesmo se o cache `localStorage` do aparelho lotar, a V20.1 continua tentando gravar no banco central autenticado.
