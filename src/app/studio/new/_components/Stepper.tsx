interface Props {
  current: number  // 1, 2, 3
  steps: string[]
}

export function Stepper({ current, steps }: Props) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((label, idx) => {
        const step = idx + 1
        const done = step < current
        const active = step === current
        return (
          <div key={step} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 ${active ? 'text-white' : done ? 'text-[#9B7EC8]' : 'text-white/30'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                active ? 'bg-[#9B7EC8] text-white' : done ? 'bg-[#9B7EC8]/30 text-[#9B7EC8]' : 'bg-white/10 text-white/30'
              }`}>
                {done ? '✓' : step}
              </div>
              <span className="text-sm hidden sm:block">{label}</span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`flex-1 h-px w-8 mx-1 ${done ? 'bg-[#9B7EC8]/50' : 'bg-white/10'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
