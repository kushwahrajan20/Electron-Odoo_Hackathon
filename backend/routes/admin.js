const express = require('express');
const router = express.Router();
const { createUser, updateUser, createWorkflow, getAllCompanyExpenses } = require('../controllers/admin');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/role');

// All admin routes are protected and require ADMIN role
router.use(protect, isAdmin);

router.route('/users').post(createUser);
router.route('/users/:userId').put(updateUser);

router.route('/workflows').post(createWorkflow);

router.route('/expenses/all').get(getAllCompanyExpenses);

module.exports = router;
