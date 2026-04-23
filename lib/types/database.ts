export interface VersiculoDestaque {
  id: string
  livro: string
  referencia: string
  texto: string
  ativo: boolean
  created_at: string
}

export interface Evento {
  id: string
  titulo: string
  descricao: string
  data_inicio: string
  data_fim?: string
  horario_inicio?: string | null
  horario_fim?: string | null
  local: string
  imagem_url?: string
  concluido: boolean
  created_at: string
}

export interface EquipePastoral {
  id: string
  nome: string
  cargo: string
  descricao?: string
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
  descricao?: string
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

export interface Adorador {
  id: string
  user_id: string
  nome: string
  email: string
  telefone?: string
  created_at: string
  updated_at: string
}

export interface Aviso {
  id: string
  titulo: string
  conteudo: string
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface AvisoCreate {
  titulo: string
  conteudo: string
  ativo?: boolean
}

export interface AvisoUpdate {
  titulo?: string
  conteudo?: string
  ativo?: boolean
}

export interface PedidoOracao {
  id: string
  adorador_id: string
  descricao: string
  respondido: boolean
  created_at: string
}

export interface Inscricao {
  id: string
  evento_id: string
  adorador_id: string | null
  nome: string
  email: string
  telefone: string | null
  created_at: string
}
