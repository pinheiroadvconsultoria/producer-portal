/**
 * postbuild.cjs — roda automaticamente após `npm run build` (convenção npm
 * pre/post). Cria uma cópia de index.html em cada rota de nível superior da
 * SPA (dist/<rota>/index.html) para que a navegação direta funcione mesmo se
 * o rewrite de SPA (/* -> /index.html) não estiver ativo no serviço real do
 * Render (histórico: não está).
 */

const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const dist = path.join(root, 'dist')

const SPA_ROUTES = ['download', 'admin']

if (!fs.existsSync(path.join(dist, 'index.html'))) {
  console.error('❌ dist/index.html não encontrado — rode o build antes.')
  process.exit(1)
}

for (const route of SPA_ROUTES) {
  fs.mkdirSync(path.join(dist, route), { recursive: true })
  fs.copyFileSync(path.join(dist, 'index.html'), path.join(dist, route, 'index.html'))
  console.log(`✅ dist/${route}/index.html criado (rota /${route})`)
}
