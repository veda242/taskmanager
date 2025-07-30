const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');

// Add try/catch inside controller methods for safety (not shown here for brevity)

// Protect all task routes with auth middleware
router.get('/', auth, (req, res, next) => {
  getTasks(req, res).catch(next); // Catch async errors
});

router.post('/', auth, (req, res, next) => {
  createTask(req, res).catch(next);
});

router.put('/:id', auth, (req, res, next) => {
  updateTask(req, res).catch(next);
});

router.delete('/:id', auth, (req, res, next) => {
  deleteTask(req, res).catch(next);
});

module.exports = router;
