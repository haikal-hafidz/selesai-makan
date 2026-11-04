// scripts/build_excel_pack.cjs
const fs = require('fs');
const path = require('path');
const { createWorkbook } = require('./create_workbook.cjs');

console.log('Generating Excel workbook binary...');
const workbookBuffer = createWorkbook();
const workbookBase64 = workbookBuffer.toString('base64');
const workbookDataUri = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${workbookBase64}`;

console.log(`Workbook generated. Base64 length: ${workbookBase64.length}`);

// Define 12 Comprehensive Chapters covering Level 1 to Level 6
const chapters = [
  // LEVEL 1: BEGINNER
  {
    title: 'Bab 1: Pengenalan Microsoft Excel, Navigasi Interface & Struktur Workbook',
    description: 'Fondasi penting memahami ekosistem Microsoft Excel 2019/2021, arsitektur lembar kerja, dan tata letak pita ribbon.',
    order: 1,
    lessons: [
      {
        title: 'Pelajaran 1.1: Memahami Lembar Kerja, Pita Ribbon, dan Anatomi Sel',
        content: `### 1. Tujuan Pembelajaran
Memahami anatomi antarmuka Microsoft Excel 2019 dan 2021, navigasi baris/kolom, serta manajemen lembar kerja (worksheet).

### 2. Penjelasan Konsep
Microsoft Excel adalah aplikasi spreadsheet grid berbasis baris (1 hingga 1.048.576) dan kolom (A hingga XFD = 16.384 kolom). Pertemuan antara kolom dan baris disebut **Sel** (contoh: Sel B4 mengacu pada Kolom B Baris 4).

Komponen utama antarmuka Excel:
1. **Ribbon Menu**: Tab berisikan kumpulan perintah terkelompok (Home, Insert, Page Layout, Formulas, Data, Review, View).
2. **Formula Bar**: Menampilkan formula aktif atau nilai sebenarnya yang tersimpan di dalam sel.
3. **Name Box**: Menampilkan alamat sel aktif atau rentang bernama (Named Range).
4. **Sheet Tab**: Lembar kerja individual di dalam satu berkas workbook (.xlsx).

