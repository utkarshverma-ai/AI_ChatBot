import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimiter from './middleware/rateLimiter.js';

// Routes
import chatRoutes from './routes/chat.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security Middleware
app.use(helmet());
app.use(cors({ origin: '*' })); // For production, you may want to restrict this to your Vercel URL
app.use(express.json());
app.use('/api/', rateLimiter);

// API Routes
app.use('/api/chat', chatRoutes);

// Base route
app.get('/', (req, res) => {
    res.json({ message: 'AI Chatbot Backend is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Something went wrong on the server'
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

