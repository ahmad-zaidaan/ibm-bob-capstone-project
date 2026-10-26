/**
 * Sertifikilat — AI Certificate Data Extractor  (SPA Edition)
 * ============================================================
 * Single-file React SPA (Functional Components + Tailwind CSS)
 *
 * TOP-LEVEL PAGE ROUTING (activePage state in App):
 *   'dashboard'   → Default landing. Upload → Scanning → Result flow.
 *   'riwayat'     → Archive table with search + filter controls.
 *   'integrasi'   → Integration cards grid with skeuomorphic toggles.
 *   'bantuan'     → Do's & Don'ts guide + interactive FAQ accordion.
 *
 * DASHBOARD INNER STATE MACHINE (appState):
 *   'idle'     → Upload zone shown.
 *   'scanning' → AI processing animation (setTimeout mock).
 *   'result'   → Extracted data table shown.
 *
 * Page transitions: fade-in via CSS animation class swap.
 * No external router — pure React state.
 */

import React, { useState, useRef, useCallback } from 'react'

// ---------------------------------------------------------------------------
// MOCK DATA — Simulates the structured output returned by the AI extractor
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// MOCK DATA POOL — one record per slot; sliced/mapped to match uploaded files
// ---------------------------------------------------------------------------
const MOCK_DATA_POOL = [
  {
    activityName: 'Workshop Pengembangan Aplikasi Mobile dengan Flutter',
    role: 'Peserta',
    organizer: 'Himpunan Mahasiswa Informatika ITS',
    date: '14 Oktober 2024',
    hours: '8 JP',
    confidence: 98,
  },
  {
    activityName: 'Seminar Nasional Kecerdasan Buatan dan Machine Learning',
    role: 'Pembicara',
    organizer: 'Fakultas Teknologi Informasi, Universitas Indonesia',
    date: '3 Agustus 2024',
    hours: '4 JP',
    confidence: 95,
  },
  {
    activityName: 'Pelatihan Kepemimpinan Tingkat Dasar (LKMM-TD)',
    role: 'Panitia',
    organizer: 'BEM ITS',
    date: '22–24 November 2023',
    hours: '24 JP',
    confidence: 91,
  },
  {
    activityName: 'Hackathon AI for Good 2024 — National Finals',
    role: 'Peserta',
    organizer: 'Kementerian Komunikasi dan Informatika RI',
    date: '9–10 Maret 2024',
    hours: '16 JP',
    confidence: 87,
  },
  {
    activityName: 'Webinar Transformasi Digital untuk Industri 4.0',
    role: 'Peserta',
    organizer: 'Asosiasi Teknologi Informasi Indonesia',
    date: '5 Januari 2024',
    hours: '3 JP',
    confidence: 93,
  },
  {
    activityName: 'Kompetisi Desain UI/UX Nasional 2023',
    role: 'Peserta',
    organizer: 'Tokopedia & Bangkit Academy',
    date: '18 September 2023',
    hours: '—',
    confidence: 89,
  },
  {
    activityName: 'Bootcamp Cloud Computing dengan AWS',
    role: 'Peserta',
    organizer: 'Amazon Web Services Indonesia',
    date: '12–16 Februari 2024',
    hours: '40 JP',
    confidence: 96,
  },
  {
    activityName: 'Talkshow Karir di Bidang Data Science',
    role: 'Moderator',
    organizer: 'Data Science Indonesia Community',
    date: '27 Juli 2024',
    hours: '2 JP',
    confidence: 90,
  },
]

/**
 * Generates mock extracted records based on the actual uploaded files.
 * Each file gets exactly one record; the sourceFile field carries the real filename.
 * If more files than pool entries are uploaded, the pool wraps around (modulo).
 *
 * @param {File[]} files - Array of uploaded File objects
 * @returns {object[]} Array of record objects sized 1:1 with files
 */
const generateMockRecords = (files) =>
  files.map((file, idx) => ({
    id: idx + 1,
    sourceFile: file.name,
    ...MOCK_DATA_POOL[idx % MOCK_DATA_POOL.length],
  }))

// ---------------------------------------------------------------------------
// ICON COMPONENTS — Lightweight inline SVG icons (no external dependency)
// ---------------------------------------------------------------------------

const IconUpload = () => (
  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
)

const IconFile = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
)

const IconCheckCircle = () => (
  <svg className="w-5 h-5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const IconDownload = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

const IconRefresh = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 .49-4.95" />
  </svg>
)

const IconSpark = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
  </svg>
)

const IconTrash = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
)

