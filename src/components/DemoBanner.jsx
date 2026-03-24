export function DemoBanner({ onClear }) {
  return (
    <div className="flex items-center justify-center gap-3 px-4 py-1.5 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/50 text-sm text-amber-800 dark:text-amber-200">
      <span>You're viewing sample data.</span>
      <button
        onClick={onClear}
        className="font-medium underline underline-offset-2 hover:text-amber-950 dark:hover:text-amber-100 transition-colors"
      >
        Start fresh
      </button>
    </div>
  )
}
