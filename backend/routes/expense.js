const express = require('express');
const router = express.Router();
const { createExpense, getMyExpenses } = require('../controllers/expence');
const { protect } = require('../middleware/auth');

// All routes here are protected
router.use(protect);

router.route('/').post(createExpense);
router.route('/my').get(getMyExpenses);

module.exports = router;
