import 'dotenv/config';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import caseRoutes from './routes/case.js';
import chatRoutes from './routes/chat.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(join(__dirname, '..', 'public')));

// API routes
app.use('/api/case', caseRoutes);
app.use('/api/chat', chatRoutes);

app.listen(PORT, () => {
  console.log(`Second Opinion running on http://localhost:${PORT}`);
});