### 3. Langkah Demi Langkah Praktik
1. Buka Microsoft Excel di sistem operasi Windows Anda.
2. Gunakan tombol panah pada keyboard untuk berpindah antarsel, atau tekan \`Ctrl + Tombol Panah Bawah\` untuk melompat ke baris terakhir data.
3. Klik ganda pada tab lembar kerja di bagian bawah untuk mengubah namanya menjadi "Data_Penjualan".

### 4. Kompatibilitas Versi (Excel 2019 vs 2021)
Tata letak Ribbon dan arsitektur sel pada Excel 2019 dan 2021 identik. Pada Excel 2021 terdapat penyegaran visual (Monet Fluent Design) dengan sudut tombol lebih halus, namun letak seluruh menu utama tetap sama.

### 5. Kesalahan Umum & Solusi
- **Keliru mengedit isi rumus**: Mengetik langsung di atas sel akan menimpa seluruh teks. Solusi: Tekan tombol **F2** pada keyboard untuk masuk ke mode edit sel.`,
        learningObjectives: [
          'Mengidentifikasi elemen antarmuka Microsoft Excel (Ribbon, Formula Bar, Name Box).',
          'Melakukan navigasi sel secara efisien menggunakan pintasan keyboard.',
          'Mengelola lembar kerja (menambah, mengganti nama, memindahkan sheet).'
        ],
        keyTakeaways: [
          'Excel memiliki kapasitas 1.048.576 baris dan 16.384 kolom.',
          'Gunakan F2 untuk mengedit sel tanpa menimpa data yang sudah ada.',
          'Pintasan Ctrl + Panah mempercepat navigasi pada kumpulan data besar.'
        ],
        exercises: [
          'Buka workbook latihan pada sheet "Roadmap & Panduan".',
          'Gunakan tombol F2 untuk membaca isi catatan sel.',
          'Lakukan navigasi antarsheet menggunakan pintasan Ctrl + Page Down.'
        ],
        quiz: {
          title: 'Kuis Evaluasi Pelajaran 1.1: Navigasi Antarmuka Excel',
          questions: [
            {
              prompt: 'Berapakah jumlah baris maksimum yang didukung dalam satu worksheet Microsoft Excel format .xlsx?',
              options: ['65.536 baris', '1.048.576 baris', '500.000 baris', '16.384 baris'],
              correctOptionIndex: 1,
              explanation: 'Sejak format Excel OpenXML (.xlsx) diperkenalkan, kapasitas lembar kerja adalah 1.048.576 baris dan 16.384 kolom.'
            },
            {
              prompt: 'Tombol fungsi keyboard manakah yang digunakan untuk mengedit isi sel aktif tanpa menghapus isinya?',
              options: ['F1', 'F2', 'F4', 'F5'],
              correctOptionIndex: 1,
              explanation: 'Tombol F2 mengaktifkan mode pengeditan (Edit Mode) langsung pada sel aktif atau Formula Bar.'
            }
          ]
        }
      },
      {
        title: 'Pelajaran 1.2: Tipe Data Excel, Entri Data, dan Format Angka',
        content: `### 1. Tujuan Pembelajaran
Membedakan tipe data teks, angka, tanggal, dan boolean serta menerapkan format angka (Number Formatting) yang tepat.

### 2. Penjelasan Konsep
Excel mengenali data dalam beberapa tipe dasar:
- **Teks (String)**: Secara default rata kiri.
- **Angka (Numeric)**: Secara default rata kanan.
- **Tanggal (Date)**: Sebenarnya adalah angka serial urut (nomor 1 mewakili 1 Januari 1900).
- **Logika (Boolean)**: Nilai TRUE atau FALSE (rata tengah).

Format Angka (**Number Formatting**) mengubah representasi visual angka di layar tanpa mengubah nilai matematis aslinya.
Contoh: Nilai asli \`150000\` diformat menjadi \`Rp 150.000\` atau \`$150,000.00\`.

### 3. Sintaks Format Kustom (Custom Number Format)
Struktur format kustom Excel terdiri dari 4 bagian yang dipisahkan titik koma:
\`Positif; Negatif; Nol; Teks\`
Contoh kode format:
\`_(\"Rp\"* #,##0_);_(\"Rp\"* (#,##0);_(\"Rp\"* \"-\"_);_(@_)\`

### 4. Kesalahan Umum
- Mengetik simbol "Rp" atau titik ribuan secara manual di dalam sel: Ini mengubah angka menjadi teks sehingga tidak bisa dijumlahkan dengan rumus matematis!
- Gunakan fitur Number Formatting (Ctrl + 1 -> Number -> Currency / Accounting).`,
        learningObjectives: [
          'Membedakan perilaku perataan default untuk data angka, teks, dan boolean.',
          'Menerapkan format mata uang (Accounting vs Currency) dengan benar.',
          'Memahami konsep serial number pada kalkulasi tanggal Excel.'
        ],
        keyTakeaways: [
          'Jangan pernah mengetik huruf atau simbol mata uang manual ke dalam sel angka.',
          'Tekan Ctrl + 1 untuk membuka kotak dialog Format Cells lengkap.',
          'Format tampilan tidak mengubah angka asli di memori kalkulasi.'
        ],
        exercises: [
          'Pilih kolom angka pada sheet "Latihan Dasar" dan terapkan format Akuntansi Rupiah.',
          'Ubah format tanggal dari format US ke format baku Indonesia (DD/MM/YYYY).'
        ]
      }
    ]
  },
  {
    title: 'Bab 2: Fondasi Formula, Hirarki Operasi & Referensi Sel ($A$1)',
    description: 'Memahami cara kerja mesin kalkulasi Excel, urutan operasi matematika, dan penguasaan mutlak referensi relatif, absolut, dan campuran.',
    order: 2,
    lessons: [
      {
        title: 'Pelajaran 2.1: Operator Matematika dan Hirarki Perhitungan (PEMDAS)',
        content: `### 1. Tujuan Pembelajaran
Menyusun formula matematis yang akurat dengan mengindahkan aturan urutan pengerjaan operasi matematika (PEMDAS / BODMAS).

### 2. Penjelasan Konsep
Setiap formula di Microsoft Excel **wajib diawali dengan tanda sama dengan (\`=\`)**.
Hirarki kalkulasi Excel:
1. **Kurung \`()\`**: Bagian dalam tanda kurung selalu dikerjakan pertama kali.
2. **Pangkat \`^\`**: Operasi eksponensial (contoh: \`2^3 = 8\`).
3. **Perkalian \`*\` dan Pembagian \`/\`**: Dikerjakan dari kiri ke kanan.
4. **Penjumlahan \`+\` dan Pengurangan \`-\`**: Dikerjakan dari kiri ke kanan.

### 3. Contoh Kasus Kesalahan Hirarki
Jika Anda ingin menghitung rata-rata nilai dari sel A1=80 dan B1=90:
- Rumus **Salah**: \`=A1 + B1 / 2\` -> Hasilnya \`80 + 45 = 125\` (karena pembagian didahulukan!).
- Rumus **Benar**: \`=(A1 + B1) / 2\` -> Hasilnya \`170 / 2 = 85\`.`,
        learningObjectives: [
          'Menyusun formula matematis dasar di Excel (+, -, *, /, ^).',
          'Menerapkan tanda kurung untuk mengontrol urutan kalkulasi.'
        ],
        exercises: [
          'Buka sheet "Latihan Dasar" di workbook latihan.',
          'Hitung Subtotal pada kolom E dengan formula =C6*D6.'
        ]
      },
      {
        title: 'Pelajaran 2.2: Referensi Sel Relatif, Absolut ($A$1), dan Campuran ($A1 / A$1)',
        content: `### 1. Tujuan Pembelajaran
Menguasai secara mendalam perbedaan sel relatif, absolut, dan campuran menggunakan tombol pintasan F4.

### 2. Penjelasan Konsep
Saat Anda menyalin (copy) atau menyeret (AutoFill) rumus ke baris atau kolom lain:
- **Referensi Relatif (\`A1\`)**: Alamat kolom dan baris akan bergeser mengikuti arah penyalinan.
- **Referensi Absolut (\`$A$1\`)**: Tanda dollar (\`$\`) mengunci kolom A dan baris 1 secara mutlak. Alamat tidak akan pernah berubah saat disalin.
- **Referensi Campuran (\`$A1\`)**: Kolom A terkunci, baris bebas bergeser (cocok untuk tabel perkalian vertikal).
- **Referensi Campuran (\`A$1\`)**: Baris 1 terkunci, kolom bebas bergeser (cocok untuk baris header tarif).

### 3. Tips Cepat Tombol F4
Letakkan kursor rumus pada alamat sel lalu tekan tombol **F4** berulang kali:
- Tekan 1x: \`A1\` -> \`$A$1\` (Absolut Penuh)
- Tekan 2x: \`$A$1\` -> \`A$1\` (Absolut Baris)
- Tekan 3x: \`A$1\` -> \`$A1\` (Absolut Kolom)
- Tekan 4x: \`$A1\` -> \`A1\` (Kembali Relatif)`,
        learningObjectives: [
          'Memahami pergeseran koordinat sel saat formula disalin.',
          'Mengunci sel tarif/parameter menggunakan simbol dollar ($).',
          'Menggunakan tombol F4 untuk beralih tipe referensi.'
        ],
        exercises: [
          'Pada sheet "Latihan Dasar", hitung kolom PPN dengan rumus =(E6-F6)*$B$3 di mana $B$3 adalah sel tarif PPN 11%.',
          'Salin rumus ke baris 7 sampai 11 dan pastikan referensi $B$3 tidak bergeser.'
        ],
        assignments: [
          {
            title: 'Tugas Praktik Mandiri: Kalkulasi Penjualan & Pajak',
            description: 'Selesaikan seluruh kolom Subtotal, Diskon Volume, PPN 11%, dan Total Akhir pada sheet "Latihan Dasar" di file Excel yang disediakan.',
            instructions: [
              'Buka berkas "Workbook_Latihan_Excel_Masterclass.xlsx" pada sheet "Latihan Dasar".',
              'Tuliskan formula Subtotal pada sel E6 menggunakan perkalian Harga Satuan (C6) dan Jumlah (D6).',
              'Tuliskan formula Diskon Volume di sel F6 menggunakan =IF(D6>=10, E6*$E$3, 0).',
              'Tuliskan formula PPN di sel G6 dengan mengalikan (E6-F6) dengan sel tarif absolut $B$3.',
              'Hitung Total Akhir di sel H6 dengan menjumlahkan Subtotal dikurangi Diskon ditambah PPN.',
              'Salin formula ke baris 7 hingga 11.'
            ],
            submissionType: 'spreadsheet',
            evaluationMethod: 'rubric',
            rubric: [
              { criteria: 'Akurasi Referensi Absolut $B$3', points: 40, description: 'Sel tarif PPN dikunci secara tepat menggunakan simbol $' },
              { criteria: 'Kebenaran Hirarki Formula', points: 30, description: 'Pengurangan diskon dilakukan sebelum pengalian PPN menggunakan tanda kurung' },
              { criteria: 'Kelengkapan Ringkasan Total', points: 30, description: 'Baris SUM, AVERAGE, MIN, MAX terisi lengkap dan dinamis' }
            ],
            answerKey: 'Subtotal: =C6*D6; Diskon: =IF(D6>=10, E6*$E$3, 0); PPN: =(E6-F6)*$B$3; Total: =E6-F6+G6. Ringkasan Total menggunakan =SUM(H6:H11).',
            attachmentResourceNames: ['Workbook_Latihan_Excel_Masterclass.xlsx']
          }
        ]
      }
    ]
  },

  // LEVEL 2: ELEMENTARY
  {
    title: 'Bab 3: Fungsi Agregasi Dasar & Statistika Deskriptif (SUM, AVERAGE, MIN, MAX, COUNT)',
    description: 'Menguasai kelompok fungsi agregasi inti untuk menghitung ringkasan data finansial, inventaris, dan operasional.',
    order: 3,
    lessons: [
      {
        title: 'Pelajaran 3.1: Keluarga Fungsi Agregasi (SUM, AVERAGE, COUNT, COUNTA)',
        content: `### 1. Sintaks dan Argumen
- \`=SUM(number1, [number2], ...)\`: Menjumlahkan seluruh angka dalam rentang.
- \`=AVERAGE(number1, [number2], ...)\`: Menghitung rata-rata aritmatika dari rentang angka.
- \`=COUNT(value1, [value2], ...)\`: Menghitung jumlah sel yang HANYA berisi angka.
- \`=COUNTA(value1, [value2], ...)\`: Menghitung jumlah sel yang TIDAK KOSONG (berisi angka, teks, atau error).
- \`=COUNTBLANK(range)\`: Menghitung jumlah sel kosong.

### 2. Perbedaan Krusial COUNT vs COUNTA
Misalkan rentang A1:A4 berisi data:
- A1: 15000 (Angka)
- A2: "Belum Bayar" (Teks)
- A3: (Kosong)
- A4: 25000 (Angka)

Hasil fungsi:
- \`=COUNT(A1:A4)\` menghasilkan **2** (hanya sel A1 dan A4 yang dihitung).
- \`=COUNTA(A1:A4)\` menghasilkan **3** (sel A1, A2, dan A4 dihitung karena tidak kosong).

### 3. Pemisah Argumen (Koma vs Titik Koma)
- **Windows Regional Setting English (US)**: Menggunakan koma \`,\` contoh: \`=SUM(A1, B1, C1)\`.
- **Windows Regional Setting Indonesia**: Menggunakan titik-koma \`;\` contoh: \`=SUM(A1; B1; C1)\`.`,
        learningObjectives: [
          'Menggunakan SUM dan AVERAGE pada rentang sel multikolom/baris.',
          'Memilih antara COUNT dan COUNTA berdasarkan tipe data target.'
        ],
        exercises: [
          'Pada sheet "Latihan Dasar", hitung TOTAL dengan =SUM(H6:H11).',
          'Hitung Rata-rata Penjualan dengan =AVERAGE(H6:H11).',
          'Hitung Total Transaksi dengan =COUNTA(A6:A11).'
        ]
      },
      {
        title: 'Pelajaran 3.2: Pembulatan Angka Matematis (ROUND, ROUNDUP, ROUNDDOWN)',
        content: `### 1. Sintaks dan Argumen
- \`=ROUND(number, num_digits)\`: Membulatkan ke digit terdekat (>=5 naik ke atas, <5 turun ke bawah).
- \`=ROUNDUP(number, num_digits)\`: Selalu membulatkan ke atas menjauhi nol.
- \`=ROUNDDOWN(number, num_digits)\`: Selalu membulatkan ke bawah mendekati nol.

### 2. Memahami Argumen num_digits
- \`num_digits > 0\`: Pembulatan desimal di belakang koma. Contoh \`=ROUND(125.456, 2)\` -> \`125.46\`.
- \`num_digits = 0\`: Pembulatan ke bilangan bulat terdekat. Contoh \`=ROUND(125.456, 0)\` -> \`125\`.
- \`num_digits < 0\`: Pembulatan ke puluhan, ratusan, atau ribuan terdekat!
  - \`=ROUND(12450, -2)\` -> \`12500\` (ke ratusan terdekat).
  - \`=ROUNDDOWN(12999, -3)\` -> \`12000\` (ke ribuan ke bawah).`,
        learningObjectives: [
          'Menerapkan pembulatan presisi pada laporan keuangan.',
          'Menggunakan digit negatif untuk pembulatan puluhan/ratusan/ribuan.'
        ],
        exercises: [
          'Terapkan ROUNDUP pada perhitungan tarif pengiriman logistik.',
          'Gunakan num_digits = -3 untuk membulatkan nilai pajak ke ribuan terdekat.'
        ]
      }
    ]
  },
  {
    title: 'Bab 4: Logika Kondisional Inti (IF Tunggal, IF Bertingkat, AND, OR)',
    description: 'Membangun alur keputusan cerdas pada spreadsheet untuk menghitung diskon, evaluasi kinerja, dan audit kepatuhan.',
    order: 4,
    lessons: [
      {
        title: 'Pelajaran 4.1: Logika Keputusan IF Tunggal dan Operator Perbandingan',
        content: `### 1. Sintaks dan Argumen
\`=IF(logical_test, [value_if_true], [value_if_false])\`

- **logical_test** (Wajib): Kondisi atau ekspresi yang bernilai TRUE atau FALSE.
- **value_if_true** (Opsional): Nilai atau tindakan yang dieksekusi jika kondisi bernilai BENAR.
- **value_if_false** (Opsional): Nilai atau tindakan yang dieksekusi jika kondisi bernilai SALAH.

### 2. Operator Perbandingan Excel
- \`=\` : Sama dengan
- \`<>\` : Tidak sama dengan
- \`>\` : Lebih besar dari
- \`>=\` : Lebih besar atau sama dengan
- \`<\` : Lebih kecil dari
- \`<=\` : Lebih kecil atau sama dengan

### 3. Contoh Praktik Nyata
Menentukan kelulusan nilai ujian di sel B2 (Ambang batas 75):
\`=IF(B2>=75, "LULUS", "REMEDIAL")\`

Peringatan Teks: Jangan lupa mengapit nilai output teks dengan tanda petik ganda (\`"..."\`). Jika angka, tidak perlu tanda petik.`,
        learningObjectives: [
          'Menyusun formula IF dengan logika perbandingan matematis.',
          'Menghindari kesalahan tipe data output numerik versus string.'
        ],
        exercises: [
          'Buka sheet "Logika & Teks".',
          'Pada kolom Status Target (F5), tulis formula =IF(C5>=100000000, "Tercapai", "Di Bawah Target").'
        ]
      },
      {
        title: 'Pelajaran 4.2: Logika Majemuk (AND, OR) dan Nested IF (IF Bertingkat)',
        content: `### 1. Fungsi AND dan OR
- \`=AND(logical1, [logical2], ...)\`: Menghasilkan TRUE jika **SEMUA** syarat terpenuhi.
- \`=OR(logical1, [logical2], ...)\`: Menghasilkan TRUE jika **SALAH SATU** syarat terpenuhi.

### 2. Sintaks Kombinasi IF dengan AND
Memberikan bonus 15% jika Realisasi Penjualan >= 100 Juta DAN Kehadiran >= 90%:
\`=IF(AND(C5>=100000000, D5>=0.9), 0.15, 0)\`

### 3. Nested IF (IF di dalam IF)
Untuk mengevaluasi lebih dari dua cabang kondisi di Excel 2019/2021:
\`=IF(AND(C5>=100000000, D5>=0.9), 0.15, IF(C5>=80000000, 0.075, 0))\`

Alur evaluasi:
1. Periksa apakah C5 >= 100jt dan D5 >= 90%. Jika Ya -> 0.15 (Selesai).
2. Jika Tidak, periksa syarat kedua: apakah C5 >= 80jt? Jika Ya -> 0.075.
3. Jika tidak satupun terpenuhi -> 0.`,
        learningObjectives: [
          'Menggabungkan fungsi AND dan OR di dalam logical test fungsi IF.',
          'Menyusun hierarki pengujian bertingkat (Nested IF) tanpa terjadi tumpang tindih logika.'
        ],
        exercises: [
          'Pada sheet "Logika & Teks", hitung Persentase Bonus karyawan di kolom G dengan Nested IF.',
          'Hitung Nominal Bonus di kolom H dengan mengalikan Pencapaian (Kolom C) dengan Persentase Bonus (Kolom G).'
        ],
        quiz: {
          title: 'Kuis Evaluasi Pelajaran 4.2: Logika IF, AND, OR',
          questions: [
            {
              prompt: 'Formula manakah yang menghasilkan TRUE jika nilai sel A1 lebih besar dari 50 DAN nilai B1 sama dengan "LUNAS"?',
              options: [
                '=IF(A1>50, B1="LUNAS")',
                '=AND(A1>50, B1="LUNAS")',
                '=OR(A1>50, B1="LUNAS")',
                '=SUM(A1>50, B1="LUNAS")'
              ],
              correctOptionIndex: 1,
              explanation: 'Fungsi AND menguji seluruh argumen logika dan hanya menghasilkan TRUE apabila semua kondisi bernilai benar.'
            }
          ]
        }
      }
    ]
  },
  {
    title: 'Bab 5: Manipulasi Teks, Pembersihan Data & Formula Tanggal/Waktu',
    description: 'Teknik membersihkan data kotor hasil ekspor sistem, ekstraksi kode SKU, standarisasi teks, dan kalkulasi selisih hari/jam.',
    order: 5,
    lessons: [
      {
        title: 'Pelajaran 5.1: Pembersihan Teks (TRIM, PROPER, UPPER, LOWER, CONCAT)',
        content: `### 1. Fungsi Pembersihan Spasi dan Huruf
- \`=TRIM(text)\`: Menghilangkan semua spasi berlebih di awal, di akhir, dan spasi ganda di tengah teks (hanya menyisakan 1 spasi pemisah tunggal).
- \`=PROPER(text)\`: Mengubah huruf pertama setiap kata menjadi huruf kapital (Title Case).
- \`=UPPER(text)\`: Mengubah semua huruf menjadi huruf besar (UPPERCASE).
- \`=LOWER(text)\`: Mengubah semua huruf menjadi huruf kecil (lowercase).

### 2. Menggabungkan Teks (CONCATENATE vs CONCAT vs Ampersand &)
- Operator \`&\`: \`=A2 & " " & B2\` (Bekerja di semua versi Excel sepanjang masa).
- \`=CONCAT(text1, [text2], ...)\`: Fungsi modern pengganti CONCATENATE yang mendukung penggabungan rentang sel (misal: \`=CONCAT(A1:D1)\`). Didukung penuh di Excel 2019 dan 2021.`,
        learningObjectives: [
          'Membersihkan spasi acak hasil ekspor software akuntansi menggunakan TRIM.',
          'Menyeragamkan format penulisan nama orang atau badan usaha menggunakan PROPER.'
        ],
        exercises: [
          'Pada sheet "Logika & Teks" sel E5, bersihkan nama karyawan yang kotor menggunakan =PROPER(TRIM(B5)).'
        ]
      },
      {
        title: 'Pelajaran 5.2: Ekstraksi Teks (LEFT, RIGHT, MID, LEN, FIND)',
        content: `### 1. Sintaks Fungsi Ekstraksi
- \`=LEFT(text, [num_chars])\`: Mengambil sejumlah karakter dari sisi paling kiri.
- \`=RIGHT(text, [num_chars])\`: Mengambil sejumlah karakter dari sisi paling kanan.
- \`=MID(text, start_num, num_chars)\`: Mengambil karakter dari posisi tengah tertentu sebanyak panjang yang ditentukan.
- \`=LEN(text)\`: Menghitung total jumlah karakter (termasuk spasi dan tanda baca).

### 2. Contoh Ekstraksi Kode Serial
Diberikan kode produk di sel A13: \`LAP-2022-0941\`
- Mengambil kategori (3 huruf pertama): \`=LEFT(A13, 3)\` -> Hasil: \`LAP\`
- Mengambil tahun (mulai karakter ke-5 sepanjang 4 digit): \`=MID(A13, 5, 4)\` -> Hasil: \`2022\`
- Mengambil nomor urut (4 digit terakhir): \`=RIGHT(A13, 4)\` -> Hasil: \`0941\``,
        learningObjectives: [
          'Membedah kode transaksi, nomor induk karyawan, atau nomor telepon berdasarkan posisi karakter.'
        ],
        exercises: [
          'Buka sheet "Logika & Teks" bagian Kasus 2.',
          'Isi kolom Kategori, Tahun, Nomor Urut, dan Panjang Karakter menggunakan LEFT, MID, RIGHT, dan LEN.'
        ]
      },
      {
        title: 'Pelajaran 5.3: Kalkulasi Tanggal & Waktu (TODAY, NOW, DATEDIF, EDATE, EOMONTH)',
        content: `### 1. Tanggal Dinamis dan Serial Number
- \`=TODAY()\`: Menghasilkan tanggal hari ini (tanpa jam). Otomatis diperbarui saat lembar kerja dikalkulasi.
- \`=NOW()\`: Menghasilkan tanggal dan jam detik saat ini.
- \`=DATE(year, month, day)\`: Membentuk tanggal resmi dari angka tahun, bulan, dan tanggal terpisah.

### 2. Tanggal Jatuh Tempo & Akhir Bulan
- \`=EDATE(start_date, months)\`: Menghasilkan tanggal persis sekian bulan sebelum/setelah tanggal awal. Contoh: \`=EDATE("2023-01-15", 3)\` -> 15 April 2023.
- \`=EOMONTH(start_date, months)\`: Menghasilkan tanggal hari terakhir dari bulan yang dituju. Contoh: \`=EOMONTH("2023-01-15", 0)\` -> 31 Januari 2023. Sangat berguna untuk tanggal penagihan invoice.`,
        learningObjectives: [
          'Menghitung umur piutang dan jadwal jatuh tempo pembayaran menggunakan EDATE dan EOMONTH.'
        ],
        exercises: [
          'Hitung selisih hari keterlambatan invoice dengan formula =TODAY() - Tanggal_Invoice.'
        ]
      }
    ]
  },

  // LEVEL 3: INTERMEDIATE
  {
    title: 'Bab 6: Kalkulasi Bersyarat Lanjutan (SUMIF, SUMIFS, COUNTIF, COUNTIFS, AVERAGEIFS)',
    description: 'Menghitung total, frekuensi kemunculan, dan rata-rata data berdasarkan satu kriteria atau multi-kriteria kriteria spesifik.',
    order: 6,
    lessons: [
      {
        title: 'Pelajaran 6.1: Menghitung Berdasarkan Kriteria Tunggal (SUMIF, COUNTIF)',
        content: `### 1. Sintaks SUMIF dan COUNTIF
- \`=COUNTIF(range, criteria)\`
- \`=SUMIF(range, criteria, [sum_range])\`

Perhatikan urutan argumen SUMIF:
1. **range**: Rentang sel yang akan diuji terhadap kriteria (contoh: Kolom Kategori).
2. **criteria**: Syarat yang harus dipenuhi (contoh: \`"Elektronik"\` atau \`">100000"\`).
3. **sum_range**: Rentang sel angka yang akan dijumlahkan jika syarat terpenuhi.

### 2. Penggunaan Karakter Wildcard (* dan ?)
- Tanda bintang \`*\`: Mewakili karakter teks apapun dalam jumlah berapapun. Contoh: \`"PT*"\` mencakup semua teks yang diawali kata PT.
- Tanda tanya \`?\`: Mewakili tepat 1 karakter sembarang.`,
        learningObjectives: [
          'Menghitung jumlah transaksi per kategori dengan COUNTIF.',
          'Menjumlahkan total omset penjualan per cabang dengan SUMIF.'
        ],
        exercises: [
          'Pada sheet "Proyek Akhir", hitung Jumlah Divisi Capai Target menggunakan =COUNTIF(H8:H12, "Tercapai").',
          'Hitung Total Penjualan Divisi Capai Target menggunakan =SUMIF(H8:H12, "Tercapai", D8:D12).'
        ]
      },
      {
        title: 'Pelajaran 6.2: Kalkulasi Multi-Kriteria Kompleks (SUMIFS, COUNTIFS, AVERAGEIFS)',
        content: `### 1. Urutan Argumen SUMIFS (Berbeda dengan SUMIF!)
Pada **SUMIFS**, rentang penjumlahan (\`sum_range\`) berada di **URUTAN PERTAMA**!
Sintaks:
\`=SUMIFS(sum_range, criteria_range1, criteria1, [criteria_range2, criteria2], ...)\`

### 2. Contoh Penggunaan Nyata
Menjumlahkan omset dari:
- Wilayah = \`"Jabodetabek"\`
- Kategori = \`"Elektronik"\`
- Tanggal >= \`2023-01-01\`

\`=SUMIFS(I6:I55, D6:D55, "Jabodetabek", E6:E55, "Elektronik")\``,
        learningObjectives: [
          'Menyusun formula agregasi kondisional multi-parameter tanpa kesalahan urutan argumen.'
        ],
        exercises: [
          'Buka sheet "Pivot & Visualisasi".',
          'Gunakan SUMIFS untuk menghitung total penjualan sales rep "Bella Safitri" khusus di wilayah "Jawa Barat".'
        ]
      }
    ]
  },
  {
    title: 'Bab 7: Penguasaan Lookup & Pencarian Data (VLOOKUP, HLOOKUP, INDEX MATCH, XLOOKUP)',
    description: 'Evolusi teknik pencarian vertikal, horizontal, fleksibilitas dua arah INDEX & MATCH, dan keunggulan XLOOKUP di Excel 2021 beserta alternatif Excel 2019.',
    order: 7,
    lessons: [
      {
        title: 'Pelajaran 7.1: VLOOKUP Klasik dan Penanganan Nilai Error (#N/A) dengan IFERROR',
        content: `### 1. Sintaks VLOOKUP
\`=VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])\`

Aturan Emas VLOOKUP:
1. **Nilai kunci (\`lookup_value\`) WAJIB berada di kolom paling pertama (kolom kiri) dari rentang \`table_array\`**.
2. **\`range_lookup\` hampir selalu FALSE / 0** untuk pencarian data pasti (Exact Match).
3. VLOOKUP **TIDAK BISA** mencari data ke arah kiri!

### 2. Menjinakkan Error dengan IFERROR (Kompatibel Excel 2019 & 2021)
Jika kode barang tidak ada di tabel referensi, VLOOKUP memunculkan \`#N/A\`.
Gunakan \`IFERROR\` untuk menyamarkannya dengan pesan komunikatif:
\`=IFERROR(VLOOKUP(B12, A4:F9, 2, FALSE), "Kode Tidak Ditemukan")\``,
        learningObjectives: [
          'Menerapkan VLOOKUP Exact Match tanpa resiko data bergeser.',
          'Membungkus rumus pencarian dengan IFERROR agar laporan tetap rapi.'
        ],
        exercises: [
          'Pada sheet "Lookup & Referensi" bagian Latihan 1, cari Nama Barang, Harga Jual, dan Lokasi Rak berdasarkan Kode Produk P-003.'
        ]
      },
      {
        title: 'Pelajaran 7.2: Duet Maut INDEX dan MATCH (Pencarian Dinamis & Ke Arah Kiri)',
        content: `### 1. Mengapa INDEX & MATCH Lebih Unggul dari VLOOKUP?
1. **Dapat mencari ke arah kiri**: Kolom kunci tidak harus di kolom pertama.
2. **Aman terhadap penambahan/penghapusan kolom**: Menggunakan rentang kolom langsung, bukan angka urutan statis (\`col_index_num\`).
3. **Kinerja lebih cepat**: Mengurangi beban memori pada dataset puluhan ribu baris.

### 2. Sintaks dan Cara Kerja
- \`=MATCH(lookup_value, lookup_array, [match_type])\`: Menghasilkan posisi angka baris (misal: Baris ke-4).
- \`=INDEX(array, row_num, [column_num])\`: Mengambil isi sel pada baris ke-N dari rentang data.

Contoh Pencarian Kode Produk berdasarkan Nama Barang (Mencari ke Kiri):
\`=INDEX(A4:A9, MATCH("SSD NVMe 1TB Gen4", B4:B9, 0))\``,
        learningObjectives: [
          'Memahami konsep INDEX mengambil nilai dan MATCH mencari posisi nomor baris.',
          'Menerapkan pencarian data ke arah kiri (Left Lookup) yang tidak bisa dilakukan VLOOKUP.'
        ],
        exercises: [
          'Buka sheet "Lookup & Referensi" Latihan 2.',
          'Gunakan kombinasi INDEX dan MATCH untuk mencari Kode Produk dan Stok Gudang berdasarkan Nama Barang.'
        ]
      },
      {
        title: 'Pelajaran 7.3: XLOOKUP Modern (Excel 2021) dan Padanan Kompatibel di Excel 2019',
        content: `### 1. Mengenal Fungsi XLOOKUP (Eksklusif Excel 2021 / Microsoft 365)
Fungsi revolusioner yang menyederhanakan VLOOKUP dan INDEX MATCH menjadi satu formula ringkas.
Sintaks:
\`=XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found], [match_mode], [search_mode])\`

Keunggulan XLOOKUP:
- Secara default mencari Exact Match (tidak perlu menuliskan FALSE/0).
- Memiliki parameter bawaan \`[if_not_found]\` sehingga tidak perlu lagi rumus pembungkus IFERROR!
- Dapat mencari dari atas ke bawah atau dari bawah ke atas.

### 2. CATATAN KOMPATIBILITAS (PENTING!):
- **Excel 2021**: Mendukung penuh XLOOKUP.
- **Excel 2019**: **TIDAK MENDUKUNG** XLOOKUP! Rumus akan memunculkan error \`#NAME?\` jika dibuka di Excel 2019.
- **Solusi Kompatibel untuk Excel 2019**:
  Gunakan \`=IFERROR(INDEX(return_range, MATCH(lookup_val, lookup_range, 0)), "Pesan Error")\` atau \`=IFERROR(VLOOKUP(...), "Pesan Error")\`.`,
        learningObjectives: [
          'Menerapkan XLOOKUP di Excel 2021 dengan parameter if_not_found.',
          'Mengetahui alternatif formula padanan yang aman untuk pengguna Excel 2019.'
        ],
        exercises: [
          'Pada sheet "Lookup & Referensi" Latihan 3, uji formula XLOOKUP dan bandingkan dengan formula IFERROR(VLOOKUP) pada kasus kode tidak ditemukan.'
        ],
        quiz: {
          title: 'Kuis Evaluasi Pelajaran 7.3: Kompatibilitas Fungsi Lookup',
          questions: [
            {
              prompt: 'Apakah fungsi XLOOKUP dapat berjalan normal pada Microsoft Excel 2019 edisi retail standar?',
              options: [
                'Ya, XLOOKUP tersedia di seluruh versi Excel sejak 2016.',
                'Tidak, XLOOKUP baru tersedia mulai Excel 2021 dan Microsoft 365; di Excel 2019 akan memunculkan error #NAME?.',
                'Ya, tetapi hanya untuk pencarian angka bukan teks.',
                'Tergantung sistem operasi Windows 32-bit atau 64-bit.'
              ],
              correctOptionIndex: 1,
              explanation: 'XLOOKUP adalah fungsi modern yang diperkenalkan pada build Microsoft 365 dan disertakan pada rilis non-langganan permanen mulai Excel 2021. Pengguna Excel 2019 harus menggunakan INDEX & MATCH atau IFERROR(VLOOKUP).'
            }
          ]
        }
      }
    ]
  },

  // LEVEL 4: UPPER INTERMEDIATE
  {
    title: 'Bab 8: Tabel Resmi Excel (ListObject) & Validasi Data (Data Validation)',
    description: 'Transformasi rentang biasa menjadi Excel Official Table dengan Structured References, serta penguncian input formulir dengan Data Validation.',
    order: 8,
    lessons: [
      {
        title: 'Pelajaran 8.1: Kekuatan Excel Table (Ctrl + T) & Structured References',
        content: `### 1. Mengapa Harus Mengubah Rentang Menjadi Excel Table?
Dengan menekan **Ctrl + T**, rentang data Anda menjadi objek tabel resmi (\`ListObject\`):
1. **Dynamic Expansion**: Setiap baris data baru otomatis masuk ke dalam tabel dan formula akan meluas otomatis tanpa perlu mengubah referensi rumus!
2. **Formula Otomatis (Calculated Columns)**: Cukup tulis rumus di satu baris, seluruh baris ke bawah terisi seketika.
3. **Structured Reference**: Formula menjadi sangat mudah dibaca manusia.
   Contoh: \`=[@Jumlah]*[@HargaSatuan]\` jauh lebih jelas daripada \`=C2*D2\`.`,
        learningObjectives: [
          'Mengonversi rentang sel menjadi Excel Table resmi menggunakan tombol Ctrl + T.',
          'Membaca dan menulis formula dengan referensi terstruktur (Structured Reference).'
        ],
        exercises: [
          'Ubah dataset transaksi pada sheet "Pivot & Visualisasi" menjadi Excel Table dengan nama Tabel_Penjualan.'
        ]
      },
      {
        title: 'Pelajaran 8.2: Dropdown List & Kontrol Input dengan Data Validation',
        content: `### 1. Fungsi Data Validation
Mencegah terjadinya salah ketik (human error) seperti spasi acak atau kesalahan penulisan nama cabang.
Menu: **Data -> Data Tools -> Data Validation**.

Pilihan kriteria validasi umum:
- **List**: Menghasilkan tombol panah Drop-down menu pilihan terbatas.
- **Whole Number / Decimal**: Membatasi rentang nilai angka (misal nilai diskon antara 0% hingga 20%).
- **Date**: Membatasi tanggal transaksi hanya dalam tahun berjalan.`,
        learningObjectives: [
          'Membuat dropdown interaktif untuk pemilihan ID produk atau nama cabang.',
          'Menambahkan pesan peringatan kesalahan (Error Alert: Stop, Warning, Information).'
        ],
        exercises: [
          'Buat Data Validation bertipe List pada sel input pencarian produk.'
        ]
      }
    ]
  },
  {
    title: 'Bab 9: Analisis Data Interaktif dengan PivotTable, PivotChart & Slicers',
    description: 'Merangkum puluhan ribu baris transaksi bisnis menjadi laporan ringkas multi-dimensi dalam hitungan detik tanpa menulis satu rumus pun.',
    order: 9,
    lessons: [
      {
        title: 'Pelajaran 9.1: Arsitektur PivotTable (Rows, Columns, Values, Filters)',
        content: `### 1. Konsep Dasar PivotTable
PivotTable adalah alat analisis data paling bertenaga di Excel untuk meringkas, mengelompokkan, dan mengeksplorasi data transaksi besar.

Empat Kuadran Panel PivotTable:
1. **Filters**: Memfilter keseluruhan tabel berdasarkan kriteria global (misal: Tahun).
2. **Columns**: Menempatkan kategori data sebagai judul kolom horizontal.
3. **Rows**: Menempatkan kategori data sebagai label baris vertikal.
4. **Values**: Bidang kalkulasi angka (Sum, Count, Average, % of Column Total).

### 2. Langkah Membuat PivotTable
1. Klik salah satu sel di dalam dataset transaksi (sheet "Pivot & Visualisasi").
2. Pilih tab **Insert -> PivotTable**.
3. Tarik field **Wilayah** ke kuadran **Rows**, field **Kategori** ke kuadran **Columns**, dan field **Total Penjualan** ke kuadran **Values**.`,
        learningObjectives: [
          'Menyusun PivotTable matriks dua dimensi untuk analisis penjualan.',
          'Mengubah ringkasan angka dari Sum menjadi Average atau Count.'
        ],
        exercises: [
          'Gunakan dataset 50 baris di sheet "Pivot & Visualisasi" untuk membuat PivotTable yang menampilkan Total Penjualan per Kategori Produk.'
        ]
      },
      {
        title: 'Pelajaran 9.2: Visualisasi Dinamis dengan PivotChart dan Slicers',
        content: `### 1. PivotChart
Grafik yang terhubung langsung dengan PivotTable. Jika PivotTable difilter, grafik akan langsung beradaptasi secara real-time.

### 2. Slicers (Pemotong Data Visual)
Tombol interaktif ramah pengguna untuk menyaring data dengan satu klik.
Cara menyisipkan Slicer:
1. Klik pada area PivotTable.
2. Tab **PivotTable Analyze -> Insert Slicer**.
3. Centang field **Sales Rep** dan **Wilayah**.
4. Klik tombol slicer untuk memfilter data dan melihat grafik bergerak dinamis!`,
        learningObjectives: [
          'Menghubungkan Slicer dengan PivotTable dan PivotChart untuk dashboard sederhana.'
        ],
        exercises: [
          'Buat Slicer Wilayah dan Sales Rep pada lembar kerja analisis penjualan.'
        ]
      }
    ]
  },

  // LEVEL 5: ADVANCED
  {
    title: 'Bab 10: Ekstraksi & Transformasi Data Modern dengan Power Query (Get & Transform)',
    description: 'Automasi alur kerja pembersihan data kotor tanpa VBA menggunakan antarmuka grafis Power Query bawaan Excel 2019/2021.',
    order: 10,
    lessons: [
      {
        title: 'Pelajaran 10.1: Arsitektur Power Query & Langkah ETL (Extract, Transform, Load)',
        content: `### 1. Apa itu Power Query?
Power Query (terletak di tab **Data -> Get & Transform Data**) adalah mesin pemrosesan data mutakhir yang merekam setiap langkah pembersihan data seperti resep masakan otomatis.
Setiap kali ada data baru yang masuk, Anda cukup menekan tombol **Refresh All**, dan seluruh proses pembersihan berjalan sendiri!

### 2. Tiga Siklus ETL:
1. **Extract**: Mengambil data dari Excel Table, file CSV/Text, folder berkas, atau database.
2. **Transform**: Mengganti nama kolom, membuang baris kosong, memisah teks (Split Column), merapikan huruf (Trim/Clean/Capitalize).
3. **Load**: Memasukkan data bersih kembali ke Excel worksheet sebagai tabel baru atau ke Data Model.`,
        learningObjectives: [
          'Mengakses editor Power Query di Excel 2019 dan Excel 2021.',
          'Memahami panel Applied Steps yang merekam transformasi secara otomatis.'
        ],
        exercises: [
          'Buka sheet "Power Query & Kasus", pilih rentang data mentah dan klik Data -> From Table/Range.'
        ]
      },
      {
        title: 'Pelajaran 10.2: Kasus Nyata Transformasi Data Mentah ERP dengan Power Query',
        content: `### 1. Langkah Transformasi Praktis
Pada sheet "Power Query & Kasus", data klien memiliki banyak cacat:
1. Kolom Nama Klien memiliki spasi berlebih -> Solusi: Di Power Query klik **Transform -> Format -> Trim** dilanjutkan **Capitalize Each Word**.
2. Kolom Kontak Telepon memiliki tanda hubung dan karakter campur -> Solusi: Gunakan **Replace Values** untuk membuang tanda hubung (\`-\`) dan spasi.
3. Kolom Kota & Wilayah tergabung dengan garis miring -> Solusi: Klik **Split Column -> By Delimiter** dengan pemisah tanda garis miring (\`/\`).
4. Kolom Nilai Kontrak berisi tulisan "Rp" dan titik -> Solusi: Hapus karakter "Rp " lalu ubah tipe data menjadi Currency/Decimal Number.
5. Klik **Home -> Close & Load** untuk menyajikan data bersih ke worksheet baru.`,
        learningObjectives: [
          'Menerapkan Split Column, Trim, Replace Values, dan perubahan tipe data di Power Query.'
        ],
        exercises: [
          'Bersihkan dataset di sheet "Power Query & Kasus" hingga menghasilkan format yang identik dengan tabel target hasil transformasi.'
        ]
      }
    ]
  },
  {
    title: 'Bab 11: Dynamic Arrays & Fungsi Formula Modern (Excel 2021 vs Excel 2019)',
    description: 'Membahas revolusi Dynamic Array (Spill Behavior), fungsi FILTER, SORT, UNIQUE pada Excel 2021, serta batasan rumus CSE Legacy di Excel 2019.',
    order: 11,
    lessons: [
      {
        title: 'Pelajaran 11.1: Memahami Spill Behavior & Fungsi FILTER, SORT, UNIQUE',
        content: `### 1. Konsep Spill Range (Tumpahan Formula Dinamis)
Di Excel 2021, satu formula yang ditulis di satu sel dapat menghasilkan kumpulan hasil yang meluber ("spill") ke sel-sel di sekitarnya secara otomatis. Jika terhalang oleh data lain, akan muncul error \`#SPILL!\`.

### 2. Tiga Fungsi Array Paling Berguna di Excel 2021:
- \`=UNIQUE(array)\`: Mengambil daftar nilai unik tanpa duplikat dari sebuah kolom.
- \`=SORT(array, [sort_index], [sort_order])\`: Mengurutkan data dinamis tanpa perlu menu Sort manual.
- \`=FILTER(array, include, [if_empty])\`: Menyaring baris data berdasarkan kriteria tertentu dan menampilkannya sebagai tabel baru.

Contoh Filter Penjualan khusus kategori Elektronik:
\`=FILTER(A6:I55, E6:E55="Elektronik", "Tidak ada data")\``,
        learningObjectives: [
          'Memanfaatkan fitur Dynamic Array pada Microsoft Excel 2021.',
          'Mengkombinasikan fungsi SORT dan UNIQUE untuk membuat daftar otomatis.'
        ],
        exercises: [
          'Jika Anda menggunakan Excel 2021, tulis formula =UNIQUE(D6:D55) untuk mendapatkan daftar unik nama wilayah.'
        ]
      },
      {
        title: 'Pelajaran 11.2: Batasan Kompatibilitas Excel 2019 & Teknik Legacy Array Formula (Ctrl + Shift + Enter)',
        content: `### 1. REALITA KOMPATIBILITAS (CATATAN PENTING):
- Fungsi \`FILTER\`, \`SORT\`, \`UNIQUE\`, \`SEQUENCE\`, dan \`XMATCH\` **HANYA ADA DI EXCEL 2021** (dan Microsoft 365).
- Di **Excel 2019**, fungsi-fungsi di atas **TIDAK TERSEDIA** dan akan menghasilkan pesan error \`#NAME?\`.

### 2. Cara Kerja Excel 2019 (Legacy Array CSE):
Di Excel 2019, perhitungan array multi-sel harus dieksekusi dengan menekan tiga tombol bersamaan:
**Ctrl + Shift + Enter** (sering disingkat formula **CSE**).
Excel akan otomatis membungkus formula dengan kurung kurawal, misalnya: \`{=SUM(IF(A1:A10="X", B1:B10))}\`.
(Jangan mengetik kurung kurawal secara manual!).

Untuk membuat daftar unik di Excel 2019, gunakan menu bawaan:
**Data -> Remove Duplicates** atau gunakan **Advanced Filter (Unique Records Only)**.`,
        learningObjectives: [
          'Menghindari penggunaan fungsi Dynamic Array pada workbook yang harus dibuka oleh rekan kerja pengguna Excel 2019.',
          'Menggunakan fitur Data -> Remove Duplicates sebagai padanan fungsi UNIQUE di Excel 2019.'
        ],
        exercises: [
          'Pelajari cara membuat daftar unik di Excel 2019 menggunakan Advanced Filter.'
        ]
      }
    ]
  },

  // LEVEL 6: EXPERT AND APPLIED EXCEL
  {
    title: 'Bab 12: Audit Formula, Optimasi Kinerja Workbook & Pengenalan Otomasi Makro/VBA',
    description: 'Standar pelaporan profesional, pelacakan dependensi rumus (Trace Precedents), pencegahan error, serta prinsip dasar efisiensi workbook.',
    order: 12,
    lessons: [
      {
        title: 'Pelajaran 12.1: Alat Audit Formula (Trace Precedents, Error Checking, Evaluate Formula)',
        content: `### 1. Menu Formula Auditing
Terletak di tab **Formulas -> Formula Auditing**:
- **Trace Precedents**: Menampilkan anak panah biru yang menunjuk ke sel-sel penyusun rumus aktif.
- **Trace Dependents**: Menampilkan anak panah ke sel-sel lain yang bergantung pada nilai sel aktif.
- **Remove Arrows**: Menghapus seluruh panah penunjuk.
- **Evaluate Formula**: Menjalankan langkah perhitungan rumus tahap demi tahap seperti debug kode program. Sangat ampuh untuk membedah Nested IF yang bermasalah!

### 2. Memahami Jenis-Jenis Pesan Error Excel:
- \`#DIV/0!\`: Terjadi pembagian dengan angka nol atau sel kosong.
- \`#N/A\`: Nilai pencarian tidak ditemukan pada tabel lookup.
- \`#VALUE!\`: Terjadi ketidakcocokan tipe data (misal menjumlahkan angka dengan teks).
- \`#REF!\`: Referensi sel terhapus (misal kolom yang menjadi acuan rumus telah didelete).
- \`#NAME?\`: Salah ketik nama fungsi atau fungsi tidak didukung oleh versi Excel tersebut.`,
        learningObjectives: [
          'Melacak sumber kesalahan kalkulasi menggunakan Evaluate Formula.',
          'Mengidentifikasi arti dari setiap kode error baku di Excel.'
        ],
        exercises: [
          'Gunakan Evaluate Formula pada salah satu sel Nested IF di sheet "Logika & Teks".'
        ]
      },
      {
        title: 'Pelajaran 12.2: Optimasi Performa File Excel & Etika Format Berkas Makro (.xlsm)',
        content: `### 1. Menjaga Kecepatan File Excel
1. Hindari pemformatan satu kolom utuh (misal memblok Kolom A sampai bawah 1 juta baris): Selalu batasi rentang format hanya pada data yang digunakan.
2. Batasi penggunaan fungsi volatil seperti \`OFFSET\`, \`INDIRECT\`, \`NOW()\`, dan \`TODAY()\`: Fungsi volatil dikalkulasi ulang setiap kali Anda menekan Enter di sel manapun!
3. Gunakan Excel Table dan INDEX MATCH dibandingkan VLOOKUP rentang raksasa.

### 2. Format Berkas Excel: .xlsx vs .xlsm
- **.xlsx**: Format standar OpenXML tanpa makro. Sangat aman dari risiko virus/malware.
- **.xlsm**: Format berkas Excel berkemampuan Makro/VBA (Macro-Enabled Workbook). Wajib digunakan jika workbook memiliki kode otomatisasi Visual Basic for Applications.`,
        learningObjectives: [
          'Menghindari faktor-faktor penyebab lemotnya file Excel berukuran besar.',
          'Memilih format penyimpanan file yang tepat (.xlsx vs .xlsm).'
        ],
        exercises: [
          'Periksa ukuran file workbook latihan dan pastikan tersimpan dalam format .xlsx standar.'
        ]
      }
    ]
  }
];

