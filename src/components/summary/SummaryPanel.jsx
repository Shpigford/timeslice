import { useMemo } from 'react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export function SummaryPanel({ clients, blocks, currentDate }) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const monthLabel = format(currentDate, 'MMMM yyyy')

  const data = useMemo(() => {
    const startStr = format(monthStart, 'yyyy-MM-dd')
    const endStr = format(monthEnd, 'yyyy-MM-dd')
    const monthBlocks = blocks.filter(b => b.date >= startStr && b.date <= endStr)

    const totals = {}
    monthBlocks.forEach(b => {
      totals[b.client_id] = (totals[b.client_id] || 0) + b.hours
    })

    return clients
      .map(c => ({
        name: c.name,
        hours: totals[c.id] || 0,
        budget: c.monthly_hours || 0,
        color: c.color,
        id: c.id,
      }))
      .filter(c => c.hours > 0 || c.budget > 0)
      .sort((a, b) => b.hours - a.hours)
  }, [clients, blocks, monthStart, monthEnd])

  const totalHours = data.reduce((s, d) => s + d.hours, 0)
  const totalBudget = data.reduce((s, d) => s + d.budget, 0)

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-lg font-semibold mb-1">{monthLabel}</h2>
      <p className="text-sm text-muted-foreground mb-6">
        {totalHours} hours allocated{totalBudget > 0 ? ` of ${totalBudget} budgeted` : ''}
      </p>

      {data.length > 0 ? (
        <>
          <div className="h-64 mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20, top: 5, bottom: 5 }}>
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  width={100}
                  tickFormatter={(name) => name.length > 14 ? name.slice(0, 12) + '…' : name}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-popover)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value) => [`${value}h`, 'Hours']}
                />
                <Bar dataKey="hours" radius={[0, 4, 4, 0]} barSize={24}>
                  {data.map((entry) => (
                    <Cell key={entry.id} fill={entry.color} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2">
            {data.map(d => {
              const pct = d.budget > 0 ? Math.round((d.hours / d.budget) * 100) : null
              return (
                <div key={d.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{d.name}</div>
                    {d.budget > 0 && (
                      <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{
                            width: `${Math.min(pct, 100)}%`,
                            backgroundColor: d.color,
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="text-sm font-semibold tabular-nums">
                    {d.hours}h
                    {d.budget > 0 && (
                      <span className="text-xs text-muted-foreground font-normal"> / {d.budget}h</span>
                    )}
                  </div>
                  {pct !== null && (
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                      pct > 100 ? 'bg-destructive/10 text-destructive' :
                      pct > 80 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    }`}>
                      {pct}%
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </>
      ) : (
        <div className="text-center text-muted-foreground py-12">
          No time blocks allocated this month.
        </div>
      )}
    </div>
  )
}
