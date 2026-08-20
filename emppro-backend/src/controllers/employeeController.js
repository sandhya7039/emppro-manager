const pool = require('../config/db');
const bcrypt = require('bcrypt');

// @desc    Get all employees
// @route   GET /api/employees
// @access  Admin Only
const getEmployees = async (req, res) => {
  try {
    const { search, department, status, page = 1, limit = 10 } = req.query;
    
    let query = `
      SELECT 
        e.id, e.user_id, e.first_name, e.last_name, e.phone,
        e.designation, e.department, e.date_joined, e.created_at,
        u.email, u.is_active
      FROM employees e
      JOIN users u ON e.user_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (search) {
      query += ` AND (e.first_name LIKE ? OR e.last_name LIKE ? OR u.email LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (department) {
      query += ` AND e.department = ?`;
      params.push(department);
    }
    
    if (status) {
      query += ` AND u.is_active = ?`;
      params.push(status === 'active' ? 1 : 0);
    }
    
    const offset = (page - 1) * limit;
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));
    
    const [employees] = await pool.query(query, params);
    
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM employees e JOIN users u ON e.user_id = u.id WHERE 1=1`
    );
    const total = countResult[0].total;
    
    res.status(200).json({
      success: true,
      data: employees,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Get single employee by ID
// @route   GET /api/employees/:id
// @access  Admin Only
const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [employees] = await pool.query(
      `SELECT 
        e.id, e.user_id, e.first_name, e.last_name, e.phone,
        e.designation, e.department, e.date_joined, e.created_at,
        u.email, u.role, u.is_active
      FROM employees e
      JOIN users u ON e.user_id = u.id
      WHERE e.id = ?`,
      [id]
    );
    
    if (employees.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: employees[0]
    });
    
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Admin Only
const createEmployee = async (req, res) => {
  try {
    const {
      email,
      first_name,
      last_name,
      phone,
      designation,
      department,
      date_joined
    } = req.body;
    
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('Employee@123', saltRounds);
    
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      const [userResult] = await connection.query(
        `INSERT INTO users (email, password, role, is_active) VALUES (?, ?, 'employee', TRUE)`,
        [email, hashedPassword]
      );
      
      const userId = userResult.insertId;
      
      const [employeeResult] = await connection.query(
        `INSERT INTO employees 
          (user_id, first_name, last_name, phone, designation, department, date_joined)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, first_name, last_name, phone, designation, department, date_joined]
      );
      
      await connection.commit();
      
      res.status(201).json({
        success: true,
        message: 'Employee created successfully',
        data: {
          id: employeeResult.insertId,
          user_id: userId,
          email
        }
      });
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Admin Only
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      phone,
      designation,
      department,
      date_joined,
      is_active
    } = req.body;
    
    const [employees] = await pool.query(
      'SELECT e.id, e.user_id FROM employees e WHERE e.id = ?',
      [id]
    );
    
    if (employees.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    const employee = employees[0];
    
    await pool.query(
      `UPDATE employees 
       SET first_name = ?, last_name = ?, phone = ?, 
           designation = ?, department = ?, date_joined = ?
       WHERE id = ?`,
      [first_name, last_name, phone, designation, department, date_joined, id]
    );
    
    if (is_active !== undefined) {
      await pool.query(
        'UPDATE users SET is_active = ? WHERE id = ?',
        [is_active, employee.user_id]
      );
    }
    
    res.status(200).json({
      success: true,
      message: 'Employee updated successfully'
    });
    
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Delete employee (soft delete)
// @route   DELETE /api/employees/:id
// @access  Admin Only
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [employees] = await pool.query(
      'SELECT e.id, e.user_id FROM employees e WHERE e.id = ?',
      [id]
    );
    
    if (employees.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    const employee = employees[0];
    
    await pool.query(
      'UPDATE users SET is_active = FALSE WHERE id = ?',
      [employee.user_id]
    );
    
    res.status(200).json({
      success: true,
      message: 'Employee deactivated successfully'
    });
    
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
};