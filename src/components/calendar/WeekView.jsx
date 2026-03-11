import { useMemo, useState } from 'react'
import { format, startOfWeek, addDays, isToday, isSameDay } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { BlockCard } from './BlockCard'
import { setDragPreview } from '@/lib/dragPreview'

export function WeekView({ currentDate, blocks, onDropClient, onBlockClick, onBlockUpdate, onBlockDelete }) {
  const [dragOverSlot, setDragOverSlot] = useState(null)

  const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 0 }), [currentDate])
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart])

  const blocksByDaySlot = useMemo(() => {
    const map = {}
    blocks.forEach(block => {
      const key = `${block.date}-${block.slot}`
      if (!map[key]) map[key] = []
      map[key].push(block)
    })
    return map
  }, [blocks])

  const handleDragOver = (e, date, slot) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    const key = `${format(date, 'yyyy-MM-dd')}-${slot}`
    if (dragOverSlot !== key) setDragOverSlot(key)
  }

  const handleDragLeave = () => setDragOverSlot(null)

  const handleDrop = (e, date, slot) => {
    e.preventDefault()
    setDragOverSlot(null)

    const clientData = e.dataTransfer.getData('application/timeslice-client')
    const blockData = e.dataTransfer.getData('application/timeslice-block')

    if (clientData) {
      const client = JSON.parse(clientData)
      onDropClient(client.id, format(date, 'yyyy-MM-dd'), slot)
    } else if (blockData) {
      const block = JSON.parse(blockData)
      onBlockUpdate(block.id, { date: format(date, 'yyyy-MM-dd'), slot })
    }
  }

  const slots = ['AM', 'PM']

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 overflow-auto"
    >
      <div className="grid grid-cols-7 min-h-full" style={{ minHeight: 'calc(100vh - 64px)' }}>
        {days.map((day, dayIdx) => {
          const today = isToday(day)
          return (
            <div
              key={dayIdx}
              className={`border-r border-border last:border-r-0 flex flex-col ${
                today ? 'bg-today/30 dark:bg-today-dark/30' : 'hover:bg-muted/30'
              } transition-colors`}
            >
              {/* Day header */}
              <div className={`px-3 py-2 border-b border-border text-center sticky top-0 z-10 backdrop-blur-sm ${
                today ? 'bg-today/50 dark:bg-today-dark/50' : 'bg-background/80'
              }`}>
                <div className="text-xs font-medium text-muted-foreground uppercase">
                  {format(day, 'EEE')}
                </div>
                <div className={`text-lg font-semibold mt-0.5 ${
                  today ? 'bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center mx-auto' : ''
                }`}>
                  {format(day, 'd')}
                </div>
              </div>

              {/* AM/PM slots */}
              {slots.map(slot => {
                const dateStr = format(day, 'yyyy-MM-dd')
                const key = `${dateStr}-${slot}`
                const slotBlocks = blocksByDaySlot[key] || []
                const isDragOver = dragOverSlot === key
                const totalHours = slotBlocks.reduce((sum, b) => sum + b.hours, 0)

                return (
                  <div
                    key={slot}
                    className={`flex-1 min-h-[120px] p-1.5 border-b border-border/50 last:border-b-0 transition-colors ${
                      isDragOver ? 'bg-primary/5 ring-2 ring-primary/20 ring-inset' : ''
                    }`}
                    onDragOver={(e) => handleDragOver(e, day, slot)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, day, slot)}
                  >
                    <div className="text-[10px] font-medium text-muted-foreground/60 uppercase mb-1 px-1">
                      {slot === 'AM' ? 'Morning' : 'Afternoon'}
                    </div>
                    <AnimatePresence mode="popLayout">
                      {slotBlocks.map(block => (
                        <BlockCard
                          key={block.id}
                          block={block}
                          maxHours={8}
                          onClick={() => onBlockClick(block)}
                          onDelete={() => onBlockDelete(block.id)}
                          onDragStart={(e) => {
                            e.dataTransfer.setData('application/timeslice-block', JSON.stringify(block))
                            e.dataTransfer.effectAllowed = 'move'
                            setDragPreview(e, `${block.client_name} · ${block.hours}h`, block.client_color)
                          }}
                          onResize={(id, newHours) => onBlockUpdate(id, { hours: newHours })}
                        />
                      ))}
                    </AnimatePresence>
                    {isDragOver && slotBlocks.length === 0 && (
                      <div className="h-16 rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 flex items-center justify-center text-xs text-muted-foreground animate-pulse">
                        Drop here
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