// ---------------------------------------------------------------------------
// UPLOAD ZONE COMPONENT
// Handles drag-and-drop and click-to-browse interactions.
// Accepts: .jpg, .jpeg, .png, .pdf
// On file select → calls onFileSelected(file)
// ---------------------------------------------------------------------------
const UploadZone = ({ onFileSelected }) => {
  const [isDragOver, setIsDragOver] = useState(false)
  // stagedFiles holds an array of File objects (multiple upload support)
  const [stagedFiles, setStagedFiles] = useState([])
  const fileInputRef = useRef(null)

  const acceptedTypes = ['image/jpeg', 'image/png', 'application/pdf']

  // Merge new files into the staged list, skipping duplicates (by name) and
  // rejecting unsupported types. Returns a deduplicated, valid File[].
  const mergeFiles = useCallback((incoming) => {
    const valid = []
    const rejected = []
    for (const file of incoming) {
      if (!acceptedTypes.includes(file.type)) {
        rejected.push(file.name)
      } else {
        valid.push(file)
      }
    }
    if (rejected.length) {
      alert(`Format tidak didukung (${rejected.join(', ')}). Gunakan JPG, PNG, atau PDF.`)
    }
    setStagedFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name))
      const deduplicated = valid.filter((f) => !existingNames.has(f.name))
      return [...prev, ...deduplicated]
    })
  }, [])

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => setIsDragOver(false)

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    mergeFiles(Array.from(e.dataTransfer.files))
  }

  const handleInputChange = (e) => {
    mergeFiles(Array.from(e.target.files))
    // Reset input value so the same file can be re-selected after removal
    e.target.value = ''
  }

  const handleProcessClick = () => {
    if (stagedFiles.length > 0) onFileSelected(stagedFiles)
  }

  // Remove a single file from the staged list by index
  const handleRemoveFile = (idx) => {
    setStagedFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  const hasStagedFiles = stagedFiles.length > 0

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Drop area — skeuomorphic inset well */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={[
          'w-full max-w-xl rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer',
          'flex flex-col items-center justify-center gap-3 py-14 px-8 select-none',
          // Skeuomorphic inset shadow effect
          'shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)]',
          isDragOver
            ? 'border-blue-400 bg-blue-50 shadow-[inset_0_2px_12px_rgba(59,130,246,0.15)]'
            : hasStagedFiles
            ? 'border-emerald-400 bg-emerald-50 shadow-[inset_0_2px_8px_rgba(16,185,129,0.1)]'
            : 'border-gray-300 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/40',
        ].join(' ')}
      >
        {/* multiple attribute enables multi-file selection in the OS picker */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          multiple
          className="hidden"
          onChange={handleInputChange}
        />

        {hasStagedFiles ? (
          /* Staged files preview — stack of file chips */
          <div className="flex flex-col items-center gap-3 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold">
              <IconCheckCircle />
              <span>{stagedFiles.length} file siap diproses</span>
            </div>
            {/* Scrollable list of staged files */}
            <ul className="w-full flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
              {stagedFiles.map((file, idx) => (
                <li
                  key={`${file.name}-${idx}`}
                  className="flex items-center justify-between gap-2 bg-white rounded-xl border border-emerald-200 px-3 py-2 shadow-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-emerald-600 shrink-0"><IconFile /></span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{file.name}</p>
                      <p className="text-[10px] text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemoveFile(idx) }}
                    className="shrink-0 text-gray-300 hover:text-red-400 transition-colors"
                    title="Hapus file ini"
                  >
                    <IconTrash />
                  </button>
                </li>
              ))}
            </ul>
            <p className="text-xs text-gray-400 mt-1">Klik area ini untuk menambah file lagi</p>
          </div>
        ) : (
          /* Default empty state */
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="text-gray-400">
              <IconUpload />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">
                {isDragOver ? 'Lepaskan file di sini…' : 'Seret & lepas sertifikat di sini'}
              </p>
              <p className="text-xs text-gray-400 mt-1">atau klik untuk memilih satu atau banyak file</p>
            </div>
            <div className="flex gap-2 mt-1">
              {['JPG', 'PNG', 'PDF'].map((fmt) => (
                <span key={fmt} className="px-2 py-0.5 bg-white border border-gray-200 rounded-md text-xs text-gray-500 font-mono shadow-sm">
                  {fmt}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action row shown only when at least one file is staged */}
      {hasStagedFiles && (
        <div className="flex items-center gap-3">
          {/* Clear all staged files */}
          <button
            onClick={() => setStagedFiles([])}
            className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-500 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 active:bg-gray-100 shadow-sm transition-all"
          >
            <IconTrash />
            Hapus Semua
          </button>

          {/* Primary CTA — triggers the AI pipeline */}
          <button
            onClick={handleProcessClick}
            className={[
              'flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-xl',
              'bg-gray-900 text-white',
              // Skeuomorphic raised-button feel
              'shadow-[0_2px_0_rgba(0,0,0,0.35),0_1px_3px_rgba(0,0,0,0.2)]',
              'hover:bg-gray-800 active:shadow-none active:translate-y-px',
              'transition-all duration-100',
            ].join(' ')}
          >
            <IconSpark />
            Ekstrak {stagedFiles.length} File dengan AI
          </button>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// SCANNING ANIMATION COMPONENT
// Simulates the AI document-scanning process.
// Shows an animated scan-line sweeping over a document illustration.
// ---------------------------------------------------------------------------
const ScanningView = ({ fileCount, fileName }) => {
  return (
    <div className="flex flex-col items-center gap-8 py-4">
      {/* Document + scan-line illustration */}
      <div className="relative w-48 h-64 bg-white rounded-xl border border-gray-200 shadow-[0_4px_20px_rgba(0,0,0,0.08)] overflow-hidden select-none">

        {/* Faux document lines */}
        <div className="absolute inset-0 p-5 flex flex-col gap-2.5">
          <div className="w-3/4 h-3 rounded-full bg-gray-200" />
          <div className="w-full h-2.5 rounded-full bg-gray-100" />
          <div className="w-5/6 h-2.5 rounded-full bg-gray-100" />
          <div className="w-full h-2.5 rounded-full bg-gray-100" />
          <div className="w-4/6 h-2.5 rounded-full bg-gray-100" />
          <div className="w-full h-2.5 rounded-full bg-gray-100 mt-2" />
          <div className="w-3/4 h-2.5 rounded-full bg-gray-100" />
          <div className="w-full h-2.5 rounded-full bg-gray-100" />
          <div className="w-5/6 h-2.5 rounded-full bg-gray-100" />
          {/* Stamp/seal circle */}
          <div className="absolute bottom-6 right-5 w-12 h-12 rounded-full border-2 border-gray-200" />
        </div>

        {/* Animated scan line */}
        <div
          className="absolute left-0 right-0 h-0.5"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, #3b82f6 20%, #60a5fa 50%, #3b82f6 80%, transparent 100%)',
            boxShadow: '0 0 8px 2px rgba(59,130,246,0.4)',
            animation: 'scanLine 1.8s ease-in-out infinite',
          }}
        />

        {/* Scanning glow overlay that follows the line */}
        <div
          className="absolute left-0 right-0 h-8 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(59,130,246,0.06) 50%, transparent 100%)',
            animation: 'scanGlow 1.8s ease-in-out infinite',
          }}
        />
      </div>

      {/* Status text */}
      <div className="text-center">
        <p className="text-sm font-semibold text-gray-800">Menganalisis {fileCount} dokumen…</p>
        <p className="text-xs text-gray-400 mt-1 max-w-xs">
          Model AI sedang membaca{' '}
          <span className="font-medium text-gray-600">
            {fileCount === 1 ? fileName : `${fileName} dan ${fileCount - 1} file lainnya`}
          </span>{' '}
          dan mengekstrak data terstruktur.
        </p>
      </div>

      {/* Step progress pills */}
      <ScanStepIndicator />

    </div>
  )
}

// Animated step pills that cycle through processing phases
const SCAN_STEPS = [
  'Memuat gambar…',
  'Deteksi layout…',
  'OCR teks…',
  'Ekstraksi entitas…',
  'Validasi data…',
]

const ScanStepIndicator = () => {
  const [activeStep, setActiveStep] = useState(0)

  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % SCAN_STEPS.length)
    }, 600)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-xs">
      {SCAN_STEPS.map((step, idx) => (
        <div
          key={step}
          className={[
            'w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all duration-300',
            idx === activeStep
              ? 'bg-blue-50 text-blue-700 font-semibold'
              : idx < activeStep
              ? 'text-emerald-600'
              : 'text-gray-300',
          ].join(' ')}
        >
          {idx < activeStep ? (
            <span className="text-emerald-500">✓</span>
          ) : idx === activeStep ? (
            <span className="inline-flex gap-0.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="block w-1 h-1 rounded-full bg-blue-500"
                  style={{ animation: `pulse-dot 1s ${i * 0.2}s infinite` }}
                />
              ))}
            </span>
          ) : (
            <span className="w-3" />
          )}
          {step}
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// CONFIDENCE BADGE
// Color-coded badge indicating AI extraction confidence level
// ---------------------------------------------------------------------------
const ConfidenceBadge = ({ score }) => {
  const color =
    score >= 95 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
    score >= 85 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-red-50 text-red-700 border-red-200'

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${color}`}>
      {score}%
    </span>
  )
}

// ---------------------------------------------------------------------------
// RESULT TABLE COMPONENT
// Renders extracted records as a clean data table with card-style rows.
// Includes Export CSV and Reset actions.
// ---------------------------------------------------------------------------
const ResultTable = ({ records, fileCount, onReset }) => {
  const [selectedRows, setSelectedRows] = useState(new Set(records.map((r) => r.id)))

  const toggleRow = (id) => {
    setSelectedRows((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selectedRows.size === records.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(records.map((r) => r.id)))
    }
  }

  // Export selected rows as CSV — includes the sourceFile column
  const handleExportCSV = () => {
    const header = ['File Sumber', 'Nama Kegiatan', 'Peran', 'Penyelenggara', 'Tanggal', 'Jam', 'Confidence']
    const rows = records
      .filter((r) => selectedRows.has(r.id))
      .map((r) => [r.sourceFile, r.activityName, r.role, r.organizer, r.date, r.hours, `${r.confidence}%`])
    const csv = [header, ...rows].map((row) => row.map((v) => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sertifikilat_export.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Result header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-800">
            Hasil Ekstraksi
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {records.length} data ditemukan dari{' '}
            <span className="font-medium text-gray-600">{fileCount} file</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-500 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 active:bg-gray-100 shadow-sm transition-all"
          >
            <IconRefresh />
            Upload Baru
          </button>
          <button
            onClick={handleExportCSV}
            disabled={selectedRows.size === 0}
            className={[
              'flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl',
              'bg-gray-900 text-white',
              'shadow-[0_2px_0_rgba(0,0,0,0.35),0_1px_3px_rgba(0,0,0,0.2)]',
              'hover:bg-gray-800 active:shadow-none active:translate-y-px',
              'disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none',
              'transition-all duration-100',
            ].join(' ')}
          >
            <IconDownload />
            Export CSV ({selectedRows.size})
          </button>
        </div>
      </div>

      {/* Data table — skeuomorphic raised card */}
      <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
        {/* Table header — added File Sumber column */}
        <div className="grid grid-cols-[2rem_7rem_1fr_6rem_9rem_5rem] gap-x-4 items-center px-4 py-2.5 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-400 uppercase tracking-wide">
          <input
            type="checkbox"
            checked={selectedRows.size === records.length}
            onChange={toggleAll}
            className="w-3.5 h-3.5 rounded accent-gray-800 cursor-pointer"
          />
          <span>File Sumber</span>
          <span>Nama Kegiatan</span>
          <span>Peran</span>
          <span>Penyelenggara</span>
          <span className="text-center">Confidence</span>
        </div>

        {/* Table rows */}
        {records.map((record) => (
          <div
            key={record.id}
            onClick={() => toggleRow(record.id)}
            className={[
              'grid grid-cols-[2rem_7rem_1fr_6rem_9rem_5rem] gap-x-4 items-start px-4 py-3.5 cursor-pointer',
              'border-b border-gray-100 last:border-b-0',
              'transition-colors duration-100',
              selectedRows.has(record.id)
                ? 'bg-blue-50/60 hover:bg-blue-50'
                : 'bg-white hover:bg-gray-50/80',
            ].join(' ')}
          >
            <input
              type="checkbox"
              checked={selectedRows.has(record.id)}
              onChange={() => toggleRow(record.id)}
              onClick={(e) => e.stopPropagation()}
              className="w-3.5 h-3.5 mt-0.5 rounded accent-gray-800 cursor-pointer"
            />
            {/* sourceFile — shows the original uploaded filename */}
            <div className="text-[11px] text-gray-400 font-mono truncate leading-snug" title={record.sourceFile}>
              {record.sourceFile}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 leading-snug">{record.activityName}</p>
              <p className="text-xs text-gray-400 mt-0.5">{record.date} · {record.hours}</p>
            </div>
            <div>
              <RolePill role={record.role} />
            </div>
            <div className="text-xs text-gray-600 leading-snug">{record.organizer}</div>
            <div className="flex justify-center">
              <ConfidenceBadge score={record.confidence} />
            </div>
          </div>
        ))}
      </div>

      {/* Summary footer */}
      <p className="text-xs text-gray-400 text-center">
        {selectedRows.size} dari {records.length} data dipilih untuk export ·{' '}
        <button onClick={toggleAll} className="text-blue-500 hover:underline">
          {selectedRows.size === records.length ? 'Batalkan semua' : 'Pilih semua'}
        </button>
      </p>
    </div>
  )
}

// Role badge with color-coded variants
const ROLE_COLORS = {
  'Peserta':    'bg-sky-50 text-sky-700 border-sky-200',
  'Pembicara':  'bg-purple-50 text-purple-700 border-purple-200',
  'Panitia':    'bg-orange-50 text-orange-700 border-orange-200',
}

const RolePill = ({ role }) => {
  const color = ROLE_COLORS[role] ?? 'bg-gray-100 text-gray-600 border-gray-200'
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${color}`}>
      {role}
    </span>
  )
}