// Capstone Final Project Definition
const finalProject = {
  title: 'Capstone Project: Sistem Analisis Keuangan & Penjualan Ritel Terpadu',
  description: 'Proyek akhir komprehensif mengintegrasikan seluruh kompetensi: Aritmatika, Referensi Sel, Logika IF Bertingkat, Agregasi Bersyarat (SUMIFS/COUNTIFS), Pembersihan Data, dan Visualisasi Eksekutif.',
  brief: 'Anda adalah seorang Senior Business Analyst di perusahaan ritel nasional. Direksi meminta laporan kinerja tahunan konsolidasi yang akurat, dinamis, dan siap dipresentasikan. Buka sheet "Proyek Akhir" pada workbook latihan dan selesaikan seluruh tugas kalkulasi serta ringkasan KPI.',
  objectives: [
    'Menghitung Margin Laba Kotor dan Persentase Margin secara dinamis pada data penjualan konsolidasi.',
    'Menentukan Status Target dan Tingkat Margin menggunakan fungsi logika IF.',
    'Menyusun Tabel Ringkasan KPI Eksekutif menggunakan fungsi SUM, AVERAGE, COUNTIF, dan SUMIF.',
    'Menghasilkan lembar laporan kerja profesional yang bersih, dinamis, dan terbebas dari kesalahan formula.'
  ],
  instructions: [
    'Buka file "Workbook_Latihan_Excel_Masterclass.xlsx" dan pilih sheet "Proyek Akhir".',
    'Pada kolom Margin Laba Kotor (F8:F12), tuliskan formula selisih antara Realisasi Penjualan (Kolom D) dan Beban Pokok/COGS (Kolom E).',
    'Pada kolom % Margin Kotor (G8:G12), hitung persentase laba dengan membagi Margin Kotor (Kolom F) dengan Realisasi Penjualan (Kolom D). Format hasilnya sebagai Persentase (%).',
    'Pada kolom Status Target (H8:H12), gunakan fungsi IF: Jika Realisasi (Kolom D) >= Target (Kolom C) maka tampilkan "Tercapai", selain itu "Tidak".',
    'Pada kolom Tingkat Margin (I8:I12), gunakan fungsi IF: Jika % Margin (Kolom G) >= 30% (0.3) maka tampilkan "Tinggi", selain itu "Standar".',
    'Di tabel Ringkasan Metrik KPI Eksekutif (Baris 17 hingga 21):',
    '  - Hitung Total Target Nasional menggunakan =SUM(C8:C12).',
    '  - Hitung Total Realisasi Nasional menggunakan =SUM(D8:D12).',
    '  - Hitung Rata-rata Margin Laba Kotor menggunakan =AVERAGE(G8:G12).',
    '  - Hitung Jumlah Divisi Capai Target menggunakan =COUNTIF(H8:H12, "Tercapai").',
    '  - Hitung Total Penjualan Divisi Capai Target menggunakan =SUMIF(H8:H12, "Tercapai", D8:D12).',
    'Periksa seluruh hasil kalkulasi Anda dan bandingkan dengan panduan di sheet "Kunci Jawaban".'
  ],
  deliverables: [
    'File spreadsheet Excel (.xlsx) dengan seluruh sel kalkulasi terisi formula dinamis pada sheet "Proyek Akhir".',
    'Seluruh metrik KPI eksekutif terisi secara akurat dan terhubung langsung ke tabel data sumber.'
  ],
  rubric: [
    {
      criteria: 'Akurasi Formula Laba & Persentase Margin',
      points: 25,
      weight: '25%',
      description: 'Formula selisih COGS dan persentase laba kotor dihitung dengan pembagian matematis yang tepat dan berformat persentase.'
    },
    {
      criteria: 'Penerapan Logika Kondisional IF',
      points: 25,
      weight: '25%',
      description: 'Status target dan tingkat margin menggunakan fungsi IF dengan operator perbandingan yang benar.'
    },
    {
      criteria: 'Agregasi KPI Bersyarat (COUNTIF & SUMIF)',
      points: 30,
      weight: '30%',
      description: 'Perhitungan metrik divisi berprestasi menggunakan COUNTIF dan SUMIF dengan kriteria "Tercapai" secara presisi.'
    },
    {
      criteria: 'Integritas dan Kerapian Lembar Kerja',
      points: 20,
      weight: '20%',
      description: 'Tidak ada nilai yang di-hardcode, angka diformat sesuai standar akuntansi/persentase, dan bebas dari error rumus.'
    }
  ],
  answerKey: `PANDUAN MODEL SOLUSI PROYEK AKHIR:
1. Kolom Margin Laba Kotor (F8): =D8-E8 (Salin hingga F12)
2. Kolom % Margin Kotor (G8): =F8/D8 (Salin hingga G12, format %)
3. Kolom Status Target (H8): =IF(D8>=C8, "Tercapai", "Tidak")
4. Kolom Tingkat Margin (I8): =IF(G8>=0.3, "Tinggi", "Standar")
5. Ringkasan KPI Eksekutif:
   - Total Target: =SUM(C8:C12) -> Rp 2.700.000.000
   - Total Realisasi: =SUM(D8:D12) -> Rp 2.790.000.000
   - Rata-rata Margin: =AVERAGE(G8:G12) -> 29.9%
   - Jumlah Divisi Capai Target: =COUNTIF(H8:H12, "Tercapai") -> 3 Divisi
   - Total Realisasi Divisi Tercapai: =SUMIF(H8:H12, "Tercapai", D8:D12) -> Rp 1.650.000.000`
};

