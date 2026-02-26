import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import nodesRouter from './routes/nodes';
import searchRouter from './routes/search';

dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error('Missing required env var: DATABASE_URL');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT ?? 3001;

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? '*';
app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json());

app.use('/api/nodes', nodesRouter);
app.use('/api/search', searchRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
