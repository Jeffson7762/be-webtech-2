import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import api from './config/index.js'

const app = new Hono()

app.get('/', (c) => c.text('Student Management API is Online'))

// Mount the API hub
app.route('/', api)

const port = 3000

serve({
  fetch: app.fetch,
  port: port
}, (info) => {
  console.log(`🚀 Server is running on http://localhost:${info.port}`)
})