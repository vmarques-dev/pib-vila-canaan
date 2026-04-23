/**
 * Exportação centralizada de todos os tipos da aplicação
 * Permite importar tipos de um único lugar: import { Evento, Estudo } from '@/types'
 */

export * from './database'

// Tipos derivados para formulários
export type EventoCreate = Omit<import('./database').Evento, 'id' | 'created_at' | 'concluido'>
export type EventoUpdate = Partial<EventoCreate>

export type EstudoCreate = Omit<import('./database').Estudo, 'id' | 'created_at' | 'arquivado'>
export type EstudoUpdate = Partial<EstudoCreate>

export type GaleriaCreate = Omit<import('./database').Galeria, 'id' | 'created_at'>
export type GaleriaUpdate = Partial<GaleriaCreate>

export type EquipePastoralCreate = Omit<
  import('./database').EquipePastoral,
  'id' | 'created_at'
>
export type EquipePastoralUpdate = Partial<EquipePastoralCreate>

export type VersiculoDestaqueCreate = Omit<
  import('./database').VersiculoDestaque,
  'id' | 'created_at'
>
export type VersiculoDestaqueUpdate = Partial<VersiculoDestaqueCreate>
