import { ReactNode } from 'react'

export interface AdminTableColumn<T> {
  header: string
  accessor: keyof T | ((item: T) => ReactNode)
  className?: string
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
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className={
                  column.className ||
                  'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                }
              >
                {column.header}
              </th>
            ))}
            {actions.length > 0 && (
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item) => (
            <tr key={item.id}>
              {columns.map((column, index) => (
                <td key={index} className="px-6 py-4 whitespace-nowrap">
                  {renderCellContent(item, column)}
                </td>
              ))}
              {actions.length > 0 && (
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <div className="flex justify-center gap-2">
                    {actions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => action.onClick(item)}
                        className={action.className}
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
      {data.length === 0 && (
        <div className="text-center py-12 text-gray-500">{emptyMessage}</div>
      )}
    </div>
  )
}
