import { useState, useEffect, useCallback } from 'react'
import { clientsApi, blocksApi } from '@/lib/api'
import { getNextColor } from '@/lib/utils'
import { startOfMonth, endOfMonth, subMonths, addMonths, format } from 'date-fns'

export function useStore() {
  const [clients, setClients] = useState([])
  const [blocks, setBlocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setViewState] = useState(() => localStorage.getItem('timeslice-view') || 'week')
  const setView = (v) => { localStorage.setItem('timeslice-view', v); setViewState(v) }

  // Fetch clients
  const fetchClients = useCallback(async () => {
    const data = await clientsApi.list()
    setClients(data)
    return data
  }, [])

  // Fetch blocks for a wide range (3 months around current)
  const fetchBlocks = useCallback(async () => {
    const start = format(startOfMonth(subMonths(currentDate, 1)), 'yyyy-MM-dd')
    const end = format(endOfMonth(addMonths(currentDate, 2)), 'yyyy-MM-dd')
    const data = await blocksApi.list(start, end)
    setBlocks(data)
  }, [currentDate])

  // Initial load
  useEffect(() => {
    Promise.all([fetchClients(), fetchBlocks()]).then(() => setLoading(false))
  }, [])

  // Refetch blocks when date range changes significantly
  useEffect(() => {
    if (!loading) fetchBlocks()
  }, [currentDate])

  // Client CRUD
  const addClient = useCallback(async (name, monthlyHours = 0, selectedColor) => {
    const color = selectedColor || getNextColor(clients.map(c => c.color))
    const client = await clientsApi.create({ name, color, monthly_hours: monthlyHours })
    setClients(prev => [...prev, client])
    return client
  }, [clients])

  const updateClient = useCallback(async (id, data) => {
    const client = await clientsApi.update(id, data)
    setClients(prev => prev.map(c => c.id === id ? client : c))
    // Update block colors in local state
    if (data.color) {
      setBlocks(prev => prev.map(b =>
        b.client_id === id ? { ...b, client_color: data.color, client_name: data.name || b.client_name } : b
      ))
    }
    return client
  }, [])

  const deleteClient = useCallback(async (id) => {
    await clientsApi.delete(id)
    setClients(prev => prev.filter(c => c.id !== id))
    setBlocks(prev => prev.filter(b => b.client_id !== id))
  }, [])

  const archiveClient = useCallback(async (id) => {
    const client = await clientsApi.toggleArchive(id)
    setClients(prev => prev.map(c => c.id === id ? client : c))
    return client
  }, [])

  // Block CRUD
  const addBlock = useCallback(async (clientId, date, slot, hours = 6) => {
    const block = await blocksApi.create({ client_id: clientId, date, slot, hours })
    setBlocks(prev => [...prev, block])
    return block
  }, [])

  const updateBlock = useCallback(async (id, data) => {
    const block = await blocksApi.update(id, data)
    setBlocks(prev => prev.map(b => b.id === id ? block : b))
    return block
  }, [])

  const deleteBlock = useCallback(async (id) => {
    await blocksApi.delete(id)
    setBlocks(prev => prev.filter(b => b.id !== id))
  }, [])

  return {
    clients, blocks, loading,
    currentDate, setCurrentDate,
    view, setView,
    addClient, updateClient, deleteClient, archiveClient,
    addBlock, updateBlock, deleteBlock,
    fetchBlocks,
  }
}
