import { useState } from 'react'
import { Eye, EyeOff, Loader2, AlertCircle, ShieldCheck, KeyRound } from 'lucide-react'
import { api } from '../services/api'
import { usePortalStore } from '../store/usePortalStore'
import { FirstAccess } from './FirstAccess'
import { SignUp } from './SignUp'

function maskDoc(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 14)
  if (d.length <= 11) {
    if (d.length <= 3) return d
    if (d.length <= 6) return `${d.slice(0,3)}.${d.slice(3)}`
    if (d.length <= 9) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`
    return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`
  }
  if (d.length <= 12) return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8)}`
  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12)}`
}

/**
 * Marca do portal: a muda (broto) — mesma identidade dos ícones do PWA.
 * Desenhada em SVG (e não no PNG de 192px) para ficar nítida no tamanho grande
 * do login e acompanhar a cor do texto.
 */
function LogoMuda({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 96 96" className={className} style={style} fill="none" aria-hidden="true">
      {/* caule */}
      <path
        d="M48 82V38"
        stroke="currentColor"
        strokeWidth="5.5"
        strokeLinecap="round"
      />
      {/* folha direita */}
      <path
        d="M49.5 47c1-13 10.5-22.5 25.5-24.5 1 15.5-9 26-25.5 27.5z"
        fill="currentColor"
      />
      {/* folha esquerda */}
      <path
        d="M46.5 58c-1-13-10.5-22.5-25.5-24.5-1 15.5 9 26 25.5 27.5z"
        fill="currentColor"
        fillOpacity="0.88"
      />
      {/* solo */}
      <path
        d="M31 82h34"
        stroke="currentColor"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeOpacity="0.8"
      />
    </svg>
  )
}

/**
 * A muda em 3D girando. Cada camada é o mesmo SVG deslocado no eixo Z:
 * as das pontas ficam brancas (as faces) e as do meio, verde-escuras
 * (a espessura). O giro em si vive no CSS (.logo3d, em index.css).
 */
const CAMADAS = 11

