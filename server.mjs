import express from 'express';
import "dotenv/config";
import cors from "cors";
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './configs/db.mjs';
import User from './models/user.js';
import userRouter from './routes/userRoutes.js';
import ownerRouter from './routes/ownerRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';

const app = express();

await connectDB();

app.use(cors());
app.use(express.json());

// Serve static files from the frontend build folder
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "client/dist")));

app.get('/', (req, res) => res.send('Server is running'));
app.use('/api/v1/user', userRouter);
app.use('/api/v1/owner', ownerRouter);
app.use('/api/v1/bookings', bookingRouter);

// For any other route, serve the frontend's index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './client/dist/index.html'));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log('server running on port', PORT);
});