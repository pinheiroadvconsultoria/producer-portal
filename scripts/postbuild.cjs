/**
 * postbuild.cjs — roda automaticamente após `npm run build` (convenção npm
 * pre/post). Cria dist/download/index.html (cópia do index.html) para que a
 * rota /download funcione mesmo se o rewrite de SPA (/* -> /index.html)
 * não estiver ativo no serviço real do Render.
 */

const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const dist = path.join(root, 'dist')

if (!fs.existsSync(path.join(dist, 'index.html'))) {
  console.error('❌ dist/index.html não encontrado — rode o build antes.')
  process.exit(1)
}

fs.mkdirSync(path.join(dist, 'download'), { recursive: true })
fs.copyFileSync(path.join(dist, 'index.html'), path.join(dist, 'download', 'index.html'))
console.log('✅ dist/download/index.html criado (rota /download)')
