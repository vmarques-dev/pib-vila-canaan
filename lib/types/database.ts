export interface VersiculoDestaque {
  id: string
  livro: string
  referencia: string
  texto: string
  data_inicio?: string
  data_fim?: string
  ativo: boolean
  created_at: string
}

export interface Evento {
  id: string
  titulo: string
  descricao: string
  data_inicio: string
  data_fim?: string
  horario: string
  local: string
  imagem_url?: string
  concluido: boolean
  created_at: string
}

export interface EquipePastoral {
  id: string
  nome: string
  cargo: string
  foto_url?: string
  ativo: boolean
  ordem: number
  created_at: string
}

export interface Estudo {
  id: string
  titulo: string
  livro: string
  referencia: string
  texto_versiculo: string
  conteudo: string
  categoria: string
  data_estudo: string
  arquivado: boolean
  created_at: string
}

export interface Galeria {
  id: string
  titulo: string
  categoria: 'Cultos' | 'Jovens' | 'Eventos Especiais' | 'Infantil'
  url: string
  ordem: number
  created_at: string
}

export interface InformacoesIgreja {
  id: string
  endereco: string
  telefone: string
  whatsapp: string
  email: string
  horarios: string
  facebook_url?: string
  instagram_url?: string
  youtube_url?: string
  created_at: string
}

export interface ContatoMensagem {
  id?: string
  nome: string
  email: string
  telefone?: string
  assunto: string
  mensagem: string
  created_at?: string
}
