// src/server.ts
import app from './app';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}`);
});
