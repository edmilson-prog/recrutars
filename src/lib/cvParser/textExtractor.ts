/**
 * Text Extractor - PRD-038
 * Extrai texto de arquivos PDF e DOCX
 */

import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configurar worker do PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Extrai texto de um arquivo PDF
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const textParts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => {
        if ('str' in item) {
          return item.str;
        }
        return '';
      })
      .join(' ');
    textParts.push(pageText);
  }

  return textParts.join('\n\n');
}

/**
 * Extrai texto de um arquivo DOCX
 */
export async function extractTextFromDOCX(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

/**
 * Detecta o tipo de arquivo e extrai o texto
 */
export async function extractText(file: File): Promise<string> {
  const mimeType = file.type;

  if (mimeType === 'application/pdf') {
    return extractTextFromPDF(file);
  }

  if (
    mimeType === 'application/msword' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return extractTextFromDOCX(file);
  }

  throw new Error(`Tipo de arquivo não suportado: ${mimeType}`);
}
