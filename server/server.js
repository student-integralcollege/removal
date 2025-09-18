import 'dotenv/config'
import express from 'express';
import cors from 'cors';
import mongoDB from './config/mongodb.js';
import userRouter from './routes/userRoutes.js';
import imageRouter from './routes/imageRoutes.js';

const PORT = process.env.PORT || 5000;
const app = express();
await mongoDB();


const allowedOrigins = [
  "http://localhost:5173",         // local dev
  "https://removal-ivb9.vercel.app" // your deployed frontend
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API Working!');
});

app.use('/api/user', userRouter);
app.use('/api/image', imageRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
