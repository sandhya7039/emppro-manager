const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const pool = require('./src/config/db');

// pool.getConnection()
//   .then(() => {
//     console.log('✅ Database connected successfully!');
//   })
//   .catch((err) => {
//     console.error('❌ Database connection failed:', err.message);
//   });
pool.getConnection()
  .then((connection) => {
    console.log('✅ Database connected successfully!');
    connection.release();
  })
  .catch((err) => {
    console.error('❌ Database connection failed');
    console.error('Code:', err.code);
    console.error('Message:', err.message);
    console.error(err);
  });

// =====================
// ROUTES - YEH DONO LINES HONI CHAHIYE
// =====================
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/employees', require('./src/routes/employeeRoutes')); 
app.use('/api/projects', require('./src/routes/projectRoutes')); 
app.use('/api/tasks', require('./src/routes/taskRoutes'));

// Test route
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'EmpPro Manager Backend is running!',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📌 Test API: http://localhost:${PORT}/api/test`);
  console.log(`📌 Login API: http://localhost:${PORT}/api/auth/login`);
});