import 'dotenv/config'
import express from 'express';
import cors from 'cors';
import mongoDB from './config/mongodb.js';
import userRouter from './routes/userRoutes.js';
import imageRouter from './routes/imageRoutes.js';

const PORT = process.env.PORT || 5000;
const app = express();
// Connect to MongoDB asynchronously to prevent blocking serverless function initialization (cold starts)
mongoDB().catch(err => console.error("MongoDB connection error:", err));

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('API Working!');
});

app.use('/api/user', userRouter);
app.use('/api/image', imageRouter);

// Only listen to the port locally. Vercel will import the app and handle routing.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
