# AR7 Gestão da Oficina V20.2.1 - Relatório compacto

## Resultado

- **27/27 verificações aprovadas** com `npm run check` e `npm test`.
- Sintaxe de `app.js` e `server.js` validada pelo Node.
- Servidor local iniciado sem `DATABASE_URL` e fallback automático de porta validado.

## Alterações desta revisão

1. O relatório deixa de consolidar fotos de etapas diferentes na mesma página.
2. Cada conjunto fotográfico possui páginas próprias:
   - Recebimento;
   - Diagnóstico e desmontagem;
   - Montagem;
   - Equipamento finalizado.
3. Cada página de uma etapa recebe no máximo 4 fotos daquela mesma etapa.
4. Aproveitamento das fotos no A4:
   - 1 foto: imagem grande centralizada;
   - 2 fotos: imagens maiores empilhadas;
   - 3 ou 4 fotos: grade 2 x 2.
5. A página de identificação passa a aproveitar o espaço livre com o diagnóstico técnico.
6. Em relatórios curtos, intervenção, componentes, medições e assinaturas são compactados em menos páginas.
7. Em relatórios maiores, a compactação é conservadora para impedir corte de conteúdo.
8. Assinaturas permanecem sem caixa/contorno.
9. O indicador flutuante `Banco central conectado` é ocultado durante a impressão/PDF.
10. Cores e identidade visual atuais da AR7 foram preservadas.

## Regressões cobertas

- Banco central PostgreSQL preservado.
- Login multi-dispositivo preservado.
- Galeria e câmera separadas preservadas.
- Compactação de fotos grandes preservada.
- UX de teclado/VisualViewport preservada.
- Orçamento técnico/comercial separado preservado.
- Fluxo de prontidão verde preservado.
