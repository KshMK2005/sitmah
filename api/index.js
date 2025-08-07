// SITMAH API - Vercel Functions
// Este archivo redirige las peticiones al servidor principal

import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

export default async function handler(req, res) {
  try {
    // Redirigir todas las peticiones al servidor principal
    const parsedUrl = parse(req.url, true);
    await handle(req, res, parsedUrl);
  } catch (err) {
    console.error('Error en API handler:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
} 