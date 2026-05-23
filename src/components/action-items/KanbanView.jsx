import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import useStore from '../../store/useStore'
import KanbanColumn from './KanbanColumn'
import ActionItemCard from './ActionItemCard'

const COLUMNS = [
  { title: 'To Do', status: 'todo' },
  { title: 'In Progress', status: 'in-progress' },
  { title: 'Done', status: 'done' },
]

export default function KanbanView({ onAddItem, onEdit }) {
  const actionItems = useStore((s) => s.actionItems)
  const moveActionItem = useStore((s) => s.moveActionItem)
  const updateActionItem = useStore((s) => s.updateActionItem)

  const [activeItem, setActiveItem] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  function handleDragStart(event) {
    const item = actionItems.find((i) => i.id === event.active.id)
    setActiveItem(item || null)
  }

  function handleDragEnd(event) {
    const { active, over } = event
    setActiveItem(null)

    if (!over) return

    const activeId = active.id
    const overId = over.id

    // Find the status of the dragged item
    const draggedItem = actionItems.find((i) => i.id === activeId)
    if (!draggedItem) return

    // Determine target status:
    // over could be a column droppable (status string) or another card id
    let targetStatus = draggedItem.status

    // Check if dropped on a column droppable
    const columnStatuses = COLUMNS.map((c) => c.status)
    if (columnStatuses.includes(overId)) {
      targetStatus = overId
    } else {
      // Dropped on a card — get that card's status
      const overItem = actionItems.find((i) => i.id === overId)
      if (overItem) targetStatus = overItem.status
    }

    if (draggedItem.status !== targetStatus) {
      moveActionItem(activeId, targetStatus)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-5">
        {COLUMNS.map((col) => {
          const items = actionItems.filter((i) => i.status === col.status)
          return (
            <KanbanColumn
              key={col.status}
              title={col.title}
              status={col.status}
              items={items}
              onAddItem={onAddItem}
              onEdit={onEdit}
            />
          )
        })}
      </div>

      <DragOverlay>
        {activeItem && (
          <ActionItemCard item={activeItem} isDragOverlay />
        )}
      </DragOverlay>
    </DndContext>
  )
}
