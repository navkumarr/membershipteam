import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import ActionItemCard from './ActionItemCard'

const STATUS_STYLES = {
  'todo': {
    dot: 'bg-gray-400',
    badge: 'bg-gray-100 text-gray-600',
    header: 'border-gray-200',
  },
  'in-progress': {
    dot: 'bg-amber-400',
    badge: 'bg-amber-50 text-amber-700',
    header: 'border-amber-200',
  },
  'done': {
    dot: 'bg-emerald-400',
    badge: 'bg-emerald-50 text-emerald-700',
    header: 'border-emerald-200',
  },
}

export default function KanbanColumn({ title, status, items, onAddItem, onEdit }) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  const style = STATUS_STYLES[status] || STATUS_STYLES['todo']

  return (
    <div className="flex flex-col flex-1 min-w-[260px] max-w-sm">
      {/* Column header */}
      <div className={`flex items-center gap-2 px-1 pb-3 mb-2 border-b-2 ${style.header}`}>
        <span className={`w-2 h-2 rounded-full ${style.dot}`} />
        <span className="text-sm font-semibold text-gray-700">{title}</span>
        <span className={`ml-1 px-1.5 py-0.5 rounded text-xs font-medium ${style.badge}`}>
          {items.length}
        </span>
      </div>

      {/* Drop zone + cards */}
      <div
        ref={setNodeRef}
        className={`flex-1 flex flex-col gap-2 rounded-lg min-h-[120px] transition-colors p-1 ${
          isOver ? 'bg-indigo-50/60 ring-2 ring-indigo-200 ring-inset' : ''
        }`}
      >
        <SortableContext
          items={items.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.map((item) => (
            <ActionItemCard key={item.id} item={item} onEdit={onEdit} />
          ))}
        </SortableContext>

        {items.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs text-gray-400 italic">No items</p>
          </div>
        )}
      </div>

      {/* Add item button */}
      <button
        onClick={() => onAddItem(status)}
        className="mt-2 w-full flex items-center gap-1.5 px-2 py-2 rounded-md text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add item
      </button>
    </div>
  )
}
