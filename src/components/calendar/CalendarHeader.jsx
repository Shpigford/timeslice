import { useRef } from 'react'
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar, Sun, Moon, Download, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function CalendarHeader({ currentDate, setCurrentDate, view, setView, dark, onToggleTheme, activeTab, onTabChange, onExport, onImport }) {
  const fileInputRef = useRef(null)

  const navigatePrev = () => {
    if (view === 'week') setCurrentDate(d => subWeeks(d, 1))
    else if (view === 'month') setCurrentDate(d => subMonths(d, 4))
  }

  const navigateNext = () => {
    if (view === 'week') setCurrentDate(d => addWeeks(d, 1))
    else if (view === 'month') setCurrentDate(d => addMonths(d, 4))
  }

  const goToday = () => setCurrentDate(new Date())

  const getTitle = () => {
    if (view === 'week') {
      const ws = startOfWeek(currentDate, { weekStartsOn: 0 })
      const we = endOfWeek(currentDate, { weekStartsOn: 0 })
      if (ws.getMonth() === we.getMonth()) {
        return format(ws, 'MMMM yyyy')
      }
      return `${format(ws, 'MMM d')} – ${format(we, 'MMM d, yyyy')}`
    }
    const lastMonth = addMonths(currentDate, 3)
    if (currentDate.getFullYear() === lastMonth.getFullYear()) {
      return `${format(currentDate, 'MMM')} – ${format(lastMonth, 'MMM yyyy')}`
    }
    return `${format(currentDate, 'MMM yyyy')} – ${format(lastMonth, 'MMM yyyy')}`
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        onImport(ev.target.result)
      } catch {
        alert('Invalid backup file')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="h-14 border-b border-border flex items-center justify-between px-4 bg-background/80 backdrop-blur-sm sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 mr-2">
          <Calendar className="h-5 w-5 text-primary" />
          <span className="font-bold text-lg tracking-tight">Timeslice</span>
        </div>

        <Button variant="outline" size="sm" onClick={goToday}>
          Today
        </Button>
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={navigatePrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={navigateNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <h1 className="text-base font-semibold min-w-[180px]">{getTitle()}</h1>
      </div>

      <div className="flex items-center gap-3">
        <Tabs value={activeTab} onValueChange={onTabChange}>
          <TabsList>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="h-5 w-px bg-border" />

        <Tabs value={view} onValueChange={setView}>
          <TabsList>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="h-5 w-px bg-border" />

        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onExport} title="Export data">
          <Download className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => fileInputRef.current?.click()} title="Import data">
          <Upload className="h-4 w-4" />
        </Button>
        <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleFileChange} />

        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggleTheme}>
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
