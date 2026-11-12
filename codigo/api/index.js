// Função serverless da Vercel: expõe o JSON Server como API.
// O disco da Vercel é somente leitura, então o banco roda em memória
// (copiado de db/db.json). Gravações valem apenas enquanto a instância
// estiver ativa e são perdidas em cold starts/redeploys.
const jsonServer = require('json-server')
const path = require('path')

const db = JSON.parse(JSON.stringify(require(path.join('..', 'db', 'db.json'))))
delete db.$schema

const server = jsonServer.create()
const router = jsonServer.router(db)

server.use(jsonServer.defaults({ logger: false, bodyParser: true, readOnly: false }))
// Os rewrites do vercel.json mandam /usuarios etc. para /api/usuarios
server.use('/api', router)
server.use(router)

module.exports = server
