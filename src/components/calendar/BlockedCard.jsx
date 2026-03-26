import { motion } from 'framer-motion'
import { X } from 'lucide-react'

export function BlockedCard({ onDelete }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      <div
        className="group relative rounded-lg mb-1 select-none"
        style={{
          background: `repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(128,128,128,0.1) 4px, rgba(128,128,128,0.1) 8px)`,
          backgroundColor: 'var(--color-muted)',
          border: '1px solid var(--color-border)',
          minHeight: '28px',
        }}
      >
        <div className="p-1.5 px-2 flex items-start justify-between gap-1">
          <div className="text-xs font-medium text-muted-foreground">
            Blocked
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 flex-shrink-0"
          >
            <X className="h-3 w-3 text-muted-foreground" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
