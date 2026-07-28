export const INITIAL_FILES = [
  {
    id: 'f-101',
    name: 'Nemo_Architecture_v2.pdf',
    size: 4820000, // ~4.6 MB
    type: 'application/pdf',
    category: 'pdf',
    uploadedAt: '2026-07-28T14:30:00Z',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    tags: ['Architecture', 'Docs'],
    isFavorite: true
  },
  {
    id: 'f-102',
    name: 'Minimalist_Dark_UI_Mockup.png',
    size: 2940000, // ~2.8 MB
    type: 'image/png',
    category: 'image',
    uploadedAt: '2026-07-27T09:15:00Z',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
    tags: ['UI/UX', 'Design'],
    isFavorite: true
  },
  {
    id: 'f-103',
    name: 'Ambient_Cyberpunk_Synth.mp3',
    size: 8750000, // ~8.3 MB
    type: 'audio/mp3',
    category: 'audio',
    uploadedAt: '2026-07-26T18:45:00Z',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a7385a.mp3?filename=synthwave-80s-110045.mp3',
    tags: ['Audio', 'Music'],
    isFavorite: false
  },
  {
    id: 'f-104',
    name: 'Supabase_Storage_Setup.sql',
    size: 14500, // ~14 KB
    type: 'text/x-sql',
    category: 'code',
    uploadedAt: '2026-07-25T11:20:00Z',
    content: `-- Nemo Cloud Storage Database Schema & Buckets
CREATE TABLE IF NOT EXISTS public.nemo_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  size BIGINT NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  url TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  is_favorite BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.nemo_trash (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL,
  name TEXT NOT NULL,
  size BIGINT NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  url TEXT NOT NULL,
  deleted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);`,
    url: '',
    tags: ['Backend', 'SQL'],
    isFavorite: false
  },
  {
    id: 'f-105',
    name: 'Teaser_Product_Showcase.mp4',
    size: 38400000, // ~36.6 MB
    type: 'video/mp4',
    category: 'video',
    uploadedAt: '2026-07-24T16:00:00Z',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    tags: ['Promo', 'Video'],
    isFavorite: true
  },
  {
    id: 'f-106',
    name: 'Q3_Financial_Analysis.docx',
    size: 1890000, // ~1.8 MB
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    category: 'document',
    uploadedAt: '2026-07-22T08:10:00Z',
    url: '',
    content: 'Nemo Financial Analysis Q3\nTotal Storage Optimization Savings: +42%\nBandwidth Performance: 99.98%\nSupabase Integration Health: Optimal',
    tags: ['Report', 'Finance'],
    isFavorite: false
  }
];

export const INITIAL_TRASH = [
  {
    id: 't-201',
    originalFileId: 'f-99',
    name: 'Deprecated_Config_2025.json',
    size: 34000,
    type: 'application/json',
    category: 'code',
    deletedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago (25 days left)
    originalUploadedAt: '2026-06-10T12:00:00Z',
    url: ''
  },
  {
    id: 't-202',
    originalFileId: 'f-98',
    name: 'Old_Banner_Draft.png',
    size: 1540000,
    type: 'image/png',
    category: 'image',
    deletedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 days ago (5 days left)
    originalUploadedAt: '2026-06-01T10:00:00Z',
    url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1000&auto=format&fit=crop'
  }
];

export const STORAGE_LIMIT_BYTES = 5 * 1024 * 1024 * 1024; // 5 GB default capacity limit
