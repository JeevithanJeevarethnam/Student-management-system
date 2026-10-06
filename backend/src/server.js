import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import authRoutes from './routes/auth.js';

const { PORT = 5000, MONGODB_URI, JWT_SECRET, CLIENT_URL = 'http://localhost:5173' } = process.env;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDist = path.resolve(__dirname, '../../front end/dist');

if (!MONGODB_URI || !JWT_SECRET) {
  console.error('MONGODB_URI and JWT_SECRET must be set in backend/.env.');
  process.exit(1);
}

const app = express();
app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);

// In the combined local/production setup, Express serves the Vite build so the
// UI and API are both available from http://localhost:5000.
if (existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('{*splat}', (_req, res) => res.sendFile(path.join(frontendDist, 'index.html')));
} else {
  console.warn('Frontend build not found. Run "npm run start:full" to build and serve it.');
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'An unexpected server error occurred.' });
});

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });
