import 'dotenv/config'
import express from 'express';
import cors from 'cors';
import mongoDB from './config/mongodb.js';
import userRouter from './routes/userRoutes.js';
import imageRouter from './routes/imageRoutes.js';

const PORT = process.env.PORT || 5000;
const app = express();
await mongoDB();

app.use(cors({
  origin: 'https://removal-ivb9.vercel.app', // your frontend domain
  credentials: true, // if you use cookies or authentication
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
