import 'dotenv/config'
import express from 'express';
import cors from 'cors';
import mongoDB from './config/mongodb.js';
import userRouter from './routes/userRoutes.js';

const PORT = process.env.PORT || 5000;
const app = express();
await mongoDB();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API Working!');
});
app.use('/api/users', userRouter);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
