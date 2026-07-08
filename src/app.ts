import express, { Application } from 'express';
import cors from 'cors';
import router from './routes/router';
import { globalErrorHandler } from './middleware/globalErrorHandler';

const app: Application = express();

app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "RentNest Backend Running"
  });
});
// Main API Route
app.use('/api', router);

// Global Error Handler
app.use(globalErrorHandler);

// 404 Route handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found!' });
});

export default app;