import 'dotenv/config'
import express from 'express';
import cors from 'cors';
import mongoDB from './config/mongodb.js';
import userRouter from './routes/userRoutes.js';
import imageRouter from './routes/imageRoutes.js';

const PORT = process.env.PORT || 5000;
const app = express();

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API Working!');
});

const ensureDatabase = async (req, res, next) => {
  try {
    await mongoDB();
    next();
  } catch (error) {
    console.error("MongoDB connection error:", error);
    res.status(503).json({
      success: false,
      message: "Database connection failed"
    });
  }
};

app.use('/api', ensureDatabase);
app.use('/api/user', userRouter);
app.use('/api/image', imageRouter);

// Only listen to the port locally. Vercel will import the app and handle routing.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
