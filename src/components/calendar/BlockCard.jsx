import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { getColorInfo } from '@/lib/utils'

export function BlockCard({ block, maxHours = 4, onClick, onDelete, onDragStart }) {
  const heightPercent = Math.min((block.hours / maxHours) * 100, 100)
  const colorInfo = getColorInfo(block.client_color)

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
        className="group relative rounded-lg mb-1 cursor-pointer transition-shadow hover:shadow-md active:shadow-lg select-none"
        style={{
          backgroundColor: block.client_color + '30',
          borderLeft: `3px solid ${block.client_color}`,
          minHeight: `${Math.max(heightPercent * 0.8, 36)}px`,
        }}
      >
        <div className="p-1.5 px-2">
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold truncate" style={{ color: colorInfo?.dark || '#333' }}>
                {block.client_name}
              </div>
              <div className="text-[10px] font-medium opacity-70" style={{ color: colorInfo?.dark || '#333' }}>
                {block.hours}h
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete() }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-black/10 flex-shrink-0"
            >
              <X className="h-3 w-3" style={{ color: colorInfo?.dark || '#333' }} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
