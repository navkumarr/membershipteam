import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import ActionItemCard from './ActionItemCard'

const STATUS_STYLES = {
  'todo': {
    dot: 'bg-slate-400',
    badge: 'bg-gray-100 dark:bg-navy-900 text-gray-600 dark:text-slate-400',
    header: 'border-gray-200 dark:border-navy-800',
  },
  'in-progress': {
    dot: 'bg-gold shadow-[0_0_8px_rgba(255,229,105,0.4)]',
    badge: 'bg-gold/10 dark:bg-gold/5 text-gold dark:text-gold border border-gold/20 dark:border-gold/10',
    header: 'border-gold/30 dark:border-gold/20',
  },
  'done': {
    dot: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]',
    badge: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/30',
    header: 'border-emerald-200 dark:border-emerald-900/50',
  },
}

export default function KanbanColumn({ title, status, items, onAddItem, onEdit }) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  const style = STATUS_STYLES[status] || STATUS_STYLES['todo']

  return (
    <div className="flex flex-col flex-1 min-w-[260px] max-w-sm snap-start">
      {/* Column header */}
      <div className={`flex items-center gap-2 px-1 pb-3 mb-2 border-b-2 ${style.header}`}>
        <span className={`w-2 h-2 rounded-full ${style.dot}`} />
        <span className="text-sm font-bold tracking-tight text-gray-700 dark:text-slate-200 uppercase">{title}</span>
        <span className={`ml-auto px-1.5 py-0.5 rounded text-[10px] font-bold ${style.badge}`}>
          {items.length}
        </span>
      </div>

      {/* Drop zone + cards */}
      <div
        ref={setNodeRef}
        className={`flex-1 flex flex-col gap-2 rounded-lg min-h-[120px] transition-all duration-200 p-1 ${
          isOver ? 'bg-gold/5 ring-2 ring-gold ring-inset' : ''
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
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-100 dark:border-navy-900 rounded-lg">
            <p className="text-xs text-gray-400 dark:text-navy-700 italic">No items</p>
          </div>
        )}
      </div>

      {/* Add item button */}
      <button
        onClick={() => onAddItem(status)}
        className="mt-3 w-full flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-lg text-xs font-semibold text-gray-500 dark:text-slate-400 hover:text-navy-950 dark:hover:text-navy-950 hover:bg-gold transition-all duration-200 group shadow-sm hover:shadow-gold/20"
      >
        <svg className="w-4 h-4 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
        ADD ITEM
      </button>
    </div>
  )
}
