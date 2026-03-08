'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'default'
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'default',
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  const confirmStyle =
    variant === 'danger'
      ? { background: 'linear-gradient(135deg, #EF4444, #DC2626)' }
      : { background: 'linear-gradient(135deg, #A855F7, #7C3AED)' }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}
        >
          <motion.div
            className="rounded-2xl p-6 w-full max-w-sm border border-white/10"
            style={{ background: '#1A0A30' }}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
          >
            <h2 className="text-base font-bold text-white mb-2">{title}</h2>
            <p className="text-sm text-white/60 mb-6">{description}</p>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                disabled={loading}
                className="flex-1 border border-white/10 rounded-lg py-2 text-sm text-white/60 hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 rounded-lg py-2 text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-50"
                style={confirmStyle}
              >
                {loading ? 'Procesando...' : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
