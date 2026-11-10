import { asText, type RecordRow } from './data';

export type FieldInfo = {
  name: string;
  category: string;
  unit: string;
  examples: string[];
  filled: number;
  missing: number;
  censored: number;
  sheets: string[];
};

const normalize = (value: string) =>
  value.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

function classifyField(name: string): string {
  const n = normalize(name);

  if (/^(x|y|z)$/.test(n)) return 'Código original / significado a validar';
  if (/latitude|longitude|coordlat|coordlong|latitud|longitud/.test(n))
    return 'Coordenada geográfica';
  if (/utm|easting|northing|coordx|coordy|^xcoord|^ycoord/.test(n))
    return 'Possível coordenada projetada';
  if (/datum|epsg|projecao|projection|zonautm|hemisferio|fuso/.test(n))
    return 'Referência espacial';
  if (/mineral|ouro|gold|pirita|quartzo|arsenopirita|calcopirita/.test(n))
    return 'Mineralogia';
  if (/metodo|method|leitura|abertura|digestao|analise/.test(n))
    return 'Método analítico';
  if (/laboratorio|laboratory|lamin|job/.test(n))
    return 'Laboratório / rastreabilidade';
  if (/amostra|sample|campo|duplicata|codigo|identificador/.test(n))
    return 'Amostragem / identificação';
  if (/%|ppm|ppb|g.?t|mg.?kg|kg.?t/.test(n))
    return 'Resultado analítico / possível unidade';
  if (/classe|tipo|litologia|rocha|sedimento/.test(n))
    return 'Classificação da amostra';
  return 'Campo não classificado';
}

function detectUnit(name: string): string {
  const n = normalize(name);
  if (/(^|_)ppm$/.test(name.toLowerCase()) || n.endsWith('ppm')) return 'ppm';
  if (n.endsWith('ppb')) return 'ppb';
  if (n.endsWith('pct') || name.includes('%')) return '%';
  if (n.endsWith('gt') || n.endsWith('gt1')) return 'g/t (declarada no cabeçalho)';
  if (n.endsWith('mgkg')) return 'mg/kg';
  if (n.endsWith('kgt')) return 'kg/t';
  return 'Não declarada no nome do campo';
}

function isCensored(value: string): boolean {
  return /^(ND|N\.D\.|<\s*[\d,.]+|>\s*[\d,.]+|BDL|LD)$/i.test(value.trim());
}

export function inspectFields(rows: RecordRow[]): FieldInfo[] {
  const names = [...new Set(rows.flatMap(row =>
    Object.keys(row).filter(key => !key.startsWith('__'))
  ))];

  return names.map(name => {
    const values = rows.map(row => row[name]);
    const present = values.map(asText).filter(Boolean);
    const examples = [...new Set(present)].slice(0, 3);
    const sheets = [...new Set(rows
      .filter(row => asText(row[name]))
      .map(row => row.__sheet))];

    return {
      name,
      category: classifyField(name),
      unit: detectUnit(name),
      examples,
      filled: present.length,
      missing: rows.length - present.length,
      censored: present.filter(isCensored).length,
      sheets
    };
  });
}

export function inspectSpatialMetadata(rows: RecordRow[]) {
  const fields = inspectFields(rows);
  const normalizedNames = fields.map(field => normalize(field.name));

  const hasLat = normalizedNames.some(n => /latitude|^lat$/.test(n));
  const hasLon = normalizedNames.some(n => /longitude|^long$|^lon$/.test(n));
  const hasX = normalizedNames.some(n =>
    /^(x|coordx|utm e|easting|xcoord)$/.test(n));
  const hasY = normalizedNames.some(n =>
    /^(y|coordy|utm n|northing|ycoord)$/.test(n));

  const referenceFields = fields.filter(field =>
    field.category === 'Referência espacial'
  );

  return {
    hasGeographicPair: hasLat && hasLon,
    hasPossibleProjectedPair: hasX && hasY,
    referenceFields,
    status: referenceFields.length
      ? 'Metadados espaciais encontrados; conferir os valores.'
      : 'Datum, projeção e zona UTM não identificados nos cabeçalhos.'
  };
}
