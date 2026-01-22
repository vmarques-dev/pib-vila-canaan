import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { logger } from '@/lib/logger'

export interface CRUDOptions<T> {
  tableName: string
  orderBy?: { column: keyof T; ascending: boolean }
}

export interface CRUDResult<T> {
  data: T | null
  error: Error | null
}

/**
 * Busca todos os items de uma tabela
 */
export async function fetchItems<T>(
  options: CRUDOptions<T>
): Promise<CRUDResult<T[]>> {
  try {
    const supabase = createSupabaseBrowserClient()
    let query = supabase.from(options.tableName).select('*')

    if (options.orderBy) {
      query = query.order(options.orderBy.column as string, {
        ascending: options.orderBy.ascending,
      })
    }

    const { data, error } = await query

    if (error) {
      logger.error(`Erro ao buscar ${options.tableName}`, error)
      return { data: null, error: new Error(error.message) }
    }

    return { data: data as T[], error: null }
  } catch (error) {
    logger.error(`Erro inesperado ao buscar ${options.tableName}`, error)
    return { data: null, error: error as Error }
  }
}

/**
 * Cria um novo item na tabela
 */
export async function createItem<T>(
  tableName: string,
  data: Partial<T>
): Promise<CRUDResult<T>> {
  try {
    const supabase = createSupabaseBrowserClient()
    const { data: created, error } = await supabase
      .from(tableName)
      .insert([data])
      .select()
      .single()

    if (error) {
      logger.error(`Erro ao criar em ${tableName}`, error)
      return { data: null, error: new Error(error.message) }
    }

    return { data: created as T, error: null }
  } catch (error) {
    logger.error(`Erro inesperado ao criar em ${tableName}`, error)
    return { data: null, error: error as Error }
  }
}

/**
 * Atualiza um item existente
 */
export async function updateItem<T>(
  tableName: string,
  id: string,
  data: Partial<T>
): Promise<CRUDResult<T>> {
  try {
    const supabase = createSupabaseBrowserClient()
    const { data: updated, error } = await supabase
      .from(tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error(`Erro ao atualizar em ${tableName}`, error)
      return { data: null, error: new Error(error.message) }
    }

    return { data: updated as T, error: null }
  } catch (error) {
    logger.error(`Erro inesperado ao atualizar em ${tableName}`, error)
    return { data: null, error: error as Error }
  }
}

/**
 * Deleta um item da tabela
 */
export async function deleteItem(
  tableName: string,
  id: string
): Promise<{ error: Error | null }> {
  try {
    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase.from(tableName).delete().eq('id', id)

    if (error) {
      logger.error(`Erro ao deletar de ${tableName}`, error)
      return { error: new Error(error.message) }
    }

    return { error: null }
  } catch (error) {
    logger.error(`Erro inesperado ao deletar de ${tableName}`, error)
    return { error: error as Error }
  }
}
