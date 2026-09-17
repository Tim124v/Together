import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const envFile = path.join(root, '.env')
if (process.env.NODE_ENV !== 'production' && !fs.existsSync(envFile)) {
  fs.copyFileSync(path.join(root, '.env.example'), envFile)
}
dotenv.config({ path: envFile })

if (!process.env.DATABASE_URL) {
  fs.mkdirSync(path.join(root, 'data'), { recursive: true })
}

const [{ connectDatabase }, { createApp }, { initSocket }] = await Promise.all([
  import('./config/database.js'),
  import('./App.js'),
  import('./services/socketService.js'),
])

await import('./models/index.js')
await connectDatabase()

const app = createApp()
const server = http.createServer(app)
initSocket(server)

const port = Number(process.env.PORT || 5000)
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Порт ${port} занят. На macOS это часто AirPlay Receiver.`)
    console.error('Выключите его или задайте PORT=5050 в .env')
  } else {
    console.error(err)
  }
  process.exit(1)
})
server.listen(port, '0.0.0.0', () => {
  const host = process.env.PUBLIC_API_URL || `http://localhost:${port}`
  console.log(`Together API  ${host}`)
  console.log(`Swagger       ${host.replace(/\/$/, '')}/api/docs`)
  console.log(`Socket.io     ${host}`)
})
