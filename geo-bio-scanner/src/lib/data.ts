import * as XLSX from 'xlsx';

export const SOURCE_URL = 'https://raw.githubusercontent.com/juliocamposmachado/geoquimica_brusque_botuvera/index.html/projeto_brusque_botuvera_geoquimica.xlsx';
export type RecordRow = Record<string, unknown> & { __sheet: string; __id: number };
export type Dataset = { rows: RecordRow[]; sheets: string[]; loadedAt: string; fileName: string };
const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
export const keyFor = (row: Record<string,unknown>, patterns: string[]) => Object.keys(row).find(k => patterns.some(p => norm(k).includes(norm(p))));
export const valueFor = (row: Record<string,unknown>, patterns: string[]) => { const k=keyFor(row,patterns); return k ? row[k] : undefined; };
export const asText = (v: unknown) => v == null ? '' : String(v).trim();
export const asNumber = (v: unknown) => { if(typeof v==='number') return Number.isFinite(v)?v:null; if(typeof v==='string'){ const n=Number(v.trim().replace(',','.')); return v.trim() && Number.isFinite(n)?n:null; } return null; };
export function parseWorkbook(buffer: ArrayBuffer, fileName='planilha.xlsx'): Dataset {
  const wb=XLSX.read(buffer,{type:'array',cellDates:true}); const rows:RecordRow[]=[]; const sheets:string[]=[];
  wb.SheetNames.forEach(name=>{ const ws=wb.Sheets[name]; const json=XLSX.utils.sheet_to_json<Record<string,unknown>>(ws,{defval:null,raw:true}); if(json.length){ sheets.push(name); json.forEach((r,i)=>rows.push({...r,__sheet:name,__id:rows.length+1})); }});
  return {rows,sheets,loadedAt:new Date().toISOString(),fileName};
}
export async function loadRemote():Promise<Dataset>{ const res=await fetch(SOURCE_URL,{cache:'no-store'}); if(!res.ok) throw new Error(`Falha HTTP ${res.status}: não foi possível obter a planilha do GitHub.`); return parseWorkbook(await res.arrayBuffer(),'projeto_brusque_botuvera_geoquimica.xlsx'); }
export function downloadCsv(rows:RecordRow[], filename='geo-bio-registros.csv'){ if(!rows.length)return; const clean=rows.map(({__sheet,__id,...r})=>r); const ws=XLSX.utils.json_to_sheet(clean); const csv=XLSX.utils.sheet_to_csv(ws,{FS:';'}); const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url); }
export const MINERALS=[
 {name:'Ouro',formula:'Au',group:'Elemento nativo',note:'Registro mineralógico qualitativo. Não equivale a teor, concentração ou teor econômico.'},
 {name:'Pirita',formula:'FeS₂',group:'Sulfeto',note:'Sulfeto de ferro; pode ocorrer em diferentes ambientes hidrotermais e sedimentares.'},
 {name:'Arsenopirita',formula:'FeAsS',group:'Sulfeto',note:'Mineral portador de arsênio, encontrado em alguns sistemas auríferos.'},
 {name:'Calcopirita',formula:'CuFeS₂',group:'Sulfeto',note:'Principal mineral de minério de cobre em muitos depósitos.'},
 {name:'Galena',formula:'PbS',group:'Sulfeto',note:'Principal mineral de minério de chumbo.'},
 {name:'Cinábrio',formula:'HgS',group:'Sulfeto',note:'Principal minério de mercúrio.'},
 {name:'Hematita',formula:'Fe₂O₃',group:'Óxido',note:'Óxido de ferro comum em solos e formações ferríferas.'},
 {name:'Magnetita',formula:'Fe₃O₄',group:'Óxido',note:'Óxido de ferro com propriedades magnéticas.'},
 {name:'Goethita',formula:'FeO(OH)',group:'Oxihidróxido',note:'Comum em ambientes de intemperismo e solos.'},
 {name:'Quartzo',formula:'SiO₂',group:'Silicato',note:'Mineral abundante, presente em diversos tipos de rocha e veios.'},
 {name:'Scheelita',formula:'CaWO₄',group:'Tungstato',note:'Mineral de tungstênio.'},
 {name:'Wolframita',formula:'(Fe,Mn)WO₄',group:'Tungstato',note:'Série mineral de tungstato de ferro e manganês.'}
];
