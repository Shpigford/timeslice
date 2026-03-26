import { useState } from 'react'
import { useStore } from '@/hooks/useStore'
import { useTheme } from '@/hooks/useTheme'
import { ClientSidebar } from '@/components/sidebar/ClientSidebar'
import { CalendarHeader } from '@/components/calendar/CalendarHeader'
import { WeekView } from '@/components/calendar/WeekView'
import { MonthView } from '@/components/calendar/MonthView'
import { BlockEditDialog } from '@/components/calendar/BlockEditPopover'
import { SummaryPanel } from '@/components/summary/SummaryPanel'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DemoBanner } from '@/components/DemoBanner'
import { AnimatePresence, motion } from 'framer-motion'

export default function App() {
  const store = useStore()
  const theme = useTheme()
  const [editingBlock, setEditingBlock] = useState(null)
  const [activeTab, setActiveTab] = useState('calendar')
  const [deleteBlockId, setDeleteBlockId] = useState(null)

  const handleDropClient = async (clientId, date, slot) => {
    await store.addBlock(clientId, date, slot, 6)
  }

  const handleBlockClick = (block) => {
    if (block.type === 'blocked') return
    setEditingBlock(block)
  }

  const handleAddBlockedTime = (date, scope) => {
    store.addBlockedTime(date, scope)
  }

  const handleBlockSave = async (id, data) => {
    await store.updateBlock(id, data)
  }

  const confirmBlockDelete = (id) => {
    setDeleteBlockId(id)
    setEditingBlock(null)
  }

  const handleBlockDelete = async () => {
    if (deleteBlockId) {
      await store.deleteBlock(deleteBlockId)
      setDeleteBlockId(null)
    }
  }

  const handleBlockUpdate = async (id, data) => {
    await store.updateBlock(id, data)
  }

  if (store.loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <CalendarHeader
        currentDate={store.currentDate}
        setCurrentDate={store.setCurrentDate}
        view={store.view}
        setView={store.setView}
        dark={theme.dark}
        onToggleTheme={theme.toggle}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onExport={store.exportData}
        onImport={store.importData}
      />

      {store.isDemo && <DemoBanner onClear={store.clearDemoData} />}

      <div className="flex flex-1 overflow-hidden">
        <ClientSidebar
          clients={store.clients}
          blocks={store.blocks}
          onAdd={store.addClient}
          onUpdate={store.updateClient}
          onDelete={store.deleteClient}
          onArchive={store.archiveClient}
        />

        <main className="flex-1 overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">
            {activeTab === 'calendar' ? (
              <motion.div
                key={`calendar-${store.view}`}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                className="flex-1 overflow-auto"
              >
                {store.view === 'week' && (
                  <WeekView
                    currentDate={store.currentDate}
                    blocks={store.blocks}
                    onDropClient={handleDropClient}
                    onBlockClick={handleBlockClick}
                    onBlockUpdate={handleBlockUpdate}
                    onBlockDelete={confirmBlockDelete}
                    onAddBlockedTime={handleAddBlockedTime}
                  />
                )}
                {store.view === 'month' && (
                  <MonthView
                    currentDate={store.currentDate}
                    blocks={store.blocks}
                    onDropClient={handleDropClient}
                    onBlockClick={handleBlockClick}
                    onBlockDelete={confirmBlockDelete}
                    onBlockUpdate={handleBlockUpdate}
                    onAddBlockedTime={handleAddBlockedTime}
                  />
                )}

              </motion.div>
            ) : (
              <motion.div
                key="summary"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                className="flex-1 overflow-auto"
              >
                <SummaryPanel
                  clients={store.clients}
                  blocks={store.blocks}
                  currentDate={store.currentDate}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <BlockEditDialog
        block={editingBlock}
        open={!!editingBlock}
        onOpenChange={(open) => !open && setEditingBlock(null)}
        onSave={handleBlockSave}
        onDelete={confirmBlockDelete}
        clients={store.clients}
      />

      <ConfirmDialog
        open={!!deleteBlockId}
        onOpenChange={(open) => !open && setDeleteBlockId(null)}
        title="Delete Block"
        description="Are you sure you want to delete this time block? This action cannot be undone."
        onConfirm={handleBlockDelete}
      />
    </div>
  )
}
