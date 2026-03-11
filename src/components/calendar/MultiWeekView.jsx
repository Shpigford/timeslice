import { useMemo, useState } from 'react'
import {
  format, startOfWeek, addDays, addWeeks, isToday, isSameMonth
} from 'date-fns'
import { motion } from 'framer-motion'

export function MultiWeekView({ currentDate, blocks, onDropClient, onBlockClick }) {
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
                  className={`border-r border-b border-border min-h-[72px] p-1 transition-colors ${
                    today ? 'bg-today/20 dark:bg-today-dark/20' : 'hover:bg-muted/30'
                  } ${isDragOver ? 'bg-primary/5 ring-2 ring-primary/20 ring-inset' : ''}`}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragOverDay(dateStr)
                  }}
                  onDragLeave={() => setDragOverDay(null)}
                  onDrop={(e) => handleDrop(e, day)}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-[10px] font-medium ${
                      today ? 'bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full' : 'text-muted-foreground'
                    }`}>
                      {format(day, 'MMM d')}
                    </span>
                    {totalHours > 0 && (
                      <span className="text-[9px] text-muted-foreground">{totalHours}h</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-0.5">
                    {dayBlocks.map(block => (
                      <div
                        key={block.id}
                        className="w-2.5 h-2.5 rounded-sm cursor-pointer hover:scale-125 transition-transform"
                        style={{ backgroundColor: block.client_color }}
                        title={`${block.client_name} - ${block.hours}h`}
                        onClick={() => onBlockClick(block)}
                      />
                    ))}
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
