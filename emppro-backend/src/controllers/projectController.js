const pool = require('../config/db');

// @desc    Get all projects (with filters)
// @route   GET /api/projects
// @access  Admin Only
const getProjects = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    
    let query = `
      SELECT 
        p.id, p.name, p.description, p.start_date, p.end_date,
        p.status, p.created_at,
        COUNT(DISTINCT pe.employee_id) as total_employees,
        COUNT(DISTINCT t.id) as total_tasks
      FROM projects p
      LEFT JOIN project_employees pe ON p.id = pe.project_id
      LEFT JOIN tasks t ON p.id = t.project_id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (search) {
      query += ` AND (p.name LIKE ? OR p.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (status) {
      query += ` AND p.status = ?`;
      params.push(status);
    }
    
    query += ` GROUP BY p.id`;
    
    const offset = (page - 1) * limit;
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));
    
    const [projects] = await pool.query(query, params);
    
    // Get total count
    const [countResult] = await pool.query(`SELECT COUNT(*) as total FROM projects`);
    const total = countResult[0].total;
    
    res.status(200).json({
      success: true,
      data: projects,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Get employee's assigned projects
// @route   GET /api/projects/my-projects
// @access  Employee Only
const getMyProjects = async (req, res) => {
  try {
    // Get employee_id from user_id
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
    
    const [projects] = await pool.query(
      `SELECT 
        p.id, p.name, p.description, p.start_date, p.end_date,
        p.status, pe.assigned_date
      FROM projects p
      JOIN project_employees pe ON p.id = pe.project_id
      WHERE pe.employee_id = ?
      ORDER BY p.start_date DESC`,
      [employeeId]
    );
    
    res.status(200).json({
      success: true,
      data: projects
    });
    
  } catch (error) {
    console.error('Get my projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Admin Only
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [projects] = await pool.query(
      `SELECT 
        p.*,
        COUNT(DISTINCT pe.employee_id) as total_employees,
        COUNT(DISTINCT t.id) as total_tasks
      FROM projects p
      LEFT JOIN project_employees pe ON p.id = pe.project_id
      LEFT JOIN tasks t ON p.id = t.project_id
      WHERE p.id = ?
      GROUP BY p.id`,
      [id]
    );
    
    if (projects.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Get assigned employees
    const [employees] = await pool.query(
      `SELECT 
        e.id, e.first_name, e.last_name, e.designation,
        e.department, pe.assigned_date
      FROM employees e
      JOIN project_employees pe ON e.id = pe.employee_id
      WHERE pe.project_id = ?`,
      [id]
    );
    
    const project = projects[0];
    project.employees = employees;
    
    res.status(200).json({
      success: true,
      data: project
    });
    
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Admin Only
const createProject = async (req, res) => {
  try {
    const {
      name,
      description,
      start_date,
      end_date,
      status = 'planned'
    } = req.body;
    
    const [result] = await pool.query(
      `INSERT INTO projects (name, description, start_date, end_date, status)
       VALUES (?, ?, ?, ?, ?)`,
      [name, description, start_date, end_date, status]
    );
    
    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: {
        id: result.insertId,
        name,
        status
      }
    });
    
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Admin Only
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      start_date,
      end_date,
      status
    } = req.body;
    
    // Check if project exists
    const [projects] = await pool.query(
      'SELECT id FROM projects WHERE id = ?',
      [id]
    );
    
    if (projects.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    await pool.query(
      `UPDATE projects 
       SET name = ?, description = ?, start_date = ?, end_date = ?, status = ?
       WHERE id = ?`,
      [name, description, start_date, end_date, status, id]
    );
    
    res.status(200).json({
      success: true,
      message: 'Project updated successfully'
    });
    
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Admin Only
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [projects] = await pool.query(
      'SELECT id FROM projects WHERE id = ?',
      [id]
    );
    
    if (projects.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    await pool.query('DELETE FROM projects WHERE id = ?', [id]);
    
    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Assign employees to project
// @route   POST /api/projects/:id/assign
// @access  Admin Only
const assignEmployees = async (req, res) => {
  try {
    const { id } = req.params;
    const { employee_ids } = req.body;
    
    if (!employee_ids || !Array.isArray(employee_ids) || employee_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide employee_ids array'
      });
    }
    
    // Check if project exists
    const [projects] = await pool.query(
      'SELECT id FROM projects WHERE id = ?',
      [id]
    );
    
    if (projects.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      for (const employeeId of employee_ids) {
        await connection.query(
          `INSERT INTO project_employees (project_id, employee_id, assigned_date)
           VALUES (?, ?, CURDATE())
           ON DUPLICATE KEY UPDATE assigned_date = CURDATE()`,
          [id, employeeId]
        );
      }
      
      await connection.commit();
      
      res.status(200).json({
        success: true,
        message: `${employee_ids.length} employee(s) assigned to project`
      });
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    
  } catch (error) {
    console.error('Assign employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Remove employee from project
// @route   DELETE /api/projects/:id/assign/:employeeId
// @access  Admin Only
const removeEmployee = async (req, res) => {
  try {
    const { id, employeeId } = req.params;
    
    const [result] = await pool.query(
      'DELETE FROM project_employees WHERE project_id = ? AND employee_id = ?',
      [id, employeeId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employee not assigned to this project'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Employee removed from project successfully'
    });
    
  } catch (error) {
    console.error('Remove employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getProjects,
  getMyProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  assignEmployees,
  removeEmployee
};