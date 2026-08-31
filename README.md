# Sales Tracker

Versi awal Sales Tracker — **local-first**.

## Prinsip
- Belum memakai Supabase/database online.
- Data disimpan di browser menggunakan `localStorage`.
- Struktur aplikasi dibuat agar backend bisa ditambahkan kemudian.
- Mobile-first.

## Menjalankan
```bash
npm install
npm run dev
```

Untuk build:
```bash
npm run build
```

## Struktur
- `src/App.jsx` — layar utama
- `src/main.jsx` — entry React
- `src/index.css` — UI mobile-first
- `src/storage.js` — penyimpanan lokal

## Tahap berikutnya
1. Finalisasi kebutuhan dashboard.
2. Tambah modul data sales.
3. Tambah input pencapaian PSM/PWP/SG.
4. Tambah rekap dan target.
5. Testing di HP.
6. Setelah stabil baru integrasi Supabase.