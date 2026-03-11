import { useMemo, useState } from 'react'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, isSameMonth, isToday, isSameDay
} from 'date-fns'
import { motion } from 'framer-motion'

export function MonthView({ currentDate, blocks, onDropClient, onBlockClick, onBlockDelete }) {
  const [dragOverDay, setDragOverDay] = useState(null)

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const days = []
    let day = calStart
    while (day <= calEnd) {
      days.push(day)
      day = addDays(day, 1)
    }
    return days
  }, [currentDate])

  const blocksByDate = useMemo(() => {
    const map = {}
    blocks.forEach(b => {
      if (!map[b.date]) map[b.date] = []
      map[b.date].push(b)
    })
    return map
  }, [blocks])

  const handleDragOver = (e, day) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    const key = format(day, 'yyyy-MM-dd')
    if (dragOverDay !== key) setDragOverDay(key)
  }

  const handleDrop = (e, day) => {
    e.preventDefault()
    setDragOverDay(null)
    const clientData = e.dataTransfer.getData('application/timeslice-client')
    if (clientData) {
      const client = JSON.parse(clientData)
      onDropClient(client.id, format(day, 'yyyy-MM-dd'), 'AM')
    }
  }

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 overflow-auto p-4"
    >
      {/* Header */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map(d => (
          <div key={d} className="text-center text-xs font-medium text-muted-foreground uppercase py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 border-t border-l border-border">
        {calendarDays.map((day, idx) => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const dayBlocks = blocksByDate[dateStr] || []
          const inMonth = isSameMonth(day, currentDate)
          const today = isToday(day)
          const isDragOver = dragOverDay === dateStr

          return (
            <div
              key={idx}
              className={`border-r border-b border-border min-h-[100px] p-1.5 transition-colors ${
                !inMonth ? 'bg-muted/30 text-muted-foreground/50' : ''
              } ${today ? 'bg-today/20 dark:bg-today-dark/20' : ''} ${
                isDragOver ? 'bg-primary/5 ring-2 ring-primary/20 ring-inset' : ''
              }`}
              onDragOver={(e) => handleDragOver(e, day)}
              onDragLeave={() => setDragOverDay(null)}
              onDrop={(e) => handleDrop(e, day)}
            >
              <div className={`text-xs font-medium mb-1 ${
                today ? 'bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center' : ''
              }`}>
                {format(day, 'd')}
              </div>
              <div className="space-y-0.5">
                {dayBlocks.slice(0, 3).map(block => (
                  <div
                    key={block.id}
                    className="text-[10px] font-medium px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80 transition-opacity"
                    style={{
                      backgroundColor: block.client_color + '30',
                      color: block.client_color,
                      borderLeft: `2px solid ${block.client_color}`,
                    }}
                    onClick={() => onBlockClick(block)}
                  >
                    {block.client_name} · {block.hours}h
                  </div>
                ))}
                {dayBlocks.length > 3 && (
                  <div className="text-[10px] text-muted-foreground px-1.5">
                    +{dayBlocks.length - 3} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
