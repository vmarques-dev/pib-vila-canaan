/**
 * Lista completa dos livros da Bíblia em português
 * Ordem canônica: Antigo Testamento seguido de Novo Testamento
 */

export const BIBLE_BOOKS = [
  // Pentateuco
  'Gênesis',
  'Êxodo',
  'Levítico',
  'Números',
  'Deuteronômio',

  // Livros Históricos
  'Josué',
  'Juízes',
  'Rute',
  '1 Samuel',
  '2 Samuel',
  '1 Reis',
  '2 Reis',
  '1 Crônicas',
  '2 Crônicas',
  'Esdras',
  'Neemias',
  'Ester',

  // Livros Poéticos
  'Jó',
  'Salmos',
  'Provérbios',
  'Eclesiastes',
  'Cantares',

  // Profetas Maiores
  'Isaías',
  'Jeremias',
  'Lamentações',
  'Ezequiel',
  'Daniel',

  // Profetas Menores
  'Oséias',
  'Joel',
  'Amós',
  'Obadias',
  'Jonas',
  'Miquéias',
  'Naum',
  'Habacuque',
  'Sofonias',
  'Ageu',
  'Zacarias',
  'Malaquias',

  // Evangelhos
  'Mateus',
  'Marcos',
  'Lucas',
  'João',

  // Livro Histórico NT
  'Atos',

  // Epístolas Paulinas
  'Romanos',
  '1 Coríntios',
  '2 Coríntios',
  'Gálatas',
  'Efésios',
  'Filipenses',
  'Colossenses',
  '1 Tessalonicenses',
  '2 Tessalonicenses',
  '1 Timóteo',
  '2 Timóteo',
  'Tito',
  'Filemom',

  // Epístolas Gerais
  'Hebreus',
  'Tiago',
  '1 Pedro',
  '2 Pedro',
  '1 João',
  '2 João',
  '3 João',
  'Judas',

  // Profecia
  'Apocalipse',
] as const

/**
 * Tipo derivado da lista de livros
 * Útil para validação de tipos
 */
export type BibleBook = (typeof BIBLE_BOOKS)[number]

/**
 * Verifica se um texto é um livro válido da Bíblia
 */
export function isValidBibleBook(book: string): book is BibleBook {
  return BIBLE_BOOKS.includes(book as BibleBook)
}

/**
 * Categorias dos livros da Bíblia
 */
export const BIBLE_CATEGORIES = {
  OLD_TESTAMENT: {
    name: 'Antigo Testamento',
    books: BIBLE_BOOKS.slice(0, 39),
  },
  NEW_TESTAMENT: {
    name: 'Novo Testamento',
    books: BIBLE_BOOKS.slice(39),
  },
} as const
