import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trash2 } from 'lucide-react'

export function BlockEditDialog({ block, open, onOpenChange, onSave, onDelete, clients }) {
  const [hours, setHours] = useState('6')
  const [slot, setSlot] = useState('AM')
  const [date, setDate] = useState('')
  const [clientId, setClientId] = useState('')

  // Reset state when block changes
  useEffect(() => {
    if (block) {
      setHours(block.hours?.toString() || '6')
      setSlot(block.slot || 'AM')
      setDate(block.date || '')
      setClientId(block.client_id?.toString() || '')
    }
  }, [block])

  const handleSave = () => {
    onSave(block.id, {
      hours: parseFloat(hours) || 6,
      slot,
      date,
      client_id: parseInt(clientId),
    })
    onOpenChange(false)
  }

  if (!block) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit Block</DialogTitle>
          <DialogDescription>Update the time block details.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>Client</Label>
            <select
              value={clientId}
              onChange={e => setClientId(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Slot</Label>
            <div className="flex gap-2">
              {['AM', 'PM'].map(s => (
                <Button
                  key={s}
                  variant={slot === s ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setSlot(s)}
                >
                  {s === 'AM' ? 'Morning' : 'Afternoon'}
                </Button>
              ))}
            </div>
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>Hours</Label>
              <span className="text-sm font-semibold tabular-nums">{hours}h</span>
            </div>
            <input
              type="range"
              min="1"
              max="8"
              step="0.5"
              value={hours}
              onChange={e => setHours(e.target.value)}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground px-0.5">
              <span>1h</span>
              <span>4h</span>
              <span>8h</span>
            </div>
          </div>
        </div>
        <DialogFooter className="flex !justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => { onDelete(block.id); onOpenChange(false) }}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
