import { Plus } from 'lucide-react'

interface AdminPageHeaderProps {
  title: string
  description: string
  buttonLabel: string
  onButtonClick: () => void
}

export function AdminPageHeader({
  title,
  description,
  buttonLabel,
  onButtonClick,
}: AdminPageHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-600 mt-1">{description}</p>
      </div>
      <button
        onClick={onButtonClick}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        aria-label={buttonLabel}
      >
        <Plus size={20} />
        {buttonLabel}
      </button>
    </div>
  )
}
