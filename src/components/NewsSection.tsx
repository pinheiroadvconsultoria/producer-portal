/**
 * NewsSection.tsx — Notícias recentes do crédito rural
 * Curadoria de fontes confiáveis (gov.br, Canal Rural, InfoMoney, CNN Brasil).
 * Atualizada em 17/07/2026 — Plano Safra 2026/2027.
 */

import { Newspaper, ExternalLink, Globe, Building2 } from 'lucide-react'

interface NewsItem {
  title: string
  summary: string
  source: string
  url: string
}

const NEWS: NewsItem[] = [
  {
    title: 'Plano Safra 2026/27 destina R$ 525,1 bilhões à agricultura empresarial',
    summary:
      'Juros entre 8% e 12,5% a.a. — redução de até 1,5 ponto. Pronamp a 9%, custeio empresarial a 12,5%, Inovagro a 11,5% e RenovAgro/PCA a 9,5% ao ano.',
    source: 'Ministério da Agricultura (gov.br)',
    url: 'https://www.gov.br/agricultura/pt-br/assuntos/noticias/2026/plano-safra-26-27-destina-r-525-bilhoes-para-fortalecer-a-agricultura-empresarial',
  },
  {
    title: 'Agricultura familiar: R$ 97,3 bilhões e Pronaf com R$ 85,2 bilhões',
    summary:
      'Custeio de alimentos a 2% a.a. e 1% a.a. para produção agroecológica e orgânica. Investimento entre 1% e 5% a.a. Vigência de 01/07/2026 a 30/06/2027.',
    source: 'Ministério do Desenvolvimento Agrário',
    url: 'https://www.gov.br/mda/pt-br/noticias/2026/07/plano-safra-da-agricultura-familiar-2026-2027',
  },
  {
    title: 'Bônus de sustentabilidade reduz juros do custeio em até 1 ponto',
    summary:
      'Produtores com CAR regular ganham 0,5 p.p. de desconto e quem adota práticas agropecuárias sustentáveis soma mais 0,5 p.p. na taxa de custeio.',
    source: 'Canal Rural',
    url: 'https://www.canalrural.com.br/agricultura/plano-safra-2026-27-tera-r-525-bilhoes-e-juros-menores-entenda-o-que-muda-no-credito-rural/',
  },
  {
    title: 'Plano Safra reduz juros para até 9% ao ano e amplia crédito',
    summary:
      'Do total, R$ 384,9 bilhões vão para custeio e comercialização e R$ 140,2 bilhões para investimento em máquinas, armazenagem, irrigação e inovação.',
    source: 'InfoMoney',
    url: 'https://www.infomoney.com.br/politica/plano-safra-reduz-juros-para-ate-9-ao-ano-e-amplia-credito-para-r-525-bilhoes/',
  },
]

export function NewsSection() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-1">
        <Newspaper className="w-5 h-5 text-agro-green" />
        <h2 className="text-lg font-semibold text-gray-800">Crédito Rural em Destaque</h2>
      </div>
      <p className="text-xs text-gray-400 mb-4">Plano Safra 2026/2027 · fontes oficiais e imprensa especializada</p>

      <div className="space-y-3">
        {NEWS.map(item => (
          <a
            key={item.url}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl border border-gray-100 p-3.5 hover:border-agro-lime hover:bg-agro-cream/40 transition-colors group"
          >
            <p className="text-sm font-semibold text-gray-800 group-hover:text-agro-dark leading-snug">
              {item.title}
            </p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.summary}</p>
            <p className="text-[11px] text-agro-green font-medium mt-1.5 flex items-center gap-1">
              {item.source}
              <ExternalLink className="w-3 h-3" />
            </p>
          </a>
        ))}
      </div>
    </div>
  )
}

export function InstitutionalLinks() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <a
        href="https://npladvs.com.br/credito-rural"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 bg-agro-green hover:bg-agro-dark text-white rounded-2xl p-4 transition-colors"
      >
        <div className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
          <Globe className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold leading-tight">Site AgroCredit</p>
          <p className="text-[11px] text-white/70 leading-tight">Conheça o serviço de crédito rural da NPL</p>
        </div>
        <ExternalLink className="w-4 h-4 ml-auto flex-shrink-0 text-white/60" />
      </a>

      <a
        href="https://npladvogados.com.br/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 bg-white hover:bg-agro-cream border border-gray-100 text-gray-800 rounded-2xl p-4 transition-colors"
      >
        <div className="h-10 w-10 rounded-xl bg-agro-cream flex items-center justify-center flex-shrink-0">
          <Building2 className="w-5 h-5 text-agro-green" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold leading-tight">NPL Sociedade de Advogados</p>
          <p className="text-[11px] text-gray-500 leading-tight">Saiba mais no site institucional</p>
        </div>
        <ExternalLink className="w-4 h-4 ml-auto flex-shrink-0 text-gray-300" />
      </a>
    </div>
  )
}
