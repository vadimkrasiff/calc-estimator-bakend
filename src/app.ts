import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import materialsRouter from './routes/materials';
import authRouter from './routes/auth';
import pricesRouter from './routes/prices';
import usersRouter from './routes/users';
import invitationsRouter from './routes/invitations';
import { authenticateToken } from './middleware/authMiddleware';
import profileRouter from './routes/profile';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);

// Защищённые роуты
app.use('/api/materials', authenticateToken, materialsRouter);
app.use('/api/prices', pricesRouter);
app.use('/api/users', usersRouter);
app.use('/api/invitations', invitationsRouter);
app.use('/api/profile', authenticateToken, profileRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});