// ---------------------------------------------------------------------------
// NAVBAR COMPONENT
// activePage — the current top-level page key ('dashboard' | 'riwayat' | 'integrasi')
// onNavigate(page) — called when a nav item is clicked
// onReset         — called when the logo is clicked (always returns to dashboard idle)
// ---------------------------------------------------------------------------
const Navbar = ({ activePage, onNavigate, onReset }) => {
  // All nav items now route to a real page; no more alert() calls
  const NAV_ITEMS = [
    { label: 'Dashboard', page: 'dashboard' },
    { label: 'Riwayat',   page: 'riwayat'   },
    { label: 'Integrasi', page: 'integrasi'  },
    { label: 'Bantuan',   page: 'bantuan'    },
  ]

  return (
    <header className="w-full border-b border-gray-200 bg-white/90 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Brand — click navigates to dashboard and resets upload state */}
        <button
          onClick={onReset}
          className="flex items-center gap-2 rounded-lg px-1 py-0.5 hover:bg-gray-100 active:bg-gray-200 transition-colors"
          title="Kembali ke Dashboard"
        >
          <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center shadow-[0_2px_0_rgba(0,0,0,0.3)]">
            <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1l1.5 4.5H14l-3.6 2.6 1.4 4.3L8 10 4.2 12.4l1.4-4.3L2 5.5h4.5z" />
            </svg>
          </div>
          <span className="font-bold text-gray-900 tracking-tight text-base">
            Sertifi<span className="text-blue-500">kilat</span>
          </span>
        </button>

        {/* Nav links */}
        <nav className="hidden sm:flex items-center gap-1">
          {NAV_ITEMS.map(({ label, page }) => {
            const isActive = page && activePage === page
            return (
              <button
                key={label}
                onClick={() => onNavigate(page)}
                className={[
                  'px-3 py-1.5 text-sm rounded-lg transition-colors',
                  isActive
                    ? 'bg-gray-900 text-white font-semibold shadow-[0_2px_0_rgba(0,0,0,0.3)]'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800',
                ].join(' ')}
              >
                {label}
              </button>
            )
          })}
        </nav>

        {/* User avatar */}
        <button
          onClick={() => alert('Navigasi ke halaman: Profil')}
          className="w-8 h-8 rounded-full bg-linear-to-br from-blue-400 to-indigo-500 shadow-sm flex items-center justify-center text-white text-xs font-bold hover:opacity-90 active:opacity-75 transition-opacity"
          title="Profil"
        >
          A
        </button>
      </div>
    </header>
  )
}

