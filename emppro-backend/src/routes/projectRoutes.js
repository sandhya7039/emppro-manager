const express = require('express');
const router = express.Router();
const {
  getProjects,
  getMyProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  assignEmployees,
  removeEmployee
} = require('../controllers/projectController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// Public (authenticated) routes
router.get('/my-projects', authenticate, getMyProjects);

// Admin only routes
router.use(authenticate);
router.use(authorize(['admin']));

router.route('/')
  .get(getProjects)
  .post(createProject);

router.route('/:id')
  .get(getProjectById)
  .put(updateProject)
  .delete(deleteProject);

router.post('/:id/assign', assignEmployees);
router.delete('/:id/assign/:employeeId', removeEmployee);

module.exports = router;