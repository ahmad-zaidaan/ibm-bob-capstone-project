# Sertifikilat

Sertifikilat adalah platform berbasis AI (Document-to-Database) yang dirancang untuk membantu mahasiswa mengekstrak informasi penting dari sertifikat kegiatan fisik maupun digital secara otomatis. Sistem ini memindai dokumen dan mengubahnya menjadi format data terstruktur yang siap diekspor atau diintegrasikan ke dalam portofolio dan Curriculum Vitae (CV).

## Fitur Utama

* Multiple File Upload: Area drag-and-drop untuk mengunggah beberapa dokumen sertifikat (PDF/JPG/PNG) sekaligus.
* AI Processing State: Simulasi pemindaian dokumen dan ekstraksi teks menggunakan teknologi OCR dan AI.
* Extracted Database Preview: Tampilan tabel interaktif yang merangkum hasil ekstraksi (Nama Kegiatan, Peran, Penyelenggara, Tanggal, dan tingkat Confidence).
* Single Page Application (SPA): Navigasi mulus ke halaman Dashboard, Riwayat, Integrasi, dan Bantuan tanpa perlu memuat ulang halaman.
* Dark Mode UI: Antarmuka modern dengan tema gelap dan sentuhan skeuomorphic untuk interaksi pengguna yang lebih taktil.

## Tech Stack

* Framework: React (Functional Components & Hooks)
* Styling: Tailwind CSS
* Build Tool: Vite

## Prerequisites

Pastikan Anda sudah menginstal perangkat lunak berikut di sistem Anda sebelum memulai:
* Node.js (versi 16.x atau lebih baru)
* npm (Node Package Manager) atau yarn

## Cara Instalasi dan Menjalankan Proyek

Ikuti langkah-langkah berikut untuk menjalankan proyek Sertifikilat di komputer lokal Anda:

1. Clone repo ini `git clone`

2. Masuk ke dalam direktori proyek:
   cd sertifikilat-capstone

3. Instal semua dependensi yang dibutuhkan:
   npm install

4. Jalankan development server dengan `npm run dev`

5. Akses aplikasi melalui browser dengan mengunjungi http://localhost:5173/

## Struktur Proyek Utama

* `/src/components`: Berisikan component UI yang dapat digunakan kembali (Navbar, UploadZone, DataTable, dll).
* `/src/pages`: Berisikan komponen halaman utama (Dashboard, Riwayat, Integrasi, Bantuan).
* `/src/App.jsx`: File utama untuk routing dan global state management.
* `/src/index.css`: Config Tailwind CSS.

## Status Pengembangan

Proyek ini adalah prototype yang dikembangkan sebagai Capstone Project. Untuk saat ini, sistem ekstraksi AI berjalan menggunakan mock data untuk tujuan demonstrasi UI/UX. Pengembangan lanjutan akan mencakup integrasi backend database (PostgreSQL) dan API ekstraksi dokumen (AI Agent).