import { useState } from 'react'
import { Plus, Edit2, Trash2, GripVertical, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { CLIENT_COLORS } from '@/lib/utils'
import { setDragPreview } from '@/lib/dragPreview'
import { motion, AnimatePresence } from 'framer-motion'

export function ClientSidebar({ clients, onAdd, onUpdate, onDelete, blocks }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [name, setName] = useState('')
  const [color, setColor] = useState(CLIENT_COLORS[0].value)
  const [monthlyHours, setMonthlyHours] = useState('')
  const [deleteClientId, setDeleteClientId] = useState(null)

  const openAdd = () => {
    setEditingClient(null)
    setName('')
    setColor(CLIENT_COLORS[0].value)
    setMonthlyHours('')
    setDialogOpen(true)
  }

  const openEdit = (client) => {
    setEditingClient(client)
    setName(client.name)
    setColor(client.color)
    setMonthlyHours(client.monthly_hours?.toString() || '')
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!name.trim()) return
    if (editingClient) {
      await onUpdate(editingClient.id, {
        name: name.trim(),
        color,
        monthly_hours: parseFloat(monthlyHours) || 0,
      })
    } else {
      await onAdd(name.trim(), parseFloat(monthlyHours) || 0, color)
    }
    setDialogOpen(false)
  }

  const handleDeleteConfirm = async () => {
    if (deleteClientId) {
      await onDelete(deleteClientId)
      setDeleteClientId(null)
    }
  }

  // Calculate hours this month per client
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const monthlyTotals = {}
  blocks.forEach(b => {
    if (b.date.startsWith(currentMonth)) {
      monthlyTotals[b.client_id] = (monthlyTotals[b.client_id] || 0) + b.hours
    }
  })

  return (
    <div className="w-52 border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex flex-col h-full">
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Clients</h2>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={openAdd}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <AnimatePresence>
          {clients.map(client => {
            const used = monthlyTotals[client.id] || 0
            const budget = client.monthly_hours || 0

            return (
              <div
                key={client.id}
                className="group flex items-center gap-2 p-2 rounded-lg hover:bg-accent cursor-grab active:cursor-grabbing transition-colors mb-1"
                draggable="true"
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/timeslice-client', JSON.stringify(client))
                  e.dataTransfer.effectAllowed = 'copy'
                  setDragPreview(e, client.name, client.color)
                }}
              >
                <GripVertical className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0 ring-1 ring-black/10"
                  style={{ backgroundColor: client.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{client.name}</div>
                  {budget > 0 && (
                    <>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                        <Clock className="h-2.5 w-2.5" />
                        <span>{used} / {budget} hrs</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1 mt-1">
                        <div
                          className="h-1 rounded-full transition-all"
                          style={{
                            width: `${Math.min((used / budget) * 100, 100)}%`,
                            backgroundColor: client.color,
                          }}
                        />
                      </div>
                    </>
                  )}
                </div>
                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => { e.stopPropagation(); openEdit(client) }}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:text-destructive"
                    onClick={(e) => { e.stopPropagation(); setDeleteClientId(client.id) }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )
          })}
        </AnimatePresence>

        {clients.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-8 px-4">
            No clients yet. Click + to add your first client.
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingClient ? 'Edit Client' : 'Add Client'}</DialogTitle>
            <DialogDescription>
              {editingClient ? 'Update client details below.' : 'Create a new client to start tracking time.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Client name"
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hours">Monthly Hours Budget</Label>
              <Input
                id="hours"
                type="number"
                value={monthlyHours}
                onChange={e => setMonthlyHours(e.target.value)}
                placeholder="0 (optional)"
              />
            </div>
            <div className="grid gap-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {CLIENT_COLORS.map(c => (
                  <button
                    key={c.value}
                    className={`w-7 h-7 rounded-full transition-all ring-offset-2 ring-offset-background ${
                      color === c.value ? 'ring-2 ring-ring scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.value }}
                    onClick={() => setColor(c.value)}
                    type="button"
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingClient ? 'Save' : 'Add Client'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteClientId}
        onOpenChange={(open) => !open && setDeleteClientId(null)}
        title="Delete Client"
        description="Are you sure you want to delete this client and all their time blocks? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
