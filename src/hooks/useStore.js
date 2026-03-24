import { useState, useCallback } from 'react'
import { load, save, genId } from '@/lib/storage'
import { getNextColor } from '@/lib/utils'

export function useStore() {
  const [clients, setClients] = useState(() => load('clients'))
  const [blocks, setBlocks] = useState(() => load('blocks'))
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setViewState] = useState(() => localStorage.getItem('timeslice-view') || 'month')
  const setView = (v) => { localStorage.setItem('timeslice-view', v); setViewState(v) }

  // Client CRUD
  const addClient = useCallback((name, monthlyHours = 0, selectedColor) => {
    const color = selectedColor || getNextColor(clients.map(c => c.color))
    const now = new Date().toISOString()
    const client = { id: genId(), name, color, monthly_hours: monthlyHours, archived: 0, created_at: now, updated_at: now }
    const updated = [...clients, client]
    save('clients', updated)
    setClients(updated)
    return client
  }, [clients])

  const updateClient = useCallback((id, data) => {
    const client = clients.find(c => c.id === id)
    if (!client) return
    const updated = { ...client, ...data, updated_at: new Date().toISOString() }
    const newClients = clients.map(c => c.id === id ? updated : c)
    save('clients', newClients)
    setClients(newClients)

    // Update denormalized client data on blocks
    if (data.color || data.name) {
      const newBlocks = blocks.map(b =>
        b.client_id === id ? { ...b, client_color: data.color || b.client_color, client_name: data.name || b.client_name } : b
      )
      save('blocks', newBlocks)
      setBlocks(newBlocks)
    }
    return updated
  }, [clients, blocks])

  const deleteClient = useCallback((id) => {
    const newClients = clients.filter(c => c.id !== id)
    const newBlocks = blocks.filter(b => b.client_id !== id)
    save('clients', newClients)
    save('blocks', newBlocks)
    setClients(newClients)
    setBlocks(newBlocks)
  }, [clients, blocks])

  const archiveClient = useCallback((id) => {
    const client = clients.find(c => c.id === id)
    if (!client) return
    const updated = { ...client, archived: client.archived ? 0 : 1, updated_at: new Date().toISOString() }
    const newClients = clients.map(c => c.id === id ? updated : c)
    save('clients', newClients)
    setClients(newClients)
    return updated
  }, [clients])

  // Block CRUD
  const addBlock = useCallback((clientId, date, slot, hours = 6) => {
    const client = clients.find(c => c.id === clientId)
    const now = new Date().toISOString()
    const block = {
      id: genId(), client_id: clientId, date, slot, hours,
      client_name: client?.name || '', client_color: client?.color || '',
      created_at: now, updated_at: now,
    }
    const updated = [...blocks, block]
    save('blocks', updated)
    setBlocks(updated)
    return block
  }, [clients, blocks])

  const updateBlock = useCallback((id, data) => {
    const block = blocks.find(b => b.id === id)
    if (!block) return
    const merged = { ...block, ...data, updated_at: new Date().toISOString() }
    // Re-resolve client fields if client_id changed
    if (data.client_id && data.client_id !== block.client_id) {
      const client = clients.find(c => c.id === data.client_id)
      merged.client_name = client?.name || ''
      merged.client_color = client?.color || ''
    }
    const updated = blocks.map(b => b.id === id ? merged : b)
    save('blocks', updated)
    setBlocks(updated)
    return merged
  }, [blocks, clients])

  const deleteBlock = useCallback((id) => {
    const updated = blocks.filter(b => b.id !== id)
    save('blocks', updated)
    setBlocks(updated)
  }, [blocks])

  // Export/Import
  const exportData = useCallback(() => {
    const data = JSON.stringify({ clients, blocks }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `timeslice-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [clients, blocks])

  const importData = useCallback((jsonString) => {
    const data = JSON.parse(jsonString)
    if (!Array.isArray(data.clients) || !Array.isArray(data.blocks)) {
      throw new Error('Invalid backup file')
    }
    save('clients', data.clients)
    save('blocks', data.blocks)
    setClients(data.clients)
    setBlocks(data.blocks)
  }, [])

  return {
    clients, blocks, loading: false,
    currentDate, setCurrentDate,
    view, setView,
    addClient, updateClient, deleteClient, archiveClient,
    addBlock, updateBlock, deleteBlock,
    exportData, importData,
  }
}
