// be-webtect2/src/index.ts
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import api from './config/index.js';

const app = new Hono();

// ✅ Enable CORS for all origins
app.use('*', cors());

// Root route
app.get('/', (c) => c.text('Student Management API is Online'));

// Mount your API routes
app.route('/', api);

const port = 3000;

// Start the server
serve(
  {
    fetch: app.fetch,
    port: port,
  },
  (info) => {
    console.log(`🚀 Server is running on http://localhost:${info.port}`);
  }
);