// ---------------------------------------------------------------------------
// STEP INDICATOR — visual pipeline breadcrumb at top of main card
// ---------------------------------------------------------------------------
const STEPS = ['Upload', 'Scanning', 'Hasil']

const PipelineSteps = ({ currentStep }) => {
  // currentStep: 0 | 1 | 2
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((label, idx) => {
        const isComplete = idx < currentStep
        const isActive = idx === currentStep
        return (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center gap-1">
              <div
                className={[
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300',
                  // Skeuomorphic raised/pressed disc
                  isComplete
                    ? 'bg-emerald-500 text-white shadow-[0_2px_0_rgba(5,150,105,0.5)]'
                    : isActive
                    ? 'bg-gray-900 text-white shadow-[0_2px_0_rgba(0,0,0,0.4)]'
                    : 'bg-gray-100 text-gray-400 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)]',
                ].join(' ')}
              >
                {isComplete ? '✓' : idx + 1}
              </div>
              <span
                className={`text-xs font-medium transition-colors ${
                  isActive ? 'text-gray-800' : isComplete ? 'text-emerald-600' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={[
                  'h-px flex-1 mx-3 mb-4 transition-all duration-500',
                  idx < currentStep ? 'bg-emerald-300' : 'bg-gray-200',
                ].join(' ')}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ===========================================================================
// PAGE: HISTORY (Riwayat)
// Archive table of past scans with search + filter controls.
// ===========================================================================

// Mock archive data — simulates records stored in a backend database
const MOCK_HISTORY = [
  { id: 'h1', fileName: 'sertifikat_flutter_workshop.pdf',   activityName: 'Workshop Pengembangan Aplikasi Mobile dengan Flutter', status: 'Berhasil',  date: '14 Okt 2024', records: 1 },
  { id: 'h2', fileName: 'seminar_ai_ml_2024.jpg',            activityName: 'Seminar Nasional Kecerdasan Buatan dan Machine Learning', status: 'Berhasil', date: '3 Agt 2024',  records: 1 },
  { id: 'h3', fileName: 'lkmm_td_certificate.png',           activityName: 'Pelatihan Kepemimpinan Tingkat Dasar (LKMM-TD)',        status: 'Berhasil',  date: '24 Nov 2023', records: 1 },
  { id: 'h4', fileName: 'hackathon_ai_for_good_finals.pdf',  activityName: 'Hackathon AI for Good 2024 — National Finals',          status: 'Berhasil',  date: '10 Mar 2024', records: 1 },
  { id: 'h5', fileName: 'webinar_transformasi_digital.pdf',  activityName: 'Webinar Transformasi Digital untuk Industri 4.0',       status: 'Berhasil',  date: '5 Jan 2024',  records: 1 },
  { id: 'h6', fileName: 'blurry_scan_cert.jpg',              activityName: '—',                                                     status: 'Gagal',     date: '18 Des 2023', records: 0 },
  { id: 'h7', fileName: 'bootcamp_aws_cloud.pdf',            activityName: 'Bootcamp Cloud Computing dengan AWS',                   status: 'Berhasil',  date: '16 Feb 2024', records: 1 },
  { id: 'h8', fileName: 'kompetisi_uiux_2023.png',           activityName: 'Kompetisi Desain UI/UX Nasional 2023',                  status: 'Menunggu',  date: '19 Sep 2023', records: 0 },
]

const StatusBadge = ({ status }) => {
  const style =
    status === 'Berhasil' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
    status === 'Gagal'    ? 'bg-red-50 text-red-600 border-red-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
  const dot =
    status === 'Berhasil' ? 'bg-emerald-400' :
    status === 'Gagal'    ? 'bg-red-400' : 'bg-amber-400'
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  )
}

const HistoryPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDate, setFilterDate]   = useState('semua')   // 'semua' | 'bulan-ini' | 'tahun-ini'
  const [filterStatus, setFilterStatus] = useState('semua') // 'semua' | 'Berhasil' | 'Gagal' | 'Menunggu'

  // Derived filtered list — recomputed on every render (no useMemo needed at this scale)
  const filtered = MOCK_HISTORY.filter((row) => {
    const matchSearch = row.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        row.activityName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus = filterStatus === 'semua' || row.status === filterStatus
    // Date filter: parse month/year from "DD Mon YYYY" format
    const matchDate = (() => {
      if (filterDate === 'semua') return true
      const now = new Date()
      const [, mon, yr] = row.date.split(' ')
      const MONTHS = { Jan:0,Feb:1,Mar:2,Apr:3,Mei:4,Jun:5,Jul:6,Agt:7,Sep:8,Okt:9,Nov:10,Des:11 }
      const rowDate = new Date(+yr, MONTHS[mon] ?? 0)
      if (filterDate === 'bulan-ini') return rowDate.getMonth() === now.getMonth() && rowDate.getFullYear() === now.getFullYear()
      if (filterDate === 'tahun-ini') return rowDate.getFullYear() === now.getFullYear()
      return true
    })()
    return matchSearch && matchStatus && matchDate
  })

  return (
    <div className="animate-[fadeIn_0.3s_ease]">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Riwayat Pemindaian</h1>
        <p className="text-sm text-gray-500 mt-1">Arsip semua sertifikat yang pernah diproses oleh sistem.</p>
      </div>

      {/* Controls bar: search + filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        {/* Search input */}
        <div className="relative flex-1 min-w-48">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Cari nama file atau kegiatan…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={[
              'w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 bg-white',
              'shadow-[inset_0_1px_4px_rgba(0,0,0,0.05)]',
              'focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300',
              'placeholder:text-gray-400 text-gray-800',
            ].join(' ')}
          />
        </div>

        {/* Date filter dropdown */}
        <select
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className={[
            'px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white',
            'shadow-[inset_0_1px_4px_rgba(0,0,0,0.05)]',
            'focus:outline-none focus:ring-2 focus:ring-blue-300',
            'text-gray-700 cursor-pointer',
          ].join(' ')}
        >
          <option value="semua">Semua Tanggal</option>
          <option value="bulan-ini">Bulan Ini</option>
          <option value="tahun-ini">Tahun Ini</option>
        </select>

        {/* Status filter dropdown */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={[
            'px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white',
            'shadow-[inset_0_1px_4px_rgba(0,0,0,0.05)]',
            'focus:outline-none focus:ring-2 focus:ring-blue-300',
            'text-gray-700 cursor-pointer',
          ].join(' ')}
        >
          <option value="semua">Semua Status</option>
          <option value="Berhasil">Berhasil</option>
          <option value="Gagal">Gagal</option>
          <option value="Menunggu">Menunggu</option>
        </select>
      </div>

      {/* Archive table */}
      <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
        {/* Table header */}
        <div className="grid grid-cols-[2rem_1fr_8rem_7rem_4rem] gap-x-4 items-center px-4 py-2.5 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-400 uppercase tracking-wide">
          <span>#</span>
          <span>File / Kegiatan</span>
          <span>Tanggal</span>
          <span>Status</span>
          <span className="text-center">Data</span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">
            <p>Tidak ada riwayat yang cocok dengan filter.</p>
          </div>
        ) : (
          filtered.map((row, idx) => (
            <div
              key={row.id}
              className="grid grid-cols-[2rem_1fr_8rem_7rem_4rem] gap-x-4 items-start px-4 py-3.5 border-b border-gray-100 last:border-b-0 bg-white hover:bg-gray-50/80 transition-colors"
            >
              <span className="text-xs text-gray-400 mt-0.5">{idx + 1}</span>
              <div className="min-w-0">
                <p className="text-xs font-mono text-gray-500 truncate">{row.fileName}</p>
                <p className="text-sm font-medium text-gray-800 leading-snug mt-0.5 truncate">{row.activityName}</p>
              </div>
              <span className="text-xs text-gray-500 mt-0.5">{row.date}</span>
              <div className="mt-0.5"><StatusBadge status={row.status} /></div>
              <span className="text-xs text-center text-gray-500 mt-0.5 font-mono">{row.records}</span>
            </div>
          ))
        )}
      </div>

      {/* Footer count */}
      <p className="mt-3 text-xs text-gray-400 text-center">
        Menampilkan {filtered.length} dari {MOCK_HISTORY.length} riwayat
      </p>
    </div>
  )
}


// ===========================================================================
// PAGE: INTEGRATIONS (Integrasi)
// Grid of integration cards with skeuomorphic toggle switches.
// ===========================================================================

// Integration catalogue — logo rendered as inline SVG or emoji fallback
const INTEGRATIONS = [
  {
    id: 'notion',
    name: 'Notion',
    description: 'Simpan hasil ekstraksi langsung ke halaman atau database Notion Anda secara otomatis.',
    color: '#000000',
    logo: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor">
        <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z"/>
      </svg>
    ),
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Tambahkan sertifikat yang diekstrak ke bagian Lisensi & Sertifikasi di profil LinkedIn Anda.',
    color: '#0A66C2',
    logo: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="#0A66C2">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
  {
    id: 'gdrive',
    name: 'Google Drive',
    description: 'Ekspor spreadsheet hasil ekstraksi langsung ke Google Drive dalam folder yang Anda tentukan.',
    color: '#4285F4',
    logo: (
      <svg viewBox="0 0 24 24" className="w-7 h-7">
        <path fill="#4285F4" d="M6.28 12.862L3.862 8.586 8.694 0h6.834z"/>
        <path fill="#FBBC04" d="m.007 18.278 2.421-4.276 4.832 8.587H2.428z"/>
        <path fill="#34A853" d="M17.308 8.586 14.888 12.86 9.259 22.589h6.834L21.172 12.86z"/>
        <path fill="#EA4335" d="m23.994 18.278-2.822-4.276H8.694l2.422 4.276z"/>
      </svg>
    ),
  },
  {
    id: 'sheets',
    name: 'Google Sheets',
    description: 'Sinkronisasi data terstruktur ke Google Sheets secara real-time setiap ada sertifikat baru.',
    color: '#0F9D58',
    logo: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="#0F9D58">
        <path d="M11.318 12.545H7.91v-1.909h3.41zm0 2.864H7.91v-1.909h3.41zm1.909-2.864v-1.909h3.41v1.909zm0 2.864v-1.909h3.41v1.909zM7 5.727A2.727 2.727 0 0 1 9.727 3h9.546A2.727 2.727 0 0 1 22 5.727v12.546A2.727 2.727 0 0 1 19.273 21H9.727A2.727 2.727 0 0 1 7 18.273V5.727zm11.455 12.546V5.727H9.727v12.546h8.728z"/>
        <path d="M4.273 3H6v18H4.273A2.273 2.273 0 0 1 2 18.727V5.273A2.273 2.273 0 0 1 4.273 3z"/>
      </svg>
    ),
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Kirim notifikasi otomatis ke channel Slack pilihan setiap kali proses ekstraksi selesai.',
    color: '#4A154B',
    logo: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="#4A154B">
        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zm10.122 2.521a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.268 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zm-2.523 10.122a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.268a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
      </svg>
    ),
  },
  {
    id: 'email',
    name: 'Email (SMTP)',
    description: 'Kirim laporan PDF hasil ekstraksi ke alamat email secara otomatis setelah pemrosesan.',
    color: '#6B7280',
    logo: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
  },
]

// Skeuomorphic toggle switch — purely visual, controlled by parent
// ---------------------------------------------------------------------------
// TOGGLE SWITCH — Skeuomorphic, fully interactive via React state.
// Props: enabled (boolean), onToggle (function)
// Visual logic:
//   OFF → track: gray + inset shadow; thumb: left (translate-x-[2px])
//   ON  → track: emerald + raised shadow; thumb: right (translate-x-[22px])
// Smooth animation: transition-all duration-200 on both track and thumb.
// ---------------------------------------------------------------------------
const ToggleSwitch = ({ enabled, onToggle }) => (
  <button
    role="switch"
    aria-checked={enabled}
    onClick={onToggle}
    title={enabled ? 'Nonaktifkan' : 'Aktifkan'}
    className={[
      // Track: fixed size, pill shape, smooth color + shadow transition
      'relative inline-flex shrink-0 w-11 h-6 rounded-full',
      'transition-all duration-200 ease-in-out',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-1',
      // ON state: emerald track with bottom edge shadow (raised feel)
      // OFF state: light gray track with inset shadow (pressed/recessed feel)
      enabled
        ? 'bg-emerald-500 shadow-[0_2px_0_rgba(5,150,105,0.4),inset_0_1px_2px_rgba(0,0,0,0.10)]'
        : 'bg-gray-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.12)]',
    ].join(' ')}
  >
    {/* Thumb — raised white disc that slides left↔right */}
    <span
      aria-hidden="true"
      style={{
        // Using inline style for pixel-perfect translate to avoid
        // Tailwind JIT purge issues with dynamic translate values.
        transform: enabled ? 'translateX(22px)' : 'translateX(2px)',
        transition: 'transform 200ms ease-in-out',
      }}
      className={[
        'absolute top-0.5 w-5 h-5 rounded-full bg-white',
        // Skeuomorphic thumb: bottom shadow + hairline border
        'shadow-[0_1px_4px_rgba(0,0,0,0.28),0_0_0_0.5px_rgba(0,0,0,0.08)]',
      ].join(' ')}
    />
  </button>
)

// Single integration card component
const IntegrationCard = ({ integration }) => {
  const [enabled, setEnabled] = useState(false)

  return (
    <div
      className={[
        'bg-white rounded-2xl border p-5 flex flex-col gap-4',
        'shadow-[0_2px_12px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)]',
        'transition-all duration-200',
        enabled ? 'border-emerald-200' : 'border-gray-200',
      ].join(' ')}
    >
      {/* Card header: logo + name + toggle */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Logo container — skeuomorphic raised tile */}
          <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shadow-[0_2px_0_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,0.9)]">
            {integration.logo}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm leading-tight">{integration.name}</p>
            <p className={`text-xs font-medium mt-0.5 ${enabled ? 'text-emerald-600' : 'text-gray-400'}`}>
              {enabled ? 'Terhubung' : 'Tidak aktif'}
            </p>
          </div>
        </div>
        <ToggleSwitch enabled={enabled} onToggle={() => setEnabled((v) => !v)} />
      </div>

      {/* Description */}
      <p className="text-xs text-gray-500 leading-relaxed">{integration.description}</p>

      {/* Configure button — only visible when enabled */}
      <div className={`transition-all duration-200 overflow-hidden ${enabled ? 'max-h-10 opacity-100' : 'max-h-0 opacity-0'}`}>
        <button className="w-full py-1.5 text-xs font-semibold text-emerald-700 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 transition-colors">
          Konfigurasi →
        </button>
      </div>
    </div>
  )
}

const IntegrationPage = () => {
  return (
    <div className="animate-[fadeIn_0.3s_ease]">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Integrasi</h1>
        <p className="text-sm text-gray-500 mt-1">
          Hubungkan Sertifikilat dengan layanan pihak ketiga untuk mengotomatisasi alur kerja Anda.
        </p>
      </div>

      {/* Info banner */}
      <div className="mb-6 flex items-start gap-3 px-4 py-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-700">
        <svg className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
        <span>Ini adalah purwarupa. Toggle tidak mengirim data ke server. Gunakan tombol <strong>Konfigurasi</strong> untuk mengatur API key di versi produksi.</span>
      </div>

      {/* Integration cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {INTEGRATIONS.map((integration) => (
          <IntegrationCard key={integration.id} integration={integration} />
        ))}
      </div>
    </div>
  )
}


// ===========================================================================
// PAGE: DASHBOARD (default)
// The existing upload → scanning → result flow, now wrapped as a page.
// ===========================================================================
const DashboardPage = () => {
  /**
   * INNER STATE MACHINE (scoped to Dashboard):
   *   'idle'     — Upload zone shown.
   *   'scanning' — AI simulation in progress.
   *   'result'   — Extracted data table shown.
   */
  const [appState, setAppState] = useState('idle')
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [extractedData, setExtractedData] = useState([])

  const stepIndex = appState === 'idle' ? 0 : appState === 'scanning' ? 1 : 2

  const handleFileSelected = (files) => {
    setUploadedFiles(files)
    setAppState('scanning')
    setTimeout(() => {
      setExtractedData(generateMockRecords(files))
      setAppState('result')
    }, 3500)
  }

  const handleReset = () => {
    setAppState('idle')
    setUploadedFiles([])
    setExtractedData([])
  }

  return (
    <div className="animate-[fadeIn_0.3s_ease]">
      {/* Page title */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Ekstrak Data Sertifikat Otomatis
        </h1>
        <p className="text-sm text-gray-500 mt-1.5 max-w-lg mx-auto">
          Unggah satu atau banyak sertifikat sekaligus, biarkan AI mengekstrak dan menyusun datanya ke dalam database terstruktur.
        </p>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-[0_4px_24px_rgba(0,0,0,0.07),0_1px_4px_rgba(0,0,0,0.05)]">
        <PipelineSteps currentStep={stepIndex} />

        {appState === 'idle' && (
          <div className="animate-[fadeIn_0.3s_ease]">
            <UploadZone onFileSelected={handleFileSelected} />
          </div>
        )}
        {appState === 'scanning' && (
          <div className="animate-[fadeIn_0.3s_ease]">
            <ScanningView
              fileCount={uploadedFiles.length}
              fileName={uploadedFiles[0]?.name ?? ''}
            />
          </div>
        )}
        {appState === 'result' && (
          <div className="animate-[fadeIn_0.4s_ease]">
            <ResultTable
              records={extractedData}
              fileCount={uploadedFiles.length}
              onReset={handleReset}
            />
          </div>
        )}
      </div>

      {/* Info strip */}
      {appState === 'idle' && (
        <div className="mt-6 flex flex-wrap justify-center gap-6 text-xs text-gray-400">
          {[
            ['🔒', 'File tidak disimpan di server'],
            ['⚡', 'Ekstraksi dalam ~3 detik'],
            ['📦', 'Export ke CSV atau JSON'],
          ].map(([icon, text]) => (
            <span key={text} className="flex items-center gap-1.5">{icon} {text}</span>
          ))}
        </div>
      )}
    </div>
  )
}


// ===========================================================================
// ROOT APP COMPONENT
// ===========================================================================
// PAGE: HELP (Bantuan)
// Two sections: Do's & Don'ts visual guide + interactive FAQ accordion.
// ===========================================================================

// ── Section 1: Do's and Don'ts ──────────────────────────────────────────────

const DOS_ITEMS = [
  { icon: '☀️', text: 'Gambar terang dan pencahayaan merata' },
  { icon: '🔍', text: 'Teks pada sertifikat terbaca dengan jelas' },
  { icon: '📄', text: 'Format file PDF, JPG, atau PNG berkualitas tinggi' },
  { icon: '✂️', text: 'Dokumen tidak terpotong — seluruh bagian terlihat' },
  { icon: '📐', text: 'Sertifikat dalam orientasi tegak lurus (tidak miring)' },
]

const DONTS_ITEMS = [
  { icon: '🌫️', text: 'Gambar buram, blur, atau banyak noise' },
  { icon: '🌑', text: 'Pencahayaan gelap atau bayangan di atas teks' },
  { icon: '✂️', text: 'Dokumen terpotong sehingga teks hilang' },
  { icon: '🔄', text: 'Sertifikat miring lebih dari 15 derajat' },
  { icon: '🗜️', text: 'File sangat kecil atau resolusi rendah (<200px)' },
]

// ── Section 2: FAQ Accordion ────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    id: 'faq1',
    question: 'Bagaimana cara kerja ekstraksi data AI pada Sertifikilat?',
    answer: 'Sertifikilat menggunakan model OCR (Optical Character Recognition) berbasis AI yang dikombinasikan dengan Large Language Model (LLM) untuk memahami konteks dokumen. Pertama, gambar sertifikat diproses untuk mendeteksi dan membaca seluruh teks. Kemudian, model AI mengidentifikasi entitas penting seperti nama kegiatan, peran, penyelenggara, dan tanggal — lalu menyusunnya ke dalam format data terstruktur yang siap digunakan.',
  },
  {
    id: 'faq2',
    question: 'Format file apa saja yang didukung, dan apakah ada batas ukuran?',
    answer: 'Sertifikilat mendukung format JPG, JPEG, PNG, dan PDF. Ukuran file maksimum per unggahan adalah 10 MB. Untuk hasil terbaik, gunakan PDF asli (bukan hasil scan) atau gambar dengan resolusi minimal 300 DPI. Anda juga bisa mengunggah beberapa file sekaligus dalam satu sesi — setiap file akan diproses secara paralel.',
  },
  {
    id: 'faq3',
    question: 'Seberapa akurat hasil ekstraksi, dan apa arti nilai Confidence?',
    answer: 'Akurasi rata-rata sistem berkisar antara 85–98% tergantung kualitas dokumen. Nilai "Confidence" pada setiap baris hasil menunjukkan tingkat keyakinan model terhadap data yang diekstrak: ≥95% (hijau) berarti sangat akurat, 85–94% (kuning) berarti perlu diverifikasi ulang, dan <85% (merah) berarti sangat disarankan untuk diperiksa secara manual sebelum disimpan.',
  },
]

// Single accordion item — manages its own open/closed state
const AccordionItem = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div
      className={[
        'rounded-xl border transition-all duration-200',
        // Skeuomorphic: open items get a subtle raised shadow + stronger border
        isOpen
          ? 'border-gray-300 shadow-[0_2px_10px_rgba(0,0,0,0.07)]'
          : 'border-gray-200 shadow-sm',
      ].join(' ')}
    >
      {/* Question row — clickable trigger */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left bg-white rounded-xl transition-colors hover:bg-gray-50"
      >
        <span className="text-sm font-semibold text-gray-800">{item.question}</span>
        {/* Chevron icon — rotates 180° when open */}
        <svg
          className={`shrink-0 w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Answer panel — expands/collapses using max-height transition */}
      <div
        className={[
          'overflow-hidden transition-all duration-300 ease-in-out',
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0',
        ].join(' ')}
      >
        <div className="px-5 pb-4 pt-1 border-t border-gray-100">
          <p className="text-sm text-gray-600 leading-relaxed">{item.answer}</p>
        </div>
      </div>
    </div>
  )
}

const HelpPage = () => (
  <div className="animate-[fadeIn_0.3s_ease]">
    {/* Page header */}
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Bantuan</h1>
      <p className="text-sm text-gray-500 mt-1">
        Panduan penggunaan Sertifikilat dan jawaban atas pertanyaan yang sering diajukan.
      </p>
    </div>

    {/* ── Section 1: Do's and Don'ts ── */}
    <section className="mb-10">
      <h2 className="text-base font-semibold text-gray-800 mb-1">Panduan Unggah Dokumen</h2>
      <p className="text-xs text-gray-500 mb-4">Ikuti panduan ini agar AI dapat mengekstrak data seakurat mungkin.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* DO's card — green accent */}
        <div className="rounded-2xl border border-emerald-200 bg-white overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
          {/* Card header bar */}
          <div className="flex items-center gap-2 px-5 py-3 bg-emerald-50 border-b border-emerald-200">
            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_1px_0_rgba(5,150,105,0.5)]">
              <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span className="text-sm font-bold text-emerald-800">✅ Yang Boleh (Do's)</span>
          </div>
          {/* Items list */}
          <ul className="px-5 py-4 flex flex-col gap-2.5">
            {DOS_ITEMS.map((item) => (
              <li key={item.text} className="flex items-start gap-3 text-sm text-gray-700">
                <span className="text-base leading-snug shrink-0">{item.icon}</span>
                <span className="leading-snug">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* DON'Ts card — red accent */}
        <div className="rounded-2xl border border-red-200 bg-white overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
          {/* Card header bar */}
          <div className="flex items-center gap-2 px-5 py-3 bg-red-50 border-b border-red-200">
            <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center shadow-[0_1px_0_rgba(220,38,38,0.4)]">
              <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
            <span className="text-sm font-bold text-red-800">❌ Yang Dilarang (Don'ts)</span>
          </div>
          {/* Items list */}
          <ul className="px-5 py-4 flex flex-col gap-2.5">
            {DONTS_ITEMS.map((item) => (
              <li key={item.text} className="flex items-start gap-3 text-sm text-gray-700">
                <span className="text-base leading-snug shrink-0">{item.icon}</span>
                <span className="leading-snug">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>

    {/* ── Section 2: FAQ Accordion ── */}
    <section>
      <h2 className="text-base font-semibold text-gray-800 mb-1">Pertanyaan Umum (FAQ)</h2>
      <p className="text-xs text-gray-500 mb-4">Klik pada pertanyaan untuk melihat jawabannya.</p>

      <div className="flex flex-col gap-3">
        {FAQ_ITEMS.map((item) => (
          <AccordionItem key={item.id} item={item} />
        ))}
      </div>
    </section>
  </div>
)


// ===========================================================================
// ROOT APP COMPONENT
// Top-level page router. activePage determines which page is rendered.
// The inner upload/scan/result state is managed inside DashboardPage.
// ===========================================================================
export default function App() {
  /**
   * TOP-LEVEL PAGE ROUTER:
   *   'dashboard' — Default. The upload → scan → result flow.
   *   'riwayat'   — Archive table with search + filter.
   *   'integrasi' — Integration cards with toggle switches.
   *   'bantuan'   — Do's & Don'ts guide + FAQ accordion.
   */
  const [activePage, setActivePage] = useState('dashboard')

  /**
   * Navigate to a page. For 'dashboard', also signals a reset via the
   * dashboardKey trick: incrementing the key forces DashboardPage to remount
   * (resetting its inner state) whenever the user navigates back to it.
   */
  const [dashboardKey, setDashboardKey] = useState(0)

  const handleNavigate = (page) => {
    setActivePage(page)
  }

  // Logo click: go to dashboard AND reset its inner state by remounting
  const handleReset = () => {
    setActivePage('dashboard')
    setDashboardKey((k) => k + 1)
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] font-sans">
      <Navbar
        activePage={activePage}
        onNavigate={handleNavigate}
        onReset={handleReset}
      />

      <main className="max-w-4xl mx-auto px-4 py-10">
        {activePage === 'dashboard'  && <DashboardPage key={dashboardKey} />}
        {activePage === 'riwayat'    && <HistoryPage />}
        {activePage === 'integrasi'  && <IntegrationPage />}
        {activePage === 'bantuan'    && <HelpPage />}
      </main>

      {/* Global keyframes */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        @keyframes scanLine {
          0%   { top: 10%; opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }
        @keyframes scanGlow {
          0%   { top: calc(10% - 16px); }
          100% { top: calc(90% - 16px); }
        }
        @keyframes pulse-dot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%            { transform: scale(1);   opacity: 1;   }
        }
      `}</style>
    </div>
  )
}
