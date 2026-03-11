import { useMemo, useState } from 'react'
import {
  format, startOfWeek, addDays, addWeeks, isToday, isSameMonth
} from 'date-fns'
import { motion } from 'framer-motion'

function getContrastColor(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.55 ? '#1a1a1a' : '#ffffff'
}

export function MultiWeekView({ currentDate, blocks, onDropClient, onBlockClick, onBlockUpdate }) {
  const [dragOverDay, setDragOverDay] = useState(null)
  const WEEKS = 6

  const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 0 }), [currentDate])

  const weeks = useMemo(() => {
    return Array.from({ length: WEEKS }, (_, w) => {
      const start = addWeeks(weekStart, w)
      return Array.from({ length: 7 }, (_, d) => addDays(start, d))
    })
  }, [weekStart])

  const blocksByDate = useMemo(() => {
    const map = {}
    blocks.forEach(b => {
      if (!map[b.date]) map[b.date] = []
      map[b.date].push(b)
    })
    return map
  }, [blocks])

  const handleDrop = (e, day) => {
    e.preventDefault()
    setDragOverDay(null)
    const blockData = e.dataTransfer.getData('application/timeslice-block')
    if (blockData) {
      const block = JSON.parse(blockData)
      onBlockUpdate(block.id, { date: format(day, 'yyyy-MM-dd') })
      return
    }
    const clientData = e.dataTransfer.getData('application/timeslice-client')
    if (clientData) {
      const client = JSON.parse(clientData)
      onDropClient(client.id, format(day, 'yyyy-MM-dd'), 'AM')
    }
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 overflow-auto p-4"
    >
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map(d => (
          <div key={d} className="text-center text-xs font-medium text-muted-foreground uppercase py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="border-t border-l border-border">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7">
            {week.map((day, di) => {
              const dateStr = format(day, 'yyyy-MM-dd')
              const dayBlocks = blocksByDate[dateStr] || []
              const today = isToday(day)
              const isDragOver = dragOverDay === dateStr
              const totalHours = dayBlocks.reduce((s, b) => s + b.hours, 0)

              return (
                <div
                  key={di}
                  className={`border-r border-b border-border min-h-[90px] p-1 transition-colors ${
                    today ? 'bg-today/20 dark:bg-today-dark/20' : 'hover:bg-muted/30'
                  } ${isDragOver ? 'bg-primary/5 ring-2 ring-primary/20 ring-inset' : ''}`}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragOverDay(dateStr)
                  }}
                  onDragLeave={() => setDragOverDay(null)}
                  onDrop={(e) => handleDrop(e, day)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[11px] font-medium ${
                      today ? 'bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full' : 'text-muted-foreground'
                    }`}>
                      {format(day, 'd')}
                    </span>
                    {totalHours > 0 && (
                      <span className="text-[9px] text-muted-foreground font-medium">{totalHours}h</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {dayBlocks.slice(0, 3).map(block => (
                      <div
                        key={block.id}
                        draggable
                        onDragStart={(e) => {
                          e.stopPropagation()
                          e.dataTransfer.setData('application/timeslice-block', JSON.stringify(block))
                          e.dataTransfer.effectAllowed = 'move'
                        }}
                        className="rounded px-1 py-0.5 cursor-grab active:cursor-grabbing hover:opacity-80 transition-opacity truncate"
                        style={{
                          backgroundColor: block.client_color,
                          color: getContrastColor(block.client_color || '#888888')
                        }}
                        onClick={() => onBlockClick(block)}
                      >
                        <span className="text-[10px] font-medium leading-tight">
                          {block.client_name} · {block.hours}h
                        </span>
                      </div>
                    ))}
                    {dayBlocks.length > 3 && (
                      <span className="text-[9px] text-muted-foreground pl-1">
                        +{dayBlocks.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </motion.div>
  )
}