function LogoMuda3D() {
  return (
    <div className="logo3d h-16 w-16">
      <div className="logo3d__spin">
        {Array.from({ length: CAMADAS }, (_, i) => {
          const t = i / (CAMADAS - 1)          // 0 (fundo) → 1 (frente)
          const z = (t - 0.5) * 15             // -7.5px → +7.5px
          const face = Math.abs(t - 0.5) * 2   // 0 no miolo, 1 nas duas faces
          const mix = face ** 1.6              // escurece rápido para dentro
          const c = (dark: number, light: number) =>
            Math.round(dark + (light - dark) * mix)

          return (
            <LogoMuda
              key={i}
              className="logo3d__layer"
              style={{
                transform: `translateZ(${z.toFixed(2)}px)`,
                color: `rgb(${c(34, 255)}, ${c(74, 255)}, ${c(55, 255)})`,
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

/** Navegação client-side (sem recarregar) — necessária porque o PWA instalado não tem barra de endereço. */
function navigateTo(path: string) {
  window.history.pushState(null, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export function Login() {
  const setAuth = usePortalStore(s => s.setAuth)
  const [doc, setDoc]           = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [firstAccess, setFirstAccess] = useState(false)
  const [signUp, setSignUp]     = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await api.auth(doc.replace(/\D/g, ''), password)
      setAuth(res.token, res.producer.nome)
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('primeiro acesso')) {
        setFirstAccess(true)
      } else {
        setError(err instanceof Error ? err.message : 'Erro ao acessar portal')
      }
    } finally {
      setLoading(false)
    }
  }

  if (signUp) {
    return (
      <SignUp
        onBack={() => setSignUp(false)}
        onNeedFirstAccess={() => { setSignUp(false); setFirstAccess(true) }}
      />
    )
  }

  if (firstAccess) {
    return <FirstAccess onBack={() => setFirstAccess(false)} />
  }

  // Campo escuro translúcido: a borda e o brilho reagem ao foco (:focus-within)
  const fieldWrap =
    'group relative rounded-xl bg-white/[0.04] ring-1 ring-white/10 transition ' +
    'hover:ring-white/20 focus-within:ring-2 focus-within:ring-agro-lime/70 ' +
    'focus-within:bg-white/[0.07] focus-within:shadow-[0_0_0_4px_rgba(82,183,136,0.10)]'

  const fieldInput =
    'w-full bg-transparent px-4 py-3.5 text-white placeholder-white/25 ' +
    'outline-none text-[15px] tracking-wide'

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b2417] flex items-center justify-center px-5 py-12">
      {/* Halo verde ao fundo — dá profundidade sem competir com o formulário */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(75% 50% at 50% -5%, #1d5738 0%, transparent 62%), ' +
            'radial-gradient(65% 45% at 50% 105%, #12402a 0%, transparent 65%)',
        }}
      />

      <div className="relative w-full max-w-[420px]">
        {/* Marca */}
        <div className="text-center">
          <div className="mx-auto mb-7 flex h-28 w-28 items-center justify-center rounded-full bg-white/[0.04] ring-1 ring-white/10">
            <LogoMuda3D />
          </div>

          <h1 className="text-[34px] leading-tight font-bold text-white">
            Portal do Produtor
          </h1>
          <p className="mt-3 text-[13px] uppercase tracking-[0.22em] text-white/45">
            Crédito rural e agronegócio
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="mt-10 space-y-5">
          <div>
            <label htmlFor="doc" className="mb-2 block text-sm font-medium text-white/85">
              CPF ou CNPJ
            </label>
            <div className={fieldWrap}>
              <input
                id="doc"
                type="text"
                inputMode="numeric"
                autoComplete="username"
                value={doc}
                onChange={e => setDoc(maskDoc(e.target.value))}
                placeholder="000.000.000-00"
                className={fieldInput}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="senha" className="mb-2 block text-sm font-medium text-white/85">
              Senha
            </label>
            <div className={fieldWrap}>
              <input
                id="senha"
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`${fieldInput} pr-12`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-white/40 transition hover:bg-white/10 hover:text-white"
              >
                {showPass ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-200 ring-1 ring-red-500/25">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-agro-green to-[#1f5138] py-4 text-[15px] font-semibold text-white ring-1 ring-white/10 transition hover:from-agro-lime hover:to-agro-green hover:ring-white/20 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Verificando…</>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        {/* Ações secundárias */}
        <div className="mt-7 text-center">
          <button
            onClick={() => setSignUp(true)}
            className="text-[15px] font-medium text-white/85 underline-offset-4 transition hover:text-white hover:underline"
          >
            Criar minha conta
          </button>
        </div>

        <div className="mt-3 text-center">
          <button
            onClick={() => setFirstAccess(true)}
            className="text-[13px] text-white/40 underline-offset-4 transition hover:text-white/70 hover:underline"
          >
            Ainda não tenho senha — primeiro acesso
          </button>
        </div>

        {/* Rodapé */}
        <div className="mt-12 flex items-center justify-center gap-2 text-[12px] text-white/35">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Conexão protegida por criptografia</span>
        </div>

        <div className="mt-4 flex items-center justify-center gap-4">
          <button
            onClick={() => navigateTo('/download')}
            className="text-[12px] text-white/30 underline-offset-4 transition hover:text-white/60 hover:underline"
          >
            Instalar aplicativo no Chrome
          </button>
          <span className="text-white/15">·</span>
          <button
            onClick={() => navigateTo('/admin')}
            className="inline-flex items-center gap-1 text-[12px] text-white/30 underline-offset-4 transition hover:text-white/60 hover:underline"
          >
            <KeyRound className="h-3 w-3" />
            Acesso administrador
          </button>
        </div>

        <p className="mt-8 text-center text-[11px] uppercase tracking-[0.18em] text-white/20">
          Portal do Produtor © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
