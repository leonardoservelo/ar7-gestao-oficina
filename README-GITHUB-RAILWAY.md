# AR7 Gestão da Oficina V19 — GitHub + Railway

## Estrutura pronta para deploy

O projeto não precisa de build nem dependências externas. O servidor HTTP é o próprio `server.js`.

Arquivos de deploy incluídos:

- `package.json` — scripts `start`, `dev`, `check` e `test`;
- `railway.toml` — Nixpacks, start command e healthcheck;
- `Procfile` — fallback `web: npm start`;
- `.gitignore`;
- `.github/workflows/ci.yml` — validação automática no GitHub;
- `/health` — endpoint para o Railway verificar se a aplicação subiu.

## Subir no GitHub

Na pasta do projeto:

```bash
git init
git add .
git commit -m "AR7 Gestao da Oficina V19"
git branch -M main
git remote add origin SEU_REPOSITORIO_GITHUB
git push -u origin main
```

## Conectar o mesmo repositório ao Railway

1. Crie um novo projeto no Railway.
2. Escolha **Deploy from GitHub repo**.
3. Selecione o repositório da AR7.
4. O Railway detectará `package.json` e `railway.toml`.
5. O start command será `npm start`.
6. O Railway fornece a variável `PORT`; `server.js` usa essa porta automaticamente.
7. O healthcheck é `/health`.

Não é necessário configurar uma porta fixa no Railway.

## Atenção sobre os dados nesta versão

A V19 ainda é um MVP com persistência em `localStorage` do navegador. Portanto, o Railway hospeda a aplicação, mas **os dados ainda ficam no dispositivo/navegador de cada usuário**. Isso não é um banco central multiusuário.

Para uso simultâneo real entre AR7, oficina, compras e clientes, a próxima arquitetura precisa mover clientes, equipamentos, OS, propostas, fotos e aprovações para um backend com banco PostgreSQL e autenticação.

## Desenvolvimento local

```bash
npm run dev
```

O servidor começa em 8108 e, se a porta estiver ocupada, escolhe automaticamente outra porta local.
