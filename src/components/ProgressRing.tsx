import { useId } from 'react'

interface ProgressRingProps {
  percent: number
  size?: number
  strokeWidth?: number
  label?: string
}

export function ProgressRing({ percent, size = 108, strokeWidth = 9, label }: ProgressRingProps) {
  const gradientId = useId()
  const r = (size - strokeWidth) / 2
  const c = 2 * Math.PI * r
  const pct = Math.min(100, Math.max(0, percent))
  const offset = c - (pct / 100) * c

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.22,1,0.36,1)' }}
        />
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#52b788" />
            <stop offset="100%" stopColor="#d4a017" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center px-2 text-center">
        <span className="text-2xl font-bold text-white">{Math.round(pct)}%</span>
        {label && <span className="text-[10px] leading-tight text-white/70 mt-0.5">{label}</span>}
      </div>
    </div>
  )
}
