# GEO-BIO SCANNER

Plataforma web de apoio à exploração de dados geoquímicos, mineralógicos e biogeográficos da região de Brusque e Botuverá (SC).

## Requisitos
- Node.js 20 ou superior (recomendado)
- npm
- Navegador moderno

## Instalação e execução

```bash
npm install
npm run dev
```

Abra o endereço exibido pelo Vite (normalmente `http://localhost:5173`). Para gerar a versão de produção:

```bash
npm run build
npm run preview
```

## Fonte de dados
Por padrão, o aplicativo busca a planilha pública diretamente do GitHub:

`https://raw.githubusercontent.com/juliocamposmachado/geoquimica_brusque_botuvera/index.html/projeto_brusque_botuvera_geoquimica.xlsx`

Se o navegador ou a hospedagem bloquear a requisição, use **Importar XLSX** para selecionar uma cópia local do arquivo. O carregador lê todas as abas com linhas de dados e preserva os valores originais em memória. As colunas são detectadas dinamicamente para indicadores e filtros básicos.

## Módulos
- Painel geral com indicadores calculados a partir das linhas importadas.
- Tabela pesquisável, filtro por aba, paginação, inspeção de registros e exportação CSV.
- Mapa de pontos quando latitude/longitude geográficas válidas são identificadas.
- Explorador textual de registros relacionados a ouro.
- Catálogo mineral de referência e sinalização de termos encontrados.
- Tabela periódica de referência.
- Conteúdo conceitual de biogeoquímica e contexto geológico.

## Cuidados científicos e limitações
1. A aplicação não cria amostras nem resultados laboratoriais. Indicadores refletem somente os dados carregados.
2. A detecção de termos como “ouro” é uma busca textual exploratória, não uma análise quantitativa.
3. Registro qualitativo de ouro não equivale a ppm, %, g/t, teor econômico ou reserva.
4. A tabela periódica e o catálogo mineral são referências didáticas; presença de um mineral não comprova análise elementar de seus constituintes.
5. Coordenadas são plotadas somente quando reconhecidas como latitude/longitude em graus decimais. Coordenadas UTM precisam de zona, hemisfério e datum para conversão segura.
6. Associações minerais, processos biogeoquímicos e NDVI são apresentados como conceitos, não como conclusões sobre a área.
7. Correspondências textuais no catálogo mineral são indícios de texto e precisam de validação humana.

## Estrutura

```text
src/
  components/MapView.tsx
  lib/data.ts
  App.tsx
  main.tsx
  styles.css
```

## Implantação
Compatível com hospedagem estática como Vercel ou Netlify. Configure o comando de build `npm run build` e diretório de saída `dist`.

## Próximos aprimoramentos recomendados
- Mapear formalmente os cabeçalhos reais da planilha (incluindo X/Y/Z, projeção, datum e zona UTM).
- Criar dicionário validado para campos de amostragem, mineralogia, método analítico, laboratório e unidade.
- Implementar análises estatísticas somente após validar tipo, unidade, limites de detecção e QA/QC.
- Adicionar autenticação e histórico de versões caso haja dados privados ou edição colaborativa.