// Construct Complete Learning Pack
const learningPack = {
  schemaVersion: '1.1',
  exportedAt: Date.now(),
  class: {
    title: 'Microsoft Excel Masterclass: Pemula hingga Tingkat Lanjut (2019 & 2021)',
    description: 'Kurikulum pembelajaran Microsoft Excel paling komprehensif dalam Bahasa Indonesia. Dirancang khusus untuk pengguna Microsoft Excel 2019 dan 2021 di sistem operasi Windows. Membahas tuntas formula esensial, fungsi logika, manipulasi teks, lookup, tabel resmi, PivotTable, visualisasi interaktif, automasi Power Query, hingga proyek bisnis nyata dengan workbook latihan terpadu.',
    subject: 'Data Analysis & Productivity',
    tags: ['Excel 2019', 'Excel 2021', 'Spreadsheet', 'Data Analysis', 'Power Query', 'PivotTable', 'VLOOKUP', 'INDEX MATCH'],
    color: '#059669', // Emerald/Green Excel signature color
    level: 'Beginner to Advanced (Level 1 - Level 6)',
    language: 'id',
    learningObjectives: [
      'Menguasai antarmuka, navigasi, dan etika manajemen berkas spreadsheet di Excel 2019 & 2021.',
      'Memahami secara mendalam konsep referensi sel relatif, absolut ($A$1), dan campuran.',
      'Menyusun formula logika keputusan majemuk (IF, AND, OR, Nested IF).',
      'Membersihkan dan memanipulasi teks serta data tanggal kotor dari sistem bisnis.',
      'Menguasai seluruh teknik pencarian data (VLOOKUP, INDEX & MATCH, XLOOKUP, dan mitigasi IFERROR).',
      'Membangun ringkasan laporan multi-dimensi dengan PivotTable, PivotChart, dan Slicers.',
      'Melakukan otomasi pembersihan data berkala tanpa koding menggunakan Power Query.',
      'Mengetahui batasan dan padanan fitur formula antara Microsoft Excel 2019 dan Excel 2021.'
    ],
    finalProject: finalProject
  },
  chapters: chapters,
  finalProject: finalProject,
  resources: [
    {
      name: 'Workbook_Latihan_Excel_Masterclass.xlsx',
      fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      description: 'Workbook resmi Microsoft Excel (.xlsx) berisikan 8 lembar kerja praktik: Roadmap, Latihan Dasar, Logika & Teks, Lookup & Referensi, Pivot & Visualisasi (50 Baris), Power Query & Kasus, Proyek Akhir, dan Kunci Jawaban.',
      contentBase64: workbookDataUri,
      contentText: 'Workbook Latihan Excel Masterclass (XLSX binary resource)'
    }
  ]
};

const outputPath = path.join(__dirname, '..', 'Excel_Masterclass_Learning_Pack_ID.json');
fs.writeFileSync(outputPath, JSON.stringify(learningPack, null, 2), 'utf-8');

const stats = fs.statSync(outputPath);
console.log(`Learning Pack created successfully at: ${outputPath}`);
console.log(`File size: ${(stats.size / 1024).toFixed(2)} KB (${stats.size} bytes)`);
