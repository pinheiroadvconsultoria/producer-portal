import { Fragment } from 'react'

/**
 * Renderizador leve para o texto de Termos de Uso/Política de Privacidade
 * (GET /api/legal, ver legalContent.js no backend) — só o suficiente pra
 * ficar legível dentro do bloco expansível (títulos #/##, negrito, listas
 * com "-"), sem trazer uma lib de markdown inteira pra um texto que muda
 * raramente. Achado real (pendência desde a Onda 1/LGPD): o bloco jogava a
 * string direto num <div> com whitespace-pre-wrap, então o produtor via as
 * cerquilhas/asteriscos crus. Mesmo componente existe no fazendai-app —
 * duplicado aqui porque os dois frontends são repositórios separados.
 */

function renderInline(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={`${keyPrefix}-${i}`}>{part.slice(2, -2)}</strong>
    }
    return <Fragment key={`${keyPrefix}-${i}`}>{part}</Fragment>
  })
}

export default function LegalMarkdown({ text }: { text: string }) {
  const lines = text.split('\n')

  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        const h2 = line.match(/^##\s+(.*)/)
        const h1 = !h2 ? line.match(/^#\s+(.*)/) : null
        const bullet = line.match(/^[-•]\s+(.*)/)

        if (h1) {
          return (
            <h1 key={i} className="text-sm font-bold mt-1">
              {renderInline(h1[1], String(i))}
            </h1>
          )
        }
        if (h2) {
          return (
            <h2 key={i} className="text-xs font-semibold mt-3 first:mt-0">
              {renderInline(h2[1], String(i))}
            </h2>
          )
        }
        if (bullet) {
          return (
            <div key={i} className="flex gap-1.5 pl-1">
              <span className="opacity-60">•</span>
              <span>{renderInline(bullet[1], String(i))}</span>
            </div>
          )
        }
        if (!line.trim()) {
          return <div key={i} className="h-1" />
        }
        return <p key={i}>{renderInline(line, String(i))}</p>
      })}
    </div>
  )
}
