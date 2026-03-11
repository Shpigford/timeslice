import { useMemo, useState } from 'react'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths, isSameMonth, isToday
} from 'date-fns'
import { motion } from 'framer-motion'
import { getTextColorForBg } from '@/lib/utils'
import { useTheme } from '@/hooks/useTheme'

function MonthGrid({ month, blocks, dragOverDay, onDragOver, onDragLeave, onDrop, onBlockClick, onBlockUpdate, dark }) {
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(month)
    const monthEnd = endOfMonth(month)
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 })
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

    const days = []
    let day = calStart
    while (day <= calEnd) {
      days.push(day)
      day = addDays(day, 1)
    }
    return days
  }, [month])

  const blocksByDate = useMemo(() => {
    const map = {}
    blocks.forEach(b => {
      if (!map[b.date]) map[b.date] = []
      map[b.date].push(b)
    })
    return map
  }, [blocks])

  return (
    <div className="flex-1 min-w-0">
      <h2 className="text-sm font-semibold text-center mb-2 text-foreground">
        {format(month, 'MMMM yyyy')}
      </h2>
      <div className="grid grid-cols-7 border-t border-l border-border">
        {calendarDays.map((day, idx) => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const dayBlocks = blocksByDate[dateStr] || []
          const inMonth = isSameMonth(day, month)
          const today = isToday(day)
          const isDragOver = dragOverDay === dateStr

          return (
            <div
              key={idx}
              className={`border-r border-b border-border min-h-[90px] p-1 transition-colors ${
                !inMonth ? 'bg-muted/30 text-muted-foreground/50' : 'hover:bg-muted/30'
              } ${today ? 'bg-today/20 dark:bg-today-dark/20' : ''} ${
                isDragOver ? 'bg-primary/5 ring-2 ring-primary/20 ring-inset' : ''
              }`}
              onDragOver={(e) => onDragOver(e, day)}
              onDragLeave={onDragLeave}
              onDrop={(e) => onDrop(e, day)}
            >
              <div className={`text-xs font-medium mb-0.5 ${
                today ? 'bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-[10px]' : ''
              }`}>
                {format(day, 'd')}
              </div>
              <div className="space-y-0.5">
                {dayBlocks.slice(0, 3).map(block => (
                  <div
                    key={block.id}
                    draggable
                    onDragStart={(e) => {
                      e.stopPropagation()
                      e.dataTransfer.setData('application/timeslice-block', JSON.stringify(block))
                      e.dataTransfer.effectAllowed = 'move'
                    }}
                    className="text-[10px] font-medium px-1 py-0.5 rounded truncate cursor-grab active:cursor-grabbing hover:opacity-80 hover:shadow-sm transition-all"
                    style={{
                      backgroundColor: block.client_color + '30',
                      color: getTextColorForBg(block.client_color, dark),
                      borderLeft: `2px solid ${block.client_color}`,
                    }}
                    onClick={() => onBlockClick(block)}
                  >
                    {block.client_name} · {block.hours}h
                  </div>
                ))}
                {dayBlocks.length > 3 && (
                  <div className="text-[9px] text-muted-foreground px-1">
                    +{dayBlocks.length - 3} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function MonthView({ currentDate, blocks, onDropClient, onBlockClick, onBlockDelete, onBlockUpdate }) {
  const { dark } = useTheme()
  const [dragOverDay, setDragOverDay] = useState(null)

  const nextMonth = useMemo(() => addMonths(currentDate, 1), [currentDate])

  const handleDragOver = (e, day) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = e.dataTransfer.types.includes('application/timeslice-block') ? 'move' : 'copy'
    const key = format(day, 'yyyy-MM-dd')
    if (dragOverDay !== key) setDragOverDay(key)
  }

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
      {/* Day headers */}
      <div className="flex gap-6">
        {[0, 1].map(i => (
          <div key={i} className="flex-1 min-w-0">
            <div className="h-[22px]" /> {/* spacer for month title */}
            <div className="grid grid-cols-7">
              {weekDays.map(d => (
                <div key={d} className="text-center text-[10px] font-medium text-muted-foreground uppercase py-1">
                  {d}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Two month grids side by side */}
      <div className="flex gap-6">
        <MonthGrid
          month={currentDate}
          blocks={blocks}
          dragOverDay={dragOverDay}
          onDragOver={handleDragOver}
          onDragLeave={() => setDragOverDay(null)}
          onDrop={handleDrop}
          onBlockClick={onBlockClick}
          onBlockUpdate={onBlockUpdate}
          dark={dark}
        />
        <MonthGrid
          month={nextMonth}
          blocks={blocks}
          dragOverDay={dragOverDay}
          onDragOver={handleDragOver}
          onDragLeave={() => setDragOverDay(null)}
          onDrop={handleDrop}
          onBlockClick={onBlockClick}
          onBlockUpdate={onBlockUpdate}
          dark={dark}
        />
      </div>
    </motion.div>
  )
}
