const express = require('express');
const router = express.Router();
const { getPendingApprovals, decideOnExpense } = require('../controllers/approval');
const { protect } = require('../middleware/auth');
const { isManagerOrAdmin } = require('../middleware/role');

router.use(protect, isManagerOrAdmin);

router.get('/pending', getPendingApprovals);
router.post('/:expenseId/decide', decideOnExpense); // One route for approve/reject

module.exports = router;
