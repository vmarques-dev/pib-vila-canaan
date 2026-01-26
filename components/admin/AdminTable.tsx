import { ReactNode } from 'react'

export interface AdminTableColumn<T> {
  header: string
  accessor: keyof T | ((item: T) => ReactNode)
  /** Largura da coluna (ex: '150px', '20%') */
  width?: string
  /** Largura mínima da coluna */
  minWidth?: string
  /** Largura máxima da coluna */
  maxWidth?: string
  /** Classe CSS adicional para o header */
  headerClassName?: string
  /** Classe CSS adicional para as células */
  cellClassName?: string
}

export interface AdminTableAction<T> {
  icon: ReactNode | ((item: T) => ReactNode)
  onClick: (item: T) => void
  className?: string
  ariaLabel: string
}

interface AdminTableProps<T> {
  columns: AdminTableColumn<T>[]
  data: T[]
  actions?: AdminTableAction<T>[]
  emptyMessage?: string
}

export function AdminTable<T extends { id: string }>({
  columns,
  data,
  actions = [],
  emptyMessage = 'Nenhum item cadastrado',
}: AdminTableProps<T>) {
  const renderCellContent = (item: T, column: AdminTableColumn<T>) => {
    if (typeof column.accessor === 'function') {
      return column.accessor(item)
    }
    const value = item[column.accessor]
    return value as ReactNode
  }

  const renderIcon = (item: T, action: AdminTableAction<T>) => {
    if (typeof action.icon === 'function') {
      return action.icon(item)
    }
    return action.icon
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  style={{
                    width: column.width,
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth,
                  }}
                  className={
                    column.headerClassName ||
                    'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                  }
                >
                  {column.header}
                </th>
              ))}
              {actions.length > 0 && (
                <th
                  style={{ width: `${actions.length * 40 + 32}px` }}
                  className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Ações
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                {columns.map((column, index) => (
                  <td
                    key={index}
                    style={{
                      width: column.width,
                      minWidth: column.minWidth,
                      maxWidth: column.maxWidth,
                    }}
                    className={column.cellClassName || 'px-4 py-4'}
                  >
                    {renderCellContent(item, column)}
                  </td>
                ))}
                {actions.length > 0 && (
                  <td className="px-4 py-4 text-center text-sm font-medium">
                    <div className="flex justify-center gap-2">
                      {actions.map((action, index) => (
                        <button
                          key={index}
                          onClick={() => action.onClick(item)}
                          className={`p-1 rounded hover:bg-gray-100 transition-colors ${action.className}`}
                          aria-label={action.ariaLabel}
                        >
                          {renderIcon(item, action)}
                        </button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length === 0 && (
        <div className="text-center py-12 text-gray-500">{emptyMessage}</div>
      )}
    </div>
  )
}
