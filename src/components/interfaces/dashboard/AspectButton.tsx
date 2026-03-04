'use client'

interface AspectButtonProps {
  label: string
  active: boolean
  onClick: () => void
}

export function AspectButton({ label, active, onClick }: AspectButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-2 py-1 rounded-full border transition ${
        active
          ? 'bg-amazon text-white border-amazon'
          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
      }`}
    >
      {label}
    </button>
  )
}
