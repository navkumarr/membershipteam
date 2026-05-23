import { useMemo } from 'react'
import { addDays, startOfDay, differenceInDays, format, parseISO, isToday } from 'date-fns'
import useStore from '../../store/useStore'

const STATUS_COLORS = {
  'todo': '#94a3b8',
  'in-progress': '#f59e0b',
  'done': '#10b981',
}

const STATUS_LABELS = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'done': 'Done',
}

const DAY_WIDTH = 28
const RANGE_START_OFFSET = 30
const RANGE_END_OFFSET = 60
const TOTAL_DAYS = RANGE_START_OFFSET + RANGE_END_OFFSET + 1
const ROW_HEIGHT = 34
const ROW_GAP = 6
const GROUP_PADDING = 10

export default function TimelineView() {
  const actionItems = useStore((s) => s.actionItems)
  const teamMembers = useStore((s) => s.teamMembers)

  const today = startOfDay(new Date())
  const rangeStart = addDays(today, -RANGE_START_OFFSET)

  const days = useMemo(() => {
    return Array.from({ length: TOTAL_DAYS }, (_, i) => {
      const date = addDays(rangeStart, i)
      return {
        date,
        label: format(date, 'd'),
        monthLabel: format(date, 'MMM yyyy'),
        isMonthStart: date.getDate() === 1,
        isWeekStart: date.getDay() === 1,
        isTodayCol: isToday(date),
      }
    })
  }, [rangeStart])

  const groups = useMemo(() => {
    const byAssignee = {}
    actionItems.forEach((item) => {
      const key = item.assigneeId || '__unassigned__'
      if (!byAssignee[key]) byAssignee[key] = []
      byAssignee[key].push(item)
    })

    return Object.entries(byAssignee).map(([assigneeId, items]) => {
      const member = teamMembers.find((m) => m.id === assigneeId)
      return {
        assigneeId,
        label: member ? member.name : 'Unassigned',
        avatarColor: member?.avatarColor || '#9ca3af',
        items,
      }
    })
  }, [actionItems, teamMembers])

  const todayX = RANGE_START_OFFSET * DAY_WIDTH + DAY_WIDTH / 2
  const totalWidth = TOTAL_DAYS * DAY_WIDTH

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <div style={{ minWidth: totalWidth + 160 }}>

          {/* Month header */}
          <div className="flex border-b border-gray-200 bg-gray-50 sticky top-0 z-30">
            <div className="w-40 flex-shrink-0 px-3 py-2 text-xs font-medium text-gray-500 border-r border-gray-200" />
            <div className="relative flex-1" style={{ width: totalWidth }}>
              {days.map((d, i) =>
                d.isMonthStart || i === 0 ? (
                  <span
                    key={i}
                    className="absolute top-2 text-xs font-semibold text-gray-600 pointer-events-none"
                    style={{ left: i * DAY_WIDTH + 4 }}
                  >
                    {d.monthLabel}
                  </span>
                ) : null
              )}
              <div className="h-7" />
            </div>
          </div>

          {/* Day sub-header */}
          <div className="flex border-b border-gray-200 bg-gray-50 sticky top-9 z-30">
            <div className="w-40 flex-shrink-0 border-r border-gray-200" />
            <div className="flex" style={{ width: totalWidth }}>
              {days.map((d, i) => (
                <div
                  key={i}
                  style={{ width: DAY_WIDTH }}
                  className={`flex-shrink-0 flex items-center justify-center text-xs py-1 border-r border-gray-100 ${
                    d.isTodayCol
                      ? 'bg-indigo-50 text-indigo-600 font-bold'
                      : 'text-gray-400'
                  }`}
                >
                  {d.isWeekStart || d.isMonthStart || d.isTodayCol ? d.label : ''}
                </div>
              ))}
            </div>
          </div>

          {/* Rows */}
          {groups.map((group) => {
            const visibleItems = group.items.filter((item) => item.dueDate)
            const groupHeight = visibleItems.length * (ROW_HEIGHT + ROW_GAP) + GROUP_PADDING * 2

            return (
              <div key={group.assigneeId} className="flex border-b border-gray-100 last:border-0">
                {/* Assignee label */}
                <div className="w-40 flex-shrink-0 px-3 flex items-start gap-2 border-r border-gray-100 pt-3">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: group.avatarColor }}
                  >
                    {group.label[0]}
                  </div>
                  <span className="text-xs text-gray-700 font-medium leading-tight pt-1">{group.label}</span>
                </div>

                {/* Timeline area */}
                <div className="relative flex-1" style={{ height: groupHeight, width: totalWidth }}>
                  {/* Vertical grid lines */}
                  {days.map((d, i) => (
                    <div
                      key={i}
                      className={`absolute top-0 bottom-0 border-r ${
                        d.isTodayCol
                          ? 'border-indigo-200 bg-indigo-50/30'
                          : d.isWeekStart
                          ? 'border-gray-200'
                          : 'border-gray-100'
                      }`}
                      style={{ left: i * DAY_WIDTH, width: DAY_WIDTH }}
                    />
                  ))}

                  {/* Today line */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-indigo-400 z-20 pointer-events-none"
                    style={{ left: todayX }}
                  />

                  {/* Item bars */}
                  {visibleItems.map((item, rowIdx) => {
                    const dueDate = startOfDay(parseISO(item.dueDate))
                    const startDate = item.startDate
                      ? startOfDay(parseISO(item.startDate))
                      : dueDate

                    const startIdx = differenceInDays(startDate, rangeStart)
                    const endIdx = differenceInDays(dueDate, rangeStart)

                    // Clamp to visible range
                    const clampedStart = Math.max(0, startIdx)
                    const clampedEnd = Math.min(TOTAL_DAYS - 1, endIdx)

                    if (clampedEnd < 0 || clampedStart >= TOTAL_DAYS) return null

                    const x = clampedStart * DAY_WIDTH
                    const barWidth = Math.max(DAY_WIDTH, (clampedEnd - clampedStart + 1) * DAY_WIDTH)
                    const y = GROUP_PADDING + rowIdx * (ROW_HEIGHT + ROW_GAP)
                    const color = STATUS_COLORS[item.status] || '#94a3b8'
                    const isOverdue = item.dueDate && new Date(item.dueDate) < new Date() && item.status !== 'done'

                    const wasClippedLeft = startIdx < 0
                    const wasClippedRight = endIdx >= TOTAL_DAYS

                    return (
                      <div
                        key={item.id}
                        className="absolute z-10 flex items-center"
                        style={{ left: x, top: y, width: barWidth + 200 }}
                        title={`${item.title}\n${item.startDate ? format(startDate, 'MMM d') : '—'} → ${format(dueDate, 'MMM d')}`}
                      >
                        {/* Bar */}
                        <div
                          className="flex items-center h-6 relative flex-shrink-0"
                          style={{ width: barWidth }}
                        >
                          <div
                            className="absolute inset-0 opacity-20 rounded"
                            style={{ backgroundColor: color }}
                          />
                          <div
                            className={`absolute inset-y-0 left-0 rounded ${wasClippedLeft ? 'rounded-l-none' : 'rounded-l'} ${wasClippedRight ? 'rounded-r-none' : 'rounded-r'}`}
                            style={{
                              width: '100%',
                              backgroundColor: color,
                              opacity: 0.85,
                            }}
                          />
                          {/* Left cap indicator for clipped bars */}
                          {wasClippedLeft && (
                            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-white/60" />
                          )}
                        </div>

                        {/* Label after bar */}
                        <span
                          className={`ml-2 text-xs font-medium whitespace-nowrap truncate max-w-[160px] ${
                            isOverdue ? 'text-red-600' : 'text-gray-700'
                          }`}
                        >
                          {item.title}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {/* Legend */}
          <div className="flex items-center gap-4 px-4 py-3 bg-gray-50 border-t border-gray-200">
            {Object.entries(STATUS_LABELS).map(([status, label]) => (
              <div key={status} className="flex items-center gap-1.5">
                <div
                  className="w-8 h-3 rounded"
                  style={{ backgroundColor: STATUS_COLORS[status], opacity: 0.85 }}
                />
                <span className="text-xs text-gray-500">{label}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5 ml-2">
              <div className="w-0.5 h-4 bg-indigo-400" />
              <span className="text-xs text-gray-500">Today</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
