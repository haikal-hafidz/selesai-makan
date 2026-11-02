import Papa from 'papaparse';
import * as mammoth from 'mammoth';
import * as XLSX from 'xlsx';

export interface ExtractionResult {
  text: string;
  status: 'ready' | 'extracted' | 'attachment_only';
  previewType: 'text' | 'csv' | 'pdf' | 'image' | 'unsupported';
  info?: string;
}

/**
 * Helper to safely read file/blob as text across modern browsers and Node/jsdom
 */
async function readBlobAsText(blob: Blob): Promise<string> {
  if (typeof blob.text === 'function') {
    return blob.text();
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
}

/**
 * Helper to safely read file/blob as ArrayBuffer
 */
async function readBlobAsArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  if (typeof blob.arrayBuffer === 'function') {
    return blob.arrayBuffer();
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

/**
 * Universal client-side document content extractor
 * Supports TXT, Markdown, CSV, DOCX, XLSX, and Image previews natively.
 * For PDF or unsupported formats, it gracefully marks them as attachments.
 */
export async function extractResourceContent(file: File): Promise<ExtractionResult> {
  const filename = file.name.toLowerCase();
  const fileType = file.type || '';

  // 1. Text & Markdown files (.txt, .md, text/*)
  if (
    filename.endsWith('.txt') ||
    filename.endsWith('.md') ||
    filename.endsWith('.markdown') ||
    fileType.startsWith('text/plain') ||
    fileType === 'text/markdown'
  ) {
    try {
      const text = await readBlobAsText(file);
      return {
        text,
        status: 'extracted',
        previewType: 'text',
        info: 'Plain text / Markdown parsed successfully.',
      };
    } catch (err) {
      console.warn('Text reading failed:', err);
    }
  }

  // 2. CSV files (.csv, text/csv)
  if (filename.endsWith('.csv') || fileType === 'text/csv') {
    try {
      const text = await readBlobAsText(file);
      const parsed = Papa.parse(text, { preview: 25 });
      let formatted = `# CSV Data: ${file.name}\n\n`;
      if (Array.isArray(parsed.data)) {
        parsed.data.forEach((row) => {
          if (Array.isArray(row) && row.length > 0) {
            formatted += `| ${row.join(' | ')} |\n`;
          }
        });
      }
      return {
        text: formatted || text,
        status: 'extracted',
        previewType: 'csv',
        info: `CSV parsed (${parsed.data.length} preview rows extracted).`,
      };
    } catch (err) {
      console.warn('CSV parsing failed:', err);
    }
  }

  // 3. Word documents (.docx)
  if (
    filename.endsWith('.docx') ||
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    try {
      const arrayBuffer = await readBlobAsArrayBuffer(file);
      const result = await mammoth.extractRawText({ arrayBuffer });
      const rawText = result.value ? result.value.trim() : '';
      if (rawText) {
        return {
          text: rawText,
          status: 'extracted',
          previewType: 'text',
          info: 'Word document text extracted via client-side parser.',
        };
      }
    } catch (err) {
      console.warn('DOCX extraction failed:', err);
    }
  }

  // 4. Spreadsheets (.xlsx, .xls)
  if (
    filename.endsWith('.xlsx') ||
    filename.endsWith('.xls') ||
    fileType.includes('spreadsheet') ||
    fileType.includes('excel')
  ) {
    try {
      const arrayBuffer = await readBlobAsArrayBuffer(file);
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      let combinedText = `# Spreadsheet: ${file.name}\n\n`;
      workbook.SheetNames.forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        if (csv.trim()) {
          combinedText += `## Sheet: ${sheetName}\n\`\`\`csv\n${csv.trim()}\n\`\`\`\n\n`;
        }
      });
      return {
        text: combinedText,
        status: 'extracted',
        previewType: 'text',
        info: `Spreadsheet data extracted from ${workbook.SheetNames.length} sheet(s).`,
      };
    } catch (err) {
      console.warn('XLSX extraction failed:', err);
    }
  }

  // 5. PDF documents
  if (filename.endsWith('.pdf') || fileType.includes('pdf')) {
    return {
      text: '',
      status: 'ready',
      previewType: 'pdf',
      info: 'PDF document ready for in-app reader or download.',
    };
  }

  // 6. Images
  if (fileType.startsWith('image/')) {
    return {
      text: '',
      status: 'ready',
      previewType: 'image',
      info: 'Image file stored as visual attachment.',
    };
  }

  // 7. Unsupported / generic attachments (.pptx, .zip, etc.)
  return {
    text: '',
    status: 'attachment_only',
    previewType: 'unsupported',
    info: 'Stored locally as downloadable attachment. File preview not available.',
  };
}
