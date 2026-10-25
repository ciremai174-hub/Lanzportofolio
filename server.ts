import express from 'express';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './server/routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Security HTTP Headers with Helmet
app.use(
  helmet({
    contentSecurityPolicy: false, // Disabled to allow Vite SPA scripts, Google Fonts, and dynamic images
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
  })
);

// Body parsers with safe payload limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy for accurate rate-limiting behind reverse proxies/Cloud Run
app.set('trust proxy', 1);

// Mount Backend API
app.use('/api', apiRouter);

// Catch-all for API to prevent HTML DOCTYPE fallback
app.all('/api/*', (_req, res) => {
  res.status(404).json({ error: 'API endpoint not found', success: false });
});

// Frontend Vite Integration (Dev middleware vs Prod static files)
const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.resolve(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 [LanzPortofolio] Server running securely at http://0.0.0.0:${PORT}`);
  console.log(`🛡️  [Security] Helmet & Rate Limiter active (Firebase Firestore native)`);
});
