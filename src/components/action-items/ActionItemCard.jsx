import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { format, parseISO } from 'date-fns'
import useStore from '../../store/useStore'

function Avatar({ member }) {
  if (!member) return null
  const initials = member.name.slice(0, 2).toUpperCase()
  return (
    <div
      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
      style={{ backgroundColor: member.avatarColor }}
      title={member.name}
    >
      {initials}
    </div>
  )
}

export default function ActionItemCard({ item, isDragOverlay, onEdit }) {
  const [expanded, setExpanded] = useState(false)
  const teamMembers = useStore((s) => s.teamMembers)
  const deleteActionItem = useStore((s) => s.deleteActionItem)

  const assignee = teamMembers.find((m) => m.id === item.assigneeId)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging && !isDragOverlay ? 0.4 : 1,
  }

  const startDateFormatted = item.startDate ? format(parseISO(item.startDate), 'MMM d') : null
  const dueDateFormatted = item.dueDate ? format(parseISO(item.dueDate), 'MMM d') : null
  const isOverdue = item.dueDate && new Date(item.dueDate) < new Date() && item.status !== 'done'

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg border shadow-sm transition-shadow ${
        isDragOverlay ? 'shadow-lg border-indigo-300 rotate-1' : 'border-gray-200 hover:shadow-md'
      }`}
    >
      <div className="flex items-start gap-2 p-3">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing flex-shrink-0 touch-none"
          aria-label="Drag to reorder"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="9" cy="5" r="1.5" /><circle cx="15" cy="5" r="1.5" />
            <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
            <circle cx="9" cy="19" r="1.5" /><circle cx="15" cy="19" r="1.5" />
          </svg>
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 leading-snug">{item.title}</p>

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {assignee && (
              <div className="flex items-center gap-1">
                <Avatar member={assignee} />
                <span className="text-xs text-gray-500">{assignee.name.split(' ')[0]}</span>
              </div>
            )}
            {(startDateFormatted || dueDateFormatted) && (
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                isOverdue ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'
              }`}>
                {startDateFormatted && dueDateFormatted
                  ? `${startDateFormatted} → ${dueDateFormatted}`
                  : dueDateFormatted || startDateFormatted}
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {item.description && (
            <button
              onClick={() => setExpanded((e) => !e)}
              className="text-gray-300 hover:text-gray-600 transition-colors"
              aria-label={expanded ? 'Collapse' : 'Expand'}
            >
              <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(item)}
              className="text-gray-300 hover:text-indigo-500 transition-colors"
              aria-label="Edit"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          <button
            onClick={() => deleteActionItem(item.id)}
            className="text-gray-300 hover:text-red-500 transition-colors"
            aria-label="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {expanded && item.description && (
        <div className="px-3 pb-3 pt-0">
          <p className="text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-2">
            {item.description}
          </p>
        </div>
      )}
    </div>
  )
}
