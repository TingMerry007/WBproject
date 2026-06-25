import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import shellsRoute from './routes/shells.js'

const app = new Hono()

app.use(
  '*',
  cors({
    origin: 'http://localhost:5173'
  })
)

app.get('/api/health', (c) => c.json({ status: 'ok' }))
app.route('/api/shells', shellsRoute)

const port = 3000

if (process.env.NODE_ENV !== 'test') {
  serve({
    fetch: app.fetch,
    port
  })
  console.log(`Server is running on http://localhost:${port}`)
}

export default app
