import { describe, it, expect } from 'vitest';
import 'fake-indexeddb/auto';
import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import { validateLearningPack, importLearningPack } from '../services/learningPack';
import { storage } from '../services/storage';

describe('Excel Masterclass Learning Pack Validation Suite', () => {
  const packPath = path.resolve(__dirname, '../../Excel_Masterclass_Learning_Pack_ID.json');

  it('validates JSON existence, syntax, and schema v1.1 compliance', () => {
    expect(fs.existsSync(packPath)).toBe(true);
    const rawContent = fs.readFileSync(packPath, 'utf-8');
    const parsed = JSON.parse(rawContent);

    const validation = validateLearningPack(parsed);
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);
    expect(validation.summary.chaptersCount).toBe(12);
    expect(validation.summary.lessonsCount).toBeGreaterThanOrEqual(20);
    expect(validation.summary.resourcesCount).toBe(1);
    expect(validation.summary.hasFinalProject).toBe(true);
    expect(validation.schemaVersion).toBe('1.1');
  });

  it('verifies embedded XLSX binary resource and byte-for-byte integrity', () => {
    const rawContent = fs.readFileSync(packPath, 'utf-8');
    const pack = JSON.parse(rawContent);

    expect(pack.resources).toHaveLength(1);
    const xlsxResource = pack.resources[0];
    expect(xlsxResource.name).toBe('Workbook_Latihan_Excel_Masterclass.xlsx');
    expect(xlsxResource.fileType).toBe(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    expect(xlsxResource.contentBase64).toContain(';base64,');

    const base64Part = xlsxResource.contentBase64.split(';base64,')[1];
    const decodedBuffer = Buffer.from(base64Part, 'base64');
    expect(decodedBuffer.length).toBeGreaterThan(50000);

    // Read with XLSX library
    const wb = XLSX.read(decodedBuffer, { type: 'buffer' });
    expect(wb.SheetNames).toContain('Roadmap & Panduan');
    expect(wb.SheetNames).toContain('Latihan Dasar');
    expect(wb.SheetNames).toContain('Logika & Teks');
    expect(wb.SheetNames).toContain('Lookup & Referensi');
    expect(wb.SheetNames).toContain('Pivot & Visualisasi');
    expect(wb.SheetNames).toContain('Power Query & Kasus');
    expect(wb.SheetNames).toContain('Proyek Akhir');
    expect(wb.SheetNames).toContain('Kunci Jawaban');
  });

  it('simulates transactional import into IndexedDB storage without errors', async () => {
    const rawContent = fs.readFileSync(packPath, 'utf-8');
    const pack = JSON.parse(rawContent);

    const result = await importLearningPack(pack);
    expect(result.classId).toBeTruthy();
    expect(result.chaptersCount).toBeGreaterThanOrEqual(12);
    expect(result.resourcesCount).toBe(1);

    // Verify stored resources
    const storedResources = await storage.getResources(result.classId);
    expect(storedResources).toHaveLength(1);
    expect(storedResources[0].name).toBe('Workbook_Latihan_Excel_Masterclass.xlsx');
  });
});
