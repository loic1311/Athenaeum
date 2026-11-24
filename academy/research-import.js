import { readStudyFile } from './importer.js?v=160';

const DOCX_LIMIT = 3 * 1024 * 1024;

async function readWord(file) {
  if (file.size > 18 * 1024 * 1024) throw new Error('Dit Word-bestand is groter dan 18 MB. Plak het gewenste fragment.');
  let archive;
  try {
    const { default: nodeZip } = await import('./vendor/jszip.min.js');
    archive = await (nodeZip ?? globalThis.JSZip).loadAsync(await file.arrayBuffer());
  } catch {
    throw new Error('Word-bestand niet leesbaar. Open het in Word en sla het opnieuw op als .docx of plak de tekst.');
  }
  const entry = archive.file('word/document.xml');
  if (!entry) throw new Error('In dit Word-bestand is geen documenttekst gevonden.');
  const xml = await new Promise((resolve, reject) => {
    const reader = entry.internalStream('uint8array');
    const decoder = new TextDecoder();
    let text = '';
    let bytes = 0;
    reader.on('data', chunk => {
      bytes += chunk.byteLength;
      if (bytes > DOCX_LIMIT) {
        reader.pause();
        reject(new Error('Dit Word-bestand bevat veel tekst of opmaak. Plak een gedeelte van de tekst.'));
      } else {
        text += decoder.decode(chunk, { stream: true });
      }
    });
    reader.on('error', () => reject(new Error('De tekst in dit Word-bestand kon niet worden uitgepakt.')));
    reader.on('end', () => resolve(text + decoder.decode()));
    reader.resume();
  });
  if (/<!DOCTYPE/i.test(xml)) throw new Error('De documentstructuur kon niet veilig worden ingelezen. Plak de benodigde tekst.');
  const document = new DOMParser().parseFromString(xml, 'application/xml');
  const { localName, namespaceURI } = document.documentElement;
  if (localName !== 'document' || !['http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'http://purl.oclc.org/ooxml/wordprocessingml/main'].includes(namespaceURI)) {
    throw new Error('De tekststructuur van dit Word-bestand is onleesbaar. Plak de benodigde tekst.');
  }
  const paragraphs = document.getElementsByTagNameNS(namespaceURI, 'p');
  const text = Array.from(paragraphs, p => Array.from(p.getElementsByTagNameNS(namespaceURI, '*'), node => {
    if (node.localName === 't') return node.textContent;
    if (node.localName === 'br' || node.localName === 'cr') return '\n';
    if (node.localName === 'tab') return '\t';
    return '';
  }).join('').trim()).filter(Boolean).join('\n\n');
  if (!text) throw new Error('Dit Word-bestand bevat geen leesbare hoofdtekst.');
  return { text, file: file.name };
}

export async function readResearchFile(file, startPage, endPage) {
  if (/\.docx$/i.test(file.name)) return readWord(file);
  const start = Number(startPage) || 1;
  const end = Number(endPage) || start;
  const pages = await readStudyFile(file, { start, end });
  const text = pages.map(page => page.locator ? '[' + page.locator + ']\n' + page.text : page.text).join('\n\n').trim();
  if (!text) throw new Error('Dit bestand bevat geen leesbare tekst.');
  return { text, file: file.name, location: pages.map(page => page.locator).filter(Boolean).join(' · ') };
}
