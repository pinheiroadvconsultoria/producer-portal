/**
 * TiltCard.tsx — cartão com inclinação 3D que segue o ponteiro.
 * Mesma ideia da muda 3D do login (perspective + eixo Y/X via CSS), aplicada
 * a qualquer card: em mouse/trackpad inclina seguindo o cursor com um brilho
 * que acompanha; em touch, só dá um feedback de toque (sem "seguir o dedo").
 * Desliga sozinho para quem pediu menos movimento (prefers-reduced-motion).
 */

import { useCallback, useRef, type CSSProperties, type PointerEvent, type ReactNode } from 'react'

const canHover =
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches
const reducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

interface TiltCardProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  onClick?: () => void
  maxTilt?: number
  glare?: boolean
}

export function TiltCard({ children, className = '', style, onClick, maxTilt = 9, glare = true }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const glareRef = useRef<HTMLDivElement>(null)

  const handleMove = useCallback((e: PointerEvent<HTMLDivElement>) => {
    if (!canHover || reducedMotion || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    const rx = (0.5 - py) * maxTilt * 2
    const ry = (px - 0.5) * maxTilt * 2
    ref.current.style.transform =
      `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale3d(1.015,1.015,1.015)`
    if (glareRef.current) {
      glareRef.current.style.background =
        `radial-gradient(circle at ${(px * 100).toFixed(0)}% ${(py * 100).toFixed(0)}%, rgba(255,255,255,0.28), transparent 60%)`
    }
  }, [maxTilt])

  const resetTilt = useCallback(() => {
    if (!ref.current) return
    ref.current.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)'
    if (glareRef.current) glareRef.current.style.background = 'transparent'
  }, [])

  const handleDown = useCallback(() => {
    if (canHover || !ref.current) return
    ref.current.style.transform = 'perspective(900px) scale3d(0.98,0.98,0.98)'
  }, [])

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={resetTilt}
      onPointerDown={handleDown}
      onPointerUp={resetTilt}
      onClick={onClick}
      className={`relative ${className}`}
      style={{
        transformStyle: 'preserve-3d',
        transition: 'transform 0.35s cubic-bezier(0.22,1,0.36,1)',
        ...style,
      }}
    >
      {glare && !reducedMotion && (
        <div
          ref={glareRef}
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{ transition: 'background 0.2s' }}
        />
      )}
      <div style={{ transform: 'translateZ(18px)', transformStyle: 'preserve-3d' }}>
        {children}
      </div>
    </div>
  )
}
