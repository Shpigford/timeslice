import { useMemo, useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths, isSameMonth, isToday
} from 'date-fns'
import { motion } from 'framer-motion'
import { getTextColorForBg } from '@/lib/utils'
import { useTheme } from '@/hooks/useTheme'

function MonthGrid({ month, blocks, dragOverDay, onDragOver, onDragLeave, onDrop, onBlockClick, onBlockUpdate, onContextMenu, dark }) {
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
      <div className="grid border-t border-l border-border" style={{ gridTemplateColumns: "0.4fr 1fr 1fr 1fr 1fr 1fr 0.4fr" }}>
        {calendarDays.map((day, idx) => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const dayBlocks = blocksByDate[dateStr] || []
          const inMonth = isSameMonth(day, month)
          const today = isToday(day)
          const isDragOver = dragOverDay === dateStr

          return (
            <div
              key={idx}
              className={`border-r border-b border-border min-h-[68px] p-1 transition-colors ${
                !inMonth ? 'bg-muted/30 text-muted-foreground/50' : 'hover:bg-muted/30'
              } ${today ? 'bg-today/20 dark:bg-today-dark/20' : ''} ${
                isDragOver ? 'bg-primary/5 ring-2 ring-primary/20 ring-inset' : ''
              }`}
              onDragOver={(e) => onDragOver(e, day)}
              onDragLeave={onDragLeave}
              onDrop={(e) => onDrop(e, day)}
              onContextMenu={(e) => onContextMenu(e, day)}
            >
              <div className="text-[10px] font-medium mb-0.5 h-5 flex items-center">
                <span className={`${
                  today ? 'bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center' : ''
                }`}>
                  {format(day, 'd')}
                </span>
              </div>
              <div className="space-y-0.5">
                {dayBlocks.slice(0, 3).map(block => (
                  block.type === 'blocked' ? (
                    <div
                      key={block.id}
                      className="text-[10px] font-medium px-1 py-0.5 rounded-sm truncate text-muted-foreground"
                      style={{
                        background: `repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(128,128,128,0.1) 3px, rgba(128,128,128,0.1) 6px)`,
                        backgroundColor: 'var(--color-muted)',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      Blocked
                    </div>
                  ) : (
                    <div
                      key={block.id}
                      draggable
                      onDragStart={(e) => {
                        e.stopPropagation()
                        e.dataTransfer.setData('application/timeslice-block', JSON.stringify(block))
                        e.dataTransfer.effectAllowed = 'move'
                      }}
                      className="text-[10px] font-medium px-1 py-0.5 rounded-sm truncate cursor-grab active:cursor-grabbing transition-all"
                      style={{
                        backgroundColor: block.client_color + '30',
                        color: getTextColorForBg(block.client_color, dark),
                        boxShadow: 'inset 0 0 0 0px transparent',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.boxShadow = `inset 0 0 0 1px ${block.client_color}90`}
                      onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'inset 0 0 0 0px transparent'}
                      onClick={() => onBlockClick(block)}
                    >
                      {block.client_name} · {block.hours}h
                    </div>
                  )
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

export function MonthView({ currentDate, blocks, onDropClient, onBlockClick, onBlockDelete, onBlockUpdate, onAddBlockedTime }) {
  const { dark } = useTheme()
  const [dragOverDay, setDragOverDay] = useState(null)
  const [contextMenu, setContextMenu] = useState(null)

  const closeMenu = useCallback(() => setContextMenu(null), [])

  useEffect(() => {
    if (!contextMenu) return
    const handleClick = () => closeMenu()
    const handleKey = (e) => { if (e.key === 'Escape') closeMenu() }
    document.addEventListener('click', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('click', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [contextMenu, closeMenu])

  const handleContextMenu = (e, day) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, date: format(day, 'yyyy-MM-dd') })
  }

  const months = useMemo(() => [
    currentDate,
    addMonths(currentDate, 1),
    addMonths(currentDate, 2),
    addMonths(currentDate, 3),
  ], [currentDate])

  const blocksByDate = useMemo(() => {
    const map = {}
    blocks.forEach(block => {
      if (!map[block.date]) map[block.date] = []
      map[block.date].push(block)
    })
    return map
  }, [blocks])

  const getDropSlot = useCallback((dateStr, draggedBlock = null) => {
    const blockedSlots = new Set(
      (blocksByDate[dateStr] || [])
        .filter(block => block.type === 'blocked')
        .map(block => block.slot)
    )

    if (draggedBlock) {
      return blockedSlots.has(draggedBlock.slot) ? null : draggedBlock.slot
    }

    if (!blockedSlots.has('AM')) return 'AM'
    if (!blockedSlots.has('PM')) return 'PM'
    return null
  }, [blocksByDate])

  const handleDragOver = (e, day) => {
    e.preventDefault()
    const key = format(day, 'yyyy-MM-dd')
    const isBlockDrag = e.dataTransfer.types.includes('application/timeslice-block')
    const blockData = isBlockDrag ? e.dataTransfer.getData('application/timeslice-block') : null
    const draggedBlock = blockData ? JSON.parse(blockData) : null
    const slot = getDropSlot(key, draggedBlock)
    if (!slot) {
      setDragOverDay(null)
      e.dataTransfer.dropEffect = 'none'
      return
    }
    e.dataTransfer.dropEffect = isBlockDrag ? 'move' : 'copy'
    if (dragOverDay !== key) setDragOverDay(key)
  }

  const handleDrop = (e, day) => {
    e.preventDefault()
    setDragOverDay(null)
    const dateStr = format(day, 'yyyy-MM-dd')
    const blockData = e.dataTransfer.getData('application/timeslice-block')
    if (blockData) {
      const block = JSON.parse(blockData)
      if (!getDropSlot(dateStr, block)) return
      onBlockUpdate(block.id, { date: dateStr })
      return
    }
    const clientData = e.dataTransfer.getData('application/timeslice-client')
    if (clientData) {
      const client = JSON.parse(clientData)
      const slot = getDropSlot(dateStr)
      if (!slot) return
      onDropClient(client.id, dateStr, slot)
    }
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 overflow-auto p-4"
    >
      {/* 2x2 grid of months */}
      {[0, 2].map(row => (
        <div key={row} className={`flex gap-6 ${row === 0 ? 'mb-6' : ''}`}>
          {months.slice(row, row + 2).map((month, i) => (
            <div key={i} className="flex-1 min-w-0">
              <div className="grid mb-1" style={{ gridTemplateColumns: "0.4fr 1fr 1fr 1fr 1fr 1fr 0.4fr" }}>
                {weekDays.map(d => (
                  <div key={d} className="text-center text-[10px] font-medium text-muted-foreground uppercase py-1">
                    {d}
                  </div>
                ))}
              </div>
              <MonthGrid
                month={month}
                blocks={blocks}
                dragOverDay={dragOverDay}
                onDragOver={handleDragOver}
                onDragLeave={() => setDragOverDay(null)}
                onDrop={handleDrop}
                onBlockClick={onBlockClick}
                onBlockUpdate={onBlockUpdate}
                onContextMenu={handleContextMenu}
                dark={dark}
              />
            </div>
          ))}
        </div>
      ))}

      {contextMenu && createPortal(
        <div
          className="fixed z-50 bg-popover border border-border rounded-md shadow-lg py-0.5"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          {[
            { label: 'Block Morning', scope: 'morning' },
            { label: 'Block Afternoon', scope: 'afternoon' },
            { label: 'Block Full Day', scope: 'full-day' },
          ].map(({ label, scope }) => (
            <button
              key={scope}
              className="block w-full text-left px-2.5 py-1 text-xs hover:bg-muted transition-colors whitespace-nowrap"
              onClick={() => {
                onAddBlockedTime(contextMenu.date, scope)
                closeMenu()
              }}
            >
              {label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </motion.div>
  )
}
