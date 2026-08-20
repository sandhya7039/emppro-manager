const pool = require('../config/db');

// @desc    Get all tasks (with filters)
// @route   GET /api/tasks
// @access  Admin Only
const getTasks = async (req, res) => {
  try {
    const { project_id, employee_id, status, priority, page = 1, limit = 10 } = req.query;
    
    let query = `
      SELECT 
        t.id, t.title, t.description, t.status, t.priority,
        t.due_date, t.created_at,
        p.name as project_name,
        CONCAT(e.first_name, ' ', e.last_name) as assigned_to
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      JOIN employees e ON t.employee_id = e.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (project_id) {
      query += ` AND t.project_id = ?`;
      params.push(project_id);
    }
    
    if (employee_id) {
      query += ` AND t.employee_id = ?`;
      params.push(employee_id);
    }
    
    if (status) {
      query += ` AND t.status = ?`;
      params.push(status);
    }
    
    if (priority) {
      query += ` AND t.priority = ?`;
      params.push(priority);
    }
    
    const offset = (page - 1) * limit;
    query += ` ORDER BY t.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));
    
    const [tasks] = await pool.query(query, params);
    
    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM tasks t WHERE 1=1`;
    const countParams = [];
    // ... (similar filters for count)
    const [countResult] = await pool.query(countQuery, countParams);
    const total = countResult[0].total;
    
    res.status(200).json({
      success: true,
      data: tasks,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Get employee's assigned tasks
// @route   GET /api/tasks/my-tasks
// @access  Employee Only
const getMyTasks = async (req, res) => {
  try {
    const [employee] = await pool.query(
      'SELECT id FROM employees WHERE user_id = ?',
      [req.userId]
    );
    
    if (employee.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found'
      });
    }
    
    const employeeId = employee[0].id;
    
    const [tasks] = await pool.query(
      `SELECT 
        t.id, t.title, t.description, t.status, t.priority,
        t.due_date, t.created_at,
        p.name as project_name
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      WHERE t.employee_id = ?
      ORDER BY t.due_date ASC`,
      [employeeId]
    );
    
    res.status(200).json({
      success: true,
      data: tasks
    });
    
  } catch (error) {
    console.error('Get my tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Admin Only
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [tasks] = await pool.query(
      `SELECT 
        t.*,
        p.name as project_name,
        CONCAT(e.first_name, ' ', e.last_name) as assigned_to
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      JOIN employees e ON t.employee_id = e.id
      WHERE t.id = ?`,
      [id]
    );
    
    if (tasks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: tasks[0]
    });
    
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Admin Only
const createTask = async (req, res) => {
  try {
    const {
      project_id,
      employee_id,
      title,
      description,
      priority = 'medium',
      due_date
    } = req.body;
    
    const [result] = await pool.query(
      `INSERT INTO tasks (project_id, employee_id, title, description, priority, due_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [project_id, employee_id, title, description, priority, due_date]
    );
    
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: {
        id: result.insertId,
        title,
        status: 'pending'
      }
    });
    
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Admin Only
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      status,
      priority,
      due_date,
      employee_id
    } = req.body;
    
    const [tasks] = await pool.query('SELECT id FROM tasks WHERE id = ?', [id]);
    
    if (tasks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    await pool.query(
      `UPDATE tasks 
       SET title = ?, description = ?, status = ?, priority = ?, 
           due_date = ?, employee_id = ?
       WHERE id = ?`,
      [title, description, status, priority, due_date, employee_id, id]
    );
    
    res.status(200).json({
      success: true,
      message: 'Task updated successfully'
    });
    
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Update task status (for employees)
// @route   PATCH /api/tasks/:id/status
// @access  Admin & Employee (own tasks only)
const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log('📝 Update Status - Task ID:', id);
    console.log('📦 New Status:', status);

    // Check if task exists
    const [tasks] = await pool.query(
      `SELECT t.*, e.user_id as assigned_user_id 
       FROM tasks t
       JOIN employees e ON t.employee_id = e.id
       WHERE t.id = ?`,
      [id]
    );

    if (tasks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const task = tasks[0];

    // Check authorization
    if (req.userRole === 'employee' && task.assigned_user_id !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this task'
      });
    }

    // Update status
    await pool.query(
      'UPDATE tasks SET status = ? WHERE id = ?',
      [status, id]
    );

    // 👇 Return the updated status in response
    res.status(200).json({
      success: true,
      message: 'Task status updated successfully',
      data: {
        id: parseInt(id),
        status: status  // 👈 Send back the status
      }
    });

  } catch (error) {
    console.error('❌ Update task status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error: ' + error.message
    });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Admin Only
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [tasks] = await pool.query('SELECT id FROM tasks WHERE id = ?', [id]);
    
    if (tasks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
    
    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getTasks,
  getMyTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask
};