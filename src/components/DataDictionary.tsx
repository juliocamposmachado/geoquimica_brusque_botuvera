import { useMemo, useState } from 'react';
import { AlertTriangle, Database, MapPin, Search, ShieldCheck } from 'lucide-react';
import { inspectFields, inspectSpatialMetadata } from '../lib/metadata';
import type { RecordRow } from '../lib/data';

export default function DataDictionary({ rows }: { rows: RecordRow[] }) {
  const [query, setQuery] = useState('');
  const fields = useMemo(() => inspectFields(rows), [rows]);
  const spatial = useMemo(() => inspectSpatialMetadata(rows), [rows]);

  const filtered = fields.filter(field =>
    `${field.name} ${field.category} ${field.unit}`
      .toLowerCase().includes(query.toLowerCase())
  );

  const censored = fields.reduce((sum, field) => sum + field.censored, 0);
  const missing = fields.reduce((sum, field) => sum + field.missing, 0);

  return (
    <>
      <div className="kpi-grid">
        <div className="kpi">
          <div className="kpi-top"><span>CAMPOS IDENTIFICADOS</span><Database size={18}/></div>
          <strong>{fields.length.toLocaleString('pt-BR')}</strong>
          <small>Cabeçalhos originais preservados</small>
        </div>
        <div className="kpi">
          <div className="kpi-top"><span>VALORES CENSURADOS</span><AlertTriangle size={18}/></div>
          <strong>{censored.toLocaleString('pt-BR')}</strong>
          <small>ND, abaixo ou acima de limites</small>
        </div>
        <div className="kpi">
          <div className="kpi-top"><span>CÉLULAS VAZIAS</span><Database size={18}/></div>
          <strong>{missing.toLocaleString('pt-BR')}</strong>
          <small>Contagem por campo e registro</small>
        </div>
        <div className="kpi">
          <div className="kpi-top"><span>REGISTROS EXAMINADOS</span><ShieldCheck size={18}/></div>
          <strong>{rows.length.toLocaleString('pt-BR')}</strong>
          <small>Dados carregados nesta sessão</small>
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">
          <div>
            <h3>Referência espacial</h3>
            <p>Identificação baseada nos nomes reais dos campos, sem presumir sistemas de coordenadas.</p>
          </div>
          <MapPin size={20}/>
        </div>
        <div className="metadata-status">
          <b>Coordenadas geográficas:</b>
          <span>{spatial.hasGeographicPair ? 'Par de latitude/longitude identificado.' : 'Par latitude/longitude não identificado pelos cabeçalhos.'}</span>
        </div>
        <div className="metadata-status">
          <b>Possíveis coordenadas projetadas:</b>
          <span>{spatial.hasPossibleProjectedPair ? 'Possíveis campos X/Y encontrados; conversão ainda não autorizada.' : 'Par X/Y projetado não identificado pelos cabeçalhos.'}</span>
        </div>
        <div className="metadata-status">
          <b>Datum, projeção e zona:</b>
          <span>{spatial.status}</span>
        </div>
        {spatial.referenceFields.length > 0 && (
          <div className="field-tags">
            {spatial.referenceFields.map(field => <span key={field.name}>{field.name}</span>)}
          </div>
        )}
        <div className="scientific-warning">
          <AlertTriangle/>
          <div>
            <b>Regra de segurança geográfica</b>
            <p>Coordenadas X/Y não serão convertidas sem confirmação da projeção, datum, zona UTM e hemisfério. A identificação automática é apenas uma indicação para revisão.</p>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="toolbar">
          <div className="panel-title">
            <div>
              <h3>Dicionário de dados</h3>
              <p>{filtered.length} de {fields.length} campos encontrados</p>
            </div>
          </div>
          <div className="searchbox">
            <Search size={16}/>
            <input
              placeholder="Buscar campo, categoria ou unidade..."
              value={query}
              onChange={event => setQuery(event.target.value)}
            />
          </div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Campo original</th>
                <th>Classificação sugerida</th>
                <th>Unidade</th>
                <th>Preenchidos</th>
                <th>Vazios</th>
                <th>Censurados</th>
                <th>Exemplos originais</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(field => (
                <tr key={field.name}>
                  <td><b>{field.name}</b></td>
                  <td>{field.category}</td>
                  <td>{field.unit}</td>
                  <td>{field.filled}</td>
                  <td>{field.missing}</td>
                  <td>{field.censored}</td>
                  <td className="examples-cell">{field.examples.join(' · ') || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && <div className="empty">Nenhum campo encontrado.</div>}
        </div>
        <p className="note">
          Classificações são sugestões automáticas baseadas nos nomes dos cabeçalhos.
          Os valores originais não são modificados. A unidade só é indicada quando
          reconhecida no nome do campo; exemplos não constituem validação analítica.
        </p>
      </div>
    </>
  );
}
