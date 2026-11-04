// scripts/create_workbook.js
const XLSX = require('xlsx');
const fs = require('fs');

function createWorkbook() {
  const wb = XLSX.utils.book_new();

  // SHEET 1: Roadmap & Panduan
  const s1Data = [
    ['SELESAI MAKAN — WORKBOOK LATIHAN EXCEL MASTERCLASS (2019 & 2021)'],
    ['Panduan Resmi & Roadmap Praktik Terpadu'],
    ['Target Lingkungan:', 'Microsoft Excel 2019 / Excel 2021 / Excel LTSC (Windows)'],
    ['Regional Settings:', 'Indonesia (Pemisah argumen titik koma ;) atau US English (koma ,)'],
    [''],
    ['STRUKTUR WORKSHEET PRAKTIK:'],
    ['1. Roadmap & Panduan', 'Petunjuk navigasi dan etika pengerjaan latihan.'],
    ['2. Latihan Dasar', 'Aritmatika, Hirarki Operasi, Referensi Relatif ($A$1), Absolut, dan Campuran.'],
    ['3. Logika & Teks', 'IF Tunggal/Bertingkat, AND, OR, LEFT, RIGHT, MID, TRIM, PROPER, CONCAT.'],
    ['4. Lookup & Referensi', 'VLOOKUP, INDEX & MATCH (Kiri/Dua Arah), XLOOKUP (Excel 2021).'],
    ['5. Pivot & Visualisasi', 'Dataset Transaksi Penjualan 50 Baris untuk Pembuatan PivotTable & PivotChart.'],
    ['6. Power Query & Kasus', 'Dataset Kotor (Spasi ganda, format tanggal campur, pemisahan teks) & Skenario Bisnis.'],
    ['7. Proyek Akhir', 'Dataset Komprehensif Kasus Bisnis Ritel untuk Laporan Akhir Terpadu.'],
    ['8. Kunci Jawaban', 'Model jawaban dan formula benchmark untuk evaluasi mandiri.'],
    [''],
    ['PETUNJUK PENGERJAAN:'],
    ['• Jangan menuliskan nilai akhir secara manual (hardcoding). Gunakan formula dinamis.'],
    ['• Kerjakan latihan terlebih dahulu di sheet terkait sebelum memeriksa sheet "Kunci Jawaban".'],
    ['• Bila Excel Anda menggunakan bahasa/setting Indonesia, gantilah tanda koma (,) dengan titik-koma (;).']
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(s1Data);
  ws1['!cols'] = [{ wch: 25 }, { wch: 80 }];
  XLSX.utils.book_append_sheet(wb, ws1, 'Roadmap & Panduan');

  // SHEET 2: Latihan Dasar
  const s2Data = [
    ['MODUL 1 & 2: LATIHAN DASAR FORMULA DAN REFERENSI SEL'],
    ['Kasus A: Kalkulasi Penjualan & Pajak (Referensi Absolut & Campuran)'],
    ['Tarif PPN (Absolut):', 0.11, '', 'Tarif Diskon Volume:', 0.05],
    [''],
    ['Kode Produk', 'Nama Produk', 'Harga Satuan (Rp)', 'Jumlah Terjual', 'Subtotal', 'Diskon Volume', 'PPN (11%)', 'Total Akhir'],
    ['PRD-01', 'Buku Agenda Kulit', 75000, 12, '=C6*D6', '=IF(D6>=10, E6*$E$3, 0)', '=(E6-F6)*$B$3', '=E6-F6+G6'],
    ['PRD-02', 'Pulpen Gel 0.5mm', 15000, 45, '=C7*D7', '=IF(D7>=10, E7*$E$3, 0)', '=(E7-F7)*$B$3', '=E7-F7+G7'],
    ['PRD-03', 'Kalkulator Finansial', 320000, 5, '=C8*D8', '=IF(D8>=10, E8*$E$3, 0)', '=(E8-F8)*$B$3', '=E8-F8+G8'],
    ['PRD-04', 'Kertas HVS A4 80gsm', 55000, 25, '=C9*D9', '=IF(D9>=10, E9*$E$3, 0)', '=(E9-F9)*$B$3', '=E9-F9+G9'],
    ['PRD-05', 'Map Dokumen Folder', 22000, 8, '=C10*D10', '=IF(D10>=10, E10*$E$3, 0)', '=(E10-F10)*$B$3', '=E10-F10+G10'],
    ['PRD-06', 'Stapler Heavy Duty', 85000, 15, '=C11*D11', '=IF(D11>=10, E11*$E$3, 0)', '=(E11-F11)*$B$3', '=E11-F11+G11'],
    ['TOTAL', '', '', '=SUM(D6:D11)', '=SUM(E6:E11)', '=SUM(F6:F11)', '=SUM(G6:G11)', '=SUM(H6:H11)'],
    ['RATA-RATA', '', '=AVERAGE(C6:C11)', '=AVERAGE(D6:D11)', '=AVERAGE(E6:E11)', '', '', '=AVERAGE(H6:H11)'],
    ['NILAI TERTINGGI', '', '=MAX(C6:C11)', '=MAX(D6:D11)', '', '', '', '=MAX(H6:H11)'],
    ['NILAI TERENDAH', '', '=MIN(C6:C11)', '=MIN(D6:D11)', '', '', '', '=MIN(H6:H11)'],
    ['JUMLAH TRANSAKSI', '', '=COUNTA(A6:A11)', '', '', '', '', '']
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(s2Data);
  ws2['!cols'] = [{ wch: 14 }, { wch: 22 }, { wch: 18 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, ws2, 'Latihan Dasar');

  // SHEET 3: Logika & Teks
  const s3Data = [
    ['MODUL 3: LATIHAN FUNGSI LOGIKA (IF, AND, OR) DAN MANIPULASI TEKS'],
    ['Kasus 1: Evaluasi Kinerja Karyawan & Bonus Tahunan'],
    ['Kriteria Bonus:', 'Target >= 100jt AND Absensi >= 90% -> 15%; Target >= 80jt -> 7.5%; Lainnya 0%'],
    [''],
    ['ID Karyawan', 'Nama Lengkap (Kotor)', 'Pencapaian (Rp)', 'Kehadiran (%)', 'Nama Bersih (TRIM/PROPER)', 'Status Target', 'Persentase Bonus', 'Nominal Bonus'],
    ['EMP-101', '  budi   santoso  ', 125000000, 0.94, '=PROPER(TRIM(B5))', '=IF(C5>=100000000,"Tercapai","Di Bawah Target")', '=IF(AND(C5>=100000000,D5>=0.9), 0.15, IF(C5>=80000000, 0.075, 0))', '=C5*G5'],
    ['EMP-102', 'SITI   nurhaliza', 85000000, 0.88, '=PROPER(TRIM(B6))', '=IF(C6>=100000000,"Tercapai","Di Bawah Target")', '=IF(AND(C6>=100000000,D6>=0.9), 0.15, IF(C6>=80000000, 0.075, 0))', '=C6*G6'],
    ['EMP-103', '  AHMAD DANI  ', 110000000, 0.85, '=PROPER(TRIM(B7))', '=IF(C7>=100000000,"Tercapai","Di Bawah Target")', '=IF(AND(C7>=100000000,D7>=0.9), 0.15, IF(C7>=80000000, 0.075, 0))', '=C7*G7'],
    ['EMP-104', 'DEWI lestari ', 72000000, 0.95, '=PROPER(TRIM(B8))', '=IF(C8>=100000000,"Tercapai","Di Bawah Target")', '=IF(AND(C8>=100000000,D8>=0.9), 0.15, IF(C8>=80000000, 0.075, 0))', '=C8*G8'],
    ['EMP-105', '  hendra   wijaya', 140000000, 0.98, '=PROPER(TRIM(B9))', '=IF(C9>=100000000,"Tercapai","Di Bawah Target")', '=IF(AND(C9>=100000000,D9>=0.9), 0.15, IF(C9>=80000000, 0.075, 0))', '=C9*G9'],
    [''],
    ['Kasus 2: Ekstraksi Teks Kode Serial Produk (FORMAT: KATEGORI-TAHUN-URUTAN, Contoh: LAP-2022-0941)'],
    ['Serial Code', 'Kategori (LEFT 3 Karakter)', 'Tahun (MID 4 Karakter)', 'Nomor Urut (RIGHT 4 Karakter)', 'Panjang Karakter (LEN)'],
    ['LAP-2022-0941', '=LEFT(A13,3)', '=MID(A13,5,4)', '=RIGHT(A13,4)', '=LEN(A13)'],
    ['MOU-2021-1205', '=LEFT(A14,3)', '=MID(A14,5,4)', '=RIGHT(A14,4)', '=LEN(A14)'],
    ['KEY-2023-0042', '=LEFT(A15,3)', '=MID(A15,5,4)', '=RIGHT(A15,4)', '=LEN(A15)'],
    ['MON-2020-8812', '=LEFT(A16,3)', '=MID(A16,5,4)', '=RIGHT(A16,4)', '=LEN(A16)']
  ];
  const ws3 = XLSX.utils.aoa_to_sheet(s3Data);
  ws3['!cols'] = [{ wch: 14 }, { wch: 22 }, { wch: 18 }, { wch: 16 }, { wch: 25 }, { wch: 18 }, { wch: 16 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, ws3, 'Logika & Teks');

  // SHEET 4: Lookup & Referensi
  const s4Data = [
    ['MODUL 4 & 5: LOOKUP DAN PENCARIAN REFERENSI (VLOOKUP, INDEX MATCH, XLOOKUP)'],
    ['Tabel Master Produk (Data Referensi):'],
    ['Kode', 'Nama Barang', 'Kategori', 'Harga Jual', 'Stok Gudang', 'Lokasi Rak'],
    ['P-001', 'Monitor LED 24 Inci', 'Hardware', 1850000, 42, 'Rak-A1'],
    ['P-002', 'Keyboard Mechanical RGB', 'Aksesoris', 650000, 85, 'Rak-B2'],
    ['P-003', 'Mouse Wireless Ergonomis', 'Aksesoris', 280000, 110, 'Rak-B3'],
    ['P-004', 'SSD NVMe 1TB Gen4', 'Storage', 1350000, 60, 'Rak-C1'],
    ['P-005', 'RAM DDR4 16GB 3200MHz', 'Memory', 720000, 50, 'Rak-C2'],
    ['P-006', 'Headset Gaming 7.1', 'Audio', 480000, 35, 'Rak-D1'],
    [''],
    ['Latihan 1: VLOOKUP Standar (Pencarian ke Kanan)'],
    ['Cari Kode:', 'P-003', '', 'Hasil Nama Barang:', '=VLOOKUP(B12, A4:F9, 2, FALSE)'],
    ['', '', '', 'Hasil Harga Jual:', '=VLOOKUP(B12, A4:F9, 4, FALSE)'],
    ['', '', '', 'Hasil Lokasi Rak:', '=VLOOKUP(B12, A4:F9, 6, FALSE)'],
    [''],
    ['Latihan 2: INDEX & MATCH Pencarian Fleksibel (Termasuk Pencarian ke Arah Kiri)'],
    ['Cari Nama:', 'SSD NVMe 1TB Gen4', '', 'Hasil Kode (Pencarian ke Kiri):', '=INDEX(A4:A9, MATCH(B17, B4:B9, 0))'],
    ['', '', '', 'Hasil Stok Gudang:', '=INDEX(E4:E9, MATCH(B17, B4:B9, 0))'],
    [''],
    ['Latihan 3: XLOOKUP (Excel 2021) & Padanan IFERROR+VLOOKUP (Excel 2019)'],
    ['Cari Kode:', 'P-999 (Tidak Ada)', '', 'Excel 2021 (XLOOKUP):', '=XLOOKUP(B21, A4:A9, B4:B9, "Kode Tidak Ditemukan")'],
    ['', '', '', 'Excel 2019 (IFERROR VLOOKUP):', '=IFERROR(VLOOKUP(B21, A4:F9, 2, FALSE), "Kode Tidak Ditemukan")']
  ];
  const ws4 = XLSX.utils.aoa_to_sheet(s4Data);
  ws4['!cols'] = [{ wch: 12 }, { wch: 28 }, { wch: 16 }, { wch: 26 }, { wch: 32 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, ws4, 'Lookup & Referensi');

  // SHEET 5: Pivot & Visualisasi (50 Baris Transaksi)
  const regions = ['Jabodetabek', 'Jawa Barat', 'Jawa Timur', 'Sumatera Utara', 'Bali & Nusa Tenggara'];
  const categories = ['Elektronik', 'Perlengkapan Kantor', 'Aksesoris IT', 'Furnitur'];
  const reps = ['Aditya Pratama', 'Bella Safitri', 'Chandra Gunawan', 'Dian Kusuma', 'Eko Prasetyo'];
  const items = [
    { name: 'Laptop Bisnis 14 Inci', cat: 'Elektronik', price: 9500000 },
    { name: 'Printer Multifungsi Laser', cat: 'Elektronik', price: 3200000 },
    { name: 'Kursi Ergonomis Mesh', cat: 'Furnitur', price: 1850000 },
    { name: 'Meja Kerja Adjustable', cat: 'Furnitur', price: 2750000 },
    { name: 'USB-C Docking Station', cat: 'Aksesoris IT', price: 850000 },
    { name: 'Webcam Full HD 1080p', cat: 'Aksesoris IT', price: 650000 },
    { name: 'Kertas HVS Box (5 Rim)', cat: 'Perlengkapan Kantor', price: 240000 },
    { name: 'Filing Cabinet 3 Laci', cat: 'Furnitur', price: 1450000 }
  ];

  const s5Data = [
    ['DATASET TRANSAKSI PENJUALAN RITEL 2023 (BAHAN PIVOTTABLE & PIVOTCHART)'],
    ['Instruksi: Gunakan dataset di bawah untuk membuat PivotTable di worksheet baru.'],
    ['Tugas Analisis: 1. Penjualan per Wilayah; 2. Kontribusi Kategori Produk; 3. Peringkat Sales Representative.'],
    [''],
    ['ID Transaksi', 'Tanggal', 'Sales Rep', 'Wilayah', 'Kategori', 'Nama Produk', 'Jumlah', 'Harga Satuan', 'Total Penjualan']
  ];

  for (let i = 1; i <= 50; i++) {
    const id = 'TRX-' + (2023000 + i);
    const day = (i % 28) + 1;
    const month = (i % 12) + 1;
    const dateStr = `2023-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
    const rep = reps[i % reps.length];
    const reg = regions[i % regions.length];
    const prod = items[i % items.length];
    const qty = ((i * 3) % 15) + 1;
    const rowIdx = i + 5;
    s5Data.push([
      id,
      dateStr,
      rep,
      reg,
      prod.cat,
      prod.name,
      qty,
      prod.price,
      `=G${rowIdx}*H${rowIdx}`
    ]);
  }
  const ws5 = XLSX.utils.aoa_to_sheet(s5Data);
  ws5['!cols'] = [{ wch: 14 }, { wch: 12 }, { wch: 18 }, { wch: 20 }, { wch: 18 }, { wch: 25 }, { wch: 10 }, { wch: 14 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, ws5, 'Pivot & Visualisasi');

  // SHEET 6: Power Query & Kasus Bisnis
  const s6Data = [
    ['MODUL 6 & 7: PEMBERSIHAN DATA DAN TRANSFORMASI DENGAN POWER QUERY'],
    ['Kasus: Data Mentah Ekspor Sistem ERP (Bermasalah: Spasi berlebih, huruf acak, format campur)'],
    ['Instruksi: Gunakan Power Query (Get & Transform Data) atau kombinasi formula teks untuk membersihkan data.'],
    [''],
    ['ID Mentah', 'Nama Klien (Kotor)', 'Kontak Telepon (Format Campur)', 'Kota & Wilayah', 'Nilai Kontrak Kotor', 'Status Tagihan'],
    ['CLI-001', '   PT Maju   Mapan Sentosa  ', "'+62-811-2345-6789", 'Jakarta / DKI Jakarta', 'Rp 150.000.000', 'LUNAS'],
    ['CLI-002', 'cv. BERKAH KARYA   ', "'081298765432", 'Bandung / Jawa Barat', 'Rp 45.000.000', 'belum bayar'],
    ['CLI-003', '   sinar abadi   corporation', "'+6281311223344", 'Surabaya / Jawa Timur', 'Rp 220.000.000', 'Lunas'],
    ['CLI-004', 'PT nusantara JAYA mandiri', "'0815-4433-2211", 'Medan / Sumatera Utara', 'Rp 95.000.000', 'BELUM BAYAR'],
    ['CLI-005', '  CV bali lestari  indah  ', "'+62-817-0099-8877", 'Denpasar / Bali', 'Rp 80.000.000', 'Lunas'],
    [''],
    ['TARGET HASIL TRANSFORMASI (SETELAH DIBERSIHKAN DENGAN POWER QUERY / FORMULA):'],
    ['ID Bersih', 'Nama Entitas Resmi', 'No. WhatsApp Standar', 'Nama Kota', 'Provinsi', 'Nilai Kontrak (Angka)', 'Status Valid'],
    ['CLI-001', 'PT Maju Mapan Sentosa', '6281123456789', 'Jakarta', 'DKI Jakarta', 150000000, 'LUNAS'],
    ['CLI-002', 'CV Berkah Karya', '6281298765432', 'Bandung', 'Jawa Barat', 45000000, 'BELUM LUNAS'],
    ['CLI-003', 'Sinar Abadi Corporation', '6281311223344', 'Surabaya', 'Jawa Timur', 220000000, 'LUNAS'],
    ['CLI-004', 'PT Nusantara Jaya Mandiri', '6281544332211', 'Medan', 'Sumatera Utara', 95000000, 'BELUM LUNAS'],
    ['CLI-005', 'CV Bali Lestari Indah', '6281700998877', 'Denpasar', 'Bali', 80000000, 'LUNAS']
  ];
  const ws6 = XLSX.utils.aoa_to_sheet(s6Data);
  ws6['!cols'] = [{ wch: 12 }, { wch: 30 }, { wch: 25 }, { wch: 22 }, { wch: 20 }, { wch: 16 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, ws6, 'Power Query & Kasus');

  // SHEET 7: Proyek Akhir
  const s7Data = [
    ['CAPSTONE PROJECT: SISTEM ANALISIS KEUANGAN & PENJUALAN RITEL TERPADU'],
    ['Instruksi Proyek Akhir:'],
    ['1. Lengkapi kolom kalkulasi (Margin Kotor, Status Target, Kategori Profitabilitas).'],
    ['2. Buat tabel ringkasan KPI eksekutif menggunakan SUMIFS, COUNTIFS, AVERAGEIFS.'],
    ['3. Susun visualisasi PivotChart dan Slicer interaktif untuk presentasi manajemen.'],
    [''],
    ['DATA PENJUALAN KONSOLIDASI TAHUNAN:'],
    ['ID Transaksi', 'Kategori Bisnis', 'Target Penjualan (Rp)', 'Realisasi Penjualan (Rp)', 'Beban Pokok (COGS)', 'Margin Laba Kotor (Rp)', '% Margin Kotor', 'Status Target (>=100%)', 'Tingkat Margin'],
    ['PRJ-01', 'Retail Modern', 500000000, 540000000, 378000000, '=D8-E8', '=F8/D8', '=IF(D8>=C8,"Tercapai","Tidak")', '=IF(G8>=0.3,"Tinggi","Standar")'],
    ['PRJ-02', 'Distribusi B2B', 800000000, 760000000, 570000000, '=D9-E9', '=F9/D9', '=IF(D9>=C9,"Tercapai","Tidak")', '=IF(G9>=0.3,"Tinggi","Standar")'],
    ['PRJ-03', 'E-Commerce Direct', 350000000, 420000000, 273000000, '=D10-E10', '=F10/D10', '=IF(D10>=C10,"Tercapai","Tidak")', '=IF(G10>=0.3,"Tinggi","Standar")'],
    ['PRJ-04', 'Corporate Supply', 650000000, 690000000, 517500000, '=D11-E11', '=F11/D11', '=IF(D11>=C11,"Tercapai","Tidak")', '=IF(G11>=0.3,"Tinggi","Standar")'],
    ['PRJ-05', 'Franchise Partner', 400000000, 380000000, 285000000, '=D12-E12', '=F12/D12', '=IF(D12>=C12,"Tercapai","Tidak")', '=IF(G12>=0.3,"Tinggi","Standar")'],
    ['TOTAL KONSOLIDASI', '', '=SUM(C8:C12)', '=SUM(D8:D12)', '=SUM(E8:E12)', '=SUM(F8:F12)', '=F13/D13', '', ''],
    [''],
    ['RINGKASAN METRIK KPI EKSEKUTIF (FORMULA KHUSUS):'],
    ['Metrik Analisis', 'Nilai Formula', 'Formula yang Digunakan'],
    ['Total Target Nasional:', '=SUM(C8:C12)', 'SUM(C8:C12)'],
    ['Total Realisasi Nasional:', '=SUM(D8:D12)', 'SUM(D8:D12)'],
    ['Rata-rata Margin Laba Kotor:', '=AVERAGE(G8:G12)', 'AVERAGE(G8:G12)'],
    ['Jumlah Divisi Capai Target:', '=COUNTIF(H8:H12, "Tercapai")', 'COUNTIF(H8:H12, "Tercapai")'],
    ['Total Penjualan Divisi Capai Target:', '=SUMIF(H8:H12, "Tercapai", D8:D12)', 'SUMIF(H8:H12, "Tercapai", D8:D12)']
  ];
  const ws7 = XLSX.utils.aoa_to_sheet(s7Data);
  ws7['!cols'] = [{ wch: 14 }, { wch: 20 }, { wch: 22 }, { wch: 24 }, { wch: 20 }, { wch: 22 }, { wch: 16 }, { wch: 20 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, ws7, 'Proyek Akhir');

  // SHEET 8: Kunci Jawaban & Benchmark
  const s8Data = [
    ['PANDUAN MODEL JAWABAN & FORMULA BENCHMARK (UNTUK EVALUASI MANDIRI)'],
    ['Gunakan daftar formula di bawah ini untuk memverifikasi kebenaran kalkulasi Anda.'],
    [''],
    ['Sheet Referensi', 'Lokasi Sel / Kasus', 'Formula Standar (Regional US: Koma)', 'Formula Alternatif (Regional Indo: Titik-Koma)', 'Penjelasan Cara Kerja'],
    ['Latihan Dasar', 'Subtotal (E6)', '=C6*D6', '=C6*D6', 'Perkalian sederhana Harga Satuan x Jumlah.'],
    ['Latihan Dasar', 'PPN 11% (G6)', '=(E6-F6)*$B$3', '=(E6-F6)*$B$3', 'Mengunci sel tarif PPN $B$3 secara absolut agar tidak bergeser saat disalin.'],
    ['Logika & Teks', 'Nama Bersih (E5)', '=PROPER(TRIM(B5))', '=PROPER(TRIM(B5))', 'TRIM membuang spasi berlebih, PROPER membuat huruf kapital di awal setiap kata.'],
    ['Logika & Teks', 'Bonus Karyawan (G5)', '=IF(AND(C5>=100000000, D5>=0.9), 0.15, IF(C5>=80000000, 0.075, 0))', '=IF(AND(C5>=100000000; D5>=0.9); 0.15; IF(C5>=80000000; 0.075; 0))', 'Nested IF dengan logika AND untuk mengevaluasi dua syarat sekaligus.'],
    ['Lookup & Referensi', 'VLOOKUP Nama (D12)', '=VLOOKUP(B12, A4:F9, 2, FALSE)', '=VLOOKUP(B12; A4:F9; 2; FALSE)', 'Mencari kode B12 di kolom 1 tabel A4:F9, mengembalikan kolom ke-2.'],
    ['Lookup & Referensi', 'INDEX MATCH Kiri (D17)', '=INDEX(A4:A9, MATCH(B17, B4:B9, 0))', '=INDEX(A4:A9; MATCH(B17; B4:B9; 0))', 'Mencari posisi nama barang di B4:B9 lalu mengambil kode barang di A4:A9 (arah kiri).'],
    ['Lookup & Referensi', 'XLOOKUP (Excel 2021)', '=XLOOKUP(B21, A4:A9, B4:B9, "Tidak Ada")', '=XLOOKUP(B21; A4:A9; B4:B9; "Tidak Ada")', 'Fungsi modern Excel 2021 dengan penanganan error bawaan tanpa perlu IFERROR.'],
    ['Lookup & Referensi', 'Excel 2019 Error Wrap', '=IFERROR(VLOOKUP(B21, A4:F9, 2, FALSE), "Tidak Ada")', '=IFERROR(VLOOKUP(B21; A4:F9; 2; FALSE); "Tidak Ada")', 'Solusi kompatibel Excel 2019 untuk menangkap nilai #N/A dan menggantinya dengan pesan ramah.'],
    ['Proyek Akhir', 'KPI Realisasi Tercapai', '=SUMIF(H8:H12, "Tercapai", D8:D12)', '=SUMIF(H8:H12; "Tercapai"; D8:D12)', 'Menjumlahkan realisasi penjualan hanya untuk divisi yang statusnya "Tercapai".']
  ];
  const ws8 = XLSX.utils.aoa_to_sheet(s8Data);
  ws8['!cols'] = [{ wch: 18 }, { wch: 22 }, { wch: 38 }, { wch: 38 }, { wch: 45 }];
  XLSX.utils.book_append_sheet(wb, ws8, 'Kunci Jawaban');

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
  return buf;
}

if (require.main === module) {
  const buf = createWorkbook();
  fs.writeFileSync('Workbook_Latihan_Excel_Masterclass.xlsx', buf);
  console.log(`Workbook generated successfully: ${buf.length} bytes`);
}

module.exports = { createWorkbook };
