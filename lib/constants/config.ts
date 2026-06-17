/**
 * General application configuration.
 * Centralizes constant values reused across the codebase.
 */

export const SITE_CONFIG = {
  name: 'PIB Vila Canaan',
  description:
    'Primeira Igreja Batista em Vila Canaan - Uma igreja que ama a Deus e serve às pessoas',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://pibvilacanaan.com.br',
  ogImage: '/og-image.jpg',
  author: 'PIB Vila Canaan',
  keywords: [
    'igreja',
    'batista',
    'vila canaan',
    'serra',
    'espírito santo',
    'culto',
    'estudo bíblico',
    'eventos',
  ],
} as const

/**
 * Photo categories for the gallery. Single source of truth shared by the
 * Zod schema, the database type, the admin form select and the public
 * filter — add or rename a category here and every place stays in sync.
 */
export const GALERIA_CATEGORIAS = [
  'Cultos',
  'Eventos',
  'Jovens',
  'Infantil',
  'Nossa Igreja',
  'Batismos',
  'Santa Ceia',
  'Missões e Ação Social',
] as const

export type GaleriaCategoria = (typeof GALERIA_CATEGORIAS)[number]

export const STORAGE_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as const,
  BUCKETS: {
    EVENTOS: 'eventos',
    GALERIA: 'galeria',
    EQUIPE: 'equipe',
  } as const,
} as const

export const VALIDATION_CONFIG = {
  // Titles and names
  TITLE_MIN: 3,
  TITLE_MAX: 200,
  NOME_MIN: 3,
  NOME_MAX: 100,

  // Descriptions
  DESCRIPTION_MIN: 10,
  DESCRIPTION_MAX: 1000,

  // Email
  EMAIL_MAX: 255,

  // Long-form content
  CONTENT_MIN: 10,
  CONTENT_MAX: 10000,

  // Verses
  VERSICULO_MIN: 10,
  VERSICULO_MAX: 1000,
} as const

export const RATE_LIMIT_CONFIG = {
  CONTATO: {
    MAX_REQUESTS: 3,
    WINDOW_MS: 3600000, // 1 hour
  },
} as const

export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const
