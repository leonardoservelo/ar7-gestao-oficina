# AR7 Gestão da Oficina — V20.2.6

## Objetivo

A V20.2.6 transforma a produção hospedada em modo **banco central sem persistência do banco operacional no dispositivo** e adiciona uma rotina segura de limpeza definitiva dos dados ativos da aplicação.

## Alterações principais

- Removidos os dados de demonstração da base inicial do aplicativo.
- Em produção HTTPS, clientes, equipamentos, OS, histórico e demais dados operacionais deixam de ser gravados no `localStorage`.
- Chaves antigas de cache/sincronização com dados de negócio são removidas automaticamente.
- Fotos e anexos são compactados temporariamente em memória e enviados ao PostgreSQL.
- O estado principal passa a guardar apenas referências `/api/media/<id>` para as imagens.
- Respostas de mídia usam `Cache-Control: no-store` e cabeçalhos de não-cache.
- Captura direta de câmera usa `getUserMedia`, evitando que o AR7 solicite gravação da foto na galeria.
- Arquivos escolhidos da Galeria não são duplicados pelo AR7; o arquivo original já existente no aparelho não pode ser apagado pelo navegador por regra de segurança.
- Ao remover uma foto/OS e salvar o estado, mídias sem referência são removidas da tabela central de anexos.
- Configurações agora possuem uma área de **Limpeza definitiva**, exigindo frase de confirmação e checkbox.
- A limpeza troca o `data_epoch`, impedindo clientes antigos de reenviar dados apagados.
- Versões anteriores à 20.2.6 são recusadas para gravação depois desta mudança.

## O que a limpeza apaga

Clientes, equipamentos, ordens de serviço, histórico operacional, lixeira e anexos armazenados pelo AR7 no banco central ativo.

## O que é preservado

Dados de identificação/configuração da oficina e catálogo-base.

## Limite técnico importante

A limpeza é definitiva do ponto de vista do **estado ativo da aplicação e das tabelas utilizadas pelo AR7**. O sistema não consegue controlar retenção física de snapshots, WAL, backups ou cópias de infraestrutura mantidas pelo provedor PostgreSQL/Render segundo a política do serviço.

Da mesma forma, um navegador web não tem permissão para apagar um arquivo original que o usuário já possuía na Galeria. A V20.2.6 garante que o AR7 não mantenha uma cópia persistente desse anexo no dispositivo.
