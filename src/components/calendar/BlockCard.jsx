import { useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { getTextColorForBg } from '@/lib/utils'
import { useTheme } from '@/hooks/useTheme'

export function BlockCard({ block, onClick, onDelete, onDragStart, onResize }) {
  const { dark } = useTheme()
  const textColor = getTextColorForBg(block.client_color, dark)
  const resizing = useRef(false)
  const startY = useRef(0)
  const startHours = useRef(0)

  const handleResizeStart = useCallback((e) => {
    e.stopPropagation()
    e.preventDefault()
    resizing.current = true
    startY.current = e.clientY
    startHours.current = block.hours

    const handleMove = (moveE) => {
      if (!resizing.current) return
      const delta = moveE.clientY - startY.current
      // ~30px per hour
      const hoursDelta = Math.round(delta / 30 * 2) / 2
      const newHours = Math.max(1, Math.min(10, startHours.current + hoursDelta))
      if (newHours !== block.hours && onResize) {
        onResize(block.id, newHours)
      }
    }

    const handleUp = () => {
      resizing.current = false
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleUp)
    }

    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleUp)
  }, [block.id, block.hours, onResize])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      <div
        draggable="true"
        onDragStart={onDragStart}
        onClick={onClick}
        className="group relative rounded-lg mb-1 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 active:shadow-lg select-none"
        style={{
          backgroundColor: block.client_color + '20',
          border: `1px solid ${block.client_color}30`,
          minHeight: `${Math.max(block.hours * 24, 28)}px`,
        }}
      >
        <div className="p-1.5 px-2">
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold truncate" style={{ color: textColor }}>
                {block.client_name}
              </div>
              <div className="text-[10px] font-medium opacity-70 flex items-center gap-1" style={{ color: textColor }}>
                {block.hours}h
                {block.note && (
                  <span className="inline-block w-1 h-1 rounded-full opacity-50" style={{ backgroundColor: textColor }} />
                )}
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete() }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 flex-shrink-0"
            >
              <X className="h-3 w-3" style={{ color: textColor }} />
            </button>
          </div>
        </div>
        {/* Resize handle */}
        {onResize && (
          <div
            onMouseDown={handleResizeStart}
            className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-8 h-1 rounded-full" style={{ backgroundColor: block.client_color }} />
          </div>
        )}
      </div>
    </motion.div>
  )
}
