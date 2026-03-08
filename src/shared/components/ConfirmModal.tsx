'use client'

interface Props {
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'default'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'default',
  onConfirm,
  onCancel,
}: Props) {
  const confirmStyle =
    variant === 'danger'
      ? { background: 'linear-gradient(135deg, #EF4444, #DC2626)' }
      : { background: 'linear-gradient(135deg, #A855F7, #7C3AED)' }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
      <div
        className="rounded-2xl p-6 w-full max-w-sm border border-white/10"
        style={{ background: '#1A0A30' }}
      >
        <h2 className="text-base font-bold text-white mb-2">{title}</h2>
        <p className="text-sm text-white/60 mb-6">{description}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 border border-white/10 rounded-lg py-2 text-sm text-white/60 hover:bg-white/5 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-lg py-2 text-sm font-medium text-white transition-opacity hover:opacity-80"
            style={confirmStyle}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
