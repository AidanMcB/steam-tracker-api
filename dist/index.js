"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
// Import routes
const steamRoutes_1 = __importDefault(require("./routes/steamRoutes"));
const friendRoutes_1 = __importDefault(require("./routes/friendRoutes"));
// Load environment variables
dotenv_1.default.config({ path: '.env.local' });
// Initialize Express app
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3008;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Welcome route
app.get('/', (_req, res) => {
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
app.use('/api/steam', steamRoutes_1.default);
app.use('/api/friends', friendRoutes_1.default);
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map