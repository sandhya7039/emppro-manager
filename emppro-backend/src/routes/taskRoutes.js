const express = require('express');
const router = express.Router();
const {
  getTasks,
  getMyTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask
} = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// Employee routes
router.get('/my-tasks', authenticate, getMyTasks);

// All routes require authentication
router.use(authenticate);

// Admin only routes
router.get('/', authorize(['admin']), getTasks);
router.get('/:id', authorize(['admin']), getTaskById);
router.post('/', authorize(['admin']), createTask);
router.put('/:id', authorize(['admin']), updateTask);
router.delete('/:id', authorize(['admin']), deleteTask);

// Status update - Admin OR Employee (own task)
router.patch('/:id/status', updateTaskStatus);

module.exports = router;