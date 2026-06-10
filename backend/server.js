import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// Route imports
import authRoutes from './routes/auth.js';
import departmentRoutes from './routes/department.js';
import employeeRoutes from './routes/employee.js';
import salaryRoutes from './routes/salary.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);

app.use('/api/auth',        authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/employees',   employeeRoutes);
app.use('/api/salaries',    salaryRoutes);

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── DB + Server ─────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected → EPMS');
    // Seed departments on first run
    const { seedDepartments } = await import('./utils/seed.js');
    await seedDepartments();
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  })
  .catch((err) => {
    console.error('DB connection failed:', err.message);
    process.exit(1);
  });
