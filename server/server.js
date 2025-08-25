import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoDB from './config/mongodb.js';
import serverless from 'serverless-http';

const app = express();

// Connect to MongoDB once
await mongoDB();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API Working!');
});

// In Vercel functions, export a handler. Locally, start a server.
export const handler = serverless(app);

if (!process.env.VERCEL) {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}
