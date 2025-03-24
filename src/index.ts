import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Request, Response } from 'express';

// Import routes
import steamRoutes from './routes/steamRoutes';
import friendRoutes from './routes/friendRoutes';

// Import middleware
import { camelCaseResponse } from './utils/middleware';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3008;

// Middleware
app.use(cors());
app.use(express.json());

// Apply camelCase transformation to all responses
app.use(camelCaseResponse);

// Welcome route
app.get('/', (_req: Request, res: Response) => {
    res.json({
        message: 'Welcome to the Steam API Explorer!',
        version: '1.0.0',
        endpoints: {
            steam: '/api/steam/*',
            friends: '/api/friends/*',
        },
        documentation: 'See README.md for full API documentation',
    });
});

// API routes
app.use('/api/steam', steamRoutes);
app.use('/api/friends', friendRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}); 